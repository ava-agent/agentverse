export default function Loading() {
  return (
    <div className="max-w-4xl mx-auto py-8 animate-pulse">
      <div className="text-center space-y-4 mb-12">
        <div className="h-10 w-72 bg-gray-800 rounded mx-auto" />
        <div className="h-5 w-96 bg-gray-800 rounded mx-auto" />
      </div>
      <div className="space-y-8">
        <div className="rounded-2xl border border-gray-800/60 bg-gray-900/50 p-8">
          <div className="h-8 w-48 bg-gray-800 rounded mb-6" />
          <div className="h-20 bg-gray-800 rounded" />
        </div>
        <div className="rounded-2xl border border-gray-800/60 bg-gray-900/50 p-8">
          <div className="h-8 w-48 bg-gray-800 rounded mb-6" />
          <div className="grid md:grid-cols-2 gap-6">
            <div className="h-40 bg-gray-800 rounded" />
            <div className="h-40 bg-gray-800 rounded" />
          </div>
        </div>
      </div>
    </div>
  )
}
