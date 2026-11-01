import Image from './Image'

interface Props {
  src: string
  size?: { width: number; height: number } | null
  customLink?: string
}

// Matches SectionContainer: max-w-3xl, xl:max-w-5xl
const SIZES = '(min-width: 1280px) 64rem, (min-width: 768px) 48rem, 100vw'

// Inline rather than a utility class: the header's `space-y-1` would override a top margin
const WRAPPER_STYLE = { margin: '2.5rem 0 2rem' }

const LANDSCAPE_STYLE = { width: '100%', height: 'auto' }
const PORTRAIT_STYLE = {
  width: 'auto',
  height: 'auto',
  maxWidth: '100%',
  maxHeight: '75vh',
  marginInline: 'auto',
}

/**
 * A post's hero image. With a known intrinsic size it keeps its native aspect ratio and the
 * space is reserved so nothing shifts. Landscape images always fill the content width (smaller
 * ones are scaled up); portrait ones are capped at 75vh and centred rather than towering over
 * the post. Without a known size it falls back to a 2:1 crop.
 */
export default function HeroImage({ src, size, customLink }: Props) {
  if (size) {
    return (
      <div style={WRAPPER_STYLE}>
        <Image
          src={src}
          width={size.width}
          height={size.height}
          sizes={SIZES}
          priority
          customLink={customLink}
          alt="Hero image"
          style={size.height > size.width ? PORTRAIT_STYLE : LANDSCAPE_STYLE}
        />
      </div>
    )
  }

  return (
    <div style={{ ...WRAPPER_STYLE, position: 'relative', padding: '50% 0 0 0' }}>
      <Image
        fill
        priority
        sizes={SIZES}
        customLink={customLink}
        src={src}
        alt="Hero image"
        style={{
          objectFit: 'cover',
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  )
}
