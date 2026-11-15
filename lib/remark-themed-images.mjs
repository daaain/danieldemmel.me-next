// Runs after pliny's `remarkImgToJsx`, which turns markdown images into `<Image alt src width
// height />` JSX elements. For each local image this:
//   - swaps in a live `<Chart spec src darkSrc alt />` when a `foo.chart.json` sits beside it
//   - otherwise adds `darkSrc` when a `foo-dark.*` variant exists, so the image follows the
//     site's theme toggle rather than only the OS preference – unless the post also shows
//     that dark variant itself, in which case both stay static

import { chartSidecar, darkVariant } from './themed-images.mjs'

const attr = (name, value) => ({ type: 'mdxJsxAttribute', name, value })

const getAttr = (node, name) => node.attributes?.find((a) => a.name === name)?.value

const walk = (node, visitor) => {
  visitor(node)
  for (const child of node.children ?? []) walk(child, visitor)
}

const isImage = (node) => node.type === 'mdxJsxFlowElement' && node.name === 'Image'

export function remarkThemedImages(options = {}) {
  const root = options.root ?? process.cwd()

  return (tree) => {
    // A post that shows the dark variant itself ("and the same in the dark scheme") wants
    // both images to stay as they are, so those pairs are left static.
    const referenced = new Set()
    walk(tree, (node) => {
      const src = isImage(node) && getAttr(node, 'src')
      if (typeof src === 'string') referenced.add(src)
    })

    walk(tree, (node) => {
      if (!isImage(node)) return
      const src = getAttr(node, 'src')
      // Only plain string sources; skip JSX expressions and ones already themed by hand
      if (typeof src !== 'string' || getAttr(node, 'darkSrc') !== undefined) return

      const variant = darkVariant(src, root)
      const darkSrc = variant && !referenced.has(variant) ? variant : null
      const spec = chartSidecar(src, root)

      if (spec !== null) {
        const alt = getAttr(node, 'alt')
        node.name = 'Chart'
        node.attributes = [
          attr('spec', spec),
          attr('src', src),
          ...(darkSrc ? [attr('darkSrc', darkSrc)] : []),
          ...(typeof alt === 'string' && alt ? [attr('alt', alt)] : []),
        ]
        return
      }

      if (darkSrc) node.attributes.push(attr('darkSrc', darkSrc))
    })
  }
}

export default remarkThemedImages
