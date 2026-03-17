+++
title = "Design System"
description = "Style guide, component reference, and integration docs for the dhanur.me design system"
sort_by = "weight"
in_search_index = true

[extra]
hide_toc = false
+++

<div class="design-showcase">

<!-- Color Palette -->
<h2 id="colors" class="text-2xl font-bold mt-8 mb-4">Color Palette</h2>

<p class="mb-4 text-base-content/70">Semantic colors adapt to the current theme. Toggle dark/light to see them change.</p>

<div class="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
  <div class="flex flex-col items-center gap-1">
    <div class="w-full h-16 rounded-lg bg-primary"></div>
    <span class="text-xs opacity-60">primary</span>
  </div>
  <div class="flex flex-col items-center gap-1">
    <div class="w-full h-16 rounded-lg bg-secondary"></div>
    <span class="text-xs opacity-60">secondary</span>
  </div>
  <div class="flex flex-col items-center gap-1">
    <div class="w-full h-16 rounded-lg bg-accent"></div>
    <span class="text-xs opacity-60">accent</span>
  </div>
  <div class="flex flex-col items-center gap-1">
    <div class="w-full h-16 rounded-lg bg-neutral"></div>
    <span class="text-xs opacity-60">neutral</span>
  </div>
  <div class="flex flex-col items-center gap-1">
    <div class="w-full h-16 rounded-lg bg-info"></div>
    <span class="text-xs opacity-60">info</span>
  </div>
  <div class="flex flex-col items-center gap-1">
    <div class="w-full h-16 rounded-lg bg-success"></div>
    <span class="text-xs opacity-60">success</span>
  </div>
  <div class="flex flex-col items-center gap-1">
    <div class="w-full h-16 rounded-lg bg-warning"></div>
    <span class="text-xs opacity-60">warning</span>
  </div>
  <div class="flex flex-col items-center gap-1">
    <div class="w-full h-16 rounded-lg bg-error"></div>
    <span class="text-xs opacity-60">error</span>
  </div>
</div>

<h3 class="text-lg font-semibold mb-3">Base colors</h3>
<div class="grid grid-cols-3 gap-3 mb-8">
  <div class="flex flex-col items-center gap-1">
    <div class="w-full h-16 rounded-lg bg-base-100 border border-gray-500/15"></div>
    <span class="text-xs opacity-60">base-100</span>
  </div>
  <div class="flex flex-col items-center gap-1">
    <div class="w-full h-16 rounded-lg bg-base-200"></div>
    <span class="text-xs opacity-60">base-200</span>
  </div>
  <div class="flex flex-col items-center gap-1">
    <div class="w-full h-16 rounded-lg bg-base-300"></div>
    <span class="text-xs opacity-60">base-300</span>
  </div>
</div>

<div class="divider"></div>

<!-- Typography -->
<h2 id="typography" class="text-2xl font-bold mt-8 mb-4">Typography</h2>

<div class="space-y-3 mb-8">
  <h1 class="text-4xl font-bold">Heading 1 — text-4xl</h1>
  <h2 class="text-3xl font-bold">Heading 2 — text-3xl</h2>
  <h3 class="text-2xl font-semibold">Heading 3 — text-2xl</h3>
  <h4 class="text-xl font-semibold">Heading 4 — text-xl</h4>
  <h5 class="text-lg font-medium">Heading 5 — text-lg</h5>
  <h6 class="text-base font-medium">Heading 6 — text-base</h6>
  <p>Body text — default paragraph. The quick brown fox jumps over the lazy dog.</p>
  <p class="text-sm text-base-content/60">Small text — text-sm with 60% opacity.</p>
  <p>Inline code: <code class="px-1.5 py-0.5 rounded bg-base-200 text-sm">const x = 42;</code></p>
</div>

<div class="divider"></div>

<!-- Buttons -->
<h2 id="buttons" class="text-2xl font-bold mt-8 mb-4">Buttons</h2>

