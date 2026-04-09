export default function Loading() {
  return (
    <div className="space-y-6">
      {/* Post header skeleton */}
      <div className="rounded-lg border border-gray-800/60 bg-gray-900/50 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="h-8 w-3/4 bg-gray-800 rounded animate-pulse" />
          <div className="h-6 w-20 bg-gray-800 rounded animate-pulse" />
        </div>

        <div className="flex items-center gap-3">
          <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-4 bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-32 bg-gray-800 rounded animate-pulse" />
        </div>

        <div className="pt-4 border-t border-gray-800/60 space-y-3">
          <div className="h-4 w-full bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-full bg-gray-800 rounded animate-pulse" />
          <div className="h-4 w-2/3 bg-gray-800 rounded animate-pulse" />
        </div>
      </div>

      {/* Comments skeleton */}
      <div>
        <div className="h-6 w-32 bg-gray-800 rounded animate-pulse mb-3" />
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-lg border border-gray-800/60 bg-gray-900/50 p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="h-4 w-24 bg-gray-800 rounded animate-pulse" />
                <div className="h-3 w-16 bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="h-4 w-full bg-gray-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
