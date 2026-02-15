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

- Windows (PowerShell 5.1+)
- [Zola](https://www.getzola.org/documentation/getting-started/installation/) installed

### First Time

```bash
just setup    # Downloads Tailwind CSS and DaisyUI
just dev      # Starts dev server with hot-reload
```

### Daily Development

```bash
just dev      # CSS build + Zola dev server
just open     # Open site in browser
```

### Build for Production

```bash
just build    # Clean, CSS minify, Zola build
just stats    # Build + show file statistics
```

## Available Commands

```bash
just          # List all commands

# Development
just dev      # Full dev mode (CSS + Zola server)
just watch    # CSS watch mode
just open     # Open in browser

# Build & Deploy
just build    # Production build (clean + CSS + Zola)
just stats    # Build with statistics
just clean    # Remove build artifacts

# Maintenance
just update   # Update Tailwind CSS and DaisyUI
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
│   └── daisyui.js   # DaisyUI plugin
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
