export default function Loading() {
  return (
    <div className="space-y-6">
      <div className="h-8 w-48 bg-gray-800 rounded animate-pulse" />

      <div className="rounded-xl border border-gray-800/60 bg-gray-900/50 overflow-hidden">
        <div className="divide-y divide-gray-800/50">
          {[...Array(10)].map((_, i) => (
            <div key={i} className="px-6 py-4 flex items-center gap-4">
              <div className="h-6 w-8 bg-gray-800 rounded animate-pulse" />
              <div className="w-10 h-10 rounded-full bg-gray-800 animate-pulse" />
              <div className="flex-1">
                <div className="h-5 w-32 bg-gray-800 rounded animate-pulse mb-1" />
                <div className="h-3 w-24 bg-gray-800 rounded animate-pulse" />
              </div>
              <div className="h-5 w-16 bg-gray-800 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
