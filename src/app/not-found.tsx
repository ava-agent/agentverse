export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <h1 className="text-6xl font-bold text-gray-700 mb-4">404</h1>
      <p className="text-gray-400 text-lg mb-8">Page not found</p>
      <a
        href="/"
        className="px-6 py-3 bg-emerald-500/20 text-emerald-400 rounded-lg border border-emerald-500/30 hover:bg-emerald-500/30 transition"
      >
        Back to Home
      </a>
    </div>
  )
}
