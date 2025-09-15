import { render, screen } from '@testing-library/react'
import BlogPost from '../../components/BlogPost'
import { BlogPost as BlogPostType } from '../../types/blog'

const mockPost: BlogPostType = {
  id: '1',
  title: 'Test Blog Post',
  excerpt: 'This is a test excerpt for the blog post.',
  content: `# Test Content\n\nThis is the full content of the test blog post.\n\nIt has multiple paragraphs.`,
  author: 'Test Author',
  publishedAt: new Date('2024-01-15'),
  tags: ['test', 'react'],
  slug: 'test-blog-post',
  featured: true,
}

const mockPostWithoutFeatured: BlogPostType = {
  ...mockPost,
  id: '2',
  featured: false,
}

const mockPostWithUpdatedDate: BlogPostType = {
  ...mockPost,
  id: '3',
  updatedAt: new Date('2024-01-20'),
}

describe('BlogPost Component', () => {
  it('renders blog post with all basic elements', () => {
    render(<BlogPost post={mockPost} />)

    expect(screen.getByText('Test Blog Post')).toBeInTheDocument()
    expect(screen.getByText('By Test Author')).toBeInTheDocument()
    expect(screen.getByText('January 15, 2024')).toBeInTheDocument()
    expect(
      screen.getByText('This is a test excerpt for the blog post.')
    ).toBeInTheDocument()
    expect(screen.getByText('#test')).toBeInTheDocument()
    expect(screen.getByText('#react')).toBeInTheDocument()
    expect(screen.getByText('Read more →')).toBeInTheDocument()
  })

  it('shows featured badge when post is featured', () => {
    render(<BlogPost post={mockPost} />)

    expect(screen.getByText('Featured')).toBeInTheDocument()
  })

  it('does not show featured badge when post is not featured', () => {
    render(<BlogPost post={mockPostWithoutFeatured} />)

    expect(screen.queryByText('Featured')).not.toBeInTheDocument()
  })

  it('shows updated date when present', () => {
    render(<BlogPost post={mockPostWithUpdatedDate} />)

    expect(screen.getByText('Updated January 20, 2024')).toBeInTheDocument()
  })

  it('does not show updated date when not present', () => {
    render(<BlogPost post={mockPost} />)

    expect(screen.queryByText(/Updated/)).not.toBeInTheDocument()
  })

  it('shows excerpt when showFullContent is false', () => {
    render(<BlogPost post={mockPost} showFullContent={false} />)

    expect(
      screen.getByText('This is a test excerpt for the blog post.')
    ).toBeInTheDocument()
    expect(
      screen.queryByText(/This is the full content/)
    ).not.toBeInTheDocument()
    expect(screen.getByText('Read more →')).toBeInTheDocument()
  })

  it('shows full content when showFullContent is true', () => {
    render(<BlogPost post={mockPost} showFullContent={true} />)

    expect(
      screen.queryByText('This is a test excerpt for the blog post.')
    ).not.toBeInTheDocument()
    expect(screen.getByText(/This is the full content/)).toBeInTheDocument()
    expect(screen.queryByText('Read more →')).not.toBeInTheDocument()
  })

  it('renders correct link to blog post', () => {
    render(<BlogPost post={mockPost} />)

    const link = screen.getByText('Read more →')
    expect(link.closest('a')).toHaveAttribute('href', '/blog/test-blog-post')
  })

  it('renders all tags', () => {
    render(<BlogPost post={mockPost} />)

    mockPost.tags.forEach(tag => {
      expect(screen.getByText(`#${tag}`)).toBeInTheDocument()
    })
  })

  it('has proper semantic HTML structure', () => {
    render(<BlogPost post={mockPost} />)

    expect(screen.getByRole('article')).toBeInTheDocument()
    expect(screen.getByRole('banner')).toBeInTheDocument() // header element
    expect(screen.getByRole('contentinfo')).toBeInTheDocument() // footer element
  })
})
