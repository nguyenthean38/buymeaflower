import { useEffect, useMemo, useRef, useState } from 'react'
import { ArrowLeft, ChevronRight, Crown, Heart, Mail, MessageCircle, MessagesSquare, Plus, Search, Send, Settings, Users } from 'lucide-react'
import { DashPage } from '@/components/layout/DashPage'
import { Avatar, Button, Checkbox, Divider, EmptyState, IconButton, Modal, SearchInput, Segmented, Select } from '@/components/ui'
import { useApp, toast, uid, nowISO, supporterCount } from '@/store'
import { formatNumber, formatRelative, formatTime, startOfDay, timeAgo } from '@/lib/format'
import { cn } from '@/lib/cn'
import { matches } from '@/features/dangtai/shared'

const GROUPS = {
  followers: { label: 'Người theo dõi', icon: Users, desc: 'Mọi người đang theo dõi trang của bạn' },
  supporters: { label: 'Người ủng hộ', icon: Heart, desc: 'Những người đã tặng hoa, mua hàng hoặc là hội viên' },
  members: { label: 'Hội viên', icon: Crown, desc: 'Hội viên của mọi hạng' },
}
const GROUP_KEYS = Object.keys(GROUPS)

const MESSAGING_OPTIONS = [
  { value: 'creator', label: 'Chỉ khi tôi nhắn trước', desc: 'Người khác chỉ trả lời được những hội thoại do bạn bắt đầu.' },
  { value: 'supporters', label: 'Người ủng hộ được nhắn cho tôi', desc: 'Ai đã tặng hoa, mua hàng hoặc là hội viên đều có thể mở lời trước.' },
  { value: 'everyone', label: 'Mọi người', desc: 'Bất kỳ ai ghé trang cũng có thể nhắn tin cho bạn.' },
]

const REPLIES = [
  'Dạ, cảm ơn bạn nhiều ạ! 🌸',
  'Mình nhận được rồi, cảm ơn bạn đã nhắn nhé!',
  'Tuyệt quá, mình cảm ơn ạ. Chúc bạn một ngày thật nhiều hoa!',
  'Cảm ơn bạn đã dành thời gian trả lời mình ạ 💐',
  'Dạ vâng ạ, mình hóng tác phẩm mới của bạn lắm!',
  'Cảm ơn bạn nha, đọc tin mà vui cả buổi luôn.',
]

const nameOf = (c) => (c.group ? GROUPS[c.group]?.label || 'Nhóm' : c.with?.name || 'Người dùng')
const lastOf = (c) => c.messages[c.messages.length - 1]
const stampOf = (c) => new Date(lastOf(c)?.at || c.createdAt || 0).getTime()
const personKey = (p) => (p.email || p.name || '').toLowerCase()

/** Số người nhận theo nhóm + danh bạ gộp (loại trùng theo email) */
function useAudience() {
  const followers = useApp((s) => s.followers)
  const supports = useApp((s) => s.supports)
  const members = useApp((s) => s.membership.members)
  return useMemo(() => {
    const map = new Map()
    const add = (list, role) => {
      for (const p of list) {
        const k = personKey(p)
        if (k && !map.has(k)) map.set(k, { name: p.name, email: p.email || '', avatarColor: p.avatarColor, role })
      }
    }
    add(members, 'Hội viên'); add(supports, 'Người ủng hộ'); add(followers, 'Người theo dõi')
    return {
      counts: { followers: followers.length, supporters: supporterCount(supports), members: members.length },
      people: [...map.values()].sort((a, b) => (a.name || '').localeCompare(b.name || '', 'vi')),
    }
  }, [followers, supports, members])
}

function ConvAvatar({ conv, size = 40 }) {
  if (!conv.group) return <Avatar name={conv.with?.name} color={conv.with?.avatarColor} size={size} />
  const Icon = GROUPS[conv.group]?.icon || Users
  return <span className="grid shrink-0 place-items-center rounded-full bg-brand-50 text-brand-ink" style={{ width: size, height: size }}><Icon size={size * 0.45} /></span>
}

