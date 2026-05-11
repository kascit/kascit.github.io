<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS Feed</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <style>
          :root {
            --bg: #f6f8fa;
            --text: #1f2328;
            --text-muted: #656d76;
            --border: #d0d7de;
            --link: #0969da;
            --card-bg: #ffffff;
            --font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif;
          }
          @media (prefers-color-scheme: dark) {
            :root {
              --bg: #010409;
              --text: #e6edf3;
              --text-muted: #8b949e;
              --border: #30363d;
              --link: #2f81f7;
              --card-bg: #0d1117;
            }
          }
          * { box-sizing: border-box; }
          body {
            font-family: var(--font-family);
            background-color: var(--bg);
            color: var(--text);
            line-height: 1.5;
            margin: 0;
            padding: 2rem 1rem;
          }
          a {
            color: var(--link);
            text-decoration: none;
          }
          a:hover {
            text-decoration: underline;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
          }
          .header {
            margin-bottom: 2rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid var(--border);
          }
          .header h1 {
            font-size: 2rem;
            font-weight: 700;
            margin: 0 0 0.5rem 0;
          }
          .header p {
            color: var(--text-muted);
            margin: 0 0 1rem 0;
          }
          .notice {
            background-color: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 1rem;
            margin-bottom: 2rem;
            font-size: 0.9rem;
            color: var(--text-muted);
          }
          .item {
            background-color: var(--card-bg);
            border: 1px solid var(--border);
            border-radius: 6px;
            padding: 1.5rem;
            margin-bottom: 1rem;
          }
          .item h2 {
            font-size: 1.25rem;
            margin: 0 0 0.5rem 0;
          }
          .item-meta {
            font-size: 0.85rem;
            color: var(--text-muted);
            margin-bottom: 1rem;
          }
          .item-description {
            color: var(--text);
            font-size: 0.95rem;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="notice">
            <strong>This is an RSS feed.</strong> You can subscribe to this URL in a feed reader.
          </div>
          <div class="header">
            <h1><xsl:value-of select="/rss/channel/title"/></h1>
            <p><xsl:value-of select="/rss/channel/description"/></p>
            <a href="{/rss/channel/link}">Visit Website &#x2192;</a>
          </div>
          <div class="items">
            <xsl:for-each select="/rss/channel/item">
              <div class="item">
                <h2>
                  <a href="{link}">
                    <xsl:value-of select="title"/>
                  </a>
                </h2>
                <div class="item-meta">
                  Published: <xsl:value-of select="pubDate"/>
                </div>
                <div class="item-description">
                  <xsl:value-of select="description" disable-output-escaping="yes"/>
                </div>
              </div>
            </xsl:for-each>
          </div>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
