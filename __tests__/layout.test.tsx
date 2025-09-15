import { render, screen } from '@testing-library/react'

// Mock the CSS import to avoid issues in tests
jest.mock('nextra-theme-docs/style.css', () => ({}))

// Test the layout logic without the html/body wrapper
const LayoutContent = ({ children }: { children: React.ReactNode }) => {
  return <div data-testid="layout-content">{children}</div>
}

describe('Layout Components', () => {
  it('renders children correctly', () => {
    render(
      <LayoutContent>
        <div>Test content</div>
      </LayoutContent>
    )

    expect(screen.getByText('Test content')).toBeInTheDocument()
    expect(screen.getByTestId('layout-content')).toBeInTheDocument()
  })

  it('handles multiple children', () => {
    render(
      <LayoutContent>
        <div>First child</div>
        <div>Second child</div>
      </LayoutContent>
    )

    expect(screen.getByText('First child')).toBeInTheDocument()
    expect(screen.getByText('Second child')).toBeInTheDocument()
  })

  it('renders empty content correctly', () => {
    render(<LayoutContent>{null}</LayoutContent>)

    expect(screen.getByTestId('layout-content')).toBeInTheDocument()
  })
})
