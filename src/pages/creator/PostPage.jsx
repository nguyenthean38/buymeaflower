import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Heart, MessageCircle, Share2, Lock, Pencil, Crown } from 'lucide-react'
import { Avatar, Button, Badge } from '@/components/ui'
import { FlowerArt } from '@/components/brand/Flower'
import { cn } from '@/lib/cn'
import { formatDate, timeAgo } from '@/lib/format'
import { DOMAIN, VISIBILITY_LABEL } from '@/data/reference'
import { useApp, useAuth, resolveCreator, uid, nowISO, toast } from '@/store'
import { CreatorTopBar, CreatorFooter, AudioPlayer, useAccess } from '@/features/creator/parts'
import { copyText } from '@/features/support/SupportBox'
import NotFoundPage from '@/pages/public/NotFoundPage'

export default function PostPage() {
  const { username, postId } = useParams()
  const state = useApp()
  const creator = useMemo(() => resolveCreator(state, username), [state, username])
  const post = creator?.posts.find((p) => p.id === postId)
  if (!creator || !post) return <NotFoundPage what="bài viết" />
  return <PostView creator={creator} post={post} />
}

function PostView({ creator, post }) {
  const { page } = creator
  const access = useAccess(creator)
  const mutate = useApp((s) => s.mutate)
  const visitor = useApp((s) => s.visitor)
  const signedIn = useAuth((s) => s.signedIn)
  const me = useApp((s) => s.page)
  const [text, setText] = useState('')
  const locked = !access.canSee(post.visibility) || (post.status !== 'published' && !access.owner)

  // Bài của chính mình: sửa thẳng dữ liệu. Bài của người khác: lưu dấu vết ở visitor.
  const own = creator.isOwner
  const liked = own ? post.liked : !!visitor.liked[post.id]
  const likes = post.likes + (!own && liked ? 1 : 0)
  const comments = own ? post.comments : [...post.comments, ...(visitor.comments[post.id] || [])]

  const toggleLike = () => mutate((d) => {
    if (own) { const p = d.posts.find((x) => x.id === post.id); p.liked = !p.liked; p.likes += p.liked ? 1 : -1 }
    else d.visitor.liked[post.id] = !d.visitor.liked[post.id]
  })
  const addComment = () => {
    const c = { id: uid('bl'), name: signedIn ? me.name : 'Khách ghé thăm', avatarColor: signedIn ? me.avatarColor : '#7d6570', text: text.trim(), at: nowISO() }
    mutate((d) => {
      if (own) d.posts.find((x) => x.id === post.id).comments.push(c)
      else (d.visitor.comments[post.id] ||= []).push(c)
    })
    setText('')
  }

  return (
    <div className="min-h-dvh bg-canvas" style={{ '--page': page.themeColor }}>
      <CreatorTopBar creator={creator} owner={access.owner} onEdit={() => {}} />
      <article className="mx-auto max-w-[720px] px-4 pt-6">
        <Link to={`/${page.username}?tab=bai-viet`} className="inline-flex items-center gap-1.5 text-[13.5px] font-[550] text-muted hover:text-fg"><ArrowLeft size={16} /> Tất cả bài viết</Link>

        <div className="card mt-4 overflow-hidden rounded-3xl">
          <div className="p-5 sm:p-8">
            <div className="flex items-center gap-3">
              <Link to={`/${page.username}`}><Avatar name={page.name} color={page.avatarColor} size={40} /></Link>
              <div className="min-w-0 flex-1">
                <Link to={`/${page.username}`} className="block text-[14px] font-[650] hover:underline">{page.name}</Link>
                <div className="flex flex-wrap items-center gap-2 text-[12.5px] text-muted">{formatDate(post.at)} · {timeAgo(post.at)}
                  {post.visibility !== 'public' && <Badge tone="gold" size="sm" icon={Lock}>{VISIBILITY_LABEL[post.visibility]}</Badge>}
                  {post.status !== 'published' && <Badge tone="warn" size="sm">{post.status === 'draft' ? 'Bản nháp' : 'Hẹn giờ'}</Badge>}
                </div>
              </div>
              {access.owner && <Button size="sm" variant="outline" icon={Pencil} to={`/quan-ly/bai-viet/${post.id}`}>Sửa bài</Button>}
            </div>
            <h1 className="mt-5 text-[26px] font-[750] leading-tight tracking-tight sm:text-[30px]">{post.title}</h1>
            {post.categories?.length > 0 && <div className="mt-3 flex flex-wrap gap-1.5">{post.categories.map((c) => <Badge key={c}>{c}</Badge>)}</div>}

            {locked ? (
              <div className="mt-6 rounded-3xl bg-page-soft px-6 py-10 text-center">
                <span className="mx-auto grid size-12 place-items-center rounded-full bg-page text-white"><Lock size={20} /></span>
                <h2 className="mt-3 text-[18px] font-[700]">Bài viết dành cho {VISIBILITY_LABEL[post.visibility]?.toLowerCase().replace('chỉ ', '')}</h2>
                <p className="mx-auto mt-1 max-w-sm text-[14px] text-dim">{post.visibility === 'members' ? `Trở thành hội viên của ${page.name} để đọc bài này và mọi nội dung riêng khác.` : `Tặng ${page.name} một ${page.item.name} để mở khoá bài này.`}</p>
                <div className="mt-4 flex justify-center gap-2">
                  {post.visibility === 'members'
                    ? <Link to={`/${page.username}?tab=hoi-vien`} className="inline-flex h-11 items-center gap-2 rounded-full bg-page px-5 text-[14.5px] font-[650] text-white"><Crown size={17} /> Xem các hạng hội viên</Link>
                    : <Link to={`/${page.username}`} className="inline-flex h-11 items-center gap-2 rounded-full bg-page px-5 text-[14.5px] font-[650] text-white">{page.item.emoji} Tặng {page.item.name}</Link>}
                </div>
              </div>
            ) : (
              <>
                {post.type === 'audio' && <AudioPlayer duration={post.audio?.duration} seed={post.images?.[0] || 9} className="mt-6" />}
                {post.type === 'text' && post.images?.[0] && <FlowerArt seed={post.images[0]} className="mt-6 h-64 w-full rounded-2xl" />}
                <div className="prose-post mt-5" dangerouslySetInnerHTML={{ __html: post.html }} />
                {post.type === 'text' && post.images?.length > 1 && (
                  <div className="mt-4 grid grid-cols-2 gap-3">{post.images.slice(1).map((s) => <FlowerArt key={s} seed={s} className="aspect-[4/3] w-full rounded-2xl" />)}</div>
                )}
                {post.type === 'album' && (
                  <div className="mt-4 grid grid-cols-2 gap-3">{post.images.map((s) => <FlowerArt key={s} seed={s} className="aspect-[4/3] w-full rounded-2xl" />)}</div>
                )}
              </>
            )}
          </div>

          {!locked && (
            <div className="border-t border-line px-5 py-4 sm:px-8">
              <div className="flex items-center gap-1">
                <button onClick={toggleLike} aria-pressed={liked} className={cn('inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13.5px] font-[550] transition-colors', liked ? 'bg-page-soft text-page' : 'text-dim hover:bg-hover')}>
                  <Heart size={17} className={liked ? 'fill-page' : ''} /> {likes}
                </button>
                <span className="inline-flex h-9 items-center gap-1.5 px-3 text-[13.5px] text-dim"><MessageCircle size={17} /> {comments.length}</span>
                <button onClick={() => copyText(`https://${DOMAIN}/${page.username}/bai-viet/${post.id}`, 'Đã sao chép liên kết bài viết')} className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full px-3 text-[13.5px] text-dim hover:bg-hover"><Share2 size={16} /> Chia sẻ</button>
              </div>

              <ul className="mt-2 space-y-4">
                {comments.map((c) => (
                  <li key={c.id} className="flex gap-3">
                    <Avatar name={c.name} color={c.avatarColor} size={32} />
                    <div className="min-w-0"><div className="text-[13.5px]"><b className="font-[620]">{c.name}</b> <span className="text-[12px] text-faint">· {timeAgo(c.at)}</span></div><p className="text-[14px] text-dim">{c.text}</p></div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-2">
                <input value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && text.trim() && addComment()} placeholder="Viết bình luận…" maxLength={300} className="h-10 min-w-0 flex-1 rounded-full bg-subtle px-4 text-[14px] outline-none ring-page/40 focus:ring-2" />
                <Button variant="primary" disabled={!text.trim()} onClick={addComment}>Gửi</Button>
              </div>
            </div>
          )}
        </div>

        {!access.owner && (
          <div className="mt-5 flex flex-col items-center gap-3 rounded-3xl bg-page-soft px-6 py-6 text-center sm:flex-row sm:text-left">
            <span className="text-[38px] leading-none">{page.item.emoji}</span>
            <div className="flex-1"><div className="text-[16px] font-[700]">Thích bài này?</div><p className="text-[14px] text-dim">Tặng {page.name} một {page.item.name} để tiếp sức cho bài kế tiếp.</p></div>
            <Link to={`/${page.username}`} className="inline-flex h-11 shrink-0 items-center rounded-full bg-page px-5 text-[14.5px] font-[650] text-white hover:brightness-95">Tặng {page.item.name}</Link>
          </div>
        )}
      </article>
      <CreatorFooter page={page} />
    </div>
  )
}
