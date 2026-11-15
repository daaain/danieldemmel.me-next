---
name: chartkit
description: Daniel's house style for data charts (line and bar) – themed light/dark SVGs with hover tooltips, built from a small JSON spec. Use whenever a chart is needed for the blog (danieldemmel.me) or any other project of Daniel's, or when asked to restyle, regenerate or add a chart, thumbnail or og:image for one. Works from any repo by path.
---

# chartkit

One dependency-free renderer (`chartkit.mjs`) that runs in Node and the browser, plus a CLI
(`cli.mjs`). You describe a chart as JSON; chartkit draws it in the "Rich" style Daniel picked:
a soft card with title, subtitle and legend chips; horizontal and vertical hairlines; markers;
soft area fills; end-of-line labels; a crosshair tooltip that lists every series; the nearest
line highlighted with its uncertainty band; legend chips that toggle series; keyboard reading
(← → Home End); and a slow draw-in for charts below the fold.

Data prep stays in whatever language the project uses – it only has to write the JSON.

## Quick start

```sh
# from any repo – the path is the blog's copy of this skill
node ~/workspace/danieldemmel.me-next/.claude/skills/chartkit/cli.mjs build path/to/foo.chart.json
```

For each `foo.chart.json` it writes next to it (or into `--out DIR`):

| File | What it's for |
|---|---|
| `foo.svg` | Light, 960px wide. Static inside `<img>`; **opened on its own it re-lays out to the window and is fully interactive** (the renderer is embedded). |
| `foo-dark.svg` | The same in dark. |
| `foo-thumb.svg`, `foo-thumb-dark.svg` | 10:7 compact card for list thumbnails (no subtitle or axis titles, bigger type). |
| `foo-og.png` | 1200×630 light card for `og:image` – social sites don't render SVG. Needs Chrome (`CHROME_PATH` overrides the lookup); skipped with a warning otherwise, or with `--no-png`. |

Re-run the build after changing a spec or `chartkit.mjs`; the outputs are artefacts, the
`.chart.json` is the source of truth.

## In the blog

Put `foo.chart.json` and its outputs in `public/images/YYYY/` and reference the SVG as usual:

```md
![Alt text describing the chart's message](/images/2026/foo.svg)
```

`lib/remark-themed-images.mjs` sees the sidecar and swaps the image for `<Chart>`
(`components/Chart.tsx`): the chart is server-rendered **inline** (so it follows the site's
theme toggle via `html.dark` and works without JS), then `hydrate()` makes it fluid and
interactive. "Open full size ↗" links to `foo.svg` / `foo-dark.svg` by theme.

In frontmatter, `images: ['/images/2026/foo.svg']` is enough: contentlayer's computed fields
pick up `heroChart` (the hero renders as a live chart), `thumbImage`/`thumbDarkImage` for the
list page and `ogImage` for social cards.

The same convention works for any image: `foo.webp` (or `foo-light.webp`) plus a
`foo-dark.webp` beside it renders both with `dark:hidden` / `hidden dark:block`.

Contentlayer only re-processes a post when its own `.mdx` changes, so adding a `-dark`
variant, a thumbnail or a `.chart.json` beside an existing image isn't picked up by a running
dev server: restart it (`yarn dev` and `yarn build` start with `contentlayer2 build
--clearCache`), or run that command by hand.

## Elsewhere

- **A static site or README**: use the two files with `<picture>` or the light/dark pair your
  framework supports. Don't rely on `prefers-color-scheme` inside one SVG in `<img>` – Chrome
  passes the page's `color-scheme` through, but Safari is unverified.
- **A page you control with JS**: import `renderSVG` and `hydrate` from `chartkit.mjs` (copy
  the file, or import it by path). Render with `theme: 'auto'` and give each chart a unique
  `idPrefix`. `'auto'` follows `<html class="dark">` when present, otherwise the OS.
- **Nothing runs inside `<img>`**: no hover, no reflow, no web fonts. Interactivity needs
  inline SVG (via `hydrate`) or opening the SVG file directly.

```js
import { renderSVG, hydrate } from './chartkit.mjs'
el.innerHTML = renderSVG(spec, { theme: 'auto', width: el.clientWidth, idPrefix: 'ck-foo' })
const stop = hydrate(el.querySelector('svg'), spec, { theme: 'auto', idPrefix: 'ck-foo' })
```

## Spec

All text is plain text (escaped for you). Templates use `{expr|format:digits}`, where `expr` is
a name or `a*b` / `a/b` with names or numbers.

