import { type NextRequest, NextResponse } from 'next/server'

// The tokenizer uses relative asset paths, so it has to be served from /tokenizer/
export function middleware(request: NextRequest) {
  if (request.nextUrl.pathname === '/tokenizer') {
    // A plain URL, as NextURL would strip the trailing slash again
    const url = new URL('/tokenizer/', request.url)
    url.search = request.nextUrl.search
    return NextResponse.redirect(url, 308)
  }
}

export const config = {
  matcher: '/tokenizer',
}
