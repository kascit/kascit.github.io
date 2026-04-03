# Justfile — Zola + Tailwind CSS v4 + DaisyUI v5
# Cross-platform build system. Run `just` to list commands.
# Versions are sourced from versions.env (single source of truth).

set windows-shell := ["powershell", "-NoLogo", "-NoProfile", "-Command"]
set dotenv-load              # Load versions.env automatically
set dotenv-filename := "versions.env"

# ---------------------------------------------------------------------------
# Platform detection
# ---------------------------------------------------------------------------

os  := os()
css_in  := "src/main.css"
css_out := "static/css/main.css"

tailwind := if os == "windows" { "src/tailwindcss.exe" } else { "src/tailwindcss" }

# Versions — sourced from versions.env via set dotenv-load
tailwind_version := env_var("TAILWIND_VERSION")
daisyui_version  := env_var("DAISYUI_VERSION")
fa_version       := env_var("FA_VERSION")
katex_version    := env_var("KATEX_VERSION")

# ---------------------------------------------------------------------------
# Default
# ---------------------------------------------------------------------------

[doc("List available commands")]
default:
    @just --list

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

[doc("Download or update all third-party dependencies")]
[group('setup')]
setup: _dl-tailwind _dl-daisyui _dl-fontawesome _dl-katex
    @echo "Setup complete. Run 'just dev' to start."

[private, unix]
_dl-tailwind:
    #!/usr/bin/env bash
    set -euo pipefail
    url="https://github.com/tailwindlabs/tailwindcss/releases/download/v${TAILWIND_VERSION}/tailwindcss-linux-x64"
    if [ "{{ os }}" = "macos" ]; then
      url="https://github.com/tailwindlabs/tailwindcss/releases/download/v${TAILWIND_VERSION}/tailwindcss-macos-arm64"
    fi
    echo "Installing Tailwind CSS v${TAILWIND_VERSION}..."
    curl -fsSL "$url" -o "{{ tailwind }}"
    chmod +x "{{ tailwind }}"
    echo "  done."

[private]
[windows]
_dl-tailwind:
    @$url = "https://github.com/tailwindlabs/tailwindcss/releases/download/v$env:TAILWIND_VERSION/tailwindcss-windows-x64.exe"; echo "Installing Tailwind CSS v$env:TAILWIND_VERSION..."; Invoke-WebRequest -Uri $url -OutFile "{{ tailwind }}"; echo "  done."

[private, unix]
_dl-daisyui:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Installing DaisyUI v${DAISYUI_VERSION}..."
    curl -fsSL "https://github.com/saadeghi/daisyui/releases/download/v${DAISYUI_VERSION}/daisyui.js" -o src/daisyui.js
    curl -fsSL "https://github.com/saadeghi/daisyui/releases/download/v${DAISYUI_VERSION}/daisyui-theme.js" -o src/daisyui-theme.js
    echo "  done."

[private]
[windows]
_dl-daisyui:
    @echo "Installing DaisyUI v$env:DAISYUI_VERSION..."; Invoke-WebRequest -Uri "https://github.com/saadeghi/daisyui/releases/download/v$env:DAISYUI_VERSION/daisyui.js" -OutFile "src/daisyui.js"; Invoke-WebRequest -Uri "https://github.com/saadeghi/daisyui/releases/download/v$env:DAISYUI_VERSION/daisyui-theme.js" -OutFile "src/daisyui-theme.js"; echo "  done."

[private, unix]
_dl-fontawesome:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Installing Font Awesome v${FA_VERSION}..."
    curl -fsSL "https://use.fontawesome.com/releases/v${FA_VERSION}/fontawesome-free-${FA_VERSION}-web.zip" -o fontawesome.zip
    unzip -qo fontawesome.zip -d _tmp
    cp "_tmp/fontawesome-free-${FA_VERSION}-web/css/all.min.css" static/css/font-awesome.min.css
    rm -rf static/webfonts
    cp -r "_tmp/fontawesome-free-${FA_VERSION}-web/webfonts" static/webfonts
    rm -rf fontawesome.zip _tmp
    echo "  done."

