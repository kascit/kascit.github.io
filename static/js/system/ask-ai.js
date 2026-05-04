/**
 * Ask AI context builder and launcher.
 *
 * Keeps behavior config-driven via #site-config JSON.
 * Builds lightweight RAG-style context from current page + optional profile JSON.
 */

const PROFILE_CACHE_TTL_MS = 5 * 60 * 1000;
const PROFILE_TIMEOUT_MS = 3000;
const CONTEXT_STORAGE_PREFIX = "kascit-ask-ai-context:";
const CONTEXT_STORAGE_MAX = 10;
const ASK_AI_HISTORY_KEY = "kascit-ask-ai-history-v1";
const ASK_AI_HISTORY_MAX_TURNS = 8;

const profileCache = {
  value: null,
  expiresAt: 0,
  promise: null,
};

function readSiteConfig() {
  const node = document.getElementById("site-config");
  if (!node) return {};

  try {
    return JSON.parse(node.textContent || "{}");
  } catch {
    return {};
  }
}

function normalizeString(value) {
  return typeof value === "string" ? value.trim() : "";
}

function normalizeLocalUrl(value) {
  const input = normalizeString(value);
  if (!input) return "";

  try {
    const parsed = new URL(input, window.location.origin);
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") return "";
    if (parsed.origin !== window.location.origin) return "";
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "";
  }
}

function normalizeTrustedHosts(values) {
  if (!Array.isArray(values)) return [];
  return values
    .map((item) => normalizeString(item).toLowerCase())
    .filter(Boolean);
}

function isLocalHostname(hostname) {
  return hostname === "localhost" || hostname === "127.0.0.1";
}

function isTrustedHost(hostname, trustedHosts) {
  const host = String(hostname || "").toLowerCase();
  if (!host) return false;
  if (host === window.location.hostname.toLowerCase()) return true;

  return trustedHosts.some((trusted) => {
    return host === trusted || host.endsWith(`.${trusted}`);
  });
}

function normalizeEndpointUrl(value, trustedHosts) {
  const input = normalizeString(value);
  if (!input) return "";

  try {
    const parsed = new URL(input, window.location.origin);
    const protocolAllowed =
      parsed.protocol === "https:" ||
      (parsed.protocol === "http:" && isLocalHostname(parsed.hostname));
    if (!protocolAllowed) return "";

    if (!isTrustedHost(parsed.hostname, trustedHosts)) return "";
    return parsed.toString();
  } catch {
    return "";
  }
}

function normalizeLabel(value, fallback) {
  const label = normalizeString(value);
  return label || fallback;
}

function normalizeNumber(value, fallback, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(n)));
}

export function getAskAiConfig() {
  const cfg = readSiteConfig();
  const ai = cfg && typeof cfg.ai === "object" ? cfg.ai : {};
  const trustedEndpointHosts = normalizeTrustedHosts(
    ai.trustedEndpointHosts || [],
  );

  const enabled = ai.enabled !== false;
  const endpoint = normalizeEndpointUrl(ai.endpoint, trustedEndpointHosts);
  const profileUrl = normalizeLocalUrl(ai.profileUrl);

  return {
    enabled,
    label: normalizeLabel(ai.label, "Ask AI about this"),
    endpoint,
    profileUrl,
    openInNewTab: Boolean(ai.openInNewTab),
    includePageContext: ai.includePageContext !== false,
    includeProfileContext: ai.includeProfileContext !== false,
    maxContextChunks: normalizeNumber(ai.maxContextChunks, 4, 1, 12),
    maxHeadings: normalizeNumber(ai.maxHeadings, 8, 1, 20),
    requireAuth: ai.requireAuth !== false,
    creditCost: normalizeNumber(ai.creditCost, 20, 0, 1000),
    guestMessage: normalizeLabel(ai.guestMessage, "Sign in to use Ask AI"),
    trustedEndpointHosts,
  };
}

export function isAskAiEnabled() {
  return Boolean(getAskAiConfig().enabled);
}

function getSearchTerms(query) {
  return String(query || "")
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 2);
}

