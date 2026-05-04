SYSTEM DIRECTIVES
stop if ambiguous. ask for clarification.
write minimal code. zero preemptive abstraction.
surgical edits only. zero unrelated churn.
output caveman style: drop filler words, maximize information density.
update this file synchronously if conventions change.

ENV
os: win 11 / github actions ubuntu.
shell: powershell locally. bash in CI.
edit ONLY: content/, templates/, src/, static/, scripts/, .github/, justfile, versions.env.
IGNORE generated: public/, resources/, static/css/main.css, static/css/dui.css, tools/tailwindcss*, src/vendor/daisyui*.js.

BUILD
task runner: `just`. all automation goes through justfile. never run raw build commands directly.
package manager: pnpm (not npm). corepack-activated in CI.
versions: versions.env = single source of truth. pin ALL tools (NODE, PNPM, JUST, ZOLA, TAILWIND, DAISYUI, etc). never use `latest`.
CI: .github/workflows/ → .github/actions/setup-build-env/action.yml handles all env setup (node, pnpm, just, zola, apt).
shared build utils: scripts/lib/shared.js. no duplication across scripts.
sync pipeline: `just project-pages` (data/projects.json → content/projects/*.md), `just widget-data` (static/widgets/latest-posts-data.json).
taxonomy: about tags → content/about.md frontmatter. project tags → projects.json.

JS STRUCTURE (domain-driven, all under static/js/)
core/      → boot.js, main.js, config.js, shell.js, theme-engine.js, responsive.js, resource-loader.js
ui/        → drawer.js, dropdowns.js, tooltips.js, notify-banner.js, code-blocks.js, scroll-top.js, lazy-plugins.js, showcase-rotate.js
features/  → access-keys.js, toc.js, search-loader.js, clipboard.js, shortcuts.js, keyboard-shortcuts.js, comments.js
data/      → blog-feed.js, taxonomy-filter.js, taxonomy-playlist.js, taxonomy-subscribe.js, layout-recommendation.js
telemetry/ → gtag-init.js, cookie-consent.js, cookie-utils.js, external-link-utm.js
system/    → service-worker.js, webmcp.js, offline-reload.js, auth-integration.js
vendor/    → fuse.min.js, katex.min.js, mermaid.min.js (never commit to root static/)
shell.js   → static/js/shell.js is the stable loader pointer (rewritten by fingerprinter to latest hash)
sw.js      → static/sw.js (NOT fingerprinted, stays at /sw.js forever)
site.webmanifest → static/icons/site.webmanifest (NOT fingerprinted)

ICONS
source: static/icons/favicon.svg (only committed file beside site.webmanifest)
all PNGs/ICOs: generated at build time into public/icons/ by scripts/generate-icons.js
static/icons/*.png and *.ico are gitignored — never commit them

SECURITY
NO secrets committed.
DOM: use textContent. NO innerHTML. guard URLs, reject `javascript:`.
network: fetches require AbortController + timeout. cleanup on pagehide/beforeunload.
webmcp.js TOOL_REGISTRY: must use a Map lookup (SAFE_TOOL_MAP.has() / .get()) to prevent prototype-chain dispatch and satisfy CodeQL static analysis.
URL checks: use URL constructor + hostname comparison. never substring includes() for host validation.
subdomains (*.dhanur.me): shell.js handles integration. bootstrap fetches must not hang.

FRONTEND
selectors: data-*-mount ONLY for JS mount points. no generic IDs except well-known ones (toc-sidebar, blog-layout, etc).
responsive: use static/js/core/responsive.js helpers. no ad-hoc breakpoints in JS.
daisyUI: data-tip XOR title. never both.
typography: HTML class="not-prose". NO CSS @apply not-prose.
access-keys: SEMANTIC_RULES in access-keys.js = single source of truth for keyboard hints. no data-hint in templates except override cases. elements inside [data-toc-sidebar] are excluded from semantic rules (internal anchors).
TOC: single initToc() from toc.js covers ALL pages (blog, archive, taxonomy). getTocLink uses href$=#id for full-URL zola children AND data-toc-id for summary parents AND bare #id for archive anchors.
notify-banner: path is js/ui/notify-banner.js (not root-level js/).

ZOLA / TERA
NO auto-format in templates/.
macros: import separate files. no deep same-file chaining.
404 routing: templates/404.html ONLY. no content/404.md.
offline page: templates/offline.html (no content/offline.md).
404 + offline layout: _force_rail=true in base.html → use_fit_shell=true + has_layout_rail=true + empty #toc-sidebar nav (aria-label="Page tools") for full structural parity. Toggle button label is "Hide/Show tools rail" (not "table of contents"). offline page must have force_rail=true in [extra].
CSP: no inline style="" attributes. use CSS classes. JS DOM manipulation toggles classes only.

SEO / SCHEMA
article JSON-LD: author Person must include both name AND url (→ /about/).
rich results: run Google Rich Results Test after schema changes.

PWA
sw.js: handles install, activate, fetch (cache-first for assets, stale-while-revalidate for HTML), push, periodicsync, sync, notificationclick, widgetinstall, widgetresume.
service-worker.js: registers sw.js, calls requestNotificationPermission() after SW ready, registers periodicSync + backgroundSync.
manifest icons: SVG (any) + 192/512 PNG (any) + 192/512 PNG (maskable) + apple-touch-icon 180x180. no monochrome/dark duplicates in manifest.
WCO: display_override starts with window-controls-overlay. orientation: any.