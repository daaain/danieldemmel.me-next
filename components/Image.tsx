import NextImage, { type ImageProps } from 'next/image'
import type { ReactElement } from 'react'
import Link from './Link'

type Props = ImageProps & {
  shouldOpenWhenClicked?: boolean
  noBlur?: boolean
  customLink?: string
  /**
   * Dark-theme variant. Both images are rendered and toggled with Tailwind's `dark:` classes so
   * they follow the site's theme switch (an `<img>` can't see the `html.dark` class itself).
   * The hidden one is lazy-loaded, so readers normally download only one.
   */
  darkSrc?: string | null
}

// Tailwind preflight makes images `display: block` and links are inline by default
const LIGHT_ONLY = 'dark:hidden'
const DARK_ONLY_IMAGE = 'hidden dark:block'
const DARK_ONLY_LINK = 'hidden dark:inline'

const cx = (...classes: (string | undefined)[]) => classes.filter(Boolean).join(' ') || undefined

const Image = ({
  src,
  darkSrc,
  shouldOpenWhenClicked = true,
  noBlur = false,
  customLink = null,
  className,
  priority,
  ...rest
}: Props) => {
  const render = (
    imageSrc: ImageProps['src'],
    themeClasses?: { image: string; link: string },
    isPriority = priority
  ): ReactElement => {
    const maybeBlurProps: Partial<ImageProps> = noBlur
      ? {}
      : {
          placeholder: 'blur',
          blurDataURL: `/_next/image?url=${imageSrc}&w=16&q=1`,
        }
    const wrapped = shouldOpenWhenClicked
    const image = (
      <NextImage
        src={imageSrc}
        {...maybeBlurProps}
        {...rest}
        priority={isPriority}
        // When wrapped, the link carries the theme class so a hidden link can't sit on top of
        // the visible one (with `fill` both links are absolutely positioned over the image)
        className={cx(className, wrapped ? undefined : themeClasses?.image)}
      />
    )

    if (!wrapped) return image

    return (
      <Link
        href={customLink ? customLink : `${imageSrc}`}
        className={themeClasses?.link}
        style={rest.fill ? { position: 'absolute', inset: 0 } : undefined}
      >
        {image}
      </Link>
    )
  }

  if (!darkSrc) return render(src)

  return (
    <>
      {render(src, { image: LIGHT_ONLY, link: LIGHT_ONLY })}
      {render(darkSrc, { image: DARK_ONLY_IMAGE, link: DARK_ONLY_LINK }, false)}
    </>
  )
}

export default Image
