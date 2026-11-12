import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Heart, Check, Lock, Link2, UserPlus, UserCheck, Landmark, Crown, Download, Target, Reply, Pencil, PlayCircle } from 'lucide-react'
import { Avatar, Button, Badge, Modal, EmptyState, Textarea, Checkbox, MoneyInput, Tabs } from '@/components/ui'
import { FlowerArt } from '@/components/brand/Flower'
import { cn } from '@/lib/cn'
import { formatVND, formatNumber, timeAgo } from '@/lib/format'
import { SHOP_KIND_LABEL, VISIBILITY_LABEL } from '@/data/reference'
import { useApp, useAuth, resolveCreator, summarize, toast } from '@/store'
import { SupportBox, ThankYouModal } from '@/features/support/SupportBox'
import { PaymentModal } from '@/features/support/PaymentModal'
import { CreatorTopBar, CreatorFooter, PostCard, useAccess } from '@/features/creator/parts'
import { EditPageModal } from '@/features/creator/EditPageModal'
import NotFoundPage from '@/pages/public/NotFoundPage'

export default function CreatorPage() {
  const { username } = useParams()
  const state = useApp()
  const creator = useMemo(() => resolveCreator(state, username), [state, username])
  if (!creator) return <NotFoundPage what="trang" />
  return <CreatorView key={username} creator={creator} />
}

