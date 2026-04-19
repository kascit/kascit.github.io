// Critical prepaint bootstrap that must execute synchronously in <head>.
// Reads template values through data-* attributes on its script tag.
(function () {
  var script = document.currentScript;
  var cookieDomain = (script && script.getAttribute("data-cookie-domain")) || "";
  var defaultColorset = (script && script.getAttribute("data-default-colorset")) || "dark";
  var enableWebMcpCompat = ((script && script.getAttribute("data-webmcp-compat")) || "1") !== "0";
  var SIDEBAR_KEY = "sidebar-collapsed";
  var TOC_KEY = "toc-collapsed";

  function normalizeThemeMode(value, fallback) {
    var normalized = String(value || "").trim().toLowerCase();
    if (normalized === "auto" || normalized === "light" || normalized === "dark") return normalized;
    if (normalized.indexOf("dark") >= 0) return "dark";
    if (normalized.indexOf("light") >= 0) return "light";
    return fallback || "auto";
  }

  document.documentElement.setAttribute("data-ui-init", "0");

  function getStorageFlag(key) {
    try {
      return window.localStorage.getItem(key) === "1";
    } catch (_error) {
      return false;
    }
  }

  window.__getThemeCookie = function () {
    var m = document.cookie.match(/(?:^|; )theme=([^;]*)/);
    if (!m) return null;
    try {
      return decodeURIComponent(m[1]);
    } catch (_error) {
      return m[1];
    }
  };

  window.__setThemeCookie = function (val) {
    var h = window.location.hostname;
    var isLocalHost = h === "localhost" || h === "127.0.0.1";
    var domainPart = isLocalHost || !cookieDomain ? "" : "; domain=." + cookieDomain;
    var securePart = window.location.protocol === "https:" ? "; Secure" : "";
    document.cookie = "theme=" + encodeURIComponent(val) + "; path=/" + domainPart + "; max-age=31536000; SameSite=Lax" + securePart;
  };

  window.__resolveColorset = function (val) {
    var mode = normalizeThemeMode(val, normalizeThemeMode(defaultColorset, "auto"));
    if (mode === "auto") {
      return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
    }
    return mode;
  };

  function ensureWebMcpCompat() {
    var webmcpStore = window.__webmcpCompatStore || { tools: {} };
    if (!webmcpStore.tools || typeof webmcpStore.tools !== "object") {
      webmcpStore.tools = {};
    }
    window.__webmcpCompatStore = webmcpStore;

    function toToolRecord(tool) {
      return {
        name: tool.name,
        description: tool.description,
        inputSchema: JSON.stringify(tool.inputSchema || {}),
        annotations: tool.annotations || { readOnlyHint: false }
      };
    }

    function defineNavigatorApi(name, value) {
      var proto = Object.getPrototypeOf(navigator);
      try {
        if (proto && !Object.getOwnPropertyDescriptor(proto, name)) {
          Object.defineProperty(proto, name, {
            configurable: true,
            enumerable: false,
            get: function () { return value; }
          });
        }
      } catch (_error) {}

      try {
        if (!Object.prototype.hasOwnProperty.call(navigator, name)) {
          Object.defineProperty(navigator, name, {
            configurable: true,
            enumerable: false,
            get: function () { return value; }
          });
        }
      } catch (_error2) {
        try { navigator[name] = value; } catch (_error3) {}
      }
    }

    var compatModelContext = navigator.modelContext;
    if (!compatModelContext || typeof compatModelContext.registerTool !== "function") {
      compatModelContext = {
        registerTool: function (tool, options) {
          if (!tool || typeof tool !== "object") {
            throw new Error("Tool definition is required");
          }

          var name = String(tool.name || "").trim();
          var description = String(tool.description || "").trim();
          if (!name || !description || typeof tool.execute !== "function") {
            throw new Error("Tool name, description, and execute callback are required");
          }

          webmcpStore.tools[name] = {
            name: name,
            description: description,
            inputSchema: tool.inputSchema || {},
            execute: tool.execute,
            annotations: tool.annotations || { readOnlyHint: false }
          };

          if (options && options.signal && typeof options.signal.addEventListener === "function") {
            if (options.signal.aborted) {
              delete webmcpStore.tools[name];
              return;
            }
            options.signal.addEventListener("abort", function () {
              delete webmcpStore.tools[name];
            }, { once: true });
          }
        }
      };

      defineNavigatorApi("modelContext", compatModelContext);
    }

    if (!navigator.modelContextTesting) {
      defineNavigatorApi("modelContextTesting", {
        listTools: function () {
          var names = Object.keys(webmcpStore.tools);
          return Promise.resolve(names.map(function (name) {
            return toToolRecord(webmcpStore.tools[name]);
          }));
        },
        executeTool: function (toolName, input) {
          var name = String(toolName || "").trim();
          var tool = webmcpStore.tools[name];
          if (!tool || typeof tool.execute !== "function") {
            return Promise.reject(new Error("Tool not found: " + name));
          }
          return Promise.resolve(tool.execute(input || {}, {
            requestUserInteraction: function (callback) {
              if (typeof callback !== "function") return Promise.resolve(undefined);
              return Promise.resolve(callback());
            }
          }));
        }
      });
    }
  }

  if (enableWebMcpCompat) {
    ensureWebMcpCompat();
  }

  var defaultMode = normalizeThemeMode(defaultColorset, "auto");
  var rawMode = normalizeThemeMode(window.__getThemeCookie(), defaultMode);
  var colorset = window.__resolveColorset(rawMode);
  var themeMap = { dark: "dark", light: "light" };
  var themeName = themeMap[colorset] || colorset;
  var prepaintBgMap = { dark: "#010409", light: "#f6f8fa" };
  var prepaintBg = prepaintBgMap[colorset] || prepaintBgMap.dark;

  document.documentElement.setAttribute("data-theme", themeName);
  document.documentElement.style.backgroundColor = prepaintBg;

  if (colorset === "dark") {
    document.documentElement.classList.add("dark");
    document.documentElement.classList.remove("light");
    document.documentElement.style.colorScheme = "dark";
  } else {
    document.documentElement.classList.add("light");
    document.documentElement.classList.remove("dark");
    document.documentElement.style.colorScheme = "light";
  }

  document.documentElement.setAttribute(
    "data-sidebar-collapsed",
    getStorageFlag(SIDEBAR_KEY) ? "1" : "0"
  );

  var tocCollapsed = getStorageFlag(TOC_KEY);
  document.documentElement.setAttribute(
    "data-toc-collapsed",
    tocCollapsed ? "1" : "0"
  );

  if (tocCollapsed) {
    document.addEventListener("DOMContentLoaded", function () {
      if (document.body) {
        document.body.classList.add("toc-collapsed");
      }
    }, { once: true });
  }
})();
