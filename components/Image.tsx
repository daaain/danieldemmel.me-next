import NextImage, { type ImageProps } from 'next/image'
import Link from './Link'

const Image = ({
  src,
  shouldOpenWhenClicked = true,
  noBlur = false,
  customLink = null,
  ...rest
}: ImageProps & { shouldOpenWhenClicked?: boolean; noBlur?: boolean; customLink?: string }) => {
  const maybeBlurProps: Partial<ImageProps> = noBlur
    ? {}
    : {
        placeholder: 'blur',
        blurDataURL: `/_next/image?url=${src}&w=16&q=1`,
      }
  const image = <NextImage src={src} {...maybeBlurProps} {...rest} />

  if (!shouldOpenWhenClicked) return image

  return (
    <Link
      href={customLink ? customLink : `${src}`}
      style={rest.fill ? { position: 'absolute', inset: 0 } : undefined}
    >
      {image}
    </Link>
  )
}

export default Image
