# =============================================================================
# JUSTFILE — ZOLA STATIC SITE WITH TAILWIND CSS & DAISYUI
# =============================================================================
# Intelligent cross-platform build system for static site development
# Run `just` to see all available commands
# =============================================================================

# PowerShell on Windows, bash elsewhere
set shell := ["pwsh", "-NoLogo", "-NoProfile", "-Command"]

# Paths
tailwind := "src/tailwindcss.exe"
css_in := "src/main.css"
css_out := "static/css/main.css"

# =============================================================================
# QUICK START
# =============================================================================

# Show available commands
default:
    @just --list

# First-time setup (downloads all dependencies)
[group('setup')]
setup:
    @Write-Host "🚀 Setting up project..." -ForegroundColor Cyan
    @Write-Host ""
    @Write-Host "Downloading Tailwind CSS..." -ForegroundColor Yellow
    @Invoke-WebRequest -Uri "https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-windows-x64.exe" -OutFile "{{tailwind}}"
    @Write-Host "✓ Tailwind CSS installed" -ForegroundColor Green
    @Write-Host ""
    @Write-Host "Downloading DaisyUI..." -ForegroundColor Yellow
    @Invoke-WebRequest -Uri "https://github.com/saadeghi/daisyui/releases/latest/download/daisyui.js" -OutFile "src/daisyui.js"
    @Invoke-WebRequest -Uri "https://github.com/saadeghi/daisyui/releases/latest/download/daisyui-theme.js" -OutFile "src/daisyui-theme.js"
    @Write-Host "✓ DaisyUI installed" -ForegroundColor Green
    @Write-Host ""
    @Write-Host "Downloading Font Awesome..." -ForegroundColor Yellow
    @Invoke-WebRequest -Uri "https://use.fontawesome.com/releases/v6.7.2/fontawesome-free-6.7.2-web.zip" -OutFile "fontawesome.zip"
    @Expand-Archive -Path "fontawesome.zip" -DestinationPath "temp" -Force
    @Copy-Item "temp/fontawesome-free-6.7.2-web/css/all.min.css" -Destination "static/css/font-awesome.min.css" -Force
    @if (Test-Path "static/webfonts") { Remove-Item "static/webfonts" -Recurse -Force }
    @Copy-Item "temp/fontawesome-free-6.7.2-web/webfonts" -Destination "static/webfonts" -Recurse -Force
    @Remove-Item "fontawesome.zip" -Force
    @Remove-Item "temp" -Recurse -Force
    @Write-Host "✓ Font Awesome installed" -ForegroundColor Green
    @Write-Host ""
    @Write-Host "Downloading KaTeX..." -ForegroundColor Yellow
    @Invoke-WebRequest -Uri "https://github.com/KaTeX/KaTeX/releases/download/v0.16.11/katex.zip" -OutFile "katex.zip"
    @Expand-Archive -Path "katex.zip" -DestinationPath "temp" -Force
    @Copy-Item "temp/katex/katex.min.css" -Destination "static/css/katex.min.css" -Force
    @(Get-Content "static/css/katex.min.css" -Raw) -replace 'url\(fonts/', 'url(../fonts/katex/' | Set-Content "static/css/katex.min.css"
    @Copy-Item "temp/katex/katex.min.js" -Destination "static/js/katex.min.js" -Force
    @if (Test-Path "static/fonts/katex") { Remove-Item "static/fonts/katex" -Recurse -Force }
    @Copy-Item "temp/katex/fonts" -Destination "static/fonts/katex" -Recurse -Force
    @Remove-Item "katex.zip" -Force
    @Remove-Item "temp" -Recurse -Force
    @Write-Host "✓ KaTeX installed" -ForegroundColor Green
    @Write-Host ""
    @Write-Host "✨ Setup complete! Run 'just dev' to start developing" -ForegroundColor Green

# =============================================================================
# DEVELOPMENT WORKFLOW
# =============================================================================

