/**
 * Motherland Badge - Premium site badge for dhanur.me
 *
 * Minimal, fast, and sleek badge for your website.
 */

(function (window) {
  "use strict";

  // ============================================================================
  // CONFIG MODULE
  // ============================================================================

  const Config = {
    DEFAULTS: {
      mode: "long",
      theme: "auto",
      position: "bottom-right",
      size: 60,
      gap: 20,
      animate: true,
    },

    URLS: {
      base: "https://dhanur.me",
    },

    PADDING: {
      long: "0.4em",
      small: "0.4em",
    },

    merge(userConfig = {}) {
      return { ...this.DEFAULTS, ...userConfig };
    },
  };

  // ============================================================================
  // THEME MODULE
  // ============================================================================

  const Theme = {
    getSystemTheme() {
      if (window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches
          ? "dark"
          : "light";
      }
      return "light";
    },

    resolve(configTheme) {
      return configTheme === "auto" ? this.getSystemTheme() : configTheme;
    },

    getLogoVariant(theme) {
      return theme === "dark" ? "light" : "dark";
    },

    getBgColor(theme) {
      return this.getLogoVariant(theme) === "light" ? "#000" : "#fff";
    },

    getSvgUrl(theme, mode) {
      const variant = this.getLogoVariant(theme);
      const file =
        mode === "small" ? `favi-${variant}.svg` : `logo-${variant}.svg`;
      return `${Config.URLS.base}/images/${file}`;
    },
  };

  // ============================================================================
  // STYLES MODULE
  // ============================================================================

  const Styles = {
    STYLESHEET_ID: "motherland-styles",

    CSS: `
      .motherland-badge {
        position: fixed;
        z-index: 999999;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: var(--padding, 0.3em);
        cursor: pointer;
        text-decoration: none;
        border-radius: 0.35em;
        box-sizing: border-box;
        border: 1px solid rgba(255,255,255,0.15);
        background: rgba(255,255,255,0.05);
        box-shadow: 
          0 8px 32px rgba(0,0,0,0.25),
          inset 0 1px 0 rgba(255,255,255,0.12);
        backdrop-filter: saturate(200%) blur(30px);
        -webkit-backdrop-filter: saturate(200%) blur(30px);
        transition: all 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        will-change: transform, box-shadow;
      }

      .motherland-badge::before {
        content: '';
        position: absolute;
        inset: 0;
        border-radius: inherit;
        background: linear-gradient(135deg, 
          rgba(255,255,255,0.15) 0%,
          rgba(255,255,255,0.05) 50%,
          transparent 100%);
        pointer-events: none;
      }

      .motherland-badge img {
        position: relative;
        z-index: 1;
        display: block;
        width: 100%;
        height: 100%;
        object-fit: contain;
      }

      .motherland-badge:hover {
        transform: translateY(-0.1em) scale(1.02);
        box-shadow: 
          0 12px 40px rgba(0,0,0,0.35),
          inset 0 1px 0 rgba(255,255,255,0.15);
        border-color: rgba(255,255,255,0.2);
      }

      .motherland-badge:active {
        transform: translateY(0) scale(1.005);
      }

      .motherland-badge.no-animate,
      .motherland-badge.no-animate:hover {
        transition: none !important;
        transform: none !important;
      }

      @media (max-width: 640px) {
        .motherland-badge {
          transform: scale(0.85);
        }
        .motherland-badge:hover:not(.no-animate) {
          transform: scale(0.87) translateY(-0.08em);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .motherland-badge {
          transition: none !important;
        }
        .motherland-badge:hover {
          transform: none !important;
        }
      }
    `,

    inject() {
      if (document.getElementById(this.STYLESHEET_ID)) return;

      const style = document.createElement("style");
      style.id = this.STYLESHEET_ID;
      style.textContent = this.CSS;
      document.head.appendChild(style);
    },
  };

  // ============================================================================
  // ELEMENT MODULE
  // ============================================================================

  const Element = {
    create(config) {
      const el = document.createElement("a");
      el.className = `motherland-badge${config.animate ? "" : " no-animate"}`;
      el.href = Config.URLS.base;
      el.target = "_blank";
      el.rel = "noopener noreferrer";
      el.setAttribute("aria-label", "Visit dhanur.me");
      return el;
    },

    normalizeSizeValue(size) {
      return typeof size === "number" ? `${size}px` : size;
    },

    applyStyles(el, config, theme) {
      const padding = Config.PADDING[config.mode];
      if (padding) el.style.setProperty("--padding", padding);

      const sizeValue = this.normalizeSizeValue(config.size);
      const dims =
        config.mode === "small"
          ? { width: sizeValue, height: sizeValue }
          : { width: "auto", height: sizeValue };

      Object.assign(el.style, {
        ...dims,
        backgroundColor: Theme.getBgColor(theme),
      });
    },

    applyPosition(el, config) {
      const { position, gap } = config;
      const gapValue = typeof gap === "number" ? `${gap}px` : gap;

      if (typeof position === "object") {
        el.style.left = `${position.x}px`;
        el.style.top = `${position.y}px`;
      } else {
        const posMap = {
          "top-left": { top: gapValue, left: gapValue },
          "top-right": { top: gapValue, right: gapValue },
          "bottom-left": { bottom: gapValue, left: gapValue },
          "bottom-right": { bottom: gapValue, right: gapValue },
        };
        const pos = posMap[position] || posMap["bottom-right"];
        Object.entries(pos).forEach(([key, value]) => {
          el.style[key] = value;
        });
      }
    },

    createImage(theme, mode) {
      const img = document.createElement("img");
      img.src = Theme.getSvgUrl(theme, mode);
      img.alt = "Dhanur";
      img.loading = "eager";
      img.decoding = "async";
      return img;
    },
  };

  // ============================================================================
  // THEME LISTENER MODULE
  // ============================================================================

  const ThemeListener = {
    setup(el, img, config) {
      if (config.theme !== "auto" || !window.matchMedia) return;

      const query = window.matchMedia("(prefers-color-scheme: dark)");
      const update = () => {
        const newTheme = query.matches ? "dark" : "light";
        el.style.backgroundColor = Theme.getBgColor(newTheme);
        img.src = Theme.getSvgUrl(newTheme, config.mode);
      };

      if (query.addEventListener) {
        query.addEventListener("change", update);
      } else if (query.addListener) {
        query.addListener(update);
      }
    },
  };

  // ============================================================================
  // BADGE MODULE
  // ============================================================================

  const Badge = {
    create(userConfig) {
      const config = Config.merge(userConfig);
      const theme = Theme.resolve(config.theme);

      const el = Element.create(config);
      Element.applyStyles(el, config, theme);
      Element.applyPosition(el, config);

      const img = Element.createImage(theme, config.mode);
      el.appendChild(img);

      ThemeListener.setup(el, img, config);

      return el;
    },
  };

  // ============================================================================
  // DOM MODULE
  // ============================================================================

  const DOM = {
    append(el) {
      const doAppend = () => {
        if (document.body && !el.parentNode) {
          document.body.appendChild(el);
        }
      };

      if (document.body) {
        doAppend();
      } else {
        document.addEventListener("DOMContentLoaded", doAppend, { once: true });
      }
    },
  };

  // ============================================================================
  // AUTO-INIT MODULE
  // ============================================================================

  const AutoInit = {
    getScriptTag() {
      const scripts = document.currentScript || document.scripts;
      if (scripts && scripts.length > 0) {
        return scripts[scripts.length - 1];
      }
      return null;
    },

    parseDataAttributes(script) {
      if (!script) return {};

      const config = {};
      const attrs = script.dataset;

      // Parse data attributes
      if (attrs.mode) config.mode = attrs.mode;
      if (attrs.theme) config.theme = attrs.theme;
      if (attrs.position) config.position = attrs.position;
      if (attrs.size) {
        const size = attrs.size;
        config.size = isNaN(size) ? size : parseInt(size);
      }
      if (attrs.gap) {
        const gap = attrs.gap;
        config.gap = isNaN(gap) ? gap : parseInt(gap);
      }
      if (attrs.animate) config.animate = attrs.animate !== "false";

      return config;
    },

    autoInit() {
      const script = this.getScriptTag();
      const config = this.parseDataAttributes(script);

      // Only auto-init if there are data attributes
      if (Object.keys(config).length > 0) {
        window.Motherland.init(config);
      }
    },
  };

  // ============================================================================
  // PUBLIC API
  // ============================================================================

  let badgeInstance = null;

  window.Motherland = {
    init(config) {
      if (badgeInstance) {
        console.warn("Motherland badge already initialized");
        return { destroy: () => badgeInstance.remove() };
      }

      Styles.inject();
      const badge = Badge.create(config);
      badgeInstance = badge;

      DOM.append(badge);

      return {
        destroy: () => {
          badge.remove();
          badgeInstance = null;
        },
      };
    },
  };

  // Auto-initialize if data attributes are present
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => AutoInit.autoInit());
  } else {
    AutoInit.autoInit();
  }
})(window);
