# Project Structure

This document outlines the high-level architecture of `kascit.github.io`.

## Overview
This is a static site built with [Zola](https://www.getzola.org/), utilizing Tailwind CSS v4 and DaisyUI v5 for styling.

## Directory Layout

- `/content/`: The Markdown content of the site (blog posts, pages, etc.). Follows Zola's standard structure.
- `/src/`: Source files for styling. `main.css` is the entry point for Tailwind CSS, importing other modules like `components.css`, `layout.css`, etc.
- `/static/`: Pre-compiled and static assets.
  - `/static/css/`: Output destination for compiled CSS (e.g., from Tailwind). Also contains vendor CSS.
  - `/static/js/`: Client-side JavaScript logic.
  - `/static/fonts/` & `/static/webfonts/`: Locally hosted fonts (e.g., FontAwesome, Pretendard).
  - `/static/images/` & `/static/icons/`: Visual assets and favicons.
- `/templates/`: Zola HTML templates.
  - `/templates/macros/`: Reusable HTML components (header, footer, head, etc.).
  - `/templates/shortcodes/`: Custom HTML components that can be embedded directly within Markdown content.
- `config.toml`: The main configuration file for Zola.
- `justfile`: The command runner file (replaces Makefile), used for setup, development (`just dev`), and building the site.

## Build Flow
1. **Setup**: Run `just setup` to download Tailwind CLI, DaisyUI, FontAwesome, etc.
2. **Develop**: Run `just dev` to concurrently watch Tailwind CSS and serve the Zola site.
3. **Build**: Run `just build` to minify CSS and generate the static site in the `/public/` directory.
