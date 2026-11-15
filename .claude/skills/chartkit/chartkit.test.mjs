// Run with: node --test .claude/skills/chartkit/
import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, test } from 'node:test'
import { fileURLToPath } from 'node:url'

import { dodge, fmt, renderSVG, textWidth, wrapText } from './chartkit.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))

describe('fmt', () => {
  test('formats numbers with named formats', () => {
    assert.equal(fmt('{y|fixed:2} tok/s', { y: 18.578 }), '18.58 tok/s')
    assert.equal(fmt('{y|pct}', { y: 0.4721 }), '47%')
    assert.equal(fmt('{y|pct:1}', { y: 0.4721 }), '47.2%')
    assert.equal(fmt('{x|kilo}', { x: 24576 }), '24K')
    assert.equal(fmt('{x|kilo}', { x: 0 }), '0')
    assert.equal(fmt('{x|kilo}', { x: 1536 }), '1.5K')
    assert.equal(fmt('{x|int}', { x: 26624 }), '26,624')
  })

  test('signed uses a real minus sign and no sign for zero', () => {
    assert.equal(fmt('{v|signed}', { v: 20.4 }), '+20')
    assert.equal(fmt('{v|signed}', { v: -3.2 }), '−3')
    assert.equal(fmt('{v|signed}', { v: 0.2 }), '0')
    assert.equal(fmt('{v|signed:1}', { v: -3.24 }), '−3.2')
  })

  test('supports simple arithmetic against vars and literals', () => {
    assert.equal(fmt('≈{y*n|int} of {n}', { y: 0.5, n: 233 }), '≈117 of 233')
    assert.equal(fmt('{v/max|pct:1}', { v: 208.44, max: 569 }), '36.6%')
    assert.equal(fmt('{v*100|int}', { v: 0.123 }), '12')
  })

  test('passes strings through and leaves unknown names empty', () => {
    assert.equal(fmt('{lead} ahead', { lead: 'DeepSeek' }), 'DeepSeek ahead')
    assert.equal(fmt('a{nope}b', {}), 'ab')
  })
})

describe('text helpers', () => {
  test('textWidth grows with length and size', () => {
    assert.ok(textWidth('Hello world', 14) > textWidth('Hello', 14))
    assert.ok(textWidth('Hello', 20) > textWidth('Hello', 14))
    assert.ok(textWidth('mmmm', 14) > textWidth('iiii', 14))
  })

  test('wrapText keeps lines within the width', () => {
    const lines = wrapText('Tokens produced per second once the answer has started. Higher is better.', 14, 260)
    assert.ok(lines.length >= 2)
    for (const l of lines) assert.ok(textWidth(l, 14) <= 260, l)
    assert.equal(lines.join(' '), 'Tokens produced per second once the answer has started. Higher is better.')
  })
})

describe('dodge', () => {
  test('separates close labels by at least the gap, keeping order', () => {
    const out = dodge([100, 104, 106], 18)
    assert.ok(out[1] - out[0] >= 18 - 1e-9)
    assert.ok(out[2] - out[1] >= 18 - 1e-9)
  })
  test('keeps labels inside bounds', () => {
    const out = dodge([2, 4], 18, 0, 100)
    assert.ok(Math.min(...out) >= 0)
  })
})

const lineSpec = {
  chartkit: 1,
  type: 'line',
  title: 'Writing speed',
  subtitle: 'Tokens per second. Higher is better.',
  alt: 'A line chart',
  x: { title: 'Context', domain: [0, 4096], ticks: [0, 2048, 4096], format: 'kilo', tip: '{x|int} tokens' },
  y: { title: 'Tokens per second', domain: [0, 25], ticks: [0, 10, 20], format: 'int' },
  labels: { end: '{y|fixed:1}' },
  tooltip: { value: '{y|fixed:2} tok/s' },
  series: [
    { name: 'A & B <model>', slot: 1, points: [[0, 20], [2048, 19], [4096, 18]] },
    { name: 'C', slot: 2, dashed: true, points: [[0, 10, 8, 12], [2048, 11, 9, 13]], band: 'focus' },
  ],
}

