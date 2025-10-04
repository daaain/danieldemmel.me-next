const { withContentlayer } = require('next-contentlayer')

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

// You might need to insert additional domains in script-src if you are using external services
const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' giscus.app *.vimeo.com;
  style-src 'self' 'unsafe-inline' giscus.app;
  img-src * blob: data:;
  media-src 'none';
  connect-src *;
  font-src 'self';
  frame-src giscus.app *.vimeo.com *.youtube-nocookie.com drive.google.com jsfiddle.net;
`

const securityHeaders = [
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
  {
    key: 'Content-Security-Policy',
    value: ContentSecurityPolicy.replace(/\n/g, ''),
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
  {
    key: 'Referrer-Policy',
    value: 'strict-origin-when-cross-origin',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=31536000; includeSubDomains',
  },
  // https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Feature-Policy
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()',
  },
]

/**
 * @type {import('next/dist/next-server/server/config').NextConfig}
 **/
module.exports = () => {
  const plugins = [withContentlayer, withBundleAnalyzer]
  return plugins.reduce((acc, next) => next(acc), {
    reactStrictMode: true,
    pageExtensions: ['ts', 'tsx', 'js', 'jsx', 'md', 'mdx'],
    eslint: {
      dirs: ['pages', 'components', 'lib', 'layouts', 'scripts'],
    },
    async headers() {
      return [
        {
          source: '/(.*)',
          headers: securityHeaders,
        },
      ]
    },
    webpack: (config, options) => {
      config.module.rules.push({
        test: /\.svg$/,
        use: ['@svgr/webpack'],
      })

      return config
    },
    async redirects() {
      return [
        {
          source: '/authors/daniel-demmel',
          destination: '/about',
          permanent: true,
        },
        {
          source:
            '/blog/2012/09/02/setting-up-rmate-with-sublime-text-for-remote-file-editing-over-ssh',
          destination: '/blog/setting-up-rmate-with-sublime-text-for-remote-file-editing-over-ssh',
          permanent: true,
        },
        {
          source:
            '/blog/2021/08/08/safely-access-your-home-nas-anywhere-with-an-openvpn-server-on-gcp',
          destination: '/blog/safely-access-your-home-nas-with-an-openvpn-server-on-gcp',
          permanent: true,
        },
        {
          source: '/blog/2017/07/12/Give-app-servers-a-REST-CDNs-and-APIs-are-the-new-LAMP',
          destination: '/blog/Give-app-servers-a-REST-CDNs-and-APIs-are-the-new-LAMP',
          permanent: true,
        },
        {
          source: '/blog/2017/07/12/give-app-servers-a-rest-cdns-and-apis-are-the-new-lamp',
          destination: '/blog/Give-app-servers-a-REST-CDNs-and-APIs-are-the-new-LAMP',
          permanent: true,
        },
        {
          source: '/blog/2017/07/04/creative-lives-interview',
          destination: '/blog/creative-lives-interview',
          permanent: true,
        },
        {
          source: '/blog/2015/11/28/why_and_how_github_should_have_binary_diffs',
          destination: '/blog/why-and-how-github-should-have-binary-diffs',
          permanent: true,
        },
        {
          source: '/blog/2015/11/28/why-and-how-github-should-have-binary-diffs',
          destination: '/blog/why-and-how-github-should-have-binary-diffs',
          permanent: true,
        },
        {
          source: '/blog/2015/08/31/finding-an-affordable-electric-family-cargo-bike-in-london',
          destination: '/blog/finding-an-affordable-electric-family-cargo-bike-in-london',
          permanent: true,
        },
        {
          source: '/blog/2015/08/14/containerise-everything',
          destination: '/blog/containerise-everything',
          permanent: true,
        },
        {
          source:
            '/blog/2012/09/03/some-thoughts-on-the-fragile-relationship-between-nature-conservation-and-economic-growth',
          destination:
            '/blog/some-thoughts-on-the-fragile-relationship-between-nature-conservation-and-economic-growth',
          permanent: true,
        },
        {
          source:
            '/blog/2013/01/18/getting-cross-origin-resource-sharing-with-complex-jquery-ajax-requests',
          destination:
            '/blog/getting-cross-origin-resource-sharing-with-complex-jquery-ajax-requests',
          permanent: true,
        },
        {
          source: '/blog/2013/03/22/an-introduction-to-jquery-deferred-slash-promise',
          destination: '/blog/an-introduction-to-jquery-deferred-slash-promise',
          permanent: true,
        },
        {
          source:
            '/blog/2013/03/22/an-introduction-to-jquery-deferred-promise-and-the-design-pattern-in-general',
          destination: '/blog/an-introduction-to-jquery-deferred-slash-promise',
          permanent: true,
        },
        {
          source: '/blog/2014/01/19/build-your-minimum-viable-product',
          destination: '/blog/build-your-minimum-viable-product',
          permanent: true,
        },
        {
          source: '/blog/2014/04/13/why-you-not-henry-ford-should-design-your-working-life',
          destination: '/blog/why-you-not-henry-ford-should-design-your-working-life',
          permanent: true,
        },
        {
          source: '/blog/2015/08/16/indiewebify-yourself',
          destination: '/blog/indiewebify-yourself',
          permanent: true,
        },
        {
          source: '/projects/flaunt-it/index.html',
          destination: '/projects-static/flaunt-it/index.html',
          permanent: true,
        },
        {
          source: '/tokenizer.html',
          destination: '/tokenizer/',
          permanent: true,
        },
      ]
    },
    async rewrites() {
      return [
        {
          source: '/tokenizer',
          destination: '/tokenizer/index.html',
        },
        {
          source: '/tokenizer/',
          destination: '/tokenizer/index.html',
        },
        {
          source: '/tokenizer.css',
          destination: '/tokenizer/tokenizer.css',
        },
        {
          source: '/tokenizer.js',
          destination: '/tokenizer/tokenizer.js',
        },
        {
          source: '/transformers.js',
          destination: '/tokenizer/transformers.js',
        },
        {
          source: '/favicons/token.svg',
          destination: '/tokenizer/favicons/token.svg',
        },
      ]
    },
  })
}
