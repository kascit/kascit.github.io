/**
 * Smart tooltip helper.
 *
 * Usage:
 * - data-tooltip-label="Label text"
 * - data-tooltip-position="top|bottom|left|right" (optional)
 * - data-tooltip-shortcut="d s, d arrowleft" (optional)
 *
 * Emits rich tooltip content so shortcut hints can include kbd tokens.
 */

import { initResponsive, isMobile, onResponsiveChange } from "../core/responsive.js";

const TOOLTIP_SELECTOR = "[data-tooltip-label], [data-tooltip-key-only='1'][data-tooltip-shortcut]";
const POSITION_CLASSES = ["tooltip-top", "tooltip-bottom", "tooltip-left", "tooltip-right"];
const DEFAULT_POSITION_CLASS = "tooltip-bottom";

let listenersBound = false;
let responsiveListenerBound = false;

function disableTooltipElement(element) {
  if (!element || !element.isConnected) return;

  element.classList.remove("tooltip");
  POSITION_CLASSES.forEach((klass) => element.classList.remove(klass));
  element.classList.add("tooltip-mobile-disabled");

  const content = element.querySelector(":scope > .tooltip-content[data-smart-tooltip='1']");
  if (content) {
    content.setAttribute("aria-hidden", "true");
  }
}

function canonicalizeToken(token) {
  const value = String(token || "").trim().toLowerCase();
  if (!value) return "";

  if (value === "control") return "ctrl";
  if (value === "cmd" || value === "command") return "meta";
  if (value === "option") return "alt";
  if (value === "esc") return "escape";
  if (value === "left") return "arrowleft";
  if (value === "right") return "arrowright";
  if (value === "up") return "arrowup";
  if (value === "down") return "arrowdown";
  if (value === "plus") return "+";

  return value;
}

function tokenLabel(token) {
  switch (canonicalizeToken(token)) {
    case "primary":
      return "Ctrl/Cmd";
    case "ctrl":
      return "Ctrl";
    case "meta":
      return "Cmd";
    case "alt":
      return "Alt";
    case "shift":
      return "Shift";
    case "escape":
      return "Esc";
    case "arrowleft":
      return "Left";
    case "arrowright":
      return "Right";
    case "arrowup":
      return "Up";
    case "arrowdown":
      return "Down";
    case " ":
      return "Space";
    default: {
      const normalized = canonicalizeToken(token);
      if (!normalized) return "";
      return normalized.length === 1 ? normalized.toUpperCase() : normalized.charAt(0).toUpperCase() + normalized.slice(1);
    }
  }
}

function resolvePositionClass(element) {
  const explicit = canonicalizeToken(element.getAttribute("data-tooltip-position"));
  if (explicit) {
    const candidate = `tooltip-${explicit}`;
    if (POSITION_CLASSES.includes(candidate)) return candidate;
  }

  const existing = POSITION_CLASSES.find((klass) => element.classList.contains(klass));
  return existing || DEFAULT_POSITION_CLASS;
}

function splitShortcutOptions(rawValue) {
  return String(rawValue || "")
    .split(",")
    .map((part) => part.trim())
    .filter(Boolean);
}

function renderShortcutOption(option) {
  const optionNode = document.createElement("span");
  optionNode.className = "tooltip-shortcut-option";

  const steps = String(option || "")
    .split(/\s+/)
    .map((step) => step.trim())
    .filter(Boolean);

  steps.forEach((step, stepIndex) => {
    if (stepIndex > 0) {
      const chordGap = document.createElement("span");
      chordGap.className = "tooltip-shortcut-step-gap";
      chordGap.textContent = " ";
      optionNode.appendChild(chordGap);
    }

    const stepNode = document.createElement("span");
    stepNode.className = "tooltip-shortcut-step";

    const tokens = step
      .split("+")
      .map((token) => canonicalizeToken(token))
      .filter(Boolean);

    tokens.forEach((token, tokenIndex) => {
      if (tokenIndex > 0) {
        const plus = document.createElement("span");
        plus.className = "tooltip-shortcut-plus";
        plus.textContent = "+";
        stepNode.appendChild(plus);
      }

      const keyNode = document.createElement("kbd");
      keyNode.className = "kbd tooltip-shortcut-key";
      keyNode.textContent = tokenLabel(token);
      stepNode.appendChild(keyNode);
    });

    optionNode.appendChild(stepNode);
  });

  return optionNode;
}

