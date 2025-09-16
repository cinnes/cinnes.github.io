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
      url: '/',
      name: 'Home'
    },
    {
      url: '/posts',
      name: 'Posts'
    },
    {
      url: '/musings',
      name: 'Musings'
    },
    {
      url: '/about',
      name: 'About'
    },
    {
      url: '/projects',
      name: 'Projects'
    },
    {
      url: 'https://github.com/cinnes',
      name: 'GitHub'
    }
  ]
}