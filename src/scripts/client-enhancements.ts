import { layout, prepare, prepareWithSegments, layoutWithLines } from '@chenglou/pretext';
import { WebHaptics } from 'web-haptics';

declare global {
  interface Window {
    __t3rmEnhancementsPageLoadBound__?: boolean;
    __t3rmEnhancementsAbort__?: AbortController;
    __t3rmHaptics__?: WebHaptics | null;
  }
}

const VERY_WIDE_LINE = 100000;
const pretextWidthCache = new Map<string, number>();
const pretextHeightCache = new Map<string, ReturnType<typeof prepare>>();

function isTouchHapticsContext() {
  const hasTouchPoints = typeof navigator.maxTouchPoints === 'number' && navigator.maxTouchPoints > 0;
  const coarsePointer =
    window.matchMedia('(pointer: coarse)').matches || window.matchMedia('(any-pointer: coarse)').matches;

  return hasTouchPoints || coarsePointer;
}

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
  const groupedElements = new Map<string, HTMLElement[]>();
  const groupedMaxWidth = new Map<string, number>();

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

    const group = element.dataset.pretextGroup?.trim();
    if (group) {
      const list = groupedElements.get(group) ?? [];
      list.push(element);
      groupedElements.set(group, list);

      const currentMax = groupedMaxWidth.get(group) ?? 0;
      if (width > currentMax) {
        groupedMaxWidth.set(group, width);
      }
    }
  });

  groupedElements.forEach((elements, group) => {
    const maxWidth = groupedMaxWidth.get(group);
    if (!maxWidth) {
      return;
    }

    elements.forEach((element) => {
      element.style.setProperty('--pretext-inline-size', `${maxWidth}px`);
    });
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

  document.querySelectorAll<HTMLElement>('[data-pretext-ascii]').forEach((element) => {
    const sample = (element.dataset.pretextSample ?? 'MMMMMMMMMM').trim();
    if (!sample) {
      return;
    }

    const style = getComputedStyle(element);
    const font = getFontShorthand(style);
    const charWidth = measureNaturalWidth(sample, font) / sample.length;
    const lineHeight = Number.parseFloat(style.lineHeight) || Number.parseFloat(style.fontSize) * 1.2;

    if (!Number.isFinite(charWidth) || !Number.isFinite(lineHeight)) {
      return;
    }

    element.style.setProperty('--ascii-char-width', `${Math.max(4, charWidth)}px`);
    element.style.setProperty('--ascii-line-height', `${Math.max(8, lineHeight)}px`);
  });
}

function queuePretextMetrics() {
  window.requestAnimationFrame(() => {
    lockPretextMetrics();
  });
}

function getHaptics() {
  if (!isTouchHapticsContext()) {
    return null;
  }

  if (!window.__t3rmHaptics__) {
    try {
      window.__t3rmHaptics__ = new WebHaptics({
        debug: false,
      });
    } catch {
      window.__t3rmHaptics__ = null;
    }
  }

  return window.__t3rmHaptics__;
}

function initHaptics(signal: AbortSignal) {
  if (!isTouchHapticsContext()) {
    return;
  }

  const hapticSelector = [
    '[data-haptic]',
    'button',
    '[role="button"]',
    'input[type="button"]',
    'input[type="submit"]',
    'input[type="reset"]',
  ].join(', ');

  const resolveHapticPattern = (rawPreset: string) => {
    const preset = (rawPreset || 'selection').trim().toLowerCase();

    switch (preset) {
      case 'selection':
        return {
          input: 'nudge',
          fallback: 14,
        };
      case 'light':
        return {
          input: 20,
          fallback: 10,
        };
      case 'medium':
        return {
          input: 'success',
          fallback: [18, 24, 18],
        };
      case 'heavy':
      case 'rigid':
        return {
          input: 'error',
          fallback: [30, 35, 30],
        };
      case 'soft':
        return {
          input: [{ duration: 24, intensity: 0.35 }],
          fallback: 10,
        };
      case 'buzz':
        return {
          input: 'buzz',
          fallback: 75,
        };
      case 'success':
      case 'nudge':
      case 'error':
        return {
          input: preset,
          fallback: preset === 'error' ? [28, 32, 28] : [18, 24, 18],
        };
      default:
        return {
          input: preset,
          fallback: 14,
        };
    }
  };

  const fallbackVibrateFromPattern = (pattern: number | number[]) => {
    if (!('vibrate' in navigator)) {
      return;
    }

    navigator.vibrate(pattern);
  };

  const triggerHaptic = (target: HTMLElement) => {
    const explicitPreset =
      target.dataset.haptic || target.closest<HTMLElement>('[data-haptic]')?.dataset.haptic || 'selection';

    let preset = explicitPreset;
    const anchor = target.closest<HTMLAnchorElement>('a[href]');
    if (anchor) {
      try {
        const url = new URL(anchor.href, window.location.href);
        const isHttp = url.protocol === 'http:' || url.protocol === 'https:';
        const isExternal = isHttp ? url.origin !== window.location.origin : true;
        if (isExternal) {
          preset = 'heavy';
        }
      } catch {
      }
    }

    const pattern = resolveHapticPattern(preset);
    const haptics = getHaptics();

    if (!haptics) {
      fallbackVibrateFromPattern(pattern.fallback);
      return;
    }

    void haptics
      .trigger(pattern.input)
      .catch(() => {
        fallbackVibrateFromPattern(pattern.fallback);
      });
  };

  let lastHapticAt = 0;

  const onHapticInput = (target: EventTarget | null) => {
    if (!(target instanceof Element)) {
      return;
    }

    const hapticTarget = target.closest<HTMLElement>(hapticSelector);
    if (!hapticTarget) {
      return;
    }

    const now = Date.now();
    if (now - lastHapticAt < 80) {
      return;
    }
    lastHapticAt = now;

    triggerHaptic(hapticTarget);
  };

  document.addEventListener(
    'pointerdown',
    (event) => {
      onHapticInput(event.target);
    },
    { capture: true, passive: true, signal }
  );

  document.addEventListener(
    'touchstart',
    (event) => {
      onHapticInput(event.target);
    },
    { capture: true, passive: true, signal }
  );

  document.addEventListener(
    'click',
    (event) => {
      onHapticInput(event.target);
    },
    { capture: true, passive: true, signal }
  );
}

function initPretext(signal: AbortSignal) {
  queuePretextMetrics();

  if (document.fonts?.ready) {
    void document.fonts.ready.then(queuePretextMetrics);
  }

  document.fonts?.addEventListener?.('loadingdone', queuePretextMetrics, { signal });

  const observer = new MutationObserver(queuePretextMetrics);
  observer.observe(document.body, {
    attributes: true,
    subtree: true,
    attributeFilter: ['class'],
  });
  signal.addEventListener(
    'abort',
    () => {
      observer.disconnect();
    },
    { once: true }
  );

  window.addEventListener('resize', queuePretextMetrics, { passive: true, signal });
}

function initScrollState(signal: AbortSignal) {
  let scrollTimer: number | undefined;

  const markScrolling = () => {
    document.body.classList.add('is-scrolling');

    if (scrollTimer) {
      clearTimeout(scrollTimer);
    }

    scrollTimer = window.setTimeout(() => {
      document.body.classList.remove('is-scrolling');
    }, 140);
  };

  window.addEventListener('scroll', markScrolling, { passive: true, signal });
  window.addEventListener('wheel', markScrolling, { passive: true, signal });
  window.addEventListener('touchmove', markScrolling, { passive: true, signal });
}

function setupEnhancementsForPage() {
  window.__t3rmEnhancementsAbort__?.abort();

  const controller = new AbortController();
  window.__t3rmEnhancementsAbort__ = controller;

  initPretext(controller.signal);
  initHaptics(controller.signal);
  initScrollState(controller.signal);
}

if (!window.__t3rmEnhancementsPageLoadBound__) {
  window.__t3rmEnhancementsPageLoadBound__ = true;
  document.addEventListener('astro:page-load', setupEnhancementsForPage);
}

setupEnhancementsForPage();
