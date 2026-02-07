# Justfile — Zola + Tailwind CSS v4 + DaisyUI v5
# Cross-platform build system. Run `just` to list commands.

set windows-shell := ["powershell", "-NoLogo", "-NoProfile", "-Command"]

# ---------------------------------------------------------------------------
# Platform detection
# ---------------------------------------------------------------------------

os           := os()
tailwind     := if os == "windows" { "src/tailwindcss.exe" } else { "src/tailwindcss" }
tailwind_url := if os == "windows" { "https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-windows-x64.exe" } else if os == "macos" { "https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-macos-arm64" } else { "https://github.com/tailwindlabs/tailwindcss/releases/latest/download/tailwindcss-linux-x64" }
css_in       := "src/main.css"
css_out      := "static/css/main.css"
fa_version   := "6.7.2"
katex_version := "0.16.11"

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
    echo "Installing Tailwind CSS..."
    curl -fsSL "{{ tailwind_url }}" -o "{{ tailwind }}"
    chmod +x "{{ tailwind }}" 2>/dev/null || true
    echo "  done."

[private]
[windows]
_dl-tailwind:
    @echo "Installing Tailwind CSS..."
    @Invoke-WebRequest -Uri "{{ tailwind_url }}" -OutFile "{{ tailwind }}"
    @echo "  done."

[private, unix]
_dl-daisyui:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Installing DaisyUI..."
    curl -fsSL "https://github.com/saadeghi/daisyui/releases/latest/download/daisyui.js" -o src/daisyui.js
    curl -fsSL "https://github.com/saadeghi/daisyui/releases/latest/download/daisyui-theme.js" -o src/daisyui-theme.js
    echo "  done."

[private]
[windows]
_dl-daisyui:
    @echo "Installing DaisyUI..."
    @Invoke-WebRequest -Uri "https://github.com/saadeghi/daisyui/releases/latest/download/daisyui.js" -OutFile "src/daisyui.js"
    @Invoke-WebRequest -Uri "https://github.com/saadeghi/daisyui/releases/latest/download/daisyui-theme.js" -OutFile "src/daisyui-theme.js"
    @echo "  done."

[private, unix]
_dl-fontawesome:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Installing Font Awesome {{ fa_version }}..."
    curl -fsSL "https://use.fontawesome.com/releases/v{{ fa_version }}/fontawesome-free-{{ fa_version }}-web.zip" -o fontawesome.zip
    unzip -qo fontawesome.zip -d _tmp
    cp "_tmp/fontawesome-free-{{ fa_version }}-web/css/all.min.css" static/css/font-awesome.min.css
    rm -rf static/webfonts
    cp -r "_tmp/fontawesome-free-{{ fa_version }}-web/webfonts" static/webfonts
    rm -rf fontawesome.zip _tmp
    echo "  done."

[private]
[windows]
_dl-fontawesome:
    @echo "Installing Font Awesome {{ fa_version }}..."
    @Invoke-WebRequest -Uri "https://use.fontawesome.com/releases/v{{ fa_version }}/fontawesome-free-{{ fa_version }}-web.zip" -OutFile "fontawesome.zip"
    @Expand-Archive -Path "fontawesome.zip" -DestinationPath "_tmp" -Force
    @Copy-Item "_tmp/fontawesome-free-{{ fa_version }}-web/css/all.min.css" -Destination "static/css/font-awesome.min.css" -Force
    @if (Test-Path "static/webfonts") { Remove-Item "static/webfonts" -Recurse -Force }
    @Copy-Item "_tmp/fontawesome-free-{{ fa_version }}-web/webfonts" -Destination "static/webfonts" -Recurse -Force
    @Remove-Item "fontawesome.zip" -Force; Remove-Item "_tmp" -Recurse -Force
    @echo "  done."

[private, unix]
_dl-katex:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Installing KaTeX {{ katex_version }}..."
    curl -fsSL "https://github.com/KaTeX/KaTeX/releases/download/v{{ katex_version }}/katex.zip" -o katex.zip
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
    @echo "Installing KaTeX {{ katex_version }}..."
    @Invoke-WebRequest -Uri "https://github.com/KaTeX/KaTeX/releases/download/v{{ katex_version }}/katex.zip" -OutFile "katex.zip"
    @Expand-Archive -Path "katex.zip" -DestinationPath "_tmp" -Force
    @Copy-Item "_tmp/katex/katex.min.css" -Destination "static/css/katex.min.css" -Force
    @(Get-Content "static/css/katex.min.css" -Raw) -replace 'url\(fonts/', 'url(../fonts/katex/' | Set-Content "static/css/katex.min.css"
    @Copy-Item "_tmp/katex/katex.min.js" -Destination "static/js/katex.min.js" -Force
    @if (Test-Path "static/fonts/katex") { Remove-Item "static/fonts/katex" -Recurse -Force }
    @Copy-Item "_tmp/katex/fonts" -Destination "static/fonts/katex" -Recurse -Force
    @Remove-Item "katex.zip" -Force; Remove-Item "_tmp" -Recurse -Force
    @echo "  done."

# ---------------------------------------------------------------------------
# Development
# ---------------------------------------------------------------------------

[doc("Build CSS then start Zola dev server (blocking)")]
[group('dev')]
dev: css
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
build: clean css
    zola build

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
        "zola" "https://www.getzola.org/documentation/getting-started/installation/"
    check "$(test -f '{{ tailwind }}' && echo true || echo false)" \
        "tailwind cli" "run: just setup"
    check "$(test -f src/daisyui.js && echo true || echo false)" \
        "daisyui" "run: just setup"
    check "$(test -f static/css/font-awesome.min.css && echo true || echo false)" \
        "font awesome" "run: just setup"
    check "$(test -f static/css/katex.min.css && echo true || echo false)" \
        "katex" "run: just setup"
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
    @if (Get-Command zola -ErrorAction SilentlyContinue) { echo "  [ok]  zola" } else { echo "  [!!]  zola -- https://www.getzola.org/documentation/getting-started/installation/" }
    @if (Test-Path "{{ tailwind }}") { echo "  [ok]  tailwind cli" } else { echo "  [!!]  tailwind cli -- run: just setup" }
    @if (Test-Path "src/daisyui.js") { echo "  [ok]  daisyui" } else { echo "  [!!]  daisyui -- run: just setup" }
    @if (Test-Path "static/css/font-awesome.min.css") { echo "  [ok]  font awesome" } else { echo "  [!!]  font awesome -- run: just setup" }
    @if (Test-Path "static/css/katex.min.css") { echo "  [ok]  katex" } else { echo "  [!!]  katex -- run: just setup" }
    @if (Test-Path "{{ css_out }}") { echo "  [ok]  compiled css" } else { echo "  [!!]  compiled css -- run: just css" }

[unix]
[doc("Print versions of key tools")]
[group('info')]
versions:
    @echo "zola:     $(zola --version 2>/dev/null || echo 'not found')"
    @echo "tailwind: $({{ tailwind }} --help 2>&1 | head -1 | sed 's/.*tailwindcss //' || echo 'not found')"
    @echo "os:       {{ os }}"

[windows]
[doc("Print versions of key tools")]
[group('info')]
versions:
    @$z = try { zola --version 2>&1 } catch { "not found" }; echo "zola:     $z"
    @$t = try { (& {{ tailwind }} --help 2>&1 | Select-Object -First 1) -replace '.*tailwindcss\s+','' } catch { "not found" }; echo "tailwind: $t"
    @echo "os:       {{ os }}"