const barSpec = {
  chartkit: 1,
  type: 'bar',
  title: 'Bars',
  subtitle: 'Out of 569.',
  alt: 'A bar chart',
  max: 569,
  x: { title: 'Caught', ticks: [0, 200, 400] },
  rows: [['First', 362], ['Second', 44]],
  tooltip: { value: '{v|int} of {max}' },
}

describe('renderSVG', () => {
  for (const layout of ['full', 'thumb', 'screen']) {
    for (const spec of [lineSpec, barSpec]) {
      test(`${spec.type} ${layout} renders a clean, escaped svg`, () => {
        const svg = renderSVG(spec, { theme: 'auto', width: 760, height: 520, layout, idPrefix: 't1' })
        assert.match(svg, /^<svg [^>]*class="ck ck-auto/)
        assert.ok(!/NaN|undefined|Infinity/.test(svg), 'no NaN/undefined leaks')
        assert.ok(!svg.includes('<model>'), 'names are escaped')
        assert.ok(svg.endsWith('</svg>'))
      })
    }
  }

  test('ids are prefixed so several charts can share a page', () => {
    const svg = renderSVG(lineSpec, { theme: 'auto', width: 760, idPrefix: 'abc' })
    const ids = [...svg.matchAll(/ id="([^"]+)"/g)].map((m) => m[1])
    assert.ok(ids.length > 0)
    for (const id of ids) assert.ok(id.startsWith('abc-'), id)
  })

  test('forced themes carry their class', () => {
    assert.match(renderSVG(lineSpec, { theme: 'dark', width: 760, idPrefix: 'd' }), /class="ck ck-dark/)
    assert.match(renderSVG(lineSpec, { theme: 'light', width: 760, idPrefix: 'l' }), /class="ck ck-light/)
  })

  test('hidden series are left out', () => {
    const svg = renderSVG(lineSpec, { theme: 'auto', width: 760, idPrefix: 'h', hidden: [1] })
    assert.ok(!svg.includes('class="ck-series" data-i="1"'))
    assert.ok(svg.includes('class="ck-series" data-i="0"'))
  })

  test('interactive charts carry no <title>, so browsers show no native tooltip over our own', () => {
    const svg = renderSVG(lineSpec, { theme: 'auto', width: 760, idPrefix: 'i', interactive: true })
    assert.ok(!svg.includes('<title'), 'no <title> element')
    assert.match(svg, /^<svg [^>]*aria-label="Writing speed"/)
    const bars = renderSVG(barSpec, { theme: 'auto', width: 760, idPrefix: 'i', interactive: true })
    assert.ok(!bars.includes('<title'))
  })

  test('static charts keep <title> and <desc> for screen readers', () => {
    const svg = renderSVG(lineSpec, { theme: 'light', width: 760, idPrefix: 's' })
    assert.ok(svg.includes('<title id="s-t">Writing speed</title>'))
    assert.ok(svg.includes('<desc id="s-d">A line chart</desc>'))
  })

  test('the thumb layout keeps the requested size', () => {
    const svg = renderSVG(lineSpec, { theme: 'light', width: 480, height: 336, layout: 'thumb', idPrefix: 't' })
    assert.match(svg, /viewBox="0 0 480 336"/)
  })
})

describe('specs in the blog', () => {
  const dir = path.resolve(here, '../../../public/images')
  const specs = []
  const walk = (d) => {
    for (const e of readdirSync(d, { withFileTypes: true })) {
      if (e.isDirectory()) walk(path.join(d, e.name))
      else if (e.name.endsWith('.chart.json')) specs.push(path.join(d, e.name))
    }
  }
  try { walk(dir) } catch { /* no images dir outside the blog */ }
  for (const file of specs) {
    test(`${path.basename(file)} renders in every layout without leaks`, () => {
      const spec = JSON.parse(readFileSync(file, 'utf8'))
      for (const layout of ['full', 'thumb', 'screen']) {
        for (const width of [340, 760, 1200]) {
          const svg = renderSVG(spec, { theme: 'auto', width, height: 630, layout, idPrefix: 'x' })
          assert.ok(!/NaN|undefined|Infinity/.test(svg), `${layout} ${width}`)
        }
      }
    })
  }
})
