/**
 * Cross-page blog playlist helper.
 * Persisted in localStorage so users can collect posts from different taxonomies.
 */

import { isDesktop, onResponsiveChange } from "./responsive.js";

const PLAYLIST_STORAGE_KEY = "site-playlist-v1";
const PLAYLIST_EXIT_PATH = "/blog";
const TITLE_MAX_LENGTH = 180;

function normalizeTitle(raw) {
	const text = String(raw || "").replace(/\s+/g, " ").trim();
	if (!text) return "Untitled";
	return text.slice(0, TITLE_MAX_LENGTH);
}

function normalizeInternalHref(raw) {
	if (typeof raw !== "string" || raw.trim() === "") return "/";
	const href = raw.trim();
	if (href[0] === "#") return href;

	try {
		const parsed = new URL(href, window.location.origin);
		if (parsed.origin !== window.location.origin) return "/";

		let path = parsed.pathname || "/";
		if (path.length > 1) {
			path = path.replace(/\/+$/, "");
		}

		return `${path || "/"}${parsed.search || ""}${parsed.hash || ""}`;
	} catch (_error) {
		return "/";
	}
}

function createIcon(className) {
	const icon = document.createElement("i");
	icon.className = className;
	icon.setAttribute("aria-hidden", "true");
	return icon;
}

function setButtonIcon(button, iconClass) {
	if (!button) return;
	button.textContent = "";
	button.appendChild(createIcon(iconClass));
}

function makeSvgFromMarkup(markup) {
	const wrapper = document.createElement("span");
	wrapper.innerHTML = markup;
	return wrapper.firstElementChild;
}

