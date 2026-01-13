+++
title = "Projects"
description = "Things I've built, broken, and occasionally fixed"
template = "projects.html"
sort_by = "date"
transparent = true
paginate_by = 12

[extra.comments]
enabled = false

[[extra.featured]]
title = "Face Rekognition"
description = "IoT-powered automated attendance system using ESP32-CAM, AWS IoT Core, Lambda, and AWS Rekognition. Complete serverless architecture with face detection and real-time processing."
language = "C++ • Python"
status_badge = "warning"
status_text = "Academic"
github_url = "https://github.com/kascit/face-rekognition"
gradient_from = "from-blue-500/10"
gradient_via = "via-purple-500/10"
gradient_to = "to-blue-500/5"
icon_gradient_from = "from-blue-500/20"
icon_gradient_to = "to-purple-500/20"
icon = '<svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>'
techs = ["AWS IoT", "Lambda", "Rekognition", "ESP32-CAM", "DynamoDB"]
buttons = [
  { label = "Code", url = "https://github.com/kascit/face-rekognition", class = "btn-ghost hover:btn-primary", external = true, icon = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>' }
]

[[extra.featured]]
title = "Beat.pe"
description = "A rhythm game where timing is everything. Press the buttons when they light up, avoid mistakes, and rack up your score. Features difficulty scaling and local leaderboards."
language = "JavaScript"
status_badge = "success"
status_text = "Live"
github_url = "https://github.com/kascit/Beat.pe"
live_url = "https://kascit.github.io/Beat.pe/"
gradient_from = "from-pink-500/10"
gradient_via = "via-red-500/10"
gradient_to = "to-pink-500/5"
icon_gradient_from = "from-pink-500/20"
icon_gradient_to = "to-red-500/20"
icon = '<svg class="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'
techs = ["Vanilla JS", "CSS Animations", "LocalStorage", "Responsive"]
buttons = [
  { label = "Play", url = "https://kascit.github.io/Beat.pe/", class = "btn-primary", external = true, icon = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg>' },
  { label = "Code", url = "https://github.com/kascit/Beat.pe", class = "btn-ghost hover:btn-primary", external = true, icon = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>' }
]

[[extra.featured]]
title = "Listly"
description = "Terminal-based music playlist manager built from scratch using custom doubly linked lists. Demonstrates DSA concepts with persistent file storage and ANSI-colored CLI."
language = "Java"
status_badge = "warning"
status_text = "Academic"
github_url = "https://github.com/kascit/listly"
gradient_from = "from-green-500/10"
gradient_via = "via-emerald-500/10"
gradient_to = "to-green-500/5"
icon_gradient_from = "from-green-500/20"
icon_gradient_to = "to-emerald-500/20"
icon = '<svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>'
techs = ["Linked Lists", "File I/O", "CLI", "OOP"]
buttons = [
  { label = "Code", url = "https://github.com/kascit/listly", class = "btn-ghost hover:btn-primary", external = true, icon = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>' }
]

[[extra.featured]]
title = "dhanur.me"
description = "This website! Built with Zola static site generator, heavily customized Goyo theme, and way too much time tweaking CSS at 2 AM."
language = "Zola"
status_badge = "success"
status_text = "Live"
github_url = "https://github.com/kascit/kascit.github.io"
gradient_from = "from-indigo-500/10"
gradient_via = "via-blue-500/10"
gradient_to = "to-indigo-500/5"
icon_gradient_from = "from-indigo-500/20"
icon_gradient_to = "to-blue-500/20"
icon = '<svg class="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>'
techs = ["Zola", "TailwindCSS", "DaisyUI", "GitHub Pages"]
buttons = [
  { label = "Visit", url = "/", class = "btn-primary", external = false, icon = '<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>' },
  { label = "Source", url = "https://github.com/kascit/kascit.github.io", class = "btn-ghost hover:btn-primary", external = true, icon = '<svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>' }
]

[[extra.learning]]
title = "LeetCode Solutions"
description = "My journey through algorithmic problem-solving with detailed explanations and multiple approaches"
language = "Java"
badge_class = "border-amber-500/30 text-amber-400"
icon_gradient_from = "from-amber-500/20"
icon_gradient_to = "to-orange-500/20"
icon = '<svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>'
buttons = [
  { label = "Profile", url = "https://leetcode.com/u/kascit/", external = true, hover_class = "hover:btn-warning", icon = '<svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>' },
  { label = "Code", url = "https://github.com/kascit/leetcode-solutions", external = true, hover_class = "hover:btn-warning", icon = '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>' }
]

[[extra.learning]]
title = "Java DSA"
description = "From scratch implementations of fundamental data structures and algorithms"
language = "Java"
badge_class = "border-blue-500/30 text-blue-400"
icon_gradient_from = "from-blue-500/20"
icon_gradient_to = "to-cyan-500/20"
icon = '<svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>'
buttons = [
  { label = "Code", url = "https://github.com/kascit/java-data-structures-and-algorithms", external = true, hover_class = "hover:btn-info", icon = '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>' }
]

[[extra.learning]]
title = "Selenium Automata"
description = "Automation for exploring browser workflows and UI-driven systems"
language = "Python"
archived = true
badge_class = "border-purple-500/30 text-purple-400"
icon_gradient_from = "from-purple-500/20"
icon_gradient_to = "to-pink-500/20"
icon = '<svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>'
buttons = [
  { label = "Code", url = "https://github.com/kascit/coursera-automata", external = true, hover_class = "hover:btn-secondary", icon = '<svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>' }
]

[[extra.experiments]]
title = "Tic-Tac-Toe"
description = "Classic game implementation with clean UI and game logic"
language = "JavaScript"
archived = true
github_url = "https://github.com/kascit/tic-tac-toe"
badge_class = "border-cyan-500/30 text-cyan-400"
icon_gradient_from = "from-cyan-500/20"
icon_gradient_to = "to-sky-500/20"
hover_class = "hover:btn-accent"
icon = '<svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>'

[[extra.experiments]]
title = "toAWS"
description = "Utilities and helper tools for AWS cloud operations and deployments"
language = "JavaScript"
github_url = "https://github.com/kascit/toAWS"
badge_class = "border-orange-500/30 text-orange-400"
icon_gradient_from = "from-orange-500/20"
icon_gradient_to = "to-red-500/20"
hover_class = "hover:btn-error"
icon = '<svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>'

[[extra.experiments]]
title = "Wallowords"
description = "An exciting word-based experiment currently in active development"
language = "Coming Soon"
github_url = "https://github.com/kascit/wallowords"
badge_class = "border-green-500/30 text-green-400"
icon_gradient_from = "from-green-500/20"
icon_gradient_to = "to-emerald-500/20"
hover_class = "hover:btn-success"
icon = '<svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>'
+++

<div class="not-prose">

## Featured Work

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-16">

<!-- Face Rekognition -->
<div class="card bg-gradient-to-br from-base-200 to-base-300/50 border border-base-300/80 shadow-lg hover:shadow-2xl transition-all duration-300 group">
  <figure class="px-6 pt-6 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-blue-500/5 rounded-t-2xl">
    <div class="p-3 rounded-xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 group-hover:scale-110 transition-transform duration-300">
      <svg class="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path></svg>
    </div>
  </figure>
  <div class="card-body pt-4">
    <div class="flex items-center gap-2 mb-2">
      <h2 class="card-title text-2xl font-bold">Face Rekognition</h2>
      <div class="badge badge-warning badge-sm font-semibold">Academic</div>
    </div>
    <div class="text-xs text-base-content/60 mb-3">C++ • Python</div>
    <p class="text-sm text-base-content/70 mb-4 leading-relaxed">IoT-powered automated attendance system using ESP32-CAM, AWS IoT Core, Lambda, and AWS Rekognition. Complete serverless architecture with face detection and real-time processing.</p>
    <div class="flex flex-wrap gap-2 mb-4">
      <span class="badge badge-sm badge-outline">AWS IoT</span>
      <span class="badge badge-sm badge-outline">Lambda</span>
      <span class="badge badge-sm badge-outline">Rekognition</span>
      <span class="badge badge-sm badge-outline">ESP32-CAM</span>
      <span class="badge badge-sm badge-outline">DynamoDB</span>
    </div>
    <div class="card-actions justify-start">
      <a href="https://github.com/kascit/face-rekognition" target="_blank" rel="noopener" class="btn btn-sm btn-ghost gap-2 hover:btn-primary">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg> Code
      </a>
    </div>
  </div>
</div>

<!-- Beat.pe -->
<div class="card bg-gradient-to-br from-base-200 to-base-300/50 border border-base-300/80 shadow-lg hover:shadow-2xl transition-all duration-300 group">
  <figure class="px-6 pt-6 bg-gradient-to-r from-pink-500/10 via-red-500/10 to-pink-500/5 rounded-t-2xl">
    <div class="p-3 rounded-xl bg-gradient-to-br from-pink-500/20 to-red-500/20 group-hover:scale-110 transition-transform duration-300">
      <svg class="w-8 h-8 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
    </div>
  </figure>
  <div class="card-body pt-4">
    <div class="flex items-center gap-2 mb-2">
      <h2 class="card-title text-2xl font-bold">Beat.pe</h2>
      <div class="badge badge-success badge-sm font-semibold">Live</div>
    </div>
    <div class="text-xs text-base-content/60 mb-3">JavaScript</div>
    <p class="text-sm text-base-content/70 mb-4 leading-relaxed">A rhythm game where timing is everything. Press the buttons when they light up, avoid mistakes, and rack up your score. Features difficulty scaling and local leaderboards.</p>
    <div class="flex flex-wrap gap-2 mb-4">
      <span class="badge badge-sm badge-outline">Vanilla JS</span>
      <span class="badge badge-sm badge-outline">CSS Animations</span>
      <span class="badge badge-sm badge-outline">LocalStorage</span>
      <span class="badge badge-sm badge-outline">Responsive</span>
    </div>
    <div class="card-actions justify-start gap-2">
      <a href="https://kascit.github.io/Beat.pe/" target="_blank" rel="noopener" class="btn btn-sm btn-primary gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path></svg> Play
      </a>
      <a href="https://github.com/kascit/Beat.pe" target="_blank" rel="noopener" class="btn btn-sm btn-ghost gap-2 hover:btn-primary">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg> Code
      </a>
    </div>
  </div>
</div>

<!-- Listly -->
<div class="card bg-gradient-to-br from-base-200 to-base-300/50 border border-base-300/80 shadow-lg hover:shadow-2xl transition-all duration-300 group">
  <figure class="px-6 pt-6 bg-gradient-to-r from-green-500/10 via-emerald-500/10 to-green-500/5 rounded-t-2xl">
    <div class="p-3 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 group-hover:scale-110 transition-transform duration-300">
      <svg class="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"></path></svg>
    </div>
  </figure>
  <div class="card-body pt-4">
    <div class="flex items-center gap-2 mb-2">
      <h2 class="card-title text-2xl font-bold">Listly</h2>
      <div class="badge badge-warning badge-sm font-semibold">Academic</div>
    </div>
    <div class="text-xs text-base-content/60 mb-3">Java</div>
    <p class="text-sm text-base-content/70 mb-4 leading-relaxed">Terminal-based music playlist manager built from scratch using custom doubly linked lists. Demonstrates DSA concepts with persistent file storage and ANSI-colored CLI.</p>
    <div class="flex flex-wrap gap-2 mb-4">
      <span class="badge badge-sm badge-outline">Linked Lists</span>
      <span class="badge badge-sm badge-outline">File I/O</span>
      <span class="badge badge-sm badge-outline">CLI</span>
      <span class="badge badge-sm badge-outline">OOP</span>
    </div>
    <div class="card-actions justify-start">
      <a href="https://github.com/kascit/listly" target="_blank" rel="noopener" class="btn btn-sm btn-ghost gap-2 hover:btn-primary">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg> Code
      </a>
    </div>
  </div>
</div>

<!-- dhanur.me -->
<div class="card bg-gradient-to-br from-base-200 to-base-300/50 border border-base-300/80 shadow-lg hover:shadow-2xl transition-all duration-300 group">
  <figure class="px-6 pt-6 bg-gradient-to-r from-indigo-500/10 via-blue-500/10 to-indigo-500/5 rounded-t-2xl">
    <div class="p-3 rounded-xl bg-gradient-to-br from-indigo-500/20 to-blue-500/20 group-hover:scale-110 transition-transform duration-300">
      <svg class="w-8 h-8 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9"></path></svg>
    </div>
  </figure>
  <div class="card-body pt-4">
    <div class="flex items-center gap-2 mb-2">
      <h2 class="card-title text-2xl font-bold">dhanur.me</h2>
      <div class="badge badge-success badge-sm font-semibold">Live</div>
    </div>
    <div class="text-xs text-base-content/60 mb-3">Zola</div>
    <p class="text-sm text-base-content/70 mb-4 leading-relaxed">This website! Built with Zola static site generator, heavily customized Goyo theme, and way too much time tweaking CSS at 2 AM.</p>
    <div class="flex flex-wrap gap-2 mb-4">
      <span class="badge badge-sm badge-outline">Zola</span>
      <span class="badge badge-sm badge-outline">TailwindCSS</span>
      <span class="badge badge-sm badge-outline">DaisyUI</span>
      <span class="badge badge-sm badge-outline">GitHub Pages</span>
    </div>
    <div class="card-actions justify-start gap-2">
      <a href="/" class="btn btn-sm btn-primary gap-2">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg> Visit
      </a>
      <a href="https://github.com/kascit/kascit.github.io" target="_blank" rel="noopener" class="btn btn-sm btn-ghost gap-2 hover:btn-primary">
        <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg> Source
      </a>
    </div>
  </div>
</div>

</div>

## Learning & Practice

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">

<!-- LeetCode -->
<div class="card bg-gradient-to-br from-base-200 to-base-300/50 border border-base-300/80 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
  <div class="card-body">
    <div class="flex items-start justify-between mb-3">
      <div class="p-2 rounded-lg bg-gradient-to-br from-amber-500/20 to-orange-500/20">
        <svg class="w-6 h-6 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
      </div>
      <span class="badge badge-sm badge-outline border-amber-500/30 text-amber-400">Java</span>
    </div>
    <h3 class="card-title text-lg">LeetCode Solutions</h3>
    <p class="text-sm text-base-content/70 mb-4">My journey through algorithmic problem-solving with detailed explanations and multiple approaches</p>
    <div class="card-actions justify-start gap-2">
      <a href="https://leetcode.com/u/kascit/" target="_blank" rel="noopener" class="btn btn-xs btn-ghost gap-1 hover:btn-warning">
        <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>Profile
      </a>
      <a href="https://github.com/kascit/leetcode-solutions" target="_blank" rel="noopener" class="btn btn-xs btn-ghost gap-1 hover:btn-warning">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>Code
      </a>
    </div>
  </div>
</div>

<!-- Java DSA -->
<div class="card bg-gradient-to-br from-base-200 to-base-300/50 border border-base-300/80 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
  <div class="card-body">
    <div class="flex items-start justify-between mb-3">
      <div class="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20">
        <svg class="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"></path></svg>
      </div>
      <span class="badge badge-sm badge-outline border-blue-500/30 text-blue-400">Java</span>
    </div>
    <h3 class="card-title text-lg">Java DSA</h3>
    <p class="text-sm text-base-content/70 mb-4">From scratch implementations of fundamental data structures and algorithms</p>
    <div class="card-actions justify-start gap-2">
      <a href="https://github.com/kascit/java-data-structures-and-algorithms" target="_blank" rel="noopener" class="btn btn-xs btn-ghost gap-1 hover:btn-info">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>Code
      </a>
    </div>
  </div>
</div>

<!-- Selenium Automata -->
<div class="card bg-gradient-to-br from-base-200 to-base-300/50 border border-base-300/80 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
  <div class="card-body">
    <div class="flex items-start justify-between mb-3">
      <div class="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
        <svg class="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
      </div>
      <span class="badge badge-sm badge-outline border-purple-500/30 text-purple-400">Python</span>
    </div>
    <h3 class="card-title text-lg">Selenium Automata</h3>
    <p class="text-sm text-base-content/70 mb-4">Automation for exploring browser workflows and UI-driven systems</p>
    <div class="card-actions justify-start gap-2">
      <span class="badge badge-sm badge-ghost">Archived</span>
      <a href="https://github.com/kascit/coursera-automata" target="_blank" rel="noopener" class="btn btn-xs btn-ghost gap-1 hover:btn-secondary">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>Code
      </a>
    </div>
  </div>
</div>

</div>

## Experiments

<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">

<!-- Tic-Tac-Toe -->
<div class="card bg-gradient-to-br from-base-200 to-base-300/50 border border-base-300/80 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
  <div class="card-body">
    <div class="flex items-start justify-between mb-3">
      <div class="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-sky-500/20">
        <svg class="w-6 h-6 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"></path></svg>
      </div>
      <span class="badge badge-sm badge-outline border-cyan-500/30 text-cyan-400">JavaScript</span>
    </div>
    <h3 class="card-title text-lg">Tic-Tac-Toe</h3>
    <p class="text-sm text-base-content/70 mb-4">Classic game implementation with clean UI and game logic</p>
    <div class="card-actions justify-start gap-2">
      <span class="badge badge-sm badge-ghost">Archived</span>
      <a href="https://github.com/kascit/tic-tac-toe" target="_blank" rel="noopener" class="btn btn-xs btn-ghost gap-1 hover:btn-accent">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>Code
      </a>
    </div>
  </div>
</div>

<!-- toAWS -->
<div class="card bg-gradient-to-br from-base-200 to-base-300/50 border border-base-300/80 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
  <div class="card-body">
    <div class="flex items-start justify-between mb-3">
      <div class="p-2 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20">
        <svg class="w-6 h-6 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
      </div>
      <span class="badge badge-sm badge-outline border-orange-500/30 text-orange-400">JavaScript</span>
    </div>
    <h3 class="card-title text-lg">toAWS</h3>
    <p class="text-sm text-base-content/70 mb-4">Utilities and helper tools for AWS cloud operations and deployments</p>
    <div class="card-actions justify-start gap-2">
      <a href="https://github.com/kascit/toAWS" target="_blank" rel="noopener" class="btn btn-xs btn-ghost gap-1 hover:btn-error">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>Code
      </a>
    </div>
  </div>
</div>

<!-- Wallowords -->
<div class="card bg-gradient-to-br from-base-200 to-base-300/50 border border-base-300/80 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105">
  <div class="card-body">
    <div class="flex items-start justify-between mb-3">
      <div class="p-2 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20">
        <svg class="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"></path></svg>
      </div>
      <span class="badge badge-sm badge-outline border-green-500/30 text-green-400">Coming Soon</span>
    </div>
    <h3 class="card-title text-lg">Wallowords</h3>
    <p class="text-sm text-base-content/70 mb-4">An exciting word-based experiment currently in active development</p>
    <div class="card-actions justify-start gap-2">
      <a href="https://github.com/kascit/wallowords" target="_blank" rel="noopener" class="btn btn-xs btn-ghost gap-1 hover:btn-success">
        <svg class="w-3 h-3" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>Code
      </a>
    </div>
  </div>
</div>

</div>

<div class="hero bg-gradient-to-r from-purple-500/10 via-pink-500/10 to-purple-500/5 rounded-2xl border border-purple-500/20 shadow-lg">
  <div class="hero-content text-center py-12">
    <div class="max-w-lg">
      <h2 class="text-4xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Want to collaborate?</h2>
      <p class="text-base-content/70 text-lg mb-8">I'm always interested in new projects, ideas, and opportunities to build cool stuff together. Let's create something amazing!</p>
      <div class="flex flex-col sm:flex-row justify-center gap-4">
        <a href="mailto:contact@dhanur.me" class="btn btn-primary btn-lg gap-2">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
          </svg>
          Get in Touch
        </a>
        <a href="https://github.com/kascit" target="_blank" rel="noopener" class="btn btn-ghost btn-lg gap-2 border border-base-300 hover:border-primary hover:bg-primary/10">
          <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"></path></svg>
          GitHub Profile
        </a>
      </div>
      <p class="text-xs text-base-content/40 mt-6">✨ Most projects are open source under MIT license</p>
    </div>
  </div>
</div>

</div>