function getPageHeadings(limit) {
  const headings = Array.from(
    document.querySelectorAll(
      "main h1, main h2, main h3, main h4, main h5, main h6",
    ),
  );
  return headings
    .slice(0, limit)
    .map((node) => ({
      level: Number(String(node.tagName || "").replace("H", "")) || null,
      text: normalizeString(node.textContent),
      id: normalizeString(node.id),
    }))
    .filter((item) => item.text);
}

function pickContextChunks(query, maxChunks) {
  const terms = getSearchTerms(query);
  const candidates = Array.from(
    document.querySelectorAll("main p, main li, main blockquote"),
  );

  const scored = candidates
    .map((node, idx) => {
      const text = normalizeString(node.textContent).replace(/\s+/g, " ");
      if (!text || text.length < 30) return null;

      const lower = text.toLowerCase();
      let score = 0;
      for (const term of terms) {
        if (lower.includes(term)) score += 3;
      }

      if (node.tagName === "P") score += 1;
      score += Math.max(0, 2 - Math.floor(idx / 20));

      return {
        text: text.length > 260 ? `${text.slice(0, 257)}...` : text,
        score,
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score);

  const prioritized = scored.filter((chunk) => chunk.score > 0);
  const selected = (prioritized.length > 0 ? prioritized : scored).slice(
    0,
    maxChunks,
  );

  return selected.map((chunk) => chunk.text);
}

function sanitizeProfilePayload(payload) {
  if (!payload || typeof payload !== "object") return null;

  const role = normalizeString(payload.role);
  const summary = normalizeString(payload.summary);

  const skills = Array.isArray(payload.skills)
    ? payload.skills
        .map((item) => normalizeString(item))
        .filter(Boolean)
        .slice(0, 20)
    : [];

  const interests = Array.isArray(payload.interests)
    ? payload.interests
        .map((item) => normalizeString(item))
        .filter(Boolean)
        .slice(0, 20)
    : [];

  const links = Array.isArray(payload.links)
    ? payload.links
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const label = normalizeString(item.label);
          const href = normalizeLocalUrl(item.href);
          if (!label || !href) return null;
          return { label, href };
        })
        .filter(Boolean)
        .slice(0, 8)
    : [];

  if (
    !role &&
    !summary &&
    skills.length === 0 &&
    interests.length === 0 &&
    links.length === 0
  ) {
    return null;
  }

  return {
    role: role || null,
    summary: summary || null,
    skills,
    interests,
    links,
  };
}

async function loadProfileContext(config) {
  if (!config.profileUrl || !config.includeProfileContext) return null;

  const now = Date.now();
  if (profileCache.value && profileCache.expiresAt > now) {
    return profileCache.value;
  }

  if (profileCache.promise) {
    return profileCache.promise;
  }

  profileCache.promise = (async () => {
    const controller = new AbortController();
    const timeout = window.setTimeout(
      () => controller.abort(),
      PROFILE_TIMEOUT_MS,
    );
    const abortOnPageExit = () => controller.abort();

    window.addEventListener("pagehide", abortOnPageExit, { once: true });
    window.addEventListener("beforeunload", abortOnPageExit, { once: true });

    try {
      const response = await fetch(config.profileUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
        credentials: "same-origin",
        signal: controller.signal,
      });

      if (!response.ok) return null;

      const data = await response.json();
      const sanitized = sanitizeProfilePayload(data);
      profileCache.value = sanitized;
      profileCache.expiresAt = Date.now() + PROFILE_CACHE_TTL_MS;
      return sanitized;
    } catch {
      return null;
    } finally {
      window.clearTimeout(timeout);
      window.removeEventListener("pagehide", abortOnPageExit);
      window.removeEventListener("beforeunload", abortOnPageExit);
      profileCache.promise = null;
    }
  })();

  return profileCache.promise;
}

function getPageContext(query, config) {
  if (!config.includePageContext) return null;

  const tags = Array.from(
    document.querySelectorAll(
      'meta[property="article:tag"], meta[name="keywords"]',
    ),
  )
    .map((node) => normalizeString(node.getAttribute("content")))
    .filter(Boolean)
    .flatMap((raw) =>
      raw
        .split(",")
        .map((token) => normalizeString(token))
        .filter(Boolean),
    )
    .slice(0, 16);

  return {
    title: document.title,
    url: `${window.location.pathname}${window.location.search}${window.location.hash}`,
    headings: getPageHeadings(config.maxHeadings),
    tags,
    excerpts: pickContextChunks(query, config.maxContextChunks),
  };
}