function CreatorView({ creator }) {
  const { page, settings, membership, shop, posts, gallery } = creator
  const access = useAccess(creator)
  const { owner } = access
  const [params, setParams] = useSearchParams()
  const [editing, setEditing] = useState(false)
  const payoutConnected = useApp((s) => s.payout.connected)
  const following = useApp((s) => s.following.some((f) => f.username === page.username))
  const toggleFollow = useApp((s) => s.toggleFollow)

  const published = posts.filter((p) => p.status === 'published')
  const levels = membership.enabled ? membership.levels.filter((l) => l.published !== false) : []
  const items = shop.items.filter((i) => i.active !== false)
  const tabs = [
    { value: 'trang-chu', label: 'Trang chủ' },
    levels.length > 0 && { value: 'hoi-vien', label: 'Hội viên' },
    published.length > 0 && { value: 'bai-viet', label: 'Bài viết', count: published.length },
    gallery.length > 0 && { value: 'bo-anh', label: 'Bộ ảnh' },
    items.length > 0 && { value: 'cua-hang', label: shop.word || 'Cửa hàng' },
  ].filter(Boolean)
  const tab = tabs.some((t) => t.value === params.get('tab')) ? params.get('tab') : 'trang-chu'
  const setTab = (v) => setParams(v === 'trang-chu' ? {} : { tab: v }, { preventScrollReset: true })

  return (
    <div className="min-h-dvh bg-canvas" style={{ '--page': page.themeColor }}>
      {owner && !payoutConnected && (
        <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 bg-gold-soft px-4 py-2 text-center text-[13px] text-dim">
          <span>Trang của bạn đã hoạt động! Liên kết tài khoản ngân hàng để bắt đầu nhận tiền ủng hộ.</span>
          <Button to="/quan-ly/rut-tien" variant="inverse" size="xs" icon={Landmark}>Thiết lập</Button>
        </div>
      )}
      <CreatorTopBar creator={creator} owner={owner} onEdit={() => setEditing(true)} />

      {/* Ảnh bìa + hồ sơ */}
      <div className="relative">
        {page.cover ? <FlowerArt wide seed={page.cover.seed} variant={page.cover.variant} className="h-40 w-full sm:h-56" /> : <div className="h-28 w-full bg-page-soft sm:h-36" />}
        {owner && <button onClick={() => setEditing(true)} className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-surface/90 px-3 py-1.5 text-[12.5px] font-[550] shadow-sm backdrop-blur hover:bg-surface"><Pencil size={13} /> {page.cover ? 'Đổi ảnh bìa' : 'Thêm ảnh bìa'}</button>}
      </div>
      <div className="relative z-10 mx-auto -mt-12 flex max-w-[1040px] flex-col items-center px-4 text-center sm:-mt-14">
        <Avatar name={page.name} color={page.avatarColor} size={104} className="ring-[5px] ring-canvas" />
        <h1 className="mt-3 text-[26px] font-[750] tracking-tight">{page.name}</h1>
        {page.tagline && <p className="mt-0.5 text-[15px] text-dim">{page.tagline}</p>}
        <div className="mt-3 flex flex-wrap items-center justify-center gap-2.5">
          {page.showCount && creator.supporterCount > 0 && (
            <span className="inline-flex items-center gap-1.5 text-[13.5px] text-muted"><Heart size={15} className="fill-page text-page" /><b className="num font-[650] text-fg">{formatNumber(creator.supporterCount)}</b> người ủng hộ</span>
          )}
          {page.category && <Badge>{page.category}</Badge>}
          {!owner && (
            <Button size="sm" variant={following ? 'secondary' : 'outline'} icon={following ? UserCheck : UserPlus}
              onClick={() => { toggleFollow(page.username); toast(following ? `Đã bỏ theo dõi ${page.name}` : `Đã theo dõi ${page.name}`) }}>
              {following ? 'Đang theo dõi' : 'Theo dõi'}
            </Button>
          )}
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-[1040px] px-4">
        {tabs.length > 1 && <Tabs options={tabs} value={tab} onChange={setTab} className="mb-6 sm:justify-center" />}

        {tab === 'trang-chu' && (
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
            <div className="order-2 flex min-w-0 flex-col gap-6 lg:order-1">
              <AboutCard creator={creator} owner={owner} onEdit={() => setEditing(true)} />
              {settings.goal?.on && settings.goal.target > 0 && <GoalCard creator={creator} />}
              {published.filter((p) => p.pinned).slice(0, 1).map((p) => <PostCard key={p.id} post={p} username={page.username} locked={!access.canSee(p.visibility)} />)}
              <SupportFeed creator={creator} owner={owner} />
            </div>
            <div className="order-1 lg:sticky lg:top-20 lg:order-2">
              <SupportBox creator={creator} />
              {levels.length > 0 && (
                <button onClick={() => setTab('hoi-vien')} className="mt-3 flex w-full items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-left transition-colors hover:bg-subtle">
                  <span className="grid size-9 place-items-center rounded-full bg-page-soft text-page"><Crown size={17} /></span>
                  <span className="flex-1"><span className="block text-[14px] font-[600]">Trở thành hội viên</span><span className="ds-caption">Từ {formatVND(Math.min(...levels.map((l) => l.price)))} mỗi tháng</span></span>
                </button>
              )}
            </div>
          </div>
        )}

        {tab === 'hoi-vien' && <LevelsTab creator={creator} levels={levels} access={access} />}

        {tab === 'bai-viet' && (
          <div className="mx-auto grid max-w-[720px] gap-5">
            {[...published].sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0) || new Date(b.at) - new Date(a.at)).map((p) => (
              <PostCard key={p.id} post={p} username={page.username} locked={!access.canSee(p.visibility)} />
            ))}
          </div>
        )}

        {tab === 'bo-anh' && <GalleryTab creator={creator} access={access} />}
        {tab === 'cua-hang' && <ShopTab creator={creator} items={items} access={access} />}
      </div>

      <CreatorFooter page={page} />
      {owner && <EditPageModal open={editing} onClose={() => setEditing(false)} />}
    </div>
  )
}

