export default {
  logo: <span style={{ fontWeight: 600 }}>Your Blog</span>,
  project: {
    link: 'https://github.com/cinnes'
  },
  footer: <p>© {new Date().getFullYear()} Your Blog</p>,
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
    }
  ]
}