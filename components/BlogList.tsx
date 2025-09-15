import { BlogPost as BlogPostType } from '../types/blog'
import BlogPost from './BlogPost'

interface BlogListProps {
  posts: BlogPostType[]
  title?: string
  showFeaturedFirst?: boolean
  emptyMessage?: string
}

export default function BlogList({
  posts,
  title,
  showFeaturedFirst = false,
  emptyMessage = 'No blog posts found.',
}: BlogListProps) {
  const sortedPosts = showFeaturedFirst
    ? [...posts].sort((a, b) => {
        if (a.featured && !b.featured) return -1
        if (!a.featured && b.featured) return 1
        return b.publishedAt.getTime() - a.publishedAt.getTime()
      })
    : [...posts].sort(
        (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
      )

  if (posts.length === 0) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          {title || 'Blog Posts'}
        </h2>
        <p className="text-gray-600">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <section className="max-w-4xl mx-auto px-4 py-8">
      {title && (
        <header className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{title}</h2>
          <p className="text-gray-600">
            {posts.length} {posts.length === 1 ? 'post' : 'posts'}
          </p>
        </header>
      )}

      <div className="space-y-8">
        {sortedPosts.map(post => (
          <BlogPost key={post.id} post={post} showFullContent={false} />
        ))}
      </div>

      {posts.length > 0 && (
        <footer className="mt-12 text-center">
          <p className="text-gray-500 text-sm">
            Showing {posts.length} of {posts.length} posts
          </p>
        </footer>
      )}
    </section>
  )
}
