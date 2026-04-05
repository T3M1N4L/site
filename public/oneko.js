var _eventHandlers = {};

const addListener = (node, event, handler, capture = false) => {
  if (!(event in _eventHandlers)) {
    _eventHandlers[event] = [];
  }

  _eventHandlers[event].push({
    node: node,
    handler: handler,
    capture: capture,
  });
  node.addEventListener(event, handler, capture);
};

const removeAllListeners = (targetNode, event) => {
  if (_eventHandlers[event]) {
    _eventHandlers[event]
      .filter(({ node }) => node === targetNode)
      .forEach(({ node, handler, capture }) =>
        node.removeEventListener(event, handler, capture)
      );

    _eventHandlers[event] = _eventHandlers[event].filter(
      ({ node }) => node !== targetNode
    );
  }
};

const mobileRE =
  /(android|bb\d+|meego).+mobile|armv7l|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series[46]0|samsungbrowser.*mobile|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;
const notMobileRE = /CrOS/;

const tabletRE = /android|ipad|playbook|silk/i;

function isMobile(opts) {
  if (!opts) opts = {};
  let ua = opts.ua;
  if (!ua && typeof navigator !== "undefined") ua = navigator.userAgent;
  if (ua && ua.headers && typeof ua.headers["user-agent"] === "string") {
    ua = ua.headers["user-agent"];
  }
  if (typeof ua !== "string") return false;

  let result =
    (mobileRE.test(ua) && !notMobileRE.test(ua)) ||
    (!!opts.tablet && tabletRE.test(ua));

  if (
    !result &&
    opts.tablet &&
    opts.featureDetect &&
    navigator &&
    navigator.maxTouchPoints > 1 &&
    ua.indexOf("Macintosh") !== -1 &&
    ua.indexOf("Safari") !== -1
  ) {
    result = true;
  }

  return result;
}

