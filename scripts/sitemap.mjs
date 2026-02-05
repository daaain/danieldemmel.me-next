import { writeFileSync } from 'node:fs'
import path from 'node:path'
import { allBlogs } from '../.contentlayer/generated/index.mjs'
import siteMetadata from '../data/siteMetadata.js'

const sitemap = () => {
  const publishedPosts = allBlogs
    .filter((post) => post.draft !== true)
    .sort((a, b) => new Date(b.date) - new Date(a.date))

  const pages = [
    '',
    'blog',
    'projects',
    'tags',
    'about',
    ...publishedPosts.map((post) => post._raw.flattenedPath),
  ]

  const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages
  .map(
    (page) => `  <url>
    <loc>${siteMetadata.siteUrl}/${page}</loc>
  </url>`
  )
  .join('\n')}
</urlset>`

  const outputPath = path.join(process.cwd(), 'public', 'sitemap.xml')
  writeFileSync(outputPath, sitemapXml)
  console.log('Sitemap generated...')
}

export default sitemap
