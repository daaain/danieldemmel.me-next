/* eslint-disable react/display-name */
import React from 'react'
import Script from 'next/script'
import { MDXLayout, ComponentMap } from 'pliny/mdx-components'
import { TOCInline } from 'pliny/ui/TOCInline'
import { Pre } from 'pliny/ui/Pre'
import { BlogNewsletterForm } from 'pliny/ui/NewsletterForm'

import Image from './Image'
import CustomLink from './Link'

export const Wrapper = ({ layout, content, ...rest }: MDXLayout) => {
  const Layout = require(`../layouts/${layout}`).default
  return <Layout content={content} {...rest} />
}

export const EmbedPDF = ({ URL, docId }) => (
  <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
    <iframe
      title={`PDF viewer document: ${docId ? docId : URL}`}
      src={`https://drive.google.com/viewerng/viewer?url=${
        docId ? `https://drive.google.com/uc?id=${docId}&embedded=true` : URL
      }&pid=explorer&efh=false&a=v&chrome=false&embedded=true`}
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
    ></iframe>
  </div>
)

export const EmbedVimeo = ({ code, hash }) => (
  <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
    <iframe
      src={`https://player.vimeo.com/video/${code}?color=c9ff23&h=${hash}&badge=0&autopause=0&player_id=0&app_id=58479`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
      title={code}
    ></iframe>
    <Script src="https://player.vimeo.com/api/player.js" />
  </div>
)

export const EmbedYoutube = ({ code, hash }) => (
  <div style={{ padding: '56.25% 0 0 0', position: 'relative' }}>
    <iframe
      src={`https://www.youtube-nocookie.com/embed/${code}?si=${hash}`}
      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
      allowFullScreen
      style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
      title={code}
    ></iframe>
    <Script src="https://player.vimeo.com/api/player.js" />
  </div>
)

export const MDXComponents: ComponentMap = {
  Image,
  TOCInline,
  a: CustomLink,
  pre: Pre,
  wrapper: Wrapper,
  BlogNewsletterForm,
  EmbedPDF,
  EmbedVimeo,
}
