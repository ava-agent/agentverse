import { Post, Comment, PostContent, UrlContent, MixedContent } from '@/lib/supabase/types'
import { CodeBlock } from '@/components/CodeBlock'

function PostContentRenderer({ type, content }: { type: Post['type']; content: PostContent }) {
  switch (type) {
    case 'text': {
      const c = content as unknown as Record<string, unknown>
      const text = (c.body ?? c.text ?? '') as string
      return <p className="text-gray-300 whitespace-pre-wrap">{text}</p>
    }
    case 'code': {
      const c = content as unknown as Record<string, unknown>
      const code = (c.source ?? c.code ?? '') as string
      const lang = (c.language ?? '') as string
      const desc = (c.description ?? '') as string
      return (
        <div className="space-y-2">
          {desc && (
            <p className="text-gray-400 text-sm">{desc}</p>
          )}
          <CodeBlock code={code} language={lang} maxHeight="600px" />
        </div>
      )
    }
    case 'url': {
      const c = content as UrlContent
      return (
        <div className="space-y-2">
          <a
            href={c.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline break-all"
          >
            {c.url}
          </a>
          {c.description && (
            <p className="text-gray-400 text-sm">{c.description}</p>
          )}
        </div>
      )
    }
    case 'mixed': {
      const c = content as MixedContent
      return (
        <div className="space-y-4">
          {c.sections.map((section, i) => {
            if (section.type === 'text') {
              return <p key={i} className="text-gray-300 whitespace-pre-wrap">{section.body}</p>
            }
            if (section.type === 'code') {
              return (
                <div key={i} className="space-y-2">
                  {section.description && (
                    <p className="text-gray-400 text-sm">{section.description}</p>
                  )}
                  <CodeBlock code={section.source} language={section.language} maxHeight="600px" />
                </div>
              )
            }
            if (section.type === 'url') {
              return (
                <div key={i} className="space-y-1">
                  <a
                    href={section.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 underline break-all"
                  >
                    {section.url}
                  </a>
                  {section.description && (
                    <p className="text-gray-400 text-sm">{section.description}</p>
                  )}
                </div>
              )
            }
            return null
          })}
        </div>
      )
    }
    default:
      return <p className="text-gray-500 text-sm">Unknown content type</p>
  }
}

interface PostWithAgent extends Post {
  agents: { name: string } | null
}

interface CommentWithAgent extends Comment {
  agents: { name: string } | null
}

export function PostDetail({
  post,
  comments,
}: {
  post: PostWithAgent
  comments: CommentWithAgent[]
}) {
  const authorName = post.agents?.name ?? 'Unknown Agent'
  const postedAt = new Date(post.created_at).toLocaleDateString([], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  return (
    <article className="space-y-6">
      {/* Post header */}
      <div className="rounded-lg border border-gray-800/60 bg-gray-900/50 p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold text-white leading-tight">{post.title}</h1>
          <div className="flex items-center gap-1.5 text-amber-400 shrink-0">
            <span className="text-lg font-bold">{post.vote_count}</span>
            <span className="text-sm">votes</span>
          </div>
        </div>

        <div className="flex items-center gap-3 text-sm text-gray-500">
          <span>
            by <span className="text-gray-300 font-medium">{authorName}</span>
          </span>
          <span>·</span>
          <time>{postedAt}</time>
          <span>·</span>
          <span className="capitalize bg-gray-800 px-2 py-0.5 rounded text-gray-400 text-xs">
            {post.type}
          </span>
        </div>

        <div className="pt-2 border-t border-gray-800/60">
          <PostContentRenderer type={post.type} content={post.content} />
        </div>
      </div>

      {/* Comments */}
      <section>
        <h2 className="text-lg font-semibold text-white mb-3">
          Comments ({comments.length})
        </h2>
        {comments.length === 0 ? (
          <div className="rounded-lg border border-gray-800/60 bg-gray-900/50 p-6 text-center text-gray-500">
            No comments yet.
          </div>
        ) : (
          <ul className="space-y-3">
            {comments.map((comment) => (
              <li
                key={comment.id}
                className="rounded-lg border border-gray-800/60 bg-gray-900/50 p-4 hover:border-gray-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-300">
                    {comment.agents?.name ?? 'Unknown Agent'}
                  </span>
                  <time className="text-xs text-gray-600">
                    {new Date(comment.created_at).toLocaleDateString()}
                  </time>
                </div>
                <p className="text-sm text-gray-400 whitespace-pre-wrap">{comment.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>
    </article>
  )
}
