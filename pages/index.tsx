import Image from '@/components/Image'
import Link from '@/components/Link'
import { PageSEO } from '@/components/SEO'
import siteMetadata from '@/data/siteMetadata'
import { allBlogs, allProjects } from 'contentlayer/generated'
import type { Blog, Project } from 'contentlayer/generated'
import type { InferGetStaticPropsType } from 'next'
import { allCoreContent, sortedBlogPost } from 'pliny/utils/contentlayer'
import { formatDate } from 'pliny/utils/formatDate'

const MAX_POSTS = 4

export const getStaticProps = async () => {
  const sortedPosts = sortedBlogPost(allBlogs.filter((post) => post.draft !== true)) as Blog[]
  const posts = allCoreContent(sortedPosts)

  const sortedProjects = sortedBlogPost(
    allProjects.filter((project) => project.draft !== true)
  ) as Project[]
  const projects = allCoreContent(sortedProjects)

  return { props: { posts, projects } }
}

export default function Home({ posts, projects }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <PageSEO title={siteMetadata.title} description={siteMetadata.description} />

      {/* Hero / About Teaser Section */}
      <section className="relative pb-16 pt-8 md:pb-24 md:pt-12">
        <div className="grid gap-8 md:grid-cols-12 md:gap-12">
          {/* Avatar - asymmetric placement */}
          <div className="animate-fade-up order-2 md:order-1 md:col-span-4 md:col-start-1">
            <div className="hero-image-container group relative mx-auto w-48 md:mx-0 md:w-full md:max-w-xs">
              <div className="hero-highlight absolute -bottom-3 -right-3 h-full w-full bg-lime-accent transition-all duration-500 ease-out group-hover:bottom-0 group-hover:right-0" />
              <Image
                src={siteMetadata.image}
                alt={siteMetadata.author}
                width={320}
                height={320}
                className="relative z-10 grayscale transition-all duration-500 ease-out group-hover:grayscale-0"
                shouldOpenWhenClicked={false}
              />
            </div>
          </div>

          {/* Hero text */}
          <div className="animate-fade-up animation-delay-100 order-1 md:order-2 md:col-span-8 md:col-start-5">
            <h1 className="font-display text-5xl font-bold leading-tight tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl lg:text-6xl">
              <span className="relative inline-block">
                Daniel Demmel
                <span className="absolute -bottom-2 left-0 h-3 w-full bg-lime-accent" />
              </span>
            </h1>
            <p className="mt-6 max-w-2xl text-xl leading-relaxed text-gray-600 dark:text-gray-300 md:text-2xl">
              Design technologist and full-stack AI engineer at{' '}
              <Link
                href="https://www.tangible.finance/"
                className="underline decoration-lime-accent decoration-2 underline-offset-2"
              >
                Tangible
              </Link>
              , helping green hardware startups scale through debt, not dilution. Climate tech only
              makes a difference at gigatonne CO₂e scale – I want to help it get there.
            </p>
            <p className="mt-4 max-w-2xl text-lg leading-relaxed text-gray-500 dark:text-gray-400">
              When I'm not crunching contracts with LLMs, I'm probably on a side quest with
              development tooling or down a rabbit hole about metacognition.
            </p>
            <Link
              href="/about"
              className="mt-6 inline-flex items-center gap-2 text-lg font-medium text-gray-900 dark:text-gray-100"
            >
              More about me
              <span className="transition-transform group-hover:translate-x-1">→</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="border-t border-gray-200 py-16 dark:border-gray-700 md:py-24">
        <div className="animate-fade-up animation-delay-200 mb-12 flex items-end justify-between">
          <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
            Projects
          </h2>
          <Link href="/projects" className="text-base font-medium text-gray-600 dark:text-gray-400">
            All projects →
          </Link>
        </div>

        {/* Layout: 2 projects side-by-side, or 2 stacked left + 1 large right for 3+ */}
        {projects.length <= 2 ? (
          <div className="grid gap-8 md:grid-cols-2 md:gap-6">
            {projects.slice(0, 2).map((project, index) => {
              const { path, title, summary, images, projectLink } = project
              const animationDelay = `animation-delay-${(index + 3) * 100}`

              return (
                <article key={path} className={`animate-fade-up ${animationDelay} group`}>
                  {images?.[0] && (
                    <Link href={`/${path}`} className="block">
                      <div
                        className="relative mb-4 overflow-hidden bg-gray-100 dark:bg-gray-800"
                        style={{ paddingBottom: '66%' }}
                      >
                        <Image
                          fill
                          src={images[0]}
                          alt={title}
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          shouldOpenWhenClicked={false}
                        />
                      </div>
                    </Link>
                  )}
                  <h3 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    <Link href={`/${path}`}>{title}</Link>
                  </h3>
                  <p className="mt-2 text-gray-600 dark:text-gray-400">{summary}</p>
                  {projectLink && (
                    <Link
                      href={projectLink}
                      className="mt-3 inline-block font-medium text-lime-700 dark:text-lime-accent"
                    >
                      See it in action →
                    </Link>
                  )}
                </article>
              )
            })}
          </div>
        ) : (
          <div className="grid gap-8 md:grid-cols-12 md:gap-6">
            {/* Left column: 2 small stacked projects */}
            <div className="flex flex-col gap-8 md:col-span-5 md:gap-6">
              {projects.slice(0, 2).map((project, index) => {
                const { path, title, summary, images, projectLink } = project
                const animationDelay = `animation-delay-${(index + 3) * 100}`

                return (
                  <article key={path} className={`animate-fade-up ${animationDelay} group`}>
                    {images?.[0] && (
                      <Link href={`/${path}`} className="block">
                        <div
                          className="relative mb-4 overflow-hidden bg-gray-100 dark:bg-gray-800"
                          style={{ paddingBottom: '56%' }}
                        >
                          <Image
                            fill
                            src={images[0]}
                            alt={title}
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            shouldOpenWhenClicked={false}
                          />
                        </div>
                      </Link>
                    )}
                    <h3 className="font-display text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                      <Link href={`/${path}`}>{title}</Link>
                    </h3>
                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{summary}</p>
                    {projectLink && (
                      <Link
                        href={projectLink}
                        className="mt-2 inline-block text-sm font-medium text-lime-700 dark:text-lime-accent"
                      >
                        See it in action →
                      </Link>
                    )}
                  </article>
                )
              })}
            </div>

            {/* Right column: 1 large featured project */}
            <article className="animate-fade-up animation-delay-500 group md:col-span-7">
              {projects[2].images?.[0] && (
                <Link href={`/${projects[2].path}`} className="block">
                  <div
                    className="relative mb-4 overflow-hidden bg-gray-100 dark:bg-gray-800"
                    style={{ paddingBottom: '75%' }}
                  >
                    <Image
                      fill
                      src={projects[2].images[0]}
                      alt={projects[2].title}
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      shouldOpenWhenClicked={false}
                    />
                  </div>
                </Link>
              )}
              <h3 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-3xl">
                <Link href={`/${projects[2].path}`}>{projects[2].title}</Link>
              </h3>
              <p className="mt-2 text-gray-600 dark:text-gray-400">{projects[2].summary}</p>
              {projects[2].projectLink && (
                <Link
                  href={projects[2].projectLink}
                  className="mt-3 inline-block font-medium text-lime-700 dark:text-lime-accent"
                >
                  See it in action →
                </Link>
              )}
            </article>
          </div>
        )}
      </section>

      {/* Recent Writing Section */}
      <section className="border-t border-gray-200 py-16 dark:border-gray-700 md:py-24">
        <div className="animate-fade-up animation-delay-400 mb-12 flex items-end justify-between">
          <h2 className="font-display text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
            Recent Writing
          </h2>
          <Link href="/blog" className="text-base font-medium text-gray-600 dark:text-gray-400">
            All posts →
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-12 md:gap-6">
          {posts.slice(0, MAX_POSTS).map((post, index) => {
            const { path, date, title, summary, images, readingTime } = post
            const isLead = index === 0

            if (isLead) {
              return (
                <article
                  key={path}
                  className="animate-fade-up animation-delay-500 group md:col-span-12"
                >
                  <div className="grid gap-6 md:grid-cols-12 md:items-center">
                    {images?.[0] && (
                      <Link href={`/${path}`} className="block md:col-span-6">
                        <div
                          className="relative overflow-hidden bg-gray-100 dark:bg-gray-800"
                          style={{ paddingBottom: '66%' }}
                        >
                          <Image
                            fill
                            priority
                            src={images[0]}
                            alt={title}
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                            shouldOpenWhenClicked={false}
                          />
                        </div>
                      </Link>
                    )}
                    <div className={images?.[0] ? 'md:col-span-6' : 'md:col-span-12'}>
                      <div className="mb-2 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                        <span>·</span>
                        <span>{readingTime.text}</span>
                      </div>
                      <h3 className="font-display text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-3xl">
                        <Link href={`/${path}`}>{title}</Link>
                      </h3>
                      <p className="mt-3 text-gray-600 dark:text-gray-400">{summary}</p>
                    </div>
                  </div>
                </article>
              )
            }

            return (
              <article
                key={path}
                className={`animate-fade-up animation-delay-${
                  500 + index * 100
                } group md:col-span-4`}
              >
                {images?.[0] && (
                  <Link href={`/${path}`} className="block">
                    <div
                      className="relative mb-4 overflow-hidden bg-gray-100 dark:bg-gray-800"
                      style={{ paddingBottom: '66%' }}
                    >
                      <Image
                        fill
                        src={images[0]}
                        alt={title}
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        shouldOpenWhenClicked={false}
                      />
                    </div>
                  </Link>
                )}
                <div className="mb-2 flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                  <time dateTime={date}>{formatDate(date, siteMetadata.locale)}</time>
                  <span>·</span>
                  <span>{readingTime.text}</span>
                </div>
                <h3 className="font-display text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
                  <Link href={`/${path}`}>{title}</Link>
                </h3>
              </article>
            )
          })}
        </div>
      </section>
    </>
  )
}
