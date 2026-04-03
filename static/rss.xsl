<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="/rss/channel/title"/> - Web Feed</title>
        
        <link rel="stylesheet" href="/css/main.css"/>
        <link rel="stylesheet" href="/css/font-awesome.min.css"/>
        <script src="/js/boot.js" data-default-colorset="auto"></script>
        
        <style>
          /* Basic resets just in case XSLT strips some defaults */
          .copy-btn:active { transform: scale(0.95); }

          #rss-scroll-top {
            position: fixed;
            right: 1rem;
            bottom: 1rem;
            z-index: 70;
            opacity: 0;
            pointer-events: none;
            transform: translateY(10px);
            transition: opacity 180ms ease, transform 180ms ease;
          }

          #rss-scroll-top.is-visible {
            opacity: 1;
            pointer-events: auto;
            transform: translateY(0);
          }
        </style>
        
        <script>
          function writeToClipboard(text) {
            if (navigator.clipboard &amp;&amp; navigator.clipboard.writeText) {
              return navigator.clipboard.writeText(text);
            }

            return new Promise(function(resolve, reject) {
              try {
                var area = document.createElement("textarea");
                area.value = text;
                area.setAttribute("readonly", "readonly");
                area.style.position = "fixed";
                area.style.left = "-9999px";
                document.body.appendChild(area);
                area.select();
                var ok = document.execCommand("copy");
                document.body.removeChild(area);
                if (ok) resolve();
                else reject(new Error("Copy command failed"));
              } catch (err) {
                reject(err);
              }
            });
          }

          function copyFeedUrl() {
            var urlField = document.getElementById("feed-url");
            var btn = document.getElementById("copy-btn");
            var originalTip = btn.getAttribute("data-tip") || "Copy feed URL";
            var originalHtml = btn.innerHTML;

            writeToClipboard(urlField.value).then(function() {
              btn.innerHTML = '<i class="fa-solid fa-check"></i> Copied!';
              btn.classList.add("btn-success");
              btn.setAttribute("data-tip", "Copied!");

              setTimeout(function() {
                btn.innerHTML = originalHtml;
                btn.classList.remove("btn-success");
                btn.setAttribute("data-tip", originalTip);
              }, 1800);
            }).catch(function() {
              btn.setAttribute("data-tip", "Copy failed");
              setTimeout(function() {
                btn.setAttribute("data-tip", originalTip);
              }, 1800);
            });
          }

          function goBackOrHome() {
            try {
              if (document.referrer) {
                var previous = new URL(document.referrer);
                if (previous.origin === window.location.origin &amp;&amp; window.history.length &gt; 1) {
                  window.history.back();
                  return;
                }
              }
            } catch (e) {
              // ignore and fallback to home
            }

            window.location.href = "/";
          }

          document.addEventListener("DOMContentLoaded", function() {
            var feedUrl = document.getElementById("feed-url").value;
            var encodedUrl = encodeURIComponent(feedUrl);
            document.getElementById("feedly-btn").href = "https://feedly.com/i/subscription/feed/" + encodedUrl;
            document.getElementById("inoreader-btn").href = "https://www.inoreader.com/?add_feed=" + encodedUrl;

            var backBtn = document.getElementById("go-back-btn");
            if (backBtn) {
              backBtn.addEventListener("click", function(event) {
                event.preventDefault();
                goBackOrHome();
              });
            }

            var scrollTopBtn = document.getElementById("rss-scroll-top");
            if (scrollTopBtn) {
              var syncScrollTopState = function() {
                if (window.scrollY &gt; 300) {
                  scrollTopBtn.classList.add("is-visible");
                } else {
                  scrollTopBtn.classList.remove("is-visible");
                }
              };

              window.addEventListener("scroll", syncScrollTopState, { passive: true });
              syncScrollTopState();

              scrollTopBtn.addEventListener("click", function() {
                window.scrollTo({ top: 0, behavior: "smooth" });
              });
            }
          });
        </script>
      </head>
      
      <body class="bg-base-200 text-base-content min-w-0 font-sans antialiased selection:bg-primary selection:text-primary-content">
        
        <div class="max-w-3xl mx-auto px-4 py-12 md:py-24">

          <div class="mb-6 flex items-center justify-start">
            <button id="go-back-btn" class="btn btn-ghost btn-sm border border-base-content/15 shadow-sm">
              <i class="fa-solid fa-arrow-left"></i>
              Go Back
            </button>
          </div>
          
          <!-- Header section -->
          <header class="mb-10 text-center flex flex-col items-center">
            <a href="/" class="group flex items-center justify-center gap-3 mb-6 transition-transform hover:scale-105">
               <div class="w-12 h-12 bg-primary text-primary-content rounded-xl flex items-center justify-center shadow-lg shadow-primary/20">
                 <i class="fa-solid fa-rss text-2xl"></i>
               </div>
               <h1 class="text-3xl font-bold tracking-tight m-0 text-base-content group-hover:text-primary transition-colors"><xsl:value-of select="/rss/channel/title"/></h1>
            </a>
            <p class="text-lg opacity-75 max-w-lg mx-auto leading-relaxed">
              <xsl:value-of select="/rss/channel/description"/>
            </p>
          </header>

          <!-- Subscribe Action Box -->
          <div class="bg-base-100 border border-base-content/10 shadow-xl rounded-2xl p-6 md:p-8 mb-12 relative overflow-hidden">
            <!-- Decorative background blob -->
            <div class="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
            
            <h2 class="text-xl font-bold mb-4 flex items-center gap-2">
              <i class="fa-solid fa-satellite-dish text-primary"></i>
              Subscribe to this feed
            </h2>
            <p class="text-sm opacity-80 mb-6 leading-relaxed">
              This is a standard web feed (RSS). If you have a news reader app installed, you can use the direct buttons below. Otherwise, copy the URL to subscribe in your favorite reader.
            </p>
            
            <!-- Quick Actions -->
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-8 relative z-10">
              <a href="{/rss/channel/atom:link[@rel='self']/@href}" class="btn btn-primary shadow-lg shadow-primary/20 flex gap-2">
                <i class="fa-solid fa-window-maximize"></i> Open in App
              </a>
              <a id="feedly-btn" href="#" target="_blank" class="btn btn-outline border-base-content/20 hover:bg-[#2bb24c] hover:border-[#2bb24c] hover:text-white flex gap-2 transition-colors">
                <i class="fa-solid fa-leaf"></i> Feedly
              </a>
              <a id="inoreader-btn" href="#" target="_blank" class="btn btn-outline border-base-content/20 hover:bg-[#0052cc] hover:border-[#0052cc] hover:text-white flex gap-2 transition-colors">
                <i class="fa-solid fa-bookmark"></i> Inoreader
              </a>
            </div>
            
            <!-- URL Copy Field -->
            <div class="form-control w-full relative z-10">
              <label class="label pt-0 pb-1">
                <span class="label-text text-xs opacity-70 font-semibold uppercase tracking-wider">Feed URL</span>
              </label>
              <div class="join w-full shadow-sm">
                <input id="feed-url" type="text" class="input input-bordered join-item w-full bg-base-200/50 font-mono text-sm focus:outline-none" readonly="readonly" value="{/rss/channel/atom:link[@rel='self']/@href}" />
                <button id="copy-btn" class="btn btn-secondary join-item w-32 copy-btn tooltip tooltip-left" data-tip="Copy feed URL" onclick="copyFeedUrl()">
                  <i class="fa-regular fa-copy"></i> Copy
                </button>
              </div>
            </div>
          </div>
          
          <div class="divider mb-12 border-base-content/10"></div>
          
          <!-- Recent Posts List -->
          <div>
            <h2 class="text-2xl font-bold mb-6 flex items-center gap-3">
              <i class="fa-regular fa-newspaper opacity-50"></i>
              Recent Posts
            </h2>
            
            <div class="flex flex-col gap-4">
              <xsl:for-each select="/rss/channel/item">
                <a href="{link}" class="group bg-base-100 hover:bg-base-200/50 border border-base-content/5 rounded-xl p-5 md:p-6 transition duration-200 hover:shadow-md flex flex-col gap-2">
                  <div class="flex items-center gap-3 text-xs opacity-60 font-mono mb-1">
                    <i class="fa-regular fa-calendar"></i>
                    <xsl:value-of select="substring(pubDate, 1, 16)"/>
                  </div>
                  <h3 class="text-xl font-bold m-0 group-hover:text-primary transition-colors leading-tight">
                    <xsl:value-of select="title"/>
                  </h3>
                  <div class="text-sm opacity-75 mt-2 line-clamp-2 leading-relaxed">
                    <xsl:value-of select="substring(description, 1, 180)"/>...
                  </div>
                  <div class="text-xs font-semibold text-primary mt-3 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 flex items-center gap-1">
                    Read article <i class="fa-solid fa-arrow-right text-[10px]"></i>
                  </div>
                </a>
              </xsl:for-each>
            </div>
          </div>
          
          <footer class="mt-16 text-center text-sm opacity-50 pb-8">
            <a href="/" class="hover:underline flex items-center justify-center gap-2">
              <i class="fa-solid fa-arrow-left"></i> Return to <xsl:value-of select="/rss/channel/title"/>
            </a>
          </footer>
          
        </div>

        <button id="rss-scroll-top" class="btn btn-circle btn-primary shadow-lg" type="button" aria-label="Scroll to top" title="Scroll to top">
          <i class="fa-solid fa-arrow-up"></i>
        </button>
        
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
