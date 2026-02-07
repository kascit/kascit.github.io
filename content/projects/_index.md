+++
title = "Projects"
description = "Things I've built, broken, and occasionally fixed"
template = "section.html"
sort_by = "date"
transparent = true

[extra.comments]
enabled = false
+++

## Featured Work

<div class="not-prose grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">

{{ project_card(title="Face Rekognition", icon="fa-solid fa-microchip", description="IoT-powered automated attendance system using ESP32-CAM, AWS IoT Core, Lambda, and AWS Rekognition. Serverless architecture with face detection and real-time processing.", lang="C++ · Python", status="academic", techs="AWS IoT, Lambda, Rekognition, ESP32-CAM, DynamoDB", github_url="https://github.com/kascit/face-rekognition") }}

{{ project_card(title="Beat.pe", icon="fa-solid fa-drum", description="A rhythm game where timing is everything. Press the buttons when they light up, avoid mistakes, and rack up your score.", lang="JavaScript", status="live", techs="Vanilla JS, CSS Animations, LocalStorage, Responsive", github_url="https://github.com/kascit/Beat.pe", live_url="https://kascit.github.io/Beat.pe/") }}

{{ project_card(title="Listly", icon="fa-solid fa-music", description="Terminal-based music playlist manager built from scratch using custom doubly linked lists. DSA concepts with persistent file storage and ANSI-colored CLI.", lang="Java", status="academic", techs="Linked Lists, File I/O, CLI, OOP", github_url="https://github.com/kascit/listly") }}

{{ project_card(title="dhanur.me", icon="fa-solid fa-globe", description="This website! Built with Zola static site generator, heavily customized Goyo theme, and way too much time tweaking CSS at 2 AM.", lang="Zola", status="live", techs="Zola, TailwindCSS, DaisyUI, GitHub Pages", github_url="https://github.com/kascit/kascit.github.io", url="/", url_label="Visit") }}

</div>

## Learning & Practice

<div class="not-prose grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">

{{ project_card(title="LeetCode Solutions", icon="fa-solid fa-bolt", description="Algorithmic problem-solving with detailed explanations and multiple approaches", lang="Java", github_url="https://github.com/kascit/leetcode-solutions", url="https://leetcode.com/u/kascit/", url_label="Profile", external=true) }}

{{ project_card(title="Java DSA", icon="fa-solid fa-sitemap", description="From scratch implementations of fundamental data structures and algorithms", lang="Java", github_url="https://github.com/kascit/java-data-structures-and-algorithms") }}

{{ project_card(title="Selenium Automata", icon="fa-solid fa-robot", description="Automation for exploring browser workflows and UI-driven systems", lang="Python", status="archived", github_url="https://github.com/kascit/coursera-automata") }}

</div>

## Experiments

<div class="not-prose grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">

{{ project_card(title="Tic-Tac-Toe", icon="fa-solid fa-gamepad", description="Classic game implementation with clean UI and game logic", lang="JavaScript", status="archived", github_url="https://github.com/kascit/tic-tac-toe") }}

{{ project_card(title="toAWS", icon="fa-brands fa-aws", description="Utilities and helper tools for AWS cloud operations and deployments", lang="JavaScript", github_url="https://github.com/kascit/toAWS") }}

{{ project_card(title="Wallowords", icon="fa-solid fa-spell-check", description="An exciting word-based experiment currently in active development", lang="Coming Soon", status="wip", github_url="https://github.com/kascit/wallowords") }}

</div>

<div class="not-prose text-center mt-8 mb-4">

**Want to collaborate?** Check out my [GitHub](https://github.com/kascit) or [get in touch](/about).

<p class="text-xs text-base-content/40 mt-2">✨ Most projects are open source under MIT license</p>

</div>
