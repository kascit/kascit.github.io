const DEFAULT_CREDIT_COST = 20;
const DEFAULT_MODEL = "gemini-2.0-flash-lite";
const DEFAULT_MAX_OUTPUT_TOKENS = 700;

class HttpError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

function clamp(value, min, max) {
  const num = Number(value);
  if (!Number.isFinite(num)) return min;
  return Math.max(min, Math.min(max, Math.floor(num)));
}

function sanitizeString(value, maxLen) {
  const text = typeof value === "string" ? value.trim() : "";
  if (!text) return "";
  return text.replace(/\s+/g, " ").slice(0, maxLen);
}

function parseJsonSafe(text) {
  try {
    return JSON.parse(text);
  } catch (_error) {
    return null;
  }
}

function jsonResponse(body, status, origin) {
  const headers = {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
  };

  if (origin) {
    headers["access-control-allow-origin"] = origin;
    headers["access-control-allow-credentials"] = "true";
    headers["access-control-allow-methods"] = "POST, OPTIONS";
    headers["access-control-allow-headers"] = "content-type, authorization, x-request-id";
    headers.vary = "Origin";
  }

  return new Response(JSON.stringify(body), { status, headers });
}

function parseAllowedOrigins(env) {
  const raw = sanitizeString(env.ALLOWED_ORIGINS || "", 2000);
  if (!raw) {
    return [
      "https://dhanur.me",
      "https://www.dhanur.me",
      "http://localhost:1111",
      "http://127.0.0.1:1111",
    ];
  }

  return raw
    .split(",")
    .map((item) => sanitizeString(item, 200))
    .filter(Boolean);
}

function resolveCorsOrigin(request, env) {
  const requestOrigin = sanitizeString(request.headers.get("origin") || "", 300);
  if (!requestOrigin) return "";

  const allowedOrigins = parseAllowedOrigins(env);
  if (allowedOrigins.includes("*")) return requestOrigin;

  if (allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return "";
}

function normalizeHistory(history) {
  if (!Array.isArray(history)) return [];

  return history
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const role = sanitizeString(item.role || "", 20).toLowerCase();
      if (role !== "user" && role !== "assistant") return null;

      const content = sanitizeString(item.content || "", 4000);
      if (!content) return null;

      return { role, content };
    })
    .filter(Boolean)
    .slice(-16);
}

function extractCitations(context) {
  const citations = [];

  const page = context && typeof context.page === "object" ? context.page : null;
  if (page && typeof page.url === "string" && page.url.trim()) {
    const title = sanitizeString(page.title || "Page context", 140) || "Page context";
    const snippet = Array.isArray(page.excerpts)
      ? sanitizeString(page.excerpts.join(" "), 280)
      : "";

    citations.push({
      title,
      url: page.url,
      snippet,
      sourceType: "page",
    });
  }

  const profile = context && typeof context.profile === "object" ? context.profile : null;
  const links = profile && Array.isArray(profile.links) ? profile.links : [];

  links.slice(0, 6).forEach((link) => {
    if (!link || typeof link !== "object") return;
    const href = sanitizeString(link.href || "", 500);
    if (!href) return;

    citations.push({
      title: sanitizeString(link.label || "Profile link", 140) || "Profile link",
      url: href,
      snippet: "",
      sourceType: "profile",
    });
  });

  return citations;
}

