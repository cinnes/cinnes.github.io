# Personal Blog

A modern, responsive blog built with Next.js, TypeScript, and Tailwind CSS. Features comprehensive search, filtering, and pagination capabilities with a focus on developer experience and code quality.

## 🚀 Features

### Blog Functionality
- **Full-featured blog system** with search, tag filtering, and pagination
- **Individual post pages** with related post recommendations
- **Featured posts** with priority sorting
- **Responsive design** optimized for all devices
- **Semantic HTML** with proper accessibility support
- **Static generation** for optimal performance

### Content Management
- **6 detailed sample posts** covering modern web development topics
- **Rich markdown content** with syntax highlighting
- **Tag-based organization** for easy content discovery
- **Author attribution** and publication dates
- **Excerpt and full content modes**

### Developer Experience
- **TypeScript** for type safety and better developer experience
- **Comprehensive testing** with 91 passing tests using Jest and React Testing Library
- **ESLint + Prettier** for code quality and consistent formatting
- **Git hooks** with Husky and lint-staged for automated quality checks
- **Test-driven development** approach with full component coverage

## 📁 Project Structure

```
├── app/
│   ├── blog/
│   │   ├── [slug]/
│   │   │   └── page.tsx          # Individual blog post pages
│   │   └── page.tsx              # Main blog listing page
│   ├── layout.tsx                # Root layout
│   └── page.mdx                  # Homepage
├── components/
│   ├── BlogList.tsx              # Blog post listing component
│   ├── BlogNavigation.tsx        # Search, filtering, and pagination
│   └── BlogPost.tsx              # Individual blog post component
├── lib/
│   ├── blogData.ts               # Sample blog post content
│   └── blogUtils.ts              # Utility functions for filtering, sorting, pagination
├── types/
│   └── blog.ts                   # TypeScript type definitions
└── __tests__/                    # Comprehensive test suite
    ├── components/
    └── lib/
```

## 🛠️ Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Documentation**: [Nextra](https://nextra.site/)
- **Testing**: [Jest](https://jestjs.io/) + [React Testing Library](https://testing-library.com/)
- **Code Quality**: [ESLint](https://eslint.org/) + [Prettier](https://prettier.io/)
- **Git Hooks**: [Husky](https://typicode.github.io/husky/) + [lint-staged](https://github.com/okonet/lint-staged)
- **Deployment**: [GitHub Pages](https://pages.github.com/)

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ (managed with [fnm](https://github.com/Schniz/fnm))
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/cinnes/cinnes.github.io.git
   cd cinnes.github.io
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📝 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm test` | Run test suite |
| `npm run test:watch` | Run tests in watch mode |
| `npm run lint` | Run ESLint with auto-fix |
| `npm run lint:check` | Check linting without fixes |
| `npm run type-check` | Run TypeScript type checking |
| `npm run format` | Format code with Prettier |

## 🧪 Testing

The project includes comprehensive testing with **91 passing tests** covering:

- **Component testing** - All React components with user interactions
- **Utility function testing** - Blog filtering, sorting, and pagination logic
- **Accessibility testing** - Semantic HTML and ARIA compliance
- **Edge case testing** - Error states and boundary conditions

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm test -- --coverage
```

## 📄 Blog Content

### Sample Posts
The blog includes 6 detailed technical posts:

1. **Getting Started with React Hooks** - useState, useEffect, and custom hooks
2. **TypeScript Best Practices for Large Applications** - Scalable TypeScript patterns
3. **Building Responsive Layouts with CSS Grid** - Modern CSS layout techniques
4. **Introduction to Node.js and Express** - Backend JavaScript fundamentals
5. **Modern JavaScript ES6+ Features** - Arrow functions, destructuring, async/await
6. **Understanding React State Management** - Local state, Context API, and external libraries

### Adding New Posts
To add new blog posts, update the `sampleBlogPosts` array in `lib/blogData.ts`:

```typescript
{
  id: 'unique-id',
  title: 'Your Post Title',
  excerpt: 'Brief description...',
  content: `# Full markdown content...`,
  author: 'Author Name',
  publishedAt: new Date('2024-01-01'),
  tags: ['tag1', 'tag2'],
  slug: 'your-post-slug',
  featured: false
}
```

## 🎨 Customization

### Styling
- Modify Tailwind classes in components for design changes
- Update `tailwind.config.js` for theme customization
- Add custom CSS in component files as needed

### Configuration
- Adjust pagination size in `app/blog/page.tsx` (PAGE_SIZE constant)
- Modify search behavior in `lib/blogUtils.ts`
- Update site metadata in `app/layout.tsx`

## 🚀 Deployment

The site automatically deploys to GitHub Pages when changes are pushed to the main branch.

### Manual Deployment
```bash
npm run build
npm run export  # For static deployment
```

### Environment Variables
No environment variables are required for basic functionality.

## 🔧 Development Workflow

The project enforces code quality through automated tools:

1. **Pre-commit hooks** run ESLint, Prettier, and tests
2. **Pre-push hooks** run full type checking and test suite
3. **GitHub Actions** build and deploy on every push
4. **TypeScript strict mode** ensures type safety

## 📊 Performance

- **Static generation** for optimal loading speeds
- **Component-based architecture** for efficient re-renders
- **Pagination** to handle large numbers of posts
- **Responsive images** and optimized assets
- **Semantic HTML** for better SEO and accessibility

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes and add tests
4. Ensure all tests pass (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to the branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

## 📋 Code Quality Standards

- **TypeScript** for type safety
- **ESLint** for code quality
- **Prettier** for formatting
- **Jest** for testing
- **100% test coverage** for utilities
- **Accessibility compliance** (WCAG guidelines)
- **Semantic HTML** structure

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Jest Documentation](https://jestjs.io/docs/getting-started)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 📞 Contact

Feel free to reach out if you have questions or suggestions for improvement!

---

Built with ❤️ using modern web development practices and tools.
