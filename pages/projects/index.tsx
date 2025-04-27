import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { PageSEO } from '@/components/SEO'
import { sortedBlogPost, allCoreContent } from 'pliny/utils/contentlayer'
import type { InferGetStaticPropsType } from 'next'
import { allProjects } from 'contentlayer/generated'
import type { Project } from 'contentlayer/generated'

export const POSTS_PER_PAGE = 10

export const getStaticProps = async () => {
  const projects = sortedBlogPost(allProjects) as Project[]
  const initialDisplayProjects = projects.slice(0, POSTS_PER_PAGE)
  const pagination = {
    currentPage: 1,
    totalPages: Math.ceil(projects.length / POSTS_PER_PAGE),
  }

  return {
    props: {
      initialDisplayProjects: allCoreContent(initialDisplayProjects),
      projects: allCoreContent(projects),
      pagination,
    },
  }
}

export default function ProjectsPage({
  projects,
  initialDisplayProjects,
  pagination,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO title={`Blog - ${siteMetadata.author}`} description={siteMetadata.description} />
      <ListLayout
        posts={projects}
        initialDisplayPosts={initialDisplayProjects}
        pagination={pagination}
        title="All Projects"
        hideTags={true}
      />
    </>
  )
}
