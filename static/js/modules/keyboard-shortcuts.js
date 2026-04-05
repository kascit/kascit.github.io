/**
 * Global keyboard shortcut dispatcher.
 *
 * Declarative bindings are defined on elements via:
 * - data-keybind="primary+shift+s"
 * - data-keybind-action="click" (default)
 */

const DEFAULT_ACTION = "click";
const SUPPORTED_ACTIONS = new Set(["click"]);
const CHORD_TIMEOUT_MS = 1200;
const ANCHOR_SESSION_KEY = "kbd-anchor-state-v1";
const ANCHOR_SESSION_TTL_MS = 6000;
const HOME_SELECTORS = [
  ".site-logo-link[href='/']",
  "header a[href='/']",
  "a[rel='home']",
  "a[data-home]",
  ".prev-nav-item a[href='/']",
];
const PREV_SELECTORS = [".prev-nav-item a", "a[rel='prev']", "a[data-prev]"];
const NEXT_SELECTORS = [".next-nav-item a", "a[rel='next']", "a[data-next]"];

let shortcutsBound = false;
let shortcutEntries = [];
let pendingChords = [];
let chordTimer = null;
let activeAnchorKey = "";
let activeAnchorSessionExpiry = 0;
const heldKeys = new Set();

function readSessionStorage(key) {
  try {
    return window.sessionStorage.getItem(key);
  } catch (_error) {
    return null;
  }
}

function writeSessionStorage(key, value) {
  try {
    window.sessionStorage.setItem(key, value);
  } catch (_error) {
    // Ignore storage write failures.
  }
}

function removeSessionStorage(key) {
  try {
    window.sessionStorage.removeItem(key);
  } catch (_error) {
    // Ignore storage remove failures.
  }
}

function persistAnchorSession(anchorKey) {
  if (!anchorKey) return;

  const payload = {
    key: anchorKey,
    expiresAt: Date.now() + ANCHOR_SESSION_TTL_MS,
  };

  writeSessionStorage(ANCHOR_SESSION_KEY, JSON.stringify(payload));
}

function readAnchorSession() {
  const raw = readSessionStorage(ANCHOR_SESSION_KEY);
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);
    const key = canonicalizeToken(parsed?.key || "");
    const expiresAt = Number(parsed?.expiresAt || 0);

    if (!key || !Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
      removeSessionStorage(ANCHOR_SESSION_KEY);
      return null;
    }

    return { key, expiresAt };
  } catch (_error) {
    removeSessionStorage(ANCHOR_SESSION_KEY);
    return null;
  }
}

function canonicalizeToken(token) {
  const value = String(token || "").trim().toLowerCase();

  if (value === "control") return "ctrl";
  if (value === "cmd" || value === "command") return "meta";
  if (value === "option") return "alt";
  if (value === "esc") return "escape";
  if (value === "space") return " ";
  if (value === "left") return "arrowleft";
  if (value === "right") return "arrowright";
  if (value === "up") return "arrowup";
  if (value === "down") return "arrowdown";
  if (value === "plus") return "+";

  return value;
}

function normalizeEventKey(event) {
  const key = canonicalizeToken(event.key);
  if (!key) return "";
  return key.length === 1 ? key : key;
}

function parseSingleStepSpec(spec) {
  const source = String(spec || "").trim();
  if (!source) return null;

  const parts = source.split("+").map((part) => canonicalizeToken(part)).filter(Boolean);
  if (parts.length === 0) return null;

  const descriptor = {
    key: "",
    primary: false,
    ctrl: false,
    meta: false,
    alt: false,
    shift: false,
  };

  for (const part of parts) {
    if (part === "primary") {
      descriptor.primary = true;
      continue;
    }
    if (part === "ctrl") {
      descriptor.ctrl = true;
      continue;
    }
    if (part === "meta") {
      descriptor.meta = true;
      continue;
    }
    if (part === "alt") {
      descriptor.alt = true;
      continue;
    }
    if (part === "shift") {
      descriptor.shift = true;
      continue;
    }

    descriptor.key = part;
  }

  if (!descriptor.key) return null;
  if (descriptor.primary && (descriptor.ctrl || descriptor.meta)) return null;
  return descriptor;
}

