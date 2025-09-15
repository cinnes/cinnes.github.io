import {
  getBlogPosts,
  getBlogPost,
  getFeaturedPosts,
  getPostsByTag,
  mockBlogPosts,
} from '../../lib/blog-data'

describe('Blog Data Functions', () => {
  describe('getBlogPosts', () => {
    it('returns all blog posts sorted by publish date (newest first)', () => {
      const posts = getBlogPosts()

      expect(posts).toHaveLength(3)
      expect(posts[0].title).toBe('Building React Components')
      expect(posts[1].title).toBe('TypeScript Best Practices')
      expect(posts[2].title).toBe('Getting Started with Next.js')
    })
  })

  describe('getBlogPost', () => {
    it('returns a post by slug', () => {
      const post = getBlogPost('getting-started-with-nextjs')

      expect(post).toBeDefined()
      expect(post?.title).toBe('Getting Started with Next.js')
      expect(post?.author).toBe('John Doe')
    })

    it('returns undefined for non-existent slug', () => {
      const post = getBlogPost('non-existent-slug')

      expect(post).toBeUndefined()
    })
  })

  describe('getFeaturedPosts', () => {
    it('returns only featured posts', () => {
      const posts = getFeaturedPosts()

      expect(posts).toHaveLength(1)
      expect(posts[0].title).toBe('Getting Started with Next.js')
      expect(posts[0].featured).toBe(true)
    })
  })

  describe('getPostsByTag', () => {
    it('returns posts with the specified tag', () => {
      const posts = getPostsByTag('react')

      expect(posts).toHaveLength(2)
      expect(posts.some(p => p.title === 'Getting Started with Next.js')).toBe(
        true
      )
      expect(posts.some(p => p.title === 'Building React Components')).toBe(
        true
      )
    })

    it('is case insensitive', () => {
      const posts = getPostsByTag('REACT')

      expect(posts).toHaveLength(2)
    })

    it('returns empty array for non-existent tag', () => {
      const posts = getPostsByTag('non-existent')

      expect(posts).toHaveLength(0)
    })
  })

  describe('mockBlogPosts', () => {
    it('contains valid blog post data', () => {
      expect(mockBlogPosts).toHaveLength(3)

      mockBlogPosts.forEach(post => {
        expect(post.id).toBeDefined()
        expect(post.title).toBeDefined()
        expect(post.excerpt).toBeDefined()
        expect(post.content).toBeDefined()
        expect(post.author).toBeDefined()
        expect(post.publishedAt).toBeInstanceOf(Date)
        expect(post.slug).toBeDefined()
        expect(Array.isArray(post.tags)).toBe(true)
        expect(post.tags.length).toBeGreaterThan(0)
      })
    })
  })
})