[private]
[windows]
_dl-fontawesome:
    @$fa = $env:FA_VERSION; echo "Installing Font Awesome v$fa..."; Invoke-WebRequest -Uri "https://use.fontawesome.com/releases/v$fa/fontawesome-free-$fa-web.zip" -OutFile "fontawesome.zip"; Expand-Archive -Path "fontawesome.zip" -DestinationPath "_tmp" -Force; Copy-Item "_tmp/fontawesome-free-$fa-web/css/all.min.css" -Destination "static/css/font-awesome.min.css" -Force; if (Test-Path "static/webfonts") { Remove-Item "static/webfonts" -Recurse -Force }; Copy-Item "_tmp/fontawesome-free-$fa-web/webfonts" -Destination "static/webfonts" -Recurse -Force; Remove-Item "fontawesome.zip" -Force; Remove-Item "_tmp" -Recurse -Force; echo "  done."

[private, unix]
_dl-katex:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Installing KaTeX v${KATEX_VERSION}..."
    curl -fsSL "https://github.com/KaTeX/KaTeX/releases/download/v${KATEX_VERSION}/katex.zip" -o katex.zip
    unzip -qo katex.zip -d _tmp
    cp _tmp/katex/katex.min.css static/css/katex.min.css
    sed -i 's|url(fonts/|url(../fonts/katex/|g' static/css/katex.min.css
    cp _tmp/katex/katex.min.js static/js/katex.min.js
    rm -rf static/fonts/katex
    cp -r _tmp/katex/fonts static/fonts/katex
    rm -rf katex.zip _tmp
    echo "  done."

[private]
[windows]
_dl-katex:
    @$kv = $env:KATEX_VERSION; echo "Installing KaTeX v$kv..."; Invoke-WebRequest -Uri "https://github.com/KaTeX/KaTeX/releases/download/v$kv/katex.zip" -OutFile "katex.zip"; Expand-Archive -Path "katex.zip" -DestinationPath "_tmp" -Force; Copy-Item "_tmp/katex/katex.min.css" -Destination "static/css/katex.min.css" -Force; (Get-Content "static/css/katex.min.css" -Raw) -replace 'url\(fonts/', 'url(../fonts/katex/' | Set-Content "static/css/katex.min.css"; Copy-Item "_tmp/katex/katex.min.js" -Destination "static/js/katex.min.js" -Force; if (Test-Path "static/fonts/katex") { Remove-Item "static/fonts/katex" -Recurse -Force }; Copy-Item "_tmp/katex/fonts" -Destination "static/fonts/katex" -Recurse -Force; Remove-Item "katex.zip" -Force; Remove-Item "_tmp" -Recurse -Force; echo "  done."

# ---------------------------------------------------------------------------
# Development
# ---------------------------------------------------------------------------

[doc("Build CSS then start Zola dev server (blocking)")]
[group('dev')]
dev: widget-data css
    zola serve

[doc("Watch CSS for changes (blocking)")]
[group('dev')]
watch:
    {{ tailwind }} -i {{ css_in }} -o {{ css_out }} --watch

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------

[doc("Compile and minify CSS")]
[group('build')]
css:
    @{{ tailwind }} -i {{ css_in }} -o {{ css_out }} --minify

[unix]
[doc("Remove all build artifacts")]
[group('build')]
clean:
    rm -rf public
    rm -f {{ css_out }}

[windows]
[doc("Remove all build artifacts")]
[group('build')]
clean:
    @if (Test-Path "public") { Remove-Item "public" -Recurse -Force }
    @if (Test-Path "{{ css_out }}") { Remove-Item "{{ css_out }}" -Force }

[doc("Full production build (clean + css + zola)")]
[group('build')]
build: clean widget-data css
    zola build

[doc("Generate latest-posts widget data from blog content")]
[group('build')]
widget-data:
    node scripts/generate-latest-posts-widget.js