function ConvItem({ conv, active, onOpen }) {
  const last = lastOf(conv)
  const unread = conv.unread > 0
  return (
    <button type="button" onClick={onOpen} aria-current={active || undefined}
      className={cn('flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-colors', active ? 'bg-brand-50' : 'hover:bg-hover')}>
      <ConvAvatar conv={conv} />
      <span className="min-w-0 flex-1">
        <span className="flex items-baseline justify-between gap-2">
          <span className={cn('truncate text-[14px] text-fg', unread ? 'font-[700]' : 'font-[580]')}>{nameOf(conv)}</span>
          {last && <span className={cn('shrink-0 text-[11.5px]', unread ? 'font-[600] text-brand-ink' : 'text-faint')}>{timeAgo(last.at)}</span>}
        </span>
        <span className="mt-0.5 flex items-center gap-2">
          <span className={cn('min-w-0 flex-1 truncate text-[13px]', unread ? 'font-[550] text-fg' : 'text-muted')}>
            {last ? `${last.from === 'me' ? 'Bạn: ' : ''}${last.text}` : 'Chưa có tin nhắn'}
          </span>
          {unread && <span className="size-2.5 shrink-0 rounded-full bg-brand-500" aria-label={`${conv.unread} tin chưa đọc`} />}
        </span>
      </span>
    </button>
  )
}

function Chat({ conv, recipients, typing, onBack, onSend }) {
  const [text, setText] = useState('')
  const [withEmail, setWithEmail] = useState(false)
  const scroller = useRef(null)
  const input = useRef(null)

  useEffect(() => { const el = scroller.current; if (el) el.scrollTop = el.scrollHeight }, [conv.messages.length, typing])
  useEffect(() => {
    const el = input.current
    el.style.height = 'auto'
    el.style.height = Math.min(128, el.scrollHeight) + 'px'
  }, [text])

  const submit = () => {
    const v = text.trim()
    if (!v) return
    onSend(v, withEmail)
    setText('')
    input.current?.focus()
  }
  const onKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.nativeEvent.isComposing) { e.preventDefault(); submit() }
  }

  let prevDay = null
  return (
    <>
      <div className="flex items-center gap-2.5 border-b border-line px-3 py-3 sm:px-4">
        <IconButton icon={ArrowLeft} label="Quay lại danh sách" size="sm" onClick={onBack} className="md:hidden" />
        <ConvAvatar conv={conv} size={36} />
        <div className="min-w-0 flex-1">
          <div className="truncate text-[14.5px] font-[650] text-fg">{nameOf(conv)}</div>
          <div className="ds-caption truncate">{conv.group ? `Tin gửi chung tới ${formatNumber(recipients)} người` : conv.with?.email || 'Trò chuyện riêng'}</div>
        </div>
      </div>

      <div ref={scroller} className="flex-1 overflow-y-auto px-3 py-4 sm:px-5">
        {!conv.messages.length && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <span className="grid size-12 place-items-center rounded-2xl bg-subtle text-muted"><MessageCircle size={22} /></span>
            <div className="ds-h3 mt-3">Bắt đầu cuộc trò chuyện</div>
            <p className="ds-caption mt-1 max-w-xs">{conv.group ? `Tin nhắn của bạn sẽ được gửi tới ${formatNumber(recipients)} người trong nhóm này.` : `Gửi lời chào đầu tiên tới ${nameOf(conv)}.`}</p>
          </div>
        )}
        <div className="flex flex-col gap-1.5">
          {conv.messages.map((m) => {
            const day = startOfDay(m.at).getTime()
            const showDay = day !== prevDay
            prevDay = day
            const mine = m.from === 'me'
            return (
              <div key={m.id} className="flex flex-col">
                {showDay && <div className="my-3 self-center rounded-full bg-subtle px-3 py-1 text-[11.5px] font-[550] text-muted">{formatRelative(m.at)}</div>}
                <div className={cn('flex max-w-[82%] flex-col sm:max-w-[72%]', mine ? 'items-end self-end' : 'items-start self-start')}>
                  <div className={cn('whitespace-pre-wrap break-words rounded-2xl px-3.5 py-2 text-[14px] leading-relaxed [overflow-wrap:anywhere]',
                    mine ? 'rounded-br-md bg-brand-500 text-white' : 'rounded-bl-md bg-subtle text-fg')}>
                    {m.text}
                  </div>
                  <span className="mt-0.5 px-1 text-[11px] text-faint num">{formatTime(m.at)}</span>
                </div>
              </div>
            )
          })}
          {typing && (
            <div className="flex items-center gap-1 self-start rounded-2xl rounded-bl-md bg-subtle px-3.5 py-3" aria-label={`${nameOf(conv)} đang nhập`}>
              {[0, 1, 2].map((i) => <span key={i} className="size-1.5 animate-pulse rounded-full bg-faint" style={{ animationDelay: `${i * 180}ms` }} />)}
            </div>
          )}
        </div>
      </div>

      <div className="border-t border-line px-3 py-3 sm:px-4">
        {conv.group && (
          <Checkbox checked={withEmail} onChange={setWithEmail} disabled={!recipients} className="mb-2.5"
            label={<span className="inline-flex items-center gap-1.5"><Mail size={14} className="text-muted" />Gửi kèm email tới {formatNumber(recipients)} người</span>} />
        )}
        <div className="flex items-end gap-2">
          <div className="min-w-0 flex-1 rounded-[20px] border border-line-strong bg-surface px-3.5 py-2 transition-[border,box-shadow] focus-within:border-brand-400 focus-within:ring-[3px] focus-within:ring-brand-100">
            <textarea ref={input} rows={1} value={text} onChange={(e) => setText(e.target.value)} onKeyDown={onKeyDown} maxLength={2000}
              placeholder={conv.group ? 'Viết tin gửi cả nhóm…' : 'Viết tin nhắn…'} aria-label="Nội dung tin nhắn"
              className="block w-full resize-none bg-transparent text-[14px] leading-relaxed outline-none placeholder:text-faint" />
          </div>
          <Button variant="primary" icon={Send} onClick={submit} disabled={!text.trim()} className="h-10 shrink-0">
            <span className="hidden sm:inline">Gửi</span>
          </Button>
        </div>
        <p className="ds-caption mt-1.5 hidden sm:block">Enter để gửi · Shift + Enter để xuống dòng</p>
      </div>
    </>
  )
}