# 🚀 Full dev mode: build CSS + start Zola server in new window
[group('dev')]
dev: build-css
    @echo "🌐 Starting dev server in new window..."
    @Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '{{justfile_directory()}}'; zola serve"
    @Start-Sleep -Seconds 2
    @Write-Host "✓ Server running at http://127.0.0.1:1111" -ForegroundColor Green

# 👀 Watch CSS for changes in new window
[group('dev')]
watch:
    @echo "👀 Starting CSS watch in new window..."
    @Start-Process pwsh -ArgumentList "-NoExit", "-Command", "cd '{{justfile_directory()}}'; {{tailwind}} -i {{css_in}} -o {{css_out}} --watch"
    @Write-Host "✓ CSS watcher running" -ForegroundColor Green

# 🌐 Open dev server in browser
[group('dev')]
open:
    @Start-Process "http://127.0.0.1:1111"

# =============================================================================
# BUILD & DEPLOY
# =============================================================================

# 🏗️ Build CSS (production-ready, minified)
[group('build')]
build-css:
    @{{tailwind}} -i {{css_in}} -o {{css_out}} --minify

# 🧹 Clean all build artifacts
[group('build')]
clean:
    @if (Test-Path "public") { Remove-Item -Recurse -Force public }
    @if (Test-Path {{css_out}}) { Remove-Item {{css_out}} }

# 📦 Full production build
[group('build')]
build: clean build-css
    @echo "📦 Building site..."
    @zola build
    @echo "✓ Build complete"

# 📊 Build and show statistics
[group('build')]
stats: build
    @echo ""
    @echo "=================================="
    @echo "BUILD STATISTICS"
    @echo "=================================="
    @$count = (Get-ChildItem -Recurse public | Measure-Object).Count; Write-Host "Files:    $count" -ForegroundColor Cyan
    @$size = (Get-ChildItem -Recurse public | Measure-Object -Property Length -Sum).Sum / 1MB; Write-Host ("Size:     {0:N2} MB" -f $size) -ForegroundColor Cyan

# =============================================================================
# MAINTENANCE
# =============================================================================

# 🔄 Update all dependencies
[group('update')]
update:
    @echo "🔄 Updating dependencies..."
    @just _update-tailwind
    @just _update-daisyui
    @just _update-fontawesome
    @just _update-katex
    @echo "✨ All dependencies updated!"

# Update Tailwind CSS
[private]
_update-tailwind:
    @echo "Updating Tailwind CSS..."
    @Invoke-WebRequest -Uri "https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-windows-x64.exe" -OutFile "{{tailwind}}"
    @echo "✓ Tailwind CSS updated"

# Update DaisyUI
[private]
_update-daisyui:
    @echo "Updating DaisyUI..."
    @Invoke-WebRequest -Uri "https://github.com/saadeghi/daisyui/releases/latest/download/daisyui.js" -OutFile "src/daisyui.js"
    @Invoke-WebRequest -Uri "https://github.com/saadeghi/daisyui/releases/latest/download/daisyui-theme.js" -OutFile "src/daisyui-theme.js"
    @echo "✓ DaisyUI updated"

# Update Font Awesome
[private]
_update-fontawesome:
    @echo "Updating Font Awesome..."
    @Invoke-WebRequest -Uri "https://use.fontawesome.com/releases/v6.7.2/fontawesome-free-6.7.2-web.zip" -OutFile "fontawesome.zip"
    @Expand-Archive -Path "fontawesome.zip" -DestinationPath "temp" -Force
    @Copy-Item "temp/fontawesome-free-6.7.2-web/css/all.min.css" -Destination "static/css/font-awesome.min.css" -Force
    @if (Test-Path "static/webfonts") { Remove-Item "static/webfonts" -Recurse -Force }
    @Copy-Item "temp/fontawesome-free-6.7.2-web/webfonts" -Destination "static/webfonts" -Recurse -Force
    @Remove-Item "fontawesome.zip" -Force
    @Remove-Item "temp" -Recurse -Force
    @echo "✓ Font Awesome updated"

