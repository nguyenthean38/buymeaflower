import { useState } from 'react'
import { ExternalLink, Monitor, Moon, Pencil, RotateCcw, Sun, Target, Trash2 } from 'lucide-react'
import { DashPage, Section } from '@/components/layout/DashPage'
import { Button, Checkbox, Confirm, Input, Modal, MoneyInput, Progress, Segmented, Select, Textarea, Toggle } from '@/components/ui'
import { useApp, useUI, toast, summarize } from '@/store'
import { DOMAIN } from '@/data/reference'
import { TAKEN_USERNAMES } from '@/data/creators'
import { formatVND } from '@/lib/format'
import { cn } from '@/lib/cn'
import { CopyField, Row } from '@/features/thietlap/shared'

const ANALYTICS_RE = /^[A-Z]{1,4}-[A-Z0-9]{4,16}(-[A-Z0-9]{1,6})?$/i

/* ---------------- Mục tiêu ---------------- */
function GoalModal({ goal, onClose }) {
  const mutate = useApp((s) => s.mutate)
  const editing = goal.on
  const [f, setF] = useState({ title: goal.title || '', desc: goal.desc || '', target: goal.target || 0, start: goal.start || 0 })
  const [tried, setTried] = useState(false)
  const set = (patch) => setF((cur) => ({ ...cur, ...patch }))

  const errors = {
    title: f.title.trim().length < 3 ? 'Hãy đặt tên cho mục tiêu (ít nhất 3 ký tự).' : '',
    target: f.target < 100000 ? 'Số tiền mục tiêu tối thiểu là 100.000 ₫.' : '',
    start: f.target >= 100000 && f.start >= f.target ? 'Số đã có sẵn phải nhỏ hơn số tiền mục tiêu.' : '',
  }
  const save = (e) => {
    e?.preventDefault()
    setTried(true)
    if (errors.title || errors.target || errors.start) return
    mutate((d) => { d.settings.goal = { on: true, title: f.title.trim(), desc: f.desc.trim(), target: f.target, start: f.start } })
    toast(editing ? 'Đã cập nhật mục tiêu' : 'Đã đặt mục tiêu')
    onClose()
  }

  return (
    <Modal open onClose={onClose} title={editing ? 'Sửa mục tiêu' : 'Đặt mục tiêu'} desc="Mục tiêu hiện trên trang cá nhân để người hâm mộ thấy họ đang cùng bạn đi tới đâu."
      footer={<>
        <Button variant="secondary" onClick={onClose}>Huỷ</Button>
        <Button variant="primary" onClick={save}>{editing ? 'Lưu mục tiêu' : 'Đặt mục tiêu'}</Button>
      </>}>
      <form onSubmit={save} className="flex flex-col gap-4">
        <Input label="Tên mục tiêu" autoFocus maxLength={80} placeholder="Ví dụ: Mua bảng vẽ mới" value={f.title} onChange={(e) => set({ title: e.target.value })} error={tried ? errors.title : ''} />
        <Textarea label="Mô tả" optional rows={3} maxLength={240} placeholder="Bạn sẽ làm gì khi đạt mục tiêu?" value={f.desc} onChange={(e) => set({ desc: e.target.value })} />
        <div className="grid gap-4 sm:grid-cols-2">
          <MoneyInput label="Số tiền mục tiêu" value={f.target} onChange={(target) => set({ target })} error={tried ? errors.target : ''} />
          <MoneyInput label="Đã có sẵn" value={f.start} onChange={(start) => set({ start })} error={tried ? errors.start : ''} hint="Khoản bạn đã gom được từ trước." />
        </div>
        <button type="submit" hidden />
      </form>
    </Modal>
  )
}