<h3 class="text-lg font-semibold mb-3">Variants</h3>
<div class="flex flex-wrap gap-2 mb-4">
  <button class="btn btn-primary">Primary</button>
  <button class="btn btn-secondary">Secondary</button>
  <button class="btn btn-accent">Accent</button>
  <button class="btn btn-neutral">Neutral</button>
  <button class="btn btn-ghost">Ghost</button>
  <button class="btn btn-link">Link</button>
  <button class="btn btn-outline">Outline</button>
</div>

<h3 class="text-lg font-semibold mb-3">Sizes</h3>
<div class="flex flex-wrap items-center gap-2 mb-4">
  <button class="btn btn-primary btn-xs">Tiny</button>
  <button class="btn btn-primary btn-sm">Small</button>
  <button class="btn btn-primary btn-md">Medium</button>
  <button class="btn btn-primary btn-lg">Large</button>
</div>

<h3 class="text-lg font-semibold mb-3">Shapes</h3>
<div class="flex flex-wrap items-center gap-2 mb-4">
  <button class="btn btn-primary btn-wide">Wide</button>
  <button class="btn btn-primary btn-circle"><i class="fa-solid fa-plus"></i></button>
  <button class="btn btn-primary btn-square"><i class="fa-solid fa-xmark"></i></button>
</div>

<h3 class="text-lg font-semibold mb-3">States</h3>
<div class="flex flex-wrap gap-2 mb-8">
  <button class="btn btn-primary" disabled>Disabled</button>
  <button class="btn btn-primary"><span class="loading loading-spinner loading-sm"></span> Loading</button>
</div>

<div class="divider"></div>

<!-- Cards -->
<h2 id="cards" class="text-2xl font-bold mt-8 mb-4">Cards</h2>

<div class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
  <div class="card bg-base-200 shadow-sm">
    <div class="card-body">
      <h3 class="card-title">Default Card</h3>
      <p>Card with bg-base-200 background.</p>
      <div class="card-actions justify-end">
        <button class="btn btn-primary btn-sm">Action</button>
      </div>
    </div>
  </div>
  <div class="card border border-gray-500/15">
    <div class="card-body">
      <h3 class="card-title">Bordered Card</h3>
      <p>Card with border and no background fill.</p>
      <div class="card-actions justify-end">
        <button class="btn btn-ghost btn-sm">Details</button>
      </div>
    </div>
  </div>
  <div class="card card-compact bg-base-300 shadow-md">
    <div class="card-body">
      <h3 class="card-title">Compact Card</h3>
      <p>Uses card-compact for tighter padding.</p>
    </div>
  </div>
</div>

<div class="divider"></div>

<!-- Forms -->
<h2 id="forms" class="text-2xl font-bold mt-8 mb-4">Forms</h2>

<div class="max-w-md space-y-4 mb-8">
  <label class="form-control w-full">
    <div class="label"><span class="label-text">Text input</span></div>
    <input type="text" placeholder="Type here" class="input input-bordered w-full" />
  </label>
  <label class="form-control w-full">
    <div class="label"><span class="label-text">Select</span></div>
    <select class="select select-bordered w-full">
      <option disabled selected>Pick one</option>
      <option>Option A</option>
      <option>Option B</option>
    </select>
  </label>
  <label class="form-control w-full">
    <div class="label"><span class="label-text">Textarea</span></div>
    <textarea class="textarea textarea-bordered w-full" placeholder="Write something"></textarea>
  </label>
  <label class="form-control w-full">
    <div class="label"><span class="label-text">File input</span></div>
    <input type="file" class="file-input file-input-bordered w-full" />
  </label>
  <div class="flex items-center gap-6">
    <label class="label cursor-pointer gap-2">
      <span class="label-text">Checkbox</span>
      <input type="checkbox" checked class="checkbox checkbox-primary" />
    </label>
    <label class="label cursor-pointer gap-2">
      <span class="label-text">Toggle</span>
      <input type="checkbox" class="toggle toggle-primary" />
    </label>
    <label class="label cursor-pointer gap-2">
      <span class="label-text">Radio</span>
      <input type="radio" name="demo-radio" class="radio radio-primary" checked />
    </label>
  </div>
  <div>
    <div class="label"><span class="label-text">Range</span></div>
    <input type="range" min="0" max="100" value="40" class="range range-primary range-sm" />
  </div>
