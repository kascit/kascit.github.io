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
dui_css_in  := "src/dui-export.css"
dui_css_out := "static/css/dui.css"

tailwind := if os == "windows" { "tools/tailwindcss.exe" } else { "tools/tailwindcss" }

# Versions — sourced from versions.env via set dotenv-load
zola_version     := env_var("ZOLA_VERSION")
tailwind_version := env_var("TAILWIND_VERSION")
daisyui_version  := env_var("DAISYUI_VERSION")
fa_version       := env_var("FA_VERSION")
katex_version    := env_var("KATEX_VERSION")

# ---------------------------------------------------------------------------
# Default
# ---------------------------------------------------------------------------

[doc("List available commands")]
default:
    @just help

[unix]
[doc("Show curated command guide with grouped workflows")]
[group('info')]
help:
    #!/usr/bin/env bash
    set -euo pipefail
    cyan='\033[36m'; green='\033[32m'; yellow='\033[33m'; reset='\033[0m'
    echo -e "${cyan}kascit build command center${reset}"
    echo -e "${yellow}quick start${reset}"
    echo "  just setup        # install/update vendored tool assets"
    echo "  just dev          # full dev (sync generated + css + zola serve)"
    echo "  just dev-fast     # faster dev (skip generated content refresh)"
    echo ""
    echo -e "${yellow}quality gates${reset}"
    echo "  just quality      # strict JS/CSS/XML-XSL/Tera validation"
    echo "  just check        # zola syntax + generated content verification"
    echo "  just ci-build     # full CI-equivalent pipeline"
    echo ""
    echo -e "${yellow}build and release${reset}"
    echo "  just build        # production build + fingerprinted assets"
    echo "  just clean        # remove build artifacts"
    echo ""
    echo -e "${yellow}data pipelines${reset}"
    echo "  just sync-generated   # refresh project pages, about tags, widget data"
    echo "  just project-pages    # regenerate project markdown pages"
    echo "  just about-skill-tags # sync About taxonomy tags from tag chips"
    echo "  just widget-data      # regenerate latest-posts widget data"
    echo ""
    echo -e "${green}full command list:${reset}"
    just --list

[windows]
[doc("Show curated command guide with grouped workflows")]
[group('info')]
help:
    @Write-Host "kascit build command center" -ForegroundColor Cyan
    @Write-Host "quick start" -ForegroundColor Yellow
    @Write-Host "  just setup        # install/update vendored tool assets"
    @Write-Host "  just dev          # full dev (sync generated + css + zola serve)"
    @Write-Host "  just dev-fast     # faster dev (skip generated content refresh)"
    @Write-Host ""
    @Write-Host "quality gates" -ForegroundColor Yellow
    @Write-Host "  just quality      # strict JS/CSS/XML-XSL/Tera validation"
    @Write-Host "  just check        # zola syntax + generated content verification"
    @Write-Host "  just ci-build     # full CI-equivalent pipeline"
    @Write-Host ""
    @Write-Host "build and release" -ForegroundColor Yellow
    @Write-Host "  just build        # production build + fingerprinted assets"
    @Write-Host "  just clean        # remove build artifacts"
    @Write-Host ""
    @Write-Host "data pipelines" -ForegroundColor Yellow
    @Write-Host "  just sync-generated   # refresh project pages, about tags, widget data"
    @Write-Host "  just project-pages    # regenerate project markdown pages"
    @Write-Host "  just about-skill-tags # sync About taxonomy tags from tag chips"
    @Write-Host "  just widget-data      # regenerate latest-posts widget data"
    @Write-Host ""
    @Write-Host "full command list:" -ForegroundColor Green
    @just --list

# ---------------------------------------------------------------------------
# Setup
# ---------------------------------------------------------------------------

[doc("Download or update all third-party dependencies")]
[group('setup')]
setup: _dl-tailwind _dl-daisyui _dl-fontawesome _dl-katex
    @node scripts/just-log.js ok "Dependency setup complete. Run 'just dev' to start."

[doc("Install minimal build deps required for CSS (Tailwind + DaisyUI)")]
[group('setup')]
setup-build-deps: _ensure-tailwind _ensure-daisyui

