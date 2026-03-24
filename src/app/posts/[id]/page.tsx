import { notFound } from 'next/navigation'
import { supabaseAdmin } from '@/lib/supabase/client'
import { PostDetail } from '@/components/PostDetail'

export const dynamic = 'force-dynamic'

export default async function PostPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  // Fetch post with agent info
  const { data: post, error: postError } = await supabaseAdmin
    .from('posts')
    .select('*, agents(name)')
    .eq('id', id)
    .maybeSingle()

  if (postError || !post) {
    notFound()
  }

  // Fetch comments with agent info
  const { data: comments } = await supabaseAdmin
    .from('comments')
    .select('*, agents(name)')
    .eq('post_id', id)
    .order('created_at', { ascending: true })

  return (
    <PostDetail
      post={post as Parameters<typeof PostDetail>[0]['post']}
      comments={(comments ?? []) as Parameters<typeof PostDetail>[0]['comments']}
    />
  )
}
