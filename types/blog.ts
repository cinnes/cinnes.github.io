export interface BlogPost {
  id: string
  title: string
  excerpt: string
  content: string
  author: string
  publishedAt: Date
  updatedAt?: Date
  tags: string[]
  slug: string
  featured?: boolean
}

export interface BlogCategory {
  id: string
  name: string
  slug: string
  description?: string
}

export interface BlogMetadata {
  totalPosts: number
  categories: BlogCategory[]
  tags: string[]
}
