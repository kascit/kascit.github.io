# The Authy/Kwizz Design System Prompt
> A portable prompt for guiding Claude/GPT when building other subdomains (like Authy or Kwizz) to match the exact `kascit.github.io` design language.

---

## The Prompt to Provide:

**Goal**: I am building a new subdomain/microservice. It needs to look **exactly** like my primary domain, utilizing the same monolithic `shell.js` library, which auto-injects my exported `dui.css` (DaisyUI + Tailwind CSS v4 design system), handles themes (monochromatic Zinc scale), and builds my unified Navbar and Drawer architecture.

**Your Instructions**:

1. **The Core HTML Boilerplate**:
   Do not reinvent CSS, fonts, or navbars. You must structure every `.html` construct exactly like this baseline template:

   ```html
   <!doctype html>
   <html lang="en">
   <head>
       <meta charset="UTF-8" />
       <meta name="viewport" content="width=device-width, initial-scale=1.0" />
       <!-- Required for FontAwesome Icons -->
       <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" />
       
       <!-- 1. The Configuration Object (must be synchronously before shell.js) -->
       <script>
       window.SiteNavConfig = {
           mode: "full", // "full" (navbar + drawer sidebar) or "navbar" (top bar only)
           nav: [
               { name: "Home", url: "https://dhanur.me/", icon: "fa-solid fa-house" },
               { name: "Services", url: "/", icon: "fa-solid fa-server" } // Change per project
           ],
           sidebarNav: [
               { name: "Dashboard", url: "/dashboard", icon: "fa-solid fa-chart-line" },
               { name: "Settings", url: "/settings", icon: "fa-solid fa-gear" }
           ],
           activePath: window.location.pathname, // Highlights the correct sidebar item
           badge: { text: "SERVICE", class: "badge-primary" }, // Optional Header badge
           showSearch: false, // External sites shouldn't render the central search
           showAppsGrid: true, // Display the cross-service App Launcher
           showThemeToggle: true
       };
       </script>

       <!-- 2. The Abyssal Integration Script -->
       <script type="module" src="https://dhanur.me/js/shell.js"></script>
   </head>
   <body>
       <!-- The shell.js will automatically wrap this main element within a .drawer context -->
       <!-- Never build a custom top navbar, the script will inject it -->
       <main class="w-full max-w-7xl mx-auto p-4 lg:p-8">
           <h1 class="text-4xl lg:text-5xl font-extrabold tracking-tight mb-6 mt-14">Your Microservice Title</h1>
           <p class="text-lg text-base-content/85 mb-8">This text will natively render with the premium typography spacing.</p>

           <!-- Example geometric card -->
           <div class="project-card md:max-w-md">
               <div class="project-card-header">
                   <h2 class="project-card-title">Authentic Component</h2>
               </div>
               <p class="project-card-desc">It automatically maps to the dark/light monochromatic aesthetics.</p>
           </div>
       </main>
   </body>
   </html>
   ```

2. **The Design Language Rules**:
   - **No Colors Unpredictably Applied**: Do not use `text-gray-500`, `bg-blue-100`, etc. The system is entirely monochromatic based off `base-content`.
   - Use `base-content/10` to `base-content/30` for structural borders.
   - Use `bg-base-200/40` or `bg-base-200` for cards and modals (pitch black `#09090b` dark mode requires this elevation).
   - Use `text-base-content/60` and `text-base-content/85` for subtext and descriptions.
   - **Pre-Built Components**: Lean entirely on the global `.project-card`, `.nav-button`, and standard DaisyUI `.btn` classes. Do not rewrite complex component CSS.
   - **Typography**: The typography `@layer` handles `h1`, `h2`, `h3`, `p`, `ul`, `ol`, and `blockquote` entirely. Simply invoke raw HTML tags within `<main>` and they will automatically scale beautifully to Medium-like reading proportions. No `.prose` class needed.
