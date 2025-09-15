'use client'

import { notFound } from 'next/navigation'
import Link from 'next/link'
import { sampleBlogPosts } from '../../../lib/blogData'
import { getRelatedPosts } from '../../../lib/blogUtils'
import BlogPost from '../../../components/BlogPost'
import BlogList from '../../../components/BlogList'

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = params

  // Find the post by slug
  const post = sampleBlogPosts.find(p => p.slug === slug)

  if (!post) {
    notFound()
  }

  // Get related posts
  const relatedPosts = getRelatedPosts(post, sampleBlogPosts, 3)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <nav className="mb-8">
          <Link
            href="/blog"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors"
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
            Back to Blog
          </Link>
        </nav>

        {/* Main Post */}
        <main>
          <BlogPost post={post} showFullContent={true} />
        </main>

        {/* Related Posts */}
        {relatedPosts.length > 0 && (
          <aside className="mt-16">
            <BlogList posts={relatedPosts} title="Related Posts" />
          </aside>
        )}

        {/* Footer */}
        <footer className="mt-16 pt-8 border-t border-gray-200 text-center">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <Link
              href="/blog"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              ← All Posts
            </Link>
            <p className="text-gray-500 text-sm">© 2024 Personal Blog</p>
            <div className="flex items-center gap-4">
              <button
                onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
              >
                Back to Top ↑
              </button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}

// Generate static params for all blog posts
export function generateStaticParams() {
  return sampleBlogPosts.map(post => ({
    slug: post.slug,
  }))
}
