import {
  filterPostsByTag,
  filterPostsBySearch,
  sortPostsByDate,
  getAllTags,
  paginatePosts,
  formatDate,
  generateSlug,
  getRelatedPosts,
} from '../../lib/blogUtils'
import { BlogPost } from '../../types/blog'

const mockPosts: BlogPost[] = [
  {
    id: '1',
    title: 'React Best Practices',
    excerpt: 'Learn the best practices for React development',
    content: 'React is a powerful library for building user interfaces...',
    author: 'John Doe',
    publishedAt: new Date('2024-01-15'),
    tags: ['react', 'javascript', 'frontend'],
    slug: 'react-best-practices',
    featured: true,
  },
  {
    id: '2',
    title: 'TypeScript Guide',
    excerpt: 'Complete guide to TypeScript',
    content: 'TypeScript adds static typing to JavaScript...',
    author: 'Jane Smith',
    publishedAt: new Date('2024-01-10'),
    tags: ['typescript', 'javascript'],
    slug: 'typescript-guide',
    featured: false,
  },
  {
    id: '3',
    title: 'Next.js Tutorial',
    excerpt: 'Building full-stack apps with Next.js',
    content:
      'Next.js is a React framework that enables server-side rendering...',
    author: 'John Doe',
    publishedAt: new Date('2024-01-20'),
    tags: ['nextjs', 'react', 'fullstack'],
    slug: 'nextjs-tutorial',
    featured: false,
  },
  {
    id: '4',
    title: 'CSS Animations',
    excerpt: 'Creating smooth animations with CSS',
    content: 'CSS animations can bring your websites to life...',
    author: 'Bob Wilson',
    publishedAt: new Date('2024-01-05'),
    tags: ['css', 'animations', 'frontend'],
    slug: 'css-animations',
    featured: false,
  },
]

