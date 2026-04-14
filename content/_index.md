+++
title = "Home"
description = "Welcome to my corner of the internet"
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
    { text = "View Projects", url = "/projects", style = "primary" },
    { text = "Read Blog", url = "/blog", style = "secondary" },
]

# -----------------------------------------------------------------------------
# FEATURES SECTION (Your "What I Do")
# -----------------------------------------------------------------------------
[extra.features_section]
title = "What I Actually Do"
description = "Mostly building useful things, occasionally summoning weird things, and frequently pretending both were part of the same plan."

[[extra.features_section.features]]
title = "Backend Shenanigans"
desc = "APIs, distributed systems, and the usual dance between elegant architecture and panic-driven hotfixes. Mostly Java and Spring Boot, occasionally pure chaos."
icon = "fa-solid fa-code"

[[extra.features_section.features]]
title = "Cloud Chaos Engineering"
desc = "Cloud-native infrastructure, container choreography, and configs that are definitely deterministic until they meet reality. AWS, Docker, Kubernetes, and humble optimism."
icon = "fa-solid fa-cloud"

[[extra.features_section.features]]
title = "Future Tech Playground"
desc = "AI experiments, cryptography rabbit holes, web3 prototypes, and game-adjacent ideas that start as jokes and end as weekend projects."
icon = "fa-brands fa-github"

[[extra.features_section.features]]
title = "Graphics & Simulation Side Quests"
desc = "From tiny rendering experiments to shader-curious detours and procedural graphics mischief. Sometimes this becomes a game application, sometimes just a very pretty bug."
icon = "fa-brands fa-linux"

[[extra.features_section.features]]
title = "System Design"
desc = "Boxes, arrows, event streams, and scalability plans that survive contact with users. The monolith-vs-microservices debate remains respectfully unresolved."
icon = "fa-solid fa-diagram-project"

[[extra.features_section.features]]
title = "Coding Adventures"
desc = "A running log of builds, breaks, discoveries, and occasional tsoding/sebastian-inspired deep dives into whatever future-tech tangent looked fun at 1 AM."
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
description = "A mixed bag of practical systems, odd prototypes, and experiments that drift between backend reliability and future-tech curiosity. Some are production-ready, some are clearly plot twists."
# Note: You need to add an image at static/images/projects.jpg or remove this line
# image = "/images/projects.jpg"

[[extra.showcase_section.tabs]]
name = "Blog"
title = "Technical Writing & Insights"
description = "Notes from the field: architecture lessons, debugging stories, tooling detours, and occasional philosophical arguments with my own stack choices."
# image = "/images/blog.jpg"

[[extra.showcase_section.tabs]]
name = "About"
title = "Behind the Code"
description = "The human patch notes: where the ideas come from, what I am currently obsessing over, and why half my best projects began as 'this should be simple.'"
# image = "/images/about.jpg"

# -----------------------------------------------------------------------------
# CALL TO ACTION
# -----------------------------------------------------------------------------
[extra.final_cta_section]
title = "Let's Connect"
description = "If you are building something ambitious, weird, useful, or suspiciously all three, I am probably interested."
button = { text = "Contact Me", url = "/links" }
+++
