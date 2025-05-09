import { useState } from 'react'
import { useRouter } from 'next/router'
import { formatDate } from 'pliny/utils/formatDate'
import { CoreContent } from 'pliny/utils/contentlayer'
import type { Blog, Project } from 'contentlayer/generated'
import Link from '@/components/Link'
import Tag from '@/components/Tag'
import Image from '@/components/Image'
import siteMetadata from '@/data/siteMetadata'

interface PaginationProps {
  totalPages: number
  currentPage: number
}
interface ListLayoutProps {
  posts: CoreContent<Blog | Project>[]
  title: string
  initialDisplayPosts?: CoreContent<Blog | Project>[]
  pagination?: PaginationProps
  hideTags?: boolean
}

function Pagination({ totalPages, currentPage }: PaginationProps) {
  const router = useRouter()
  const basePath = router.pathname.split('/')[1]
  const prevPage = currentPage - 1 > 0
  const nextPage = currentPage + 1 <= totalPages

  return (
    <div className="space-y-2 pt-6 pb-8 md:space-y-5">
      <nav className="flex justify-between">
        {prevPage ? (
          <Link
            href={currentPage - 1 === 1 ? `/${basePath}/` : `/${basePath}/page/${currentPage - 1}`}
            rel="prev"
          >
            Previous
          </Link>
        ) : (
          <span className="opacity-50">Previous</span>
        )}
        <span>
          {currentPage} of {totalPages}
        </span>
        {nextPage ? (
          <Link href={`/${basePath}/page/${currentPage + 1}`} rel="next">
            Next
          </Link>
        ) : (
          <span className="opacity-50">Next</span>
        )}
      </nav>
    </div>
  )
}

export function PostList({ filteredBlogPosts, displayPosts, hideTags }) {
  return (
    <ul className="divide-y divide-gray-200 dark:divide-gray-700">
      {!filteredBlogPosts.length && 'No entries found.'}
      {displayPosts.map((post) => {
        const { path, date, title, summary, tags, images, readingTime } = post
        return (
          <li key={path} className="py-4">
            <article className="space-y-2 xl:grid xl:grid-cols-4 xl:items-center xl:space-y-0">
              {images?.[0] && (
                <div className="xl:mr-4" style={{ position: 'relative', padding: '70% 0 0 0' }}>
                  <Image
                    fill
                    src={images[0]}
                    customLink={`/${path}`}
                    alt="Hero image"
                    style={{
                      objectFit: 'cover',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: '100%',
                    }}
                  />
                </div>
              )}
              <div className="space-y-3 xl:col-span-3">
                <div>
                  <h3 className="text-2xl font-bold leading-8 tracking-tight">
                    <Link href={`/${path}`} className="text-gray-900 dark:text-gray-100">
                      {title}
                    </Link>
                  </h3>
                  <dl className="flex flex-wrap gap-6">
                    <div>
                      <dt className="sr-only">Published on</dt>
                      <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                      </dd>
                    </div>
                    <div>
                      <dt className="sr-only">Reading time</dt>
                      <dd className="text-base font-medium leading-6 text-gray-500 dark:text-gray-400">
                        {readingTime.text}
                      </dd>
                    </div>
                  </dl>
                  {!hideTags && (
                    <div className="flex flex-wrap">
                      {tags.map((tag) => (
                        <Tag key={tag} text={tag} />
                      ))}
                    </div>
                  )}
                </div>
                <div className="prose max-w-none text-gray-500 dark:text-gray-400">{summary}</div>
              </div>
            </article>
          </li>
        )
      })}
    </ul>
  )
}

export default function ListLayout({
  posts,
  title,
  initialDisplayPosts = [],
  pagination,
  hideTags = false,
}: ListLayoutProps) {
  const [searchValue, setSearchValue] = useState('')
  const filteredBlogPosts = posts.filter((post) => {
    const searchContent = post.title + post.summary + post.tags.join(' ')
    return searchContent.toLowerCase().includes(searchValue.toLowerCase())
  })

  // If initialDisplayPosts exist, display it if no searchValue is specified
  const displayPosts =
    initialDisplayPosts.length > 0 && !searchValue ? initialDisplayPosts : filteredBlogPosts

  return (
    <>
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            {title}
          </h1>
          <div className="relative max-w-lg">
            <label>
              <span className="sr-only">Search articles</span>
              <input
                aria-label="Search articles"
                type="text"
                onChange={(e) => setSearchValue(e.target.value)}
                placeholder="Search articles"
                className="block w-full rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 focus:border-primary-500 focus:ring-primary-500 dark:border-gray-900 dark:bg-gray-800 dark:text-gray-100"
              />
            </label>
            <svg
              className="absolute right-3 top-3 h-5 w-5 text-gray-400 dark:text-gray-300"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
        <PostList
          filteredBlogPosts={filteredBlogPosts}
          displayPosts={displayPosts}
          hideTags={hideTags}
        />
      </div>
      {pagination && pagination.totalPages > 1 && !searchValue && (
        <Pagination currentPage={pagination.currentPage} totalPages={pagination.totalPages} />
      )}
    </>
  )
}
