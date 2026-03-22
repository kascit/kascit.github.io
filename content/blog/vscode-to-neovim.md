+++
title = "Why I Switched from VS Code to Neovim"
date = 2026-01-15
description = "A journey of pain, frustration, and eventual productivity with terminal-based editors"

[taxonomies]
tags = ["editor", "neovim", "vscode", "productivity", "tools"]
categories = ["Development"]
+++

Let me start by saying this: I still love VS Code. It's an amazing editor that probably does 95% of what most developers need. But I switched to Neovim anyway, and here's why.

## The Breaking Point

It wasn't one single thing. It was death by a thousand papercuts:

- Extensions slowing down startup
- Memory usage creeping up to 2GB+ 
- The constant context switching between mouse and keyboard
- Feeling like I was "fighting" the editor instead of flowing with it

## The First Week (aka: Why I Almost Gave Up)

If you're thinking about switching to Neovim, prepare yourself. The first week is brutal.

**Day 1:** I couldn't even save a file without googling.
**Day 2:** Spent 30 minutes trying to exit a file. (Yes, really.)
**Day 3:** Almost went back to VS Code. Twice.
**Day 4:** Finally understood hjkl movement.
**Day 5:** Configured basic Lua settings.
**Day 6:** Actually felt productive for 5 minutes.
**Day 7:** Started to see the light.

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

## What I Still Miss

- **GitLens** blame annotations
- **Live Share** for pair programming
- **Some marketplace extensions** that don't have Neovim equivalents

## Should You Switch?

**Don't switch if:**
- You're happy with your current editor
- You don't want to spend weeks learning
- You rely heavily on GUI-based tools

**Consider switching if:**
- You spend most of your day in the terminal
- You want to optimize every aspect of your workflow
- You enjoy tweaking and customizing your tools

## Final Thoughts

Neovim isn't for everyone. But for those who stick with it, the reward is an editor that feels like an extension of your brain rather than a tool you fight against.

Am I more productive now? Honestly, yes. But more importantly, I enjoy coding more. And that's worth everything.

---

*P.S. If you do make the switch, bookmark `:help` and `vim-fugitive`. You'll thank me later.*