function AboutCard({ creator, owner, onEdit }) {
  const { page } = creator
  const empty = !page.about && !page.video && page.socials.length === 0
  return (
    <section className="card rounded-3xl p-5 sm:p-6">
      <div className="flex items-center justify-between">
        <h2 className="ds-h2">Về {page.name}</h2>
        {owner && <Button size="xs" variant="ghost" icon={Pencil} onClick={onEdit}>Sửa</Button>}
      </div>
      {empty ? (
        <p className="mt-3 text-[14px] text-muted">{owner ? 'Hãy viết đôi dòng giới thiệu để người ghé thăm hiểu bạn đang làm gì.' : `${page.name} chưa viết lời giới thiệu.`}</p>
      ) : (
        <>
          {page.about && <p className="mt-3 whitespace-pre-line text-[14.5px] leading-relaxed text-dim">{page.about}</p>}
          {page.video && (
            <a href={page.video} target="_blank" rel="noreferrer" className="relative mt-4 block overflow-hidden rounded-2xl">
              <FlowerArt seed={(page.cover?.seed || 5) + 50} className="h-48 w-full" />
              <span className="absolute inset-0 grid place-items-center bg-fg/20"><PlayCircle size={54} className="text-white drop-shadow" /></span>
            </a>
          )}
          {page.socials.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {page.socials.map((s) => (
                <a key={s} href={s} target="_blank" rel="noreferrer" className="inline-flex max-w-full items-center gap-1.5 rounded-full bg-subtle px-3 py-1.5 text-[12.5px] text-dim hover:bg-hover">
                  <Link2 size={13} className="shrink-0" /><span className="truncate">{s.replace(/^https?:\/\//, '')}</span>
                </a>
              ))}
            </div>
          )}
        </>
      )}
    </section>
  )
}

function GoalCard({ creator }) {
  const { goal } = creator.settings
  const raised = (goal.start || 0) + summarize(creator.supports, 30).total
  const pct = Math.min(100, Math.round((raised / goal.target) * 100))
  return (
    <section className="card rounded-3xl p-5 sm:p-6">
      <div className="flex items-center gap-2 ds-label"><Target size={14} /> Mục tiêu</div>
      <h2 className="mt-1.5 text-[17px] font-[650] tracking-tight">{goal.title}</h2>
      {goal.desc && <p className="mt-1 text-[14px] text-muted">{goal.desc}</p>}
      <div className="mt-4 h-3 w-full overflow-hidden rounded-full bg-page-soft"><div className="h-full rounded-full bg-page transition-[width] duration-700" style={{ width: pct + '%' }} /></div>
      <div className="mt-2 flex justify-between text-[13px]"><span><b className="num font-[650]">{formatVND(raised)}</b> <span className="text-muted">đã góp</span></span><span className="num text-muted">{pct}% của {formatVND(goal.target)}</span></div>
    </section>
  )
}

function SupportFeed({ creator, owner }) {
  const { page } = creator
  const mutate = useApp((s) => s.mutate)
  const [more, setMore] = useState(6)
  const [replyTo, setReplyTo] = useState(null)
  const [text, setText] = useState('')
  const list = creator.supports.filter((s) => s.type !== 'shop')
  const saveReply = () => {
    mutate((d) => { const s = d.supports.find((x) => x.id === replyTo); if (s) s.reply = text.trim() })
    setReplyTo(null); setText(''); toast('Đã gửi lời cảm ơn')
  }
  return (
    <section className="card rounded-3xl p-5 sm:p-6">
      <h2 className="ds-h2">Những người ủng hộ gần đây</h2>
      {list.length === 0 ? (
        <div className="mt-4 rounded-2xl bg-page-soft px-4 py-8 text-center">
          <Heart size={22} className="mx-auto fill-page text-page" />
          <p className="mt-2 text-[14px] text-dim">Hãy là người đầu tiên tặng {page.name} một {page.item.name}.</p>
        </div>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {list.slice(0, more).map((s) => {
            const hidden = s.private && !owner
            return (
              <li key={s.id} className="flex gap-3 py-4">
                <Avatar name={s.name} color={s.avatarColor} size={38} />
                <div className="min-w-0 flex-1">
                  <p className="text-[14px]">
                    <b className="font-[620]">{s.name}</b>{' '}
                    <span className="text-dim">{s.type === 'membership' ? 'đã trở thành hội viên' : <>đã tặng {s.qty} {page.item.name} {page.item.emoji}</>}</span>
                    <span className="ml-1.5 whitespace-nowrap text-[12.5px] text-faint">· {timeAgo(s.at)}</span>
                  </p>
                  {s.message && (hidden
                    ? <p className="mt-1.5 inline-flex items-center gap-1.5 rounded-2xl bg-subtle px-3 py-2 text-[13px] text-muted"><Lock size={12} /> Lời nhắn riêng tư</p>
                    : <p className="mt-1.5 inline-block rounded-2xl rounded-tl-md bg-subtle px-3.5 py-2 text-[14px] text-dim">{s.message}{s.private && <Lock size={11} className="ml-1.5 inline text-faint" />}</p>)}
                  {s.reply && (
                    <div className="mt-2 flex gap-2">
                      <Avatar name={page.name} color={page.avatarColor} size={24} />
                      <p className="rounded-2xl rounded-tl-md bg-page-soft px-3 py-1.5 text-[13.5px] text-dim">{s.reply}</p>
                    </div>
                  )}
                  {owner && creator.isOwner && !s.reply && replyTo !== s.id && (
                    <button onClick={() => { setReplyTo(s.id); setText('') }} className="mt-1.5 inline-flex items-center gap-1 text-[12.5px] font-[550] text-muted hover:text-page"><Reply size={13} /> Cảm ơn lại</button>
                  )}
                  {replyTo === s.id && (
                    <div className="mt-2 flex gap-2">
                      <input autoFocus value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && text.trim() && saveReply()} placeholder="Viết lời cảm ơn…" className="h-9 min-w-0 flex-1 rounded-full bg-subtle px-3.5 text-[13.5px] outline-none" />
                      <Button size="sm" variant="primary" disabled={!text.trim()} onClick={saveReply}>Gửi</Button>
                      <Button size="sm" variant="ghost" onClick={() => setReplyTo(null)}>Huỷ</Button>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
      {list.length > more && <Button className="mt-1 w-full" onClick={() => setMore(more + 10)}>Xem thêm</Button>}
    </section>
  )
}

/* ---------------- Hội viên ---------------- */
function LevelsTab({ creator, levels, access }) {
  const { page } = creator
  const addSupport = useApp((s) => s.addSupport)
  const signedIn = useAuth((s) => s.signedIn)
  const [yearly, setYearly] = useState(false)
  const [pick, setPick] = useState(null)
  const [done, setDone] = useState(null)
  const annualOk = creator.membership.settings?.annual !== false
  const price = (l) => (yearly && l.yearly ? l.yearly : l.price)
  const join = () => {
    addSupport(page.username, { type: 'membership', levelId: pick.id, name: signedIn && !creator.isOwner ? useApp.getState().page.name : 'Bạn', amount: price(pick), qty: 1 })
    setDone(pick); setPick(null)
  }
  return (
    <div>
      <div className="mx-auto max-w-xl text-center">
        <h2 className="text-[22px] font-[700] tracking-tight">Đồng hành cùng {page.name} mỗi tháng</h2>
        <p className="mt-1 text-[14px] text-muted">Hội viên nhận nội dung riêng và giúp {page.name} yên tâm sáng tạo lâu dài. Huỷ bất cứ lúc nào.</p>
        {annualOk && (
          <div className="mt-4 inline-flex rounded-full bg-subtle p-1 text-[13px] font-[550]">
            {[[false, 'Theo tháng'], [true, 'Theo năm · tiết kiệm 2 tháng']].map(([v, l]) => (
              <button key={l} onClick={() => setYearly(v)} className={cn('rounded-full px-3.5 py-1.5 transition-colors', yearly === v ? 'bg-surface shadow-sm text-fg' : 'text-muted')}>{l}</button>
            ))}
          </div>
        )}
      </div>
      <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {levels.map((l) => {
          const current = access.memberLevel === l.id
          return (
            <div key={l.id} className={cn('card flex flex-col overflow-hidden rounded-3xl', current && 'ring-2 ring-page')}>
              <FlowerArt seed={l.art || 3} variant="bouquet" className="h-28 w-full" />
              <div className="flex flex-1 flex-col p-5">
                <h3 className="text-[18px] font-[700] tracking-tight">{l.name}</h3>
                <div className="mt-1"><span className="num text-[24px] font-[750] tracking-tight">{formatVND(price(l))}</span><span className="text-[13px] text-muted"> / {yearly && l.yearly ? 'năm' : 'tháng'}</span></div>
                {l.limit && <Badge tone="gold" className="mt-2 self-start">Giới hạn {l.limit} hội viên</Badge>}
                <button disabled={current || access.owner} onClick={() => setPick(l)}
                  className="mt-4 h-11 w-full rounded-full bg-page text-[14.5px] font-[650] text-white transition-[filter] hover:brightness-95 disabled:opacity-50">
                  {current ? 'Hạng hiện tại của bạn' : access.owner ? 'Đây là trang của bạn' : 'Tham gia'}
                </button>
                <p className="mt-4 text-[14px] text-dim">{l.desc}</p>
                <ul className="mt-3 space-y-2">
                  {l.rewards.map((r) => <li key={r} className="flex gap-2 text-[13.5px] text-dim"><Check size={16} className="mt-0.5 shrink-0 text-page" />{r}</li>)}
                </ul>
              </div>
            </div>
          )
        })}
      </div>
      <PaymentModal open={!!pick} onClose={() => setPick(null)} amount={pick ? price(pick) : 0} onSuccess={join}
        title={pick ? `Hội viên hạng ${pick.name} của ${page.name}` : ''}
        lines={pick ? [{ label: `Hạng ${pick.name} (${yearly && pick.yearly ? 'năm' : 'tháng'} đầu)`, value: formatVND(price(pick)) }] : []} />
      <ThankYouModal open={!!done} onClose={() => setDone(null)} creator={creator} title={`Chào mừng bạn đến hạng ${done?.name}!`} message={done?.welcome} />
    </div>
  )
}

/* ---------------- Bộ ảnh ---------------- */
function GalleryTab({ creator, access }) {
  const [view, setView] = useState(null)
  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3">
        {creator.gallery.map((g) => {
          const locked = !access.canSee(g.visibility)
          return (
            <button key={g.id} onClick={() => (locked ? toast({ title: `Ảnh dành cho ${VISIBILITY_LABEL[g.visibility].toLowerCase()}`, desc: 'Hãy ủng hộ để mở khoá.', tone: 'info' }) : setView(g))} className="group relative overflow-hidden rounded-2xl text-left">
              <FlowerArt seed={g.art} className={cn('aspect-[4/3] w-full transition-transform duration-300 group-hover:scale-[1.03]', locked && 'blur-lg scale-110')} />
              <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/55 to-transparent px-3 pb-2.5 pt-8 text-[13px] font-[600] text-white">{g.title}</span>
              {locked && <span className="absolute inset-0 grid place-items-center"><span className="grid size-10 place-items-center rounded-full bg-fg/75 text-canvas"><Lock size={17} /></span></span>}
            </button>
          )
        })}
      </div>
      <Modal open={!!view} onClose={() => setView(null)} title={view?.title} desc={view && timeAgo(view.at)} size="lg">
        {view && (
          <>
            <FlowerArt seed={view.art} className="w-full rounded-2xl" />
            {view.desc && <p className="mt-3 text-[14px] text-dim">{view.desc}</p>}
            <div className="mt-3 flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-[13px] text-muted"><Heart size={15} /> {view.likes} lượt thích</span>
              {view.downloadable && <Button size="sm" icon={Download} onClick={() => toast('Bản demo: tệp gốc chưa có để tải')}>Tải bản gốc</Button>}
            </div>
          </>
        )}
      </Modal>
    </>
  )
}

/* ---------------- Cửa hàng ---------------- */
function ShopTab({ creator, items, access }) {
  const { page } = creator
  const addSupport = useApp((s) => s.addSupport)
  const [item, setItem] = useState(null)
  const [amount, setAmount] = useState(0)
  const [answer, setAnswer] = useState('')
  const [agree, setAgree] = useState(true)
  const [paying, setPaying] = useState(false)
  const [done, setDone] = useState(null)
  const base = (i) => (access.member && i.memberPrice > 0 ? i.memberPrice : i.price)
  const open = (i) => { setItem(i); setAmount(base(i)); setAnswer(''); setPaying(false) }
  const buy = () => {
    if (amount <= 0) { // sản phẩm miễn phí: không cần thanh toán
      addSupport(page.username, { type: 'shop', itemId: item.id, name: 'Bạn', amount: 0, answer }); setDone(item); setItem(null); return
    }
    setPaying(true)
  }
  const paid = () => { addSupport(page.username, { type: 'shop', itemId: item.id, name: 'Bạn', amount, answer }); setPaying(false); setDone(item); setItem(null) }
  const invalid = item && (amount < base(item) || (item.question && !answer.trim()))
  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((i) => (
          <button key={i.id} onClick={() => open(i)} className="card group overflow-hidden rounded-3xl text-left transition-shadow hover:shadow-md">
            <div className="relative"><FlowerArt seed={i.art} className="aspect-[4/3] w-full" /><Badge className="absolute left-3 top-3 bg-surface/90 backdrop-blur">{SHOP_KIND_LABEL[i.kind] || 'Sản phẩm'}</Badge></div>
            <div className="p-4">
              <h3 className="text-[15.5px] font-[650] leading-snug group-hover:text-page">{i.name}</h3>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="num text-[15px] font-[700]">{i.price > 0 ? formatVND(i.price) : 'Tuỳ tâm'}</span>
                {i.price > 0 && i.payWhatYouWant && <span className="ds-caption">trở lên</span>}
                {i.memberPrice > 0 && <Badge tone="brand" size="sm" icon={Crown}>Hội viên {formatVND(i.memberPrice)}</Badge>}
              </div>
            </div>
          </button>
        ))}
      </div>
      {items.length === 0 && <EmptyState title="Chưa có sản phẩm nào" />}

      <Modal open={!!item && !paying} onClose={() => setItem(null)} size="lg" title={item?.name} desc={item && (SHOP_KIND_LABEL[item.kind] || 'Sản phẩm')}>
        {item && (
          <div className="grid gap-5 sm:grid-cols-[240px_1fr]">
            <FlowerArt seed={item.art} className="aspect-square w-full rounded-2xl" />
            <div className="flex flex-col gap-4">
              <p className="text-[14px] leading-relaxed text-dim">{item.desc}</p>
              {item.limit && <Badge tone="gold" className="self-start">Chỉ còn nhận {item.limit} suất</Badge>}
              {item.payWhatYouWant
                ? <MoneyInput label={base(item) > 0 ? `Bạn muốn trả bao nhiêu? (tối thiểu ${formatVND(base(item))})` : 'Tuỳ tâm ủng hộ (có thể để 0)'} value={amount} onChange={setAmount} error={amount < base(item) ? 'Thấp hơn mức tối thiểu' : undefined} />
                : <div><span className="num text-[24px] font-[750] tracking-tight">{formatVND(base(item))}</span>{access.member && item.memberPrice > 0 && <span className="ml-2 text-[13px] text-muted line-through">{formatVND(item.price)}</span>}</div>}
              {item.question && <Textarea label={item.question} rows={2} value={answer} onChange={(e) => setAnswer(e.target.value)} />}
              <Checkbox checked={agree} onChange={setAgree} label="Nhận thư xác nhận và tin mới từ nhà sáng tạo" />
              <button disabled={invalid || access.owner} onClick={buy} className="h-12 w-full rounded-full bg-page text-[15px] font-[650] text-white transition-[filter] hover:brightness-95 disabled:opacity-50">
                {access.owner ? 'Đây là sản phẩm của bạn' : amount > 0 ? `Mua ${formatVND(amount)}` : 'Nhận miễn phí'}
              </button>
            </div>
          </div>
        )}
      </Modal>
      <PaymentModal open={paying} onClose={() => setPaying(false)} amount={amount} onSuccess={paid} title={item ? `${item.name} — ${page.name}` : ''} lines={item ? [{ label: item.name, value: formatVND(amount) }] : []} />
      <ThankYouModal open={!!done} onClose={() => setDone(null)} creator={creator} title="Đơn hàng đã xong!" message={done?.successMsg} />
    </>
  )
}
