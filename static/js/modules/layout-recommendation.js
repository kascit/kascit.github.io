/**
 * Recommend hiding one rail when reading width gets too narrow.
 */

const DISMISS_KEY = 'layout-width-reco-dismissed-v1';
const DESKTOP_MIN_WIDTH = 1024;
const RECOMMEND_MAX_VIEWPORT_WIDTH = 1350;
const RESIZE_DEBOUNCE_MS = 120;

function isDesktopViewport() {
  return window.innerWidth >= DESKTOP_MIN_WIDTH;
}

function isSidebarExpanded() {
  const sidebarRoot = document.querySelector('[data-sidebar-root]') || document.getElementById('sidebar');
  if (!sidebarRoot) return false;

  const drawer = sidebarRoot.closest('.drawer');
  const attrCollapsed = document.documentElement.getAttribute('data-sidebar-collapsed') === '1';
  const classCollapsed = !!(drawer && drawer.classList.contains('sidebar-collapsed'));
  return !(attrCollapsed || classCollapsed);
}

function isRightRailExpanded() {
  const tocColumn = document.getElementById('toc-column');
  if (!tocColumn) return false;
  if (document.body.classList.contains('toc-collapsed')) return false;

  const style = window.getComputedStyle(tocColumn);
  if (style.display === 'none' || style.visibility === 'hidden') return false;
  return tocColumn.getBoundingClientRect().width > 1;
}

function shouldRecommend() {
  if (!isDesktopViewport()) return false;
  if (!isSidebarExpanded()) return false;
  if (!isRightRailExpanded()) return false;
  return window.innerWidth < RECOMMEND_MAX_VIEWPORT_WIDTH;
}

function getPrompt() {
  return document.getElementById('layout-reco-prompt');
}

function removePrompt() {
  const prompt = getPrompt();
  if (prompt) prompt.remove();
}

function clickIfAvailable(selector, guard) {
  const el = document.querySelector(selector);
  if (!el || typeof guard === 'function' && !guard()) return;
  el.click();
}

function buildPrompt() {
  const wrap = document.createElement('div');
  wrap.id = 'layout-reco-prompt';
  wrap.className = 'layout-reco-prompt';

  const text = document.createElement('p');
  text.className = 'layout-reco-prompt__text';
  text.textContent = 'Reading width is tight at this size. For better readability, hide either the sidebar or the right rail.';

  const actions = document.createElement('div');
  actions.className = 'layout-reco-prompt__actions';

  const hideRight = document.createElement('button');
  hideRight.type = 'button';
  hideRight.className = 'layout-reco-prompt__btn';
  hideRight.textContent = 'Hide Right Rail';
  hideRight.addEventListener('click', () => {
    clickIfAvailable('[data-toc-toggle]', () => !document.body.classList.contains('toc-collapsed'));
    removePrompt();
  });

  const hideSidebar = document.createElement('button');
  hideSidebar.type = 'button';
  hideSidebar.className = 'layout-reco-prompt__btn';
  hideSidebar.textContent = 'Hide Sidebar';
  hideSidebar.addEventListener('click', () => {
    clickIfAvailable('[data-sidebar-toggle]', () => document.documentElement.getAttribute('data-sidebar-collapsed') !== '1');
    removePrompt();
  });

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'layout-reco-prompt__btn layout-reco-prompt__btn--quiet';
  dismiss.textContent = 'Dismiss';
  dismiss.addEventListener('click', () => {
    try { sessionStorage.setItem(DISMISS_KEY, '1'); } catch (_error) {}
    removePrompt();
  });

  actions.appendChild(hideRight);
  actions.appendChild(hideSidebar);
  actions.appendChild(dismiss);

  wrap.appendChild(text);
  wrap.appendChild(actions);
  return wrap;
}

function syncRecommendation() {
  const dismissed = (() => {
    try { return sessionStorage.getItem(DISMISS_KEY) === '1'; } catch (_error) { return false; }
  })();

  if (dismissed) {
    removePrompt();
    return;
  }

  if (!shouldRecommend()) {
    removePrompt();
    return;
  }

  if (getPrompt()) return;
  document.body.appendChild(buildPrompt());
}

export function initLayoutRecommendation() {
  let resizeTimer = null;
  const onResize = () => {
    window.clearTimeout(resizeTimer);
    resizeTimer = window.setTimeout(syncRecommendation, RESIZE_DEBOUNCE_MS);
  };

  window.addEventListener('resize', onResize, { passive: true });

  const observer = new MutationObserver(syncRecommendation);
  observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-sidebar-collapsed'] });

  syncRecommendation();
}
