import { MDXComponents } from '@/components/MDXComponents'
import AuthorLayout from '@/layouts/AuthorLayout'
import { allAuthors } from 'contentlayer2/generated'
import type { InferGetStaticPropsType } from 'next'
import { useMDXComponent } from 'pliny/mdx-components'

export const getStaticProps = async () => {
  const author = allAuthors.find((p) => p.slug === 'default')
  return { props: { author } }
}

export default function About({ author }: InferGetStaticPropsType<typeof getStaticProps>) {
  const MDXContent = useMDXComponent(author.body.code)

  return (
    <AuthorLayout content={author}>
      <MDXContent components={MDXComponents} />
    </AuthorLayout>
  )
}
