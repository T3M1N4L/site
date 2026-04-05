import { layout, prepare, prepareWithSegments, layoutWithLines } from '@chenglou/pretext';
import { WebHaptics } from 'web-haptics';

declare global {
  interface Window {
    __t3rmEnhancementsInit__?: boolean;
    __t3rmHaptics__?: WebHaptics | null;
  }
}

const VERY_WIDE_LINE = 100000;
const pretextWidthCache = new Map<string, number>();
const pretextHeightCache = new Map<string, ReturnType<typeof prepare>>();

function getFontShorthand(style: CSSStyleDeclaration) {
  if (style.font && style.font.trim().length > 0) {
    return style.font;
  }

  return `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`;
}

function measureNaturalWidth(text: string, font: string) {
  const cacheKey = `${font}::${text}`;
  const cached = pretextWidthCache.get(cacheKey);
  if (cached !== undefined) {
    return cached;
  }

  const prepared = prepareWithSegments(text, font);
  const measured = layoutWithLines(prepared, VERY_WIDE_LINE, 1).lines[0]?.width ?? 0;
  pretextWidthCache.set(cacheKey, measured);
  return measured;
}

function measureWrappedHeight(text: string, font: string, width: number, lineHeight: number) {
  const cacheKey = `${font}::${text}`;
  let prepared = pretextHeightCache.get(cacheKey);
  if (!prepared) {
    prepared = prepare(text, font);
    pretextHeightCache.set(cacheKey, prepared);
  }

  return layout(prepared, width, lineHeight).height;
}

function lockPretextMetrics() {
  document.querySelectorAll<HTMLElement>('[data-pretext-fit]').forEach((element) => {
    const sample = element.dataset.pretextSample ?? element.textContent ?? '';
    const text = sample.replace(/\s+/g, ' ').trim();
    if (!text) {
      return;
    }

    const style = getComputedStyle(element);
    const chrome =
      Number.parseFloat(style.paddingLeft) +
      Number.parseFloat(style.paddingRight) +
      Number.parseFloat(style.borderLeftWidth) +
      Number.parseFloat(style.borderRightWidth);

    const width = Math.ceil(measureNaturalWidth(text, getFontShorthand(style)) + chrome + 1);
    element.style.setProperty('--pretext-inline-size', `${width}px`);
  });

  document.querySelectorAll<HTMLElement>('[data-pretext-height]').forEach((element) => {
    const text = (element.dataset.pretextSample ?? element.textContent ?? '').replace(/\s+/g, ' ').trim();
    if (!text) {
      return;
    }

    const style = getComputedStyle(element);
    const contentWidth =
      element.clientWidth -
      Number.parseFloat(style.paddingLeft) -
      Number.parseFloat(style.paddingRight);

    if (contentWidth <= 0) {
      return;
    }

    const lineHeight = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.2;
    if (!Number.isFinite(lineHeight)) {
      return;
    }

    const height = Math.ceil(measureWrappedHeight(text, getFontShorthand(style), contentWidth, lineHeight));
    element.style.setProperty('--pretext-block-size', `${height}px`);
  });
}

function queuePretextMetrics() {
  window.requestAnimationFrame(() => {
    lockPretextMetrics();
  });
}

function getHaptics() {
  if (!WebHaptics.isSupported || !window.matchMedia('(pointer: coarse)').matches) {
    return null;
  }

  if (!window.__t3rmHaptics__) {
    window.__t3rmHaptics__ = new WebHaptics();
  }

  return window.__t3rmHaptics__;
}

function initHaptics() {
  document.addEventListener(
    'pointerdown',
    (event) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLElement>('[data-haptic]') : null;
      if (!target) {
        return;
      }

      if (event.pointerType && event.pointerType !== 'touch') {
        return;
      }

      const preset = target.dataset.haptic || 'selection';
      const haptics = getHaptics();
      if (!haptics) {
        return;
      }

      void haptics.trigger(preset);
    },
    { capture: true, passive: true }
  );

  window.addEventListener('pagehide', () => {
    window.__t3rmHaptics__?.destroy();
    window.__t3rmHaptics__ = null;
  });
}

function initPretext() {
  queuePretextMetrics();

  if (document.fonts?.ready) {
    void document.fonts.ready.then(queuePretextMetrics);
  }

  document.fonts?.addEventListener?.('loadingdone', queuePretextMetrics);

  const observer = new MutationObserver(queuePretextMetrics);
  observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ['class'],
  });

  window.addEventListener('resize', queuePretextMetrics, { passive: true });
  document.addEventListener('astro:page-load', queuePretextMetrics);
}

function initScrollState() {
  let scrollTimer: ReturnType<typeof setTimeout> | undefined;

  const markScrolling = () => {
    document.body.classList.add('is-scrolling');

    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }

    scrollTimer = window.setTimeout(() => {
      document.body.classList.remove('is-scrolling');
    }, 140);
  };

  window.addEventListener('scroll', markScrolling, { passive: true });
  window.addEventListener('wheel', markScrolling, { passive: true });
  window.addEventListener('touchmove', markScrolling, { passive: true });
}

if (!window.__t3rmEnhancementsInit__) {
  window.__t3rmEnhancementsInit__ = true;
  initPretext();
  initHaptics();
  initScrollState();
}
