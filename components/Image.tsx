import NextImage, { ImageProps } from 'next/image'

const Image = ({ src, ...rest }: ImageProps) => (
  <NextImage
    src={src}
    placeholder="blur"
    blurDataURL={`/_next/image?url=${src}&w=16&q=1`}
    {...rest}
  />
)

export default Image
