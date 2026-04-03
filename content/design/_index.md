+++
title = "Design System"
description = "Design language and integration notes for the dhanur.me shell and component system"
sort_by = "weight"
in_search_index = true

[extra]
hide_toc = false
+++

This page is now intentionally Markdown-first. Instead of embedding large blocks of raw HTML inside content files, the design system is documented as guidance, examples, and reusable shortcodes so the source stays readable and maintainable.

## Design Language

The visual system is built around semantic color tokens, predictable spacing, and component primitives from DaisyUI layered with custom styles. Theme state is shared across subdomains through a single cookie so users keep a consistent dark or light preference everywhere.

{{ link_card(url="https://github.com/kascit/kascit.github.io/blob/main/docs/design-language.md", external=true, icon="fa-solid fa-palette", title="Design Language Doc", description="Color tokens, typography, spacing, motion, and component behavior.", contrast=true) }}

## Integration Model

The quickest integration path is to include the shared shell script and configure navigation before load with SiteNavConfig when needed. The shell handles layout injection, shared theme behavior, icon styles, and cross-site navigation so each app can focus on product logic.

```html
<script>
  window.SiteNavConfig = {
    mode: "full",
    nav: [
      { name: "Docs", url: "/docs/", icon: "fa-solid fa-book" },
      { name: "API", url: "/api/", icon: "fa-solid fa-code" }
    ],
    showThemeToggle: true
  };
</script>
<script src="https://dhanur.me/js/shell.js" defer></script>
```

If you do not need overrides, a single script tag is enough and defaults will be used automatically.

```html
<script src="https://dhanur.me/js/shell.js" defer></script>
```

{{ link_card(url="https://github.com/kascit/kascit.github.io/blob/main/docs/design_system_integration_guide.md", external=true, icon="fa-solid fa-book-open", title="Integration Guide", description="Setup details, architecture notes, and implementation references.") }}

## Working With Components

Components should be consumed through shortcodes in Markdown wherever possible. This keeps content files focused on copy and structure while presentation logic stays centralized in templates, making future style updates safer and faster.

For content pages, prefer shortcode primitives such as link_card, project_card, stat, and card. For product pages or apps, use the shell and shared CSS tokens, then layer app-specific styles only where necessary.

## Practical Notes

When adding new UI patterns, favor semantic naming over page-specific hacks so components can be reused across sections. Keep content prose in Markdown, push visual complexity into shortcodes, and treat docs updates as part of every UI change so the system remains coherent over time.