function NewMessageModal({ counts, people, onPick, onClose }) {
  const [q, setQ] = useState('')
  const found = q.trim() ? people.filter((p) => matches(p.name, q) || matches(p.email, q)) : people
  return (
    <Modal open onClose={onClose} title="Tin nhắn mới" desc="Gửi chung cho một nhóm hoặc nhắn riêng cho một người.">
      <div className="flex flex-col gap-1.5">
        {GROUP_KEYS.map((k) => {
          const g = GROUPS[k]
          return (
            <button key={k} type="button" disabled={!counts[k]} onClick={() => onPick({ group: k })}
              className="flex items-center gap-3 rounded-xl border border-line px-3 py-2.5 text-left transition-colors hover:bg-hover disabled:opacity-50 disabled:hover:bg-transparent">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-brand-50 text-brand-ink"><g.icon size={18} /></span>
              <span className="min-w-0 flex-1">
                <span className="block text-[14px] font-[600] text-fg">{g.label} <span className="num font-normal text-muted">· {formatNumber(counts[k])} người</span></span>
                <span className="block truncate ds-caption">{counts[k] ? g.desc : 'Chưa có ai trong nhóm này'}</span>
              </span>
              <ChevronRight size={16} className="shrink-0 text-faint" />
            </button>
          )
        })}
      </div>

      <Divider label="Hoặc nhắn riêng cho một người" className="my-4" />
      <SearchInput value={q} onChange={setQ} placeholder="Tìm theo tên hoặc email" />
      <div className="-mx-1.5 mt-2 max-h-[240px] overflow-y-auto">
        {found.map((p) => (
          <button key={personKey(p)} type="button" onClick={() => onPick({ person: p })}
            className="flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-colors hover:bg-hover">
            <Avatar name={p.name} color={p.avatarColor} size={34} />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[13.5px] font-[580] text-fg">{p.name}</span>
              <span className="block truncate ds-caption">{p.email || p.role}</span>
            </span>
            <span className="shrink-0 text-[12px] text-muted">{p.role}</span>
          </button>
        ))}
        {!found.length && (
          <p className="px-2.5 py-6 text-center ds-caption">
            {people.length ? `Không tìm thấy ai khớp với “${q.trim()}”.` : 'Bạn chưa có người theo dõi, người ủng hộ hay hội viên nào để nhắn.'}
          </p>
        )}
      </div>
    </Modal>
  )
}

