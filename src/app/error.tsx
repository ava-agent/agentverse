'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-4xl font-bold text-gray-700 mb-4">Something went wrong</h1>
      <p className="text-gray-400 text-lg mb-8">{error.message || 'An unexpected error occurred'}</p>
      <div className="flex gap-4">
        <button
          onClick={reset}
          className="px-6 py-3 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition"
        >
          Try Again
        </button>
        <a
          href="/"
          className="px-6 py-3 text-gray-400 hover:text-white transition"
        >
          Back to Home
        </a>
      </div>
    </div>
  )
}
