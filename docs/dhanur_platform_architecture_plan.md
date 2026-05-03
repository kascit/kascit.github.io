# Dhanur Platform Architecture Plan (Condensed + Main Roadmap)

## 1) What is already done in this repo

### Taxonomy and generation pipeline
- Fixed taxonomy rendering regressions where project tags were derived from non-taxonomy fields.
- Project pages now generate with the project template path expected by taxonomy rendering.
- Added canonical taxonomy rule source:
  - `data/taxonomy-rules.json`
- Added shared taxonomy utility layer:
  - `scripts/lib/taxonomy.js`
- Added/updated sync scripts:
  - `scripts/sync-about-skill-tags.js`
  - `scripts/sync-blog-taxonomies.js`
  - `scripts/sync-project-data.js`
  - `scripts/sync-project-pages.js`
  - `scripts/validate-project-data.js`
- Pipeline policy clarified:
  - Deterministic default generated pipeline is `project-pages + about-skill-tags + widget-data`
  - One-off maintenance scripts remain explicit (`blog-taxonomies`, `project-data`) to avoid accidental content rewrites/network-coupled CI

### Ask AI foundation
- Existing Ask AI frontend path is config-driven and auth-gated.
- Added session-only history support in frontend:
  - `static/js/system/ask-ai.js`
  - `requestAskAiAnswer()` (POST JSON flow)
  - `getAskAiSessionHistory()` and clear helper
- Added backend request/response contract doc:
  - `docs/ask_ai_worker_contract.md`
- Added Cloudflare Worker scaffold for Gemini + auth + credits:
  - `tools/cloudflare/ask-ai-gemini-worker.js`
- Policy currently encoded in worker contract:
  - guest denied
  - user charged (default 20)
  - admin unlimited

## 2) Core platform direction for dhanur.me + subdomains

## Goals
- Keep `kascit.github.io` as fast SSG base and shared shell entrypoint.
- Reuse auth/credits/capability plumbing across `*.dhanur.me` without per-app duplication.
- Preserve plug-and-play DX with strict security and predictable latency.

## Recommended architecture (industry-grade, optimized)

### A. Control Plane (shared platform metadata)
- **Capability Registry Service** (small API, can live in authy initially)
  - Stores what each app exports and which versions are active.
  - Returns signed manifest per app and environment.
- **Policy Service** (can be module in authy at first)
  - Central rules for roles, credits, and feature entitlements.

### B. Identity + Billing Plane
- **Auth Service (authy)**
  - Session issuance, token introspection, role resolution.
- **Credits Ledger Service**
  - Authoritative balance + immutable usage ledger.
  - Supports idempotent debit by request id.
  - Optional reserve/commit pattern for expensive operations.

### C. Execution Plane
- **Edge Gateway (Cloudflare Worker layer)**
  - Validates auth, enforces credit policy, rate limits, routes to LLM/provider APIs.
  - Does not trust browser for billing decisions.
- **Feature Workers/Microservices**
  - Ask AI, search enrichment, summarization, etc.

### D. Client Plane
- **Shell Runtime (`shell.js`)**
  - Loads one signed capability manifest from registry.
  - Dynamically imports only required feature modules.
  - Caches manifest short-term in memory/session with ETag support.

## 3) Do not do wildcard runtime scans from browser

Do not implement: `shell.js checks all *.dhanur.me/export/exposed-functionality.js`

Why not:
- DNS/CORS fanout overhead and variable latency.
- Larger attack surface (discovery and tampering vectors).
- Unbounded boot-time behavior and hard-to-debug failures.

Do this instead:
- One registry endpoint, for example:
  - `https://auth.dhanur.me/platform/manifest?app=linkr&env=prod`
- Response includes:
  - allowed capabilities
  - module URLs
  - required scopes
  - version
  - signature/hash
- Shell validates signature/hash before loading modules.

## 4) Plug-and-play contract for subdomain apps

Each app provides a small static export package, but registry decides activation.

### Suggested app export shape
- `/export/capabilities.json`
  - metadata: app name, version, capabilities list, required scopes
- `/export/modules/<capability>.js`
  - ESM module with stable interface (`init`, `teardown`, optional `onAuthChanged`)

### Registry manifest shape (signed)
- app id
- manifest version
- active capabilities
- module URLs
- required scopes and minimum role
- integrity hashes
- ttl
- signature

## 5) Credits model that scales safely

## Principles
- Debit only server-side after auth verification.
- Every debit call must have idempotency key (`requestId`).
- Keep immutable usage events for audit/replay.

## Suggested API flow for billable action (Ask AI)
1. Client sends request to edge gateway with `requestId`.
2. Gateway verifies session with auth service.
3. Gateway checks entitlement and current balance with credits service.
4. Gateway debits via idempotent `POST /credits/debit`.
5. Gateway executes provider call (Gemini).
6. Gateway returns answer + citations + `creditsRemaining`.

### Data entities
- `account`
- `credit_wallet`
- `credit_transaction` (immutable)
- `usage_event` (feature-level telemetry)

### Minimum transaction fields
- `transactionId`
- `requestId` (idempotency)
- `accountId`
- `feature`
- `amount`
- `status`
- `createdAt`
- `metadata` (provider, model, latency)

## 6) Security and performance guardrails

## Security
- Signed manifest verification in shell before dynamic import.
- Strict allowlist of capability origins.
- Short-lived tokens or HttpOnly sessions for browser.
- Edge-level rate limiting per user + per IP.
- Service-to-service auth for credit debit endpoints.

## Performance
- One control-plane manifest fetch on boot (cached + ETag).
- Lazy-load capability modules only when needed.
- Keep shell payload small and stable.
- Put high-traffic checks at edge; avoid chatty cross-service calls.

## Reliability
- Circuit breaker on model providers.
- Graceful degradation paths (feature unavailable, no credit, auth expired).
- Structured error codes standardized across services.

## 7) Recommended phased rollout

## Phase 0: Stabilize current foundation
- Keep current deterministic generation workflow in CI.
- Wire Ask AI UI to `requestAskAiAnswer()` path.
- Deploy worker contract with real auth verify + debit endpoints.

## Phase 1: Platform primitives
- Implement capability registry endpoint in authy.
- Add manifest signing and shell verification.
- Add credits ledger idempotent debit endpoint.

## Phase 2: Productize plug-and-play
- Standardize capability module interface across apps.
- Add app onboarding checklist and template export package.
- Add platform telemetry dashboard (credits, failures, latency).

## Phase 3: Hardening
- Add replay-safe transaction reconciliation job.
- Multi-provider fallback (Gemini primary, secondary provider optional).
- SLOs and error budgets per capability.

## 8) Immediate next implementation tasks (practical)

1. In `authy`, add:
   - `GET /auth/verify`
   - `POST /credits/debit` (idempotent)
   - `GET /platform/manifest`
2. In worker env, set:
   - `AUTH_VERIFY_URL`
   - `AUTH_CHARGE_URL`
   - `AUTH_SERVICE_TOKEN`
   - `GEMINI_API_KEY`
   - `CREDIT_COST`
3. In this repo config, set Ask AI endpoint to worker route.
4. Upgrade D+K modal from action-link mode to inline chat mode using session-only history from `ask-ai.js`.

## 9) Key decisions still needed from you

1. Do you want credits as a **global wallet per user** across all apps, or per-app wallets with optional shared pool?
2. Do admins bypass both credits and rate limits, or only credits?
3. Do you want capability manifest signed with asymmetric keys now, or start with HMAC and migrate later?
4. Preferred primary data store for authy/credits (Postgres recommended)?
5. Do you want audit logs retained for 30, 90, or 365 days?