[private, unix]
_assert-zola-version:
        #!/usr/bin/env bash
        set -euo pipefail
        if ! command -v zola >/dev/null 2>&1; then
            echo "ERROR: zola is not installed."
            echo "Install zola v${ZOLA_VERSION} (see CI and versions.env)."
            exit 1
        fi
        installed="$(zola --version | awk '{print $2}')"
        if [ "$installed" != "${ZOLA_VERSION}" ]; then
            echo "ERROR: zola version mismatch. installed=$installed required=${ZOLA_VERSION}."
            echo "Update local zola to match versions.env so local and CI behave identically."
            exit 1
        fi

[private]
[windows]
_assert-zola-version:
        @if (!(Get-Command zola -ErrorAction SilentlyContinue)) { Write-Host "ERROR: zola is not installed."; Write-Host "Install zola v{{ zola_version }} (see CI and versions.env)."; exit 1 }
        @$installed = (zola --version 2>&1 | Select-Object -First 1).Split(' ')[1]; if ($installed -ne "{{ zola_version }}") { Write-Host "ERROR: zola version mismatch. installed=$installed required={{ zola_version }}."; Write-Host "Update local zola to match versions.env so local and CI behave identically."; exit 1 }

[private, unix]
_ensure-tailwind:
    #!/usr/bin/env bash
    set -euo pipefail
        if [ -x "{{ tailwind }}" ] && [ -s "{{ tailwind }}" ]; then
      echo "Tailwind CSS binary already present."
      exit 0
    fi
    just _dl-tailwind

[private]
[windows]
_ensure-tailwind:
    @if ((Test-Path "{{ tailwind }}") -and ((Get-Item "{{ tailwind }}").Length -gt 0)) { Write-Host "Tailwind CSS binary already present." } else { just _dl-tailwind }

[private, unix]
_ensure-daisyui:
    #!/usr/bin/env bash
    set -euo pipefail
    if [ -f "src/vendor/daisyui.js" ] && [ -f "src/vendor/daisyui-theme.js" ]; then
      echo "DaisyUI vendor files already present."
      exit 0
    fi
    just _dl-daisyui

[private]
[windows]
_ensure-daisyui:
    @if ((Test-Path "src/vendor/daisyui.js") -and (Test-Path "src/vendor/daisyui-theme.js")) { Write-Host "DaisyUI vendor files already present." } else { just _dl-daisyui }

[private, unix]
_dl-tailwind:
    #!/usr/bin/env bash
    set -euo pipefail
        os_name="linux"
        arch_name="x64"
        uname_s="$(uname -s | tr '[:upper:]' '[:lower:]')"
        uname_m="$(uname -m)"

        if [ "$uname_s" = "darwin" ]; then
            os_name="macos"
        fi

        if [ "$uname_m" = "aarch64" ] || [ "$uname_m" = "arm64" ]; then
            arch_name="arm64"
    fi

        url="https://github.com/tailwindlabs/tailwindcss/releases/download/v${TAILWIND_VERSION}/tailwindcss-${os_name}-${arch_name}"
        target="{{ tailwind }}"
        target_dir="$(dirname "$target")"
        tmp_file="${target}.tmp"

    echo "Installing Tailwind CSS v${TAILWIND_VERSION}..."
        mkdir -p "$target_dir"
        curl --fail --location --silent --show-error --retry 3 --retry-all-errors "$url" -o "$tmp_file"
        chmod +x "$tmp_file"
        mv -f "$tmp_file" "$target"
    echo "  done."

[private]
[windows]
_dl-tailwind:
    @$url = "https://github.com/tailwindlabs/tailwindcss/releases/download/v$env:TAILWIND_VERSION/tailwindcss-windows-x64.exe"; $target = "{{ tailwind }}"; $targetDir = Split-Path -Parent $target; if (!(Test-Path $targetDir)) { New-Item -ItemType Directory -Path $targetDir | Out-Null }; echo "Installing Tailwind CSS v$env:TAILWIND_VERSION..."; Invoke-WebRequest -Uri $url -OutFile "$target.tmp"; Move-Item -Force "$target.tmp" $target; echo "  done."

[private, unix]
_dl-daisyui:
    #!/usr/bin/env bash
    set -euo pipefail
    echo "Installing DaisyUI v${DAISYUI_VERSION}..."
    mkdir -p src/vendor
    curl -fsSL "https://github.com/saadeghi/daisyui/releases/download/v${DAISYUI_VERSION}/daisyui.js" -o src/vendor/daisyui.js
    curl -fsSL "https://github.com/saadeghi/daisyui/releases/download/v${DAISYUI_VERSION}/daisyui-theme.js" -o src/vendor/daisyui-theme.js
    echo "  done."