function shortHash(input) {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash +=
      (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
  }
  return Math.abs(hash >>> 0).toString(36);
}

function pruneStoredContexts() {
  try {
    const keys = [];
    for (let i = 0; i < window.sessionStorage.length; i += 1) {
      const key = window.sessionStorage.key(i);
      if (key && key.startsWith(CONTEXT_STORAGE_PREFIX)) keys.push(key);
    }

    if (keys.length <= CONTEXT_STORAGE_MAX) return;

    keys
      .map((key) => {
        try {
          const raw = window.sessionStorage.getItem(key);
          const parsed = raw ? JSON.parse(raw) : null;
          return {
            key,
            ts: parsed && Number(parsed.ts) ? Number(parsed.ts) : 0,
          };
        } catch {
          return { key, ts: 0 };
        }
      })
      .sort((a, b) => a.ts - b.ts)
      .slice(0, Math.max(0, keys.length - CONTEXT_STORAGE_MAX))
      .forEach((item) => {
        window.sessionStorage.removeItem(item.key);
      });
  } catch {
    // Ignore storage failures.
  }
}

function sanitizeHistoryMessage(item) {
  if (!item || typeof item !== "object") return null;
  const role = normalizeString(item.role).toLowerCase();
  if (role !== "user" && role !== "assistant") return null;

  const content = normalizeString(item.content)
    .replace(/\s+/g, " ")
    .slice(0, 4000);
  if (!content) return null;

  return { role, content };
}

function normalizeHistoryList(history) {
  if (!Array.isArray(history)) return [];
  return history.map((item) => sanitizeHistoryMessage(item)).filter(Boolean);
}

function trimHistory(history) {
  const normalized = normalizeHistoryList(history);
  const maxMessages = ASK_AI_HISTORY_MAX_TURNS * 2;
  if (normalized.length <= maxMessages) return normalized;
  return normalized.slice(normalized.length - maxMessages);
}

