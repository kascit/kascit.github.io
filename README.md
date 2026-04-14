# kascit.github.io

Personal website built with Zola, Tailwind CSS v4, and DaisyUI v5.

## Quick Start

Prerequisites:

- [Zola](https://www.getzola.org/documentation/getting-started/installation/)
- `just`

Run:

```bash
just setup
just dev
```

## Common Commands

```bash
just dev         # full dev loop
just dev-fast    # skip generated-content refresh
just build       # production build
just ci-build    # CI-equivalent build and validation
just check       # local quality checks
just clean       # remove build output
just help        # command overview
```

## Generated Content

Some files are generated and tracked in git:

- `content/projects/*.md` from `data/projects.json`
- `static/widgets/latest-posts-data.json`

Refresh before build/commit when relevant:

```bash
just project-pages
just widget-data
```

CI/deploy workflows enforce generated-content consistency.

## Project Layout

- `content/`: markdown content
- `templates/`: Zola templates, macros, shortcodes
- `static/`: static assets served as-is
- `src/`: source CSS
- `data/`: structured source data
- `scripts/`: build and validation scripts
- `justfile`: command entrypoint

## Runtime Notes

- Security headers and CSP are enabled; Cloudflare worker source: `tools/cloudflare/csp-meta-handoff-worker.js`
- PWA support is enabled (service worker, installability, notifications)

Stable integration entrypoints:

- Shell loader: [/js/shell.js](js/shell.js)
- Service worker loader: [/sw.js](sw.js)

```html
<script type="module" src="https://dhanur.me/js/shell.js"></script>
```

## Raw Mirror Endpoints (Bot-Safe)

If Cloudflare blocks a bot or GitHub Action, use raw mirror URLs.

- RSS: `https://raw.githubusercontent.com/kascit/kascit.github.io/raw-mirror/rss.xml`

Mirror publishing:

- Workflow: `.github/workflows/raw-mirror.yml`
- Manifest: `.github/raw-mirror-paths.txt` (paths relative to `public/`)

Example: add `sitemap.xml` to the manifest, then use
`https://raw.githubusercontent.com/kascit/kascit.github.io/raw-mirror/sitemap.xml`.

## License

MIT
