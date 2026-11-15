#!/usr/bin/env node
/**
 * chartkit CLI – build the static files for one or more chart specs.
 *
 *   node cli.mjs build path/to/foo.chart.json [more.chart.json …] [--out DIR] [--no-png]
 *
 * For each `foo.chart.json` it writes, next to it (or into --out):
 *   foo.svg              light, 960px wide; interactive and full-window when opened on its own
 *   foo-dark.svg         the same in dark
 *   foo-thumb.svg        10:7 compact card for list thumbnails (static)
 *   foo-thumb-dark.svg
 *   foo-og.png           1200×630 light card for og:image (needs Chrome; skipped otherwise)
 *
 * Config (12-factor, via env): CHROME_PATH overrides where headless Chrome is looked for.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

import { renderSVG } from './chartkit.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))

const FULL_WIDTH = 960
const THUMB = { width: 480, height: 336 } // 10:7, the list page's crop
const OG = { width: 960, height: 504, scale: 1.25 } // → 1200×630

/** chartkit.mjs as a plain script for embedding: exports dropped, comment lines and indentation stripped. */
function embeddableSource() {
  const src = readFileSync(path.join(here, 'chartkit.mjs'), 'utf8')
  if (src.includes(']]>')) throw new Error('chartkit.mjs must not contain "]]>" – it is embedded in CDATA')
  return src
    .replace(/^\/\*\*[\s\S]*?\*\/\n/m, '')
    .split('\n')
    .filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l))
    .map((l) => l.replace(/^\s+/, ''))
    .join('\n')
    .replace(/^export /gm, '')
}

/** A standalone file: the static render plus the renderer, which takes over when the file is
 * opened directly (scripts never run when an SVG is loaded through <img>). */
export function standalone(spec, theme, source = embeddableSource()) {
  const svg = renderSVG(spec, { theme, width: FULL_WIDTH, layout: 'full', idPrefix: 'ck' })
  const boot = `(function(){${source}\nhydrate(document.documentElement, ${JSON.stringify(spec)}, {theme: ${JSON.stringify(theme)}, idPrefix: 'ck'});})();`
  return `<?xml version="1.0" encoding="UTF-8"?>\n${svg.replace(/<\/svg>$/, `<script><![CDATA[\n${boot}\n]]></script></svg>`)}\n`
}

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/Applications/Chromium.app/Contents/MacOS/Chromium',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
  ].filter(Boolean)
  return candidates.find((c) => existsSync(c))
}

function png(spec, out, chrome) {
  const dir = mkdtempSync(path.join(tmpdir(), 'chartkit-'))
  try {
    const svgPath = path.join(dir, 'og.svg')
    writeFileSync(svgPath, renderSVG(spec, { theme: 'light', width: OG.width, height: OG.height, layout: 'screen', idPrefix: 'og' }))
    execFileSync(
      chrome,
      [
        '--headless=new',
        '--disable-gpu',
        '--hide-scrollbars',
        `--force-device-scale-factor=${OG.scale}`,
        `--window-size=${OG.width},${OG.height}`,
        `--screenshot=${path.resolve(out)}`,
        pathToFileURL(svgPath).href,
      ],
      { stdio: 'ignore', timeout: 60_000 },
    )
  } finally {
    rmSync(dir, { recursive: true, force: true })
  }
}

function build(files, { out, pngs }) {
  const source = embeddableSource()
  const chrome = pngs ? findChrome() : null
  if (pngs && !chrome) console.warn('chartkit: no Chrome found (set CHROME_PATH); skipping og PNGs')
  for (const file of files) {
    if (!file.endsWith('.chart.json')) throw new Error(`expected a *.chart.json file, got ${file}`)
    const spec = JSON.parse(readFileSync(file, 'utf8'))
    const base = path.join(out || path.dirname(file), path.basename(file, '.chart.json'))
    const write = (p, s) => {
      writeFileSync(p, s)
      console.log(`wrote ${p}`)
    }
    write(`${base}.svg`, standalone(spec, 'light', source))
    write(`${base}-dark.svg`, standalone(spec, 'dark', source))
    for (const theme of ['light', 'dark'])
      write(
        `${base}-thumb${theme === 'dark' ? '-dark' : ''}.svg`,
        `<?xml version="1.0" encoding="UTF-8"?>\n${renderSVG(spec, { theme, ...THUMB, layout: 'thumb', idPrefix: 'th' })}\n`,
      )
    if (chrome) {
      png(spec, `${base}-og.png`, chrome)
      console.log(`wrote ${base}-og.png`)
    }
  }
}

function main(argv) {
  const [cmd, ...rest] = argv
  if (cmd !== 'build' || rest.includes('--help') || rest.includes('-h')) {
    console.log(readFileSync(fileURLToPath(import.meta.url), 'utf8').match(/\/\*\*([\s\S]*?)\*\//)[1].replace(/^ \* ?/gm, ''))
    process.exit(cmd === 'build' || cmd === '--help' || cmd === '-h' ? 0 : 1)
  }
  const files = []
  let out = null
  let pngs = true
  for (let i = 0; i < rest.length; i++) {
    if (rest[i] === '--out') out = rest[++i]
    else if (rest[i] === '--no-png') pngs = false
    else files.push(rest[i])
  }
  if (!files.length) throw new Error('no spec files given')
  build(files, { out, pngs })
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) main(process.argv.slice(2))
