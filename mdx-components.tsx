import type { MDXComponents } from 'mdx/types'
import { useMDXComponents as getBlogMDXComponents } from 'nextra-theme-blog'

export function useMDXComponents(components: MDXComponents): MDXComponents {
  const blogComponents = getBlogMDXComponents()
  return {
    ...blogComponents,
    ...components,
  }
}