function GoalSection() {
  const goal = useApp((s) => s.settings.goal)
  const recent = useApp((s) => summarize(s.supports, 30).total)
  const mutate = useApp((s) => s.mutate)
  const [editing, setEditing] = useState(false)
  const [removing, setRemoving] = useState(false)

  const raised = (goal.start || 0) + recent
  const pct = goal.target ? Math.min(100, Math.round((raised / goal.target) * 100)) : 0

  return (
    <Section title="Mục tiêu" desc="Một cái đích cụ thể giúp người hâm mộ có thêm lý do để tặng hoa."
      action={goal.on ? <Button variant="outline" size="sm" icon={Pencil} onClick={() => setEditing(true)}>Sửa</Button> : null}>
      {goal.on ? (
        <div className="rounded-2xl bg-subtle p-4 sm:p-5">
          <div className="text-[15px] font-[650] leading-snug">{goal.title}</div>
          {goal.desc && <p className="mt-1 text-[13.5px] text-muted">{goal.desc}</p>}
          <Progress value={raised} max={goal.target} auto={false} tone={pct >= 100 ? 'pos' : 'brand'} height={10} className="mt-4 bg-surface" />
          <div className="mt-2.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-[13.5px]">
            <span><span className="num font-[650] text-fg">{formatVND(raised)}</span> <span className="text-muted">trên {formatVND(goal.target)}</span></span>
            <span className={cn('num font-[650]', pct >= 100 ? 'text-pos' : 'text-brand-ink')}>{pct >= 100 ? 'Đã đạt mục tiêu' : `${pct}%`}</span>
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-line pt-3.5">
            <span className="ds-caption">Gồm {formatVND(goal.start || 0)} có sẵn và {formatVND(recent)} nhận trong 30 ngày qua.</span>
            <Button variant="ghost" size="sm" icon={Trash2} className="text-neg hover:bg-neg-soft hover:text-neg" onClick={() => setRemoving(true)}>Xoá mục tiêu</Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-start gap-3 rounded-2xl bg-subtle p-4 sm:flex-row sm:items-center sm:p-5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-surface text-brand-ink"><Target size={19} /></span>
          <p className="min-w-0 flex-1 text-[13.5px] text-muted">Bạn chưa đặt mục tiêu. Hãy thử một con số vừa sức, chẳng hạn tiền mua dụng cụ hay in một đợt sản phẩm.</p>
          <Button variant="primary" onClick={() => setEditing(true)}>Đặt mục tiêu</Button>
        </div>
      )}
      {editing && <GoalModal goal={goal} onClose={() => setEditing(false)} />}
      <Confirm open={removing} onClose={() => setRemoving(false)} danger confirmLabel="Xoá mục tiêu" title="Xoá mục tiêu này?"
        desc="Thanh tiến độ sẽ biến mất khỏi trang cá nhân của bạn. Các khoản ủng hộ đã nhận không bị ảnh hưởng."
        onConfirm={() => { mutate((d) => { d.settings.goal = { on: false, title: '', desc: '', target: 0, start: 0 } }); toast('Đã xoá mục tiêu') }} />
    </Section>
  )
}

