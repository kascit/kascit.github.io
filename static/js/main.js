/**
 * Main Web Application Entrypoint (ES Module)
 * Replaces the old monolithic bundle.js
 */

import { initResponsive } from './modules/responsive.js';
import { initTheme } from './modules/theme-engine.js';
import { initAuth } from './modules/auth-integration.js';
import { initDropdowns } from './modules/dropdowns.js';
import { initDrawer } from './modules/drawer.js';
import { initClipboard } from './modules/clipboard.js';
import { initCodeBlocks } from './modules/code-blocks.js';
import { initShortcuts } from './modules/shortcuts.js';
import { initScrollToTop } from './modules/scroll-top.js';
import { initLazyPlugins } from './modules/lazy-plugins.js';
import { initServiceWorker } from './modules/service-worker.js';
import { initComments } from './modules/comments.js';
import { initBlogFeed } from './modules/blog-feed.js';
import { initTaxonomyFilter } from './modules/taxonomy-filter.js';
import { initTaxonomySubscribe } from './modules/taxonomy-subscribe.js';
import { initTaxonomyPlaylist } from './modules/taxonomy-playlist.js';
import { initCookieConsent } from './modules/cookie-consent.js';
import { initLayoutRecommendation } from './modules/layout-recommendation.js';

function runSafely(initFn) {
  try {
    initFn();
  } catch (error) {
    console.error('[Bootstrap] Module init failed:', error);
  }
}

function runAfterFirstPaint(callback) {
  if (typeof window.requestAnimationFrame === 'function') {
    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(callback);
    });
    return;
  }

  window.setTimeout(callback, 0);
}

function runWhenIdle(callback, timeout = 1200) {
  if (typeof window.requestIdleCallback === 'function') {
    window.requestIdleCallback(callback, { timeout });
    return;
  }

  window.setTimeout(callback, 120);
}

function bootstrapSite() {
  console.log(`\x1b[1m
···························································
··············qpppu········································
·······)pDDDDDDDDDDDDDDbpu······················)DDDDDDDDDD
·····pDDDDDDDDDDDDDDDDDDDDDbu···················)DDDDDDDDDD
···pDDDDDDDDDDDDDDDDDDDDDDDDDbp·················)DDDDDDDDDD
·)DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDp···············)DDDDDDDDDD
·DDDDDDDDDDDP·······PDDDDDDDDDDDDb··············QDDDDDDDDDD
(DDDDDDDDDDP··········(DDDDDDDDDDDDb···········)DDDDDDDDDDP
QDDDDDDDDDP·············PDDDDDDDDDDDDDp······)pDDDDDDDDDDD·
DDDDDDDDDDb···············)QDDDDDDDDDDDDDDDDDDDDDDDDDDDDDP·
DDDDDDDDDDb·················)DDDDDDDDDDDDDDDDDDDDDDDDDDP···
DDDDDDDDDDb···················)DDDDDDDDDDDDDDDDDDDDDDPP····
DDDDDDDDDDb·······················PDDDDDDDDDDDDDDDPP·······
······································c(·PPPP(c············
···························································
\x1b[0m`);

  runSafely(() => initResponsive());

  // Register SW early so non-critical runtime issues never block installability.
  runSafely(() => initServiceWorker());
  
  // Critical UI state first: theme/layout/auth + consent surfaces.
  runSafely(() => initTheme(document));
  runSafely(() => initDrawer());
  runSafely(() => initDropdowns(document));
  runSafely(() => initCookieConsent());
  runSafely(() => initAuth(document));

  // Interactive niceties after initial paint.
  runAfterFirstPaint(() => {
    runSafely(() => initCodeBlocks());
    runSafely(() => initClipboard());
    runSafely(() => initShortcuts());
    runSafely(() => initScrollToTop());
    runSafely(() => initLazyPlugins());
  });

  // Heavier/optional page features during idle time.
  runWhenIdle(() => {
    runSafely(() => initBlogFeed());
    runSafely(() => initTaxonomyFilter());
    runSafely(() => initTaxonomySubscribe());
    runSafely(() => initTaxonomyPlaylist());
    runSafely(() => initLayoutRecommendation());
    runSafely(() => initComments());
  });
  
}

// -----------------------------------------------------------------------
// Initialization Hook
// -----------------------------------------------------------------------
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapSite);
} else {
  bootstrapSite();
}
