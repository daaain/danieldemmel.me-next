import { MDXComponents } from '@/components/MDXComponents'
import { allAuthors } from 'contentlayer/generated'
// import { MDXLayoutRenderer } from '@/components/MDXComponents'
import type { InferGetStaticPropsType } from 'next'
import { MDXLayoutRenderer } from 'pliny/mdx-components'

const DEFAULT_LAYOUT = 'AuthorLayout'

export const getStaticProps = async () => {
  const author = allAuthors.find((p) => p.slug === 'default')
  return { props: { author } }
}

export default function About({ author }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <MDXLayoutRenderer
      layout={author.layout || DEFAULT_LAYOUT}
      content={author}
      MDXComponents={MDXComponents}
    />
  )
}
