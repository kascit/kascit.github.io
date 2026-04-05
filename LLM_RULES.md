# LLM Rules

Non-negotiable rules for this repo.

0. the terminal/shell is git bash in win 11
1. Never commit secrets, tokens, credentials, or private keys.
2. Do not add Node or npm tooling unless explicitly requested.
3. Do not auto-format files in templates/.
4. Keep edits minimal and scoped; no unrelated churn.
5. Use just recipes for project tasks (dev, build, css, clean, doctor).
6. Treat versions.env as the single source of truth for tool versions.
7. Edit source files only (content/, templates/, src/, static/); do not manually edit public/.
8. Never commit generated artifacts: public/, resources/, static/css/main.css, tools/tailwindcss(.exe), src/vendor/daisyui*.js.
9. Keep GitHub workflows reproducible: pin versions, avoid latest tags.
10. If a convention changes, update this file in the same change.
11. Do not combine DaisyUI tooltips (`data-tip`) with `title` attributes on the same control.
12. Use explicit mount selectors (e.g., `data-*-mount`) for JS injections; avoid generic ids that can collide with markdown heading ids.
13. For desktop/mobile feature gating, reuse `static/js/modules/responsive.js`; avoid ad-hoc breakpoint logic.
14. Use `not-prose` in markup, not inside `@apply`.
15. Keep TOC/rail toggle placement controlled by `src/layout.css` variables, not hardcoded template offsets.
16. Do not inject untrusted content with `innerHTML`; use DOM construction with `textContent` for dynamic text.
17. Guard dynamic URLs before rendering in `href`/`src`; reject unsafe schemes (e.g., `javascript:`).
18. For shell/HTML bootstrap fetches on navigable pages, use `AbortController` and clean up on `pagehide`/`beforeunload`.
19. For reusable Tera helper logic, prefer separate imported macro files over deep same-file macro chaining.
20. `dhanur.me` is the static Zola host; treat `shell.js` as integration runtime for non-static `*.dhanur.me` apps and keep it backward-compatible for embedded usage.
21. Shell bootstrap network calls must be bounded (abort + timeout) so dynamic subdomain apps do not hang waiting on remote navbar fetches.
22. `data/projects.json` is the source of truth for project detail content; run validator + sync (`just project-pages`) before builds and commit generated `content/projects/*.md` changes.
23. `static/widgets/latest-posts-data.json` is generated content; refresh with `just widget-data` and commit drift.
24. Keep 404 rendering template-driven via `templates/404.html`; do not replace it with a content page at `content/404.md` because it can produce a conflicting `public/404.html/` directory output.
25. Keep CI/deploy build orchestration centralized in `justfile` (`just ci-build`) instead of duplicating build logic across workflow YAML steps.
26. Keep taxonomy simple: About tags are synced into `content/about.md` frontmatter from `tag_chip` entries, and Project tags live directly on generated `content/projects/*.md` pages from `data/projects.json`.
