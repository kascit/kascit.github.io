/**
 * Centralized Responsive Behavior Management
 */

const BREAKPOINTS = { MOBILE: 0, SM: 640, MD: 768, LG: 1024, XL: 1280, XXL: 1536 };

const state = {
  isDesktop: false,
  isMobile: false,
  mediaQueries: {},
  listeners: new Set(),
};

function updateResponsiveState() {
  const wasDesktop = state.isDesktop;
  state.isDesktop = state.mediaQueries.hoverCapable?.matches && state.mediaQueries.finePointer?.matches;
  state.isMobile = !state.isDesktop;
  if (wasDesktop !== state.isDesktop) {
    notifyListeners();
  }
}

function notifyListeners() {
  state.listeners.forEach((cb) => {
    try {
      cb({ isDesktop: state.isDesktop, isMobile: state.isMobile, isLargeScreen: isLargeScreen(), isTouchDevice: isTouchDevice() });
    } catch (e) { console.error(e); }
  });
}

export function initResponsive() {
  if (typeof window.matchMedia !== 'function') return;
  state.mediaQueries.hoverCapable = window.matchMedia("(hover: hover)");
  state.mediaQueries.finePointer = window.matchMedia("(pointer: fine)");
  state.mediaQueries.largeScreen = window.matchMedia(`(min-width: ${BREAKPOINTS.LG}px)`);
  state.mediaQueries.touchDevice = window.matchMedia("(pointer: coarse)");

  updateResponsiveState();

  Object.values(state.mediaQueries).forEach((mq) => {
    if (mq.addListener) mq.addListener(updateResponsiveState);
    else if (mq.addEventListener) mq.addEventListener('change', updateResponsiveState);
  });
}

export const isDesktop = () => state.isDesktop;
export const isMobile = () => state.isMobile;
export const isLargeScreen = () => state.mediaQueries.largeScreen?.matches || false;
export const isTouchDevice = () => state.mediaQueries.touchDevice?.matches || false;

export function onResponsiveChange(callback) {
  state.listeners.add(callback);
  return () => state.listeners.delete(callback);
}
