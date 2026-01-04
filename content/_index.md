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
description = "Welcome to my cozy corner of the internet. I'm a developer passionate about building robust backend systems, automating infrastructure, and contributing to open source."
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
description = "Exploring the intersection of code, infrastructure, and efficiency."

[[extra.features_section.features]]
title = "Software Development"
desc = "Creating elegant solutions to complex problems, with a focus on Java and Backend systems."
icon = "fa-solid fa-code"

[[extra.features_section.features]]
title = "Cloud & DevOps"
desc = "Designing scalable infrastructure using AWS, Docker, and Kubernetes."
icon = "fa-solid fa-cloud"

[[extra.features_section.features]]
title = "Open Source"
desc = "Contributing to the community and building public tools."
icon = "fa-brands fa-github"

[[extra.features_section.features]]
title = "Linux Enthusiast"
desc = "Tinkering with Arch Linux, Fedora, and terminal-based workflows."
icon = "fa-brands fa-linux"

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
title = "Explore"
subtitle = "Dive into my work and thoughts"

[[extra.showcase_section.tabs]]
name = "Projects"
title = "My Works"
description = "A collection of my coding projects, from web applications to CLI tools."
# Note: You need to add an image at static/images/projects.jpg or remove this line
# image = "/images/projects.jpg"

[[extra.showcase_section.tabs]]
name = "Blog"
title = "Technical Writing"
description = "Tutorials on DevOps, deep dives into Algorithms, and thoughts on software engineering."
# image = "/images/blog.jpg"

[[extra.showcase_section.tabs]]
name = "About"
title = "Behind the Code"
description = "Learn more about my background, my resume, and my journey."
# image = "/images/about.jpg"

# -----------------------------------------------------------------------------
# CALL TO ACTION
# -----------------------------------------------------------------------------
[extra.final_cta_section]
title = "Let's Connect"
description = "Have a question or want to work together? Feel free to reach out."
button = { text = "Contact Me", url = "mailto:contact@dhanur.me" }
+++