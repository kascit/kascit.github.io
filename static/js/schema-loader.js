// Schema Loader: Reads JSON-LD from meta tag data attributes and injects as proper JSON-LD scripts
// This avoids CSP inline script violations by not using inline <script> tags
document.addEventListener("DOMContentLoaded", function () {
  document.querySelectorAll("meta[data-schema]").forEach(function (metaEl) {
    var schemaData = metaEl.getAttribute("data-schema");
    if (schemaData) {
      try {
        // Validate JSON before injecting
        var parsed = JSON.parse(schemaData);

        // Create external blob URL for the schema data
        var blob = new Blob([JSON.stringify(parsed, null, 0)], {
          type: "application/ld+json",
        });
        var url = URL.createObjectURL(blob);

        // Create and inject the JSON-LD script element
        var scriptEl = document.createElement("script");
        scriptEl.type = "application/ld+json";
        scriptEl.src = url;
        scriptEl.setAttribute("data-schema-source", metaEl.name || "unknown");

        document.head.appendChild(scriptEl);
      } catch (e) {
        console.error(
          "Failed to parse/inject JSON-LD schema from " + metaEl.name + ":",
          e,
        );
      }
    }
  });
});
