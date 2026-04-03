#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
ICON_DIR="$ROOT_DIR/static/icons"
SRC_SVG="${1:-$ICON_DIR/favicon.svg}"
GEN_DIR="$ROOT_DIR/scripts/.tmp-icons"

# Visual palettes
LIGHT_BG="#ffffff"
LIGHT_FG="#111827"
DARK_BG="#0b1220"
DARK_FG="#e5e7eb"
MUTED_FG="#9ca3af"

if [[ ! -f "$SRC_SVG" ]]; then
  echo "Source SVG not found: $SRC_SVG" >&2
  exit 1
fi

render_from_source() {
  local src="$1"
  local size="$2"
  local bg="$3"
  local out="$4"
  local logo_percent="$5"
  local tint="$6"
  local logo_width=$((size * logo_percent / 100))

  if [[ "$bg" == "none" ]]; then
    magick \
      -size "${size}x${size}" xc:none \
      \( -background none "$src" -resize "${logo_width}x" -alpha set -channel RGB -fill "$tint" -colorize 100 +channel \) \
      -gravity center -compose over -composite \
      -colorspace sRGB -type TrueColorMatte -define png:color-type=6 \
      "$out"
  else
    magick \
      -size "${size}x${size}" "xc:${bg}" \
      \( -background none "$src" -resize "${logo_width}x" -alpha set -channel RGB -fill "$tint" -colorize 100 +channel \) \
      -gravity center -compose over -composite \
      -alpha off -colorspace sRGB -type TrueColor -define png:color-type=2 \
      "$out"
  fi
}

render_icon() {
  local size="$1"
  local bg="$2"
  local out="$3"
  local logo_percent="$4"
  local tint="${5:-#000000}"
  render_from_source "$SRC_SVG" "$size" "$bg" "$out" "$logo_percent" "$tint"
}

render_svg_icon() {
  local svg="$1"
  local size="$2"
  local bg="$3"
  local out="$4"
  local icon_percent="$5"
  local tint="${6:-#000000}"
  render_from_source "$svg" "$size" "$bg" "$out" "$icon_percent" "$tint"
}

write_fa_svg() {
  local out="$1"
  local width="$2"
  local height="$3"
  local path_data="$4"
  cat > "$out" <<EOF
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" fill="none">
  <path d="${path_data}" fill="#000000"/>
</svg>
EOF
}

copy_alias() {
  local src="$1"
  local dst="$2"
  cp "$src" "$dst"
}

generate_shortcut_family() {
  local name="$1"
  local svg="$2"

  # Default shortcut style: dark tile + light glyph (matches navbar feel)
  render_svg_icon "$svg" 96  "$DARK_BG"  "$ICON_DIR/${name}-96.png"               58 "$DARK_FG"
  render_svg_icon "$svg" 192 "$DARK_BG"  "$ICON_DIR/${name}.png"                  58 "$DARK_FG"
  render_svg_icon "$svg" 512 "$DARK_BG"  "$ICON_DIR/${name}-512.png"              58 "$DARK_FG"

  # Alternate light theme tiles
  render_svg_icon "$svg" 192 "$LIGHT_BG" "$ICON_DIR/${name}-light.png"            58 "$LIGHT_FG"
  render_svg_icon "$svg" 512 "$LIGHT_BG" "$ICON_DIR/${name}-light-512.png"        58 "$LIGHT_FG"

  # Transparent variants for launcher blending
  render_svg_icon "$svg" 192 none         "$ICON_DIR/${name}-transparent.png"       58 "$MUTED_FG"
  render_svg_icon "$svg" 512 none         "$ICON_DIR/${name}-transparent-512.png"   58 "$MUTED_FG"

  # Maskable variants with safer insets
  render_svg_icon "$svg" 192 "$DARK_BG"  "$ICON_DIR/${name}-maskable.png"          48 "$DARK_FG"
  render_svg_icon "$svg" 512 "$DARK_BG"  "$ICON_DIR/${name}-maskable-512.png"      48 "$DARK_FG"
}

rm -rf "$GEN_DIR"
mkdir -p "$ICON_DIR" "$GEN_DIR"

# Browser favicons (maximal practical favicon matrix)
for s in 16 32 48 64 96 128; do
  render_icon "$s" "$LIGHT_BG" "$ICON_DIR/favicon-${s}x${s}.png" 84 "$LIGHT_FG"
  render_icon "$s" none        "$ICON_DIR/favicon-${s}x${s}-transparent.png" 84 "$LIGHT_FG"
done

# Apple touch icons (common iOS set)
for s in 120 152 167 180; do
  render_icon "$s" "$LIGHT_BG" "$ICON_DIR/apple-touch-icon-${s}x${s}.png" 76 "$LIGHT_FG"
  render_icon "$s" none        "$ICON_DIR/apple-touch-icon-${s}x${s}-transparent.png" 76 "$LIGHT_FG"
