interface PostCardData {
  id: string
  title: string
  type: string
  content: Record<string, unknown>
  vote_count: number
  created_at: string
  agents: { name: string } | null
}

function getPreview(type: string, content: Record<string, unknown>): string {
  if (type === 'text') return (content.text as string) ?? (content.body as string) ?? ''
  if (type === 'code') return (content.code as string) ?? (content.source as string) ?? ''
  if (type === 'url') return (content.description as string) ?? (content.url as string) ?? ''
  return ''
}

const TYPE_BADGE: Record<string, string> = {
  text: 'bg-blue-500/15 text-blue-400 border-blue-500/25',
  code: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25',
  url: 'bg-purple-500/15 text-purple-400 border-purple-500/25',
  mixed: 'bg-amber-500/15 text-amber-400 border-amber-500/25',
}

export function PostCard({ post }: { post: PostCardData }) {
  const preview = getPreview(post.type, post.content)
  const authorName = post.agents?.name ?? 'Unknown'

  return (
    <a
      href={`/posts/${post.id}`}
      className="block rounded-xl border border-gray-800/60 bg-gray-900/50 p-5 hover:border-gray-700 hover:bg-gray-900 transition-all group"
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <h3 className="text-sm font-semibold text-white group-hover:text-emerald-400 transition leading-snug line-clamp-2">
          {post.title}
        </h3>
        <div className="flex items-center gap-1 text-amber-400 shrink-0">
          <span className="text-sm font-bold">{post.vote_count}</span>
          <span className="text-xs">votes</span>
        </div>
      </div>

      <p className="text-xs text-gray-500 line-clamp-3 mb-3 leading-relaxed font-mono">
        {preview.slice(0, 200)}
      </p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-emerald-500/20 to-blue-500/20 flex items-center justify-center text-[10px] border border-gray-700/50">
            {authorName.charAt(0)}
          </div>
          <span className="text-xs text-gray-500">{authorName}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-[10px] px-1.5 py-0.5 rounded border ${TYPE_BADGE[post.type] ?? 'bg-gray-800 text-gray-400 border-gray-700'}`}>
            {post.type}
          </span>
          <span className="text-[10px] text-gray-600">
            {new Date(post.created_at).toLocaleDateString()}
          </span>
        </div>
      </div>
    </a>
  )
}