function parseKeybindSpec(spec) {
  const source = String(spec || "").trim();
  if (!source) return null;

  const rawSteps = source.split(/\s+/).map((step) => step.trim()).filter(Boolean);
  if (rawSteps.length === 0) return null;

  const steps = rawSteps.map((step) => parseSingleStepSpec(step)).filter(Boolean);
  if (steps.length !== rawSteps.length) return null;

  return { steps };
}

function parseKeybindList(spec) {
  return String(spec || "")
    .split(",")
    .map((item) => parseKeybindSpec(item))
    .filter(Boolean);
}

function isEditableTarget(target) {
  if (!target) return false;
  if (target.isContentEditable) return true;

  const tagName = target.tagName ? target.tagName.toLowerCase() : "";
  if (tagName === "input" || tagName === "textarea" || tagName === "select") return true;

  return !!target.closest("input, textarea, select, [contenteditable=''], [contenteditable='true']");
}

function isSafePlainShortcutTarget(target) {
  if (!target) return true;
  return !isEditableTarget(target);
}

function isPlainStep(step) {
  return !step.primary && !step.ctrl && !step.meta && !step.alt && !step.shift;
}

function isStepAllowedForTarget(event, step) {
  if (!isPlainStep(step)) return true;
  return isSafePlainShortcutTarget(event.target);
}

function isElementActionable(element) {
  if (!element || !element.isConnected) return false;
  if (element.disabled) return false;
  if (element.getAttribute("aria-disabled") === "true") return false;

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0 || rect.height <= 0) return false;

  const styles = window.getComputedStyle(element);
  if (styles.visibility === "hidden" || styles.display === "none") return false;

  return true;
}

function findFirstActionableBySelectors(selectors) {
  for (const selector of selectors) {
    const elements = document.querySelectorAll(selector);
    for (const element of elements) {
      if (isElementActionable(element)) {
        return element;
      }
    }
  }

  return null;
}

function executeSelectorClick(selectors) {
  const element = findFirstActionableBySelectors(selectors);
  if (!element) return false;
  element.click();
  return true;
}

function isElementLikelySameTabInternalLink(element) {
  if (!element || !element.isConnected) return false;
  if (String(element.tagName || "").toLowerCase() !== "a") return false;

  const href = String(element.getAttribute("href") || "").trim();
  if (!href || href.startsWith("#")) return false;

  const target = String(element.getAttribute("target") || "").trim().toLowerCase();
  if (target && target !== "_self") return false;

  try {
    const nextUrl = new URL(href, window.location.origin);
    return nextUrl.origin === window.location.origin;
  } catch (_error) {
    return false;
  }
}

function buildBuiltinShortcutEntries() {
  const specs = [
    { keybind: "d h", selectors: HOME_SELECTORS },
    { keybind: "d arrowleft", selectors: PREV_SELECTORS },
    { keybind: "d arrowright", selectors: NEXT_SELECTORS },
  ];

  return specs
    .map((item) => {
      const descriptor = parseKeybindSpec(item.keybind);
      if (!descriptor) return null;

      return {
        descriptors: [descriptor],
        persistAnchorAcrossNavigation: true,
        execute: () => executeSelectorClick(item.selectors),
      };
    })
    .filter(Boolean);
}

function matchesDescriptor(event, descriptor) {
  const eventKey = normalizeEventKey(event);
  if (!eventKey || eventKey !== descriptor.key) return false;

  const expectsPrimary = descriptor.primary;
  const expectsCtrl = descriptor.ctrl;
  const expectsMeta = descriptor.meta;
  const expectsAlt = descriptor.alt;
  const expectsShift = descriptor.shift;

  if (expectsPrimary) {
    if (!(event.ctrlKey || event.metaKey)) return false;
  } else {
    if (event.ctrlKey !== expectsCtrl) return false;
    if (event.metaKey !== expectsMeta) return false;
  }

  if (event.altKey !== expectsAlt) return false;
  if (event.shiftKey !== expectsShift) return false;

  return true;
}