done

# Canonical apple touch alias
cp "$ICON_DIR/apple-touch-icon-180x180.png" "$ICON_DIR/apple-touch-icon.png"

# Any-purpose PWA icons: light + dark + transparent + monochrome
render_icon 192 "$LIGHT_BG" "$ICON_DIR/icon-192x192.png"             74 "$LIGHT_FG"
render_icon 512 "$LIGHT_BG" "$ICON_DIR/icon-512x512.png"             74 "$LIGHT_FG"
render_icon 192 "$DARK_BG"  "$ICON_DIR/icon-192x192-dark.png"        74 "$DARK_FG"
render_icon 512 "$DARK_BG"  "$ICON_DIR/icon-512x512-dark.png"        74 "$DARK_FG"
render_icon 192 none         "$ICON_DIR/icon-192x192-transparent.png" 74 "$LIGHT_FG"
render_icon 512 none         "$ICON_DIR/icon-512x512-transparent.png" 74 "$LIGHT_FG"
render_icon 192 none         "$ICON_DIR/icon-192x192-monochrome.png"  74 "$LIGHT_FG"
render_icon 512 none         "$ICON_DIR/icon-512x512-monochrome.png"  74 "$LIGHT_FG"

# Maskable PWA icons: light + dark + transparent
render_icon 192 "$LIGHT_BG" "$ICON_DIR/icon-192x192-maskable.png"             66 "$LIGHT_FG"
render_icon 512 "$LIGHT_BG" "$ICON_DIR/icon-512x512-maskable.png"             66 "$LIGHT_FG"
render_icon 192 "$DARK_BG"  "$ICON_DIR/icon-192x192-maskable-dark.png"        66 "$DARK_FG"
render_icon 512 "$DARK_BG"  "$ICON_DIR/icon-512x512-maskable-dark.png"        66 "$DARK_FG"
render_icon 192 none         "$ICON_DIR/icon-192x192-maskable-transparent.png" 66 "$LIGHT_FG"
render_icon 512 none         "$ICON_DIR/icon-512x512-maskable-transparent.png" 66 "$LIGHT_FG"

# Compatibility aliases commonly requested by browsers/tools
copy_alias "$ICON_DIR/icon-192x192.png" "$ICON_DIR/android-chrome-192x192.png"
copy_alias "$ICON_DIR/icon-512x512.png" "$ICON_DIR/android-chrome-512x512.png"
copy_alias "$ICON_DIR/icon-192x192-dark.png" "$ICON_DIR/android-chrome-192x192-dark.png"
copy_alias "$ICON_DIR/icon-512x512-dark.png" "$ICON_DIR/android-chrome-512x512-dark.png"
copy_alias "$ICON_DIR/icon-192x192-maskable.png" "$ICON_DIR/android-chrome-192x192-maskable.png"
copy_alias "$ICON_DIR/icon-512x512-maskable.png" "$ICON_DIR/android-chrome-512x512-maskable.png"
copy_alias "$ICON_DIR/icon-192x192-maskable-dark.png" "$ICON_DIR/android-chrome-192x192-maskable-dark.png"
copy_alias "$ICON_DIR/icon-512x512-maskable-dark.png" "$ICON_DIR/android-chrome-512x512-maskable-dark.png"
copy_alias "$ICON_DIR/icon-192x192-transparent.png" "$ICON_DIR/android-chrome-192x192-transparent.png"
copy_alias "$ICON_DIR/icon-512x512-transparent.png" "$ICON_DIR/android-chrome-512x512-transparent.png"
copy_alias "$ICON_DIR/icon-192x192-maskable-transparent.png" "$ICON_DIR/android-chrome-192x192-maskable-transparent.png"
copy_alias "$ICON_DIR/icon-512x512-maskable-transparent.png" "$ICON_DIR/android-chrome-512x512-maskable-transparent.png"