(function oneko() {
  if (isMobile({ tablet: true })) {
    return;
  }

  const isReducedMotion =
    window.matchMedia("(prefers-reduced-motion: reduce)") === true ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches === true;

  if (isReducedMotion) return;

  if (window.__onekoController) {
    window.__onekoController.reconnect();
    return;
  }

  const nekoRem = 2.75;
  let persistPosition = true;
  let nekoFile = "/img/oneko.gif";

  function convertRemToPixels(rem) {
    return rem * parseFloat(getComputedStyle(document.documentElement).fontSize);
  }

  function defaultState() {
    const i = convertRemToPixels(3.5);
    const j = convertRemToPixels(2);

    return {
      nekoPosX: i + j,
      nekoPosY: i + 32,
      mousePosX: i + j,
      mousePosY: i + 32,
      frameCount: 0,
      idleTime: 0,
      idleAnimation: null,
      idleAnimationFrame: 0,
      bgPos: "",
    };
  }

  const state = defaultState();

  let nekoEl = null;
  let lastFrameTimestamp = 0;

  const nekoSpeed = (16 * nekoRem) / 3;
  const spriteSets = {
    idle: [[-3, -3]],
    alert: [[-7, -3]],
    scratchSelf: [
      [-5, 0],
      [-6, 0],
      [-7, 0],
    ],
    scratchWallN: [
      [0, 0],
      [0, -1],
    ],
    scratchWallS: [
      [-7, -1],
      [-6, -2],
    ],
    scratchWallE: [
      [-2, -2],
      [-2, -3],
    ],
    scratchWallW: [
      [-4, 0],
      [-4, -1],
    ],
    tired: [[-3, -2]],
    sleeping: [
      [-2, 0],
      [-2, -1],
    ],
    N: [
      [-1, -2],
      [-1, -3],
    ],
    NE: [
      [0, -2],
      [0, -3],
    ],
    E: [
      [-3, 0],
      [-3, -1],
    ],
    SE: [
      [-5, -1],
      [-5, -2],
    ],
    S: [
      [-6, -3],
      [-7, -2],
    ],
    SW: [
      [-5, -3],
      [-6, -1],
    ],
    W: [
      [-4, -2],
      [-4, -3],
    ],
    NW: [
      [-1, 0],
      [-1, -1],
    ],
  };

  function readScriptConfig() {
    const script =
      document.currentScript ||
      document.querySelector('script[src="/oneko.js"]');

    if (!script) return;

    if (script.dataset.cat) {
      nekoFile = script.dataset.cat;
    }

    if (script.dataset.persistPosition) {
      if (script.dataset.persistPosition === "") {
        persistPosition = true;
      } else {
        persistPosition = JSON.parse(
          script.dataset.persistPosition.toLowerCase()
        );
      }
    }
  }

  function loadPersistedState() {
    if (!persistPosition) return;

    try {
      const storedNeko = JSON.parse(window.localStorage.getItem("oneko"));
      if (!storedNeko) return;

      state.nekoPosX = storedNeko.nekoPosX ?? state.nekoPosX;
      state.nekoPosY = storedNeko.nekoPosY ?? state.nekoPosY;
      state.mousePosX = storedNeko.mousePosX ?? state.mousePosX;
      state.mousePosY = storedNeko.mousePosY ?? state.mousePosY;
      state.frameCount = storedNeko.frameCount ?? state.frameCount;
      state.idleTime = storedNeko.idleTime ?? state.idleTime;
      state.idleAnimation = storedNeko.idleAnimation ?? state.idleAnimation;
      state.idleAnimationFrame =
        storedNeko.idleAnimationFrame ?? state.idleAnimationFrame;
      state.bgPos = storedNeko.bgPos ?? state.bgPos;
    } catch (_) {
      // Ignore malformed localStorage data and fall back to defaults.
    }
  }

  function persistState() {
    if (!persistPosition) return;

    if (nekoEl) {
      state.bgPos = nekoEl.style.backgroundPosition;
    }

    window.localStorage.setItem(
      "oneko",
      JSON.stringify({
        nekoPosX: state.nekoPosX,
        nekoPosY: state.nekoPosY,
        mousePosX: state.mousePosX,
        mousePosY: state.mousePosY,
        frameCount: state.frameCount,
        idleTime: state.idleTime,
        idleAnimation: state.idleAnimation,
        idleAnimationFrame: state.idleAnimationFrame,
        bgPos: state.bgPos,
      })
    );
  }

  function createNekoElement() {
    const element = document.createElement("div");
    element.id = "oneko";
    element.ariaHidden = true;
    element.style.width = `${nekoRem}rem`;
    element.style.height = `${nekoRem}rem`;
    element.style.backgroundSize = `${convertRemToPixels(nekoRem) * 8}px ${
      convertRemToPixels(nekoRem) * 4
    }px`;
    element.style.position = "fixed";
    element.style.pointerEvents = "none";
    element.style.imageRendering = "pixelated";
    element.style.zIndex = 2147483647;
    element.style.backgroundImage = `url(${nekoFile})`;
    element.style.backgroundRepeat = "no-repeat";
    element.style.willChange = "left, top, background-position";
    return element;
  }

  function applyPosition() {
    if (!nekoEl) return;
    nekoEl.style.left = `${state.nekoPosX - 16}px`;
    nekoEl.style.top = `${state.nekoPosY - 16}px`;
  }

  function ensureNekoElement() {
    if (nekoEl && nekoEl.isConnected) {
      return nekoEl;
    }

    const existing = document.getElementById("oneko");
    nekoEl = existing || createNekoElement();
    nekoEl.style.backgroundImage = `url(${nekoFile})`;

    applyPosition();

    if (state.bgPos) {
      nekoEl.style.backgroundPosition = state.bgPos;
    }

    if (!nekoEl.isConnected && document.body) {
      document.body.appendChild(nekoEl);
    }

    return nekoEl;
  }

  function setSprite(name, frame) {
    const sprite = spriteSets[name][frame % spriteSets[name].length];
    const backgroundPosition = `${
      sprite[0] * convertRemToPixels(nekoRem)
    }px ${sprite[1] * convertRemToPixels(nekoRem)}px`;

    state.bgPos = backgroundPosition;
    if (nekoEl) {
      nekoEl.style.backgroundPosition = backgroundPosition;
    }
  }

  function resetIdleAnimation() {
    state.idleAnimation = null;
    state.idleAnimationFrame = 0;
  }

  function idle() {
    state.idleTime += 1;

    if (
      state.idleTime > 6 &&
      Math.floor(Math.random() * 200) === 0 &&
      state.idleAnimation == null
    ) {
      let avalibleIdleAnimations = ["sleeping", "scratchSelf"];
      if (state.nekoPosX < 16 * nekoRem - 20) {
        avalibleIdleAnimations.push("scratchWallW");
      }
      if (state.nekoPosY < 16 * nekoRem - 20) {
        avalibleIdleAnimations.push("scratchWallN");
      }
      if (state.nekoPosX > window.innerWidth - (16 * nekoRem - 20)) {
        avalibleIdleAnimations.push("scratchWallE");
      }
      if (state.nekoPosY > window.innerHeight - (16 * nekoRem - 20)) {
        avalibleIdleAnimations.push("scratchWallS");
      }
      state.idleAnimation =
        avalibleIdleAnimations[
          Math.floor(Math.random() * avalibleIdleAnimations.length)
        ];
    }

    switch (state.idleAnimation) {
      case "sleeping":
        if (state.idleAnimationFrame < 8) {
          setSprite("tired", 0);
          break;
        }
        setSprite("sleeping", Math.floor(state.idleAnimationFrame / 4));
        removeAllListeners(nekoEl, "click");
        addListener(nekoEl, "click", () => {
          resetIdleAnimation();
        });
        if (state.idleAnimationFrame > 192) {
          resetIdleAnimation();
        }
        break;
      case "scratchWallN":
      case "scratchWallS":
      case "scratchWallE":
      case "scratchWallW":
      case "scratchSelf":
        setSprite(state.idleAnimation, state.idleAnimationFrame);
        if (state.idleAnimationFrame > 9) {
          resetIdleAnimation();
        }
        break;
      default:
        setSprite("idle", 0);
        return;
    }
    state.idleAnimationFrame += 1;
  }

  function frame() {
    state.frameCount += 1;
    const diffX = state.nekoPosX - state.mousePosX;
    const diffY = state.nekoPosY - state.mousePosY;
    const distance = Math.sqrt(diffX ** 2 + diffY ** 2);

    if (distance < nekoSpeed || distance < 48) {
      idle();
      return;
    }

    state.idleAnimation = null;
    state.idleAnimationFrame = 0;

    if (state.idleTime > 1) {
      setSprite("alert", 0);

      state.idleTime = Math.min(state.idleTime, 3.5);
      state.idleTime -= 1;
      return;
    }

    let direction = diffY / distance > 0.5 ? "N" : "";
    direction += diffY / distance < -0.5 ? "S" : "";
    direction += diffX / distance > 0.5 ? "W" : "";
    direction += diffX / distance < -0.5 ? "E" : "";
    setSprite(direction, state.frameCount);

    state.nekoPosX -= (diffX / distance) * nekoSpeed;
    state.nekoPosY -= (diffY / distance) * nekoSpeed;

    state.nekoPosX = Math.min(Math.max(16, state.nekoPosX), window.innerWidth - 16);
    state.nekoPosY = Math.min(Math.max(16, state.nekoPosY), window.innerHeight - 16);

    applyPosition();
  }

  function onAnimationFrame(timestamp) {
    ensureNekoElement();

    if (!lastFrameTimestamp) {
      lastFrameTimestamp = timestamp;
    }

    if (timestamp - lastFrameTimestamp > 100) {
      lastFrameTimestamp = timestamp;
      frame();
    }

    window.requestAnimationFrame(onAnimationFrame);
  }

  function handleMouseMove(event) {
    state.mousePosX = event.clientX;
    state.mousePosY = event.clientY;
  }

  function reconnect() {
    readScriptConfig();
    ensureNekoElement();
    applyPosition();
  }

  readScriptConfig();
  loadPersistedState();
  reconnect();

  document.addEventListener("mousemove", handleMouseMove, { passive: true });
  document.addEventListener("astro:before-swap", persistState);
  document.addEventListener("astro:after-swap", reconnect);
  document.addEventListener("astro:page-load", reconnect);
  window.addEventListener("beforeunload", persistState);
  window.addEventListener("pagehide", persistState);
  window.requestAnimationFrame(onAnimationFrame);

  window.__onekoController = {
    reconnect,
  };
})();
