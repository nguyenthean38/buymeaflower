import { useMemo, useState } from 'react'
import { Check, Compass, Eye, EyeOff, Heart, SearchX, Users } from 'lucide-react'
import { DashPage, Section } from '@/components/layout/DashPage'
import { Avatar, Button, Confirm, EmptyState, Field, Input, SearchInput, Select } from '@/components/ui'
import { useApp, toast } from '@/store'
import { AVATAR_COLORS } from '@/data/reference'
import { CREATOR_BY_USERNAME } from '@/data/creators'
import { formatDay, stripAccents } from '@/lib/format'
import { cn } from '@/lib/cn'
import { Row } from '@/features/thietlap/shared'

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/
const COUNTRIES = ['Việt Nam', 'Nhật Bản', 'Hàn Quốc', 'Singapore', 'Thái Lan', 'Úc', 'Đức', 'Pháp', 'Hoa Kỳ', 'Canada']
const TIMEZONES = ['GMT+7 (Hà Nội)', 'GMT+7 (Băng Cốc)', 'GMT+8 (Singapore)', 'GMT+9 (Tokyo)', 'GMT+9 (Seoul)', 'GMT+10 (Sydney)', 'GMT+1 (Berlin)', 'GMT+1 (Paris)', 'GMT-5 (New York)', 'GMT-8 (Los Angeles)']
const withCurrent = (list, value) => (value && !list.includes(value) ? [value, ...list] : list)

/* ---------------- Hồ sơ ---------------- */
function ProfileForm() {
  const page = useApp((s) => s.page)
  const account = useApp((s) => s.account)
  const mutate = useApp((s) => s.mutate)
  const initial = { name: page.name, avatarColor: page.avatarColor, email: account.email, country: account.country, timezone: account.timezone }
  const [f, setF] = useState(initial)
  const [tried, setTried] = useState(false)
  const set = (patch) => setF((cur) => ({ ...cur, ...patch }))

  const errors = {
    name: f.name.trim().length < 2 ? 'Tên hiển thị cần ít nhất 2 ký tự.' : '',
    email: !EMAIL_RE.test(f.email.trim()) ? 'Email chưa đúng định dạng.' : '',
  }
  const dirty = Object.keys(initial).some((k) => f[k] !== initial[k])

  const save = (e) => {
    e.preventDefault()
    setTried(true)
    if (errors.name || errors.email) return
    const next = { ...f, name: f.name.trim(), email: f.email.trim() }
    mutate((d) => {
      d.page.name = next.name
      d.page.avatarColor = next.avatarColor
      Object.assign(d.account, { email: next.email, country: next.country, timezone: next.timezone })
    })
    setF(next)
    setTried(false)
    toast('Đã lưu hồ sơ')
  }

  return (
    <Section title="Hồ sơ">
      <form onSubmit={save} noValidate className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-x-5 gap-y-4">
          <Avatar name={f.name || page.name} color={f.avatarColor} size={84} />
          <Field label="Màu avatar" hint="Avatar dùng chữ cái đầu của tên bạn trên nền màu này.">
            <div className="flex flex-wrap gap-2">
              {AVATAR_COLORS.map((c) => {
                const on = f.avatarColor === c
                return (
                  <button key={c} type="button" aria-label={`Màu ${c}`} aria-pressed={on} onClick={() => set({ avatarColor: c })}
                    className={cn('grid size-8 place-items-center rounded-full text-white transition-transform hover:scale-105', on && 'ring-2 ring-fg ring-offset-2 ring-offset-surface')} style={{ background: c }}>
                    {on && <Check size={15} strokeWidth={3} />}
                  </button>
                )
              })}
            </div>
          </Field>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Tên hiển thị" maxLength={40} value={f.name} onChange={(e) => set({ name: e.target.value })} error={tried ? errors.name : ''} />
          <Input label="Email" type="email" value={f.email} onChange={(e) => set({ email: e.target.value })} error={tried ? errors.email : ''} hint="Dùng để đăng nhập và nhận thông báo." autoComplete="email" />
          <Select label="Quốc gia" value={f.country} onChange={(e) => set({ country: e.target.value })} options={withCurrent(COUNTRIES, f.country)} />
          <Select label="Múi giờ" value={f.timezone} onChange={(e) => set({ timezone: e.target.value })} options={withCurrent(TIMEZONES, f.timezone)} />
        </div>
        <div className="flex justify-end gap-2">
          {dirty && <Button variant="ghost" onClick={() => { setF(initial); setTried(false) }}>Hoàn tác</Button>}
          <Button type="submit" variant="primary" disabled={!dirty}>Lưu hồ sơ</Button>
        </div>
      </form>
    </Section>
  )
}

