import type React from 'react'

interface PullQuoteProps {
  children: React.ReactNode
  attribution?: string
}

const PullQuote = ({ children, attribution }: PullQuoteProps) => {
  return (
    <aside className="not-prose my-10 border-l-4 border-[var(--brandgreen)] py-2 pl-6 font-display text-2xl font-medium leading-snug text-gray-800 sm:text-3xl dark:text-gray-100">
      {children}
      {attribution && (
        <footer className="mt-3 text-sm text-gray-500 dark:text-gray-400">
          &mdash; {attribution}
        </footer>
      )}
    </aside>
  )
}

export default PullQuote
