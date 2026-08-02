# SYSTEM DIRECTIVES

SYSTEM DIRECTIVES
- Stop if ambiguous; ask for clarification.
- Write minimal code; zero preemptive abstraction; surgical edits only.
- Output caveman style: high info density, drop filler.
- Synchronously update this file when repository conventions change.

Git & WORKFLOWS
- Main branch protected. Push via feature branches.
- Automated chore PRs auto-merge when CI passes.
- GPG signature required for all commits (`git_commit_gpgsign: true`). Explicit author/committer matching GPG key required in bot workflows.

ENV
- OS: Win 11 (PowerShell) / GitHub Actions (Ubuntu Bash).
- Edit ONLY: content/, templates/, src/, static/, scripts/, .github/, justfile, versions.env.
- IGNORE generated: public/, resources/, static/css/main.css, static/css/dui.css, tools/tailwindcss*, src/vendor/daisyui*.js.

BUILD & TOOLING
- Task runner: `just` (never run raw build commands).
- Package manager: pnpm (corepack-activated).
- Versions: `versions.env` = single source of truth. Pin ALL tools (NODE, PNPM, JUST, ZOLA, TAILWIND, DAISYUI, etc.). No `latest`.
- CI setup: `.github/actions/setup-build-env/action.yml` handles Node, pnpm, just, Zola, ImageMagick.
- Shared build utils: `scripts/lib/shared.js`.
- Sync pipeline: `just project-pages`, `just widget-data`, `just sync-generated`.

JS ARCHITECTURE (domain-driven under static/js/)
- core/ → boot.js, main.js, config.js, shell.js, theme-engine.js, responsive.js, bootstrap-utils.js
- ui/ → drawer.js, dropdowns.js, tooltips.js, notify-banner.js, code-blocks.js, scroll-top.js, lazy-plugins.js, showcase-rotate.js
- features/ → access-keys.js, toc.js, search-loader.js, clipboard.js, shortcuts.js, keyboard-shortcuts.js, comments.js
- data/ → blog-feed.js, taxonomy-filter.js, taxonomy-playlist.js, taxonomy-subscribe.js, layout-recommendation.js
- telemetry/ → gtag-init.js, cookie-consent.js, cookie-utils.js, external-link-utm.js
- system/ → service-worker.js, webmcp.js, offline-reload.js, auth-integration.js
- vendor/ → fuse.min.js, katex.min.js, mermaid.min.js (do not commit to root static/)
- shell.js → static/js/core/shell.js (fingerprinted pointer)
- sw.js → static/sw.js (not fingerprinted)
- site.webmanifest → static/icons/site.webmanifest (not fingerprinted)

PERFORMANCE DIRECTIVES
- Main thread: Defer non-prepaint JS (`auth`, `cookie-consent`, `service-worker`, `external-link-utm`) post-first-paint using `requestAnimationFrame`/`requestIdleCallback`.
- Zero raw console banner bloat on load.
- Preconnect external origins (`static.cloudflareinsights.com`, `analytics.ahrefs.com`).
- LCP hero images: Use `fetchpriority="high"`, `loading="eager"`, and `<link rel="preload">` to eliminate render delay.
- Fonts: Subset Font Awesome (`font-awesome.subset.css`), set `font-display: swap`.

ICONS & PWA
- Source icon: `static/icons/favicon.svg` (only committed icon file beside `site.webmanifest`).
- Build step: `scripts/generate-icons.js` generates PNGs/ICOs into `public/icons/`.
- Manifest icons:
  - `purpose: "any"` -> `/icons/icon-192x192-transparent.png` & `/icons/icon-512x512-transparent.png`.
  - `purpose: "maskable"` -> `/icons/icon-192x192-maskable.png` & `/icons/icon-512x512-maskable.png`.
- WCO: `display_override` starts with `window-controls-overlay`. `orientation: any`.

SECURITY & HYGIENE
- DOM: `textContent` over `innerHTML`. Guard URLs (`http:`, `https:` only).
- Network: `AbortController` + timeout for fetches. Cleanup on pagehide/beforeunload.
- `webmcp.js`: `TOOL_REGISTRY` uses `Map` lookup (`SAFE_TOOL_MAP.has() / .get()`).
- Host validation: Use `URL` constructor + hostname comparison.