function SettingsModal({ onClose }) {
  const current = useApp((s) => s.settings.messaging)
  const mutate = useApp((s) => s.mutate)
  const [value, setValue] = useState(current || 'creator')
  const save = () => {
    mutate((d) => { d.settings.messaging = value })
    toast('Đã lưu cài đặt tin nhắn')
    onClose()
  }
  return (
    <Modal open onClose={onClose} size="sm" title="Ai được nhắn tin cho bạn?" desc="Bạn luôn có thể chủ động nhắn cho người theo dõi, người ủng hộ và hội viên."
      footer={<>
        <Button onClick={onClose}>Huỷ</Button>
        <Button variant="primary" onClick={save}>Lưu</Button>
      </>}>
      <Select aria-label="Ai được nhắn tin cho bạn" value={value} onChange={(e) => setValue(e.target.value)} options={MESSAGING_OPTIONS}
        hint={MESSAGING_OPTIONS.find((o) => o.value === value)?.desc} />
    </Modal>
  )
}

export default function MessagesPage() {
  const conversations = useApp((s) => s.conversations)
  const mutate = useApp((s) => s.mutate)
  const { counts, people } = useAudience()
  const [activeId, setActiveId] = useState(null)
  const [filter, setFilter] = useState('all')
  const [q, setQ] = useState('')
  const [modal, setModal] = useState(null) // 'new' | 'settings'
  const [typing, setTyping] = useState({})
  const activeRef = useRef(null)
  const pending = useRef(new Set())
  const mounted = useRef(true)

  activeRef.current = activeId
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false; activeRef.current = null }
  }, [])

  const sorted = useMemo(() => [...conversations].sort((a, b) => stampOf(b) - stampOf(a)), [conversations])
  const unreadCount = conversations.filter((c) => c.unread > 0).length
  const list = sorted.filter((c) => (filter === 'all' || c.unread > 0) && (!q.trim() || matches(nameOf(c), q)))
  const active = conversations.find((c) => c.id === activeId) || null

  const open = (id) => {
    setActiveId(id)
    mutate((d) => { const c = d.conversations.find((x) => x.id === id); if (c?.unread) c.unread = 0 })
  }

  const send = (text, withEmail) => {
    const conv = active
    if (!conv) return
    mutate((d) => { d.conversations.find((x) => x.id === conv.id)?.messages.push({ id: uid('m'), from: 'me', text, at: nowISO() }) })
    if (conv.group) {
      if (withEmail) toast({ title: 'Đã gửi tin nhắn', desc: `Kèm email tới ${formatNumber(counts[conv.group] || 0)} người` })
      return
    }
    // hội thoại 1-1: mô phỏng một câu trả lời ngắn
    if (pending.current.has(conv.id)) return
    pending.current.add(conv.id)
    setTyping((t) => ({ ...t, [conv.id]: true }))
    setTimeout(() => {
      pending.current.delete(conv.id)
      useApp.getState().mutate((d) => {
        const c = d.conversations.find((x) => x.id === conv.id)
        if (!c) return
        c.messages.push({ id: uid('m'), from: 'them', text: REPLIES[Math.floor(Math.random() * REPLIES.length)], at: nowISO() })
        if (activeRef.current !== conv.id) c.unread = (c.unread || 0) + 1
      })
      if (mounted.current) setTyping((t) => ({ ...t, [conv.id]: false }))
    }, 1500)
  }

  const start = ({ group, person }) => {
    setModal(null)
    setFilter('all'); setQ('')
    const found = conversations.find((c) => (group ? c.group === group : c.with && personKey(c.with) === personKey(person)))
    if (found) { open(found.id); return }
    const id = uid('tn')
    mutate((d) => {
      d.conversations.unshift({ id, ...(group ? { group } : { with: { name: person.name, email: person.email, avatarColor: person.avatarColor } }), unread: 0, messages: [], createdAt: nowISO() })
    })
    setActiveId(id)
  }

  const actions = (
    <>
      <IconButton icon={Settings} label="Cài đặt tin nhắn" variant="secondary" onClick={() => setModal('settings')} />
      <Button variant="primary" icon={Plus} onClick={() => setModal('new')}>Tin nhắn mới</Button>
    </>
  )

  return (
    <DashPage title="Tin nhắn" actions={actions}>
      {conversations.length === 0 ? (
        <div className="card">
          <EmptyState icon={MessagesSquare} title="Chưa có tin nhắn nào" desc="Gửi lời cảm ơn tới người ủng hộ hoặc báo tin mới cho hội viên, mọi cuộc trò chuyện sẽ nằm ở đây."
            action={<Button variant="primary" icon={Plus} onClick={() => setModal('new')}>Tạo tin nhắn mới</Button>} />
        </div>
      ) : (
        <div className="card flex h-[calc(100dvh-11.5rem)] min-h-[440px] overflow-hidden lg:h-[calc(100dvh-12.5rem)]">
          {/* Danh sách hội thoại */}
          <div className={cn('w-full shrink-0 flex-col border-line md:flex md:w-[300px] md:border-r', active ? 'hidden' : 'flex')}>
            <div className="flex flex-col gap-2.5 p-3">
              <Segmented size="sm" value={filter} onChange={setFilter} className="self-start"
                options={[{ value: 'all', label: 'Tất cả' }, { value: 'unread', label: unreadCount ? `Chưa đọc (${unreadCount})` : 'Chưa đọc' }]} />
              <SearchInput value={q} onChange={setQ} placeholder="Tìm theo tên" />
            </div>
            <div className="flex-1 overflow-y-auto px-1.5 pb-2">
              {list.map((c) => <ConvItem key={c.id} conv={c} active={c.id === activeId} onOpen={() => open(c.id)} />)}
              {!list.length && (
                <EmptyState compact icon={q.trim() ? Search : MessageCircle}
                  title={q.trim() ? 'Không tìm thấy hội thoại' : 'Bạn đã đọc hết tin nhắn'}
                  desc={q.trim() ? `Không có hội thoại nào khớp với “${q.trim()}”.` : 'Không còn tin nào chưa đọc.'}
                  action={<Button size="sm" onClick={() => { setQ(''); setFilter('all') }}>Xem tất cả</Button>} />
              )}
            </div>
          </div>

          {/* Khung chat */}
          <div className={cn('min-w-0 flex-1 flex-col md:flex', active ? 'flex' : 'hidden')}>
            {active ? (
              <Chat key={active.id} conv={active} recipients={active.group ? counts[active.group] || 0 : 1} typing={!!typing[active.id]}
                onBack={() => setActiveId(null)} onSend={send} />
            ) : (
              <EmptyState className="h-full" icon={MessagesSquare} title="Chọn một hội thoại" desc="Chọn hội thoại ở bên trái để xem tin nhắn, hoặc bắt đầu một cuộc trò chuyện mới."
                action={<Button icon={Plus} onClick={() => setModal('new')}>Tin nhắn mới</Button>} />
            )}
          </div>
        </div>
      )}

      {modal === 'new' && <NewMessageModal counts={counts} people={people} onPick={start} onClose={() => setModal(null)} />}
      {modal === 'settings' && <SettingsModal onClose={() => setModal(null)} />}
    </DashPage>
  )
}