</div>

<div class="divider"></div>

<!-- Badges & Alerts -->
<h2 id="badges" class="text-2xl font-bold mt-8 mb-4">Badges & Alerts</h2>

<h3 class="text-lg font-semibold mb-3">Badges</h3>
<div class="flex flex-wrap gap-2 mb-6">
  <span class="badge badge-primary">primary</span>
  <span class="badge badge-secondary">secondary</span>
  <span class="badge badge-accent">accent</span>
  <span class="badge badge-info">info</span>
  <span class="badge badge-success">success</span>
  <span class="badge badge-warning">warning</span>
  <span class="badge badge-error">error</span>
  <span class="badge badge-outline">outline</span>
  <span class="badge badge-ghost">ghost</span>
</div>

<h3 class="text-lg font-semibold mb-3">Alerts</h3>
<div class="space-y-3 mb-8">
  <div role="alert" class="alert alert-info">
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" class="stroke-current shrink-0 w-6 h-6"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    <span>Info: This is an informational alert.</span>
  </div>
  <div role="alert" class="alert alert-success">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span>Success: Operation completed.</span>
  </div>
  <div role="alert" class="alert alert-warning">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
    <span>Warning: Check this before proceeding.</span>
  </div>
  <div role="alert" class="alert alert-error">
    <svg xmlns="http://www.w3.org/2000/svg" class="stroke-current shrink-0 h-6 w-6" fill="none" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    <span>Error: Something went wrong.</span>
  </div>
</div>

<div class="divider"></div>

<!-- Tabs -->
<h2 id="tabs" class="text-2xl font-bold mt-8 mb-4">Tabs</h2>

<div class="mb-4">
  <div role="tablist" class="tabs tabs-bordered">
    <a role="tab" class="tab">Tab 1</a>
    <a role="tab" class="tab tab-active">Tab 2</a>
    <a role="tab" class="tab">Tab 3</a>
  </div>
</div>
<div class="mb-8">
  <div role="tablist" class="tabs tabs-boxed">
    <a role="tab" class="tab">Tab A</a>
    <a role="tab" class="tab tab-active">Tab B</a>
    <a role="tab" class="tab">Tab C</a>
  </div>
</div>

<div class="divider"></div>

<!-- Collapse / Accordion -->
<h2 id="collapse" class="text-2xl font-bold mt-8 mb-4">Collapse / Accordion</h2>

<div class="space-y-2 mb-8">
  <div class="collapse collapse-arrow bg-base-200">
    <input type="radio" name="accordion-demo" checked />
    <div class="collapse-title font-medium">What tech stack is used?</div>
    <div class="collapse-content"><p>Zola (static site generator) + Tailwind CSS v4 + DaisyUI v5. No Node.js runtime needed.</p></div>
  </div>
  <div class="collapse collapse-arrow bg-base-200">
    <input type="radio" name="accordion-demo" />
    <div class="collapse-title font-medium">How does cross-subdomain theming work?</div>
    <div class="collapse-content"><p>A cookie scoped to <code>.dhanur.me</code> stores the theme preference. All subdomains read the same cookie.</p></div>
  </div>
  <div class="collapse collapse-arrow bg-base-200">
    <input type="radio" name="accordion-demo" />
    <div class="collapse-title font-medium">Do I need to recompile CSS for new classes?</div>
    <div class="collapse-content"><p>No. The safelist includes all common Tailwind utilities and DaisyUI components. Only unusual arbitrary values need a recompile.</p></div>
  </div>
</div>

<div class="divider"></div>

<!-- Tooltips -->
<h2 id="tooltips" class="text-2xl font-bold mt-8 mb-4">Tooltips</h2>