# Shortcut icon families
# Font Awesome paths (fetched from @fortawesome/free-solid-svg-icons)
FA_USER='M224 248a120 120 0 1 0 0-240 120 120 0 1 0 0 240zm-29.7 56C95.8 304 16 383.8 16 482.3 16 498.7 29.3 512 45.7 512l356.6 0c16.4 0 29.7-13.3 29.7-29.7 0-98.5-79.8-178.3-178.3-178.3l-59.4 0z'
FA_CODE='M360.8 1.2c-17-4.9-34.7 5-39.6 22l-128 448c-4.9 17 5 34.7 22 39.6s34.7-5 39.6-22l128-448c4.9-17-5-34.7-22-39.6zm64.6 136.1c-12.5 12.5-12.5 32.8 0 45.3l73.4 73.4-73.4 73.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0l96-96c12.5-12.5 12.5-32.8 0-45.3l-96-96c-12.5-12.5-32.8-12.5-45.3 0zm-274.7 0c-12.5-12.5-32.8-12.5-45.3 0l-96 96c-12.5 12.5-12.5 32.8 0 45.3l96 96c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L77.3 256 150.6 182.6c12.5-12.5 12.5-32.8 0-45.3z'
FA_LINK='M419.5 96c-16.6 0-32.7 4.5-46.8 12.7-15.8-16-34.2-29.4-54.5-39.5 28.2-24 64.1-37.2 101.3-37.2 86.4 0 156.5 70 156.5 156.5 0 41.5-16.5 81.3-45.8 110.6l-71.1 71.1c-29.3 29.3-69.1 45.8-110.6 45.8-86.4 0-156.5-70-156.5-156.5 0-1.5 0-3 .1-4.5 .5-17.7 15.2-31.6 32.9-31.1s31.6 15.2 31.1 32.9c0 .9 0 1.8 0 2.6 0 51.1 41.4 92.5 92.5 92.5 24.5 0 48-9.7 65.4-27.1l71.1-71.1c17.3-17.3 27.1-40.9 27.1-65.4 0-51.1-41.4-92.5-92.5-92.5zM275.2 173.3c-1.9-.8-3.8-1.9-5.5-3.1-12.6-6.5-27-10.2-42.1-10.2-24.5 0-48 9.7-65.4 27.1L91.1 258.2c-17.3 17.3-27.1 40.9-27.1 65.4 0 51.1 41.4 92.5 92.5 92.5 16.5 0 32.6-4.4 46.7-12.6 15.8 16 34.2 29.4 54.6 39.5-28.2 23.9-64 37.2-101.3 37.2-86.4 0-156.5-70-156.5-156.5 0-41.5 16.5-81.3 45.8-110.6l71.1-71.1c29.3-29.3 69.1-45.8 110.6-45.8 86.6 0 156.5 70.6 156.5 156.9 0 1.3 0 2.6 0 3.9-.4 17.7-15.1 31.6-32.8 31.2s-31.6-15.1-31.2-32.8c0-.8 0-1.5 0-2.3 0-33.7-18-63.3-44.8-79.6z'
FA_PEN_NIB='M368.5 18.3l-50.1 50.1 125.3 125.3 50.1-50.1c21.9-21.9 21.9-57.3 0-79.2L447.7 18.3c-21.9-21.9-57.3-21.9-79.2 0zM279.3 97.2l-.5 .1-144.1 43.2c-19.9 6-35.7 21.2-42.3 41L3.8 445.8c-2.9 8.7-1.9 18.2 2.5 26L161.7 316.4c-1.1-4-1.6-8.1-1.6-12.4 0-26.5 21.5-48 48-48s48 21.5 48 48-21.5 48-48 48c-4.3 0-8.5-.6-12.4-1.6L40.3 505.7c7.8 4.4 17.2 5.4 26 2.5l264.3-88.6c19.7-6.6 35-22.4 41-42.3l43.2-144.1 .1-.5-135.5-135.5z'

write_fa_svg "$GEN_DIR/about.svg" 448 512 "$FA_USER"
write_fa_svg "$GEN_DIR/projects.svg" 576 512 "$FA_CODE"
write_fa_svg "$GEN_DIR/links.svg" 576 512 "$FA_LINK"
write_fa_svg "$GEN_DIR/blog.svg" 512 512 "$FA_PEN_NIB"

generate_shortcut_family "about" "$GEN_DIR/about.svg"
generate_shortcut_family "projects" "$GEN_DIR/projects.svg"
generate_shortcut_family "links" "$GEN_DIR/links.svg"
generate_shortcut_family "blog" "$GEN_DIR/blog.svg"

# Backward compatibility
copy_alias "$ICON_DIR/projects.png" "$ICON_DIR/tasks.png"

# Multi-size ICO (solid for stronger tab visibility)
magick \
  "$ICON_DIR/favicon-16x16.png" \
  "$ICON_DIR/favicon-32x32.png" \
  "$ICON_DIR/favicon-48x48.png" \
  "$ICON_DIR/favicon-64x64.png" \
  "$ICON_DIR/favicon.ico"

# Optional transparent ICO variant
magick \
  "$ICON_DIR/favicon-16x16-transparent.png" \
  "$ICON_DIR/favicon-32x32-transparent.png" \
  "$ICON_DIR/favicon-48x48-transparent.png" \
  "$ICON_DIR/favicon-64x64-transparent.png" \
  "$ICON_DIR/favicon-transparent.ico"

# Root aliases for consumers that request /favicon.ico directly
cp "$ICON_DIR/favicon.ico" "$ROOT_DIR/static/favicon.ico"
cp "$ICON_DIR/favicon.svg" "$ROOT_DIR/static/favicon.svg"

rm -rf "$GEN_DIR"

echo "Icon generation complete from: $SRC_SVG"