export function getAskAiSessionHistory() {
  try {
    const raw = window.sessionStorage.getItem(ASK_AI_HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return trimHistory(parsed);
  } catch {
    return [];
  }
}

export function clearAskAiSessionHistory() {
  try {
    window.sessionStorage.removeItem(ASK_AI_HISTORY_KEY);
  } catch {
    // Ignore storage failures.
  }
}

function saveAskAiSessionHistory(history) {
  const trimmed = trimHistory(history);

  try {
    window.sessionStorage.setItem(ASK_AI_HISTORY_KEY, JSON.stringify(trimmed));
  } catch {
    // Ignore storage failures.
  }

  return trimmed;
}

function appendAskAiHistoryTurn(userMessage, assistantMessage) {
  const current = getAskAiSessionHistory();
  const next = current.slice();

  const user = sanitizeHistoryMessage({ role: "user", content: userMessage });
  if (user) next.push(user);

  const assistant = sanitizeHistoryMessage({
    role: "assistant",
    content: assistantMessage,
  });
  if (assistant) next.push(assistant);

  return saveAskAiSessionHistory(next);
}

function mapAskAiHttpError(response, fallbackMessage) {
  const status = Number(response && response.status) || 0;
  if (status === 401) {
    return buildAskAiError(
      "AUTH_REQUIRED",
      fallbackMessage || "Sign in to use Ask AI",
    );
  }

  if (status === 402) {
    return buildAskAiError(
      "INSUFFICIENT_CREDITS",
      "Not enough credits to run Ask AI",
    );
  }

  if (status === 403) {
    return buildAskAiError(
      "FORBIDDEN",
      "Ask AI is not available for this account",
    );
  }

  if (status === 429) {
    return buildAskAiError(
      "RATE_LIMITED",
      "Ask AI is busy right now. Please retry in a moment.",
    );
  }

  return buildAskAiError(
    "REQUEST_FAILED",
    fallbackMessage || "Ask AI request failed",
  );
}

function normalizeAskAiAnswer(payload) {
  if (!payload || typeof payload !== "object") {
    throw buildAskAiError("BAD_RESPONSE", "Invalid Ask AI response");
  }

  const answer = normalizeString(payload.answer);
  if (!answer) {
    throw buildAskAiError("EMPTY_ANSWER", "Ask AI returned an empty answer");
  }

  const citations = Array.isArray(payload.citations)
    ? payload.citations
        .map((item) => {
          if (!item || typeof item !== "object") return null;
          const title = normalizeString(item.title);
          const url = normalizeString(item.url);
          const snippet = normalizeString(item.snippet);
          if (!title && !url && !snippet) return null;
          return {
            title: title || "Source",
            url: url || "",
            snippet: snippet || "",
            sourceType: normalizeString(item.sourceType) || "context",
          };
        })
        .filter(Boolean)
    : [];

  return {
    answer,
    citations,
    cost: Number(payload.cost) || 0,
    creditsRemaining: Number.isFinite(Number(payload.creditsRemaining))
      ? Number(payload.creditsRemaining)
      : null,
    role: normalizeString(payload.role).toLowerCase() || "user",
    requestId: normalizeString(payload.requestId),
  };
}

export async function requestAskAiAnswer(query, options = {}) {
  const config = getAskAiConfig();
  if (!config.enabled) {
    throw buildAskAiError("DISABLED", "Ask AI is disabled");
  }

  if (!config.endpoint) {
    throw buildAskAiError("NO_ENDPOINT", "Ask AI endpoint is not configured");
  }

  ensureAskAiAccess(config);

  const context = await buildAskAiContext(query, options);
  const ctxKey = storeAskAiContext(context);
  const history = trimHistory(options.history || getAskAiSessionHistory());

  const response = await fetch(config.endpoint, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    credentials: "include",
    body: JSON.stringify({
      query: context.query,
      source: context.source,
      ctxKey,
      context,
      history,
    }),
  });

  let payload = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const backendMessage =
      payload && typeof payload.message === "string" ? payload.message : "";
    throw mapAskAiHttpError(response, backendMessage || config.guestMessage);
  }

  const normalized = normalizeAskAiAnswer(payload);
  appendAskAiHistoryTurn(context.query, normalized.answer);

  if (Number.isFinite(normalized.creditsRemaining)) {
    document.dispatchEvent(
      new CustomEvent("creditsChanged", {
        detail: {
          balance: normalized.creditsRemaining,
          unlimited:
            normalized.role === "admin" || normalized.creditsRemaining < 0,
        },
      }),
    );
  }

  return {
    ...normalized,
    ctxKey,
    context,
    history: getAskAiSessionHistory(),
  };
}

export function getStoredAskAiContext(ctxKey) {
  const key = normalizeString(ctxKey);
  if (!key) return null;

  try {
    const raw = window.sessionStorage.getItem(
      `${CONTEXT_STORAGE_PREFIX}${key}`,
    );
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return null;
    return parsed.payload || null;
  } catch {
    return null;
  }
}

function storeAskAiContext(payload) {
  const serial = JSON.stringify(payload);
  const ctxKey = shortHash(`${Date.now()}|${serial}`);

  try {
    const wrapped = JSON.stringify({ ts: Date.now(), payload });
    window.sessionStorage.setItem(
      `${CONTEXT_STORAGE_PREFIX}${ctxKey}`,
      wrapped,
    );
    pruneStoredContexts();
  } catch {
    // Ignore storage failures; caller still gets payload return.
  }

  return ctxKey;
}

function buildEndpointUrl(basePath, payload, ctxKey) {
  const target = new URL(basePath);
  target.searchParams.set("q", payload.query);
  target.searchParams.set("ctx", ctxKey);
  target.searchParams.set("source", payload.source || "search");
  return target.toString();
}

function navigateToUrl(rawUrl) {
  const target = new URL(rawUrl, window.location.origin);
  if (target.protocol !== "http:" && target.protocol !== "https:") {
    throw new Error("Unsafe navigation target");
  }

  const anchor = document.createElement("a");
  anchor.href = target.toString();
  anchor.rel = "noopener noreferrer";
  anchor.click();
  return target.toString();
}

