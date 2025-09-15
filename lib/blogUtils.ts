import { BlogPost } from '../types/blog'

export function filterPostsByTag(
  posts: BlogPost[],
  tag: string | null
): BlogPost[] {
  if (!tag) return posts
  return posts.filter(post => post.tags.includes(tag))
}

export function filterPostsBySearch(
  posts: BlogPost[],
  query: string
): BlogPost[] {
  if (!query.trim()) return posts

  const searchTerm = query.toLowerCase().trim()
  return posts.filter(
    post =>
      post.title.toLowerCase().includes(searchTerm) ||
      post.excerpt.toLowerCase().includes(searchTerm) ||
      post.content.toLowerCase().includes(searchTerm) ||
      post.tags.some(tag => tag.toLowerCase().includes(searchTerm)) ||
      post.author.toLowerCase().includes(searchTerm)
  )
}

export function sortPostsByDate(
  posts: BlogPost[],
  featuredFirst: boolean = false
): BlogPost[] {
  const sorted = [...posts].sort((a, b) => {
    if (featuredFirst) {
      if (a.featured && !b.featured) return -1
      if (!a.featured && b.featured) return 1
    }
    return b.publishedAt.getTime() - a.publishedAt.getTime()
  })

  return sorted
}

export function getAllTags(posts: BlogPost[]): string[] {
  const tagSet = new Set<string>()
  posts.forEach(post => {
    post.tags.forEach(tag => tagSet.add(tag))
  })
  return Array.from(tagSet).sort()
}

export function paginatePosts(
  posts: BlogPost[],
  page: number,
  pageSize: number = 10
): {
  posts: BlogPost[]
  totalPages: number
  currentPage: number
  hasNext: boolean
  hasPrevious: boolean
} {
  const totalPosts = posts.length
  const totalPages = Math.ceil(totalPosts / pageSize)
  const currentPage = Math.max(1, Math.min(page, totalPages))

  const startIndex = (currentPage - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedPosts = posts.slice(startIndex, endIndex)

  return {
    posts: paginatedPosts,
    totalPages,
    currentPage,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
  }
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function getRelatedPosts(
  currentPost: BlogPost,
  allPosts: BlogPost[],
  limit: number = 3
): BlogPost[] {
  const otherPosts = allPosts.filter(post => post.id !== currentPost.id)

  const postsWithScore = otherPosts.map(post => {
    let score = 0

    // Score based on shared tags
    const sharedTags = post.tags.filter(tag => currentPost.tags.includes(tag))
    score += sharedTags.length * 2

    // Score based on same author
    if (post.author === currentPost.author) {
      score += 1
    }

    // Score based on recency (posts within 30 days get bonus)
    const daysDiff =
      Math.abs(post.publishedAt.getTime() - currentPost.publishedAt.getTime()) /
      (1000 * 60 * 60 * 24)
    if (daysDiff <= 30) {
      score += 1
    }

    return { post, score }
  })

  return postsWithScore
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(item => item.post)
}