/* ---------------- Đổi tên trang ---------------- */
function UsernameModal({ current, onClose }) {
  const mutate = useApp((s) => s.mutate)
  const [value, setValue] = useState(current)
  const [loading, setLoading] = useState(false)

  const error = value.length < 3 ? 'Tên trang cần ít nhất 3 ký tự.'
    : value.length > 20 ? 'Tên trang dài tối đa 20 ký tự.'
    : value !== current && TAKEN_USERNAMES.includes(value) ? 'Tên này đã có người dùng. Bạn thử tên khác nhé.' : ''
  const unchanged = value === current

  const save = (e) => {
    e?.preventDefault()
    if (error || unchanged || loading) return
    setLoading(true)
    setTimeout(() => {
      mutate((d) => { d.page.username = value; d.invites.code = value })
      toast({ title: 'Đã đổi tên trang', desc: `Địa chỉ mới: ${DOMAIN}/${value}` })
      onClose()
    }, 600)
  }

  return (
    <Modal open onClose={loading ? undefined : onClose} size="sm" title="Đổi tên trang" desc="Liên kết cũ sẽ ngừng hoạt động, bạn nhớ cập nhật ở những nơi đã chia sẻ."
      footer={<>
        <Button variant="secondary" disabled={loading} onClick={onClose}>Huỷ</Button>
        <Button variant="primary" loading={loading} disabled={!!error || unchanged} onClick={save}>Đổi tên</Button>
      </>}>
      <form onSubmit={save}>
        <Input label="Tên trang mới" autoFocus prefix={`${DOMAIN}/`} value={value} maxLength={20} autoCapitalize="none" autoCorrect="off" spellCheck={false}
          onChange={(e) => setValue(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
          error={value && !unchanged ? error : ''} hint={!error && !unchanged ? 'Tên này dùng được.' : 'Chỉ gồm chữ thường a–z và số, từ 3 đến 20 ký tự.'} />
      </form>
    </Modal>
  )
}

/* ---------------- Tab Chung ---------------- */
function GeneralTab() {
  const settings = useApp((s) => s.settings)
  const username = useApp((s) => s.page.username)
  const mutate = useApp((s) => s.mutate)
  const theme = useUI((s) => s.theme)
  const setTheme = useUI((s) => s.setTheme)
  const [analytics, setAnalytics] = useState(settings.analyticsId || '')
  const [analyticsTried, setAnalyticsTried] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const [confirm, setConfirm] = useState(null)

  const analyticsValue = analytics.trim().toUpperCase()
  const analyticsError = analyticsValue && !ANALYTICS_RE.test(analyticsValue) ? 'Mã chưa đúng định dạng. Ví dụ: G-AB12CD34EF.' : ''
  const analyticsDirty = analyticsValue !== (settings.analyticsId || '')
  const saveAnalytics = (e) => {
    e.preventDefault()
    setAnalyticsTried(true)
    if (analyticsError || !analyticsDirty) return
    mutate((d) => { d.settings.analyticsId = analyticsValue })
    setAnalytics(analyticsValue)
    toast(analyticsValue ? 'Đã lưu mã theo dõi' : 'Đã gỡ mã theo dõi')
  }
  const flip = (key, on, off) => (v) => { mutate((d) => { d.settings[key] = v }); toast(v ? on : off) }

  return (
    <>
      <GoalSection />

      <Section title="Thanh toán">
        <div className="divide-y divide-line">
          <Row>
            <div className="min-w-0 flex-1 basis-56">
              <div className="text-[14px] font-[520]">Đơn vị tiền</div>
              <div className="ds-caption mt-0.5">Bản demo chỉ hỗ trợ đồng Việt Nam. Người ủng hộ ở nước ngoài sẽ thấy số tiền quy đổi ước tính.</div>
            </div>
            <Select aria-label="Đơn vị tiền" value={settings.currency || 'VND'} onChange={() => {}} options={[{ value: 'VND', label: 'VND (₫) · đang dùng' }]} className="w-full sm:w-52" />
          </Row>
          <div className="py-4">
            <Toggle checked={!!settings.coverFee} label="Người ủng hộ trả phí giao dịch" desc="Phí cổng thanh toán được cộng vào số tiền người ủng hộ trả, bạn nhận trọn phần của mình."
              onChange={flip('coverFee', 'Người ủng hộ sẽ trả phí giao dịch', 'Phí giao dịch sẽ được trừ vào khoản bạn nhận')} />
          </div>
          <div className="pt-4">
            <Toggle checked={!!settings.adult} label="Trang có nội dung 18+" desc="Người xem phải xác nhận đủ tuổi trước khi vào trang, và trang không hiện ở mục Khám phá."
              onChange={flip('adult', 'Đã đánh dấu trang có nội dung 18+', 'Đã bỏ đánh dấu nội dung 18+')} />
          </div>
        </div>
      </Section>

      <Section title="Liên kết trang của tôi" desc="Địa chỉ để bạn chia sẻ ở mọi nơi.">
        <CopyField value={`${DOMAIN}/${username}`} message="Đã sao chép liên kết trang">
          <Button variant="ghost" icon={ExternalLink} to={`/${username}`}>Xem trang</Button>
        </CopyField>
        <div className="mt-3"><Button variant="link" onClick={() => setRenaming(true)}>Đổi tên trang</Button></div>
      </Section>

      <Section title="Mã theo dõi phân tích" desc="Gắn mã đo lường của công cụ phân tích bạn đang dùng để xem lượt ghé trang cá nhân.">
        <form onSubmit={saveAnalytics} className="flex flex-wrap items-start gap-2">
          <Input aria-label="Mã theo dõi" placeholder="G-AB12CD34EF" value={analytics} onChange={(e) => setAnalytics(e.target.value)} className="min-w-0 flex-1 basis-56"
            inputClassName="font-mono text-[13px] uppercase placeholder:normal-case" error={analyticsTried ? analyticsError : ''} hint="Để trống rồi lưu nếu bạn muốn gỡ mã." spellCheck={false} />
          <Button type="submit" variant="primary" className="h-10" disabled={!analyticsDirty}>Lưu</Button>
        </form>
      </Section>

      <Section title="Giao diện" desc="Áp dụng cho khu quản lý trên thiết bị này.">
        <Segmented value={theme} onChange={setTheme} options={[{ value: 'light', label: 'Sáng', icon: Sun }, { value: 'dark', label: 'Tối', icon: Moon }, { value: 'system', label: 'Theo máy', icon: Monitor }]} />
      </Section>

      <Section title="Vùng nguy hiểm" className="border-neg/30">
        <div className="divide-y divide-line">
          <Row>
            <div className="min-w-0 flex-1 basis-56">
              <div className="text-[14px] font-[520]">Tạm khoá trang</div>
              <div className="ds-caption mt-0.5">Trang cá nhân ngừng nhận ủng hộ và ẩn khỏi mục Khám phá cho tới khi bạn mở lại.</div>
            </div>
            <Button variant="danger-soft" onClick={() => setConfirm('pause')}>Tạm khoá trang</Button>
          </Row>
          <Row>
            <div className="min-w-0 flex-1 basis-56">
              <div className="text-[14px] font-[520]">Đặt lại dữ liệu demo</div>
              <div className="ds-caption mt-0.5">Xoá mọi thay đổi bạn đã thử và đưa tài khoản Mai Chi về trạng thái ban đầu.</div>
            </div>
            <Button variant="danger-soft" icon={RotateCcw} onClick={() => setConfirm('reset')}>Đặt lại dữ liệu</Button>
          </Row>
        </div>
      </Section>

      {renaming && <UsernameModal current={username} onClose={() => setRenaming(false)} />}
      <Confirm open={confirm === 'pause'} onClose={() => setConfirm(null)} danger confirmLabel="Tạm khoá" title="Tạm khoá trang của bạn?"
        desc="Người hâm mộ sẽ thấy thông báo trang đang tạm nghỉ. Hội viên hiện tại không bị trừ tiền trong thời gian này."
        onConfirm={() => toast({ title: 'Bản demo không khoá trang thật', desc: 'Trên sản phẩm thật, trang của bạn sẽ tạm ngừng nhận ủng hộ từ lúc này.', tone: 'info' })} />
      <Confirm open={confirm === 'reset'} onClose={() => setConfirm(null)} danger confirmLabel="Đặt lại" title="Đặt lại toàn bộ dữ liệu demo?"
        desc="Mọi bài viết, hạng hội viên, cài đặt bạn đã chỉnh sẽ trở về như lúc đầu. Không hoàn tác được."
        onConfirm={() => { useApp.getState().resetDemo(); setAnalytics(''); setAnalyticsTried(false); toast('Đã đặt lại dữ liệu demo') }} />
    </>
  )
}

/* ---------------- Tab Thông báo ---------------- */
const NOTIFY_ITEMS = [
  { key: 'newSupport', label: 'Có người ủng hộ mới', desc: 'Mỗi khi ai đó tặng hoa hoặc mua sản phẩm trong cửa hàng.' },
  { key: 'newMember', label: 'Hội viên mới', desc: 'Khi có người tham gia một hạng hội viên của bạn.' },
  { key: 'newComment', label: 'Bình luận mới', desc: 'Khi có bình luận dưới bài viết hoặc bộ ảnh.' },
  { key: 'newMessage', label: 'Tin nhắn mới', desc: 'Khi người ủng hộ hoặc hội viên nhắn riêng cho bạn.' },
]
const LIMITS = [{ value: 'all', label: 'Không giới hạn' }, { value: '5', label: '5 mỗi ngày' }, { value: '10', label: '10 mỗi ngày' }]

function NotifyTab() {
  const saved = useApp((s) => s.settings.notify)
  const email = useApp((s) => s.account.email)
  const mutate = useApp((s) => s.mutate)
  const [draft, setDraft] = useState(saved)
  const set = (patch) => setDraft((cur) => ({ ...cur, ...patch }))
  const dirty = ['all', 'limit', ...NOTIFY_ITEMS.map((i) => i.key)].some((k) => draft[k] !== saved[k])
  const off = !draft.all

  const save = () => {
    mutate((d) => { d.settings.notify = { ...d.settings.notify, ...draft } })
    toast('Đã lưu cài đặt thông báo')
  }

  return (
    <>
      <Section>
        <Toggle checked={!!draft.all} onChange={(all) => set({ all })} label="Nhận thông báo qua email" desc={<>Thư được gửi tới <span className="font-[550] text-dim">{email}</span>.</>} />
        <div className={cn('mt-5 flex flex-col gap-4 border-t border-line pt-5 transition-opacity', off && 'opacity-50')} aria-disabled={off}>
          <div className="ds-label">Gửi email cho tôi khi</div>
          {NOTIFY_ITEMS.map((it) => (
            <Checkbox key={it.key} disabled={off} checked={!!draft[it.key]} onChange={(v) => set({ [it.key]: v })} label={it.label} desc={it.desc} className={off ? 'opacity-100' : ''} />
          ))}
        </div>
      </Section>

      <Section title="Giới hạn số email mỗi ngày" desc="Khi vượt giới hạn, các thông báo còn lại được gộp vào một thư tổng kết cuối ngày.">
        <div className={cn('max-w-full overflow-x-auto no-scrollbar transition-opacity', off && 'pointer-events-none opacity-50')}>
          <Segmented value={String(draft.limit ?? 'all')} onChange={(limit) => set({ limit })} options={LIMITS} />
        </div>
      </Section>

      <div className="flex items-center justify-end gap-2">
        {dirty && <Button variant="ghost" onClick={() => setDraft(saved)}>Hoàn tác</Button>}
        <Button variant="primary" disabled={!dirty} onClick={save}>Lưu thay đổi</Button>
      </div>
    </>
  )
}

export default function SettingsPage() {
  const [tab, setTab] = useState('general')
  return (
    <DashPage narrow title="Cài đặt" desc="Tuỳ chỉnh cách trang của bạn nhận ủng hộ và cách chúng tôi liên lạc với bạn."
      tabs={[{ value: 'general', label: 'Chung' }, { value: 'notify', label: 'Thông báo' }]} tab={tab} onTab={setTab}>
      {tab === 'general' ? <GeneralTab /> : <NotifyTab />}
    </DashPage>
  )
}
