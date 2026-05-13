<<<<<<< HEAD
=======
#!/usr/bin/env bash

>>>>>>> 8e8280d (fix: raw + auth)
# 1. Run your build
just ci-build

# 2. Execute the staging script
MANIFEST_FILE=".github/raw-mirror-paths.txt"
rm -rf .raw-mirror-staging
mkdir -p .raw-mirror-staging

while IFS= read -r line || [ -n "$line" ]; do
  path="${line%%#*}"
  path="${path//$'\\r'/}"
  path="${path#"${path%%[![:space:]]*}"}"
  path="${path%"${path##*[![:space:]]}"}"
  [ -z "$path" ] && continue

  path="${path#/}"
  base="$(basename "$path")"
  source_file=""

  for candidate in "public/$path" "static/$path"; do
    if [ -f "$candidate" ]; then
      source_file="$candidate"
      break
    fi
  done

  if [ -z "$source_file" ]; then
    source_file=$(find public static -name "$base" -type f -print -quit 2>/dev/null || true)
  fi

  if [ -z "$source_file" ] || [ ! -f "$source_file" ]; then
    echo "Error: Missing artifact for '$path'."
    exit 1
  fi

  dest=".raw-mirror-staging/$path"
  mkdir -p "$(dirname "$dest")"
  cp "$source_file" "$dest"
done <"$MANIFEST_FILE"

# 3. Verify the staged output matches expectations
find .raw-mirror-staging -type f | sort
