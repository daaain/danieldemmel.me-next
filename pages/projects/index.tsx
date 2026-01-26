import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import ListLayout from '@/layouts/ListLayout'
import { allProjects } from 'contentlayer/generated'
import type { Project } from 'contentlayer/generated'
import type { InferGetStaticPropsType } from 'next'
import { allCoreContent, sortedBlogPost } from 'pliny/utils/contentlayer'

export const POSTS_PER_PAGE = 10

export const getStaticProps = async () => {
  const projects = sortedBlogPost(
    allProjects.filter((project) => project.draft !== true)
  ) as Project[]
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
