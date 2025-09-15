import { BlogPost } from '../types/blog'

export const mockBlogPosts: BlogPost[] = [
  {
    id: '1',
    title: 'Getting Started with Next.js',
    excerpt: 'Learn the basics of Next.js and build your first application.',
    content: `# Getting Started with Next.js

Next.js is a powerful React framework that makes building web applications easier. In this post, we'll explore the basics and build a simple application.

## Why Next.js?

Next.js provides many features out of the box:
- Server-side rendering
- Static site generation
- API routes
- File-based routing

Let's dive in and start building!`,
    author: 'John Doe',
    publishedAt: new Date('2024-01-15'),
    tags: ['nextjs', 'react', 'tutorial'],
    slug: 'getting-started-with-nextjs',
    featured: true,
  },
  {
    id: '2',
    title: 'TypeScript Best Practices',
    excerpt: 'Essential TypeScript patterns and practices for better code.',
    content: `# TypeScript Best Practices

TypeScript brings type safety to JavaScript, but knowing best practices is crucial for writing maintainable code.

## Key Principles

1. Use strict mode
2. Define interfaces for object shapes
3. Leverage union types
4. Avoid \`any\` type

These practices will help you write better TypeScript code.`,
    author: 'Jane Smith',
    publishedAt: new Date('2024-02-03'),
    tags: ['typescript', 'javascript', 'best-practices'],
    slug: 'typescript-best-practices',
  },
  {
    id: '3',
    title: 'Building React Components',
    excerpt: 'A guide to creating reusable and testable React components.',
    content: `# Building React Components

Creating reusable React components is an art. Here's how to do it right.

## Component Design

Good components are:
- Single responsibility
- Reusable
- Well-tested
- Documented

Let's build some examples together.`,
    author: 'Bob Wilson',
    publishedAt: new Date('2024-02-10'),
    updatedAt: new Date('2024-02-12'),
    tags: ['react', 'components', 'testing'],
    slug: 'building-react-components',
  },
]

export function getBlogPosts(): BlogPost[] {
  return mockBlogPosts.sort(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime()
  )
}

export function getBlogPost(slug: string): BlogPost | undefined {
  return mockBlogPosts.find(post => post.slug === slug)
}

export function getFeaturedPosts(): BlogPost[] {
  return mockBlogPosts.filter(post => post.featured)
}

export function getPostsByTag(tag: string): BlogPost[] {
  return mockBlogPosts.filter(post =>
    post.tags.some(postTag => postTag.toLowerCase() === tag.toLowerCase())
  )
}
