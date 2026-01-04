+++
title = "My Arch Linux Development Setup"
date = 2026-01-01
description = "A detailed walkthrough of my Arch Linux configuration, tools, and workflow for productive development"

[taxonomies]
tags = ["linux", "arch", "development", "productivity", "tools"]
categories = ["Personal"]

[extra.comments]
enabled = true
+++

# My Arch Linux Development Setup

I've been using Arch Linux as my daily driver for development for over a year now. Here's my complete setup and why I love it.

## Why Arch Linux?

**"I use Arch, btw"** - the meme is real, but here's why:

- **Rolling release**: Always up-to-date packages
- **AUR**: Access to virtually any software
- **Minimalism**: Install only what you need
- **Learning**: Forces you to understand your system
- **Performance**: Lightweight and fast

## Installation Essentials

### Base System

I use the standard Arch installation with:

- **Bootloader**: GRUB
- **Init system**: systemd
- **Shell**: zsh with Oh My Zsh
- **Terminal**: Alacritty (GPU-accelerated)

### Display Server & Desktop

```bash
# Wayland + Hyprland (tiling window manager)
sudo pacman -S wayland hyprland waybar wofi

# Or if you prefer Xorg
sudo pacman -S xorg i3-wm polybar rofi
```

## Development Tools

### Essential Packages

```bash
# Core development
sudo pacman -S base-devel git vim neovim

# Languages
sudo pacman -S jdk-openjdk python rust go nodejs npm

# Build tools
sudo pacman -S make cmake ninja

# Containers
sudo pacman -S docker docker-compose

# Version control
sudo pacman -S git git-lfs lazygit

# Terminal multiplexer
sudo pacman -S tmux
```

### From AUR

```bash
yay -S visual-studio-code-bin
yay -S slack-desktop
yay -S postman-bin
yay -S jetbrains-toolbox
```

## My Neovim Configuration

I use Neovim as my primary editor with a custom config:

```lua
-- init.lua
require('plugins')
require('settings')
require('keymaps')
require('lsp')

-- Key features:
-- - LSP for Java, Python, Rust, Go
-- - Telescope for fuzzy finding
-- - nvim-tree for file explorer
-- - Treesitter for syntax highlighting
-- - GitHub Copilot integration
```

## Terminal Setup

### Alacritty Configuration

```yaml
# ~/.config/alacritty/alacritty.yml
font:
  normal:
    family: JetBrainsMono Nerd Font
  size: 12

colors:
  primary:
    background: "#1e1e1e"
    foreground: "#d4d4d4"

window:
  opacity: 0.95
  padding:
    x: 10
    y: 10
```

### Zsh with Oh My Zsh

```bash
# Install Oh My Zsh
sh -c "$(curl -fsSL https://raw.githubusercontent.com/ohmyzsh/ohmyzsh/master/tools/install.sh)"

# My plugins
plugins=(
  git
  docker
  kubectl
  rust
  golang
  python
  zsh-autosuggestions
  zsh-syntax-highlighting
)

# Theme
ZSH_THEME="powerlevel10k/powerlevel10k"
```

## Workflow Optimization

### Tmux Configuration

I use tmux for session management:

```bash
# ~/.tmux.conf
set -g default-terminal "screen-256color"
set -g mouse on
set -g base-index 1

# Vim-like pane navigation
bind h select-pane -L
bind j select-pane -D
bind k select-pane -U
bind l select-pane -R
```

### Custom Scripts

I have a collection of bash scripts for common tasks:

```bash
#!/bin/bash
# ~/scripts/dev-setup.sh - Start my dev environment

# Start Docker
sudo systemctl start docker

# Start database
docker-compose -f ~/dev/docker-compose.yml up -d

# Open tmux with preset layout
tmux new-session -d -s dev
tmux split-window -h
tmux split-window -v
tmux attach -t dev
```

## System Maintenance

### Regular Updates

```bash
# System update
sudo pacman -Syu

# AUR packages
yay -Sua

# Clean package cache
sudo pacman -Sc

# Remove orphaned packages
sudo pacman -Rns $(pacman -Qtdq)
```

### Backup Strategy

```bash
# System backup with rsync
rsync -aAXv --exclude={"/dev/*","/proc/*","/sys/*","/tmp/*","/run/*","/mnt/*","/media/*","/lost+found"} / /backup/

# Dotfiles in Git
cd ~/dotfiles
git add .
git commit -m "Update configs"
git push
```

## Performance Tuning

### Optimizations

```bash
# Enable trim for SSD
sudo systemctl enable fstrim.timer

# Reduce swappiness
echo "vm.swappiness=10" | sudo tee -a /etc/sysctl.conf

# Preload for faster app launches
sudo pacman -S preload
sudo systemctl enable preload
```

## Useful Aliases

```bash
# ~/.zshrc
alias ls='exa --icons'
alias cat='bat'
alias find='fd'
alias grep='rg'
alias du='dust'
alias df='duf'

# Docker shortcuts
alias d='docker'
alias dc='docker-compose'
alias dps='docker ps'

# Git shortcuts
alias gs='git status'
alias ga='git add'
alias gc='git commit'
alias gp='git push'
```

## Conclusion

My Arch Linux setup is constantly evolving, but this configuration has been stable and productive for months. The key is customization - make your system work for YOU.

### Resources

- [My dotfiles on GitHub](https://github.com/kascit/dotfiles)
- [Arch Wiki](https://wiki.archlinux.org/)
- [r/unixporn](https://reddit.com/r/unixporn) for inspiration

**Tags**: #Linux #Arch #Development #Productivity