[private]
[windows]
_dl-daisyui:
    @echo "Installing DaisyUI v$env:DAISYUI_VERSION..."; if (!(Test-Path "src/vendor")) { New-Item -ItemType Directory -Path "src/vendor" | Out-Null }; Invoke-WebRequest -Uri "https://github.com/saadeghi/daisyui/releases/download/v$env:DAISYUI_VERSION/daisyui.js" -OutFile "src/vendor/daisyui.js"; Invoke-WebRequest -Uri "https://github.com/saadeghi/daisyui/releases/download/v$env:DAISYUI_VERSION/daisyui-theme.js" -OutFile "src/vendor/daisyui-theme.js"; echo "  done."

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
dev:
    @node scripts/just-log.js step "Development pipeline"
    @node scripts/just-run.js "clean public output" -- just --quiet clean-public
    @node scripts/just-run.js "sync-generated" -- just --quiet sync-generated
    @node scripts/just-run.js "css build" -- just --quiet css
    @node scripts/just-log.js ok "Starting Zola dev server (use the URL printed by Zola below)"
    @zola serve --interface 127.0.0.1 --port 1111

[doc("Fast dev server: skip generated-content refresh")]
[group('dev')]
dev-fast:
    @node scripts/just-log.js step "Fast development pipeline"
    @node scripts/just-run.js "clean public output" -- just --quiet clean-public
    @node scripts/just-run.js "css build" -- just --quiet css
    @node scripts/just-log.js warn "Fast mode enabled: generated content refresh skipped"
    @node scripts/just-log.js ok "Starting Zola dev server (use the URL printed by Zola below)"
    @zola serve --interface 127.0.0.1 --port 1111

[doc("Watch CSS for changes (blocking)")]
[group('dev')]
watch:
    @node scripts/just-log.js info "Watching CSS changes"
    @{{ tailwind }} -i {{ css_in }} -o {{ css_out }} --watch

# ---------------------------------------------------------------------------
# Build
# ---------------------------------------------------------------------------

[doc("Compile and minify CSS")]
[group('build')]
css: setup-build-deps
    @node scripts/just-log.js info "Compiling main CSS bundle"
    @node scripts/just-run.js "compile main css" -- {{ tailwind }} -i {{ css_in }} -o {{ css_out }} --minify
    @node scripts/just-log.js info "Compiling shell CSS bundle"
    @node scripts/just-run.js "compile shell css" -- {{ tailwind }} -i {{ dui_css_in }} -o {{ dui_css_out }} --minify
    @node scripts/just-log.js ok "CSS build complete"

[unix]
[doc("Remove all build artifacts")]
[group('build')]
clean:
    rm -rf public
    rm -f {{ css_out }}
    rm -f {{ dui_css_out }}

[windows]
[doc("Remove all build artifacts")]
[group('build')]
clean:
    @if (Test-Path "public") { cmd /c rmdir /s /q public }
    @if (Test-Path "{{ css_out }}") { Remove-Item "{{ css_out }}" -Force }
    @if (Test-Path "{{ dui_css_out }}") { Remove-Item "{{ dui_css_out }}" -Force }

[unix]
[doc("Remove only generated public output")]
[group('build')]
clean-public:
    rm -rf public

[windows]
[doc("Remove only generated public output")]
[group('build')]
clean-public:
    @if (Test-Path "public") { cmd /c rmdir /s /q public }

[unix]
[doc("Full production build (clean + generated content + css + zola)")]
[group('build')]
build: clean project-pages about-skill-tags widget-data css
        #!/usr/bin/env bash
        set -euo pipefail
        node scripts/just-log.js step "Production build"
        if [ -n "${ZOLA_BASE_URL:-}" ]; then
            node scripts/just-log.js info "Building site with custom base URL"
            node scripts/just-run.js "zola build" -- zola build --base-url "$ZOLA_BASE_URL"
        else
            node scripts/just-log.js info "Building site"
            node scripts/just-run.js "zola build" -- zola build
        fi
        node scripts/just-log.js info "Cleaning Zola pagination redirect stubs"
        node scripts/just-run.js "clean pagination redirects" -- node scripts/clean-pagination-redirects.js
        node scripts/just-log.js info "Fingerprinting static assets"
        node scripts/just-run.js "fingerprint assets" -- node scripts/fingerprint-assets.js public
        node scripts/just-log.js ok "Production build complete"

