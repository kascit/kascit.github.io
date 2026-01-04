+++
title = "Dhanur"
description = "Welcome to my corner of the internet"
template = "landing.html"

[extra]
version = "v1.0"

# -----------------------------------------------------------------------------
# HERO SECTION
# -----------------------------------------------------------------------------
[extra.hero]
title = "Hey, I'm Dhanur 👋"
badge = "Code Wrangler & Infrastructure Tinkerer"
description = "This is where I dump my brain on the internet. By day, I wrangle backend services and convince servers to behave. By night, I break my Arch setup and frantically Google how to fix it (again). Sometimes I write code that works. Sometimes I write blog posts about why it didn't."
# You can add a profile picture here, or comment it out for a text-only look
image = "/images/whood.png" 

cta_buttons = [
    { text = "View Projects", url = "/projects", style = "primary" },
    { text = "Read Blog", url = "/blog", style = "secondary" },
]

# -----------------------------------------------------------------------------
# FEATURES SECTION (Your "What I Do")
# -----------------------------------------------------------------------------
[extra.features_section]
title = "What I Actually Do"
description = "When I'm not Googling error messages or arguing with Docker, here's where I spend my time:"

[[extra.features_section.features]]
title = "Backend Shenanigans"
desc = "Making APIs that hopefully don't explode in production. Java, Spring Boot, and the occasional existential crisis when debugging race conditions at 2 AM. I promise my code works™ (most of the time)."
icon = "fa-solid fa-code"

[[extra.features_section.features]]
title = "Cloud Chaos Engineering"
desc = "Spinning up servers faster than I can afford them. AWS bills that make me cry, Docker containers that refuse to die, and Kubernetes configs that work on my machine (your mileage may vary)."
icon = "fa-solid fa-cloud"

[[extra.features_section.features]]
title = "Open Source Contributions"
desc = "Contributing to projects I use and occasionally making tools that solve problems exactly three people have (including me). PRs welcome, judgment not included."
icon = "fa-brands fa-github"

[[extra.features_section.features]]
title = "Linux Maximalism"
desc = "Arch Linux is my religion and the terminal is my temple. I spend way too much time ricing my setup, writing bash scripts to automate tasks I do once a year, and pretending Vim is better than your IDE."
icon = "fa-brands fa-linux"

[[extra.features_section.features]]
title = "System Design"
desc = "Drawing boxes and arrows until something looks scalable. Microservices, event-driven architectures, and late-night realizations that maybe I should've just used a monolith."
icon = "fa-solid fa-diagram-project"

[[extra.features_section.features]]
title = "Blog Procrastination"
desc = "Writing about the stuff I break and occasionally fix. Think of it as documentation, but with more memes and self-deprecating humor. Warning: contains traces of actual technical content."
icon = "fa-solid fa-pen-nib"

# -----------------------------------------------------------------------------
# TECH STACK (Optional - Remove if you don't have SVGs yet)
# -----------------------------------------------------------------------------
# [extra.trust_section]
# title = "Tech Stack"
# logos = [
#     { src = "/icons/java.svg", alt = "Java" },
#     { src = "/icons/docker.svg", alt = "Docker" },
#     { src = "/icons/aws.svg", alt = "AWS" },
# ]

# -----------------------------------------------------------------------------
# SHOWCASE SECTION (Highlights of your site)
# -----------------------------------------------------------------------------
[extra.showcase_section]
title = "Explore My World"
subtitle = "Dive into my work, thoughts, and technical journey"

[[extra.showcase_section.tabs]]
name = "Projects"
title = "My Work & Creations"
description = "A curated collection of my coding projects spanning from production-ready web applications to command-line utilities. Each project reflects my commitment to clean code, scalability, and real-world problem-solving. Explore Spring Boot microservices, Infrastructure as Code templates, DevOps automation scripts, and more."
# Note: You need to add an image at static/images/projects.jpg or remove this line
# image = "/images/projects.jpg"

[[extra.showcase_section.tabs]]
name = "Blog"
title = "Technical Writing & Insights"
description = "Deep dives into software engineering, step-by-step tutorials on DevOps practices, algorithm explorations, and personal reflections on technology trends. Whether you're learning a new framework, troubleshooting deployments, or seeking architectural insights, you'll find valuable content here."
# image = "/images/blog.jpg"

[[extra.showcase_section.tabs]]
name = "About"
title = "Behind the Code"
description = "Learn more about my background, technical journey, and what drives me as a developer. From my education and professional experience to my interests in competitive programming and open source contributions. Discover the story behind this site and how you can connect with me."
# image = "/images/about.jpg"

# -----------------------------------------------------------------------------
# CALL TO ACTION
# -----------------------------------------------------------------------------
[extra.final_cta_section]
title = "Let's Connect"
description = "Have a question or want to work together? I'm always open to interesting conversations, collaboration opportunities, or just geeking out about tech. Find all my social links and ways to reach me."
button = { text = "Contact Me", url = "/links" }
+++
