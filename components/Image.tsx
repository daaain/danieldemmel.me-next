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
  return shouldOpenWhenClicked ? (
    <Link href={customLink ? customLink : `${src}`}>
      <NextImage src={src} {...maybeBlurProps} {...rest} />
    </Link>
  ) : (
    <NextImage src={src} {...maybeBlurProps} {...rest} />
  )
}

export default Image
