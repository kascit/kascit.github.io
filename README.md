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
```

### Build for Production

```bash
just build    # Clean, CSS minify, Zola build
```

### Generated Content Pipeline

Project pages and widget data are generated artifacts tracked in this repo.

```bash
just project-pages   # Validate data/projects.json and sync content/projects/*.md
just widget-data     # Regenerate static/widgets/latest-posts-data.json
```

CI and deploy workflows enforce that generated files are committed.

## Available Commands

```bash
just          # List all commands

# Development
just dev      # Full dev mode (CSS + Zola server)
just watch    # CSS watch mode

# Build & Deploy
just build    # Production build (clean + CSS + Zola)
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

- Content Security Policy (CSP) hardened
- HSTS + X-Frame-Options enabled
- No unsafe-inline scripts
- All external resources allowlisted

## PWA

- Service Worker for offline support
- Periodic content sync
- Web app installable
- Notification support (user-initiated)

## License

MIT
