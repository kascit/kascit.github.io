SYSTEM DIRECTIVES
stop if ambiguous. ask for clarification.
write minimal code. zero preemptive abstraction.
surgical edits only. zero unrelated churn.
output caveman style: drop filler words, maximize information density.
update this file synchronously if conventions change.

ENV
os: win 11 git bash.
edit ONLY: content/, templates/, src/, static/.
IGNORE generated: public/, resources/, static/css/main.css, tools/tailwindcss*, src/vendor/daisyui*.js.

BUILD
use the best tool for the job, like pnpm instead of npm, if it isnt installed just ask the user to install.
automation: `just` (dev, build, ci-build). ci logic stays in justfile.
versions: versions.env = single source truth. pin versions, no `latest`.
sync pipeline: 
`just project-pages` (data/projects.json -> content/projects/*.md)
`just widget-data` (refreshes static/widgets/latest-posts-data.json)
taxonomy: about tags -> content/about.md frontmatter. project tags -> projects.json.

SECURITY & NETWORK
NO secrets committed.
DOM: use textContent. NO innerHTML. guard URLs, reject `javascript:`.
network: fetches require AbortController + timeout. cleanup on pagehide/beforeunload.
subdomains (*.dhanur.me): shell.js handles integration. maintain backward compatibility. bootstrap fetches must not hang remote navbar.

FRONTEND
selectors: `data-*-mount` ONLY. NO generic IDs (prevents markdown heading collisions).
responsive: require static/js/modules/responsive.js. NO ad-hoc breakpoints.
daisyUI: `data-tip` XOR `title`. never both.
typography: use HTML class="not-prose". NO CSS @apply not-prose.
layout: TOC/rail toggles controlled strictly by src/layout.css vars.

ZOLA/TERA
NO auto-format in templates/.
macros: import separate files. NO deep same-file chaining.
404 routing: templates/404.html ONLY. NO content/404.md (prevents public/404.html/ dir collision).