<div class="flex flex-wrap gap-4 mb-8">
  <div class="tooltip" data-tip="Default tooltip">
    <button class="btn btn-ghost btn-sm">Hover me</button>
  </div>
  <div class="tooltip tooltip-primary" data-tip="Primary tooltip">
    <button class="btn btn-primary btn-sm">Primary</button>
  </div>
  <div class="tooltip tooltip-secondary" data-tip="Secondary tooltip">
    <button class="btn btn-secondary btn-sm">Secondary</button>
  </div>
  <div class="tooltip tooltip-accent" data-tip="Accent tooltip">
    <button class="btn btn-accent btn-sm">Accent</button>
  </div>
</div>

<div class="divider"></div>

<!-- Dropdowns -->
<h2 id="dropdowns" class="text-2xl font-bold mt-8 mb-4">Dropdowns</h2>

<div class="flex flex-wrap gap-4 mb-8">
  <div class="dropdown">
    <div tabindex="0" role="button" class="btn btn-sm">Dropdown <i class="fa-solid fa-chevron-down text-xs"></i></div>
    <ul tabindex="0" class="dropdown-content z-10 menu p-2 shadow bg-base-200 rounded-box w-52">
      <li><a>Item 1</a></li>
      <li><a>Item 2</a></li>
      <li><a>Item 3</a></li>
    </ul>
  </div>
  <div class="dropdown dropdown-end">
    <div tabindex="0" role="button" class="btn btn-sm btn-outline">End-aligned <i class="fa-solid fa-chevron-down text-xs"></i></div>
    <ul tabindex="0" class="dropdown-content z-10 menu p-2 shadow bg-base-200 rounded-box w-52">
      <li><a>Option A</a></li>
      <li><a>Option B</a></li>
    </ul>
  </div>
</div>

<div class="divider"></div>

<!-- Progress & Loading -->
<h2 id="progress" class="text-2xl font-bold mt-8 mb-4">Progress & Loading</h2>

<h3 class="text-lg font-semibold mb-3">Progress bars</h3>
<div class="space-y-2 max-w-md mb-6">
  <progress class="progress progress-primary w-full" value="20" max="100"></progress>
  <progress class="progress progress-secondary w-full" value="50" max="100"></progress>
  <progress class="progress progress-accent w-full" value="80" max="100"></progress>
</div>

<h3 class="text-lg font-semibold mb-3">Loading indicators</h3>
<div class="flex flex-wrap gap-4 mb-8">
  <span class="loading loading-spinner loading-lg"></span>
  <span class="loading loading-dots loading-lg"></span>
  <span class="loading loading-ring loading-lg"></span>
  <span class="loading loading-ball loading-lg"></span>
  <span class="loading loading-bars loading-lg"></span>
  <span class="loading loading-infinity loading-lg"></span>
</div>

<div class="divider"></div>

<!-- Kbd -->
<h2 id="kbd" class="text-2xl font-bold mt-8 mb-4">Keyboard</h2>

<div class="flex flex-wrap gap-2 mb-8">
  <kbd class="kbd">A</kbd>
  <kbd class="kbd">B</kbd>
  <kbd class="kbd">C</kbd>
  <kbd class="kbd kbd-lg">Shift</kbd>
  <kbd class="kbd kbd-lg">Ctrl</kbd>
  <kbd class="kbd kbd-lg">Alt</kbd>
</div>

<div class="divider"></div>

<!-- Steps -->
<h2 id="steps" class="text-2xl font-bold mt-8 mb-4">Steps</h2>

<ul class="steps steps-horizontal w-full mb-8">
  <li class="step step-primary">Install</li>
  <li class="step step-primary">Configure</li>
  <li class="step">Build</li>
  <li class="step">Deploy</li>
</ul>

<div class="divider"></div>

<!-- Skeleton -->
<h2 id="skeleton" class="text-2xl font-bold mt-8 mb-4">Skeleton</h2>

