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

This section highlights the projects that best represent how I think about engineering tradeoffs, delivery quality, and practical execution.

{{ projects_grid(group="featured", grid_class="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-12") }}

## Learning & Practice

These repositories are where I deliberately practice fundamentals, test ideas, and sharpen instincts outside of production deadlines.

{{ projects_grid(group="learning", grid_class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12") }}

## Experiments

Experiments are smaller bets, usually built to explore a pattern, language feature, or workflow idea quickly.

{{ projects_grid(group="experiments", grid_class="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12") }}

<div class="not-prose mt-16 py-12 border-t border-base-content/10">
	<p class="text-xl text-center md:text-3xl font-bold tracking-tight mb-8">Want to hack on something together?</p>
	{{ link_card(url="/links", external=false, icon="fa-solid fa-envelope", title="Get in Touch", description="Let's build something useful together.", contrast=true) }}
</div>