function clearPendingChord() {
  pendingChords = [];
  activeAnchorKey = "";
  activeAnchorSessionExpiry = 0;
  if (chordTimer) {
    window.clearTimeout(chordTimer);
    chordTimer = null;
  }
}

function armChordTimeout() {
  if (activeAnchorKey && heldKeys.has(activeAnchorKey)) {
    return;
  }

  const now = Date.now();
  if (activeAnchorSessionExpiry > now) {
    if (chordTimer) {
      window.clearTimeout(chordTimer);
    }
    chordTimer = window.setTimeout(() => {
      clearPendingChord();
    }, activeAnchorSessionExpiry - now);
    return;
  }

  if (chordTimer) {
    window.clearTimeout(chordTimer);
  }
  chordTimer = window.setTimeout(() => {
    clearPendingChord();
  }, CHORD_TIMEOUT_MS);
}

function beginChordCandidatesWithAnchor(candidates, anchorKey, anchorSessionExpiry = 0) {
  pendingChords = candidates;
  activeAnchorKey = anchorKey || "";
  activeAnchorSessionExpiry = Number(anchorSessionExpiry) > Date.now() ? Number(anchorSessionExpiry) : 0;
  armChordTimeout();
}

function getAnchorKeyForDescriptor(descriptor) {
  const firstStep = descriptor?.steps?.[0];
  if (!firstStep || !isPlainStep(firstStep)) return "";
  return firstStep.key || "";
}

function resolveAnchorKeyFromCandidates(candidates) {
  let anchorKey = "";

  for (const candidate of candidates) {
    const candidateAnchor = getAnchorKeyForDescriptor(candidate.descriptor);
    if (!candidateAnchor) return "";
    if (anchorKey && anchorKey !== candidateAnchor) return "";
    anchorKey = candidateAnchor;
  }

  return anchorKey;
}

function buildAnchorCandidates(anchorKey) {
  if (!anchorKey) return [];

  const candidates = [];

  for (const entry of shortcutEntries) {
    for (const descriptor of entry.descriptors) {
      if (descriptor.steps.length <= 1) continue;

      const descriptorAnchor = getAnchorKeyForDescriptor(descriptor);
      if (!descriptorAnchor || descriptorAnchor !== anchorKey) continue;

      candidates.push({
        entry,
        descriptor,
        stepIndex: 1,
      });
    }
  }

  return candidates;
}

function handlePendingChord(event) {
  if (pendingChords.length === 0) return false;

  let matched = false;
  let executed = false;
  const nextCandidates = [];

  for (const candidate of pendingChords) {
    const expectedStep = candidate.descriptor.steps[candidate.stepIndex];
    if (!expectedStep) continue;
    if (!isStepAllowedForTarget(event, expectedStep)) continue;
    if (!matchesDescriptor(event, expectedStep)) continue;

    matched = true;

    const isFinalStep = candidate.stepIndex >= candidate.descriptor.steps.length - 1;
    if (isFinalStep) {
      if (!executed) {
        executed = runAction(candidate.entry);
      }
      continue;
    }

    nextCandidates.push({
      entry: candidate.entry,
      descriptor: candidate.descriptor,
      stepIndex: candidate.stepIndex + 1,
    });
  }

  if (!matched) {
    if (activeAnchorKey && heldKeys.has(activeAnchorKey)) {
      return false;
    }

    clearPendingChord();
    return false;
  }

  event.preventDefault();

  if (executed) {
    if (activeAnchorKey && heldKeys.has(activeAnchorKey)) {
      const anchorCandidates = buildAnchorCandidates(activeAnchorKey);
      if (anchorCandidates.length > 0) {
        beginChordCandidatesWithAnchor(anchorCandidates, activeAnchorKey);
        return true;
      }
    }

    clearPendingChord();
    return true;
  }

  if (nextCandidates.length > 0) {
    pendingChords = nextCandidates;
    armChordTimeout();
    return true;
  }

  clearPendingChord();
  return true;
}