function ensureTooltipContentNode(element) {
  let content = element.querySelector(":scope > .tooltip-content[data-smart-tooltip='1']");
  if (!content) {
    content = document.createElement("span");
    content.className = "tooltip-content tooltip-content-smart";
    content.setAttribute("data-smart-tooltip", "1");
    content.setAttribute("role", "tooltip");
    element.appendChild(content);
  }
  return content;
}

function resolveShortcutSpec(element) {
  const explicit = String(element.getAttribute("data-tooltip-shortcut") || "").trim();
  if (explicit) return explicit;

  const fromKeybind = String(element.getAttribute("data-keybind") || "").trim();
  return fromKeybind;
}

function syncTooltipElement(element) {
  if (!element || !element.isConnected) return;

  const label = String(element.getAttribute("data-tooltip-label") || "").trim();
  const shortcutSpec = resolveShortcutSpec(element);
  const isShortcutOnly = element.getAttribute("data-tooltip-key-only") === "1";
  if (!label && (!isShortcutOnly || !shortcutSpec)) return;

  if (isMobile()) {
    disableTooltipElement(element);
    return;
  }

  element.classList.remove("tooltip-mobile-disabled");

  const positionClass = resolvePositionClass(element);
  element.classList.add("tooltip");
  POSITION_CLASSES.forEach((klass) => {
    if (klass !== positionClass) {
      element.classList.remove(klass);
    }
  });
  element.classList.add(positionClass);

  if (label && !element.getAttribute("aria-label")) {
    element.setAttribute("aria-label", label);
  }

  element.removeAttribute("data-tip");
  element.removeAttribute("title");

  const content = ensureTooltipContentNode(element);
  content.textContent = "";

  if (label) {
    const labelNode = document.createElement("span");
    labelNode.className = "tooltip-label";
    labelNode.textContent = label;
    content.appendChild(labelNode);
  }

  const options = splitShortcutOptions(shortcutSpec);
  if (options.length > 0) {
    const shortcutNode = document.createElement("span");
    shortcutNode.className = "tooltip-shortcut";

    options.forEach((option, index) => {
      if (index > 0) {
        const separator = document.createElement("span");
        separator.className = "tooltip-shortcut-separator";
        separator.textContent = "or";
        shortcutNode.appendChild(separator);
      }

      shortcutNode.appendChild(renderShortcutOption(option));
    });

    content.appendChild(shortcutNode);
  }
}

function syncTooltipsIn(root = document) {
  if (!root) return;

  if (root.matches && root.matches(TOOLTIP_SELECTOR)) {
    syncTooltipElement(root);
  }

  root.querySelectorAll?.(TOOLTIP_SELECTOR).forEach(syncTooltipElement);
}

function onTooltipUpdate(event) {
  const detail = event && event.detail;
  if (detail && detail.element) {
    syncTooltipElement(detail.element);
    return;
  }

  if (detail && detail.selector) {
    document.querySelectorAll(detail.selector).forEach(syncTooltipElement);
    return;
  }

  syncTooltipsIn(document);
}

export function initTooltips(root = document) {
  initResponsive();
  syncTooltipsIn(root);

  if (listenersBound) return;
  listenersBound = true;

  document.addEventListener("tooltips:update", onTooltipUpdate);

  if (!responsiveListenerBound) {
    responsiveListenerBound = true;
    onResponsiveChange(() => {
      syncTooltipsIn(document);
    });
  }
}
