+++
title = "Offline"
description = "You appear to be offline. Reconnect to continue browsing the site."
template = "offline.html"
path = "offline"

[extra]
sitemap_exclude = true
hide_page_meta = true
hide_post_actions = true
shell_fit = true
compact_main = true

[extra.comments]
enabled = false
+++

<p class="not-prose mb-4">
	<span id="offline-status" data-offline-status="true" class="status-pill status-pill--pending">Waiting for connection</span>
</p>

Limited cached content is available while you are disconnected.
