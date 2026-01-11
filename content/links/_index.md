+++
title = "Links"
description = "All my links in one place"
template = "section.html"

[extra.comments]
enabled = false
+++

<style>
.link-card {
    display: block;
    padding: 1.25rem;
    margin-bottom: 1rem;
    border: 1px solid rgba(51, 65, 85, 0.45);
    border-radius: 0.75rem;
    transition: all 0.2s ease;
    text-decoration: none;
    background: rgba(var(--base-200, 30 41 59), 0.6);
    color: rgb(var(--base-content, 226 232 240));
}

.link-card:hover {
    transform: translateY(-2px);
    border-color: rgba(148, 163, 184, 0.8);
    box-shadow: 0 6px 18px rgba(0, 0, 0, 0.2);
    background: rgba(var(--base-300, 51 65 85), 0.75);
}

.link-title {
    font-size: 1.125rem;
    font-weight: 600;
    margin-bottom: 0.25rem;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    color: rgb(var(--base-content, 226 232 240));
}

.link-desc {
    font-size: 0.875rem;
    color: rgba(var(--base-content, 226 232 240), 0.75);
}

.link-icon {
    font-size: 1.5rem;
    color: rgb(var(--info, 100 116 139));
}
</style>

Find me across the web! Here's where I hang out online.

## 💼 Professional

{{ link_card(url="https://github.com/kascit", external=true, icon="fa-brands fa-github", title="GitHub", description="Open source projects and contributions") }}

{{ link_card(url="https://www.linkedin.com/in/dhanur-relhan/", external=true, icon="fa-brands fa-linkedin", title="LinkedIn", description="Professional profile and network") }}

{{ link_card(url="mailto:contact@dhanur.me", external=false, icon="fa-solid fa-envelope", title="Email", description="Reach out directly") }}

## 💻 Coding Profiles

{{ link_card(url="https://leetcode.com/u/kascit/", external=true, icon="fa-solid fa-code", title="LeetCode", description="Competitive programming and problem solving") }}

{{ link_card(url="https://www.geeksforgeeks.org/profile/kascit", external=true, icon="fa-solid fa-laptop-code", title="GeeksforGeeks", description="Practice problems and solutions") }}

{{ link_card(url="https://www.codechef.com/users/kascit", external=true, icon="fa-solid fa-trophy", title="CodeChef", description="Competitive programming contests") }}

{{ link_card(url="https://codeforces.com/profile/kascit", external=true, icon="fa-solid fa-chart-line", title="Codeforces", description="Algorithm competitions and ratings") }}

## 🌐 Social & Writing

{{ link_card(url="https://dev.to/kascit", external=true, icon="fa-brands fa-dev", title="DEV Community", description="Technical articles and notes") }}

{{ link_card(url="https://x.com/nkascit", external=true, icon="fa-brands fa-x-twitter", title="X (Twitter)", description="Thoughts and updates") }}

{{ link_card(url="https://mastodon.social/@kascit", external=true, icon="fa-brands fa-mastodon", title="Mastodon", description="cuz why not") }}

{{ link_card(url="https://www.reddit.com/u/i_duunno/", external=true, icon="fa-brands fa-reddit", title="Reddit", description="scary bot") }}


<!-- ## 🧑‍🤝‍🧑 Communities -->

{{ link_card(url="https://discord.gg/eTjXjGth", external=true, icon="fa-brands fa-discord", title="Discord", description="Chat with me?") }}

{{ link_card(url="https://t.me/AIO_01", external=true, icon="fa-brands fa-telegram", title="Telegram", description="DMs closed") }}

## 🎯 Other

{{ link_card(url="https://whatsapp.com/channel/0029Vb7NBaYEwEjrmzg6ZS1B", external=true, icon="fa-brands fa-whatsapp", title="WhatsApp Channel", description="Don't you dare") }}

{{ link_card(url="/projects", external=false, icon="fa-solid fa-folder", title="Projects", description="Check out my work") }}

{{ link_card(url="/rss.xml", external=false, icon="fa-solid fa-rss", title="RSS Feed", description="Subscribe to updates") }}

<div style="text-align: center; margin-top: 3rem; opacity: 0.6;">
    <p>👋 Feel free to reach out on any platform!</p>
</div>

- [MDN Web Docs](https://developer.mozilla.org/) - Web development reference
- [Rust Book](https://doc.rust-lang.org/book/) - Learn Rust
- [freeCodeCamp](https://www.freecodecamp.org/) - Free coding courses

### Blogs I Follow

- [Hacker News](https://news.ycombinator.com/)
- [Smart Nonsense Newsletter](https://www.smartnonsense.com/)
- [Dev.to](https://dev.to/)
- [CSS-Tricks](https://css-tricks.com/)

---

## Other Cool Sites

- [Uses This](https://usesthis.com/) - What people use to get stuff done
- [DevDocs](https://devdocs.io/) - API documentation browser
- [Can I Use](https://caniuse.com/) - Browser compatibility tables
