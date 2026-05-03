export const SHELL_CONFIG_DEFAULTS = {
  // Design-language shell defaults
  shellPath: "/navbar/",
  favicon: true,
  enablePwa: true,
  swPath: "/sw.js",

  // Optional access policy for host apps
  requireAuth: false,
  requireAdmin: false,

  // Top navbar chrome
  showMobileMenu: true,
  showLanguage: false,
  showAppsGrid: true,
  showAccountButton: true,
  showThemeToggle: false,
};

if (typeof window !== "undefined") {
  window.SiteNavConfig = {
    ...SHELL_CONFIG_DEFAULTS,
    ...(window.SiteNavConfig || {}),
  };
}
