import { MDXComponents } from '@/components/MDXComponents'
import PageTitle from '@/components/PageTitle'
import PostLayout from '@/layouts/PostLayout'
import PostSimple from '@/layouts/PostSimple'
import { allAuthors, allBlogs } from 'contentlayer2/generated'
import type { Blog } from 'contentlayer2/generated'
import type { InferGetStaticPropsType } from 'next'
import { useMDXComponent } from 'pliny/mdx-components'
import { coreContent, sortedBlogPost } from 'pliny/utils/contentlayer'

const layouts = { PostLayout, PostSimple }

export async function getStaticPaths() {
  return {
    paths: allBlogs.map((p) => ({ params: { slug: p.slug.split('/') } })),
    fallback: false,
  }
}

export const getStaticProps = async ({ params }) => {
  const slug = (params.slug as string[]).join('/')
  const sortedPosts = sortedBlogPost(allBlogs) as Blog[]
  const postIndex = sortedPosts.findIndex((p) => p.slug === slug)
  const prevContent = sortedPosts[postIndex + 1] || null
  const prev = prevContent ? coreContent(prevContent) : null
  const nextContent = sortedPosts[postIndex - 1] || null
  const next = nextContent ? coreContent(nextContent) : null
  const post = sortedPosts.find((p) => p.slug === slug)
  const authorList = post.authors || ['default']
  const authorDetails = authorList.map((author) => {
    const authorResults = allAuthors.find((p) => p.slug === author)
    return coreContent(authorResults)
  })

  return {
    props: {
      post,
      authorDetails,
      prev,
      next,
    },
  }
}

export default function BlogPostPage({
  post,
  authorDetails,
  prev,
  next,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const MDXContent = useMDXComponent(post.body.code)
  const Layout = layouts[post.layout || 'PostLayout']

  return (
    <>
      {'draft' in post && post.draft === true ? (
        <div className="mt-24 text-center">
          <PageTitle>
            Under Construction{' '}
            <span role="img" aria-label="roadwork sign">
              🚧
            </span>
          </PageTitle>
        </div>
      ) : (
        <Layout
          content={coreContent(post)}
          toc={post.toc}
          authorDetails={authorDetails}
          prev={prev}
          next={next}
        >
          <MDXContent components={MDXComponents} />
        </Layout>
      )}
    </>
  )
}
