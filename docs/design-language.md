# Design language

Visual system for this site and sibling projects: **Zola + Tailwind CSS v4 + DaisyUI**, light/dark. Primary references: **GitHub** (layout, neutrals, borders) and **Medium** (prose rhythm, list clarity, reading comfort).

## Stack order

1. **DaisyUI first** — Components (`btn`, `card`, `badge`, `navbar`, `menu`) and theme variables (`--radius-*`, `--color-*`, `rounded-box`).
2. **Tailwind second** — Layout, spacing, typography utilities.
3. **Plain CSS last** — Scrollbars, `color-mix`, or cases utilities cannot express.

## Layout model (GitHub-style)

| Layer | Role | Typical token/class |
|-------|------|---------------------|
| **Shell** | Page field behind everything | `html` / `drawer-content`: `bg-base-200` |
| **Chrome** | Top bar + left nav | Navbar: `bg-base-200/95`. Drawer side: `bg-[var(--color-sidebar)]` (same family as `base-200`) |
| **Pane** | Article / main reading column | `bg-base-100`, often inside a `rounded-box` + light `border` + `shadow-sm` so the column reads as a sheet on the shell |

Avoid making the navbar and sidebar pure `base-100` when the article is also `base-100` — you lose hierarchy. The **content pane** should be the brightest (light) or clearest contrast block (dark); chrome sits one step “back.”

## Themes

- Themes: **`light`** and **`dark`** only.
- Do **not** brand via hand-edited `src/vendor/daisyui.js` / `src/vendor/daisyui-theme.js` (CI overwrites them). Use [`src/theme-system.css`](../src/theme-system.css).

### Light (GitHub-adjacent)

- `base-100`: **#ffffff** — primary content surface.
- `base-200` / sidebar: **#f6f8fa** — app chrome.
- `base-300`: **#d0d7de** — hairlines, inputs.
- `base-content`: **#1f2328** — body text.

### Dark (GitHub-adjacent)

- `base-100`: **#0d1117** — main pane.
- `base-200` / sidebar: **#161b22**.
- `base-300`: **#30363d**.
- `base-content`: **#e6edf3**.

Semantic colors (`info`, `success`, `warning`, `error`) follow GitHub’s accessible hues in theme tokens.

## Radius

Theme variables (slightly softened — not sharp, not pill-heavy):

- `--radius-box`, `--radius-field`, `--radius-selector`: **0.375rem** (~6px).

Use **`rounded-box`** for cards/panels, **`rounded-md`** for nested controls and chips, **`rounded-full`** only for avatars and true circles.

## Featured links / CTAs

Do **not** use full foreground/background inversion (solid `base-content` on `base-100`) for large blocks — it reads as a “hole” and overwhelms the page.

Use a **tint** instead: `color-mix` of `base-content` into `base-100` at ~10–14% with a visible border (see `.link-card-contrast` in [`src/components.css`](../src/components.css)).

## Structural borders

Prefer **`border-base-content/10`–`/20`**, not raw `gray-*`, so borders track the theme.

## Prose & lists (Medium-style)

- Markdown **`ul` / `ol`** under `main.prose` use **real markers** (`disc` / `decimal`), comfortable **`line-height`**, and **`space-y`** via `mb-2` on items.
- **Never** apply global `main ul li::before` “fake bullets” — it breaks `.card` layouts and menus.
- Lists inside **`.card`**, **`.not-prose`**, **`.menu`**, **`.toc-menu`**: `list-style: none` and no pseudo-bullets.

## Elevation & motion

- Prefer **`shadow-sm` / `shadow-md`**; skip heavy `shadow-2xl` except rare hero moments.
- Transitions: **`transition-colors`**, **~200ms**; avoid large **`scale`** on primary navigation and cards.

## Typography

- Body: Pretendard + system stack ([`src/typography.css`](../src/typography.css)).
- In-paragraph links: bottom border underline pattern already defined on `main` content links.
- Side nav / TOC labels: small caps, **`tracking-wider`**, muted `text-base-content/50` — scannable like GitHub’s meta labels.

## Checklist for new UI

- [ ] Chrome vs pane: is this sitting on `base-200` with content on `base-100`?
- [ ] Borders use `base-content` opacity scales.
- [ ] Radius uses theme-driven `rounded-box` / `rounded-md`.
- [ ] Large CTAs use **tint**, not full inverse fill.
- [ ] Lists: if not in `.prose`, explicitly `not-prose` or card-safe styles.
- [ ] Verified in **light** and **dark**.

## Build

```bash
tailwindcss -i src/main.css -o static/css/main.css --minify
zola build
```

CI refreshes Daisy plugin files; keep product tokens in `src/theme-system.css` and modular `src/*.css`.
