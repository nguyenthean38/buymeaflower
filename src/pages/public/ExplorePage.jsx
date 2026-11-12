import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { Heart, Search, SearchX } from 'lucide-react'
import { Avatar, EmptyState, Button } from '@/components/ui'
import { FlowerArt } from '@/components/brand/Flower'
import { cn } from '@/lib/cn'
import { formatNumber, stripAccents } from '@/lib/format'
import { CREATORS } from '@/data/creators'
import { useApp, resolveCreator } from '@/store'
import { PublicNav, PublicFooter } from '@/features/public/PublicChrome'

export default function ExplorePage() {
  const [params, setParams] = useSearchParams()
  const q = params.get('q') || ''
  const cat = params.get('linh-vuc') || ''
  const state = useApp()
  const all = useMemo(() => [resolveCreator(state, state.page.username), ...CREATORS], [state])
  const cats = useMemo(() => [...new Set(all.map((c) => c.page.category).filter(Boolean))], [all])
  const norm = (s) => stripAccents(s || '').toLowerCase()
  const list = all.filter((c) => (!cat || c.page.category === cat) && (!q || norm(`${c.page.name} ${c.page.tagline} ${c.page.username} ${c.page.category}`).includes(norm(q))))
  const update = (patch) => {
    const next = { q, 'linh-vuc': cat, ...patch }
    setParams(Object.fromEntries(Object.entries(next).filter(([, v]) => v)), { replace: true })
  }

  return (
    <div className="min-h-dvh bg-canvas">
      <PublicNav />
      <main className="mx-auto max-w-[1180px] px-4 pb-20 pt-10 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h1 className="text-[32px] font-[800] tracking-[-0.03em] sm:text-[42px]">Khám phá nhà sáng tạo</h1>
          <p className="mt-2 text-[16px] text-dim">Tìm một người đang làm điều bạn thích và tặng họ một bông hoa.</p>
          <label className="mt-6 flex h-13 items-center gap-3 rounded-full border border-line-strong bg-surface px-5 py-3 shadow-sm focus-within:shadow-md">
            <Search size={19} className="text-faint" />
            <input autoFocus value={q} onChange={(e) => update({ q: e.target.value })} placeholder="Tìm theo tên, lĩnh vực, việc đang làm…" aria-label="Tìm nhà sáng tạo" className="min-w-0 flex-1 bg-transparent text-[15.5px] outline-none" />
          </label>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {['', ...cats].map((c) => (
            <button key={c || 'all'} onClick={() => update({ 'linh-vuc': c })} aria-pressed={cat === c}
              className={cn('rounded-full border px-3.5 py-1.5 text-[13.5px] font-[550] transition-colors', cat === c ? 'border-fg bg-fg text-canvas' : 'border-line bg-surface text-dim hover:bg-subtle')}>
              {c || 'Tất cả'}
            </button>
          ))}
        </div>

        {list.length === 0 ? (
          <EmptyState icon={SearchX} title="Không tìm thấy ai phù hợp" desc="Thử một từ khoá khác, hoặc bỏ bộ lọc lĩnh vực." action={<Button onClick={() => setParams({})}>Xoá bộ lọc</Button>} className="mt-8" />
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <Link key={c.page.username} to={`/${c.page.username}`} className="card group overflow-hidden rounded-3xl transition-shadow hover:shadow-md">
                {c.page.cover ? <FlowerArt seed={c.page.cover.seed} variant={c.page.cover.variant} className="h-24 w-full" /> : <div className="h-24 bg-brand-50" />}
                <div className="-mt-8 px-5 pb-5">
                  <Avatar name={c.page.name} color={c.page.avatarColor} size={60} className="ring-4 ring-surface" />
                  <div className="mt-2 flex items-center gap-2"><span className="text-[16.5px] font-[700] tracking-tight group-hover:text-brand-ink">{c.page.name}</span>{c.isOwner && <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11.5px] font-[600] text-brand-ink">Trang demo</span>}</div>
                  <p className="mt-0.5 line-clamp-2 min-h-[40px] text-[13.5px] text-muted">{c.page.tagline}</p>
                  <div className="mt-3 flex items-center justify-between text-[12.5px]">
                    <span className="inline-flex items-center gap-1 text-dim"><Heart size={13} className="fill-brand-400 text-brand-400" /> {formatNumber(c.supporterCount)} người ủng hộ</span>
                    <span className="rounded-full bg-subtle px-2.5 py-0.5 text-muted">{c.page.category}</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
      <PublicFooter />
    </div>
  )
}
