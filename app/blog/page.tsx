'use client'

import { useState, useMemo } from 'react'
import { sampleBlogPosts } from '../../lib/blogData'
import {
  filterPostsByTag,
  filterPostsBySearch,
  sortPostsByDate,
  getAllTags,
  paginatePosts,
} from '../../lib/blogUtils'
import BlogNavigation from '../../components/BlogNavigation'
import BlogList from '../../components/BlogList'

const PAGE_SIZE = 5

export default function BlogPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string | null>(null)
  const [currentPage, setCurrentPage] = useState(1)

  // Get all available tags
  const allTags = useMemo(() => getAllTags(sampleBlogPosts), [])

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    let posts = sampleBlogPosts

    // Apply search filter
    posts = filterPostsBySearch(posts, searchQuery)

    // Apply tag filter
    posts = filterPostsByTag(posts, selectedTag)

    // Sort posts (featured first)
    posts = sortPostsByDate(posts, true)

    return posts
  }, [searchQuery, selectedTag])

  // Paginate results
  const paginationData = useMemo(() => {
    return paginatePosts(filteredPosts, currentPage, PAGE_SIZE)
  }, [filteredPosts, currentPage])

  // Reset to page 1 when filters change
  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    setCurrentPage(1)
  }

  const handleTagChange = (tag: string | null) => {
    setSelectedTag(tag)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    // Scroll to top when page changes
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Personal Blog
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Thoughts, tutorials, and insights about web development,
            programming, and technology. Join me on my journey of learning and
            building amazing things.
          </p>
        </header>

        {/* Navigation */}
        <BlogNavigation
          currentPage={paginationData.currentPage}
          totalPages={paginationData.totalPages}
          onPageChange={handlePageChange}
          tags={allTags}
          selectedTag={selectedTag || undefined}
          onTagChange={handleTagChange}
          searchQuery={searchQuery}
          onSearchChange={handleSearchChange}
        />

        {/* Blog Posts */}
        <main>
          {filteredPosts.length > 0 ? (
            <BlogList posts={paginationData.posts} title="Latest Posts" />
          ) : (
            <BlogList
              posts={paginationData.posts}
              emptyMessage={
                searchQuery || selectedTag
                  ? 'No posts found matching your filters. Try adjusting your search or selected tags.'
                  : 'No blog posts available at the moment.'
              }
            />
          )}
        </main>

        {/* Bottom Pagination (for convenience on long pages) */}
        {paginationData.totalPages > 1 && (
          <div className="mt-8">
            <BlogNavigation
              currentPage={paginationData.currentPage}
              totalPages={paginationData.totalPages}
              onPageChange={handlePageChange}
            />
          </div>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center">
          <p className="text-gray-500 text-sm">
            © 2024 Personal Blog. Built with Next.js, TypeScript, and Tailwind
            CSS.
          </p>
        </footer>
      </div>
    </div>
  )
}