[windows]
[doc("Full production build (clean + generated content + css + zola)")]
[group('build')]
build: clean project-pages about-skill-tags widget-data css
    @node scripts/just-log.js step "Production build"
    @if ($env:ZOLA_BASE_URL) { node scripts/just-run.js "zola build" -- zola build --base-url "$env:ZOLA_BASE_URL" } else { node scripts/just-run.js "zola build" -- zola build }
    @node scripts/just-log.js info "Cleaning Zola pagination redirect stubs"
    @node scripts/just-run.js "clean pagination redirects" -- node scripts/clean-pagination-redirects.js
    @node scripts/just-log.js info "Fingerprinting static assets"
    @node scripts/just-run.js "fingerprint assets" -- node scripts/fingerprint-assets.js public
    @node scripts/just-log.js ok "Production build complete"

[doc("Generate project detail pages from centralized data/projects.json")]
[group('build')]
project-pages:
    @node scripts/just-log.js info "Validating project catalog"
    @node scripts/just-run.js "validate project catalog" -- node scripts/validate-project-data.js
    @node scripts/just-log.js info "Syncing project markdown pages"
    @node scripts/just-run.js "sync project pages" -- node scripts/sync-project-pages.js
    @node scripts/just-log.js ok "Project pages refreshed"

[doc("Refresh all generated content artifacts")]
[group('build')]
sync-generated:
    @node scripts/just-log.js step "Refreshing generated content"
    @node scripts/just-run.js "project pages" -- just --quiet project-pages
    @node scripts/just-run.js "about skill tags" -- just --quiet about-skill-tags
    @node scripts/just-run.js "widget data" -- just --quiet widget-data
    @node scripts/just-log.js ok "Generated content is up to date"

[doc("Generate latest-posts widget data from blog content")]
[group('build')]
widget-data:
    @node scripts/just-log.js info "Generating latest-posts widget data"
    @node scripts/just-run.js "generate widget data" -- node scripts/generate-latest-posts-widget.js
    @node scripts/just-log.js ok "Widget data refreshed"

[doc("Sync About-page taxonomy tags from tag_chip entries")]
[group('build')]
about-skill-tags:
    @node scripts/just-log.js info "Syncing About skill tags"
    @node scripts/just-run.js "sync about skill tags" -- node scripts/sync-about-skill-tags.js
    @node scripts/just-log.js ok "About taxonomy tags refreshed"

[unix]
[doc("Fail if generated content differs from committed files")]
[group('ci')]
verify-generated-clean: project-pages about-skill-tags widget-data
    #!/usr/bin/env bash
    set -euo pipefail
        if ! git diff --quiet -- content/projects content/about.md static/widgets/latest-posts-data.json; then
            echo "ERROR: Generated content is out of sync."
            echo "Run 'just project-pages about-skill-tags widget-data' and commit changes."
            git --no-pager diff -- content/projects content/about.md static/widgets/latest-posts-data.json
      exit 1
    fi

[windows]
[doc("Fail if generated content differs from committed files")]
[group('ci')]
verify-generated-clean: project-pages about-skill-tags widget-data
    @git diff --quiet -- content/projects content/about.md static/widgets/latest-posts-data.json; if ($LASTEXITCODE -ne 0) { Write-Host "ERROR: Generated content is out of sync."; Write-Host "Run 'just project-pages about-skill-tags widget-data' and commit changes."; git --no-pager diff -- content/projects content/about.md static/widgets/latest-posts-data.json; exit 1 }

[unix]
[doc("Validate required output artifacts in public/")]
[group('ci')]
validate-public:
    #!/usr/bin/env bash
    set -euo pipefail
    [ -f public/index.html ] || { echo "ERROR: index.html missing"; exit 1; }
    [ -f public/404.html ] || { echo "ERROR: 404.html missing"; exit 1; }
    [ -d public/css ] || { echo "ERROR: css directory missing"; exit 1; }
    file_count=$(find public -type f | wc -l)
    echo "Generated ${file_count} files"
    [ "$file_count" -gt 0 ] || { echo "ERROR: No files generated"; exit 1; }

[windows]
[doc("Validate required output artifacts in public/")]
[group('ci')]
validate-public:
    @if (!(Test-Path "public/index.html")) { Write-Host "ERROR: index.html missing"; exit 1 }
    @if (!(Test-Path "public/404.html")) { Write-Host "ERROR: 404.html missing"; exit 1 }
    @if (!(Test-Path "public/css")) { Write-Host "ERROR: css directory missing"; exit 1 }
    @$file_count = (Get-ChildItem public -Recurse -File | Measure-Object).Count; Write-Host "Generated $file_count files"; if ($file_count -le 0) { Write-Host "ERROR: No files generated"; exit 1 }