describe('blogUtils', () => {
  describe('filterPostsByTag', () => {
    it('returns all posts when tag is null', () => {
      const result = filterPostsByTag(mockPosts, null)
      expect(result).toEqual(mockPosts)
    })

    it('filters posts by specific tag', () => {
      const result = filterPostsByTag(mockPosts, 'react')
      expect(result).toHaveLength(2)
      expect(result.map(p => p.id)).toEqual(['1', '3'])
    })

    it('returns empty array when no posts match tag', () => {
      const result = filterPostsByTag(mockPosts, 'nonexistent')
      expect(result).toEqual([])
    })
  })

  describe('filterPostsBySearch', () => {
    it('returns all posts when query is empty', () => {
      const result = filterPostsBySearch(mockPosts, '')
      expect(result).toEqual(mockPosts)
    })

    it('returns all posts when query is whitespace', () => {
      const result = filterPostsBySearch(mockPosts, '   ')
      expect(result).toEqual(mockPosts)
    })

    it('filters posts by title', () => {
      const result = filterPostsBySearch(mockPosts, 'Best Practices')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('1')
    })

    it('filters posts by excerpt', () => {
      const result = filterPostsBySearch(mockPosts, 'Complete guide')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })

    it('filters posts by content', () => {
      const result = filterPostsBySearch(mockPosts, 'server-side rendering')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('3')
    })

    it('filters posts by tag', () => {
      const result = filterPostsBySearch(mockPosts, 'frontend')
      expect(result).toHaveLength(2)
      expect(result.map(p => p.id)).toEqual(['1', '4'])
    })

    it('filters posts by author', () => {
      const result = filterPostsBySearch(mockPosts, 'John Doe')
      expect(result).toHaveLength(2)
      expect(result.map(p => p.id)).toEqual(['1', '3'])
    })

    it('is case insensitive', () => {
      const result = filterPostsBySearch(mockPosts, 'TYPESCRIPT')
      expect(result).toHaveLength(1)
      expect(result[0].id).toBe('2')
    })
  })

  describe('sortPostsByDate', () => {
    it('sorts posts by date in descending order', () => {
      const result = sortPostsByDate(mockPosts)
      expect(result.map(p => p.id)).toEqual(['3', '1', '2', '4'])
    })

    it('sorts featured posts first when featuredFirst is true', () => {
      const result = sortPostsByDate(mockPosts, true)
      expect(result.map(p => p.id)).toEqual(['1', '3', '2', '4'])
    })

    it('does not mutate original array', () => {
      const original = [...mockPosts]
      sortPostsByDate(mockPosts)
      expect(mockPosts).toEqual(original)
    })
  })

  describe('getAllTags', () => {
    it('returns all unique tags sorted alphabetically', () => {
      const result = getAllTags(mockPosts)
      expect(result).toEqual([
        'animations',
        'css',
        'frontend',
        'fullstack',
        'javascript',
        'nextjs',
        'react',
        'typescript',
      ])
    })

    it('returns empty array for empty posts', () => {
      const result = getAllTags([])
      expect(result).toEqual([])
    })
  })

  describe('paginatePosts', () => {
    it('paginates posts correctly', () => {
      const result = paginatePosts(mockPosts, 1, 2)

      expect(result.posts).toHaveLength(2)
      expect(result.posts.map(p => p.id)).toEqual(['1', '2'])
      expect(result.totalPages).toBe(2)
      expect(result.currentPage).toBe(1)
      expect(result.hasNext).toBe(true)
      expect(result.hasPrevious).toBe(false)
    })

    it('handles last page correctly', () => {
      const result = paginatePosts(mockPosts, 2, 3)

      expect(result.posts).toHaveLength(1)
      expect(result.posts[0].id).toBe('4')
      expect(result.totalPages).toBe(2)
      expect(result.currentPage).toBe(2)
      expect(result.hasNext).toBe(false)
      expect(result.hasPrevious).toBe(true)
    })

    it('handles page number out of bounds', () => {
      const result = paginatePosts(mockPosts, 10, 2)

      expect(result.currentPage).toBe(2) // Should clamp to max page
      expect(result.totalPages).toBe(2)
    })

    it('handles negative page number', () => {
      const result = paginatePosts(mockPosts, -1, 2)

      expect(result.currentPage).toBe(1) // Should clamp to min page
    })

    it('uses default page size of 10', () => {
      const result = paginatePosts(mockPosts, 1)

      expect(result.posts).toHaveLength(4) // All posts fit in one page
      expect(result.totalPages).toBe(1)
    })
  })

  describe('formatDate', () => {
    it('formats date correctly', () => {
      const date = new Date('2024-01-15')
      const result = formatDate(date)
      expect(result).toBe('January 15, 2024')
    })
  })

  describe('generateSlug', () => {
    it('generates slug from title', () => {
      const result = generateSlug('React Best Practices')
      expect(result).toBe('react-best-practices')
    })

    it('handles special characters', () => {
      const result = generateSlug('React & TypeScript: A Complete Guide!')
      expect(result).toBe('react-typescript-a-complete-guide')
    })

    it('handles multiple spaces', () => {
      const result = generateSlug('React    Best     Practices')
      expect(result).toBe('react-best-practices')
    })

    it('handles leading and trailing special characters', () => {
      const result = generateSlug('!!!React Best Practices!!!')
      expect(result).toBe('react-best-practices')
    })
  })

  describe('getRelatedPosts', () => {
    it('returns related posts based on shared tags', () => {
      const currentPost = mockPosts[0] // React post with tags: react, javascript, frontend
      const result = getRelatedPosts(currentPost, mockPosts, 2)

      expect(result).toHaveLength(2)
      expect(result[0].id).toBe('3') // Next.js post shares 'react' tag
      expect(result[1].id).toBe('2') // TypeScript post shares 'javascript' tag
    })

    it('excludes the current post from results', () => {
      const currentPost = mockPosts[0]
      const result = getRelatedPosts(currentPost, mockPosts)

      expect(result.map(p => p.id)).not.toContain('1')
    })

    it('limits results to specified limit', () => {
      const currentPost = mockPosts[0]
      const result = getRelatedPosts(currentPost, mockPosts, 1)

      expect(result).toHaveLength(1)
    })

    it('handles when there are fewer posts than limit', () => {
      const currentPost = mockPosts[0]
      const result = getRelatedPosts(
        currentPost,
        [mockPosts[0], mockPosts[1]],
        5
      )

      expect(result).toHaveLength(1) // Only one other post available
    })

    it('returns empty array when no other posts exist', () => {
      const currentPost = mockPosts[0]
      const result = getRelatedPosts(currentPost, [mockPosts[0]])

      expect(result).toEqual([])
    })
  })
})