**Formats:** `int` (rounded, thousands separators), `fixed:N`, `pct:N` (×100), `kilo`
(2048 → 2K), `signed:N` (+3 / −3, a real minus sign, 0 unsigned), `raw` (the default).

### Line

```jsonc
{
  "chartkit": 1, "type": "line",
  "title": "Writing speed on a MacBook Pro M3 Max",
  "subtitle": "Tokens produced per second once the answer has started. Higher is better.",
  "alt": "What the chart shows, for screen readers and the standalone file",
  "vars": { "n": 233 },                         // constants for templates (optional)
  "x": { "title": "Context length (…)", "short": "Context length",   // short: narrow screens
         "domain": [0, 65536], "ticks": [0, 8192, …], "ticksCompact": [0, 16384, …],
         "format": "kilo", "tip": "{x|int} tokens of context" },       // tip: tooltip header
  "y": { "title": "Tokens per second", "domain": [0, 25], "ticks": [0, 5, …], "format": "int" },
  "labels": { "end": "{y|fixed:1}" },          // value after each end-of-line label
  "tooltip": {
    "value": "{y|fixed:2} tok/s",              // the strong figure per series
    "detail": "95%: {lo|pct}–{hi|pct}",        // optional second line (lo/hi from points)
    "footer": { "kind": "gap", "text": "{lead} ahead by {d|fixed:2} tok/s (+{r|pct})" }  // 2 series
  },
  "area": true,                                // soft fills (off automatically for dashed/banded)
  "markers": true,                             // dropped automatically when points are dense
  "shade": { "from": 0, "to": 0.02, "label": ["Pre-registered", "range: 0–2%"] },  // optional
  "zero": { "label": "no difference" },        // optional emphasised zero line
  "series": [
    { "name": "DeepSeek V4 Flash", "short": "DeepSeek", "slot": 1, "points": [[2048, 22.19], …] },
    { "name": "GLM streamed", "slot": 2, "dashed": true, "points": […] },
    { "name": "Commands only", "slot": 1, "band": "focus", "points": [[x, y, lo, hi], …] }
  ]
}
```

- `slot` (1–8) is the colour and **follows the entity, not its position**: the same model keeps
  the same slot across every chart in a post. Use `dashed` for a second encoding (e.g.
  streamed vs resident) rather than new hues.
- `band`: `"focus"` shows the interval when the reader's pointer nears the line (best when
  several lines each have one); `"always"` draws it permanently (single-series charts).

### Bar

```jsonc
{
  "chartkit": 1, "type": "bar", "style": "track",   // "track" (bar on a full-length track) or "bar"
  "title": "…", "subtitle": "…", "alt": "…",
  "max": 569,                                       // track length / axis max
  "x": { "title": "Successful attacks caught (of 569)", "ticks": [0, 100, …] },
  "rows": [["Haiku 5.5, control-arena prompt", 361.96], …],
  "labels": { "value": "{v|int}" },
  "tooltip": { "value": "{v|int} of {max}", "detail": "caught ({v/max|pct:1})",
               "footer": { "text": "{r|fixed:1}× fewer than the top row" } }   // r = first ÷ this
}
```

## House style rules

- Pick the form first (line for change over an ordered x, bars for comparing categories);
  one y-axis only – two measures means two charts.
- Palette: the validated 8-slot categorical set in `THEMES` (separately stepped for dark). The
  first three slots pass colour-vision checks for every pair; beyond three series prefer
  dashes, facets or folding into "Other". Aqua (slot 3) is under 3:1 on white, which is why
  every chart carries direct labels (chips and line ends) and exact figures on hover.
- Text never wears the series colour – names and values are ink; a coloured key carries identity.
- Write `alt` as the chart's message ("DeepSeek starts at 22 tok/s and falls to 17"), not its
  anatomy.
- Motion stays calm: one slow draw-in, no blinking or pulsing.

## Developing chartkit

- Tests: `node --test .claude/skills/chartkit/chartkit.test.mjs` (Node's built-in runner; it
  also renders every `*.chart.json` under the blog's `public/images` in all layouts and fails
  on any `NaN`/`undefined`).
- Keep `chartkit.mjs` dependency-free with only top-level `export function`/`export const` –
  the CLI strips `export` and embeds it in CDATA, so it must never contain `]]>`.
- Text widths are estimated (`textWidth`), not measured, so server and client lay out
  identically; tooltips in the browser measure real text.
- Typings for TypeScript consumers: `chartkit.d.mts`.
