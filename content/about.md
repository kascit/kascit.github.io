+++
title = "About"
description = "Hey there! I build things that are useful, curious, and occasionally a little dangerous."
template = "page.html"

[extra]
hide_page_meta = true
hide_page_taxonomies = true
back_url = "/"
back_title = "Home"
back_subtitle = "Back to"
next_url = "/projects/"
next_title = "Projects"
next_subtitle = "Next"

[extra.comments]
enabled = false

[taxonomies]
tags = ["Java", "Python", "Go", "C / C++", "JavaScript", "Lua", "SQL", "Bash", "Spring Boot", "Node.js", "PostgreSQL", "MongoDB", "Redis", "DynamoDB", "AWS", "GCP", "Docker", "Kubernetes", "CI/CD", "Terraform", "Neovim", "Linux", "Git", "Postman", "AI Systems", "Applied Cryptography", "Computer Graphics"]
+++
<div class="prose max-w-none prose-base-content lg:prose-lg mb-12">

I am a backend-leaning engineer with a soft spot for systems that behave under pressure and side projects that absolutely do not.

Most days look like APIs, infra, and architecture decisions. Nights are for AI experiments, cryptography tangents, web3 skepticism, game application prototypes, and graphics rabbit holes that started as "just a quick test." Think coding adventures with better logging.

</div>

<div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 not-prose">

<div class="card about-panel">
	<div class="card-body">
		<h2 class="card-title text-lg mb-5 border-b border-base-content/10 pb-3">
			<i class="fa-solid fa-rocket text-primary" aria-hidden="true"></i> Core Expertise
		</h2>
		<ul class="space-y-5">
			<li class="flex gap-3.5 items-start">
				<div class="about-expertise-icon" aria-hidden="true"><i class="fa-solid fa-server text-sm"></i></div>
				<div class="min-w-0 pt-0.5">
					<span class="font-semibold text-base-content block mb-1">Backend Engineering</span>
					<span class="text-sm text-base-content/65 leading-relaxed">Designing services that stay calm under load, mostly in Java, Spring Boot, and Go.</span>
				</div>
			</li>
			<li class="flex gap-3.5 items-start">
				<div class="about-expertise-icon" aria-hidden="true"><i class="fa-solid fa-cloud text-sm"></i></div>
				<div class="min-w-0 pt-0.5">
					<span class="font-semibold text-base-content block mb-1">Cloud Infrastructure</span>
					<span class="text-sm text-base-content/65 leading-relaxed">Deploying across cloud stacks with enough observability to sleep at night.</span>
				</div>
			</li>
			<li class="flex gap-3.5 items-start">
				<div class="about-expertise-icon" aria-hidden="true"><i class="fa-solid fa-terminal text-sm"></i></div>
				<div class="min-w-0 pt-0.5">
					<span class="font-semibold text-base-content block mb-1">System Programming</span>
					<span class="text-sm text-base-content/65 leading-relaxed">Low-level experiments, performance tuning, and occasional graphics-heavy detours.</span>
				</div>
			</li>
			<li class="flex gap-3.5 items-start">
				<div class="about-expertise-icon" aria-hidden="true"><i class="fa-solid fa-code-branch text-sm"></i></div>
				<div class="min-w-0 pt-0.5">
					<span class="font-semibold text-base-content block mb-1">Automation and DevOps</span>
					<span class="text-sm text-base-content/65 leading-relaxed">Automation pipelines that reduce surprises and keep releases boring (the good kind).</span>
				</div>
			</li>
		</ul>
	</div>
</div>

<div class="card about-panel">
	<div class="card-body">
		<h2 class="card-title text-lg mb-5 border-b border-base-content/10 pb-3">
			<i class="fa-solid fa-layer-group text-primary" aria-hidden="true"></i> Technical Arsenal
		</h2>
		<div class="space-y-5">
			<div>
				<h3 class="about-skill-heading"><i class="fa-solid fa-code text-[11px]" aria-hidden="true"></i> Languages</h3>
				<div class="flex flex-wrap gap-2">
					{{ tag_chip(name="Java") }}
					{{ tag_chip(name="Python") }}
					{{ tag_chip(name="Go", label="Go language") }}
					{{ tag_chip(name="C / C++") }}
					{{ tag_chip(name="JavaScript") }}
					{{ tag_chip(name="Lua") }}
					{{ tag_chip(name="SQL") }}
					{{ tag_chip(name="Bash") }}
				</div>
			</div>
			<div>
				<h3 class="about-skill-heading"><i class="fa-solid fa-cubes text-[11px]" aria-hidden="true"></i> Frameworks and Datastores</h3>
				<div class="flex flex-wrap gap-2">
					{{ tag_chip(name="Spring Boot") }}
					{{ tag_chip(name="Node.js") }}
					{{ tag_chip(name="PostgreSQL") }}
					{{ tag_chip(name="MongoDB") }}
					{{ tag_chip(name="Redis") }}
					{{ tag_chip(name="DynamoDB") }}
				</div>
			</div>
			<div>
				<h3 class="about-skill-heading"><i class="fa-solid fa-cloud-arrow-up text-[11px]" aria-hidden="true"></i> Cloud and DevOps</h3>
				<div class="flex flex-wrap gap-2">
					{{ tag_chip(name="AWS") }}
					{{ tag_chip(name="GCP") }}
					{{ tag_chip(name="Docker") }}
					{{ tag_chip(name="Kubernetes") }}
					{{ tag_chip(name="CI/CD") }}
					{{ tag_chip(name="Terraform") }}
				</div>
			</div>
			<div>
				<h3 class="about-skill-heading"><i class="fa-solid fa-wrench text-[11px]" aria-hidden="true"></i> Tools and Domains</h3>
				<div class="flex flex-wrap gap-2">
					{{ tag_chip(name="Neovim") }}
					{{ tag_chip(name="Linux") }}
					{{ tag_chip(name="Git") }}
					{{ tag_chip(name="Postman") }}
					{{ tag_chip(name="AI Systems") }}
					{{ tag_chip(name="Applied Cryptography") }}
					{{ tag_chip(name="Computer Graphics", label="Graphics") }}
				</div>
			</div>
		</div>
	</div>
</div>

</div>

## What Keeps Me Going

I like building things that feel inevitable after they are done, even if they looked impossible at the whiteboard stage. Clean systems, sharp interfaces, fewer 3 AM mysteries.

## Off the Keyboard

When I am not coding, I am usually on strategy games, sci-fi, or watching tsoding/sebastian-style engineering deep dives and pretending I will "just watch one." 

## Keep In Touch

{{ link_card(url="/links", external=false, icon="fa-solid fa-link", title="Socials and Communities", description="Find me around the internet.", contrast=true) }}