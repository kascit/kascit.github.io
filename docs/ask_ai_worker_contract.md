# Ask AI Worker Contract

This document defines the request and response contract for the Cloudflare Worker in `tools/cloudflare/ask-ai-gemini-worker.js`.

## Endpoint

- Method: `POST`
- Path: `/v1/ask` (also accepts `/ask`)
- Content-Type: `application/json`
- Credentials: send cookies (`credentials: include`) so auth can be verified server-side.

## Request Shape

```json
{
  "query": "How did you build this project?",
  "source": "search-modal",
  "ctxKey": "optional-session-context-key",
  "context": {
    "page": {
      "title": "...",
      "url": "/projects/example/",
      "headings": [{ "level": 2, "text": "Overview" }],
      "excerpts": ["..."]
    },
    "profile": {
      "role": "...",
      "summary": "...",
      "skills": ["..."],
      "links": [{ "label": "GitHub", "href": "/links/" }]
    }
  },
  "history": [
    { "role": "user", "content": "previous question" },
    { "role": "assistant", "content": "previous answer" }
  ]
}
```

## Success Response

```json
{
  "ok": true,
  "answer": "...",
  "citations": [
    {
      "title": "Page context",
      "url": "/projects/example/",
      "snippet": "...",
      "sourceType": "page"
    }
  ],
  "cost": 20,
  "creditsRemaining": 380,
  "role": "user",
  "requestId": "optional-request-id"
}
```

## Error Response

```json
{
  "ok": false,
  "code": "INSUFFICIENT_CREDITS",
  "message": "Not enough credits to use Ask AI"
}
```

Common error codes:

- `AUTH_REQUIRED` (401)
- `INSUFFICIENT_CREDITS` (402)
- `RATE_LIMITED` (429 when added by upstream/auth)
- `MODEL_REQUEST_FAILED` (502)
- `INTERNAL_ERROR` (500)

## Credit Policy

- Guests: denied (`401 AUTH_REQUIRED`)
- Logged-in users: charged `CREDIT_COST` (default `20`) per call
- Admins (`role=admin`): no credit charge

## Required Worker Environment Variables

- `AUTH_VERIFY_URL`: auth status endpoint used by worker to verify session
- `AUTH_CHARGE_URL`: endpoint that debits user credits
- `AUTH_SERVICE_TOKEN`: optional shared secret header for credit endpoint
- `GEMINI_API_KEY`: Gemini API key

Optional:

- `GEMINI_MODEL` (default `gemini-2.0-flash-lite`)
- `GEMINI_MAX_OUTPUT_TOKENS` (default `700`)
- `CREDIT_COST` (default `20`)
- `ALLOWED_ORIGINS` (comma-separated list for CORS)
