+++
title = "Why I Switched from VS Code to Neovim"
date = 2026-01-15
description = "A journey of pain, frustration, and eventual productivity with terminal-based editors"

[taxonomies]
tags = ["Neovim", "VS Code", "Developer Productivity", "Tooling", "Workflow"]
categories = ["Development"]
+++

Let me start by saying this: I still love VS Code. It's an amazing editor that probably does 95% of what most developers need. But I switched to Neovim anyway, and here's why.

## The Breaking Point

It was not one dramatic failure. It was a steady accumulation of friction: slower startup as extensions grew, memory usage creeping upward, constant mouse-keyboard context switching, and a persistent feeling that I was managing the editor more than writing code.

## The First Week (aka: Why I Almost Gave Up)

If you're thinking about switching to Neovim, prepare yourself. The first week is brutal.

The first few days were chaotic. I had to relearn basic movement and command patterns, repeatedly hit frustration walls, and nearly switched back more than once. Around the end of the first week, core motions and configuration started to click, and productivity finally became plausible instead of theoretical.

## What Makes It Worth It

After the painful learning curve, things started clicking:

### 1. Speed
Everything is instant. No loading times, no lag. Just pure speed.

### 2. Keyboard-First Workflow
No more reaching for the mouse. My hands stay on the keyboard, and I can navigate and edit code faster than ever.

### 3. Customization
My editor works exactly how I want it to. No compromises.

### 4. The "Flow State"
This is hard to explain, but there's something about staying in the terminal that keeps me in a deeper state of concentration.

Taken together, those four shifts changed how coding sessions feel: less interruption, faster iteration, and a setup that behaves like a toolbelt rather than a platform to tame.

## My Current Setup

After 2+ months of tweaking, here's what works for me:

```lua
-- Essential plugins
{
  'nvim-telescope/telescope.nvim',
  'nvim-treesitter/nvim-treesitter',
  'neovim/nvim-lspconfig',
  'hrsh7th/nvim-cmp'
}
```

- **Telescope** for fuzzy finding
- **Treesitter** for syntax highlighting
- **LSP** for language server support
- **nvim-cmp** for autocompletion

The exact plugins matter less than the principle: pick a minimal core, make it dependable, and avoid piling on extras before the base workflow is stable.

## What I Still Miss

I still miss a few VS Code conveniences, especially rich GitLens context, Live Share collaboration, and niche marketplace extensions with no direct Neovim replacement.

## Should You Switch?

You should not switch just for aesthetics. If your current editor already supports your workflow and you do not want to invest learning time, there is no strong reason to move. But if you are terminal-first, enjoy deep tooling control, and are willing to absorb short-term pain for long-term speed, Neovim can be a meaningful upgrade.

## Final Thoughts

Neovim isn't for everyone. But for those who stick with it, the reward is an editor that feels like an extension of your brain rather than a tool you fight against.

Am I more productive now? Honestly, yes. But more importantly, I enjoy coding more. And that's worth everything.

---

*P.S. If you do make the switch, bookmark `:help` and `vim-fugitive`. You'll thank me later.*
