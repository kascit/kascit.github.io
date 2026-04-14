+++
title = "I Use Arch BTW: My Setup and Why I Torture Myself"
date = 2025-12-29
description = "A walkthrough of my Arch Linux setup, or: how I learned to stop worrying and love the terminal"

[taxonomies]
tags = ["Linux", "Arch Linux", "Developer Environment", "Productivity", "Tooling"]
categories = ["Personal"]

[extra]
thumbnail_image = "images/thumbs/arch.jpg"
+++

Yes, I'm that person. I use Arch Linux. I will tell you about it. Repeatedly.

But seriously, after a year of daily-driving Arch for development, I've got opinions and a setup that (mostly) doesn't break every update. Let me walk you through it.

## Why Arch? (The Actual Reasons)

Look past the memes and superiority complex, and there are legit reasons:

The upside is control: rolling packages, access to the AUR ecosystem, and a minimal base that keeps the system intentional. The downside is operational overhead. Updates can break unexpectedly, installation requires attention, and the wiki becomes required reading rather than optional help.

## My Current Setup

### The Foundation

After reinstalling Arch approximately 4 times (learning experience™), here's what stuck:

```bash
# Display server: Wayland because it's 2025
# WM: Hyprland (tiling, because I'm pretentious)
# Terminal: Alacritty (GPU-accelerated, so fast)
# Shell: zsh + oh-my-zsh (I know, basic)
```

### Development Environment

This is where I actually spend my time:

```bash
# Editor: Neovim
# Why? Because I like suffering and also it's actually great
# Config: ~800 lines of Lua I barely understand

# Terminal multiplexer: tmux
# Because tabs are for quitters

# File manager: ranger + lf
# Sometimes GUI file managers, when I'm feeling lazy
```

## The Tools That Matter

### Package Management

```bash
# Official repos
sudo pacman -S <package>

# AUR (use yay or paru)
yay -S <whatever-obscure-package>
```

Pro tip: Always read the PKGBUILD before installing from AUR. Or don't, and live dangerously.

### Development Essentials

```bash
# Languages
sudo pacman -S jdk-openjdk python rust go nodejs npm

# Build tools
sudo pacman -S base-devel cmake ninja

# Version control
sudo pacman -S git lazygit  # lazygit is a game-changer

# Docker (because containers)
sudo pacman -S docker docker-compose
sudo systemctl enable docker
sudo usermod -aG docker $USER
```

### My Terminal Setup

**Alacritty config highlights:**

```yaml
# Font that makes code look good
font:
  normal:
    family: JetBrainsMono Nerd Font
  size: 11

# Colors: Gruvbox because it's the law
colors:
  primary:
    background: "#282828"
    foreground: "#ebdbb2"
```

**Zsh with the good stuff:**

```bash
# .zshrc essentials
plugins=(
  git
  zsh-autosuggestions
  zsh-syntax-highlighting
  docker
  kubectl
)

# Aliases that save my sanity
alias ls='exa --icons'
alias cat='bat'
alias vim='nvim'
alias gc='git commit -m'
alias gp='git push'
alias fucking='sudo' # sudo !!
```

## The Neovim Rabbit Hole

My editor config is probably overengineered, but here are the plugins that actually matter:

```lua
-- Plugin manager: lazy.nvim (ironically not lazy)

-- Essential plugins:
- telescope.nvim  -- Fuzzy finder (cannot live without)
- nvim-tree       -- File explorer
- lualine         -- Status line
- mason.nvim      -- LSP installer
- nvim-cmp        -- Autocompletion
- treesitter      -- Syntax highlighting that doesn't suck
```

That stack gives me fast navigation, reliable language support, and enough UI feedback without pulling me back into a heavy graphical workflow.

## Window Management: Hyprland

Tiling window managers are peak productivity (after the learning curve):

```conf
# My keybinds (Mod = Super key)
Mod + Enter     = Launch terminal
Mod + D         = Launch rofi (app launcher)
Mod + H/J/K/L   = Move focus
Mod + 1-9       = Switch workspaces
Mod + Shift + Q = Kill window
```

It looks cool in screenshots and actually makes me faster once I stopped accidentally closing the wrong window.

## Backup Strategy

Because I've learned this lesson the hard way:

```bash
# Dotfiles: Git repo
# System: Weekly snapshots with Timeshift
# Important stuff: Synced to cloud
# My dignity after breaking X11: Unrecoverable
```

## The Reality Check

Is Arch Linux objectively better than Ubuntu or Fedora? Probably not.

Do I enjoy the control and learning experience? Absolutely.

Would I recommend it to everyone? Hell no. Use what works for you.

But do I use Arch BTW? You bet I do.

## Resources That Saved Me

The [Arch Wiki](https://wiki.archlinux.org/) remains the primary source of truth, while community threads and practical troubleshooting posts are most useful for edge cases and hardware quirks.

---

That's my setup. It'll probably change next month when I discover some new tool and spend a weekend integrating it. But that's half the fun, right?

If you're thinking about trying Arch, go for it. Just maybe do it on a weekend when you don't have important deadlines. And keep the wiki open.

\- Dhanur
