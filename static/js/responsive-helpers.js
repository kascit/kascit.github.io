/**
 * Centralized responsive behavior management
 * Provides consistent mobile/desktop detection and monitoring
 * across the entire site for navbar, TOC, keyboard hints, buttons, etc.
 */

(function () {
  "use strict";

  /**
   * BREAKPOINT CONSTANTS
   * Matches Tailwind CSS breakpoints for consistency
   */
  const BREAKPOINTS = {
    MOBILE: 0,
    SM: 640,
    MD: 768,
    LG: 1024,
    XL: 1280,
    XXL: 1536,
  };

  /**
   * Responsive state tracking
   */
  const state = {
    isDesktop: false,
    isMobile: false,
    mediaQueries: {},
    listeners: new Set(),
  };

  /**
   * Initialize media queries and detect initial state
   */
  function initializeMediaQueries() {
    // Primary responsive checks
    state.mediaQueries.hoverCapable = window.matchMedia("(hover: hover)");
    state.mediaQueries.finePointer = window.matchMedia("(pointer: fine)");
    state.mediaQueries.largeScreen = window.matchMedia(
      `(min-width: ${BREAKPOINTS.LG}px)`
    );
    state.mediaQueries.touchDevice = window.matchMedia("(pointer: coarse)");

    updateResponsiveState();

    // Listen for changes
    Object.values(state.mediaQueries).forEach((mq) => {
      mq.addListener(updateResponsiveState);
    });
  }

  /**
   * Update responsive state based on current media queries
   */
  function updateResponsiveState() {
    const wasDesktop = state.isDesktop;

    // Desktop: hover capable AND fine pointer (mouse)
    state.isDesktop =
      state.mediaQueries.hoverCapable.matches &&
      state.mediaQueries.finePointer.matches;

    // Mobile: everything else
    state.isMobile = !state.isDesktop;

    // Notify listeners if state changed
    if (wasDesktop !== state.isDesktop) {
      notifyListeners();
    }
  }

  /**
   * RESPONSIVE BEHAVIOR API
   */

  /**
   * Check if device is desktop
   */
  function isDesktop() {
    return state.isDesktop;
  }

  /**
   * Check if device is mobile
   */
  function isMobile() {
    return state.isMobile;
  }

  /**
   * Check if screen is large (lg breakpoint and up)
   */
  function isLargeScreen() {
    return state.mediaQueries.largeScreen.matches;
  }

  /**
   * Check if device is touch-enabled
   */
  function isTouchDevice() {
    return state.mediaQueries.touchDevice.matches;
  }

  /**
   * Register callback for responsive state changes
   */
  function onResponsiveChange(callback) {
    state.listeners.add(callback);
    return () => state.listeners.delete(callback);
  }

  /**
   * Notify all listeners of state change
   */
  function notifyListeners() {
    state.listeners.forEach((callback) => {
      try {
        callback({
          isDesktop: state.isDesktop,
          isMobile: state.isMobile,
          isLargeScreen: isLargeScreen(),
          isTouchDevice: isTouchDevice(),
        });
      } catch (e) {
        console.error("Error in responsive listener:", e);
      }
    });
  }

  /**
   * HELPER FUNCTIONS FOR COMMON PATTERNS
   */

  /**
   * Show/hide element based on responsive condition
   * Usage: toggleDisplay(element, 'mobile') // shows on mobile, hides on desktop
   */
  function toggleDisplay(element, mode) {
    if (!element) return;

    const shouldShow =
      (mode === "mobile" && state.isMobile) ||
      (mode === "desktop" && state.isDesktop);

    element.style.display = shouldShow ? "" : "none";
  }

  /**
   * Add/remove class based on responsive condition
   * Usage: toggleClass(element, 'hidden', 'desktop') // hidden on desktop
   */
  function toggleClass(element, className, mode) {
    if (!element) return;

    const shouldHave =
      (mode === "mobile" && state.isMobile) ||
      (mode === "desktop" && state.isDesktop);

    if (shouldHave) {
      element.classList.add(className);
    } else {
      element.classList.remove(className);
    }
  }

  /**
   * Execute callback only on specific devices
   * Usage: onDevice('mobile', () => { ... }) // runs on mobile only
   */
  function onDevice(mode, callback) {
    if (
      (mode === "mobile" && state.isMobile) ||
      (mode === "desktop" && state.isDesktop)
    ) {
      callback();
    }

    // Listen for changes
    return onResponsiveChange((responsive) => {
      const shouldRun =
        (mode === "mobile" && responsive.isMobile) ||
        (mode === "desktop" && responsive.isDesktop);

      if (shouldRun) {
        callback();
      }
    });
  }

  /**
   * Get current device type string
   */
  function getDeviceType() {
    if (state.isMobile) return "mobile";
    if (state.isDesktop) return "desktop";
    return "unknown";
  }

  /**
   * INITIALIZATION
   */

  // Initialize when DOM is ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializeMediaQueries);
  } else {
    initializeMediaQueries();
  }

  /**
   * EXPORT TO GLOBAL SCOPE
   */
  window.ResponsiveHelpers = {
    isDesktop,
    isMobile,
    isLargeScreen,
    isTouchDevice,
    onResponsiveChange,
    toggleDisplay,
    toggleClass,
    onDevice,
    getDeviceType,
    BREAKPOINTS,
  };

  // Also expose state for debugging
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    window.__ResponsiveState = () => state;
  }
})();
