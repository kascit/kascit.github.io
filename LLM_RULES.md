# LLM Rules

Non-negotiable rules for this repo.

1. Never commit secrets, tokens, credentials, or private keys.
2. Do not add Node or npm tooling unless explicitly requested.
3. Do not auto-format files in templates/.
4. Keep edits minimal and scoped; no unrelated churn.
5. Use just recipes for project tasks (dev, build, css, clean, doctor).
6. Treat versions.env as the single source of truth for tool versions.
7. Edit source files only (content/, templates/, src/, static/); do not manually edit public/.
8. Never commit generated artifacts: public/, resources/, static/css/main.css, src/tailwindcss(.exe), src/daisyui*.js.
9. Keep GitHub workflows reproducible: pin versions, avoid latest tags.
10. If a convention changes, update this file in the same change.
11. Do not combine DaisyUI tooltips (`data-tip`) with `title` attributes on the same control.
12. Use explicit mount selectors (e.g., `data-*-mount`) for JS injections; avoid generic ids that can collide with markdown heading ids.
13. For desktop/mobile feature gating, reuse `static/js/modules/responsive.js`; avoid ad-hoc breakpoint logic.
14. Use `not-prose` in markup, not inside `@apply`.
15. Keep TOC/rail toggle placement controlled by `src/layout.css` variables, not hardcoded template offsets.
