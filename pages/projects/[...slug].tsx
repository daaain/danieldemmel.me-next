import { MDXComponents } from '@/components/MDXComponents'
import PageTitle from '@/components/PageTitle'
import { allAuthors, allProjects } from 'contentlayer/generated'
import type { Project } from 'contentlayer/generated'
import type { InferGetStaticPropsType } from 'next'
import { MDXLayoutRenderer } from 'pliny/mdx-components'
import { coreContent, sortedBlogPost } from 'pliny/utils/contentlayer'

const DEFAULT_LAYOUT = 'ProjectLayout'

export async function getStaticPaths() {
  return {
    paths: allProjects.map((p) => ({ params: { slug: p.slug.split('/') } })),
    fallback: false,
  }
}

export const getStaticProps = async ({ params }) => {
  const slug = (params.slug as string[]).join('/')
  const sortedProjects = sortedBlogPost(allProjects) as Project[]
  const postIndex = sortedProjects.findIndex((p) => p.slug === slug)
  const prevContent = sortedProjects[postIndex + 1] || null
  const prev = prevContent ? coreContent(prevContent) : null
  const nextContent = sortedProjects[postIndex - 1] || null
  const next = nextContent ? coreContent(nextContent) : null
  const post = sortedProjects.find((p) => p.slug === slug)
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

export default function ProjectPage({
  post,
  authorDetails,
  prev,
  next,
}: InferGetStaticPropsType<typeof getStaticProps>) {
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
        <MDXLayoutRenderer
          layout={post.layout || DEFAULT_LAYOUT}
          content={post}
          MDXComponents={MDXComponents}
          toc={post.toc}
          authorDetails={authorDetails}
          prev={prev}
          next={next}
        />
      )}
    </>
  )
}
