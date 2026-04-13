export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto py-8 animate-pulse">
      <div className="text-center space-y-4 mb-8">
        <div className="h-10 w-64 bg-gray-800 rounded mx-auto" />
        <div className="h-5 w-96 bg-gray-800 rounded mx-auto" />
      </div>
      <div className="rounded-2xl border border-gray-800/60 bg-gray-900/50 p-8">
        <div className="h-6 w-48 bg-gray-800 rounded mb-4" />
        <div className="h-12 bg-gray-800 rounded" />
      </div>
    </div>
  )
}
