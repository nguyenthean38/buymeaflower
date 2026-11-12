import { useState } from 'react'
import { Gift, Pause, Play, Power } from 'lucide-react'
import { Section } from '@/components/layout/DashPage'
import { Badge, Button, Callout, Confirm, EmptyState, Input, Modal, RadioCards, Select, Toggle } from '@/components/ui'
import { useApp, toast, uid, nowISO } from '@/store'
import { AVATAR_COLORS } from '@/data/reference'
import { formatDate, formatVND, timeAgo } from '@/lib/format'
import { Person, isEmail } from './shared'

/** Ngày hết tạm dừng của một hạng (null nếu không tạm dừng hoặc đã hết hạn) */
export function pauseUntil(paused, levelId) {
  const until = paused?.[levelId]?.until
  return until && new Date(until) > new Date() ? new Date(until) : null
}

const DURATIONS = [1, 3, 6]
const afterMonths = (n) => { const d = new Date(); d.setMonth(d.getMonth() + n); return d }

export function MembershipSettings() {
  const { levels, members, settings } = useApp((s) => s.membership)
  const mutate = useApp((s) => s.mutate)
  const [pauseOpen, setPauseOpen] = useState(false)
  const [pauseLevel, setPauseLevel] = useState('')
  const [months, setMonths] = useState(1)
  const [gift, setGift] = useState({ email: '', name: '', levelId: '' })
  const [giftErr, setGiftErr] = useState('')
  const [revoke, setRevoke] = useState(null)
  const [askOff, setAskOff] = useState(false)

  const setFlag = (key, v) => { mutate((d) => { d.membership.settings[key] = v }); toast('Đã lưu thay đổi') }
  const pausedLevels = levels.map((l) => ({ level: l, until: pauseUntil(settings.paused, l.id) })).filter((x) => x.until)
  const pausable = levels.filter((l) => !pauseUntil(settings.paused, l.id))
  const gifted = members.filter((m) => m.status === 'gift')
  const activeCount = members.filter((m) => m.status === 'active').length
  const giftLevelId = levels.some((l) => l.id === gift.levelId) ? gift.levelId : levels[0]?.id || ''

  const openPause = () => { setPauseLevel(pausable[0]?.id || ''); setMonths(1); setPauseOpen(true) }
  const savePause = () => {
    const lv = levels.find((l) => l.id === pauseLevel)
    if (!lv) return
    const until = afterMonths(months)
    mutate((d) => { d.membership.settings.paused[lv.id] = { until: until.toISOString() } })
    setPauseOpen(false)
    toast({ title: `Đã tạm dừng thu phí hạng “${lv.name}”`, desc: `Hội viên không bị trừ tiền đến ${formatDate(until)}.` })
  }
  const resume = (lv) => {
    mutate((d) => { delete d.membership.settings.paused[lv.id] })
    toast(`Đã tiếp tục thu phí hạng “${lv.name}”`)
  }

  const sendGift = () => {
    const email = gift.email.trim().toLowerCase()
    const lv = levels.find((l) => l.id === giftLevelId)
    if (!isEmail(email)) return setGiftErr('Email chưa đúng định dạng.')
    if (!lv) return setGiftErr('Hãy tạo ít nhất một hạng trước khi tặng.')
    if (members.some((m) => m.email.toLowerCase() === email)) return setGiftErr('Người này đã là hội viên của bạn.')
    const name = gift.name.trim() || email.split('@')[0]
    mutate((d) => {
      d.membership.members.unshift({ id: uid('hv'), name, email, avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)], levelId: lv.id, since: nowISO(), status: 'gift' })
    })
    setGift({ email: '', name: '', levelId: giftLevelId })
    setGiftErr('')
    toast({ title: 'Đã tặng tư cách hội viên', desc: `${name} nhận được thư mời vào hạng “${lv.name}”.` })
  }
  const doRevoke = () => {
    const m = revoke
    mutate((d) => { d.membership.members = d.membership.members.filter((x) => x.id !== m.id) })
    toast(`Đã huỷ tư cách hội viên được tặng của ${m.name}`)
  }

  return (
    <>
      <Section title="Hiển thị và thanh toán">
        <div className="flex flex-col divide-y divide-line [&>*]:py-4 [&>*:first-child]:pt-0 [&>*:last-child]:pb-0">
          <Toggle checked={settings.annual} onChange={(v) => setFlag('annual', v)} label="Cho phép thanh toán theo năm"
            desc="Người hâm mộ có thể trả một lần cho cả năm theo giá năm của từng hạng." />
          <Toggle checked={settings.showCount} onChange={(v) => setFlag('showCount', v)} label="Hiện số hội viên"
            desc="Hiển thị tổng số hội viên trên trang của bạn." />
          <Toggle checked={settings.showEarnings} onChange={(v) => setFlag('showEarnings', v)} label="Hiện thu nhập hằng tháng"
            desc="Công khai số tiền bạn nhận mỗi tháng từ hội viên để mọi người thấy tiến độ." />
        </div>
      </Section>

      <Section title="Tạm dừng thu phí" desc="Cần nghỉ ngơi hay bận việc riêng? Tạm dừng để hội viên không bị trừ tiền mà vẫn giữ tư cách."
        action={<Button size="sm" variant="outline" icon={Pause} onClick={openPause} disabled={levels.length === 0}>Tạm dừng thu phí</Button>}>
        {pausedLevels.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {pausedLevels.map(({ level, until }) => (
              <li key={level.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-subtle px-4 py-3">
                <div className="min-w-0">
                  <div className="text-[14px] font-[550] text-fg">{level.name} <span className="font-normal text-muted">· <span className="num">{formatVND(level.price)}</span>/tháng</span></div>
                  <Badge tone="warn" dot className="mt-1.5">Đang tạm dừng đến {formatDate(until)}</Badge>
                </div>
                <Button size="sm" variant="outline" icon={Play} onClick={() => resume(level)}>Tiếp tục</Button>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-[13.5px] text-faint">Hiện không có hạng nào đang tạm dừng.</p>
        )}
      </Section>

      <Section title="Tặng tư cách hội viên" desc="Mời bạn bè, cộng tác viên hoặc người thắng giải tham gia miễn phí.">
        {levels.length === 0 ? (
          <Callout tone="neutral">Bạn cần có ít nhất một hạng hội viên để tặng.</Callout>
        ) : (
          <>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Email người nhận" type="email" value={gift.email} error={giftErr} placeholder="ten@thu.vidu.vn"
                onChange={(e) => { setGift({ ...gift, email: e.target.value }); setGiftErr('') }}
                onKeyDown={(e) => { if (e.key === 'Enter') sendGift() }} />
              <Input label="Tên người nhận" optional value={gift.name} maxLength={40} onChange={(e) => setGift({ ...gift, name: e.target.value })} />
              <Select label="Hạng được tặng" value={giftLevelId} onChange={(e) => setGift({ ...gift, levelId: e.target.value })}
                options={levels.map((l) => ({ value: l.id, label: `${l.name} · ${formatVND(l.price)}/tháng` }))} />
              <div className="flex items-end">
                <Button variant="primary" icon={Gift} className="w-full sm:w-auto h-10" disabled={!gift.email.trim()} onClick={sendGift}>Tặng hội viên</Button>
              </div>
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <div className="ds-label mb-1">Người được tặng ({gifted.length})</div>
              {gifted.length === 0 ? (
                <EmptyState compact icon={Gift} title="Chưa tặng cho ai" desc="Những người bạn tặng tư cách hội viên sẽ hiện ở đây." />
              ) : (
                <ul>
                  {gifted.map((m) => (
                    <li key={m.id} className="flex items-center justify-between gap-3 border-b border-line py-3 last:border-0 last:pb-0">
                      <Person name={m.name} color={m.avatarColor}
                        sub={`${levels.find((l) => l.id === m.levelId)?.name || 'Hạng đã xoá'} · tặng ${timeAgo(m.since).toLowerCase()}`} />
                      <Button size="sm" variant="ghost" onClick={() => setRevoke(m)}>Huỷ</Button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </>
        )}
      </Section>

      <Section title="Tắt hội viên" desc="Ẩn mục hội viên khỏi trang của bạn và ngừng thu phí định kỳ. Các hạng và danh sách hội viên vẫn được lưu để bạn bật lại sau."
        action={<Button size="sm" variant="danger-soft" icon={Power} onClick={() => setAskOff(true)}>Tắt hội viên</Button>} />

      <Modal open={pauseOpen} onClose={() => setPauseOpen(false)} title="Tạm dừng thu phí" desc="Hội viên của hạng được chọn sẽ không bị trừ tiền trong thời gian tạm dừng."
        footer={<>
          <Button variant="secondary" onClick={() => setPauseOpen(false)}>Huỷ</Button>
          <Button variant="primary" disabled={!pauseLevel} onClick={savePause}>Tạm dừng</Button>
        </>}>
        {pausable.length === 0 ? (
          <Callout tone="neutral">Tất cả các hạng đều đang tạm dừng.</Callout>
        ) : (
          <div className="flex flex-col gap-4">
            <Select label="Hạng cần tạm dừng" value={pauseLevel} onChange={(e) => setPauseLevel(e.target.value)}
              options={pausable.map((l) => ({ value: l.id, label: `${l.name} · ${members.filter((m) => m.levelId === l.id && m.status === 'active').length} hội viên` }))} />
            <div>
              <div className="mb-1.5 text-[13px] font-[550] text-dim">Thời hạn</div>
              <RadioCards columns={3} value={months} onChange={setMonths}
                options={DURATIONS.map((n) => ({ value: n, label: `${n} tháng`, desc: `Đến ${formatDate(afterMonths(n))}` }))} />
            </div>
          </div>
        )}
      </Modal>

      <Confirm open={!!revoke} onClose={() => setRevoke(null)} onConfirm={doRevoke} danger confirmLabel="Huỷ tặng" cancelLabel="Giữ lại"
        title="Huỷ tư cách hội viên được tặng?" desc={revoke ? `${revoke.name} sẽ không còn xem được nội dung dành cho hội viên.` : ''} />
      <Confirm open={askOff} onClose={() => setAskOff(false)} danger confirmLabel="Tắt hội viên"
        onConfirm={() => { mutate((d) => { d.membership.enabled = false }); toast({ title: 'Đã tắt hội viên', desc: 'Bạn có thể bật lại bất cứ lúc nào.' }) }}
        title="Tắt tính năng hội viên?"
        desc={activeCount > 0 ? `${activeCount} hội viên đang hoạt động sẽ ngừng bị thu phí và mục hội viên sẽ ẩn khỏi trang của bạn.` : 'Mục hội viên sẽ ẩn khỏi trang của bạn.'} />
    </>
  )
}
