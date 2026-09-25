import Link from 'next/link'
import type { AnchorHTMLAttributes, DetailedHTMLProps } from 'react'

const CustomLink = ({
  href,
  ...rest
}: DetailedHTMLProps<AnchorHTMLAttributes<HTMLAnchorElement>, HTMLAnchorElement>) => {
  const isInternalLink = href?.startsWith('/')
  const isAnchorLink = href?.startsWith('#')
  // Next pages never have a trailing slash on this site, so one means a static
  // folder in public/ (like the tokenizer), which next/link can't route to
  const isStaticFolder = href !== '/' && href?.endsWith('/')

  if (isInternalLink && isStaticFolder) {
    return <a href={href} {...rest} />
  }

  if (isInternalLink) {
    // @ts-ignore
    return <Link href={href} {...rest} />
  }

  if (isAnchorLink) {
    return <a href={href} {...rest} />
  }

  return <a target="_blank" rel="noopener noreferrer" href={href} {...rest} />
}

export default CustomLink
