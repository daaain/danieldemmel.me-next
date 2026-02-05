import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { allBlogs } from '../.contentlayer/generated/index.mjs'
import siteMetadata from '../data/siteMetadata.js'

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function generateRssItem(post) {
  const url = `${siteMetadata.siteUrl}/${post._raw.flattenedPath}`
  return `  <item>
    <title>${escapeXml(post.title)}</title>
    <link>${url}</link>
    <guid>${url}</guid>
    <pubDate>${new Date(post.date).toUTCString()}</pubDate>
    <description>${escapeXml(post.summary || '')}</description>
    <content:encoded><![CDATA[${post.body.raw}]]></content:encoded>
  </item>`
}

const rss = () => {
  const publishedPosts = allBlogs
    .filter((post) => post.draft !== true)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>${escapeXml(siteMetadata.title)}</title>
    <link>${siteMetadata.siteUrl}/blog</link>
    <description>${escapeXml(siteMetadata.description)}</description>
    <language>${siteMetadata.language}</language>
    <managingEditor>${siteMetadata.email} (${siteMetadata.author})</managingEditor>
    <webMaster>${siteMetadata.email} (${siteMetadata.author})</webMaster>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteMetadata.siteUrl}/feed.xml" rel="self" type="application/rss+xml"/>
${publishedPosts.map(generateRssItem).join('\n')}
  </channel>
</rss>`

  const outputPath = path.join(process.cwd(), 'public', 'feed.xml')
  mkdirSync(path.dirname(outputPath), { recursive: true })
  writeFileSync(outputPath, rssXml)
  console.log('RSS feed generated...')
}

export default rss