function collectShortcutEntries() {
  shortcutEntries = buildBuiltinShortcutEntries();

  document.querySelectorAll("[data-keybind]").forEach((element) => {
    const descriptors = parseKeybindList(element.getAttribute("data-keybind"));
    if (descriptors.length === 0) return;

    const action = String(element.getAttribute("data-keybind-action") || DEFAULT_ACTION).trim().toLowerCase();
    if (!SUPPORTED_ACTIONS.has(action)) return;

    shortcutEntries.push({
      descriptors,
      persistAnchorAcrossNavigation: isElementLikelySameTabInternalLink(element),
      execute() {
        if (!isElementActionable(element)) return false;

        if (action === "click") {
          element.click();
          return true;
        }

        return false;
      },
    });
  });
}

function runAction(entry) {
  if (!entry || typeof entry.execute !== "function") return false;

  if (activeAnchorKey && entry.persistAnchorAcrossNavigation) {
    persistAnchorSession(activeAnchorKey);
  }

  return entry.execute();
}

function onKeydown(event) {
  const eventKey = normalizeEventKey(event);
  if (eventKey) {
    heldKeys.add(eventKey);
  }

  if (event.defaultPrevented) return;
  if (isEditableTarget(event.target)) return;
  if (event.repeat) return;

  if (shortcutEntries.length === 0) {
    collectShortcutEntries();
  }

  if (pendingChords.length === 0 && heldKeys.size > 0) {
    for (const heldKey of heldKeys) {
      const anchorCandidates = buildAnchorCandidates(heldKey);
      if (anchorCandidates.length === 0) continue;

      beginChordCandidatesWithAnchor(anchorCandidates, heldKey);
      if (handlePendingChord(event)) {
        return;
      }
      break;
    }
  }

  if (handlePendingChord(event)) {
    return;
  }

  const singleStepMatches = [];
  const chordCandidates = [];

  for (const entry of shortcutEntries) {
    for (const descriptor of entry.descriptors) {
      const firstStep = descriptor.steps[0];
      if (!firstStep) continue;
      if (!isStepAllowedForTarget(event, firstStep)) continue;
      if (!matchesDescriptor(event, firstStep)) continue;

      if (descriptor.steps.length > 1) {
        chordCandidates.push({
          entry,
          descriptor,
          stepIndex: 1,
        });
        continue;
      }

      singleStepMatches.push(entry);
    }
  }

  for (const entry of singleStepMatches) {
    if (!runAction(entry)) continue;
    event.preventDefault();
    return;
  }

  if (chordCandidates.length > 0) {
    event.preventDefault();
    const anchorKey = resolveAnchorKeyFromCandidates(chordCandidates);
    beginChordCandidatesWithAnchor(chordCandidates, anchorKey);
    return;
  }

  if (pendingChords.length > 0) {
    clearPendingChord();
  }
}

function onKeyup(event) {
  const eventKey = normalizeEventKey(event);
  if (!eventKey) return;

  heldKeys.delete(eventKey);

  if (activeAnchorKey && eventKey === activeAnchorKey) {
    clearPendingChord();
  }
}

function onWindowBlur() {
  heldKeys.clear();
  clearPendingChord();
}

function onVisibilityChange() {
  if (document.visibilityState === "hidden") {
    onWindowBlur();
  }
}

export function initKeyboardShortcuts() {
  collectShortcutEntries();
  clearPendingChord();

  const persistedAnchor = readAnchorSession();
  if (persistedAnchor) {
    const persistedCandidates = buildAnchorCandidates(persistedAnchor.key);
    if (persistedCandidates.length > 0) {
      beginChordCandidatesWithAnchor(persistedCandidates, persistedAnchor.key, persistedAnchor.expiresAt);
    }
  }

  if (shortcutsBound) return;
  shortcutsBound = true;

  document.addEventListener("keydown", onKeydown);
  document.addEventListener("keyup", onKeyup);
  document.addEventListener("visibilitychange", onVisibilityChange);
  window.addEventListener("blur", onWindowBlur);
}