[unix]
[doc("CI pipeline: verify generated files, build, minify JS, validate output")]
[group('ci')]
ci-build: _assert-zola-version verify-generated-clean
    #!/usr/bin/env bash
    set -euo pipefail
    node scripts/just-log.js step "CI build pipeline"
    node scripts/just-log.js info "Cleaning workspace"
    node scripts/just-run.js "clean" -- just clean
    node scripts/just-log.js info "Compiling CSS"
    node scripts/just-run.js "css build" -- just css
    node scripts/just-log.js info "Running integrated quality checks"
    node scripts/just-run.js "quality checks" -- node scripts/run-quality-checks.js
    if [ -n "${ZOLA_BASE_URL:-}" ]; then
      node scripts/just-log.js info "Building site with custom base URL"
      node scripts/just-run.js "zola build" -- zola build --base-url "$ZOLA_BASE_URL"
    else
      node scripts/just-log.js info "Building site"
      node scripts/just-run.js "zola build" -- zola build
    fi
    node scripts/just-log.js info "Cleaning Zola pagination redirect stubs"
    node scripts/just-run.js "clean pagination redirects" -- node scripts/clean-pagination-redirects.js
    node scripts/just-log.js info "Optimizing JavaScript"
    node scripts/just-run.js "minify javascript" -- node scripts/minify-js.js public
    node scripts/just-log.js info "Fingerprinting static assets"
    node scripts/just-run.js "fingerprint assets" -- node scripts/fingerprint-assets.js public
    node scripts/just-log.js info "Validating public output"
    node scripts/just-run.js "validate public output" -- just validate-public
    node scripts/just-log.js ok "CI build pipeline complete"

[windows]
[doc("CI pipeline: verify generated files, build, minify JS, validate output")]
[group('ci')]
ci-build: _assert-zola-version verify-generated-clean
    @node scripts/just-log.js step "CI build pipeline"
    @node scripts/just-log.js info "Cleaning workspace"
    @node scripts/just-run.js "clean" -- just clean
    @node scripts/just-log.js info "Compiling CSS"
    @node scripts/just-run.js "css build" -- just css
    @node scripts/just-log.js info "Running integrated quality checks"
    @node scripts/just-run.js "quality checks" -- node scripts/run-quality-checks.js
    @node scripts/just-log.js info "Building site"
    @if ($env:ZOLA_BASE_URL) { node scripts/just-run.js "zola build" -- zola build --base-url "$env:ZOLA_BASE_URL" } else { node scripts/just-run.js "zola build" -- zola build }
    @node scripts/just-log.js info "Cleaning Zola pagination redirect stubs"
    @node scripts/just-run.js "clean pagination redirects" -- node scripts/clean-pagination-redirects.js
    @node scripts/just-log.js info "Optimizing JavaScript"
    @node scripts/just-run.js "minify javascript" -- node scripts/minify-js.js public
    @node scripts/just-log.js info "Fingerprinting static assets"
    @node scripts/just-run.js "fingerprint assets" -- node scripts/fingerprint-assets.js public
    @node scripts/just-log.js info "Validating public output"
    @node scripts/just-run.js "validate public output" -- just validate-public
    @node scripts/just-log.js ok "CI build pipeline complete"

[doc("Run strict integrated quality checks (JS/CSS/XML/XSL/Tera)")]
[group('ci')]
quality: _assert-zola-version verify-generated-clean
    @node scripts/just-log.js info "Running integrated quality checks"
    @node scripts/just-run.js "quality checks" -- node scripts/run-quality-checks.js
    @node scripts/just-log.js ok "Integrated quality checks passed"

[unix]
[doc("Quick local quality checks (delegates to integrated quality recipe)")]
[group('ci')]
check: quality
    @node scripts/just-log.js ok "Checks passed"

[windows]
[doc("Quick local quality checks (delegates to integrated quality recipe)")]
[group('ci')]
check: quality
    @node scripts/just-log.js ok "Checks passed"

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
    check "$(test -f src/vendor/daisyui.js && echo true || echo false)" \
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
    @if (Test-Path "src/vendor/daisyui.js") { Write-Host "  [ok]  daisyui v{{ daisyui_version }}" } else { Write-Host "  [!!]  daisyui -- run: just setup" }
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
