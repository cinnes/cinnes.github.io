interface BlogNavigationProps {
  currentPage?: number
  totalPages?: number
  onPageChange?: (page: number) => void
  tags?: string[]
  selectedTag?: string
  onTagChange?: (tag: string | null) => void
  searchQuery?: string
  onSearchChange?: (query: string) => void
}

export default function BlogNavigation({
  currentPage = 1,
  totalPages = 1,
  onPageChange,
  tags = [],
  selectedTag,
  onTagChange,
  searchQuery = '',
  onSearchChange,
}: BlogNavigationProps) {
  const handlePrevious = () => {
    if (currentPage > 1 && onPageChange) {
      onPageChange(currentPage - 1)
    }
  }

  const handleNext = () => {
    if (currentPage < totalPages && onPageChange) {
      onPageChange(currentPage + 1)
    }
  }

  const handleTagClick = (tag: string) => {
    if (onTagChange) {
      onTagChange(selectedTag === tag ? null : tag)
    }
  }

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (onSearchChange) {
      onSearchChange(e.target.value)
    }
  }

  return (
    <nav className="bg-white rounded-lg shadow-md p-6 mb-8" role="navigation">
      {/* Search */}
      {onSearchChange && (
        <div className="mb-6">
          <label htmlFor="blog-search" className="sr-only">
            Search blog posts
          </label>
          <input
            id="blog-search"
            type="text"
            placeholder="Search posts..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Filter by tags:
          </h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => onTagChange && onTagChange(null)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                !selectedTag
                  ? 'bg-blue-100 text-blue-800'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              All
            </button>
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => handleTagClick(tag)}
                className={`px-3 py-1 text-sm rounded-full transition-colors ${
                  selectedTag === tag
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                #{tag}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentPage <= 1}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            Previous
          </button>

          <div className="flex items-center space-x-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => onPageChange && onPageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-lg ${
                  currentPage === page
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={handleNext}
            disabled={currentPage >= totalPages}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      )}

      {/* Current status */}
      {(selectedTag || searchQuery) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <span>
              {selectedTag && `Filtered by: #${selectedTag}`}
              {selectedTag && searchQuery && ' • '}
              {searchQuery && `Search: "${searchQuery}"`}
            </span>
            <button
              onClick={() => {
                onTagChange && onTagChange(null)
                onSearchChange && onSearchChange('')
              }}
              className="text-blue-600 hover:text-blue-800"
            >
              Clear filters
            </button>
          </div>
        </div>
      )}
    </nav>
  )
}