# Update KaTeX
[private]
_update-katex:
    @echo "Updating KaTeX..."
    @Invoke-WebRequest -Uri "https://github.com/KaTeX/KaTeX/releases/download/v0.16.11/katex.zip" -OutFile "katex.zip"
    @Expand-Archive -Path "katex.zip" -DestinationPath "temp" -Force
    @Copy-Item "temp/katex/katex.min.css" -Destination "static/css/katex.min.css" -Force
    @(Get-Content "static/css/katex.min.css" -Raw) -replace 'url\(fonts/', 'url(../fonts/katex/' | Set-Content "static/css/katex.min.css"
    @Copy-Item "temp/katex/katex.min.js" -Destination "static/js/katex.min.js" -Force
    @if (Test-Path "static/fonts/katex") { Remove-Item "static/fonts/katex" -Recurse -Force }
    @Copy-Item "temp/katex/fonts" -Destination "static/fonts/katex" -Recurse -Force
    @Remove-Item "katex.zip" -Force
    @Remove-Item "temp" -Recurse -Force
    @echo "✓ KaTeX updated"

# =============================================================================
# DIAGNOSTICS
# =============================================================================

# 📋 Show all tool versions
[group('info')]
versions:
    @echo "=================================="
    @echo "TOOL VERSIONS"
    @echo "=================================="
    @echo ""
    @Write-Host "Platform: " -NoNewline -ForegroundColor Gray; Write-Host "Windows" -ForegroundColor Cyan
    @Write-Host "Zola:     " -NoNewline -ForegroundColor Gray; zola --version
    @Write-Host "Tailwind: " -NoNewline -ForegroundColor Gray; $output = & {{tailwind}} --help 2>&1 | Select-Object -First 1; $output -replace '.*tailwindcss\s+', ''
    @Write-Host "DaisyUI:  " -NoNewline -ForegroundColor Gray; $content = Get-Content "src/daisyui.js" -Raw; if ($content -match 'var version = "([^"]+)"') { "v$($matches[1])" } else { "(unknown)" }
    @echo ""

# 🏥 Health check - verify all tools are working
[group('info')]
doctor:
    @echo "🏥 Running health checks..."
    @echo ""
    @if (Get-Command zola -ErrorAction SilentlyContinue) { Write-Host "✓ Zola installed" -ForegroundColor Green } else { Write-Host "✗ Zola not found" -ForegroundColor Red; Write-Host "  Install: https://www.getzola.org/documentation/getting-started/installation/" -ForegroundColor Yellow }
    @if (Test-Path {{tailwind}}) { Write-Host "✓ Tailwind CSS found" -ForegroundColor Green } else { Write-Host "✗ Tailwind CSS not found" -ForegroundColor Red; Write-Host "  Run: just setup" -ForegroundColor Yellow }
    @if (Test-Path "src/daisyui.js") { Write-Host "✓ DaisyUI found" -ForegroundColor Green } else { Write-Host "✗ DaisyUI not found" -ForegroundColor Red; Write-Host "  Run: just setup" -ForegroundColor Yellow }
    @if (Test-Path "static/css/font-awesome.min.css") { Write-Host "✓ Font Awesome found" -ForegroundColor Green } else { Write-Host "✗ Font Awesome not found" -ForegroundColor Red; Write-Host "  Run: just setup" -ForegroundColor Yellow }
    @if (Test-Path "static/css/katex.min.css") { Write-Host "✓ KaTeX found" -ForegroundColor Green } else { Write-Host "✗ KaTeX not found" -ForegroundColor Red; Write-Host "  Run: just setup" -ForegroundColor Yellow }
    @if (Test-Path {{css_out}}) { Write-Host "✓ CSS built" -ForegroundColor Green } else { Write-Host "⚠ CSS not built yet" -ForegroundColor Yellow; Write-Host "  Run: just build-css" -ForegroundColor Yellow }
    @echo ""
