import rss from './rss.mjs'
import search from './search.mjs'
import sitemap from './sitemap.mjs'

async function postbuild() {
  await Promise.all([rss(), sitemap(), search()])
}

postbuild()
