import { BlogPost as BlogPostType } from '../types/blog'

interface BlogPostProps {
  post: BlogPostType
  showFullContent?: boolean
}

export default function BlogPost({
  post,
  showFullContent = false,
}: BlogPostProps) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date)
  }

  const renderContent = () => {
    if (showFullContent) {
      return (
        <div
          className="prose prose-lg max-w-none"
          dangerouslySetInnerHTML={{
            __html: post.content.replace(/\n/g, '<br />'),
          }}
        />
      )
    }
    return <p className="text-gray-600 leading-relaxed">{post.excerpt}</p>
  }

  return (
    <article className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      {post.featured && (
        <div className="mb-4">
          <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
            Featured
          </span>
        </div>
      )}

      <header className="mb-4">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h2>
        <div className="flex items-center text-sm text-gray-500 space-x-4">
          <span>By {post.author}</span>
          <span>•</span>
          <time dateTime={post.publishedAt.toISOString()}>
            {formatDate(post.publishedAt)}
          </time>
          {post.updatedAt && (
            <>
              <span>•</span>
              <span>Updated {formatDate(post.updatedAt)}</span>
            </>
          )}
        </div>
      </header>

      <div className="mb-4">{renderContent()}</div>

      <footer className="flex items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {post.tags.map(tag => (
            <span
              key={tag}
              className="bg-gray-100 text-gray-700 text-xs font-medium px-2.5 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>

        {!showFullContent && (
          <a
            href={`/blog/${post.slug}`}
            className="text-blue-600 hover:text-blue-800 font-medium text-sm"
          >
            Read more →
          </a>
        )}
      </footer>
    </article>
  )
}
