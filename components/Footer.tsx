import Link from './Link'
import siteMetadata from '@/data/siteMetadata'
import SocialIcon from '@/components/social-icons'
import { NewsletterForm } from 'pliny/ui/NewsletterForm'

const ICON_SIZE = 8

export default function Footer() {
  return (
    <footer>
      <div className="h-card mt-12 flex flex-col items-center">
        {siteMetadata.newsletter.provider && (
          <div className="mb-6 flex items-center justify-center">
            <NewsletterForm />
          </div>
        )}
        <div className="mb-3 flex space-x-4">
          <SocialIcon
            className="u-email"
            kind="mail"
            href={`mailto:${siteMetadata.email}`}
            size={ICON_SIZE}
          />
          <SocialIcon kind="github" href={siteMetadata.github} size={ICON_SIZE} />
          <SocialIcon kind="facebook" href={siteMetadata.facebook} size={ICON_SIZE} />
          <SocialIcon kind="youtube" href={siteMetadata.youtube} size={ICON_SIZE} />
          <SocialIcon kind="linkedin" href={siteMetadata.linkedin} size={ICON_SIZE} />
          <SocialIcon kind="twitter" href={siteMetadata.twitter} size={ICON_SIZE} />
          <SocialIcon kind="mastodon" href={siteMetadata.mastodon} size={ICON_SIZE} />
        </div>
        <div className="mb-2 flex space-x-2 text-sm text-gray-500 dark:text-gray-400">
          <div className="p-name">{siteMetadata.author}</div>
          <div>{` • `}</div>
          <div>{`CC BY-SA 4.0 ${new Date().getFullYear()}`}</div>
          <div>{` • `}</div>
          <Link className="u-url u-uid" href="/">
            {siteMetadata.title}
          </Link>
        </div>
        <div className="mb-8 text-sm text-gray-500 dark:text-gray-400">
          <Link href="https://github.com/daaain/danieldemmel.me-next">Open source on Github</Link>
        </div>
      </div>
    </footer>
  )
}
