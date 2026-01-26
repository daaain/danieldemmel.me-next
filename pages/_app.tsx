import '@/css/tailwind.css'
import '@/css/prism.css'
import 'katex/dist/katex.css'
// import '@/css/docsearch.css' // Uncomment if using algolia docsearch
// import '@docsearch/css' // Uncomment if using algolia docsearch
import '@/css/custom.css'

import { ThemeProvider } from 'next-themes'
import type { AppProps } from 'next/app'
import { Bricolage_Grotesque } from 'next/font/google'
import Head from 'next/head'

import LayoutWrapper from '@/components/LayoutWrapper'
import siteMetadata from '@/data/siteMetadata'
import { Analytics } from 'pliny/analytics'
import { SearchProvider } from 'pliny/search'

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-heading',
})

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme={siteMetadata.theme}>
      <Head>
        <meta content="width=device-width, initial-scale=1" name="viewport" />
      </Head>
      <Analytics analyticsConfig={siteMetadata.analytics} />
      <div className={`${bricolage.variable}`}>
        <LayoutWrapper>
          <SearchProvider searchConfig={siteMetadata.search}>
            <Component {...pageProps} />
          </SearchProvider>
        </LayoutWrapper>
      </div>
    </ThemeProvider>
  )
}
