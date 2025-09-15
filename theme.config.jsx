export default {
  footer: <p>© 2024 Tech Insights Blog</p>,
  head: ({ meta }) => (
    <>
      {meta.description && (
        <meta name="description" content={meta.description} />
      )}
      {meta.tag && <meta name="keywords" content={meta.tag} />}
      {meta.author && <meta name="author" content={meta.author} />}
    </>
  ),
  readMore: 'Read More →',
  postFooter: null,
  darkMode: true,
  navs: [
    {
      url: '/posts',
      name: 'All Posts'
    },
    {
      url: '/about',
      name: 'About'
    },
    {
      url: 'https://github.com/cinnes',
      name: 'GitHub'
    }
  ]
}