/**
 * WebMCP Runtime Bridge
 *
 * Exposes imperative tools through the WebMCP shape used by inspectors:
 * - navigator.modelContext.registerTool(...)
 * - navigator.modelContextTesting.listTools()/executeTool(...)
 *
 * Access patterns:
 * - Direct API: window.WebMCP.call("theme.set", { mode: "dark" })
 * - postMessage API:
 *   { protocol: "dhanur.webmcp.v1", type: "webmcp.call", id, tool, args }
 */

import { cycleThemeMode, getResolvedTheme, getThemeMode, setThemeMode } from "../core/theme-engine.js";
import { askAiAboutQuery, buildAskAiContext, getAskAiConfig, getStoredAskAiContext, isAskAiEnabled } from "./ask-ai.js";

const PROTOCOL = "dhanur.webmcp.v1";
const VERSION = "1.2.0";

let _initialized = false;
let _runtime = "main";
let _allowedOrigins = new Set([window.location.origin]);
let _toolsRegistered = false;

const _compatStore = (() => {
  if (window.__webmcpCompatStore && typeof window.__webmcpCompatStore === "object") {
    if (!window.__webmcpCompatStore.tools || typeof window.__webmcpCompatStore.tools !== "object") {
      window.__webmcpCompatStore.tools = {};
    }
    return window.__webmcpCompatStore;
  }

  const store = { tools: {} };
  window.__webmcpCompatStore = store;
  return store;
})();

const _registeredTools = new Map(Object.entries(_compatStore.tools || {}));

function syncCompatStore() {
  const next = {};
  _registeredTools.forEach((tool, name) => {
    next[name] = tool;
  });
  _compatStore.tools = next;
}

function makeInvalidStateError(message) {
  try {
    return new DOMException(message, "InvalidStateError");
  } catch (_error) {
    const err = new Error(message);
    err.name = "InvalidStateError";
    return err;
  }
}

function createModelContextClient() {
  return {
    async requestUserInteraction(callback) {
      if (typeof callback !== "function") return undefined;
      return callback();
    },
  };
}

function toToolDiscoveryRecord(tool) {
  return {
    name: tool.name,
    description: tool.description,
    inputSchema: JSON.stringify(tool.inputSchema || {}),
    annotations: tool.annotations || { readOnlyHint: false },
  };
}

function createModelContextCompat() {
  return {
    registerTool(tool, options = {}) {
      if (!tool || typeof tool !== "object") {
        throw makeInvalidStateError("Tool definition is required");
      }

      const name = String(tool.name || "").trim();
      const description = String(tool.description || "").trim();
      const execute = tool.execute;

      if (!name || !description || typeof execute !== "function") {
        throw makeInvalidStateError("Tool name, description, and execute callback are required");
      }

      if (_registeredTools.has(name)) {
        throw makeInvalidStateError(`Tool already registered: ${name}`);
      }

      const inputSchema = Object.prototype.hasOwnProperty.call(tool, "inputSchema")
        ? tool.inputSchema
        : {};

      const registered = {
        name,
        description,
        inputSchema,
        execute,
        annotations: tool.annotations || { readOnlyHint: false },
      };

      _registeredTools.set(name, registered);
      syncCompatStore();

      const signal = options && options.signal;
      if (signal && typeof signal.addEventListener === "function") {
        if (signal.aborted) {
          _registeredTools.delete(name);
          syncCompatStore();
          return;
        }
        signal.addEventListener("abort", () => {
          _registeredTools.delete(name);
          syncCompatStore();
        }, { once: true });
      }
    },

    // Non-standard helpers for debugging and parity with inspector tooling.
    async listTools() {
      return Array.from(_registeredTools.values()).map(toToolDiscoveryRecord);
    },

    async executeTool(toolName, input = {}) {
      const name = String(toolName || "").trim();
      const tool = _registeredTools.get(name);
      if (!tool) {
        throw new Error(`Tool not found: ${name}`);
      }
      return tool.execute(input, createModelContextClient());
    },
  };
}