function buildAskAiError(code, message) {
  const error = new Error(message || "Ask AI request failed");
  error.code = code;
  return error;
}

function getAuthSnapshot() {
  if (!window.AUTH || typeof window.AUTH !== "object") return null;
  const status = window.AUTH.status;
  if (!status || typeof status !== "object") return null;

  return {
    authenticated: Boolean(status.authenticated),
    role: normalizeString(status.role),
    user: Boolean(status.user),
  };
}

function ensureAskAiAccess(config) {
  if (!config.requireAuth) return getAuthSnapshot();

  const status = getAuthSnapshot();
  const authed = Boolean(status && status.authenticated && status.user);
  if (!authed) {
    throw buildAskAiError("AUTH_REQUIRED", config.guestMessage);
  }

  return status;
}

async function copyToClipboard(text) {
  if (
    navigator.clipboard &&
    typeof navigator.clipboard.writeText === "function"
  ) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      return false;
    }
  }

  return false;
}

function buildPrompt(context) {
  const lines = [
    "You are helping answer a question about this website and profile context.",
    `Question: ${context.query}`,
    "",
  ];

  if (context.page) {
    lines.push(`Page: ${context.page.title}`);
    lines.push(`URL: ${context.page.url}`);

    if (Array.isArray(context.page.headings) && context.page.headings.length) {
      lines.push("Headings:");
      context.page.headings.forEach((item) => {
        lines.push(`- H${item.level || "?"}: ${item.text}`);
      });
    }

    if (Array.isArray(context.page.excerpts) && context.page.excerpts.length) {
      lines.push("Relevant excerpts:");
      context.page.excerpts.forEach((item) => {
        lines.push(`- ${item}`);
      });
    }
  }

  if (context.profile) {
    lines.push("", "Profile context:");
    if (context.profile.role) lines.push(`- Role: ${context.profile.role}`);
    if (context.profile.summary)
      lines.push(`- Summary: ${context.profile.summary}`);
    if (
      Array.isArray(context.profile.skills) &&
      context.profile.skills.length
    ) {
      lines.push(`- Skills: ${context.profile.skills.join(", ")}`);
    }
    if (
      Array.isArray(context.profile.interests) &&
      context.profile.interests.length
    ) {
      lines.push(`- Interests: ${context.profile.interests.join(", ")}`);
    }
  }

  lines.push(
    "",
    "Answer concisely and only use details supported by this context.",
  );
  return lines.join("\n");
}

export async function buildAskAiContext(query, options = {}) {
  const normalizedQuery = normalizeString(query);
  if (!normalizedQuery) {
    throw new Error("Ask AI query is required");
  }

  const config = getAskAiConfig();
  const source = normalizeString(options.source) || "search";
  const page = getPageContext(normalizedQuery, config);
  const profile = await loadProfileContext(config);
  const auth = getAuthSnapshot();
  const role =
    auth && typeof auth.role === "string"
      ? normalizeString(auth.role).toLowerCase()
      : "guest";

  return {
    query: normalizedQuery,
    source,
    page,
    profile,
    viewer: {
      role,
      authenticated: Boolean(auth && auth.authenticated),
      creditCost: role === "admin" ? 0 : config.creditCost,
    },
    createdAt: new Date().toISOString(),
  };
}

export async function askAiAboutQuery(query, options = {}) {
  const config = getAskAiConfig();
  if (!config.enabled) {
    throw buildAskAiError("DISABLED", "Ask AI is disabled");
  }

  ensureAskAiAccess(config);

  const context = await buildAskAiContext(query, options);
  const ctxKey = storeAskAiContext(context);

  if (config.endpoint) {
    const target = buildEndpointUrl(config.endpoint, context, ctxKey);

    if (options.newTab || config.openInNewTab) {
      window.open(target, "_blank", "noopener,noreferrer");
      return { mode: "new-tab", target, ctxKey };
    }

    navigateToUrl(target);
    return { mode: "navigate", target, ctxKey };
  }

  const prompt = buildPrompt(context);
  const copied = await copyToClipboard(prompt);

  return {
    mode: copied ? "clipboard" : "context",
    copied,
    ctxKey,
    prompt,
    context,
  };
}
