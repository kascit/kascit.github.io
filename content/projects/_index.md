+++
title = "Projects"
description = "Sometimes I build things. Sometimes they even work."
template = "section.html"
sort_by = "date"
transparent = true

[extra.comments]
enabled = false
+++

## Featured Work

<div class="not-prose grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12">

{{ project_card(title="Face Rekognition", icon="fa-solid fa-microchip", description="IoT-powered automated attendance system using ESP32-CAM, AWS IoT Core, Lambda, and AWS Rekognition. Serverless architecture with face detection and real-time processing.", lang="C++ · Python", status="academic", techs="AWS IoT, Lambda, Rekognition, ESP32-CAM, DynamoDB", github_url="https://github.com/kascit/face-rekognition") }}

{{ project_card(title="Beat.pe", icon="fa-solid fa-drum", description="A web-based rhythm game where timing is everything. Built entirely from scratch with vanilla JavaScript and CSS animations.", lang="JavaScript", status="live", techs="Vanilla JS, CSS Animations, LocalStorage, Responsive", github_url="https://github.com/kascit/Beat.pe", live_url="https://kascit.github.io/Beat.pe/") }}

{{ project_card(title="Listly", icon="fa-solid fa-music", description="Terminal-based music playlist manager built from scratch using custom doubly linked lists. Features persistent file storage and an ANSI-colored CLI.", lang="Java", status="academic", techs="Linked Lists, File I/O, CLI, OOP", github_url="https://github.com/kascit/listly") }}

{{ project_card(title="dhanur.me", icon="fa-solid fa-globe", description="The site you're looking at right now. Fast, static, and occasionally broken when I push to main at 3 AM.", lang="Zola", status="live", techs="Zola, TailwindCSS, DaisyUI, GitHub Pages", github_url="https://github.com/kascit/kascit.github.io", url="/", url_label="Visit") }}

</div>

## Learning & Practice

<div class="not-prose grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">

{{ project_card(title="LeetCode Solutions", icon="fa-solid fa-bolt", description="A structured collection of algorithmic problem-solving approaches and optimizations.", lang="Java", github_url="https://github.com/kascit/leetcode-solutions", url="https://leetcode.com/u/kascit/", url_label="Profile", external=true) }}

{{ project_card(title="Java DSA", icon="fa-solid fa-sitemap", description="From-scratch implementations of fundamental data structures and classic algorithms.", lang="Java", github_url="https://github.com/kascit/java-data-structures-and-algorithms") }}

{{ project_card(title="Selenium Automata", icon="fa-solid fa-robot", description="Web automation scripts for exploring browser workflows and routine UI-driven tasks.", lang="Python", status="archived", github_url="https://github.com/kascit/coursera-automata") }}

</div>

## Experiments

<div class="not-prose grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-12">

{{ project_card(title="Tic-Tac-Toe", icon="fa-solid fa-gamepad", description="Because every developer has to build one eventually.", lang="JavaScript", status="archived", github_url="https://github.com/kascit/tic-tac-toe") }}

{{ project_card(title="toAWS", icon="fa-brands fa-aws", description="A handful of CLI utilities to make my AWS deployments slightly less painful.", lang="JavaScript", github_url="https://github.com/kascit/toAWS") }}

{{ project_card(title="WalloWords", icon="fa-solid fa-spell-check", description="A word-based experiment actively in development.", lang="Coming Soon", status="wip", github_url="https://github.com/kascit/wallowords") }}

</div>
    
<div class="not-prose mt-16 py-12 border-t border-base-content/10">
    <p class="text-xl text-center md:text-3xl font-bold tracking-tight mb-8">Want to hack on something together?</p>
    <div class="mt-4">
        {{ link_card(url="/links", external=false, icon="fa-solid fa-envelope", title="Get in touch", description="Let's build something awesome", contrast=true) }}
    </div>
</div>