<div class="flex flex-col gap-4 max-w-sm mb-8">
  <div class="skeleton h-32 w-full"></div>
  <div class="skeleton h-4 w-3/4"></div>
  <div class="skeleton h-4 w-1/2"></div>
</div>

<div class="divider"></div>

<!-- Swap -->
<h2 id="swap" class="text-2xl font-bold mt-8 mb-4">Swap</h2>

<div class="flex gap-4 mb-8">
  <label class="swap swap-rotate text-2xl">
    <input type="checkbox" />
    <div class="swap-on"><i class="fa-solid fa-sun"></i></div>
    <div class="swap-off"><i class="fa-solid fa-moon"></i></div>
  </label>
  <label class="swap swap-flip text-2xl">
    <input type="checkbox" />
    <div class="swap-on"><i class="fa-solid fa-face-smile"></i></div>
    <div class="swap-off"><i class="fa-solid fa-face-frown"></i></div>
  </label>
</div>

<div class="divider"></div>

<!-- Theme System -->
<h2 id="theme" class="text-2xl font-bold mt-8 mb-4">Theme System</h2>

<p class="mb-4">The theme uses a cookie-based system scoped to <code>.dhanur.me</code>, so all subdomains share the same dark/light preference.</p>

<div class="overflow-x-auto mb-6">
<table class="table table-sm">
  <thead>
    <tr>
      <th>Attribute</th>
      <th>Dark</th>
      <th>Light</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><code>data-theme</code></td><td><code>night</code></td><td><code>lofi</code></td></tr>
    <tr><td><code>data-brightness</code></td><td><code>darker</code> (default) / <code>normal</code> / <code>lighter</code></td><td><code>normal</code> (default) / <code>darker</code> / <code>lighter</code></td></tr>
    <tr><td><code>colorScheme</code></td><td><code>dark</code></td><td><code>light</code></td></tr>
  </tbody>
</table>
</div>