# ---------------------------------------------------------------------------
# Info
# ---------------------------------------------------------------------------

[unix]
[doc("Verify all required tools and assets are present")]
[group('info')]
doctor:
    #!/usr/bin/env bash
    set -euo pipefail
    ok=0; fail=0
    check() { if [ "$1" = "true" ]; then echo "  [ok]  $2"; ((ok++)); else echo "  [!!]  $2 — $3"; ((fail++)); fi; }
    echo "Health check"
    echo "---"
    check "$(command -v zola >/dev/null 2>&1 && echo true || echo false)" \
        "zola ($(zola --version 2>/dev/null || echo not found))" "https://www.getzola.org/documentation/getting-started/installation/"
    check "$(test -f '{{ tailwind }}' && echo true || echo false)" \
        "tailwind cli v${TAILWIND_VERSION}" "run: just setup"
    check "$(test -f src/daisyui.js && echo true || echo false)" \
        "daisyui v${DAISYUI_VERSION}" "run: just setup"
    check "$(test -f static/css/font-awesome.min.css && echo true || echo false)" \
        "font awesome v${FA_VERSION}" "run: just setup"
    check "$(test -f static/css/katex.min.css && echo true || echo false)" \
        "katex v${KATEX_VERSION}" "run: just setup"
    check "$(test -f '{{ css_out }}' && echo true || echo false)" \
        "compiled css" "run: just css"
    echo "---"
    echo "  $ok passed, $fail failed"
    [ "$fail" -eq 0 ]

[windows]
[doc("Verify all required tools and assets are present")]
[group('info')]
doctor:
    @echo "Health check"
    @echo "---"
    @if (Get-Command zola -ErrorAction SilentlyContinue) { Write-Host "  [ok]  $(zola --version 2>&1 | Select-Object -First 1)" } else { Write-Host "  [!!]  zola -- https://www.getzola.org/documentation/getting-started/installation/" }
    @if (Test-Path "{{ tailwind }}") { Write-Host "  [ok]  tailwind cli v{{ tailwind_version }}" } else { Write-Host "  [!!]  tailwind cli -- run: just setup" }
    @if (Test-Path "src/daisyui.js") { Write-Host "  [ok]  daisyui v{{ daisyui_version }}" } else { Write-Host "  [!!]  daisyui -- run: just setup" }
    @if (Test-Path "static/css/font-awesome.min.css") { Write-Host "  [ok]  font awesome v{{ fa_version }}" } else { Write-Host "  [!!]  font awesome -- run: just setup" }
    @if (Test-Path "static/css/katex.min.css") { Write-Host "  [ok]  katex v{{ katex_version }}" } else { Write-Host "  [!!]  katex -- run: just setup" }
    @if (Test-Path "{{ css_out }}") { Write-Host "  [ok]  compiled css" } else { Write-Host "  [!!]  compiled css -- run: just css" }
    @echo "---"

[unix]
[doc("Print versions of all tools from versions.env")]
[group('info')]
versions:
    @echo "zola:        $(zola --version 2>/dev/null || echo 'not found')"
    @echo "tailwind:    v${TAILWIND_VERSION}"
    @echo "daisyui:     v${DAISYUI_VERSION}"
    @echo "fontawesome: v${FA_VERSION}"
    @echo "katex:       v${KATEX_VERSION}"
    @echo "os:          {{ os }}"

[windows]
[doc("Print versions of all tools from versions.env")]
[group('info')]
versions:
    @$z = try { (zola --version 2>&1 | Select-Object -First 1) } catch { "not found" }; Write-Host "zola:        $z"
    @Write-Host "tailwind:    v{{ tailwind_version }}"
    @Write-Host "daisyui:     v{{ daisyui_version }}"
    @Write-Host "fontawesome: v{{ fa_version }}"
    @Write-Host "katex:       v{{ katex_version }}"
    @Write-Host "os:          {{ os }}"
