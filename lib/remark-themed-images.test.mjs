import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, before, describe, it } from 'node:test'

import { remarkThemedImages } from './remark-themed-images.mjs'

let root

const touch = (publicPath, contents = '') => {
  const file = path.join(root, 'public', publicPath)
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, contents)
}

// The shape pliny's remarkImgToJsx leaves behind
const imageTree = (src) => ({
  type: 'root',
  children: [
    {
      type: 'div',
      children: [
        {
          type: 'mdxJsxFlowElement',
          name: 'Image',
          attributes: [
            { type: 'mdxJsxAttribute', name: 'alt', value: 'A chart' },
            { type: 'mdxJsxAttribute', name: 'src', value: src },
            { type: 'mdxJsxAttribute', name: 'width', value: 800 },
            { type: 'mdxJsxAttribute', name: 'height', value: 400 },
          ],
          children: [],
        },
      ],
    },
  ],
})

const getAttrs = (node) => Object.fromEntries(node.attributes.map((a) => [a.name, a.value]))

const transform = (src) => {
  const tree = imageTree(src)
  remarkThemedImages({ root })(tree)
  const node = tree.children[0].children[0]
  return {
    name: node.name,
    attrs: Object.fromEntries(node.attributes.map((a) => [a.name, a.value])),
  }
}

before(() => {
  root = mkdtempSync(path.join(tmpdir(), 'remark-themed-images-'))
  touch('/images/plain.png')
  touch('/images/photo.png')
  touch('/images/photo-dark.png')
  touch('/images/chart.svg')
  touch('/images/chart-dark.svg')
  touch('/images/chart.chart.json', '{"type":"bar"}')
})

after(() => rmSync(root, { recursive: true, force: true }))

describe('remarkThemedImages', () => {
  it('leaves images without variants alone', () => {
    assert.deepEqual(transform('/images/plain.png'), {
      name: 'Image',
      attrs: { alt: 'A chart', src: '/images/plain.png', width: 800, height: 400 },
    })
  })

  it('adds darkSrc when a dark variant exists', () => {
    const { name, attrs } = transform('/images/photo.png')
    assert.equal(name, 'Image')
    assert.equal(attrs.darkSrc, '/images/photo-dark.png')
    assert.equal(attrs.width, 800)
  })

  it('leaves a light/dark pair static when the post shows both deliberately', () => {
    // e.g. a light screenshot followed by "and the same in the dark scheme"
    const tree = imageTree('/images/photo.png')
    tree.children.push(imageTree('/images/photo-dark.png').children[0])
    remarkThemedImages({ root })(tree)
    const [light, dark] = tree.children.map((div) => div.children[0])
    assert.equal(getAttrs(light).darkSrc, undefined)
    assert.equal(getAttrs(dark).darkSrc, undefined)
    assert.equal(getAttrs(dark).src, '/images/photo-dark.png')
  })

  it('turns images with a chart sidecar into Chart elements', () => {
    assert.deepEqual(transform('/images/chart.svg'), {
      name: 'Chart',
      attrs: {
        spec: '{"type":"bar"}',
        src: '/images/chart.svg',
        darkSrc: '/images/chart-dark.svg',
        alt: 'A chart',
      },
    })
  })
})