<h3 class="text-lg font-semibold mb-3">Brightness variants</h3>
<p class="mb-2 text-sm text-base-content/60">The <code>darker</code> brightness gives pure black (#000000) backgrounds. <code>lighter</code> gives a softer dark mode.</p>

<h3 class="text-lg font-semibold mb-3">Reading/setting theme in JS</h3>

```javascript
// Read current theme from cookie
var theme = document.cookie.match(/theme=([^;]*)/)?.[1] || "dark";

// Set theme (if on dhanur.me or subdomain)
window.__setThemeCookie("light"); // or "dark"

// Or manually
document.cookie =
  "theme=dark; path=/; domain=.dhanur.me; max-age=31536000; SameSite=Lax";
```

<div class="divider"></div>

<!-- Integration Guide -->
<h2 id="integration" class="text-2xl font-bold mt-8 mb-4">Integration Guide</h2>

<h3 class="text-lg font-semibold mb-3">Minimal setup (just the script)</h3>

```html
<script src="https://dhanur.me/js/shell.js" defer></script>
```

<p class="mb-4">This auto-injects <code>main.css</code> + <code>font-awesome.min.css</code>, fetches the layout shell, wraps your page content in the drawer, and handles theming.</p>

<h3 class="text-lg font-semibold mb-3">Script tag attributes</h3>

<div class="overflow-x-auto mb-6">
<table class="table table-sm">
  <thead>
    <tr><th>Attribute</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>data-base-url</code></td><td>Auto-detect</td><td>Override the base URL for fetching layout + CSS</td></tr>
    <tr><td><code>data-no-css</code></td><td>(absent)</td><td>Skip CSS auto-injection if you already include them</td></tr>
  </tbody>
</table>
</div>

<div class="divider"></div>

<!-- SiteNavConfig API -->
<h2 id="api" class="text-2xl font-bold mt-8 mb-4">SiteNavConfig API</h2>

<p class="mb-4">Set <code>window.SiteNavConfig</code> <strong>before</strong> the script loads to configure navigation, branding, and chrome visibility.</p>

```javascript
window.SiteNavConfig = {
  // Layout mode
  // "full" (default) = drawer + sidebar + navbar
  // "navbar" = fixed top bar only, no sidebar (for SPAs)
  mode: "full",

  // Navigation - replace nav items in header + sidebar.
  // null = use dhanur.me's nav as-is.
  nav: [
    { name: "Docs", url: "/docs/", icon: "fa-solid fa-book" },
    { name: "API", url: "/api/", icon: "fa-solid fa-code" },
    // Dropdown (header only):
    {
      name: "Links",
      type: "dropdown",
      icon: "fa-solid fa-link",
      members: [
        {
          name: "GitHub",
          url: "https://github.com/...",
          icon: "fa-brands fa-github",
        },
      ],
    },
  ],

  // Separate sidebar nav (optional). If null, uses `nav`.
  sidebarNav: [
    {
      name: "Getting Started",
      url: "/docs/start/",
      icon: "fa-solid fa-rocket",
      children: [
        { name: "Installation", url: "/docs/start/install/" },
        { name: "Quick Start", url: "/docs/start/quickstart/" },
      ],
    },
  ],

  // Highlight current page in sidebar. Default: location.pathname.
  activePath: null,

  // Branding overrides
  logo: {
    href: "/",                         // where logo links to
    html: "<img src='/logo.png' class='h-8'>",  // raw HTML content
  },
  favicon: "/path/to/icon.png",        // override favicon
  badge: {
    text: "BETA",                      // text shown in badge
    class: "badge-warning",            // DaisyUI badge class
  },

  // Chrome visibility
  showSearch: false,      // default: false (subdomains can't use main site search)
  showAppsGrid: true,     // default: true
  showThemeToggle: true,  // default: true
};
```

<h3 class="text-lg font-semibold mb-3">Config options</h3>

<div class="overflow-x-auto mb-6">
<table class="table table-sm">
  <thead>
    <tr><th>Option</th><th>Type</th><th>Default</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>mode</code></td><td><code>"full" | "navbar"</code></td><td><code>"full"</code></td><td>Full drawer layout or navbar-only (for SPAs)</td></tr>
    <tr><td><code>nav</code></td><td><code>Array</code></td><td>Main site nav</td><td>Header navigation items</td></tr>
    <tr><td><code>sidebarNav</code></td><td><code>Array</code></td><td>Falls back to <code>nav</code></td><td>Sidebar items with optional nested children</td></tr>
    <tr><td><code>activePath</code></td><td><code>string</code></td><td><code>location.pathname</code></td><td>Path to highlight as active in sidebar</td></tr>
    <tr><td><code>logo</code></td><td><code>{ href, html }</code></td><td>Main site logo</td><td>Override logo link and content</td></tr>
    <tr><td><code>favicon</code></td><td><code>string</code></td><td>Main site favicon</td><td>Path to custom favicon</td></tr>
    <tr><td><code>badge</code></td><td><code>{ text, class }</code></td><td>None</td><td>Badge shown next to logo (e.g. "BETA", "DOCS")</td></tr>
    <tr><td><code>showSearch</code></td><td><code>boolean</code></td><td><code>false</code></td><td>Show search bar (requires main site search index)</td></tr>
    <tr><td><code>showAppsGrid</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Show the apps grid dropdown</td></tr>
    <tr><td><code>showThemeToggle</code></td><td><code>boolean</code></td><td><code>true</code></td><td>Show the theme toggle button</td></tr>
  </tbody>
</table>
</div>

<h3 class="text-lg font-semibold mb-3">Nav item shapes</h3>

<div class="overflow-x-auto mb-6">
<table class="table table-sm">
  <thead>
    <tr><th>Property</th><th>Type</th><th>Description</th></tr>
  </thead>
  <tbody>
    <tr><td><code>name</code></td><td>string</td><td>Display text</td></tr>
    <tr><td><code>url</code></td><td>string</td><td>Link target</td></tr>
    <tr><td><code>icon</code></td><td>string?</td><td>FontAwesome class, e.g. <code>"fa-solid fa-book"</code></td></tr>
    <tr><td><code>children</code></td><td>NavItem[]?</td><td>Nested items (sidebar only, creates collapsible sections)</td></tr>
    <tr><td><code>type</code></td><td><code>"dropdown"</code>?</td><td>Header-only dropdown menu</td></tr>
    <tr><td><code>members</code></td><td>NavItem[]?</td><td>Dropdown items (when <code>type: "dropdown"</code>)</td></tr>
  </tbody>
</table>
</div>

<div class="divider"></div>

<!-- Examples -->
<h2 id="examples" class="text-2xl font-bold mt-8 mb-4">Example Configurations</h2>

<h3 class="text-lg font-semibold mb-3">Subdomain with custom nav + badge</h3>

```html
<script>
  window.SiteNavConfig = {
    nav: [
      { name: "Dashboard", url: "/", icon: "fa-solid fa-gauge" },
      { name: "Users", url: "/users/", icon: "fa-solid fa-users" },
      { name: "Settings", url: "/settings/", icon: "fa-solid fa-gear" },
    ],
    badge: { text: "ADMIN", class: "badge-error" },
    favicon: "/admin-icon.png",
  };
</script>
<script src="https://dhanur.me/js/shell.js" defer></script>
```

<h3 class="text-lg font-semibold mb-3">React SPA (navbar only)</h3>

```html
<!-- In public/index.html -->
<script>
  window.SiteNavConfig = {
    mode: "navbar",
    nav: [
      { name: "Home", url: "/", icon: "fa-solid fa-house" },
      { name: "About", url: "/about", icon: "fa-solid fa-user" },
    ],
    logo: { href: "/", html: "<span class='text-lg font-bold'>MyApp</span>" },
    showAppsGrid: false,
  };
</script>
<script src="https://dhanur.me/js/shell.js" defer></script>
```

<h3 class="text-lg font-semibold mb-3">Documentation site with nested sidebar</h3>

```html
<script>
  window.SiteNavConfig = {
    nav: [
      { name: "Docs", url: "/docs/", icon: "fa-solid fa-book" },
      { name: "API", url: "/api/", icon: "fa-solid fa-code" },
    ],
    sidebarNav: [
      {
        name: "Getting Started",
        url: "/docs/start/",
        icon: "fa-solid fa-rocket",
        children: [
          { name: "Installation", url: "/docs/start/install/" },
          { name: "Quick Start", url: "/docs/start/quickstart/" },
        ],
      },
      {
        name: "Guides",
        url: "/docs/guides/",
        icon: "fa-solid fa-map",
        children: [
          { name: "Authentication", url: "/docs/guides/auth/" },
          { name: "Deployment", url: "/docs/guides/deploy/" },
        ],
      },
    ],
    badge: { text: "DOCS", class: "badge-info" },
  };
</script>
<script src="https://dhanur.me/js/shell.js" defer></script>
```

<h3 class="text-lg font-semibold mb-3">No config (uses dhanur.me's nav)</h3>

```html
<!-- Simplest possible usage — zero config -->
<script src="https://dhanur.me/js/shell.js" defer></script>
```

<div class="divider"></div>

<h2 id="notes" class="text-2xl font-bold mt-8 mb-4">Notes</h2>

- **Logo** defaults to `~/dhanur` linking to [dhanur.me](https://dhanur.me) — override with `logo: { href, html }`
- **Favicon** defaults to main site — override with `favicon: "/path/to/icon.png"`
- **Theme cookie** is shared across all `*.dhanur.me` subdomains
- **CSS** (compiled Tailwind + DaisyUI) is auto-injected unless `data-no-css` is set on the script tag
- **Search** is off by default on subdomains (needs main site search index)
- The layout shell is fetched from `/navbar/` on the main site — any template changes propagate automatically
- Font Awesome 6 icons are available via the auto-injected CSS

</div>
