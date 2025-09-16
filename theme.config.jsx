export default {
  // Basic blog information
  head: ({ title, meta }) => (
    <>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta name="description" content={meta.description || "side effect shepherd"} />
      <meta name="author" content={meta.author || "Blog Author"} />
      <title>{title ? `${title} – cinnes` : 'cinnes'}</title>
    </>
  ),
  
  // Footer configuration
  footer: (
    <small style={{ display: 'block', marginTop: '8rem' }}>
      <time>{new Date().getFullYear()}</time> © cinnes.
      <a href="/feed.xml">RSS</a>
    </small>
  ),

  // Navigation links
  navs: [
    {
      url: '/about',
      name: 'About'
    },
    {
      url: '/projects', 
      name: 'Projects'
    },
    {
      url: '/contact',
      name: 'Contact'
    },
    {
      url: 'https://github.com/yourusername',
      name: 'GitHub'
    }
  ],

  // Dark mode support
  darkMode: true,
  
  // Date formatting
  dateFormatter: (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }
}