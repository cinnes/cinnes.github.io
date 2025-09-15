import { notFound } from 'next/navigation'
import Link from 'next/link'
import { sampleBlogPosts } from '../../../lib/blogData'
import { getRelatedPosts } from '../../../lib/blogUtils'
import BlogPost from '../../../components/BlogPost'
import BlogList from '../../../components/BlogList'
import ScrollToTop from '../../../components/ScrollToTop'

interface BlogPostPageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const { slug } = await params

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
              <ScrollToTop />
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
