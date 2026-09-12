(()=>{function $(){if(window.__siteConfig)return window.__siteConfig;let e=document.getElementById("site-config");if(e)try{return window.__siteConfig=JSON.parse(e.textContent),window.__siteConfig}catch(t){console.error("[SiteConfig] Failed to parse JSON config",t)}return window.__siteConfig=window.SiteNavConfig||{},window.__siteConfig}var v="https://dhanur.me",N=(()=>{let e=window.location.hostname;if(e==="localhost"||e==="127.0.0.1")return"";let t=e.split(".");return t.length>=2?"."+t.slice(-2).join("."):""})();function j(){if(window.__defaultPolicy)return;if(window.trustedTypes&&window.trustedTypes.createPolicy)try{window.__defaultPolicy=window.trustedTypes.createPolicy("default",{createScriptURL:function(t){return t},createHTML:function(t){return t}})}catch{}function e(t){let n=Element.prototype[t];Element.prototype[t]=function(...i){let o=n.apply(this,i),a=i[0];if(a&&a.tagName==="IFRAME")try{let s=a.contentWindow;s&&s.trustedTypes&&!s.trustedTypes.defaultPolicy&&s.trustedTypes.createPolicy("default",{createHTML:r=>r,createScript:r=>r,createScriptURL:r=>r})}catch{}return o}}e("appendChild"),e("insertBefore")}var be={MOBILE:0,SM:640,MD:768,LG:1024,XL:1280,XXL:1536},d={isDesktop:!1,isMobile:!1,mediaQueries:{},listeners:new Set},B=!1;function E(){let e=d.isDesktop;d.isDesktop=d.mediaQueries.hoverCapable?.matches&&d.mediaQueries.finePointer?.matches,d.isMobile=!d.isDesktop,e!==d.isDesktop&&ve()}function ve(){d.listeners.forEach(e=>{try{e({isDesktop:d.isDesktop,isMobile:d.isMobile,isLargeScreen:we(),isTouchDevice:ye(),prefersReducedMotion:Ae()})}catch(t){console.error(t)}})}function z(){B||typeof window.matchMedia=="function"&&(B=!0,d.mediaQueries.hoverCapable=window.matchMedia("(hover: hover)"),d.mediaQueries.finePointer=window.matchMedia("(pointer: fine)"),d.mediaQueries.largeScreen=window.matchMedia(`(min-width: ${be.LG}px)`),d.mediaQueries.touchDevice=window.matchMedia("(pointer: coarse)"),d.mediaQueries.reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)"),E(),Object.values(d.mediaQueries).forEach(e=>{e.addListener?e.addListener(E):e.addEventListener&&e.addEventListener("change",E)}))}var we=()=>d.mediaQueries.largeScreen?.matches||!1,ye=()=>d.mediaQueries.touchDevice?.matches||!1,Ae=()=>d.mediaQueries.reducedMotion?.matches||!1;function U(e){let t=`${e}=`,n=document.cookie?document.cookie.split(";"):[];for(let i of n){let o=i.trim();if(o.startsWith(t))return decodeURIComponent(o.slice(t.length))}return""}function G(e,t,n={}){let{maxAgeSeconds:i,domain:o,path:a="/",sameSite:s="Lax"}=n,r=typeof i=="number"?`; Max-Age=${i}`:"",l=o?`; Domain=${o}`:"";document.cookie=`${e}=${encodeURIComponent(t)}; Path=${a}; SameSite=${s}; Secure${r}${l}`}var xe={dark:"dark",light:"light"},ke=["auto","light","dark"],Q={dark:"#010409",light:"#f6f8fa"},Se=240,g="auto",p=window.matchMedia?window.matchMedia("(prefers-color-scheme: dark)"):null,w=null;function y(e,t="auto"){let n=String(e||"").trim().toLowerCase();return ke.includes(n)?n:n.includes("dark")?"dark":n.includes("light")?"light":t}function Le(){let e=window.__getThemeCookie?window.__getThemeCookie():U("theme")||null;return y(e,"auto")}function Ce(e){let t=y(e,"auto");if(window.__setThemeCookie){window.__setThemeCookie(t);return}G("theme",t,{maxAgeSeconds:31536e3,domain:N||void 0,path:"/",sameSite:"Lax",secure:window.location.protocol==="https:"})}function _(e){let t=y(e,"auto");return window.__resolveColorset?window.__resolveColorset(t):t==="auto"?p&&p.matches?"dark":"light":t}function M(e){let t=xe[e]||e;document.documentElement.setAttribute("data-theme",t),document.documentElement.style.backgroundColor=Q[e]||Q.dark,e==="dark"?(document.documentElement.classList.add("dark"),document.documentElement.classList.remove("light"),document.documentElement.style.colorScheme="dark"):(document.documentElement.classList.add("light"),document.documentElement.classList.remove("dark"),document.documentElement.style.colorScheme="light");function n(i,o){document.querySelectorAll(i).forEach(a=>{a.classList.remove("hidden","invisible"),a.style.opacity=o?"1":"0",a.style.visibility=o?"visible":"hidden",a.style.pointerEvents=o?"":"none"})}n(".logo-dark",e==="dark"),n(".logo-light",e==="light"),n(".hero-dark",e==="dark"),n(".hero-light",e==="light")}function F(){let e=document.documentElement;e.classList.add("is-theme-switching"),w&&window.clearTimeout(w),w=window.setTimeout(()=>{e.classList.remove("is-theme-switching"),w=null},Se)}function T(){document.querySelectorAll(".theme-switcher").forEach(e=>{e.querySelectorAll("[data-theme-mode]").forEach(t=>{let i=t.getAttribute("data-theme-mode")===g;t.style.background=i?"color-mix(in oklab, var(--color-base-content) 20%, transparent)":"",t.style.boxShadow=i?"0 1px 3px rgba(0,0,0,0.12), inset 0 0 0 1px color-mix(in oklab, var(--color-base-content) 8%, transparent)":"",t.style.opacity=i?"1":"0.55"})})}function Ee(e){g=e,Ce(e),F();let t=_(e);M(t),T(),document.dispatchEvent(new CustomEvent("themeChanged",{detail:t}))}function W(e=document){g=y(Le(),"auto");let t=_(g);if(M(t),T(),document.dispatchEvent(new CustomEvent("themeChanged",{detail:t})),e.querySelectorAll(".theme-switcher [data-theme-mode]").forEach(n=>{n.addEventListener("click",i=>{i.preventDefault(),i.stopPropagation();let o=n.getAttribute("data-theme-mode");o&&o!==g&&Ee(o)})}),p){let n=()=>{if(g==="auto"){F();let i=_("auto");M(i),T(),document.dispatchEvent(new CustomEvent("themeChanged",{detail:i}))}};p.addEventListener?p.addEventListener("change",n):p.addListener&&p.addListener(n)}}function V({src:e,selector:t,async:n=!0,defer:i=!1,crossOrigin:o,loadedAttribute:a,onLoad:s,onError:r}){if(!e&&!t)return null;let l=t?document.querySelector(t):document.querySelector(`script[src="${e}"]`);if(l)return typeof s=="function"&&((a?l.getAttribute(a)==="1":!1)||l.readyState==="complete"?s():l.addEventListener("load",s,{once:!0})),typeof r=="function"&&l.addEventListener("error",r,{once:!0}),l;let c=document.createElement("script"),h=window.__defaultPolicy;return c.src=h?h.createScriptURL(e):e,c.async=n,c.defer=i,o&&(c.crossOrigin=o),c.addEventListener("load",()=>{a&&c.setAttribute(a,"1"),typeof s=="function"&&s()},{once:!0}),typeof r=="function"&&c.addEventListener("error",r,{once:!0}),document.head.appendChild(c),c}function A(){return!window.AUTH||typeof window.AUTH!="object"?null:window.AUTH}function _e(e){let t=!1,n;return function(...i){return t||(t=!0,n=e.apply(this,i)),n}}function q(...e){e.forEach(t=>{t&&(t instanceof NodeList||Array.isArray(t)?t.forEach(n=>n&&n.classList.remove("hidden")):t.classList&&t.classList.remove("hidden"))})}function D(...e){e.forEach(t=>{t&&(t instanceof NodeList||Array.isArray(t)?t.forEach(n=>n&&n.classList.add("hidden")):t.classList&&t.classList.add("hidden"))})}function u(e,t){e&&(e instanceof NodeList||Array.isArray(e)?e.forEach(n=>{n&&(n.textContent=t)}):e.nodeType&&(e.textContent=t))}function K(e,t){e&&(e instanceof NodeList||Array.isArray(e)?e.forEach(n=>{n&&(t?n.src=t:n.removeAttribute("src"))}):e.nodeType&&(t?e.src=t:e.removeAttribute("src")))}function J(e,t){let n=e.querySelectorAll('[data-auth="credits-row"], [data-auth="sidebar-credits-row"]'),i=e.querySelectorAll('[data-auth="credits-balance"], [data-auth="sidebar-credits-balance"]'),o=e.querySelectorAll('[data-auth="credits-reset"], [data-auth="sidebar-credits-reset"]');if(!t||n.length===0){D(n);return}if(q(n),t.unlimited||t.balance===-1)u(i,"\u221E"),u(o,"Admin");else if(u(i,String(t.balance??"\u2014")),t.periodEnd)try{let a=new Date(t.periodEnd);u(o,`resets ${a.toLocaleDateString(void 0,{month:"short",day:"numeric"})}`)}catch{u(o,"")}else u(o,"")}function Me(e){let t=_e(e);if(A()){t();return}document.addEventListener("authReady",t,{once:!0}),V({src:"https://auth.dhanur.me/auth-client.js",selector:'script[src*="auth-client.js"]',defer:!0,onLoad:()=>{let n=A();n&&typeof n.onReady=="function"?n.onReady(()=>t()):t()},onError:()=>{console.warn("[Auth] Could not load auth-client.js"),t()}}),window.setTimeout(()=>{A()&&t()},2e3)}function X(e=document,t=null){e.__authIntegrationBound||(e.__authIntegrationBound=!0,Me(()=>{let n=A();if(!n)return;let i={navGuestAvatar:e.querySelectorAll('[data-auth="nav-guest-avatar"], [data-auth="mobile-guest-avatar"], [data-auth="sidebar-guest-avatar"]'),navAuthedAvatar:e.querySelectorAll('[data-auth="nav-authed-avatar"], [data-auth="mobile-authed-avatar"], [data-auth="sidebar-authed-avatar"]'),navAvatarImg:e.querySelectorAll('[data-auth="nav-authed-avatar"] img, [data-auth="mobile-authed-avatar"] img, [data-auth="sidebar-authed-avatar"] img'),navAuthedHeaderImg:e.querySelectorAll('[data-auth="nav-authed-header-avatar"], [data-auth="mobile-authed-header-avatar"]'),navName:e.querySelectorAll('[data-auth="nav-name"], [data-auth="mobile-name"], [data-auth="sidebar-name"]'),navEmail:e.querySelectorAll('[data-auth="nav-email"], [data-auth="mobile-email"], [data-auth="sidebar-email"]'),navLoginItem:e.querySelectorAll('[data-auth="login-item"], [data-auth="mobile-login-btn"], [data-auth="sidebar-login-btn"]'),navAccountItem:e.querySelectorAll('[data-auth="account-item"], [data-auth="mobile-account-btn"], [data-auth="sidebar-account-btn"]'),navLogoutItem:e.querySelectorAll('[data-auth="logout-item"], [data-auth="mobile-logout-btn"], [data-auth="sidebar-logout-btn"]'),navGuestHeader:e.querySelectorAll('[data-auth="nav-guest-header"], [data-auth="mobile-guest-header"]'),navAuthedHeader:e.querySelectorAll('[data-auth="nav-authed-header"], [data-auth="mobile-authed-header"]'),navRoleBadge:e.querySelectorAll('[data-auth="nav-role"]')};function o(a){if(!a)return;let s=a.authenticated,r=a.user,l=r?.avatar_url||"",c=r?.name||"User";if(s&&r){D(i.navGuestAvatar,i.navGuestHeader,i.navLoginItem),q(i.navAuthedAvatar,i.navAuthedHeader,i.navAccountItem,i.navLogoutItem),K(i.navAvatarImg,l),K(i.navAuthedHeaderImg,l),u(i.navName,c),u(i.navEmail,r.email||""),u(i.navRoleBadge,a.role||"user");try{l&&localStorage.setItem("dhanur_avatar_url_v1",l)}catch{}J(e,a.credits||null)}else q(i.navGuestAvatar,i.navGuestHeader,i.navLoginItem),D(i.navAuthedAvatar,i.navAuthedHeader,i.navAccountItem,i.navLogoutItem);typeof t=="function"&&t(a)}typeof n.onReady=="function"?n.onReady(a=>o(a?.status||a||n.status||null)):n.status&&o(n.status),document.addEventListener("authChanged",a=>o(a.detail)),document.addEventListener("creditsChanged",a=>J(e,a.detail)),document.__authClickDelegated||(document.__authClickDelegated=!0,document.addEventListener("click",a=>{if(a.target.closest('[data-auth="login-btn"], [data-auth="sidebar-login-btn"], [data-auth="mobile-login-btn"]')){a.preventDefault(),typeof n.login=="function"&&n.login();return}if(a.target.closest('[data-auth="logout-btn"], [data-auth="sidebar-logout-btn"], [data-auth="mobile-logout-btn"]')){a.preventDefault(),typeof n.logout=="function"&&n.logout();return}})),window.addEventListener("message",async a=>{if((a.origin==="https://auth.dhanur.me"||a.origin==="https://dhanur.me"||a.origin.endsWith(".dhanur.me")||a.origin.startsWith("http://localhost:"))&&!(!a.data||typeof a.data!="object")&&(a.data.type==="auth-login-success"||a.data.type==="auth-upgrade-success")){if(n&&typeof n.refresh=="function"){let r=await n.refresh();o(r)}else try{let r=await fetch("https://auth.dhanur.me/api/status",{credentials:"include"});if(r.ok){let l=await r.json();o(l),document.dispatchEvent(new CustomEvent("authChanged",{detail:l}))}}catch(r){console.error("[Auth] Background session synchronization failed:",r)}a.source&&a.source.postMessage({type:"auth-ack-close"},a.origin)}})}))}var Te=`
  .access-wall {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    min-height: 60vh;
    text-align: center;
    padding: 2rem;
    gap: 1rem;
  }
  .access-wall-icon {
    font-size: 2.75rem;
    opacity: 0.35;
  }
  .access-wall-title {
    font-size: 1.4rem;
    font-weight: 700;
  }
  .access-wall-sub {
    max-width: 32rem;
    font-size: 0.9rem;
    opacity: 0.7;
  }
`;function qe(){if(document.getElementById("access-wall-styles"))return;let e=document.createElement("style");e.id="access-wall-styles",e.textContent=Te,document.head.appendChild(e)}function Y(e={},t=null){let n=e.requireAdmin===!0;if(!(e.requireAuth===!0||n))return{allowed:!0};let o=t?.authenticated===!0,a=t?.role||"guest";return o?n&&a!=="admin"?{allowed:!1,reason:"admin_required"}:{allowed:!0}:{allowed:!1,reason:"auth_required"}}function Z(e,t="auth_required",n="This app"){if(!e)return;qe();let i=t==="admin_required",o=i?"fa-solid fa-shield-halved":"fa-solid fa-lock",a=i?"Admin access required":"Sign in to continue",s=i?`${n} is restricted to administrator sessions.`:`${n} requires a dhanur.me account to continue.`,r=i?"Verify Admin":"Sign In",l=i?"upgrade-btn":"login-btn";e.innerHTML=`
    <div class="access-wall">
      <i class="access-wall-icon ${o}"></i>
      <h1 class="access-wall-title">${a}</h1>
      <p class="access-wall-sub">${s}</p>
      <button class="btn btn-primary" data-auth="${l}">
        <i class="fa-solid fa-right-to-bracket"></i>
        ${r}
      </button>
    </div>
  `;let c=window.AUTH;if(t==="admin_required"){let f=e.querySelector('[data-auth="upgrade-btn"]');f&&c&&typeof c.upgrade=="function"&&f.addEventListener("click",S=>{S.preventDefault(),c.upgrade()});return}let h=e.querySelector('[data-auth="login-btn"]');h&&c&&typeof c.login=="function"&&h.addEventListener("click",f=>{f.preventDefault(),c.login()})}var De="https://up.dhanur.me/api/manifest",te="dhanur_manifest_v1";var ne=[{name:"Home",url:"https://dhanur.me",icon:"fa-solid fa-house",minRole:"guest"},{name:"Linkr",url:"https://linkr.dhanur.me",icon:"fa-solid fa-link",minRole:"guest"},{name:"Tasks",url:"https://tasks.dhanur.me",icon:"fa-solid fa-clipboard-list",minRole:"guest"},{name:"Auth",url:"https://auth.dhanur.me",icon:"fa-solid fa-fingerprint",minRole:"guest"},{name:"Status",url:"https://up.dhanur.me",icon:"fa-solid fa-heart-pulse",minRole:"guest",category:"Core"}],m=null,x=new Map;function Pe(e){return e==="admin"?"admin":e==="user"?"user":"guest"}function ee(e){return e==="admin"?2:e==="user"?1:0}function Ie(){try{let e=localStorage.getItem(te);if(!e)return null;let t=JSON.parse(e);if(!t||!Array.isArray(t.apps))return null;let n=Number(t._cachedAt||0);return{...t,_stale:Date.now()-n>36e5}}catch{return null}}function Oe(e){try{localStorage.setItem(te,JSON.stringify({version:e.version||"1",apps:Array.isArray(e.apps)?e.apps:ne,_cachedAt:Date.now()}))}catch{}}function P(){if(m&&Array.isArray(m.apps))return m;let e=Ie();return e&&Array.isArray(e.apps)?(m=e,e):{version:"0",apps:ne,_stale:!0}}function I(e,t="guest"){let n=ee(t);return(Array.isArray(e)?e:[]).filter(i=>ee(i?.minRole||"guest")<=n)}async function ae(e="guest"){let t=Pe(e);if(x.has(t))return x.get(t);let n=(async()=>{try{let i=`${De}?role=${encodeURIComponent(t)}`,o=await fetch(i,{credentials:"omit",mode:"cors",cache:"no-cache"});if(!o.ok)throw new Error(`Manifest request failed with status ${o.status}`);let a=await o.json();if(!a||!Array.isArray(a.apps))throw new Error("Manifest payload is invalid");return m={version:a.version||"1",apps:a.apps},Oe(m),m}catch{return P()}})();x.set(t,n);try{return await n}finally{x.delete(t)}}var oe=!1;function k(){document.querySelectorAll("[data-dropdown][data-open]").forEach(e=>{e.removeAttribute("data-open")})}function O(){return document.querySelector("[data-dropdown][data-open]")}function ie(e){let t=e.querySelector(".dropdown-panel");if(!t)return;let n=e.getBoundingClientRect(),i=t.offsetWidth||224,o=(n.width-i)/2,a=n.left+o+i-(window.innerWidth-16);a>0&&(o-=a),n.left+o<8&&(o=8-n.left),t.style.left=`${o}px`,t.style.right="auto"}function He(e){k(),e.setAttribute("data-open",""),ie(e)}function re(e=document){let t=e.querySelectorAll("[data-dropdown]");t.length&&(t.forEach(n=>{if(n.getAttribute("data-dropdown-init")==="1")return;let i=n.querySelector('[role="button"]');if(!i)return;let o=n.querySelector(".dropdown-panel"),a=i.classList.contains("tooltip")&&(i.hasAttribute("data-tooltip-label")||i.hasAttribute("data-tip")||!!i.querySelector(":scope > .tooltip-content"));n.setAttribute("data-dropdown-tooltip",a?"1":"0"),i.addEventListener("click",s=>{s.stopPropagation(),n.hasAttribute("data-open")?k():He(n)}),o&&o.addEventListener("click",s=>s.stopPropagation()),n.setAttribute("data-dropdown-init","1")}),!oe&&(oe=!0,document.addEventListener("click",()=>{O()&&k()}),document.addEventListener("keydown",n=>{n.key==="Escape"&&O()&&k()}),window.addEventListener("resize",()=>{let n=O();n&&ie(n)})))}var H={shellPath:"/navbar/",favicon:!0,enablePwa:!0,swPath:"/sw.js",requireAuth:!1,requireAdmin:!1,showMobileMenu:!0,showLanguage:!1,showAppsGrid:!0,showAccountButton:!0,showThemeToggle:!1};typeof window<"u"&&(window.SiteNavConfig={...H,...window.SiteNavConfig||{}});j();window.__componentsJS=!0;var se=!1,le={...H,noCss:!1,showNavbar:!0,showLanguage:!0,showAppsGrid:!0,showAccountButton:!0,showThemeToggle:!0,showMobileMenu:!0,enablePwa:!1,favicon:!1};function fe(){let e=$()||{},t=e.shell&&typeof e.shell=="object"?e.shell:{},n={...le,...e,...t};return(typeof n.shellPath!="string"||n.shellPath.trim()==="")&&(n.shellPath=le.shellPath),n}function pe(){return window.location.origin===v}function Re(){let e=window.location.hostname;return e==="dhanur.me"||e.endsWith(".dhanur.me")||e==="localhost"}function $e(e){if(e.enablePwa===!1||!("serviceWorker"in navigator)||!window.isSecureContext)return;let t=typeof e.swPath=="string"&&e.swPath.trim()!==""?e.swPath:"/sw.js";window.addEventListener("load",()=>{navigator.serviceWorker.register(t).catch(()=>{})},{once:!0})}function me(e,t){if(t.noCss||document.querySelector('link[data-shell-style="main"]'))return;let n=e?"":v,i=e?`${n}/css/main.css`:`${n}/css/dui.css`,o=document.createElement("link");o.rel="stylesheet",o.href=i,o.setAttribute("data-shell-style","main"),e||(o.crossOrigin="anonymous"),document.head.appendChild(o);let a=document.createElement("link");a.rel="stylesheet",a.href=`${n}/css/font-awesome.subset.css`,a.setAttribute("data-shell-style","fa"),a.media="print",a.onload=function(){this.media="all"},e||(a.crossOrigin="anonymous"),document.head.appendChild(a)}function ge(e,t){if(t.favicon===!1)return;let n=e?"/icons/":`${v}/icons/`;document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(o=>o.remove());let i=[{rel:"icon",type:"image/png",sizes:"96x96",href:`${n}favicon-96x96-transparent.png`},{rel:"icon",type:"image/svg+xml",href:`${n}favicon.svg`},{rel:"apple-touch-icon",sizes:"180x180",href:`${n}apple-touch-icon-180x180-transparent.png`}];e&&i.push({rel:"shortcut icon",href:`${n}favicon-transparent.ico`}),e&&(document.querySelectorAll('link[rel="manifest"]').forEach(o=>o.remove()),i.push({rel:"manifest",href:`${n}site.webmanifest`})),i.forEach(o=>{let a=document.createElement("link");a.rel=o.rel,o.type&&(a.type=o.type),o.sizes&&(a.sizes=o.sizes),a.href=o.href,!e&&o.rel==="manifest"&&(a.crossOrigin="anonymous"),document.head.appendChild(a)})}function Ne(e,t){if(t.showLanguage||e.querySelectorAll('[data-nav-chrome="lang"]').forEach(n=>n.remove()),t.showAppsGrid||e.querySelectorAll('[data-nav-chrome="apps"]').forEach(n=>n.remove()),t.showAccountButton||e.querySelectorAll('[data-nav-chrome="account"]').forEach(n=>n.remove()),t.showThemeToggle||e.querySelectorAll('[data-nav-chrome="theme"]').forEach(n=>n.remove()),!t.showMobileMenu){let n=e.querySelector("#shell-mobile-toggle");if(n){let o=n.closest(".flex-none");o&&o.remove()}let i=e.querySelector("[data-shell-mobile-panel]");i&&i.remove()}}function je(e){let t=String(e||"").trim();if(!t)return"#";try{let n=new URL(t,window.location.origin);if(n.protocol==="http:"||n.protocol==="https:")return n.href}catch{}return"#"}function Be(e){let t=String(e||"").trim();return!t||!/^[a-z0-9\s_-]+$/i.test(t)?"fa-solid fa-link":t}function ce(e,t){let n=e.querySelectorAll("[data-app-menu-grid], [data-apps-grid], [data-apps-grid-mobile]");if(!n.length)return;let i=Array.isArray(t)?t:[];n.forEach(o=>{let a=o.getAttribute("data-app-menu-grid"),r=a==="desktop"||!a&&o.hasAttribute("data-apps-grid")?"p-3":"p-2.5",l=document.createDocumentFragment();for(let c of i){let h=je(c?.url),f=Be(c?.icon),S=String(c?.name||"App").trim()||"App",b=document.createElement("a");b.href=h,b.className=`group flex flex-col items-center gap-1.5 ${r} rounded-md hover:bg-base-200 transition-colors duration-200 no-underline hover:no-underline text-base-content`;let L=document.createElement("div");L.className="w-10 h-10 rounded-md bg-base-300/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors";let R=document.createElement("i");R.className=`${f} text-lg`;let C=document.createElement("span");C.className="text-[10px] font-medium opacity-70 group-hover:opacity-100",C.textContent=S,L.appendChild(R),b.appendChild(L),b.appendChild(C),l.appendChild(b)}o.replaceChildren(l)})}async function de(e,t){let n=P(),i=I(n.apps,t);ce(e,i);let o=await ae(t),a=I(o.apps,t);return ce(e,a),a}function ze(){let e=document.querySelector("[data-shell-mobile-panel]");if(!e)return;let t=e.querySelector("[data-shell-mobile-drawer]");function n(){e.classList.remove("hidden"),e.offsetWidth,t&&(t.style.transform="translateX(0)"),document.body.style.overflow="hidden"}function i(){t&&(t.style.transform="translateX(-100%)"),document.body.style.overflow="",setTimeout(()=>{e.classList.add("hidden")},300)}document.__shellMobileDelegated||(document.__shellMobileDelegated=!0,document.addEventListener("click",o=>{if(o.target.closest("#shell-mobile-toggle")){o.preventDefault(),o.stopPropagation(),n();return}let s=o.target.closest("[data-shell-mobile-close]"),r=o.target.closest("[data-shell-mobile-backdrop]");if(s||r){o.preventDefault(),o.stopPropagation(),i();return}}),document.addEventListener("keydown",o=>{o.key==="Escape"&&!e.classList.contains("hidden")&&i()}))}function Ue(e,t){let n=e.querySelector("[data-shell-mobile-panel]");if(!n)return;let i=t?.authenticated===!0,o=t?.user,a=n.querySelector('[data-auth="mobile-name"]'),s=n.querySelector('[data-auth="mobile-email"]');i&&o?(a&&(a.textContent=o.name||"User"),s&&(s.textContent=o.email||"")):(a&&(a.textContent="Guest"),s&&(s.textContent="Not signed in"))}function Ge(e){let t=fe(),n=pe(),i=!!document.querySelector('link[rel="stylesheet"][href*="/css/main.css"], link[rel="stylesheet"][href*="/css/dui.css"], link[data-shell-style="main"]'),o=!!document.querySelector('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');(!n||!i)&&me(n,t),(!n||!o)&&ge(n,t),Ne(e,t),de(e,"guest"),z(),W(e),re(e),ze(),X(document,a=>{let s=a?.role||"guest",r=Y(t,a),l=e.querySelector(".site-nav-slot")||e.querySelector(".drawer-content");if(!r.allowed){l&&Z(l,r.reason,document.title||"This app");return}de(e,s),Ue(e,a)})}var ue=`<div class="navbar site-topbar fixed top-0 left-0 right-0 z-50 h-16 bg-base-100/80 backdrop-blur-md border-b border-base-content/10">
    <div class="flex-none lg:hidden">
        <button id="shell-mobile-toggle" type="button" aria-label="Open menu" class="btn btn-ghost btn-circle btn-sm transition-colors duration-200">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
    </div>

    <div class="flex-1 flex justify-center items-center lg:flex lg:justify-start">
        <a href="https://dhanur.me/" class="btn btn-ghost hover:bg-transparent hover:border-transparent normal-case text-xl font-bold text-base-content logo-firefly site-logo-link">
            <div class="relative h-16 flex items-center">
                <picture>
                    <img src="https://raw.githubusercontent.com/kascit/kascit.github.io/raw-mirror/images/branding/logo-light.png" alt="~/dhanur" class="h-16 w-auto p-[14px] logo-dark" sizes="200px" data-logo-type="dark" loading="eager" fetchpriority="high" />
                </picture>
                <picture class="absolute inset-0 flex items-center">
                    <img src="https://raw.githubusercontent.com/kascit/kascit.github.io/raw-mirror/images/branding/logo-dark.png" alt="~/dhanur" class="h-16 w-auto p-[14px] logo-light" sizes="200px" data-logo-type="light" loading="eager" fetchpriority="high" />
                </picture>
            </div>
        </a>
    </div>

    <div class="flex-none lg:hidden" aria-hidden="true"><div class="btn btn-circle btn-sm invisible"></div></div>

    <div class="flex-none hidden lg:flex">
        <ul class="menu menu-horizontal px-1 items-center">
            <li data-nav-chrome="apps" class="ml-1">
                <div class="relative p-0" data-dropdown="apps">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-square tooltip tooltip-bottom" data-tooltip-label="Apps" aria-label="Apps">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    </div>
                    <div class="dropdown-panel z-50 mt-2 p-4 bg-base-100 border border-base-content/10 rounded-box w-64 right-0 mr-2 md:mr-4">
                        <div class="grid grid-cols-3 gap-2" data-app-menu-grid="desktop">
                            <div class="col-span-3 flex justify-center py-4 opacity-50"><span class="loading loading-spinner loading-sm"></span></div>
                        </div>
                    </div>
                </div>
            </li>

            <li data-nav-chrome="account" class="ml-1">
                <div class="relative p-0" data-dropdown="account">
                    <div tabindex="0" role="button" class="btn btn-ghost btn-circle tooltip tooltip-bottom" data-tooltip-label="Account" aria-label="Account">
                        <div data-auth="nav-guest-avatar" class="w-9 h-9 rounded-full bg-base-300 flex items-center justify-center">
                            <i class="fa-solid fa-user text-base-content/50 text-sm"></i>
                        </div>
                        <div data-auth="nav-authed-avatar" class="hidden w-9 h-9 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-1 overflow-hidden">
                            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="Profile" class="w-full h-full object-cover" />
                        </div>
                    </div>
                    <div class="dropdown-panel z-50 mt-2 bg-base-100 border border-base-content/10 rounded-box w-64 right-0 mr-2 md:mr-4 overflow-hidden">
                        <div data-auth="nav-authed-header" class="hidden px-3 pt-3 pb-2 border-b border-base-content/10 cursor-default select-none">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-full overflow-hidden shrink-0"><img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" data-auth="nav-authed-header-avatar" class="w-full h-full object-cover" alt="Profile" /></div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-semibold truncate text-sm" data-auth="nav-name"></div>
                                    <div class="text-xs opacity-60 truncate" data-auth="nav-email"></div>
                                </div>
                                <span class="badge badge-sm hidden" data-auth="nav-role"></span>
                            </div>
                        </div>
                        <div data-auth="nav-guest-header" class="px-3 pt-3 pb-2 border-b border-base-content/10 cursor-default select-none">
                            <div class="flex items-center gap-2.5">
                                <div class="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center shrink-0">
                                    <i class="fa-solid fa-user text-base-content/40"></i>
                                </div>
                                <div class="flex-1 min-w-0">
                                    <div class="font-semibold text-sm">Guest</div>
                                    <div class="text-xs opacity-60">Not signed in</div>
                                </div>
                            </div>
                        </div>
                        <div class="hidden px-3 py-1.5 border-b border-base-content/10" data-auth="credits-row">
                            <div class="flex items-center justify-between text-xs">
                                <span class="flex items-center gap-1.5 opacity-70">
                                    <span>\u{1FA99}</span>
                                    <span data-auth="credits-balance">\u2014</span>
                                    <span class="opacity-60">credits</span>
                                </span>
                                <span class="opacity-40 text-[10px]" data-auth="credits-reset"></span>
                            </div>
                        </div>
                        <ul class="menu p-2">
                            <li data-nav-chrome="theme">
                                <div class="flex items-center gap-2.5 px-2.5 py-2">
                                    <i class="fa-solid fa-circle-half-stroke w-4 text-center opacity-60"></i>
                                    <div id="theme-toggle" class="theme-switcher w-full bg-base-300/70 text-xs font-medium">
                                        <button data-theme-mode="light" class="theme-switcher-btn rounded-md px-2 py-1.5 cursor-pointer"><i class="fa-solid fa-sun mr-1"></i>Light</button>
                                        <button data-theme-mode="dark" class="theme-switcher-btn rounded-md px-2 py-1.5 cursor-pointer"><i class="fa-solid fa-moon mr-1"></i>Dark</button>
                                        <button data-theme-mode="auto" class="theme-switcher-btn rounded-md px-2 py-1.5 cursor-pointer"><i class="fa-solid fa-circle-half-stroke mr-1"></i>Auto</button>
                                    </div>
                                </div>
                            </li>
                            <li data-auth="login-item">
                                <a class="flex items-center gap-3" href="https://auth.dhanur.me/" data-auth="login-btn"><i class="fa-solid fa-right-to-bracket w-4 text-center"></i><span>Sign In</span></a>
                            </li>
                            <li class="hidden" data-auth="account-item">
                                <a class="flex items-center gap-3" href="https://auth.dhanur.me/"><i class="fa-solid fa-gear w-4 text-center"></i><span>Account Settings</span></a>
                            </li>
                            <li class="hidden border-t border-base-content/10 mt-1 pt-1" data-auth="logout-item">
                                <button type="button" class="w-full text-left flex items-center gap-3 text-error/80 hover:text-error" data-auth="logout-btn"><i class="fa-solid fa-right-from-bracket w-4 text-center"></i><span>Sign Out</span></button>
                            </li>
                        </ul>
                    </div>
                </div>
            </li>
        </ul>
    </div>
</div>

<div id="shell-mobile-panel" class="fixed inset-0 z-[100] hidden" data-shell-mobile-panel>
    <div class="absolute inset-0 bg-black/50 transition-opacity" data-shell-mobile-backdrop></div>
    <div class="absolute top-0 left-0 bottom-0 w-72 bg-base-100 shadow-2xl flex flex-col overflow-y-auto transform -translate-x-full transition-transform duration-300" data-shell-mobile-drawer>
        <div class="flex items-center justify-between px-4 py-3 border-b border-base-content/10">
            <a href="https://dhanur.me/" class="font-bold text-lg text-base-content no-underline hover:no-underline">dhanur.me</a>
            <button type="button" class="btn btn-ghost btn-circle btn-sm" data-shell-mobile-close aria-label="Close menu">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>
        <div class="px-4 py-4 border-b border-base-content/10" data-nav-chrome="apps">
            <div class="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-3">Apps</div>
            <div class="grid grid-cols-3 gap-2" data-app-menu-grid="mobile">
                <div class="col-span-3 flex justify-center py-4 opacity-50"><span class="loading loading-spinner loading-sm"></span></div>
            </div>
        </div>
        <div class="px-4 py-3 border-b border-base-content/10" data-nav-chrome="account">
            <div class="flex items-center gap-3 mb-3">
                <div data-auth="mobile-guest-avatar" class="w-9 h-9 rounded-full bg-base-300 flex items-center justify-center shrink-0">
                    <i class="fa-solid fa-user text-base-content/50 text-sm"></i>
                </div>
                <div data-auth="mobile-authed-avatar" class="hidden w-9 h-9 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-1 overflow-hidden shrink-0">
                  <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="Profile" class="w-full h-full object-cover" />
                </div>
                <div class="flex-1 min-w-0">
                    <div class="font-semibold text-sm truncate" data-auth="mobile-name">Guest</div>
                    <div class="text-xs opacity-60 truncate" data-auth="mobile-email">Not signed in</div>
                </div>
            </div>
            <div class="flex gap-2">
                <a href="https://auth.dhanur.me/" class="btn btn-primary btn-sm flex-1 no-underline hover:no-underline" data-auth="mobile-login-btn">Sign In</a>
                <button type="button" class="btn btn-ghost btn-sm flex-1 text-error/80 hover:text-error hidden" data-auth="mobile-logout-btn">Sign Out</button>
                <a href="https://auth.dhanur.me/" class="btn btn-ghost btn-sm flex-1 hidden no-underline hover:no-underline" data-auth="mobile-account-btn">Account</a>
            </div>
        </div>
        <div class="px-4 py-3" data-nav-chrome="theme">
            <div class="flex items-center gap-2.5">
                <i class="fa-solid fa-circle-half-stroke w-4 text-center opacity-60"></i>
                <div class="theme-switcher w-full bg-base-300/70 text-xs font-medium">
                    <button data-theme-mode="light" class="theme-switcher-btn rounded-md px-2 py-1.5 cursor-pointer"><i class="fa-solid fa-sun mr-1"></i>Light</button>
                    <button data-theme-mode="dark" class="theme-switcher-btn rounded-md px-2 py-1.5 cursor-pointer"><i class="fa-solid fa-moon mr-1"></i>Dark</button>
                    <button data-theme-mode="auto" class="theme-switcher-btn rounded-md px-2 py-1.5 cursor-pointer"><i class="fa-solid fa-circle-half-stroke mr-1"></i>Auto</button>
                </div>
            </div>
        </div>
    </div>
</div>`;function Qe(){let e=document.getElementById("dhanur-shell"),t=document.createElement("div");if(window.trustedTypes&&window.__defaultPolicy?t.innerHTML=window.__defaultPolicy.createHTML(ue):t.innerHTML=ue,e)e.replaceChildren(...t.children);else{let n=document.createDocumentFragment();for(;t.firstChild;)n.appendChild(t.firstChild);document.body.prepend(n)}}async function he(){if(se)return;se=!0;let e=fe();if(e.showNavbar===!1)return;if(!Re()){console.warn("[shell.js] Execution blocked on unauthorized origin.");return}$e(e);let t=pe(),n=document.querySelector(".navbar");if(n||(Qe(),n=document.querySelector(".navbar")),n){Ge(document.body);return}me(t,e),ge(t,e)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",he):he();})();
