<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="1.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" encoding="UTF-8" indent="yes" doctype-system="about:legacy-compat"/>
  <xsl:template match="/">
    <html lang="en">
      <head>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <title><xsl:value-of select="/rss/channel/title"/></title>
        
        <link rel="stylesheet" href="/css/main.css"/>
        <link rel="stylesheet" href="/css/font-awesome.min.css"/>
        <script src="/js/boot.js" data-default-colorset="auto"></script>
        
        <style><![CDATA[
          .copy-btn:active { transform: scale(0.95); }

          .rss-header-link {
            gap: 0.7rem;
            transition: transform 180ms ease;
          }

          .rss-header-link:hover {
            transform: translateY(-1px);
          }

          .rss-header-icon {
            width: 2.35rem;
            height: 2.35rem;
            border-radius: 0.8rem;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            border: 1px solid color-mix(in oklab, var(--color-primary) 28%, transparent);
            background: color-mix(in oklab, var(--color-primary) 11%, var(--color-base-100));
            color: color-mix(in oklab, var(--color-primary) 76%, var(--color-base-content));
            box-shadow: 0 10px 20px -18px color-mix(in oklab, var(--color-primary) 55%, transparent);
          }

          .rss-subscribe-card {
            border-color: color-mix(in oklab, var(--color-base-content) 10%, transparent);
            box-shadow: 0 14px 26px -24px color-mix(in oklab, var(--color-base-content) 45%, transparent);
            background: linear-gradient(
              180deg,
              color-mix(in oklab, var(--color-base-100) 96%, var(--color-base-200)) 0%,
              var(--color-base-100) 100%
            );
          }

          .rss-item-card {
            border-color: color-mix(in oklab, var(--color-base-content) 10%, transparent);
            box-shadow: 0 10px 20px -22px color-mix(in oklab, var(--color-base-content) 44%, transparent);
            transition: border-color 180ms ease, box-shadow 200ms ease, transform 200ms ease;
          }

          .rss-item-card:hover {
            border-color: color-mix(in oklab, var(--color-base-content) 20%, transparent);
            box-shadow: 0 20px 30px -28px color-mix(in oklab, var(--color-base-content) 52%, transparent);
            transform: translateY(-1px);
          }

          .rss-item-meta {
            letter-spacing: 0.01em;
          }

          .rss-return-link {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            border: 1px solid color-mix(in oklab, var(--color-base-content) 18%, transparent);
            border-radius: 999px;
            padding: 0.52rem 0.9rem;
            color: color-mix(in oklab, var(--color-base-content) 74%, transparent);
            text-decoration: none;
            background: color-mix(in oklab, var(--color-base-100) 92%, var(--color-base-200));
            box-shadow: 0 10px 18px -18px color-mix(in oklab, var(--color-base-content) 55%, transparent);
            transition: transform 170ms ease, border-color 170ms ease, color 170ms ease, box-shadow 170ms ease;
          }

          .rss-return-link:hover {
            transform: translateY(-1px);
            border-color: color-mix(in oklab, var(--color-base-content) 32%, transparent);
            color: var(--color-base-content);
            box-shadow: 0 16px 24px -20px color-mix(in oklab, var(--color-base-content) 60%, transparent);
          }

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
        ]]></style>
        
        <script><![CDATA[
          function writeToClipboard(text) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
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
                if (previous.origin === window.location.origin && window.history.length > 1) {
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
                if (window.scrollY > 300) {
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
        ]]></script>
      </head>
      
      <body class="bg-base-200 text-base-content min-w-0 font-sans antialiased selection:bg-primary selection:text-primary-content">
        
        <div class="max-w-3xl mx-auto px-4 py-8 md:py-14">

          <div class="mb-4 flex items-center justify-start">
            <button id="go-back-btn" class="btn btn-ghost btn-sm border border-base-content/15 shadow-sm">
              <i class="fa-solid fa-arrow-left"></i>
              Go Back
            </button>
          </div>
          
          <header class="mb-7 md:mb-8 text-center flex flex-col items-center">
            <a href="/" class="rss-header-link group flex items-center justify-center mb-4">
               <span class="rss-header-icon" aria-hidden="true">
                 <i class="fa-solid fa-rss text-lg"></i>
               </span>
               <h1 class="text-2xl md:text-3xl font-bold tracking-tight m-0 text-base-content group-hover:text-primary transition-colors"><xsl:value-of select="/rss/channel/title"/></h1>
            </a>
            <p class="text-base md:text-lg text-base-content/72 max-w-xl mx-auto leading-relaxed">
              <xsl:value-of select="/rss/channel/description"/>
            </p>
          </header>

          <div class="rss-subscribe-card bg-base-100 border rounded-2xl p-6 md:p-7 mb-10 relative overflow-hidden">
            <div class="absolute top-0 right-0 -mr-16 -mt-16 w-32 h-32 rounded-full bg-primary/10 blur-3xl pointer-events-none"></div>
            
            <h2 class="text-lg md:text-xl font-bold mb-3 flex items-center gap-2 text-base-content">
              <i class="fa-solid fa-satellite-dish text-primary"></i>
              Subscribe to this feed
            </h2>
            <p class="text-sm text-base-content/74 mb-5 leading-relaxed">
              This is a standard web feed (RSS). If you have a news reader app installed, you can use the direct buttons below. Otherwise, copy the URL to subscribe in your favorite reader.
            </p>
            
            <div class="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 relative z-10">
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
            
            <div class="form-control w-full relative z-10">
              <label class="label pt-0 pb-1" for="feed-url">
                <span class="label-text text-xs text-base-content/62 font-semibold uppercase tracking-wider">Feed URL</span>
              </label>
              <div class="join w-full shadow-sm">
                <input id="feed-url" type="text" class="input input-bordered join-item w-full bg-base-200/50 font-mono text-sm text-base-content/88 focus:outline-none" readonly="readonly" value="{/rss/channel/atom:link[@rel='self']/@href}" />
                <button id="copy-btn" class="btn btn-secondary join-item w-32 copy-btn tooltip tooltip-left" data-tip="Copy feed URL" onclick="copyFeedUrl()">
                  <i class="fa-regular fa-copy"></i> Copy
                </button>
              </div>
            </div>
          </div>
          
          <div class="divider mb-9 border-base-content/12"></div>
          
          <div>
            <h2 class="text-xl md:text-2xl font-bold mb-5 flex items-center gap-3 text-base-content">
              <i class="fa-regular fa-newspaper text-base-content/55"></i>
              Recent Posts
            </h2>
            
            <div class="flex flex-col gap-4">
              <xsl:for-each select="/rss/channel/item">
                <a href="{link}" class="rss-item-card group bg-base-100 border rounded-xl p-5 md:p-6 flex flex-col gap-2">
                  <div class="rss-item-meta flex items-center gap-3 text-[11px] text-base-content/60 font-medium mb-1">
                    <i class="fa-regular fa-calendar"></i>
                    <xsl:value-of select="substring(pubDate, 1, 16)"/>
                  </div>
                  <h3 class="text-lg md:text-xl font-semibold m-0 text-base-content group-hover:text-primary transition-colors leading-tight">
                    <xsl:value-of select="title"/>
                  </h3>
                  <div class="text-sm text-base-content/72 mt-1.5 line-clamp-2 leading-relaxed">
                    <xsl:value-of select="substring(description, 1, 180)"/>...
                  </div>
                  <div class="text-xs font-semibold text-primary/90 mt-3 opacity-75 transition-colors duration-200 group-hover:text-primary flex items-center gap-1">
                    Read article <i class="fa-solid fa-arrow-right text-[10px]"></i>
                  </div>
                </a>
              </xsl:for-each>
            </div>
          </div>
          
          <footer class="mt-14 text-center text-sm text-base-content/55 pb-6">
            <a href="/" class="rss-return-link">
              <i class="fa-solid fa-arrow-left"></i> Return to site
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