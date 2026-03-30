# LLM Rules

This repo is a Zola static site with Tailwind CLI + DaisyUI, deployed to GitHub Pages via Actions. any convention change should just be reflected in this file, do not change any other file

## Absolute Rules
1. **Never commit secrets**
2. **Never add Node/npm unless explicitly asked**
3. **Never reformat `templates/` automatically**
4. **Keep GitHub Actions reproducible** (pin versions, avoid `latest`)
5. **Prefer minimal changes** — do not churn files

## Build System
- Entry: `just` (see `justfile`)
- Dev: `just dev`
- Build: `just build`
- Versions: defined in `versions.env` (single source of truth for all tools)

## Project Structure
- `content/` — Markdown content
- `templates/` — Zola/Tera templates (do not auto-format)
- `static/` — Static assets (CSS, JS, fonts, images)
- `src/` — Source CSS + Tailwind config
- `config.toml` — Zola configuration
- `justfile` — Build automation

## Build Outputs
- CSS build output: `static/css/main.css`
- Tailwind CLI input: `src/main.css`
- Zola output directory: `public/`

## Generated Files (never commit)
- `public/`
- `resources/`
- `static/css/main.css`
- `src/tailwindcss(.exe)`
- `src/daisyui*.js`

## GitHub Actions
- CI: `.github/workflows/ci.yml` — runs on PRs
- Deploy: `.github/workflows/deploy.yml` — runs on main
- Version bumps: `.github/workflows/bump-versions.yml` — weekly scheduled
- All workflows read versions from `versions.env`