function buildPrompt(query, source, context) {
  const parts = [
    "You are Ask AI for dhanur.me.",
    "Use only the supplied context. If context is insufficient, say so clearly.",
    "Respond concisely with practical guidance.",
    `Request source: ${sanitizeString(source || "unknown", 40)}`,
    `Question: ${sanitizeString(query || "", 1000)}`,
    "",
  ];

  if (context && typeof context === "object") {
    const page = context.page && typeof context.page === "object" ? context.page : null;
    const profile = context.profile && typeof context.profile === "object" ? context.profile : null;

    if (page) {
      parts.push("Page context:");
      if (page.title) parts.push(`- Title: ${sanitizeString(page.title, 200)}`);
      if (page.url) parts.push(`- URL: ${sanitizeString(page.url, 400)}`);

      if (Array.isArray(page.headings) && page.headings.length) {
        parts.push("- Headings:");
        page.headings.slice(0, 10).forEach((heading) => {
          const text = sanitizeString(heading && heading.text ? heading.text : "", 180);
          if (!text) return;
          parts.push(`  - ${text}`);
        });
      }

      if (Array.isArray(page.excerpts) && page.excerpts.length) {
        parts.push("- Excerpts:");
        page.excerpts.slice(0, 8).forEach((excerpt) => {
          const text = sanitizeString(excerpt, 280);
          if (!text) return;
          parts.push(`  - ${text}`);
        });
      }
    }

    if (profile) {
      parts.push("", "Profile context:");
      if (profile.role) parts.push(`- Role: ${sanitizeString(profile.role, 120)}`);
      if (profile.summary) parts.push(`- Summary: ${sanitizeString(profile.summary, 600)}`);

      if (Array.isArray(profile.skills) && profile.skills.length) {
        parts.push(`- Skills: ${profile.skills.map((item) => sanitizeString(item, 60)).filter(Boolean).join(", ")}`);
      }
    }
  }

  return parts.join("\n");
}

async function verifyAuth(request, env) {
  const verifyUrl = sanitizeString(env.AUTH_VERIFY_URL || "", 500);
  if (!verifyUrl) {
    throw new HttpError("AUTH_CONFIG_MISSING", "Auth verification is not configured", 500);
  }

  const headers = {
    accept: "application/json",
  };

  const cookie = request.headers.get("cookie");
  if (cookie) headers.cookie = cookie;

  const authorization = request.headers.get("authorization");
  if (authorization) headers.authorization = authorization;

  const response = await fetch(verifyUrl, {
    method: "GET",
    headers,
  });

  if (!response.ok) {
    throw new HttpError("AUTH_UNAVAILABLE", "Auth verification failed", 502);
  }

  const payload = parseJsonSafe(await response.text()) || {};
  const authenticated = Boolean(payload.authenticated);
  const role = sanitizeString(payload.role || "user", 40).toLowerCase() || "user";
  const userId = sanitizeString(payload.userId || payload.sub || "", 120);

  return { authenticated, role, userId };
}

async function chargeCredits(request, env, amount) {
  const safeAmount = clamp(amount, 0, 1000);
  if (safeAmount <= 0) {
    return { charged: false, cost: 0, creditsRemaining: null };
  }

  const chargeUrl = sanitizeString(env.AUTH_CHARGE_URL || "", 500);
  if (!chargeUrl) {
    throw new HttpError("CHARGE_CONFIG_MISSING", "Credit charging is not configured", 500);
  }

  const headers = {
    accept: "application/json",
    "content-type": "application/json",
  };

  const cookie = request.headers.get("cookie");
  if (cookie) headers.cookie = cookie;

  const authorization = request.headers.get("authorization");
  if (authorization) headers.authorization = authorization;

  const serviceToken = sanitizeString(env.AUTH_SERVICE_TOKEN || "", 300);
  if (serviceToken) headers["x-service-token"] = serviceToken;

  const response = await fetch(chargeUrl, {
    method: "POST",
    headers,
    body: JSON.stringify({ amount: safeAmount, reason: "ask_ai" }),
  });

  if (response.status === 402) {
    throw new HttpError("INSUFFICIENT_CREDITS", "Not enough credits to use Ask AI", 402);
  }

  if (!response.ok) {
    throw new HttpError("CHARGE_FAILED", "Unable to charge credits", 502);
  }

  const payload = parseJsonSafe(await response.text()) || {};
  const creditsRemaining = Number(payload.creditsRemaining);

  return {
    charged: true,
    cost: safeAmount,
    creditsRemaining: Number.isFinite(creditsRemaining) ? creditsRemaining : null,
  };
}

