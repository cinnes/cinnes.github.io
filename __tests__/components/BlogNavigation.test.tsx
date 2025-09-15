import { render, screen } from '@testing-library/react'
import user from '@testing-library/user-event'
import BlogNavigation from '../../components/BlogNavigation'

const mockTags = ['react', 'typescript', 'nextjs', 'testing']

describe('BlogNavigation Component', () => {
  describe('Search functionality', () => {
    it('renders search input when onSearchChange is provided', () => {
      const onSearchChange = jest.fn()
      render(<BlogNavigation onSearchChange={onSearchChange} />)

      expect(screen.getByPlaceholderText('Search posts...')).toBeInTheDocument()
    })

    it('does not render search input when onSearchChange is not provided', () => {
      render(<BlogNavigation />)

      expect(
        screen.queryByPlaceholderText('Search posts...')
      ).not.toBeInTheDocument()
    })

    it('calls onSearchChange when search input changes', async () => {
      const onSearchChange = jest.fn()
      render(<BlogNavigation onSearchChange={onSearchChange} />)

      const searchInput = screen.getByPlaceholderText('Search posts...')
      await user.type(searchInput, 'react')

      expect(onSearchChange).toHaveBeenCalledWith('r')
      expect(onSearchChange).toHaveBeenCalledWith('e')
      expect(onSearchChange).toHaveBeenCalledWith('a')
      expect(onSearchChange).toHaveBeenCalledWith('c')
      expect(onSearchChange).toHaveBeenCalledWith('t')
    })

    it('displays current search query', () => {
      render(
        <BlogNavigation searchQuery="test query" onSearchChange={jest.fn()} />
      )

      expect(screen.getByDisplayValue('test query')).toBeInTheDocument()
    })
  })

  describe('Tag filtering', () => {
    it('renders tags when provided', () => {
      render(<BlogNavigation tags={mockTags} onTagChange={jest.fn()} />)

      expect(screen.getByText('Filter by tags:')).toBeInTheDocument()
      expect(screen.getByText('All')).toBeInTheDocument()
      expect(screen.getByText('#react')).toBeInTheDocument()
      expect(screen.getByText('#typescript')).toBeInTheDocument()
      expect(screen.getByText('#nextjs')).toBeInTheDocument()
      expect(screen.getByText('#testing')).toBeInTheDocument()
    })

    it('does not render tags section when tags array is empty', () => {
      render(<BlogNavigation tags={[]} />)

      expect(screen.queryByText('Filter by tags:')).not.toBeInTheDocument()
    })

    it('highlights selected tag', () => {
      render(
        <BlogNavigation
          tags={mockTags}
          selectedTag="react"
          onTagChange={jest.fn()}
        />
      )

      const reactTag = screen.getByText('#react')
      expect(reactTag).toHaveClass('bg-blue-100', 'text-blue-800')
    })

    it('highlights "All" when no tag is selected', () => {
      render(<BlogNavigation tags={mockTags} onTagChange={jest.fn()} />)

      const allTag = screen.getByText('All')
      expect(allTag).toHaveClass('bg-blue-100', 'text-blue-800')
    })

    it('calls onTagChange when tag is clicked', async () => {
      const onTagChange = jest.fn()
      render(<BlogNavigation tags={mockTags} onTagChange={onTagChange} />)

      await user.click(screen.getByText('#react'))

      expect(onTagChange).toHaveBeenCalledWith('react')
    })

    it('calls onTagChange with null when "All" is clicked', async () => {
      const onTagChange = jest.fn()
      render(
        <BlogNavigation
          tags={mockTags}
          selectedTag="react"
          onTagChange={onTagChange}
        />
      )

      await user.click(screen.getByText('All'))

      expect(onTagChange).toHaveBeenCalledWith(null)
    })

    it('toggles tag selection when same tag is clicked', async () => {
      const onTagChange = jest.fn()
      render(
        <BlogNavigation
          tags={mockTags}
          selectedTag="react"
          onTagChange={onTagChange}
        />
      )

      await user.click(screen.getByText('#react'))

      expect(onTagChange).toHaveBeenCalledWith(null)
    })
  })

  describe('Pagination', () => {
    it('renders pagination when totalPages > 1', () => {
      render(
        <BlogNavigation
          currentPage={2}
          totalPages={5}
          onPageChange={jest.fn()}
        />
      )

      expect(screen.getByText('Previous')).toBeInTheDocument()
      expect(screen.getByText('Next')).toBeInTheDocument()
      expect(screen.getByText('1')).toBeInTheDocument()
      expect(screen.getByText('2')).toBeInTheDocument()
      expect(screen.getByText('3')).toBeInTheDocument()
      expect(screen.getByText('4')).toBeInTheDocument()
      expect(screen.getByText('5')).toBeInTheDocument()
    })

    it('does not render pagination when totalPages <= 1', () => {
      render(<BlogNavigation currentPage={1} totalPages={1} />)

      expect(screen.queryByText('Previous')).not.toBeInTheDocument()
      expect(screen.queryByText('Next')).not.toBeInTheDocument()
    })

    it('highlights current page', () => {
      render(
        <BlogNavigation
          currentPage={3}
          totalPages={5}
          onPageChange={jest.fn()}
        />
      )

      const currentPageButton = screen.getByText('3')
      expect(currentPageButton).toHaveClass('bg-blue-600', 'text-white')
    })

    it('disables Previous button on first page', () => {
      render(
        <BlogNavigation
          currentPage={1}
          totalPages={5}
          onPageChange={jest.fn()}
        />
      )

      const previousButton = screen.getByText('Previous')
      expect(previousButton).toBeDisabled()
    })

    it('disables Next button on last page', () => {
      render(
        <BlogNavigation
          currentPage={5}
          totalPages={5}
          onPageChange={jest.fn()}
        />
      )

      const nextButton = screen.getByText('Next')
      expect(nextButton).toBeDisabled()
    })

    it('calls onPageChange when page number is clicked', async () => {
      const onPageChange = jest.fn()
      render(
        <BlogNavigation
          currentPage={1}
          totalPages={5}
          onPageChange={onPageChange}
        />
      )

      await user.click(screen.getByText('3'))

      expect(onPageChange).toHaveBeenCalledWith(3)
    })

    it('calls onPageChange when Next is clicked', async () => {
      const onPageChange = jest.fn()
      render(
        <BlogNavigation
          currentPage={2}
          totalPages={5}
          onPageChange={onPageChange}
        />
      )

      await user.click(screen.getByText('Next'))

      expect(onPageChange).toHaveBeenCalledWith(3)
    })

    it('calls onPageChange when Previous is clicked', async () => {
      const onPageChange = jest.fn()
      render(
        <BlogNavigation
          currentPage={3}
          totalPages={5}
          onPageChange={onPageChange}
        />
      )

      await user.click(screen.getByText('Previous'))

      expect(onPageChange).toHaveBeenCalledWith(2)
    })
  })

  describe('Filter status and clear filters', () => {
    it('shows filter status when tag is selected', () => {
      render(
        <BlogNavigation
          tags={mockTags}
          selectedTag="react"
          onTagChange={jest.fn()}
        />
      )

      expect(screen.getByText('Filtered by: #react')).toBeInTheDocument()
      expect(screen.getByText('Clear filters')).toBeInTheDocument()
    })

    it('shows filter status when search query is provided', () => {
      render(<BlogNavigation searchQuery="test" onSearchChange={jest.fn()} />)

      expect(screen.getByText('Search: "test"')).toBeInTheDocument()
      expect(screen.getByText('Clear filters')).toBeInTheDocument()
    })

    it('shows combined filter status', () => {
      render(
        <BlogNavigation
          tags={mockTags}
          selectedTag="react"
          searchQuery="test"
          onTagChange={jest.fn()}
          onSearchChange={jest.fn()}
        />
      )

      expect(
        screen.getByText('Filtered by: #react • Search: "test"')
      ).toBeInTheDocument()
    })

    it('does not show filter status when no filters are active', () => {
      render(<BlogNavigation tags={mockTags} />)

      expect(screen.queryByText('Clear filters')).not.toBeInTheDocument()
    })

    it('clears all filters when clear button is clicked', async () => {
      const onTagChange = jest.fn()
      const onSearchChange = jest.fn()
      render(
        <BlogNavigation
          tags={mockTags}
          selectedTag="react"
          searchQuery="test"
          onTagChange={onTagChange}
          onSearchChange={onSearchChange}
        />
      )

      await user.click(screen.getByText('Clear filters'))

      expect(onTagChange).toHaveBeenCalledWith(null)
      expect(onSearchChange).toHaveBeenCalledWith('')
    })
  })

  describe('Accessibility', () => {
    it('has proper navigation role', () => {
      render(<BlogNavigation />)

      expect(screen.getByRole('navigation')).toBeInTheDocument()
    })

    it('has proper label for search input', () => {
      render(<BlogNavigation onSearchChange={jest.fn()} />)

      const searchInput = screen.getByLabelText('Search blog posts')
      expect(searchInput).toBeInTheDocument()
    })
  })
})