function toBase64Url(value) {
	const utf8 = encodeURIComponent(value).replace(/%([0-9A-F]{2})/g, (_m, p1) =>
		String.fromCharCode(parseInt(p1, 16))
	);
	return btoa(utf8).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function fromBase64Url(value) {
	const normalized = String(value || "").replace(/-/g, "+").replace(/_/g, "/");
	const padded = normalized + "===".slice((normalized.length + 3) % 4);
	const binary = atob(padded);
	const escaped = Array.from(binary)
		.map((char) => `%${char.charCodeAt(0).toString(16).padStart(2, "0")}`)
		.join("");
	return decodeURIComponent(escaped);
}

function encodePlaylist(items) {
	const compact = items.map((item) => [item.url, item.title]);
	return toBase64Url(JSON.stringify(compact));
}

function decodePlaylist(encoded) {
	try {
		const raw = fromBase64Url(encoded);
		const parsed = JSON.parse(raw);
		if (!Array.isArray(parsed)) return [];
		return parsed
			.map((entry) => ({
				url: normalizePath(Array.isArray(entry) ? entry[0] : entry?.url),
				title: normalizeTitle(Array.isArray(entry) ? entry[1] : entry?.title),
			}))
			.filter((item) => item.url);
	} catch (_error) {
		return [];
	}
}

function normalizePath(raw) {
	if (!raw) return "/";
	try {
		const parsed = new URL(raw, window.location.origin);
		let path = parsed.pathname || "/";
		if (path.length > 1) {
			path = path.replace(/\/+$/, "");
		}
		return path || "/";
	} catch (_error) {
		return "/";
	}
}

function loadPlaylist() {
	try {
		const raw = localStorage.getItem(PLAYLIST_STORAGE_KEY);
		const parsed = raw ? JSON.parse(raw) : [];
		if (!Array.isArray(parsed)) return [];

		return parsed
			.map((item) => ({
				url: normalizePath(item.url),
				title: normalizeTitle(item.title || item.url),
			}))
			.filter((item) => item.url);
	} catch (_error) {
		return [];
	}
}

function savePlaylist(items) {
	try {
		localStorage.setItem(PLAYLIST_STORAGE_KEY, JSON.stringify(items));
	} catch (_error) {
		// ignore storage failure
	}
}

function buildPlaylistUrl(path, playlist, exitPath) {
	const encoded = encodePlaylist(playlist);
	const params = new URLSearchParams();
	params.set("pl", encoded);
	params.set("plx", normalizePath(exitPath || PLAYLIST_EXIT_PATH));
	return `${path}?${params.toString()}`;
}

function setNavSlot(slotSelector, direction, href, subtitle, title, onClick) {
	const slot = document.querySelector(slotSelector);
	if (!slot) return;
	const safeDirection = direction === "prev" ? "prev" : "next";
	const safeHref = normalizeInternalHref(href);
	const safeSubtitle = normalizeTitle(subtitle);
	const safeTitle = normalizeTitle(title);

	const arrowLeft = '<svg class="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"></path></svg>';
	const arrowRight = '<svg class="w-5 h-5 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path></svg>';

	slot.textContent = "";

	const anchor = document.createElement("a");
	anchor.className = `nav-button nav-button-${safeDirection} group`;
	anchor.setAttribute("href", safeHref);

	const content = document.createElement("div");
	content.className = "nav-button-content";

	const directionWrap = document.createElement("div");
	directionWrap.className = "nav-button-direction";

	const subtitleSpan = document.createElement("span");
	subtitleSpan.className = "nav-button-label";
	subtitleSpan.textContent = safeSubtitle;

	if (safeDirection === "prev") {
		const leftIcon = makeSvgFromMarkup(arrowLeft);
		if (leftIcon) directionWrap.appendChild(leftIcon);
		directionWrap.appendChild(subtitleSpan);
	} else {
		directionWrap.appendChild(subtitleSpan);
		const rightIcon = makeSvgFromMarkup(arrowRight);
		if (rightIcon) directionWrap.appendChild(rightIcon);
	}

	const titleWrap = document.createElement("div");
	titleWrap.className = "nav-button-title";
	titleWrap.textContent = safeTitle;

	content.appendChild(directionWrap);
	content.appendChild(titleWrap);
	anchor.appendChild(content);
	slot.appendChild(anchor);

	if (typeof onClick === "function") {
		anchor.addEventListener("click", onClick);
	}
}

function tryOverrideBlogNav(playlist) {
	if (!Array.isArray(playlist) || playlist.length === 0) return;

	const navRoot = document.querySelector("main nav.mt-12");
	if (!navRoot) return;

	const currentPath = normalizePath(window.location.pathname);
	const currentIndex = playlist.findIndex((item) => item.url === currentPath);
	if (currentIndex < 0) return;

	const params = new URLSearchParams(window.location.search);
	const queryHasPlaylist = params.has("pl");
	if (!queryHasPlaylist) return;

	const exitPath = PLAYLIST_EXIT_PATH;
	const prevItem = currentIndex > 0 ? playlist[currentIndex - 1] : null;
	const nextItem = currentIndex < playlist.length - 1 ? playlist[currentIndex + 1] : null;

	if (prevItem) {
		setNavSlot(
			".prev-nav-item",
			"prev",
			buildPlaylistUrl(prevItem.url, playlist, exitPath),
			"Playlist",
			prevItem.title
		);
	} else {
		setNavSlot(
			".prev-nav-item",
			"prev",
			exitPath,
			"Playlist",
			"Exit Playlist"
		);
	}

	if (nextItem) {
		setNavSlot(
			".next-nav-item",
			"next",
			buildPlaylistUrl(nextItem.url, playlist, exitPath),
			"Playlist",
			nextItem.title
		);
	} else {
		setNavSlot(
			".next-nav-item",
			"next",
			exitPath,
			"Playlist",
			"Exit Playlist"
		);
	}
}

export function initTaxonomyPlaylist() {
	const root = document.querySelector("[data-taxonomy-playlist]");
	const postNodes = Array.from(document.querySelectorAll("[data-taxonomy-playlist-post]"));
	const params = new URLSearchParams(window.location.search);
	const queryPlaylist = params.get("pl");

	let playlist = queryPlaylist ? decodePlaylist(queryPlaylist) : loadPlaylist();
	if (queryPlaylist && playlist.length > 0) {
		savePlaylist(playlist);
	}

	tryOverrideBlogNav(playlist);

	if (!root || postNodes.length === 0) return;

	const listNode = root.querySelector("[data-taxonomy-playlist-list]");
	const emptyNode = root.querySelector("[data-taxonomy-playlist-empty]");
	const metaNode = root.querySelector("[data-taxonomy-playlist-meta]");
	const addPageBtn = root.querySelector("[data-taxonomy-playlist-add-page]");
	const clearBtn = root.querySelector("[data-taxonomy-playlist-clear]");
	const shareBtn = root.querySelector("[data-taxonomy-playlist-share]");
	const openFirstBtn = root.querySelector("[data-taxonomy-playlist-open-first]");

	if (!listNode || !emptyNode || !metaNode || !addPageBtn || !clearBtn || !shareBtn || !openFirstBtn) {
		return;
	}

	const exitPath = PLAYLIST_EXIT_PATH;

	function hasInPlaylist(path) {
		return playlist.some((item) => item.url === path);
	}

	function syncPostState() {
		postNodes.forEach((node) => {
			const path = normalizePath(node.getAttribute("data-post-url"));
			const selected = hasInPlaylist(path);
			node.classList.toggle("is-selected", selected);

			const btn = node.querySelector("[data-taxonomy-playlist-toggle]");
			if (!btn) return;

			btn.setAttribute("aria-pressed", selected ? "true" : "false");
			setButtonIcon(btn, selected ? "fa-solid fa-check" : "fa-solid fa-plus");
			btn.setAttribute("title", selected ? "Remove from playlist" : "Add to playlist");
		});
	}

	function renderPlaylistList() {
		listNode.textContent = "";

		playlist.forEach((item, index) => {
			const safeUrl = normalizeInternalHref(item.url);
			const safeTitle = normalizeTitle(item.title);

			const row = document.createElement("div");
			row.className = "taxonomy-playlist-row";
			row.setAttribute("data-playlist-url", safeUrl);

			const handle = document.createElement("button");
			handle.type = "button";
			handle.className = "taxonomy-playlist-handle";
			handle.setAttribute("data-playlist-handle", "");
			handle.setAttribute("draggable", "true");
			handle.setAttribute("aria-label", `Drag to reorder ${safeTitle}`);
			handle.setAttribute("title", "Drag to reorder");
			handle.appendChild(createIcon("fa-solid fa-grip-vertical"));

			const indexBadge = document.createElement("span");
			indexBadge.className = "taxonomy-playlist-index";
			indexBadge.textContent = String(index + 1);
			handle.appendChild(indexBadge);

			const link = document.createElement("a");
			link.className = "taxonomy-playlist-link";
			link.setAttribute("href", safeUrl);
			link.setAttribute("title", safeTitle);
			link.textContent = safeTitle;

			const removeBtn = document.createElement("button");
			removeBtn.type = "button";
			removeBtn.className = "taxonomy-playlist-row-btn";
			removeBtn.setAttribute("data-playlist-action", "remove");
			removeBtn.setAttribute("data-playlist-url", safeUrl);
			removeBtn.setAttribute("aria-label", "Remove");
			removeBtn.appendChild(createIcon("fa-solid fa-xmark"));

			row.appendChild(handle);
			row.appendChild(link);
			row.appendChild(removeBtn);

			listNode.appendChild(row);
		});

		const count = playlist.length;
		const hasItems = count > 0;
		emptyNode.hidden = hasItems;
		metaNode.textContent = `${count} in playlist`;
		shareBtn.disabled = !hasItems;
		openFirstBtn.disabled = !hasItems;
	}

	function persistAndRender() {
		savePlaylist(playlist);
		renderPlaylistList();
		syncPostState();
	}

	function addPost(path, title) {
		if (!path || hasInPlaylist(path)) return;
		playlist.push({ url: normalizePath(path), title: normalizeTitle(title || path) });
	}

	function removePost(path) {
		playlist = playlist.filter((item) => item.url !== path);
	}

	postNodes.forEach((node) => {
		const toggleBtn = node.querySelector("[data-taxonomy-playlist-toggle]");
		if (!toggleBtn) return;

		toggleBtn.addEventListener("click", (event) => {
			event.preventDefault();
			event.stopPropagation();

			const path = normalizePath(node.getAttribute("data-post-url"));
			const title = node.getAttribute("data-post-title") || path;
			if (!path) return;

			if (hasInPlaylist(path)) {
				removePost(path);
			} else {
				addPost(path, title);
			}

			persistAndRender();
		});
	});

	function applyPickerVisibility() {
		const allow = isDesktop();
		postNodes.forEach((node) => {
			const toggleBtn = node.querySelector("[data-taxonomy-playlist-toggle]");
			if (!toggleBtn) return;

			toggleBtn.hidden = !allow;
			toggleBtn.disabled = !allow;
			node.classList.toggle("is-picker-enabled", allow);
		});
	}

	applyPickerVisibility();
	onResponsiveChange(applyPickerVisibility);

	listNode.addEventListener("click", (event) => {
		const actionBtn = event.target.closest("[data-playlist-action]");
		if (!actionBtn) return;

		const path = normalizePath(actionBtn.getAttribute("data-playlist-url"));
		const action = actionBtn.getAttribute("data-playlist-action");
		const index = playlist.findIndex((item) => item.url === path);
		if (index < 0) return;

		if (action !== "remove") return;
		playlist.splice(index, 1);

		persistAndRender();
	});

	let draggingUrl = "";

	function clearDragState() {
		listNode.querySelectorAll(".taxonomy-playlist-row").forEach((node) => {
			node.classList.remove("is-dragging", "is-drag-over");
		});
	}

	function movePlaylistItem(fromIndex, toIndex) {
		if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0) return;
		if (fromIndex >= playlist.length || toIndex > playlist.length) return;

		const [moved] = playlist.splice(fromIndex, 1);
		playlist.splice(toIndex, 0, moved);
	}

	listNode.addEventListener("dragstart", (event) => {
		const handle = event.target.closest("[data-playlist-handle]");
		if (!handle) return;

		const row = handle.closest(".taxonomy-playlist-row");
		if (!row) return;

		draggingUrl = normalizePath(row.getAttribute("data-playlist-url"));
		row.classList.add("is-dragging");
		if (event.dataTransfer) {
			event.dataTransfer.effectAllowed = "move";
			event.dataTransfer.setData("text/plain", draggingUrl);
		}
	});

	listNode.addEventListener("dragover", (event) => {
		if (!draggingUrl) return;

		const row = event.target.closest(".taxonomy-playlist-row");
		if (!row) return;

		event.preventDefault();
		clearDragState();
		row.classList.add("is-drag-over");
	});

	listNode.addEventListener("drop", (event) => {
		if (!draggingUrl) return;

		const targetRow = event.target.closest(".taxonomy-playlist-row");
		if (!targetRow) return;

		event.preventDefault();

		const targetUrl = normalizePath(targetRow.getAttribute("data-playlist-url"));
		const fromIndex = playlist.findIndex((item) => item.url === draggingUrl);
		let toIndex = playlist.findIndex((item) => item.url === targetUrl);
		if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) {
			clearDragState();
			return;
		}

		const targetRect = targetRow.getBoundingClientRect();
		const afterTarget = event.clientY > targetRect.top + targetRect.height / 2;
		if (afterTarget) {
			toIndex += 1;
		}
		if (fromIndex < toIndex) {
			toIndex -= 1;
		}

		movePlaylistItem(fromIndex, toIndex);
		draggingUrl = "";
		clearDragState();
		persistAndRender();
	});

	listNode.addEventListener("dragend", () => {
		draggingUrl = "";
		clearDragState();
	});

	addPageBtn.addEventListener("click", () => {
		postNodes.forEach((node) => {
			const path = normalizePath(node.getAttribute("data-post-url"));
			const title = node.getAttribute("data-post-title") || path;
			addPost(path, title);
		});
		persistAndRender();
	});

	clearBtn.addEventListener("click", () => {
		playlist = [];
		persistAndRender();
	});

	shareBtn.addEventListener("click", async () => {
		if (playlist.length === 0) return;
		const startUrl = `${window.location.origin}${buildPlaylistUrl(playlist[0].url, playlist, exitPath)}`;

		try {
			await navigator.clipboard.writeText(startUrl);
			const original = shareBtn.textContent;
			shareBtn.textContent = "Copied";
			window.setTimeout(() => {
				shareBtn.textContent = original;
			}, 1200);
		} catch (_error) {
			// fallback: open share URL
			window.open(startUrl, "_blank", "noopener,noreferrer");
		}
	});

	openFirstBtn.addEventListener("click", () => {
		if (playlist.length === 0) return;
		window.location.href = buildPlaylistUrl(playlist[0].url, playlist, exitPath);
	});

	persistAndRender();
}
