export function kebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .toLowerCase()
}

interface TaggableDocument {
  tags?: string[]
  draft?: boolean
}

export function getAllTags(allContent: TaggableDocument[]): Record<string, number> {
  const tagCount: Record<string, number> = {}
  for (const file of allContent) {
    if (file.tags && file.draft !== true) {
      for (const tag of file.tags) {
        const formattedTag = kebabCase(tag)
        tagCount[formattedTag] = (tagCount[formattedTag] || 0) + 1
      }
    }
  }
  return tagCount
}