function createModelContextTestingCompat(modelContext) {
  return {
    async listTools() {
      if (modelContext && typeof modelContext.listTools === "function") {
        return modelContext.listTools();
      }
      return Array.from(_registeredTools.values()).map(toToolDiscoveryRecord);
    },

    async executeTool(toolName, input = {}) {
      if (modelContext && typeof modelContext.executeTool === "function") {
        return modelContext.executeTool(toolName, input);
      }

      const name = String(toolName || "").trim();
      const tool = _registeredTools.get(name);
      if (!tool) {
        throw new Error(`Tool not found: ${name}`);
      }
      return tool.execute(input, createModelContextClient());
    },
  };
}

function defineNavigatorProperty(name, value) {
  if (navigator[name]) return true;

  const proto = Object.getPrototypeOf(navigator);
  try {
    if (proto && !Object.getOwnPropertyDescriptor(proto, name)) {
      Object.defineProperty(proto, name, {
        configurable: true,
        enumerable: false,
        get() {
          return value;
        },
      });
      return true;
    }
  } catch (_error) {
    // Ignore and fallback to direct definition on navigator.
  }

  try {
    if (Object.prototype.hasOwnProperty.call(navigator, name)) {
      return true;
    }

    Object.defineProperty(navigator, name, {
      configurable: true,
      enumerable: false,
      get() {
        return value;
      },
    });
    return true;
  } catch (_error) {
    try {
      navigator[name] = value;
      return true;
    } catch (_assignError) {
      return false;
    }
  }
}

function ensureModelContextApis() {
  let modelContext = navigator.modelContext;

  if (!modelContext) {
    const compat = createModelContextCompat();
    defineNavigatorProperty("modelContext", compat);
    modelContext = navigator.modelContext || compat;
  }

  if (!navigator.modelContextTesting) {
    const testingCompat = createModelContextTestingCompat(modelContext);
    defineNavigatorProperty("modelContextTesting", testingCompat);
  }

  return {
    modelContext: navigator.modelContext,
    modelContextTesting: navigator.modelContextTesting,
  };
}

function normalizeOrigins(input) {
  const origins = new Set([window.location.origin]);
  if (!Array.isArray(input)) return origins;

  input.forEach((item) => {
    if (typeof item !== "string") return;
    const value = item.trim();
    if (!value) return;
    origins.add(value);
  });

  return origins;
}

function originAllowed(origin) {
  if (_allowedOrigins.has("*")) return true;
  return _allowedOrigins.has(origin);
}

function postResponse(event, payload) {
  if (!event || !event.source || typeof event.source.postMessage !== "function") return;

  const targetOrigin = event.origin && event.origin !== "null" ? event.origin : "*";
  event.source.postMessage(payload, targetOrigin);
}

