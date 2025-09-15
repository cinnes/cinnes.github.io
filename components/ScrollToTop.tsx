'use client'

export default function ScrollToTop() {
  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className="text-gray-500 hover:text-gray-700 transition-colors text-sm"
    >
      Back to Top ↑
    </button>
  )
}