/* ---------------- Đổi mật khẩu ---------------- */
const STRENGTH = [
  { label: 'Quá ngắn', bar: 'bg-neg', text: 'text-neg' },
  { label: 'Yếu', bar: 'bg-neg', text: 'text-neg' },
  { label: 'Tạm được', bar: 'bg-warn', text: 'text-warn' },
  { label: 'Khá mạnh', bar: 'bg-pos', text: 'text-pos' },
  { label: 'Rất mạnh', bar: 'bg-pos', text: 'text-pos' },
]
function strengthOf(pw) {
  if (pw.length < 8) return 0
  const kinds = [/[a-z]/, /[A-Z]/, /\d/, /[^A-Za-z0-9]/].filter((re) => re.test(pw)).length
  return Math.max(1, Math.min(4, kinds + (pw.length >= 12 ? 1 : 0) - 1))
}

function PasswordForm() {
  const empty = { old: '', next: '', again: '' }
  const [f, setF] = useState(empty)
  const [tried, setTried] = useState(false)
  const [show, setShow] = useState(false)
  const [loading, setLoading] = useState(false)
  const set = (patch) => setF((cur) => ({ ...cur, ...patch }))

  const score = strengthOf(f.next)
  const errors = {
    old: !f.old ? 'Hãy nhập mật khẩu hiện tại.' : '',
    next: f.next.length < 8 ? 'Mật khẩu mới cần ít nhất 8 ký tự.' : f.next === f.old ? 'Mật khẩu mới phải khác mật khẩu hiện tại.' : '',
    again: f.again !== f.next ? 'Hai lần nhập chưa khớp nhau.' : '',
  }
  const save = (e) => {
    e.preventDefault()
    setTried(true)
    if (errors.old || errors.next || errors.again) return
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setF(empty)
      setTried(false)
      toast({ title: 'Đã đổi mật khẩu', desc: 'Bản demo không lưu mật khẩu của bạn.' })
    }, 700)
  }
  const type = show ? 'text' : 'password'

  return (
    <Section title="Đổi mật khẩu" action={<Button variant="ghost" size="sm" icon={show ? EyeOff : Eye} onClick={() => setShow(!show)}>{show ? 'Ẩn' : 'Hiện'}</Button>}>
      <form onSubmit={save} noValidate className="flex max-w-md flex-col gap-4">
        <Input label="Mật khẩu hiện tại" type={type} value={f.old} onChange={(e) => set({ old: e.target.value })} error={tried ? errors.old : ''} autoComplete="current-password" />
        <div>
          <Input label="Mật khẩu mới" type={type} value={f.next} onChange={(e) => set({ next: e.target.value })} error={tried ? errors.next : ''} autoComplete="new-password" />
          {f.next && (
            <div className="mt-2 flex items-center gap-3" aria-live="polite">
              <div className="flex flex-1 gap-1">
                {[1, 2, 3, 4].map((i) => <span key={i} className={cn('h-1.5 flex-1 rounded-full transition-colors', i <= Math.max(1, score) ? STRENGTH[score].bar : 'bg-line')} />)}
              </div>
              <span className={cn('w-[68px] text-right text-[12.5px] font-[550]', STRENGTH[score].text)}>{STRENGTH[score].label}</span>
            </div>
          )}
          <p className="ds-caption mt-1.5">Ít nhất 8 ký tự. Nên trộn chữ hoa, chữ thường, số và ký hiệu.</p>
        </div>
        <Input label="Nhập lại mật khẩu mới" type={type} value={f.again} onChange={(e) => set({ again: e.target.value })} error={tried || (f.again && f.again.length >= f.next.length) ? errors.again : ''} autoComplete="new-password" />
        <div><Button type="submit" variant="primary" loading={loading}>Đổi mật khẩu</Button></div>
      </form>
    </Section>
  )
}

