# Conventions & Guides

This file serves as a root context and rule guide for AI agents and developers working on this project (and as a template for other projects).

## 1. Naming & Artifacts
- **Temporary Files & Artifacts**: Always name temporary, development, or throwaway artifacts starting with `tmp` (e.g., `tmp_test.html`, `tmp-build-log.txt`). The `.gitignore` should be set up to ignore `tmp*`.
- **No Clutter**: Do not leave miscellaneous, unnamed temporary files in the repository.

## 2. Code Quality & Modularity
- **Consolidation**: Avoid creating single-use, tiny files unless strictly necessary for a very specific architectural reason. If a CSS or JS file only contains a few lines of code, it should be merged into a parent module or a generic utility file to reduce HTTP requests.
- **Streamlining**: Remove redundant logic. If logic exists in two places, refactor it into a shared function/macro.
- **Documentation**: Keep the codebase self-documenting as much as possible with clear naming. Over-commenting is discouraged, but complex logic must have concise explanations.

## 3. Web Performance
- Deferred JS where possible.
- Inline critical CSS or use `font-display: swap` for fonts.
- Minify assets in production.

*Keep this guide extremely concise. Only add critical, globally applicable rules here.*
