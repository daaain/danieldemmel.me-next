// Naming conventions for image variants that live next to an image in /public.
//
// Given a public URL path such as `/images/2026/foo.svg`, these look for sibling files:
//   foo-dark.svg      dark-theme variant (also `foo-light.webp` → `foo-dark.webp`)
//   foo.chart.json    chartkit spec – the image is a rendered chart that can be drawn live
//   foo-thumb.svg     smaller/simpler variant for list thumbnails
//   foo-og.png        social card image (og:image / twitter:image)
//
// Plain ESM with no dependencies so both contentlayer config and the remark plugin can use it.

import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'

const isLocal = (src) => typeof src === 'string' && src.startsWith('/') && !src.startsWith('//')

const fileFor = (src, root) => path.join(root, 'public', src)

/** Splits `/x/foo-light.svg` into `{ dir: '/x', stem: 'foo-light', ext: '.svg' }`. */
const parse = (src) => {
  const { dir, name, ext } = path.posix.parse(src)
  return { dir, stem: name, ext }
}

const withSuffix = (src, suffix, ext) => {
  const parsed = parse(src)
  return path.posix.join(parsed.dir, `${parsed.stem}${suffix}${ext ?? parsed.ext}`)
}

const stripThemeSuffix = (stem) => stem.replace(/-(light|dark)$/, '')

const existing = (src, root) => (existsSync(fileFor(src, root)) ? src : null)

/**
 * `/x/foo.svg` → `/x/foo-dark.svg`, `/x/foo-light.webp` → `/x/foo-dark.webp`, if that file
 * exists. Null for remote URLs, missing files, and sources that are already dark variants.
 */
export function darkVariant(src, root = process.cwd()) {
  if (!isLocal(src)) return null
  const { dir, stem, ext } = parse(src)
  if (stem.endsWith('-dark')) return null
  return existing(path.posix.join(dir, `${stripThemeSuffix(stem)}-dark${ext}`), root)
}

/**
 * Raw JSON string of the chartkit spec beside `/x/foo.svg` (or `/x/foo-dark.svg` /
 * `/x/foo-light.svg`), i.e. `public/x/foo.chart.json`, or null when there is none.
 */
export function chartSidecar(src, root = process.cwd()) {
  if (!isLocal(src)) return null
  const { dir, stem } = parse(src)
  const specPath = fileFor(path.posix.join(dir, `${stripThemeSuffix(stem)}.chart.json`), root)
  try {
    return readFileSync(specPath, 'utf8')
  } catch {
    return null
  }
}

/** `/x/foo.svg` → `/x/foo-thumb.svg` if it exists, else null. */
export function thumbVariant(src, root = process.cwd()) {
  if (!isLocal(src)) return null
  return existing(withSuffix(src, '-thumb'), root)
}

/** `/x/foo.svg` → `/x/foo-og.png` if it exists, else null. */
export function ogVariant(src, root = process.cwd()) {
  if (!isLocal(src)) return null
  return existing(withSuffix(src, '-og', '.png'), root)
}
