# kascit.github.io

Personal website built with **Zola** static site generator + **Tailwind CSS** + **DaisyUI**.

## Features

- Fast static site generation with Zola
- Tailwind CSS + DaisyUI components
- Security hardened (CSP, HSTS, CORS headers)
- Fully responsive design
- Dark/Light theme toggle
- PWA with notifications support
- Giscus comments integration
- SEO optimized

## Setup

### Prerequisites

- Windows (PowerShell 5.1+) or Unix-like shell (bash/zsh)
- [Zola](https://www.getzola.org/documentation/getting-started/installation/) installed

### First Time

```bash
just setup    # Downloads Tailwind CSS and DaisyUI
just dev      # Starts dev server with hot-reload
```

### Daily Development

```bash
just dev      # CSS build + Zola dev server
just dev-fast # Faster loop (skips generated-content refresh)
```

### Build for Production

```bash
just build    # Clean, CSS minify, Zola build
just ci-build # CI-grade build: verify generated content, build, JS optimize, validate output
```

### Generated Content Pipeline

Project pages and widget data are generated artifacts tracked in this repo.

```bash
just project-pages   # Validate data/projects.json and sync content/projects/*.md
just widget-data     # Regenerate static/widgets/latest-posts-data.json
```

CI and deploy workflows enforce that generated files are committed.
Both workflows now execute the same build path via `just ci-build`.

## Available Commands

```bash
just          # List all commands
just help     # Curated command center with grouped workflow hints

# Development
just dev      # Full dev mode (CSS + Zola server)
just dev-fast # Fast dev mode (no generated-content refresh)
just watch    # CSS watch mode

# Build & Deploy
just build    # Production build (clean + CSS + Zola)
just ci-build # CI/deploy build pipeline with validation and JS optimization
just check    # Quick local quality checks (generated drift + zola check)
just clean    # Remove build artifacts

# Maintenance
just versions # Show tool versions
just doctor   # Health check
```

## Project Structure

```
.
├── content/          # Markdown content (blog, projects, etc)
├── templates/        # Zola templates + macros
│   ├── macros/      # Reusable components (header, footer, etc)
│   └── shortcodes/  # Custom markdown shortcodes
├── static/          # Static assets (CSS, JS, fonts, images)
│   ├── css/         # Compiled CSS
│   ├── js/          # JavaScript modules
│   └── _headers     # Security headers (Cloudflare)
├── src/             # Source CSS + Tailwind config
│   ├── main.css     # Tailwind entry point
│   ├── layout.css   # Layout styles
│   ├── components.css # Component styles
│   └── vendor/      # Cached DaisyUI plugin files (downloaded by setup/CI)
├── data/            # Structured content sources (projects, etc.)
├── scripts/         # Build and generation scripts
├── config.toml      # Zola configuration
└── justfile         # Build automation
```

## Styling

- **Framework**: Tailwind CSS v4 + DaisyUI v5
- **Themes**: `night` (default) and `lofi` (light)
- **Dark Mode**: Automatic toggle with brightness levels
- **CSS Architecture**: Modular (@import structure)

## Security

- Content Security Policy (CSP) uses meta-tag hand-off fallback + strict nonce Worker policy
- HSTS + X-Frame-Options enabled
- All external resources allowlisted
- Worker source for strict CSP injection: tools/cloudflare/csp-meta-handoff-worker.js

## PWA

- Service Worker for offline support
- Periodic content sync
- Web app installable
- Notification support (user-initiated)

## Stable Loader Endpoints (Fingerprint-Compatible)

Build output fingerprints static assets and keeps stable loader entrypoints for external integration.

- Stable shell loader: [/js/shell.js](js/shell.js)
- Stable service worker loader: [/sw.js](sw.js)

External integration:

```html
<script type="module" src="https://dhanur.me/js/shell.js"></script>
```

The stable loader file stays constant while it imports the current hashed runtime bundle.

## WebMCP Runtime

WebMCP is available in the main site runtime:

- Main site runtime (`/js/main.js`)

Direct API:

```js
await window.WebMCP.call("theme.set", { mode: "dark" });
const state = window.WebMCP.getState();
const tools = window.WebMCP.listTools();
```

Spec-aligned imperative API exposure (for WebMCP inspectors):

- `navigator.modelContext.registerTool(...)`
- `navigator.modelContextTesting.listTools()`
- `navigator.modelContextTesting.executeTool(...)`

postMessage API protocol: `dhanur.webmcp.v1`

- `webmcp.call` -> tool execution
- `webmcp.list` -> list available tools
- `webmcp.state` -> fetch app state snapshot

High-level tool groups include navigation, theme, search, TOC/sidebar controls,
content helpers, playlist navigation, and PWA status.

## License

MIT
