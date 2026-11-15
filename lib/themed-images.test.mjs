import assert from 'node:assert/strict'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { after, before, describe, it } from 'node:test'

import { chartSidecar, darkVariant, ogVariant, thumbVariant } from './themed-images.mjs'

let root

const touch = (publicPath, contents = '') => {
  const file = path.join(root, 'public', publicPath)
  mkdirSync(path.dirname(file), { recursive: true })
  writeFileSync(file, contents)
}

before(() => {
  root = mkdtempSync(path.join(tmpdir(), 'themed-images-'))
  touch('/images/plain.png')
  touch('/images/chart.svg')
  touch('/images/chart-dark.svg')
  touch('/images/chart.chart.json', '{"type":"bar"}')
  touch('/images/photo-light.webp')
  touch('/images/photo-dark.webp')
  touch('/images/hero.svg')
  touch('/images/hero-thumb.svg')
  touch('/images/hero-og.png')
})

after(() => rmSync(root, { recursive: true, force: true }))

describe('darkVariant', () => {
  it('finds a -dark sibling', () => {
    assert.equal(darkVariant('/images/chart.svg', root), '/images/chart-dark.svg')
  })

  it('maps -light to -dark', () => {
    assert.equal(darkVariant('/images/photo-light.webp', root), '/images/photo-dark.webp')
  })

  it('returns null when there is no dark sibling', () => {
    assert.equal(darkVariant('/images/plain.png', root), null)
  })

  it('returns null for a source that is already dark', () => {
    assert.equal(darkVariant('/images/chart-dark.svg', root), null)
  })

  it('returns null for remote and missing sources', () => {
    assert.equal(darkVariant('https://example.com/chart.svg', root), null)
    assert.equal(darkVariant('//example.com/chart.svg', root), null)
    assert.equal(darkVariant(undefined, root), null)
  })
})

describe('chartSidecar', () => {
  it('returns the raw JSON beside the image', () => {
    assert.equal(chartSidecar('/images/chart.svg', root), '{"type":"bar"}')
  })

  it('resolves from the dark variant too', () => {
    assert.equal(chartSidecar('/images/chart-dark.svg', root), '{"type":"bar"}')
  })

  it('returns null without a sidecar', () => {
    assert.equal(chartSidecar('/images/plain.png', root), null)
    assert.equal(chartSidecar('https://example.com/chart.svg', root), null)
  })
})

describe('thumbVariant', () => {
  it('finds a -thumb sibling with the same extension', () => {
    assert.equal(thumbVariant('/images/hero.svg', root), '/images/hero-thumb.svg')
  })

  it('returns null without one', () => {
    assert.equal(thumbVariant('/images/plain.png', root), null)
  })
})

describe('ogVariant', () => {
  it('finds a -og.png sibling regardless of the source extension', () => {
    assert.equal(ogVariant('/images/hero.svg', root), '/images/hero-og.png')
  })

  it('returns null without one', () => {
    assert.equal(ogVariant('/images/plain.png', root), null)
  })
})
