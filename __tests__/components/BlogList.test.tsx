import { render, screen } from '@testing-library/react'
import BlogList from '../../components/BlogList'
import { BlogPost as BlogPostType } from '../../types/blog'

const mockPosts: BlogPostType[] = [
  {
    id: '1',
    title: 'First Post',
    excerpt: 'First post excerpt',
    content: 'First post content',
    author: 'Author 1',
    publishedAt: new Date('2024-01-15'),
    tags: ['tag1'],
    slug: 'first-post',
    featured: false,
  },
  {
    id: '2',
    title: 'Featured Post',
    excerpt: 'Featured post excerpt',
    content: 'Featured post content',
    author: 'Author 2',
    publishedAt: new Date('2024-01-10'),
    tags: ['tag2'],
    slug: 'featured-post',
    featured: true,
  },
  {
    id: '3',
    title: 'Latest Post',
    excerpt: 'Latest post excerpt',
    content: 'Latest post content',
    author: 'Author 3',
    publishedAt: new Date('2024-01-20'),
    tags: ['tag3'],
    slug: 'latest-post',
    featured: false,
  },
]

describe('BlogList Component', () => {
  it('renders all blog posts', () => {
    render(<BlogList posts={mockPosts} />)

    expect(screen.getByText('First Post')).toBeInTheDocument()
    expect(screen.getByText('Featured Post')).toBeInTheDocument()
    expect(screen.getByText('Latest Post')).toBeInTheDocument()
  })

  it('displays title when provided', () => {
    render(<BlogList posts={mockPosts} title="Recent Posts" />)

    expect(screen.getByText('Recent Posts')).toBeInTheDocument()
  })

  it('shows post count', () => {
    render(<BlogList posts={mockPosts} title="Blog Posts" />)

    expect(screen.getByText('3 posts')).toBeInTheDocument()
  })

  it('shows singular form for single post', () => {
    render(<BlogList posts={[mockPosts[0]]} title="Blog Posts" />)

    expect(screen.getByText('1 post')).toBeInTheDocument()
  })

  it('does not show title section when title not provided', () => {
    render(<BlogList posts={mockPosts} />)

    // Should not show the header with post count
    expect(screen.queryByText('Blog Posts')).not.toBeInTheDocument()
    // But should show footer count
    expect(screen.getByText('Showing 3 of 3 posts')).toBeInTheDocument()
  })

  it('sorts featured posts first when showFeaturedFirst is true', () => {
    render(<BlogList posts={mockPosts} showFeaturedFirst={true} />)

    const articles = screen.getAllByRole('article')
    const firstArticleTitle = articles[0].querySelector('h2')?.textContent

    expect(firstArticleTitle).toBe('Featured Post')
  })

  it('maintains chronological order when showFeaturedFirst is false', () => {
    render(<BlogList posts={mockPosts} showFeaturedFirst={false} />)

    const articles = screen.getAllByRole('article')
    const firstArticleTitle = articles[0].querySelector('h2')?.textContent

    // Should be "Latest Post" as it's the most recent by date
    expect(firstArticleTitle).toBe('Latest Post')
  })

  it('shows empty state when no posts provided', () => {
    render(<BlogList posts={[]} />)

    expect(screen.getByText('Blog Posts')).toBeInTheDocument()
    expect(screen.getByText('No blog posts found.')).toBeInTheDocument()
  })

  it('shows custom empty message', () => {
    render(
      <BlogList
        posts={[]}
        title="Custom Title"
        emptyMessage="No posts available at the moment."
      />
    )

    expect(screen.getByText('Custom Title')).toBeInTheDocument()
    expect(
      screen.getByText('No posts available at the moment.')
    ).toBeInTheDocument()
  })

  it('shows footer with post count for non-empty lists', () => {
    render(<BlogList posts={mockPosts} />)

    expect(screen.getByText('Showing 3 of 3 posts')).toBeInTheDocument()
  })

  it('does not show footer for empty lists', () => {
    render(<BlogList posts={[]} />)

    expect(screen.queryByText(/Showing/)).not.toBeInTheDocument()
  })

  it('has proper semantic structure', () => {
    render(<BlogList posts={mockPosts} title="Blog Posts" />)

    const section = screen.getByText('Blog Posts').closest('section')
    expect(section).toBeInTheDocument()

    // Multiple headers exist (one for the list, one for each post)
    const banners = screen.getAllByRole('banner')
    expect(banners.length).toBeGreaterThan(0)

    // Multiple footers exist (one for the list, one for each post)
    const footers = screen.getAllByRole('contentinfo')
    expect(footers.length).toBeGreaterThan(0)
  })

  it('renders BlogPost components with correct props', () => {
    render(<BlogList posts={mockPosts} />)

    // Each post should have a "Read more" link (indicating showFullContent=false)
    const readMoreLinks = screen.getAllByText('Read more →')
    expect(readMoreLinks).toHaveLength(3)
  })
})
