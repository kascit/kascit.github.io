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
title = "Hi, I'm Dhanur 👋"
badge = "Backend Engineer & DevOps Enthusiast"
description = "Welcome to my cozy corner of the internet. I'm a developer passionate about building robust backend systems, automating infrastructure, and contributing to open source. I believe in writing clean code, sharing knowledge, and continuously learning in this ever-evolving world of technology."
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
title = "What I Do"
description = "Exploring the intersection of code, infrastructure, and efficiency. Here's where my passion lies in the tech world."

[[extra.features_section.features]]
title = "Backend Development"
desc = "Creating elegant solutions to complex problems with Java, Spring Boot, and microservices architecture. From RESTful APIs to scalable distributed systems, I build robust backend infrastructures that power modern applications."
icon = "fa-solid fa-code"

[[extra.features_section.features]]
title = "Cloud & DevOps"
desc = "Designing scalable cloud infrastructure using AWS, Docker, and Kubernetes. Automating deployments with CI/CD pipelines, Infrastructure as Code (Terraform), and ensuring high availability and performance of production systems."
icon = "fa-solid fa-cloud"

[[extra.features_section.features]]
title = "Open Source"
desc = "Contributing to the community and building public tools that make developers' lives easier. Active participation in open-source projects and sharing knowledge through code and documentation."
icon = "fa-brands fa-github"

[[extra.features_section.features]]
title = "Linux & Automation"
desc = "Daily driving Arch Linux and mastering terminal-based workflows. Automating repetitive tasks with bash scripts and Python, because if you do it twice, you should automate it."
icon = "fa-brands fa-linux"

[[extra.features_section.features]]
title = "System Design"
desc = "Architecting scalable and maintainable systems with focus on performance, reliability, and security. Experience in designing microservices, event-driven architectures, and distributed systems."
icon = "fa-solid fa-diagram-project"

[[extra.features_section.features]]
title = "Technical Writing"
desc = "Sharing knowledge through detailed blog posts, tutorials, and documentation. Breaking down complex technical concepts into understandable content for the developer community."
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