async function runGemini(env, prompt, history) {
  const apiKey = sanitizeString(env.GEMINI_API_KEY || "", 500);
  if (!apiKey) {
    throw new HttpError("MODEL_CONFIG_MISSING", "Gemini API key is not configured", 500);
  }

  const model = sanitizeString(env.GEMINI_MODEL || "", 120) || DEFAULT_MODEL;
  const maxOutputTokens = clamp(env.GEMINI_MAX_OUTPUT_TOKENS || DEFAULT_MAX_OUTPUT_TOKENS, 128, 2048);

  const contents = history.map((item) => ({
    role: item.role === "assistant" ? "model" : "user",
    parts: [{ text: item.content }],
  }));

  contents.push({
    role: "user",
    parts: [{ text: prompt }],
  });

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      contents,
      generationConfig: {
        temperature: 0.25,
        topP: 0.9,
        maxOutputTokens,
      },
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new HttpError("MODEL_REQUEST_FAILED", `Gemini request failed: ${text.slice(0, 180)}`, 502);
  }

  const payload = parseJsonSafe(await response.text()) || {};
  const candidate = Array.isArray(payload.candidates) ? payload.candidates[0] : null;
  const parts = candidate && candidate.content && Array.isArray(candidate.content.parts)
    ? candidate.content.parts
    : [];

  const answer = parts
    .map((part) => sanitizeString(part && part.text ? part.text : "", 20000))
    .filter(Boolean)
    .join("\n\n")
    .trim();

  if (!answer) {
    throw new HttpError("EMPTY_MODEL_RESPONSE", "Gemini returned an empty answer", 502);
  }

  return answer;
}

async function handleAsk(request, env, origin) {
  const body = parseJsonSafe(await request.text());
  if (!body || typeof body !== "object") {
    throw new HttpError("INVALID_REQUEST", "Request body must be valid JSON", 400);
  }

  const query = sanitizeString(body.query || "", 1000);
  if (!query) {
    throw new HttpError("INVALID_QUERY", "query is required", 400);
  }

  const source = sanitizeString(body.source || "search", 80) || "search";
  const context = body.context && typeof body.context === "object" ? body.context : null;
  const history = normalizeHistory(body.history);

  const auth = await verifyAuth(request, env);
  if (!auth.authenticated) {
    throw new HttpError("AUTH_REQUIRED", "Sign in to use Ask AI", 401);
  }

  const role = auth.role === "admin" ? "admin" : "user";
  const cost = role === "admin" ? 0 : clamp(env.CREDIT_COST || DEFAULT_CREDIT_COST, 0, 1000);
  const chargeResult = await chargeCredits(request, env, cost);

  const prompt = buildPrompt(query, source, context);
  const answer = await runGemini(env, prompt, history);
  const citations = extractCitations(context);

  return jsonResponse(
    {
      ok: true,
      answer,
      citations,
      cost: chargeResult.cost,
      creditsRemaining: chargeResult.creditsRemaining,
      role,
      requestId: sanitizeString(request.headers.get("x-request-id") || "", 120),
    },
    200,
    origin,
  );
}

export default {
  async fetch(request, env) {
    const origin = resolveCorsOrigin(request, env);

    if (request.method === "OPTIONS") {
      if (!origin) {
        return jsonResponse({ ok: false, code: "CORS_DENIED", message: "Origin not allowed" }, 403, "");
      }

      return jsonResponse({ ok: true }, 204, origin);
    }

    if (!origin) {
      return jsonResponse({ ok: false, code: "CORS_DENIED", message: "Origin not allowed" }, 403, "");
    }

    const url = new URL(request.url);
    if (request.method !== "POST" || (url.pathname !== "/v1/ask" && url.pathname !== "/ask")) {
      return jsonResponse({ ok: false, code: "NOT_FOUND", message: "Not found" }, 404, origin);
    }

    try {
      return await handleAsk(request, env, origin);
    } catch (error) {
      if (error instanceof HttpError) {
        return jsonResponse(
          {
            ok: false,
            code: error.code,
            message: error.message,
          },
          error.status,
          origin,
        );
      }

      return jsonResponse(
        {
          ok: false,
          code: "INTERNAL_ERROR",
          message: "Ask AI request failed",
        },
        500,
        origin,
      );
    }
  },
};
