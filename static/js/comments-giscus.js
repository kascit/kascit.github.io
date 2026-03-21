(function() {
    const scriptTag = document.currentScript;
    if (!scriptTag) return;

    const targetId = scriptTag.getAttribute('data-target') || 'comments';
    const targetEl = document.getElementById(targetId);
    if (!targetEl) return;

    // Wait for the main thread to idle before injecting heavy iframe
    setTimeout(() => {
        const giscusScript = document.createElement('script');
        giscusScript.src = "https://giscus.app/client.js";
        giscusScript.async = true;
        giscusScript.crossOrigin = "anonymous";

        // Map all Zola config attributes
        const attributes = [
            'data-repo', 'data-repo-id', 'data-category', 'data-category-id',
            'data-mapping', 'data-strict', 'data-reactions-enabled',
            'data-emit-metadata', 'data-input-position', 'data-lang', 'data-loading'
        ];

        attributes.forEach(attr => {
            const val = scriptTag.getAttribute(attr);
            if (val) giscusScript.setAttribute(attr, val);
        });

        // Determine initial theme based on our HTML data attribute
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const giscusTheme = currentTheme === "dark" ? "transparent_dark" : "light";
        giscusScript.setAttribute("data-theme", giscusTheme);

        targetEl.appendChild(giscusScript);

        // Bind to theme switch observer to hot-swap Giscus theme
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.attributeName === "data-theme") {
                    const newTheme = document.documentElement.getAttribute("data-theme") === "dark" ? "transparent_dark" : "light";
                    const iframe = document.querySelector('iframe.giscus-frame');
                    if (!iframe) return;
                    
                    iframe.contentWindow.postMessage(
                        { giscus: { setConfig: { theme: newTheme } } },
                        'https://giscus.app'
                    );
                }
            });
        });
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    }, 100);
})();
