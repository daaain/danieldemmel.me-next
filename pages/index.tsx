import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import Tag from '@/components/Tag'
import Image from '@/components/Image'
import siteMetadata from '@/data/siteMetadata'
import { formatDate } from 'pliny/utils/formatDate'
import { sortedBlogPost, allCoreContent } from 'pliny/utils/contentlayer'
import type { InferGetStaticPropsType } from 'next'
import { allBlogs } from 'contentlayer/generated'
import type { Blog } from 'contentlayer/generated'

const MAX_DISPLAY = 5

export const getStaticProps = async () => {
  const sortedPosts = sortedBlogPost(allBlogs) as Blog[]
  const posts = allCoreContent(sortedPosts)

  return { props: { posts } }
}

export default function Home({ posts }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pb-8 md:space-y-5">
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            {siteMetadata.description}
          </p>
        </div>
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {!posts.length && 'No posts found.'}
          {posts.slice(0, MAX_DISPLAY).map((post) => {
            const { path, date, title, summary, tags, images, readingTime } = post
            return (
              <li key={path} className="py-4">
                <article>
                  <div className="space-y-2 xl:grid xl:grid-cols-4 xl:items-center xl:space-y-0">
                    {images?.[0] && (
                      <div
                        className="xl:mr-4"
                        style={{ position: 'relative', padding: '70% 0 0 0' }}
                      >
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

                    <div className="space-y-5 xl:col-span-3">
                      <div className="space-y-6">
                        <div>
                          <h2 className="text-2xl font-bold leading-8 tracking-tight">
                            <Link href={`/${path}`} className="text-gray-900 dark:text-gray-100">
                              {title}
                            </Link>
                          </h2>
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
                          <div className="flex flex-wrap">
                            {tags.map((tag) => (
                              <Tag key={tag} text={tag} />
                            ))}
                          </div>
                        </div>
                        <div className="prose max-w-none text-gray-500 dark:text-gray-400">
                          {summary}
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </div>
      {posts.length > MAX_DISPLAY && (
        <div className="flex justify-end text-base font-medium leading-6">
          <Link
            href="/blog"
            className="text-primary-500 hover:text-primary-600 dark:hover:text-primary-400"
            aria-label="All posts"
          >
            All Posts &rarr;
          </Link>
        </div>
      )}
    </>
  )
}
