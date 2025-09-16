import themeConfig from '../theme.config.jsx'

describe('Theme Configuration', () => {
  it('has correct basic configuration', () => {
    expect(themeConfig.darkMode).toBe(true)
    expect(themeConfig.navs).toHaveLength(4)
  })

  it('has correct navigation links', () => {
    const navs = themeConfig.navs

    expect(navs).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ url: '/about', name: 'About' }),
        expect.objectContaining({ url: '/projects', name: 'Projects' }),
        expect.objectContaining({ url: '/contact', name: 'Contact' }),
        expect.objectContaining({
          url: 'https://github.com/cinnes',
          name: 'GitHub',
        }),
      ])
    )
  })

  it('has correct date formatter', () => {
    const formatter = themeConfig.dateFormatter
    const testDate = new Date('2025-01-15')
    const formatted = formatter(testDate)

    expect(formatted).toBe('January 15, 2025')
  })
})
