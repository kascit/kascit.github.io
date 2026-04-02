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
import { initShortcuts } from './modules/shortcuts.js';
import { initScrollToTop } from './modules/scroll-top.js';
import { initLazyPlugins } from './modules/lazy-plugins.js';
import { initServiceWorker } from './modules/service-worker.js';
import { initComments } from './modules/comments.js';

function bootstrapSite() {
  console.log(`
····························································
··············qpppu·········································
·······)pDDDDDDDDDDDDDDbpu······················)DDDDDDDDDD·
·····pDDDDDDDDDDDDDDDDDDDDDbu···················)DDDDDDDDDD·
···pDDDDDDDDDDDDDDDDDDDDDDDDDbp·················)DDDDDDDDDD·
·)DDDDDDDDDDDDDDDDDDDDDDDDDDDDDDp···············)DDDDDDDDDD·
·DDDDDDDDDDDP·······PDDDDDDDDDDDDb··············QDDDDDDDDDD·
(DDDDDDDDDDP··········(DDDDDDDDDDDDb···········)DDDDDDDDDDP·
QDDDDDDDDDP·············PDDDDDDDDDDDDDp······)pDDDDDDDDDDD··
DDDDDDDDDDb···············)QDDDDDDDDDDDDDDDDDDDDDDDDDDDDDP··
DDDDDDDDDDb·················)DDDDDDDDDDDDDDDDDDDDDDDDDDP····
DDDDDDDDDDb···················)DDDDDDDDDDDDDDDDDDDDDDPP·····
DDDDDDDDDDb·······················PDDDDDDDDDDDDDDDPP········
······································c(·PPPP(c·············
····························································
`);

  initResponsive();
  
  // Design system and Layout
  initTheme(document);
  initDrawer();
  initDropdowns(document);
  
  // Features
  initClipboard();
  initShortcuts();
  initScrollToTop();
  
  // Plugins & Integrations
  initLazyPlugins();
  initServiceWorker();
  initComments();

  // Authentication
  initAuth(document);
}

// -----------------------------------------------------------------------
// Initialization Hook
// -----------------------------------------------------------------------
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", bootstrapSite);
} else {
  bootstrapSite();
}
