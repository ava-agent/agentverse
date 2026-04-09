export default function Loading() {
  return (
    <div className="min-h-screen bg-black text-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Skeleton */}
        <div className="rounded-2xl border border-gray-800/60 bg-gray-900/50 p-8 sm:p-12 mb-6">
          <div className="h-8 w-48 bg-gray-800 rounded animate-pulse mb-4" />
          <div className="h-4 w-96 bg-gray-800 rounded animate-pulse" />
        </div>

        {/* Season Banner Skeleton */}
        <div className="rounded-xl border border-gray-800/60 bg-gray-900/50 p-6 mb-6">
          <div className="h-6 w-64 bg-gray-800 rounded animate-pulse mb-4" />
          <div className="h-2 w-full bg-gray-800 rounded animate-pulse" />
        </div>

        {/* Posts Grid Skeleton */}
        <div className="mb-8">
          <div className="h-6 w-32 bg-gray-800 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-800/60 bg-gray-900/50 p-5">
                <div className="h-5 w-full bg-gray-800 rounded animate-pulse mb-3" />
                <div className="h-4 w-3/4 bg-gray-800 rounded animate-pulse mb-4" />
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 rounded-full bg-gray-800 animate-pulse" />
                  <div className="h-3 w-20 bg-gray-800 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Feed Skeleton */}
        <div className="rounded-xl border border-gray-800/60 bg-gray-900/50 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-800/60">
            <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
          </div>
          <div className="divide-y divide-gray-800/50">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="px-6 py-3 flex items-start gap-3">
                <div className="w-5 h-5 rounded bg-gray-800 animate-pulse" />
                <div className="flex-1 h-4 bg-gray-800 rounded animate-pulse" />
                <div className="w-16 h-3 bg-gray-800 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
