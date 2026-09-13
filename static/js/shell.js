(()=>{function B(){if(window.__siteConfig)return window.__siteConfig;let e=document.getElementById("site-config");if(e)try{return window.__siteConfig=JSON.parse(e.textContent),window.__siteConfig}catch(t){console.error("[SiteConfig] Failed to parse JSON config",t)}return window.__siteConfig=window.SiteNavConfig||{},window.__siteConfig}var v="https://dhanur.me",$=(()=>{let e=window.location.hostname;if(e==="localhost"||e==="127.0.0.1")return"";let t=e.split(".");return t.length>=2?"."+t.slice(-2).join("."):""})();function j(){if(window.__defaultPolicy)return;if(window.trustedTypes&&window.trustedTypes.createPolicy)try{window.__defaultPolicy=window.trustedTypes.createPolicy("default",{createScriptURL:function(t){return t},createHTML:function(t){return t}})}catch{}function e(t){let n=Element.prototype[t];Element.prototype[t]=function(...a){let o=n.apply(this,a),i=a[0];if(i&&i.tagName==="IFRAME")try{let s=i.contentWindow;s&&s.trustedTypes&&!s.trustedTypes.defaultPolicy&&s.trustedTypes.createPolicy("default",{createHTML:r=>r,createScript:r=>r,createScriptURL:r=>r})}catch{}return o}}e("appendChild"),e("insertBefore")}var be={MOBILE:0,SM:640,MD:768,LG:1024,XL:1280,XXL:1536},d={isDesktop:!1,isMobile:!1,mediaQueries:{},listeners:new Set},z=!1;function _(){let e=d.isDesktop;d.isDesktop=d.mediaQueries.hoverCapable?.matches&&d.mediaQueries.finePointer?.matches,d.isMobile=!d.isDesktop,e!==d.isDesktop&&ve()}function ve(){d.listeners.forEach(e=>{try{e({isDesktop:d.isDesktop,isMobile:d.isMobile,isLargeScreen:ye(),isTouchDevice:we(),prefersReducedMotion:Ae()})}catch(t){console.error(t)}})}function U(){z||typeof window.matchMedia=="function"&&(z=!0,d.mediaQueries.hoverCapable=window.matchMedia("(hover: hover)"),d.mediaQueries.finePointer=window.matchMedia("(pointer: fine)"),d.mediaQueries.largeScreen=window.matchMedia(`(min-width: ${be.LG}px)`),d.mediaQueries.touchDevice=window.matchMedia("(pointer: coarse)"),d.mediaQueries.reducedMotion=window.matchMedia("(prefers-reduced-motion: reduce)"),_(),Object.values(d.mediaQueries).forEach(e=>{e.addListener?e.addListener(_):e.addEventListener&&e.addEventListener("change",_)}))}var ye=()=>d.mediaQueries.largeScreen?.matches||!1,we=()=>d.mediaQueries.touchDevice?.matches||!1,Ae=()=>d.mediaQueries.reducedMotion?.matches||!1;function G(e){let t=`${e}=`,n=document.cookie?document.cookie.split(";"):[];for(let a of n){let o=a.trim();if(o.startsWith(t))return decodeURIComponent(o.slice(t.length))}return""}function Q(e,t,n={}){let{maxAgeSeconds:a,domain:o,path:i="/",sameSite:s="Lax"}=n,r=typeof a=="number"?`; Max-Age=${a}`:"",l=o?`; Domain=${o}`:"";document.cookie=`${e}=${encodeURIComponent(t)}; Path=${i}; SameSite=${s}; Secure${r}${l}`}var xe={dark:"dark",light:"light"},Se=["auto","light","dark"],F={dark:"#010409",light:"#f6f8fa"},ke=240,g="auto",p=window.matchMedia?window.matchMedia("(prefers-color-scheme: dark)"):null,y=null;function w(e,t="auto"){let n=String(e||"").trim().toLowerCase();return Se.includes(n)?n:n.includes("dark")?"dark":n.includes("light")?"light":t}function Le(){let e=window.__getThemeCookie?window.__getThemeCookie():G("theme")||null;return w(e,"auto")}function Ce(e){let t=w(e,"auto");if(window.__setThemeCookie){window.__setThemeCookie(t);return}Q("theme",t,{maxAgeSeconds:31536e3,domain:$||void 0,path:"/",sameSite:"Lax",secure:window.location.protocol==="https:"})}function M(e){let t=w(e,"auto");return window.__resolveColorset?window.__resolveColorset(t):t==="auto"?p&&p.matches?"dark":"light":t}function T(e){let t=xe[e]||e;document.documentElement.setAttribute("data-theme",t),document.documentElement.style.backgroundColor=F[e]||F.dark,e==="dark"?(document.documentElement.classList.add("dark"),document.documentElement.classList.remove("light"),document.documentElement.style.colorScheme="dark"):(document.documentElement.classList.add("light"),document.documentElement.classList.remove("dark"),document.documentElement.style.colorScheme="light");function n(a,o){document.querySelectorAll(a).forEach(i=>{i.classList.remove("hidden","invisible"),i.style.opacity=o?"1":"0",i.style.visibility=o?"visible":"hidden",i.style.pointerEvents=o?"":"none"})}n(".logo-dark",e==="dark"),n(".logo-light",e==="light"),n(".hero-dark",e==="dark"),n(".hero-light",e==="light")}function W(){let e=document.documentElement;e.classList.add("is-theme-switching"),y&&window.clearTimeout(y),y=window.setTimeout(()=>{e.classList.remove("is-theme-switching"),y=null},ke)}function q(){document.querySelectorAll(".theme-switcher").forEach(e=>{e.querySelectorAll("[data-theme-mode]").forEach(t=>{let a=t.getAttribute("data-theme-mode")===g;t.style.background=a?"color-mix(in oklab, var(--color-base-content) 20%, transparent)":"",t.style.boxShadow=a?"0 1px 3px rgba(0,0,0,0.12), inset 0 0 0 1px color-mix(in oklab, var(--color-base-content) 8%, transparent)":"",t.style.opacity=a?"1":"0.55"})})}function Ee(e){g=e,Ce(e),W();let t=M(e);T(t),q(),document.dispatchEvent(new CustomEvent("themeChanged",{detail:t}))}function V(e=document){g=w(Le(),"auto");let t=M(g);if(T(t),q(),document.dispatchEvent(new CustomEvent("themeChanged",{detail:t})),e.querySelectorAll(".theme-switcher [data-theme-mode]").forEach(n=>{n.addEventListener("click",a=>{a.preventDefault(),a.stopPropagation();let o=n.getAttribute("data-theme-mode");o&&o!==g&&Ee(o)})}),p){let n=()=>{if(g==="auto"){W();let a=M("auto");T(a),q(),document.dispatchEvent(new CustomEvent("themeChanged",{detail:a}))}};p.addEventListener?p.addEventListener("change",n):p.addListener&&p.addListener(n)}}function K({src:e,selector:t,async:n=!0,defer:a=!1,crossOrigin:o,loadedAttribute:i,onLoad:s,onError:r}){if(!e&&!t)return null;let l=t?document.querySelector(t):document.querySelector(`script[src="${e}"]`);if(l)return typeof s=="function"&&((i?l.getAttribute(i)==="1":!1)||l.readyState==="complete"?s():l.addEventListener("load",s,{once:!0})),typeof r=="function"&&l.addEventListener("error",r,{once:!0}),l;let c=document.createElement("script"),h=window.__defaultPolicy;return c.src=h?h.createScriptURL(e):e,c.async=n,c.defer=a,o&&(c.crossOrigin=o),c.addEventListener("load",()=>{i&&c.setAttribute(i,"1"),typeof s=="function"&&s()},{once:!0}),typeof r=="function"&&c.addEventListener("error",r,{once:!0}),document.head.appendChild(c),c}function A(){return!window.AUTH||typeof window.AUTH!="object"?null:window.AUTH}function _e(e){let t=!1,n;return function(...a){return t||(t=!0,n=e.apply(this,a)),n}}function D(...e){e.forEach(t=>{t&&(t instanceof NodeList||Array.isArray(t)?t.forEach(n=>n&&n.classList.remove("hidden")):t.classList&&t.classList.remove("hidden"))})}function P(...e){e.forEach(t=>{t&&(t instanceof NodeList||Array.isArray(t)?t.forEach(n=>n&&n.classList.add("hidden")):t.classList&&t.classList.add("hidden"))})}function u(e,t){e&&(e instanceof NodeList||Array.isArray(e)?e.forEach(n=>{n&&(n.textContent=t)}):e.nodeType&&(e.textContent=t))}function J(e,t){e&&(e instanceof NodeList||Array.isArray(e)?e.forEach(n=>{n&&(t?n.src=t:n.removeAttribute("src"))}):e.nodeType&&(t?e.src=t:e.removeAttribute("src")))}function X(e,t){let n=e.querySelectorAll('[data-auth="credits-row"], [data-auth="sidebar-credits-row"]'),a=e.querySelectorAll('[data-auth="credits-balance"], [data-auth="sidebar-credits-balance"]'),o=e.querySelectorAll('[data-auth="credits-reset"], [data-auth="sidebar-credits-reset"]');if(!t||n.length===0){P(n);return}if(D(n),t.unlimited||t.balance===-1)u(a,"\u221E"),u(o,"Admin");else if(u(a,String(t.balance??"\u2014")),t.periodEnd)try{let i=new Date(t.periodEnd);u(o,`resets ${i.toLocaleDateString(void 0,{month:"short",day:"numeric"})}`)}catch{u(o,"")}else u(o,"")}function Me(e){let t=_e(e);if(A()){t();return}document.addEventListener("authReady",t,{once:!0}),K({src:"https://auth.dhanur.me/auth-client.js",selector:'script[src*="auth-client.js"]',defer:!0,onLoad:()=>{let n=A();n&&typeof n.onReady=="function"?n.onReady(()=>t()):t()},onError:()=>{console.warn("[Auth] Could not load auth-client.js"),t()}}),window.setTimeout(()=>{A()&&t()},2e3)}function Y(e=document,t=null){e.__authIntegrationBound||(e.__authIntegrationBound=!0,Me(()=>{let n=A();if(!n)return;let a={navGuestAvatar:e.querySelectorAll('[data-auth="nav-guest-avatar"], [data-auth="mobile-guest-avatar"], [data-auth="sidebar-guest-avatar"]'),navAuthedAvatar:e.querySelectorAll('[data-auth="nav-authed-avatar"], [data-auth="mobile-authed-avatar"], [data-auth="sidebar-authed-avatar"]'),navAvatarImg:e.querySelectorAll('[data-auth="nav-authed-avatar"] img, [data-auth="mobile-authed-avatar"] img, [data-auth="sidebar-authed-avatar"] img'),navAuthedHeaderImg:e.querySelectorAll('[data-auth="nav-authed-header-avatar"], [data-auth="mobile-authed-header-avatar"]'),navName:e.querySelectorAll('[data-auth="nav-name"], [data-auth="mobile-name"], [data-auth="sidebar-name"]'),navEmail:e.querySelectorAll('[data-auth="nav-email"], [data-auth="mobile-email"], [data-auth="sidebar-email"]'),navLoginItem:e.querySelectorAll('[data-auth="login-item"], [data-auth="mobile-login-btn"], [data-auth="sidebar-login-btn"]'),navAccountItem:e.querySelectorAll('[data-auth="account-item"], [data-auth="mobile-account-btn"], [data-auth="sidebar-account-btn"]'),navLogoutItem:e.querySelectorAll('[data-auth="logout-item"], [data-auth="mobile-logout-btn"], [data-auth="sidebar-logout-btn"]'),navGuestHeader:e.querySelectorAll('[data-auth="nav-guest-header"], [data-auth="mobile-guest-header"]'),navAuthedHeader:e.querySelectorAll('[data-auth="nav-authed-header"], [data-auth="mobile-authed-header"]'),navRoleBadge:e.querySelectorAll('[data-auth="nav-role"]')};function o(i){if(!i)return;let s=i.authenticated,r=i.user,l=r?.avatar_url||"",c=r?.name||"User";if(s&&r){P(a.navGuestAvatar,a.navGuestHeader,a.navLoginItem),D(a.navAuthedAvatar,a.navAuthedHeader,a.navAccountItem,a.navLogoutItem,a.navRoleBadge),J(a.navAvatarImg,l),J(a.navAuthedHeaderImg,l),u(a.navName,c),u(a.navEmail,r.email||""),u(a.navRoleBadge,i.role||"user");try{l&&localStorage.setItem("dhanur_avatar_url_v1",l)}catch{}X(e,i.credits||null)}else D(a.navGuestAvatar,a.navGuestHeader,a.navLoginItem),P(a.navAuthedAvatar,a.navAuthedHeader,a.navAccountItem,a.navLogoutItem,a.navRoleBadge);typeof t=="function"&&t(i)}typeof n.onReady=="function"?n.onReady(i=>o(i?.status||i||n.status||null)):n.status&&o(n.status),document.addEventListener("authChanged",i=>o(i.detail)),document.addEventListener("creditsChanged",i=>X(e,i.detail)),document.__authClickDelegated||(document.__authClickDelegated=!0,document.addEventListener("click",i=>{if(i.target.closest('[data-auth="login-btn"], [data-auth="sidebar-login-btn"], [data-auth="mobile-login-btn"]')){i.preventDefault(),typeof n.login=="function"&&n.login();return}if(i.target.closest('[data-auth="logout-btn"], [data-auth="sidebar-logout-btn"], [data-auth="mobile-logout-btn"]')){i.preventDefault(),typeof n.logout=="function"&&n.logout();return}})),window.addEventListener("message",async i=>{if((i.origin==="https://auth.dhanur.me"||i.origin==="https://dhanur.me"||i.origin.endsWith(".dhanur.me")||i.origin.startsWith("http://localhost:"))&&!(!i.data||typeof i.data!="object")&&(i.data.type==="auth-login-success"||i.data.type==="auth-upgrade-success")){if(n&&typeof n.refresh=="function"){let r=await n.refresh();o(r)}else try{let r=await fetch("https://auth.dhanur.me/api/status",{credentials:"include"});if(r.ok){let l=await r.json();o(l),document.dispatchEvent(new CustomEvent("authChanged",{detail:l}))}}catch(r){console.error("[Auth] Background session synchronization failed:",r)}i.source&&i.source.postMessage({type:"auth-ack-close"},i.origin)}})}))}var Te=`
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
`;function qe(){if(document.getElementById("access-wall-styles"))return;let e=document.createElement("style");e.id="access-wall-styles",e.textContent=Te,document.head.appendChild(e)}function Z(e={},t=null){let n=e.requireAdmin===!0;if(!(e.requireAuth===!0||n))return{allowed:!0};let o=t?.authenticated===!0,i=t?.role||"guest";return o?n&&i!=="admin"?{allowed:!1,reason:"admin_required"}:{allowed:!0}:{allowed:!1,reason:"auth_required"}}function ee(e,t="auth_required",n="This app"){if(!e)return;qe();let a=t==="admin_required",o=a?"fa-solid fa-shield-halved":"fa-solid fa-lock",i=a?"Admin access required":"Sign in to continue",s=a?`${n} is restricted to administrator sessions.`:`${n} requires a dhanur.me account to continue.`,r=a?"Verify Admin":"Sign In",l=a?"upgrade-btn":"login-btn";e.innerHTML=`
    <div class="access-wall">
      <i class="access-wall-icon ${o}"></i>
      <h1 class="access-wall-title">${i}</h1>
      <p class="access-wall-sub">${s}</p>
      <button class="btn btn-primary" data-auth="${l}">
        <i class="fa-solid fa-right-to-bracket"></i>
        ${r}
      </button>
    </div>
  `;let c=window.AUTH;if(t==="admin_required"){let f=e.querySelector('[data-auth="upgrade-btn"]');f&&c&&typeof c.upgrade=="function"&&f.addEventListener("click",L=>{L.preventDefault(),c.upgrade()});return}let h=e.querySelector('[data-auth="login-btn"]');h&&c&&typeof c.login=="function"&&h.addEventListener("click",f=>{f.preventDefault(),c.login()})}var De="https://up.dhanur.me/api/manifest",ne="dhanur_manifest_v1";var ae=[{name:"Home",url:"https://dhanur.me",icon:"fa-solid fa-house",minRole:"guest"},{name:"Linkr",url:"https://linkr.dhanur.me",icon:"fa-solid fa-link",minRole:"guest"},{name:"Tasks",url:"https://tasks.dhanur.me",icon:"fa-solid fa-clipboard-list",minRole:"guest"},{name:"Auth",url:"https://auth.dhanur.me",icon:"fa-solid fa-fingerprint",minRole:"guest"},{name:"Status",url:"https://up.dhanur.me",icon:"fa-solid fa-heart-pulse",minRole:"guest",category:"Core"}],m=null,x=new Map;function Pe(e){return e==="admin"?"admin":e==="user"?"user":"guest"}function te(e){return e==="admin"?2:e==="user"?1:0}function Ie(){try{let e=localStorage.getItem(ne);if(!e)return null;let t=JSON.parse(e);if(!t||!Array.isArray(t.apps))return null;let n=Number(t._cachedAt||0);return{...t,_stale:Date.now()-n>36e5}}catch{return null}}function Oe(e){try{localStorage.setItem(ne,JSON.stringify({version:e.version||"1",apps:Array.isArray(e.apps)?e.apps:ae,_cachedAt:Date.now()}))}catch{}}function I(){if(m&&Array.isArray(m.apps))return m;let e=Ie();return e&&Array.isArray(e.apps)?(m=e,e):{version:"0",apps:ae,_stale:!0}}function O(e,t="guest"){let n=te(t);return(Array.isArray(e)?e:[]).filter(a=>te(a?.minRole||"guest")<=n)}async function oe(e="guest"){let t=Pe(e);if(x.has(t))return x.get(t);let n=(async()=>{try{let a=`${De}?role=${encodeURIComponent(t)}`,o=await fetch(a,{credentials:"omit",mode:"cors",cache:"no-cache"});if(!o.ok)throw new Error(`Manifest request failed with status ${o.status}`);let i=await o.json();if(!i||!Array.isArray(i.apps))throw new Error("Manifest payload is invalid");return m={version:i.version||"1",apps:i.apps},Oe(m),m}catch{return I()}})();x.set(t,n);try{return await n}finally{x.delete(t)}}var ie=!1;function S(){document.querySelectorAll("[data-dropdown][data-open]").forEach(e=>{e.removeAttribute("data-open")})}function H(){return document.querySelector("[data-dropdown][data-open]")}function re(e){let t=e.querySelector(".dropdown-panel");if(!t)return;let n=e.getBoundingClientRect(),a=t.offsetWidth||224,o=(n.width-a)/2,i=n.left+o+a-(window.innerWidth-16);i>0&&(o-=i),n.left+o<8&&(o=8-n.left),t.style.left=`${o}px`,t.style.right="auto"}function He(e){S(),e.setAttribute("data-open",""),re(e)}function se(e=document){let t=e.querySelectorAll("[data-dropdown]");t.length&&(t.forEach(n=>{if(n.getAttribute("data-dropdown-init")==="1")return;let a=n.querySelector('button, [role="button"]');if(!a)return;let o=n.querySelector(".dropdown-panel"),i=a.classList.contains("tooltip")&&(a.hasAttribute("data-tooltip-label")||a.hasAttribute("data-tip")||!!a.querySelector(":scope > .tooltip-content"));n.setAttribute("data-dropdown-tooltip",i?"1":"0");let s=r=>{r.stopPropagation(),n.hasAttribute("data-open")?S():He(n)};a.addEventListener("click",s),a.addEventListener("keydown",r=>{(r.key==="Enter"||r.key===" ")&&(r.preventDefault(),s(r))}),o&&o.addEventListener("click",r=>r.stopPropagation()),n.setAttribute("data-dropdown-init","1")}),!ie&&(ie=!0,document.addEventListener("click",()=>{H()&&S()}),document.addEventListener("keydown",n=>{n.key==="Escape"&&H()&&S()}),window.addEventListener("resize",()=>{let n=H();n&&re(n)})))}var N={shellPath:"/navbar/",favicon:!0,enablePwa:!0,swPath:"/sw.js",requireAuth:!1,requireAdmin:!1,showMobileMenu:!0,showLanguage:!1,showAppsGrid:!0,showAccountButton:!0,showThemeToggle:!1};typeof window<"u"&&(window.SiteNavConfig={...N,...window.SiteNavConfig||{}});var k=`<div class="navbar site-topbar fixed top-0 left-0 right-0 z-50 h-16">
    <!-- Mobile hamburger (button, not label, so it works on subdomains without a drawer) -->
    <div class="flex-none lg:hidden">
        <button id="shell-mobile-toggle" type="button" aria-label="Open menu" class="btn btn-ghost btn-circle btn-sm transition-colors duration-200">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>
    </div>

    <!-- Logo (centered on mobile) -->
    <div class="flex-1 flex justify-center items-center lg:flex lg:justify-start">
        <a
            href="https://dhanur.me/"
            data-keybind="d h"
            data-keybind-action="click"
            data-tooltip-label="Go to home"
            data-tooltip-shortcut="d h"
            data-tooltip-position="bottom"
            class="btn btn-ghost hover:bg-transparent hover:border-transparent normal-case text-xl font-bold text-base-content logo-firefly site-logo-link tooltip tooltip-bottom"
        >
            <div class="relative h-18 flex items-center">
                <picture>
                    <img
                        src="https://raw.githubusercontent.com/kascit/kascit.github.io/raw-mirror/images/branding/logo-light.png"
                        alt="~/dhanur"
                        class="h-18 w-auto p-[15px] logo-dark"
                        sizes="200px"
                        data-logo-type="dark"
                        loading="eager"
                        fetchpriority="high"
                    />
                </picture>
                <picture class="absolute inset-0 flex items-center">
                    <img
                        src="https://raw.githubusercontent.com/kascit/kascit.github.io/raw-mirror/images/branding/logo-dark.png"
                        alt="~/dhanur"
                        class="h-18 w-auto p-[15px] logo-light"
                        sizes="200px"
                        data-logo-type="light"
                        loading="eager"
                        fetchpriority="high"
                    />
                </picture>
            </div>
        </a>
    </div>

    <div class="flex-none lg:hidden" aria-hidden="true"><div class="btn btn-circle btn-sm invisible"></div></div>

    <!-- Desktop Menu -->
    <div class="flex-none hidden lg:flex">
        <ul class="menu menu-horizontal px-1 items-center">
            
            <!-- Apps Grid -->
            <li data-nav-chrome="apps" class="ml-1">
                <div class="relative p-0" data-dropdown="apps">
                    <button type="button" class="btn btn-ghost btn-square tooltip tooltip-bottom" data-tooltip-label="Apps" data-tooltip-position="bottom" aria-label="Apps">
                        <svg class="w-5 h-5" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"></path></svg>
                    </button>
                    <div class="dropdown-panel z-50 mt-2 p-4 bg-base-100 border border-base-content/10 rounded-box w-64 right-0 mr-2 md:mr-4">
                        <div class="grid grid-cols-3 gap-2" data-app-menu-grid="desktop">
                            <!-- Apps grid populated by manifest.js -->
                            <div class="col-span-3 flex justify-center py-4 opacity-50"><span class="loading loading-spinner loading-sm"></span></div>
                        </div>
                    </div>
                </div>
            </li>

            <!-- Account -->
            <li data-nav-chrome="account" class="ml-1">
                <div class="relative p-0" data-dropdown="account">
                    <button type="button" class="btn btn-ghost btn-circle tooltip tooltip-bottom" data-tooltip-label="Account" data-tooltip-position="bottom" aria-label="Account">
                        <div data-auth="nav-guest-avatar" class="w-9 h-9 rounded-full bg-base-300 flex items-center justify-center">
                            <i class="fa-solid fa-user text-base-content/50 text-sm"></i>
                        </div>
                        <div data-auth="nav-authed-avatar" class="hidden w-9 h-9 rounded-full ring-2 ring-primary ring-offset-base-100 ring-offset-1 overflow-hidden">
                            <img src="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==" alt="Profile" class="w-full h-full object-cover" />
                        </div>
                    </button>
                    <div class="dropdown-panel z-50 mt-2 bg-base-100 border border-base-content/10 rounded-box w-64 right-0 mr-2 md:mr-4 overflow-hidden">
                        
                        <!-- authed header -->
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

                        <!-- guest header -->
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

                        <!-- Credits display -->
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

<!-- Mobile slide-out panel (for subdomains without a drawer) -->
<div id="shell-mobile-panel" class="fixed inset-0 z-[100] hidden" data-shell-mobile-panel>
    <div class="absolute inset-0 bg-black/50 transition-opacity" data-shell-mobile-backdrop></div>
    <div class="absolute top-0 left-0 bottom-0 w-72 bg-base-100 shadow-2xl flex flex-col overflow-y-auto transform -translate-x-full transition-transform duration-300" data-shell-mobile-drawer>
        <!-- Mobile panel header -->
        <div class="flex items-center justify-between px-4 py-3 border-b border-base-content/10">
            <a href="https://dhanur.me/" class="font-bold text-lg text-base-content no-underline hover:no-underline">dhanur.me</a>
            <button type="button" class="btn btn-ghost btn-circle btn-sm" data-shell-mobile-close aria-label="Close menu">
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path></svg>
            </button>
        </div>

        <!-- Mobile apps grid -->
        <div class="px-4 py-4 border-b border-base-content/10" data-nav-chrome="apps">
            <div class="text-xs font-semibold uppercase tracking-wider text-base-content/50 mb-3">Apps</div>
            <div class="grid grid-cols-3 gap-2" data-app-menu-grid="mobile">
                <div class="col-span-3 flex justify-center py-4 opacity-50"><span class="loading loading-spinner loading-sm"></span></div>
            </div>
        </div>

        <!-- Mobile account section -->
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

        <!-- Mobile theme toggle -->
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
</div>
`;j();window.__componentsJS=!0;var le=!1,ce={...N,noCss:!1,showNavbar:!0,showLanguage:!0,showAppsGrid:!0,showAccountButton:!0,showThemeToggle:!0,showMobileMenu:!0,enablePwa:!1,favicon:!1};function fe(){let e=B()||{},t=e.shell&&typeof e.shell=="object"?e.shell:{},n={...ce,...e,...t};return(typeof n.shellPath!="string"||n.shellPath.trim()==="")&&(n.shellPath=ce.shellPath),n}function pe(){return window.location.origin===v}function Ne(){let e=window.location.hostname;return e==="dhanur.me"||e.endsWith(".dhanur.me")||e==="localhost"}function Re(e){if(e.enablePwa===!1||!("serviceWorker"in navigator)||!window.isSecureContext)return;let t=typeof e.swPath=="string"&&e.swPath.trim()!==""?e.swPath:"/sw.js";window.addEventListener("load",()=>{navigator.serviceWorker.register(t).catch(()=>{})},{once:!0})}function me(e,t){if(t.noCss||document.querySelector('link[data-shell-style="main"]'))return;let n=e?"":v,a=e?`${n}/css/main.css`:`${n}/css/dui.css`,o=document.createElement("link");o.rel="stylesheet",o.href=a,o.setAttribute("data-shell-style","main"),e||(o.crossOrigin="anonymous"),document.head.appendChild(o);let i=document.createElement("link");i.rel="stylesheet",i.href=`${n}/css/font-awesome.subset.css`,i.setAttribute("data-shell-style","fa"),i.media="print",i.onload=function(){this.media="all"},e||(i.crossOrigin="anonymous"),document.head.appendChild(i)}function ge(e,t){if(t.favicon===!1)return;let n=e?"/icons/":`${v}/icons/`;document.querySelectorAll('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]').forEach(o=>o.remove());let a=[{rel:"icon",type:"image/png",sizes:"96x96",href:`${n}favicon-96x96-transparent.png`},{rel:"icon",type:"image/svg+xml",href:`${n}favicon.svg`},{rel:"apple-touch-icon",sizes:"180x180",href:`${n}apple-touch-icon-180x180-transparent.png`}];e&&a.push({rel:"shortcut icon",href:`${n}favicon-transparent.ico`}),e&&(document.querySelectorAll('link[rel="manifest"]').forEach(o=>o.remove()),a.push({rel:"manifest",href:`${n}site.webmanifest`})),a.forEach(o=>{let i=document.createElement("link");i.rel=o.rel,o.type&&(i.type=o.type),o.sizes&&(i.sizes=o.sizes),i.href=o.href,!e&&o.rel==="manifest"&&(i.crossOrigin="anonymous"),document.head.appendChild(i)})}function Be(e,t){if(t.showLanguage||e.querySelectorAll('[data-nav-chrome="lang"]').forEach(n=>n.remove()),t.showAppsGrid||e.querySelectorAll('[data-nav-chrome="apps"]').forEach(n=>n.remove()),t.showAccountButton||e.querySelectorAll('[data-nav-chrome="account"]').forEach(n=>n.remove()),t.showThemeToggle||e.querySelectorAll('[data-nav-chrome="theme"]').forEach(n=>n.remove()),!t.showMobileMenu){let n=e.querySelector("#shell-mobile-toggle");if(n){let o=n.closest(".flex-none");o&&o.remove()}let a=e.querySelector("[data-shell-mobile-panel]");a&&a.remove()}}function $e(e){let t=String(e||"").trim();if(!t)return"#";try{let n=new URL(t,window.location.origin);if(n.protocol==="http:"||n.protocol==="https:")return n.href}catch{}return"#"}function je(e){let t=String(e||"").trim();return!t||!/^[a-z0-9\s_-]+$/i.test(t)?"fa-solid fa-link":t}function de(e,t){let n=e.querySelectorAll("[data-app-menu-grid], [data-apps-grid], [data-apps-grid-mobile]");if(!n.length)return;let a=Array.isArray(t)?t:[];n.forEach(o=>{let i=o.getAttribute("data-app-menu-grid"),r=i==="desktop"||!i&&o.hasAttribute("data-apps-grid")?"p-3":"p-2.5",l=document.createDocumentFragment();for(let c of a){let h=$e(c?.url),f=je(c?.icon),L=String(c?.name||"App").trim()||"App",b=document.createElement("a");b.href=h,b.className=`group flex flex-col items-center gap-1.5 ${r} rounded-md hover:bg-base-200 transition-colors duration-200 no-underline hover:no-underline text-base-content`;let C=document.createElement("div");C.className="w-10 h-10 rounded-md bg-base-300/50 flex items-center justify-center group-hover:bg-primary/10 group-hover:text-primary transition-colors";let R=document.createElement("i");R.className=`${f} text-lg`;let E=document.createElement("span");E.className="text-[10px] font-medium opacity-70 group-hover:opacity-100",E.textContent=L,C.appendChild(R),b.appendChild(C),b.appendChild(E),l.appendChild(b)}o.replaceChildren(l)})}async function ue(e,t){let n=I(),a=O(n.apps,t);de(e,a);let o=await oe(t),i=O(o.apps,t);return de(e,i),i}function ze(){let e=document.querySelector("[data-shell-mobile-panel]");if(!e)return;let t=e.querySelector("[data-shell-mobile-drawer]");function n(){e.classList.remove("hidden"),e.offsetWidth,t&&(t.style.transform="translateX(0)"),document.body.style.overflow="hidden"}function a(){t&&(t.style.transform="translateX(-100%)"),document.body.style.overflow="",setTimeout(()=>{e.classList.add("hidden")},300)}document.__shellMobileDelegated||(document.__shellMobileDelegated=!0,document.addEventListener("click",o=>{if(o.target.closest("#shell-mobile-toggle")){o.preventDefault(),o.stopPropagation(),n();return}let s=o.target.closest("[data-shell-mobile-close]"),r=o.target.closest("[data-shell-mobile-backdrop]");if(s||r){o.preventDefault(),o.stopPropagation(),a();return}}),document.addEventListener("keydown",o=>{o.key==="Escape"&&!e.classList.contains("hidden")&&a()}))}function Ue(e,t){let n=e.querySelector("[data-shell-mobile-panel]");if(!n)return;let a=t?.authenticated===!0,o=t?.user,i=n.querySelector('[data-auth="mobile-name"]'),s=n.querySelector('[data-auth="mobile-email"]');a&&o?(i&&(i.textContent=o.name||"User"),s&&(s.textContent=o.email||"")):(i&&(i.textContent="Guest"),s&&(s.textContent="Not signed in"))}function Ge(e){let t=fe(),n=pe(),a=!!document.querySelector('link[rel="stylesheet"][href*="/css/main.css"], link[rel="stylesheet"][href*="/css/dui.css"], link[data-shell-style="main"]'),o=!!document.querySelector('link[rel="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');(!n||!a)&&me(n,t),(!n||!o)&&ge(n,t),Be(e,t),ue(e,"guest"),U(),V(e),se(e),ze(),Y(document,i=>{let s=i?.role||"guest",r=Z(t,i),l=e.querySelector(".site-nav-slot")||e.querySelector(".drawer-content")||document.querySelector("main")||document.querySelector(".eco-page")||document.querySelector("#app-root")||document.querySelector("#app");if(!l){let c=document.getElementById("dhanur-shell")||e.querySelector(".navbar");c&&c.nextElementSibling&&(l=c.nextElementSibling)}if(!r.allowed){l&&ee(l,r.reason,document.title||"This app");return}ue(e,s),Ue(e,i)})}function Qe(){let e=document.getElementById("dhanur-shell"),t=[],n=window.__defaultPolicy||window.trustedTypes?.defaultPolicy;if(n&&typeof n.createHTML=="function"){let a=document.createElement("div");a.innerHTML=n.createHTML(k),t=Array.from(a.children)}else try{let o=new DOMParser().parseFromString(k,"text/html");t=Array.from(o.body.children)}catch{let a=document.createElement("div");a.innerHTML=k,t=Array.from(a.children)}if(e)e.replaceChildren(...t);else{let a=document.createDocumentFragment();for(let o of t)a.appendChild(o);document.body.prepend(a)}}async function he(){if(le)return;le=!0;let e=fe();if(e.showNavbar===!1)return;if(!Ne()){console.warn("[shell.js] Execution blocked on unauthorized origin.");return}Re(e);let t=pe(),n=document.querySelector(".navbar");if(n||(Qe(),n=document.querySelector(".navbar")),n){Ge(document.body);return}me(t,e),ge(t,e)}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",he):he();})();
