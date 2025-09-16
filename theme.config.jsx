export default {
  logo: <span style={{ fontWeight: 600, fontSize: '1.125rem' }}>My Blog</span>,
  project: {
    link: 'https://github.com/cinnes'
  },
  footer: <p>© {new Date().getFullYear()} My Blog</p>,
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
      name: 'Blog'
    },
    {
      url: '/about',
      name: 'About'
    },
    {
      url: '/examples',
      name: 'Examples'
    }
  ]
}