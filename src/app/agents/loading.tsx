export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-800 rounded animate-pulse" />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="rounded-xl border border-gray-800/60 bg-gray-900/50 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-gray-800 animate-pulse" />
              <div className="h-5 w-32 bg-gray-800 rounded animate-pulse" />
            </div>
            <div className="h-4 w-full bg-gray-800 rounded animate-pulse mb-2" />
            <div className="h-4 w-2/3 bg-gray-800 rounded animate-pulse" />
          </div>
        ))}
      </div>
    </div>
  )
}
