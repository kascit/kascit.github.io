+++
title = "Home"
description = "Backend engineering, side projects, and technical writing from Dhanur — my cozy corner of the internet."
template = "landing.html"

[extra]
version = "v1.0"

# -----------------------------------------------------------------------------
# HERO SECTION
# -----------------------------------------------------------------------------
[extra.hero]
title = "Hey, I'm Dhanur"
# badge = "Tinkerer"
description = "Part engineering journal, part sandbox, part controlled chaos. Expect backend systems, future-tech experiments, and notes from projects that were definitely supposed to be simpler."
image_dark = "/images/landing/whood.jpg"
image_light = "/images/landing/whood-light.jpg"

cta_buttons = [
    { text = "View Projects", URL = "/projects/", style = "primary" },
    { text = "Read Blog", URL = "/blog/", style = "secondary" },
]

# -----------------------------------------------------------------------------
# FEATURES SECTION (Your "What I Do")
# -----------------------------------------------------------------------------
[extra.features_section]
title = "What I Actually Do"
description = "Building robust backend systems, experimenting with new technologies, and documenting the process."

[[extra.features_section.features]]
title = "Backend Engineering"
desc = "Designing and building distributed systems, RESTful APIs, and scalable services. Primarily working with Java, Spring Boot, and Node.js."
icon = "fa-solid fa-code"

[[extra.features_section.features]]
title = "Cloud Infrastructure"
desc = "Deploying and managing cloud-native architectures using AWS, Docker, and CI/CD pipelines to ensure reliable delivery."
icon = "fa-solid fa-cloud"

[[extra.features_section.features]]
title = "Prototypes & Research"
desc = "Exploring new paradigms in software development, from applied cryptography to AI integration and web tooling."
icon = "fa-brands fa-github"

[[extra.features_section.features]]
title = "Graphics & Simulation"
desc = "Developing interactive applications, game-adjacent engines, and procedural graphics to explore lower-level programming concepts."
icon = "fa-brands fa-linux"

[[extra.features_section.features]]
title = "System Design"
desc = "Architecting robust systems focused on event-driven design, data flow, and long-term maintainability."
icon = "fa-solid fa-diagram-project"

[[extra.features_section.features]]
title = "Technical Writing"
desc = "Documenting build processes, debugging deep-dives, and architectural decisions to share knowledge and reference past work."
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
description = "A comprehensive portfolio of production services, development tools, and experimental prototypes."
# Note: You need to add an image at static/images/projects.jpg or remove this line
# image = "/images/projects.jpg"

[[extra.showcase_section.tabs]]
name = "Blog"
title = "Technical Writing & Insights"
description = "In-depth articles covering architecture patterns, infrastructure automation, and engineering workflows."
# image = "/images/blog.jpg"

[[extra.showcase_section.tabs]]
name = "About"
title = "Behind the Code"
description = "Background information, current technical focus areas, and the core philosophies that drive my work."
# image = "/images/about.jpg"

# -----------------------------------------------------------------------------
# CALL TO ACTION
# -----------------------------------------------------------------------------
[extra.final_cta_section]
title = "Let's Connect"
description = "If you're interested in collaborating on challenging technical problems, feel free to reach out."
button = { text = "Contact Me", URL = "/links/" }
+++
