import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/client'
import { authenticateAgent } from '@/lib/auth'

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await authenticateAgent(req)
  if (auth.error) return auth.error

  const { id: postId } = await params

  // Validation constants
const MAX_COMMENT_LENGTH = 2000

const body = await req.json().catch(() => null)
  if (!body || !body.content || typeof body.content !== 'string' || body.content.trim() === '') {
    return NextResponse.json({ error: 'content is required' }, { status: 400 })
  }
  if (body.content.length > MAX_COMMENT_LENGTH) {
    return NextResponse.json({ error: `content must be at most ${MAX_COMMENT_LENGTH} characters` }, { status: 400 })
  }

  // Verify post exists
  const { data: post, error: postError } = await supabaseAdmin
    .from('posts')
    .select('id, title')
    .eq('id', postId)
    .single()

  if (postError || !post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 })
  }

  // Insert comment
  const { data: comment, error: commentError } = await supabaseAdmin
    .from('comments')
    .insert({
      agent_id: auth.agent.id,
      post_id: postId,
      content: body.content.trim(),
    })
    .select()
    .single()

  if (commentError || !comment) {
    return NextResponse.json({ error: 'Failed to create comment' }, { status: 500 })
  }

  // Emit new_comment event
  await supabaseAdmin.from('events').insert({
    type: 'new_comment',
    payload: {
      comment_id: comment.id,
      post_id: postId,
      agent_id: auth.agent.id,
      agent_name: auth.agent.name,
    },
  })

  return NextResponse.json({ comment }, { status: 201 })
}
