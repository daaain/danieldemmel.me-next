export type Theme = 'auto' | 'light' | 'dark'
export type Layout = 'full' | 'thumb' | 'screen'

/** See SKILL.md for the full spec format. */
export interface ChartSpec {
  chartkit: 1
  type: 'line' | 'bar'
  title: string
  subtitle?: string
  alt?: string
  [key: string]: unknown
}

export interface RenderOptions {
  theme?: Theme
  width?: number
  height?: number
  layout?: Layout
  /** Unique per page: prefixes every id inside the SVG. */
  idPrefix?: string
  hidden?: number[]
  interactive?: boolean
  animate?: boolean
}

export interface HydrateOptions {
  theme?: Theme
  idPrefix?: string
  layout?: Layout
  animate?: boolean
}

export const VERSION: number
export const THEMES: Record<'light' | 'dark', Record<string, string>>
export const FORMATS: Record<string, (v: number, digits?: number) => string>
export function renderSVG(spec: ChartSpec | object, opts?: RenderOptions): string
export function hydrate(svg: SVGSVGElement, spec: ChartSpec | object, opts?: HydrateOptions): () => void
export function fmt(template: string, vars?: Record<string, number | string | undefined>): string
export function textWidth(s: string, size: number, weight?: number): number
export function wrapText(text: string, size: number, maxWidth: number, weight?: number): string[]
export function dodge(ys: number[], gap: number, lo?: number, hi?: number): number[]
export function esc(s: unknown): string