/* ---------------- Người theo dõi ---------------- */
function FollowersTab() {
  const followers = useApp((s) => s.followers)
  const [query, setQuery] = useState('')
  const list = useMemo(() => {
    const q = stripAccents(query).toLowerCase().trim()
    const sorted = [...followers].sort((a, b) => new Date(b.since) - new Date(a.since))
    return q ? sorted.filter((p) => stripAccents(`${p.name} ${p.email}`).toLowerCase().includes(q)) : sorted
  }, [followers, query])

  if (!followers.length) {
    return (
      <Section>
        <EmptyState icon={Users} title="Chưa có người theo dõi" desc="Khi ai đó bấm theo dõi trang của bạn, họ sẽ hiện ở đây và nhận tin mỗi lần bạn đăng bài công khai." action={<Button variant="outline" to="/quan-ly/nut-va-hinh">Lấy nút chia sẻ trang</Button>} />
      </Section>
    )
  }
  return (
    <Section title="Người theo dõi" desc="Những người nhận tin khi bạn đăng bài công khai." action={<SearchInput value={query} onChange={setQuery} placeholder="Tìm tên hoặc email" className="hidden w-56 sm:flex" />}>
      <SearchInput value={query} onChange={setQuery} placeholder="Tìm tên hoặc email" className="mb-2 sm:hidden" />
      {list.length ? (
        <div className="divide-y divide-line">
          {list.map((p) => (
            <Row key={p.id} className="py-3">
              <Avatar name={p.name} color={p.avatarColor} size={38} />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[14px] font-[550]">{p.name}</div>
                <div className="truncate text-[13px] text-muted">{p.email}</div>
              </div>
              <span className="ds-caption w-full pl-[54px] sm:w-auto sm:pl-0">Theo dõi từ {formatDay(p.since, { year: true })}</span>
            </Row>
          ))}
        </div>
      ) : (
        <EmptyState compact icon={SearchX} title="Không tìm thấy ai" desc={`Không có người theo dõi nào khớp với “${query.trim()}”.`} action={<Button variant="outline" size="sm" onClick={() => setQuery('')}>Xoá tìm kiếm</Button>} />
      )}
    </Section>
  )
}

/* ---------------- Đang theo dõi ---------------- */
function FollowingTab() {
  const following = useApp((s) => s.following)
  const [removing, setRemoving] = useState(null)
  const list = following.map((f) => ({ ...f, creator: CREATOR_BY_USERNAME[f.username] })).filter((f) => f.creator)

  if (!list.length) {
    return (
      <Section>
        <EmptyState icon={Heart} title="Bạn chưa theo dõi ai" desc="Theo dõi những nhà sáng tạo bạn yêu thích để không bỏ lỡ bài viết mới của họ." action={<Button variant="primary" icon={Compass} to="/kham-pha">Khám phá nhà sáng tạo</Button>} />
      </Section>
    )
  }
  return (
    <Section title="Đang theo dõi" desc="Những nhà sáng tạo bạn đang dõi theo." action={<Button variant="ghost" size="sm" icon={Compass} to="/kham-pha">Khám phá thêm</Button>}>
      <div className="divide-y divide-line">
        {list.map(({ username, since, creator }) => (
          <Row key={username} className="py-3.5">
            <div className="flex min-w-0 flex-1 basis-56 items-center gap-3">
              <Avatar name={creator.page.name} color={creator.page.avatarColor} size={44} />
              <div className="min-w-0">
                <div className="truncate text-[14px] font-[600]">{creator.page.name}</div>
                <div className="truncate text-[13px] text-muted">{creator.page.tagline}</div>
                <div className="ds-caption mt-0.5">Theo dõi từ {formatDay(since, { year: true })}</div>
              </div>
            </div>
            <div className="flex shrink-0 gap-2 pl-[56px] sm:pl-0">
              <Button variant="outline" size="sm" to={`/${username}`}>Xem trang</Button>
              <Button variant="ghost" size="sm" onClick={() => setRemoving({ username, name: creator.page.name })}>Bỏ theo dõi</Button>
            </div>
          </Row>
        ))}
      </div>
      <Confirm open={!!removing} onClose={() => setRemoving(null)} confirmLabel="Bỏ theo dõi" title={`Bỏ theo dõi ${removing?.name || ''}?`}
        desc="Bạn sẽ không còn nhận tin khi họ đăng bài mới. Các khoản ủng hộ và hạng hội viên của bạn không thay đổi."
        onConfirm={() => { useApp.getState().toggleFollow(removing.username); toast(`Đã bỏ theo dõi ${removing.name}`) }} />
    </Section>
  )
}

export default function AccountPage() {
  const followerCount = useApp((s) => s.followers.length)
  const followingCount = useApp((s) => s.following.filter((f) => CREATOR_BY_USERNAME[f.username]).length)
  const [tab, setTab] = useState('profile')
  return (
    <DashPage narrow title="Tài khoản" desc="Thông tin đăng nhập của bạn và những kết nối quanh trang."
      tabs={[{ value: 'profile', label: 'Hồ sơ' }, { value: 'followers', label: 'Người theo dõi', count: followerCount }, { value: 'following', label: 'Đang theo dõi', count: followingCount }]}
      tab={tab} onTab={setTab}>
      {tab === 'profile' && <><ProfileForm /><PasswordForm /></>}
      {tab === 'followers' && <FollowersTab />}
      {tab === 'following' && <FollowingTab />}
    </DashPage>
  )
}