function safeHref(rawHref) {
  if (typeof rawHref !== "string" || rawHref.trim() === "") return null;

  try {
    const parsed = new URL(rawHref, window.location.origin);
    if (parsed.origin !== window.location.origin) return null;
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return null;
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch (_error) {
    return null;
  }
}

function navigateTo(href) {
  const safe = safeHref(href);
  if (!safe) {
    throw new Error("Navigation target is missing or unsafe");
  }
  const anchor = document.createElement("a");
  anchor.href = safe;
  anchor.rel = "noopener noreferrer";
  anchor.click();
  return { href: safe };
}

function findFirstLink(selectors) {
  for (const selector of selectors) {
    const anchor = document.querySelector(selector);
    if (!anchor) continue;

    const href = safeHref(anchor.getAttribute("href") || "");
    if (!href) continue;

    return { selector, href };
  }
  return null;
}

function getSearchModal() {
  return document.querySelector("[data-search-modal]") || document.getElementById("search-modal");
}

function getSearchInput() {
  return document.querySelector("[data-search-input]") || document.getElementById("search");
}

function getSearchItemsContainer() {
  return document.querySelector("[data-search-results-items]") || document.querySelector(".search-results__items");
}

function readSearchResults(limit = 20) {
  const container = getSearchItemsContainer();
  if (!container) return [];

  const nodes = Array.from(container.querySelectorAll(".search-result-item")).slice(0, Math.max(0, Number(limit) || 20));
  return nodes
    .map((node) => {
      const link = node.querySelector(".search-result-link");
      if (!link) return null;

      const titleNode = node.querySelector(".search-result-title");
      const excerptNode = node.querySelector(".search-result-excerpt");

      return {
        kind: node.getAttribute("data-search-result-kind") || "content",
        action: link.getAttribute("data-search-action") || null,
        query: link.getAttribute("data-search-query") || null,
        href: link.getAttribute("href") || null,
        title: titleNode ? (titleNode.textContent || "").trim() : "",
        excerpt: excerptNode ? (excerptNode.textContent || "").trim() : "",
      };
    })
    .filter(Boolean);
}

function wait(ms) {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function setSearchOpen(open) {
  const modal = getSearchModal();
  if (!modal) {
    throw new Error("Search modal is not available on this page");
  }

  modal.checked = Boolean(open);
  modal.dispatchEvent(new Event("change", { bubbles: true }));

  return { open: modal.checked };
}

function clickIfPresent(selector) {
  const element = document.querySelector(selector);
  if (!element) return false;
  element.click();
  return true;
}

function clickToggleToState(selector, shouldEnable, isEnabledFn) {
  const element = document.querySelector(selector);
  if (!element) {
    throw new Error(`Toggle not available: ${selector}`);
  }

  const current = Boolean(isEnabledFn());
  if (current !== Boolean(shouldEnable)) {
    element.click();
  }

  return Boolean(isEnabledFn());
}

function listHeadings() {
  const headings = Array.from(document.querySelectorAll("main h1[id], main h2[id], main h3[id], main h4[id], main h5[id], main h6[id]"));

  return headings.map((heading) => ({
    id: heading.id,
    level: Number(String(heading.tagName || "").replace("H", "")) || null,
    text: (heading.textContent || "").trim(),
    href: `#${heading.id}`,
  }));
}

function getSidebarCollapsed() {
  const attr = document.documentElement.getAttribute("data-sidebar-collapsed");
  if (attr === "1") return true;

  const drawer = document.querySelector(".drawer");
  return Boolean(drawer && drawer.classList.contains("sidebar-collapsed"));
}

function getTocCollapsed() {
  const attr = document.documentElement.getAttribute("data-toc-collapsed");
  if (attr === "1") return true;

  return Boolean(document.body && document.body.classList.contains("toc-collapsed"));
}

function getNavigationState() {
  const prev = findFirstLink([".prev-nav-item a", "a[rel='prev']", "a[data-prev]"]);
  const next = findFirstLink([".next-nav-item a", "a[rel='next']", "a[data-next]"]);

  return {
    prev,
    next,
    path: `${window.location.pathname}${window.location.search}${window.location.hash}`,
  };
}

async function getPwaStatus() {
  const supportsSW = "serviceWorker" in navigator;
  const isSecure = window.isSecureContext;
  const controllerActive = Boolean(navigator.serviceWorker && navigator.serviceWorker.controller);

  let hasRegistration = false;
  let activeScope = null;

  if (supportsSW) {
    try {
      const registration = await navigator.serviceWorker.getRegistration();
      hasRegistration = Boolean(registration);
      activeScope = registration ? registration.scope : null;
    } catch (_error) {
      hasRegistration = false;
      activeScope = null;
    }
  }

  return {
    supportsSW,
    isSecure,
    controllerActive,
    hasRegistration,
    activeScope,
  };
}

async function copyToClipboard(text) {
  const value = String(text || "");
  if (!value) throw new Error("Nothing to copy");

  if (navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    await navigator.clipboard.writeText(value);
    return { copied: true, value };
  }

  return { copied: false, value };
}

function getAppState() {
  const searchInput = getSearchInput();
  const searchModal = getSearchModal();
  const aiConfig = getAskAiConfig();

  return {
    protocol: PROTOCOL,
    version: VERSION,
    runtime: _runtime,
    title: document.title,
    route: {
      path: window.location.pathname,
      search: window.location.search,
      hash: window.location.hash,
    },
    theme: {
      mode: getThemeMode(),
      resolved: getResolvedTheme(),
      attr: document.documentElement.getAttribute("data-theme") || null,
    },
    ui: {
      sidebarCollapsed: getSidebarCollapsed(),
      tocCollapsed: getTocCollapsed(),
      searchOpen: Boolean(searchModal?.checked),
    },
    search: {
      query: searchInput ? (searchInput.value || "").trim() : "",
      resultsCount: readSearchResults(200).length,
    },
    ai: {
      enabled: isAskAiEnabled(),
      label: aiConfig.label,
      endpoint: aiConfig.endpoint || null,
      profileUrl: aiConfig.profileUrl || null,
    },
    navigation: getNavigationState(),
    online: navigator.onLine,
  };
}

// Registry created with a null prototype so there are no inherited callable
// properties (constructor, __proto__, toString, etc.) that a user-controlled
// toolName lookup could accidentally dispatch to.
// This satisfies CodeQL js/unvalidated-dynamic-method-call.
const TOOL_REGISTRY = Object.assign(Object.create(null), {
  "tools.list": async () => Object.keys(TOOL_REGISTRY),
  "system.ping": async () => ({ now: Date.now(), protocol: PROTOCOL, runtime: _runtime }),
  "app.getState": async () => getAppState(),

  "nav.prev": async () => {
    const target = findFirstLink([".prev-nav-item a", "a[rel='prev']", "a[data-prev]"]);
    if (!target) throw new Error("Previous link not found");
    return navigateTo(target.href);
  },
  "nav.next": async () => {
    const target = findFirstLink([".next-nav-item a", "a[rel='next']", "a[data-next]"]);
    if (!target) throw new Error("Next link not found");
    return navigateTo(target.href);
  },
  "nav.home": async () => navigateTo("/"),
  "nav.goto": async (args = {}) => navigateTo(args.href || args.path || ""),
  "nav.reload": async () => {
    window.location.reload();
    return { reloading: true };
  },
  "nav.back": async () => {
    window.history.back();
    return { ok: true };
  },
  "nav.forward": async () => {
    window.history.forward();
    return { ok: true };
  },

  "theme.get": async () => ({ mode: getThemeMode(), resolved: getResolvedTheme() }),
  "theme.set": async (args = {}) => {
    const mode = String(args.mode || "").toLowerCase();
    const applied = setThemeMode(mode);
    return { mode: applied, resolved: getResolvedTheme() };
  },
  "theme.toggle": async () => {
    const applied = cycleThemeMode();
    return { mode: applied, resolved: getResolvedTheme() };
  },

  "search.open": async () => setSearchOpen(true),
  "search.close": async () => setSearchOpen(false),
  "search.toggle": async () => {
    const modal = getSearchModal();
    if (!modal) throw new Error("Search modal is not available on this page");
    return setSearchOpen(!modal.checked);
  },
  "search.query": async (args = {}) => {
    const query = String(args.query || "").trim();
    if (!query) throw new Error("Search query is required");

    await setSearchOpen(true);
    const input = getSearchInput();
    if (!input) throw new Error("Search input not found");

    input.value = query;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    await wait(220);

    return {
      query,
      open: true,
      results: readSearchResults(50),
    };
  },
  "search.results": async (args = {}) => ({
    query: (getSearchInput()?.value || "").trim(),
    results: readSearchResults(args.limit || 50),
  }),

  "ai.status": async () => ({
    enabled: isAskAiEnabled(),
    config: getAskAiConfig(),
  }),
  "ai.buildContext": async (args = {}) => {
    const query = String(args.query || "").trim();
    if (!query) throw new Error("AI query is required");

    const source = String(args.source || "webmcp").trim() || "webmcp";
    return buildAskAiContext(query, { source });
  },
  "ai.context.get": async (args = {}) => {
    const ctxKey = String(args.ctxKey || args.key || "").trim();
    if (!ctxKey) throw new Error("Context key is required");

    const payload = getStoredAskAiContext(ctxKey);
    if (!payload) throw new Error("Stored context was not found");
    return { ctxKey, payload };
  },
  "ai.ask": async (args = {}) => {
    const query = String(args.query || "").trim();
    if (!query) throw new Error("AI query is required");

    const source = String(args.source || "webmcp").trim() || "webmcp";
    return askAiAboutQuery(query, {
      source,
      newTab: Boolean(args.newTab),
    });
  },

  "toc.open": async () => ({ collapsed: clickToggleToState("[data-toc-toggle], #toc-toggle", false, getTocCollapsed) }),
  "toc.close": async () => ({ collapsed: clickToggleToState("[data-toc-toggle], #toc-toggle", true, getTocCollapsed) }),
  "toc.toggle": async () => {
    const clicked = clickIfPresent("[data-toc-toggle], #toc-toggle");
    if (!clicked) throw new Error("TOC toggle not found");
    return { collapsed: getTocCollapsed() };
  },

  "sidebar.open": async () => ({ collapsed: clickToggleToState("[data-sidebar-toggle], #sidebar-toggle", false, getSidebarCollapsed) }),
  "sidebar.close": async () => ({ collapsed: clickToggleToState("[data-sidebar-toggle], #sidebar-toggle", true, getSidebarCollapsed) }),
  "sidebar.toggle": async () => {
    const clicked = clickIfPresent("[data-sidebar-toggle], #sidebar-toggle");
    if (!clicked) throw new Error("Sidebar toggle not found");
    return { collapsed: getSidebarCollapsed() };
  },

  "content.listHeadings": async () => listHeadings(),
  "content.scrollToHeading": async (args = {}) => {
    const id = String(args.id || "").trim();
    if (!id) throw new Error("Heading id is required");

    const safeId = id.replace(/^#/, "");
    const el = document.getElementById(safeId);
    if (!el) throw new Error("Heading not found");

    el.scrollIntoView({ behavior: "smooth", block: "start" });
    if (window.location.hash !== `#${safeId}`) {
      window.history.replaceState(null, "", `#${safeId}`);
    }

    return { id: safeId };
  },
  "content.copyPermalink": async (args = {}) => {
    const id = String(args.id || "").trim().replace(/^#/, "");
    const href = id
      ? `${window.location.origin}${window.location.pathname}#${id}`
      : `${window.location.origin}${window.location.pathname}${window.location.search}${window.location.hash}`;

    return copyToClipboard(href);
  },

  "playlist.prev": async () => {
    const target = findFirstLink([".prev-nav-item a"]);
    if (!target) throw new Error("Playlist previous item not found");
    return navigateTo(target.href);
  },
  "playlist.next": async () => {
    const target = findFirstLink([".next-nav-item a"]);
    if (!target) throw new Error("Playlist next item not found");
    return navigateTo(target.href);
  },

  "pwa.status": async () => getPwaStatus(),
  "pwa.checkForUpdate": async () => {
    if (!("serviceWorker" in navigator)) {
      throw new Error("Service worker not supported");
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      throw new Error("No service worker registration found");
    }

    await registration.update();
    return { updated: true };
  },
});

const SAFE_TOOL_MAP = new Map(Object.entries(TOOL_REGISTRY));

const TOOL_SPECS = {
  "tools.list": {
    description: "List all available imperative WebMCP tools exposed by this page.",
    inputSchema: { type: "object", additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  "system.ping": {
    description: "Return a timestamp and protocol metadata for health checks.",
    inputSchema: { type: "object", additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  "app.getState": {
    description: "Get page state including route, theme, UI toggles, and connectivity.",
    inputSchema: { type: "object", additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  "nav.prev": { description: "Navigate to the previous item/page link.", inputSchema: { type: "object", additionalProperties: false } },
  "nav.next": { description: "Navigate to the next item/page link.", inputSchema: { type: "object", additionalProperties: false } },
  "nav.home": { description: "Navigate to the site home page.", inputSchema: { type: "object", additionalProperties: false } },
  "nav.goto": {
    description: "Navigate to an internal route.",
    inputSchema: {
      type: "object",
      properties: {
        href: { type: "string" },
        path: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  "nav.reload": { description: "Reload the current page.", inputSchema: { type: "object", additionalProperties: false } },
  "nav.back": { description: "Navigate browser history back.", inputSchema: { type: "object", additionalProperties: false } },
  "nav.forward": { description: "Navigate browser history forward.", inputSchema: { type: "object", additionalProperties: false } },
  "theme.get": {
    description: "Read current theme mode and resolved theme.",
    inputSchema: { type: "object", additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  "theme.set": {
    description: "Set theme mode to auto, light, or dark.",
    inputSchema: {
      type: "object",
      properties: {
        mode: { type: "string", enum: ["auto", "light", "dark"] },
      },
      required: ["mode"],
      additionalProperties: false,
    },
  },
  "theme.toggle": { description: "Cycle theme mode through auto/light/dark.", inputSchema: { type: "object", additionalProperties: false } },
  "search.open": { description: "Open the search modal.", inputSchema: { type: "object", additionalProperties: false } },
  "search.close": { description: "Close the search modal.", inputSchema: { type: "object", additionalProperties: false } },
  "search.toggle": { description: "Toggle search modal visibility.", inputSchema: { type: "object", additionalProperties: false } },
  "search.query": {
    description: "Set a search query in the modal and return the current rendered results.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  "search.results": {
    description: "Read currently rendered search results from the modal.",
    inputSchema: {
      type: "object",
      properties: {
        limit: { type: "number" },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  "ai.status": {
    description: "Read Ask AI runtime status and effective configuration.",
    inputSchema: { type: "object", additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  "ai.buildContext": {
    description: "Build an Ask AI context payload from query, page state, and profile context.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        source: { type: "string" },
      },
      required: ["query"],
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  "ai.context.get": {
    description: "Read a previously stored Ask AI context payload from session storage by key.",
    inputSchema: {
      type: "object",
      properties: {
        ctxKey: { type: "string" },
        key: { type: "string" },
      },
      additionalProperties: false,
    },
    annotations: { readOnlyHint: true },
  },
  "ai.ask": {
    description: "Execute Ask AI for a query using current runtime configuration.",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string" },
        source: { type: "string" },
        newTab: { type: "boolean" },
      },
      required: ["query"],
      additionalProperties: false,
    },
  },
  "toc.open": { description: "Expand/open the table of contents panel.", inputSchema: { type: "object", additionalProperties: false } },
  "toc.close": { description: "Collapse/close the table of contents panel.", inputSchema: { type: "object", additionalProperties: false } },
  "toc.toggle": { description: "Toggle the table of contents panel.", inputSchema: { type: "object", additionalProperties: false } },
  "sidebar.open": { description: "Expand/open the sidebar panel.", inputSchema: { type: "object", additionalProperties: false } },
  "sidebar.close": { description: "Collapse/close the sidebar panel.", inputSchema: { type: "object", additionalProperties: false } },
  "sidebar.toggle": { description: "Toggle sidebar panel state.", inputSchema: { type: "object", additionalProperties: false } },
  "content.listHeadings": {
    description: "List all heading anchors found in main content.",
    inputSchema: { type: "object", additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  "content.scrollToHeading": {
    description: "Scroll to a heading by its id.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
      },
      required: ["id"],
      additionalProperties: false,
    },
  },
  "content.copyPermalink": {
    description: "Copy permalink for current page or a specific heading id.",
    inputSchema: {
      type: "object",
      properties: {
        id: { type: "string" },
      },
      additionalProperties: false,
    },
  },
  "playlist.prev": { description: "Navigate to previous playlist item if available.", inputSchema: { type: "object", additionalProperties: false } },
  "playlist.next": { description: "Navigate to next playlist item if available.", inputSchema: { type: "object", additionalProperties: false } },
  "pwa.status": {
    description: "Get service worker and PWA capability status.",
    inputSchema: { type: "object", additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  "pwa.checkForUpdate": { description: "Trigger service worker update check.", inputSchema: { type: "object", additionalProperties: false } },
};

function registerImperativeTools(modelContext) {
  if (_toolsRegistered) return;
  if (!modelContext || typeof modelContext.registerTool !== "function") return;

  Object.keys(TOOL_REGISTRY).forEach((toolName) => {
    const spec = TOOL_SPECS[toolName] || {
      description: `Execute ${toolName}`,
      inputSchema: { type: "object", additionalProperties: true },
      annotations: { readOnlyHint: false },
    };

    const tool = {
      name: toolName,
      description: spec.description,
      inputSchema: spec.inputSchema,
      annotations: spec.annotations,
      async execute(input) {
        return callTool(toolName, input || {});
      },
    };

    try {
      modelContext.registerTool(tool);
      _registeredTools.set(toolName, tool);
      syncCompatStore();
    } catch (_error) {
      // Ignore duplicate registrations to keep hot reload/idempotent init stable.
    }
  });

  _toolsRegistered = true;
}

async function callTool(toolName, args = {}) {
  if (typeof toolName !== "string" || toolName.trim() === "") {
    throw new Error("Tool name is required");
  }

  // Prevent prototype-pollution dispatch by using a Map lookup.
  // This satisfies CodeQL js/unvalidated-dynamic-method-call.
  if (!SAFE_TOOL_MAP.has(toolName)) {
    throw new Error(`Unknown tool: ${toolName}`);
  }

  const tool = SAFE_TOOL_MAP.get(toolName);

  if (typeof tool !== "function") {
    throw new Error(`Tool is not executable: ${toolName}`);
  }

  return tool(args);
}

function handlePostMessage(event) {
  const payload = event && event.data;
  if (!payload || typeof payload !== "object") return;

  if (payload.protocol && payload.protocol !== PROTOCOL) return;
  if (!originAllowed(event.origin)) return;

  const type = payload.type;

  if (type === "webmcp.list") {
    postResponse(event, {
      protocol: PROTOCOL,
      type: "webmcp.list.result",
      id: payload.id || null,
      ok: true,
      result: Object.keys(TOOL_REGISTRY),
    });
    return;
  }

  if (type === "webmcp.state") {
    postResponse(event, {
      protocol: PROTOCOL,
      type: "webmcp.state.result",
      id: payload.id || null,
      ok: true,
      result: getAppState(),
    });
    return;
  }

  if (type !== "webmcp.call") return;

  const id = payload.id || null;
  const tool = payload.tool;
  const args = payload.args || {};

  callTool(tool, args)
    .then((result) => {
      postResponse(event, {
        protocol: PROTOCOL,
        type: "webmcp.result",
        id,
        ok: true,
        result,
      });
    })
    .catch((error) => {
      postResponse(event, {
        protocol: PROTOCOL,
        type: "webmcp.result",
        id,
        ok: false,
        error: error && error.message ? error.message : "Tool execution failed",
      });
    });
}

function buildPublicApi() {
  return {
    protocol: PROTOCOL,
    version: VERSION,
    runtime: _runtime,
    listTools() {
      return Object.keys(TOOL_REGISTRY);
    },
    getState() {
      return getAppState();
    },
    async call(toolName, args = {}) {
      return callTool(toolName, args);
    },
    get modelContextAvailable() {
      return Boolean(navigator.modelContext);
    },
    get modelContextTestingAvailable() {
      return Boolean(navigator.modelContextTesting);
    },
  };
}

export function initWebMCP(options = {}) {
  if (typeof options.runtime === "string" && options.runtime.trim() !== "") {
    _runtime = options.runtime;
  }

  if (Array.isArray(options.allowedOrigins)) {
    _allowedOrigins = normalizeOrigins(options.allowedOrigins);
  }

  const apis = ensureModelContextApis();
  registerImperativeTools(apis.modelContext);

  if (!_initialized) {
    window.addEventListener("message", handlePostMessage);
    window.WebMCP = buildPublicApi();
    window.webmcp = window.WebMCP;
    _initialized = true;

    document.dispatchEvent(new CustomEvent("webmcp:ready", {
      detail: {
        protocol: PROTOCOL,
        version: VERSION,
        runtime: _runtime,
        tools: Object.keys(TOOL_REGISTRY),
        modelContext: Boolean(navigator.modelContext),
        modelContextTesting: Boolean(navigator.modelContextTesting),
      },
    }));
  } else if (window.WebMCP) {
    window.WebMCP.runtime = _runtime;
    window.webmcp = window.WebMCP;
  }

  return window.WebMCP;
}
