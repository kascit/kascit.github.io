#!/usr/bin/env bash
set -euo pipefail

output_dir="${1:-public}"
terser_version="${TERSER_VERSION:-5.31.6}"
esbuild_version="${ESBUILD_VERSION:-0.24.2}"

if ! command -v npx >/dev/null 2>&1; then
  echo "ERROR: npx is required for JS minification." >&2
  echo "Install Node.js (includes npm/npx) and retry." >&2
  exit 1
fi

if [[ ! -d "${output_dir}" ]]; then
  echo "ERROR: Output directory '${output_dir}' does not exist." >&2
  exit 1
fi

if [[ ! -d "${output_dir}/js" ]]; then
  echo "No ${output_dir}/js directory found. Skipping JS minification."
  exit 0
fi

echo "Optimizing JavaScript in '${output_dir}'..."

# Bundle + minify the ESM entry to reduce initial request graph depth.
if [[ -f "${output_dir}/js/main.js" ]]; then
  echo "Bundling ${output_dir}/js/main.js with esbuild@${esbuild_version}..."
  npx --yes "esbuild@${esbuild_version}" "${output_dir}/js/main.js" \
    --bundle \
    --format=esm \
    --target=es2020 \
    --minify \
    --allow-overwrite \
    --outfile="${output_dir}/js/main.js"
fi

echo "Minifying remaining JavaScript with terser@${terser_version}..."

minified_count=0
while IFS= read -r -d '' file; do
  rel="${file#${output_dir}/}"

  if [[ "${rel}" == js/main.js ]]; then
    # already handled by esbuild bundle step above
    continue
  fi

  if [[ "${rel}" == js/modules/* ]]; then
    npx --yes "terser@${terser_version}" "${file}" --compress --mangle --module --ecma 2020 -o "${file}"
  else
    npx --yes "terser@${terser_version}" "${file}" --compress --mangle --ecma 2020 -o "${file}"
  fi

  minified_count=$((minified_count + 1))
done < <(find "${output_dir}/js" -type f -name "*.js" ! -name "*.min.js" -print0)

if [[ -f "${output_dir}/sw.js" ]]; then
  npx --yes "terser@${terser_version}" "${output_dir}/sw.js" --compress --mangle --ecma 2020 -o "${output_dir}/sw.js"
  minified_count=$((minified_count + 1))
fi

echo "Minified ${minified_count} JavaScript file(s)."