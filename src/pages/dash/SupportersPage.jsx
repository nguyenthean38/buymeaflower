import { useMemo, useState } from 'react'
import { CalendarDays, Download, Eye, EyeOff, HandCoins, Heart, MessageSquareReply, Share2, Undo2, Users, Wallet } from 'lucide-react'
import { DashPage, Section, StatTile } from '@/components/layout/DashPage'
import {
  Avatar, Badge, Button, Callout, Confirm, Drawer, EmptyState, Input, KeyValue, Modal, MoneyInput, SearchInput, Textarea, Toggle,
} from '@/components/ui'
import { Flower } from '@/components/brand/Flower'
import { useApp, toast, netOf, summarize, supporterCount } from '@/store'
import { DOMAIN } from '@/data/reference'
import { formatDateTime, formatNumber, formatVND, timeAgo } from '@/lib/format'
import { cn } from '@/lib/cn'
import { RowMenu, Toolbar, copyText, downloadCsv, matches } from '@/features/kiemtien/shared'

const TABS = [{ value: 'list', label: 'Người ủng hộ' }, { value: 'settings', label: 'Cài đặt' }]

export default function SupportersPage() {
  const [tab, setTab] = useState('list')
  return (
    <DashPage title="Ủng hộ" desc="Theo dõi những bông hoa bạn nhận được và tuỳ chỉnh cách người hâm mộ tặng hoa." tabs={TABS} tab={tab} onTab={setTab}>
      {tab === 'list' ? <SupportersTab /> : <SettingsTab />}
    </DashPage>
  )
}

/* ---------------- Tab: Người ủng hộ ---------------- */
function SupportersTab() {
  const supports = useApp((s) => s.supports)
  const page = useApp((s) => s.page)
  const mutate = useApp((s) => s.mutate)
  const [query, setQuery] = useState('')
  const [shown, setShown] = useState(12)
  const [detailId, setDetailId] = useState(null)
  const [refund, setRefund] = useState(null)

  const flowers = useMemo(() => supports.filter((s) => s.type === 'flower'), [supports])
  const list = useMemo(() => flowers.filter((s) => matches(query, s.name, s.email)), [flowers, query])
  const detail = flowers.find((s) => s.id === detailId)

  const doRefund = () => {
    const target = refund
    mutate((d) => { d.supports = d.supports.filter((s) => s.id !== target.id) })
    setDetailId(null)
    toast({ title: 'Đã hoàn tiền', desc: `${formatVND(target.amount)} sẽ về tài khoản của ${target.name} trong 3–5 ngày làm việc.` })
  }

  const exportCsv = () => downloadCsv('nguoi-ung-ho.csv',
    ['Tên', 'Email', 'Số lượng', 'Số tiền (VND)', 'Lời nhắn', 'Trả lời', 'Thời gian', 'Riêng tư'],
    list.map((s) => [s.name, s.email, s.qty, s.amount, s.message, s.reply || '', formatDateTime(s.at), s.private ? 'Có' : 'Không']))

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Người ủng hộ" value={formatNumber(supporterCount(flowers))} icon={Users} />
        <StatTile label="30 ngày qua" value={formatVND(summarize(flowers, 30).total)} icon={CalendarDays} />
        <StatTile label="Toàn thời gian" value={formatVND(summarize(flowers, 0).total)} icon={Wallet} />
      </div>

      <Section title="Lượt tặng hoa gần đây" padded={false}
        action={flowers.length > 0 && <Button size="sm" variant="outline" icon={Download} onClick={exportCsv} disabled={!list.length}>Xuất CSV</Button>}>
        {flowers.length === 0 ? (
          <EmptyState icon={Heart} title="Chưa có ai tặng hoa"
            desc="Hãy chia sẻ trang của bạn với người hâm mộ. Bông hoa đầu tiên thường đến từ những người đã theo dõi bạn lâu nhất."
            action={<Button variant="primary" icon={Share2} onClick={() => copyText(`https://${DOMAIN}/${page.username}`)}>Sao chép liên kết trang</Button>} />
        ) : (
          <>
            <Toolbar className="px-5 sm:px-6 pt-4">
              <SearchInput value={query} onChange={(v) => { setQuery(v); setShown(12) }} placeholder="Tìm theo tên hoặc email" className="sm:max-w-xs" />
              <span className="ds-caption sm:ml-auto">{formatNumber(list.length)} lượt tặng</span>
            </Toolbar>
            {list.length === 0 ? (
              <EmptyState compact title="Không tìm thấy ai" desc={`Không có người ủng hộ nào khớp với “${query}”.`} />
            ) : (
              <ul className="mt-2 pb-2">
                {list.slice(0, shown).map((s) => (
                  <li key={s.id} className="group flex items-start gap-3 px-5 sm:px-6 py-3.5 border-b border-line last:border-0 cursor-pointer transition-colors hover:bg-subtle"
                    onClick={() => setDetailId(s.id)}>
                    <Avatar name={s.name} color={s.avatarColor} size={38} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <span className="text-[14px] font-[550] text-fg">{s.name}</span>
                        <span className="text-[13px] text-muted">tặng <span className="num font-[550] text-fg">{s.qty} × {page.item.emoji}</span></span>
                        {s.private && <Badge size="sm" icon={EyeOff}>Riêng tư</Badge>}
                      </div>
                      {s.message && <p className="mt-1.5 rounded-xl rounded-tl-sm bg-subtle group-hover:bg-surface px-3 py-2 text-[13.5px] text-dim w-fit max-w-full break-words transition-colors">{s.message}</p>}
                      {s.reply && <p className="mt-1.5 flex items-start gap-1.5 text-[13px] text-muted"><MessageSquareReply size={14} className="mt-0.5 shrink-0 text-brand-ink" /><span className="min-w-0 break-words">Bạn đã trả lời: {s.reply}</span></p>}
                      <div className="mt-1 ds-caption">{timeAgo(s.at)}</div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <span className="num text-[14px] font-[600] text-fg">{formatVND(s.amount)}</span>
                      <RowMenu items={[
                        { label: 'Xem chi tiết', icon: Eye, onClick: () => setDetailId(s.id) },
                        { divider: true },
                        { label: 'Hoàn tiền', icon: Undo2, danger: true, onClick: () => setRefund(s) },
                      ]} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
            {list.length > shown && (
              <div className="flex justify-center border-t border-line py-3">
                <Button variant="ghost" size="sm" onClick={() => setShown((n) => n + 12)}>Xem thêm {Math.min(12, list.length - shown)} lượt</Button>
              </div>
            )}
          </>
        )}
      </Section>

      <SupportDrawer key={detailId || 'none'} support={detail} item={page.item} onClose={() => setDetailId(null)} onRefund={() => setRefund(detail)} />
      <Confirm open={!!refund} onClose={() => setRefund(null)} onConfirm={doRefund} danger confirmLabel="Hoàn tiền"
        title="Hoàn tiền lượt tặng hoa này?"
        desc={refund ? `${formatVND(refund.amount)} sẽ được trả lại cho ${refund.name} và giao dịch bị xoá khỏi danh sách. Thao tác này không hoàn tác được.` : ''} />
    </>
  )
}

function SupportDrawer({ support, item, onClose, onRefund }) {
  const mutate = useApp((s) => s.mutate)
  const [reply, setReply] = useState(support?.reply || '')
  if (!support) return null
  const dirty = reply.trim() !== (support.reply || '')
  const save = () => {
    mutate((d) => {
      const s = d.supports.find((x) => x.id === support.id)
      if (!s) return
      if (reply.trim()) s.reply = reply.trim(); else delete s.reply
    })
    toast(reply.trim() ? 'Đã lưu lời trả lời' : 'Đã xoá lời trả lời')
  }
  return (
    <Drawer open onClose={onClose} title="Chi tiết lượt tặng hoa"
      header={(
        <div className="flex items-center gap-3">
          <Avatar name={support.name} color={support.avatarColor} size={44} />
          <div className="min-w-0">
            <div className="ds-h2 truncate">{support.name}</div>
            <div className="ds-caption truncate">{support.email || 'Không để lại email'}</div>
          </div>
        </div>
      )}
      footer={<>
        <Button variant="danger-soft" icon={Undo2} onClick={onRefund}>Hoàn tiền</Button>
        <Button variant="primary" className="ml-auto" disabled={!dirty} onClick={save}>Lưu trả lời</Button>
      </>}>
      <div className="rounded-2xl bg-brand-50 px-5 py-4 text-center">
        <div className="text-[26px] leading-none">{item.emoji}</div>
        <div className="mt-2 text-[24px] font-[650] tracking-tight num text-fg">{formatVND(support.amount)}</div>
        <div className="mt-0.5 text-[13px] text-brand-ink">{support.qty} {item.name}</div>
      </div>

      <KeyValue className="mt-4" items={[
        { label: 'Thời gian', value: formatDateTime(support.at) },
        { label: 'Phí nền tảng 5%', value: formatVND(support.amount - netOf(support.amount)) },
        { label: 'Bạn thực nhận', value: <span className="num font-[600]">{formatVND(netOf(support.amount))}</span> },
        { label: 'Hiển thị', value: support.private ? <Badge icon={EyeOff}>Riêng tư</Badge> : <Badge tone="pos" icon={Eye}>Công khai</Badge> },
        { label: 'Mã giao dịch', value: <span className="num text-muted">{support.id}</span> },
      ]} />

      <div className="mt-5">
        <div className="ds-label mb-2">Lời nhắn</div>
        {support.message
          ? <p className="rounded-xl rounded-tl-sm bg-subtle px-3.5 py-2.5 text-[14px] text-fg leading-relaxed break-words">{support.message}</p>
          : <p className="text-[13.5px] text-faint">Người ủng hộ không để lại lời nhắn.</p>}
      </div>

      <Textarea className="mt-5" label="Trả lời của bạn" rows={4} maxLength={300} value={reply} onChange={(e) => setReply(e.target.value)}
        placeholder={`Cảm ơn ${support.name.split(' ').pop()} nhé…`}
        hint={support.private ? 'Lượt tặng riêng tư: chỉ người ủng hộ nhìn thấy lời trả lời.' : `Hiện ngay dưới lời nhắn trên trang của bạn · ${reply.length}/300`} />
    </Drawer>
  )
}

/* ---------------- Tab: Cài đặt ---------------- */
const QUICK_PRICES = [10000, 20000, 30000, 50000]

function SettingsTab() {
  const settings = useApp((s) => s.settings)
  const page = useApp((s) => s.page)
  const mutate = useApp((s) => s.mutate)
  const initial = () => ({
    unitPrice: settings.unitPrice,
    custom: !QUICK_PRICES.includes(settings.unitPrice),
    presets: settings.presets.map(String),
    thankYou: settings.thankYou,
    charity: { ...settings.charity, percent: String(settings.charity.percent) },
  })
  const [f, setF] = useState(initial)
  const [errors, setErrors] = useState({})
  const [preview, setPreview] = useState(false)
  const set = (patch) => { setF((x) => ({ ...x, ...patch })); setErrors({}) }

  const presetNums = f.presets.map((p) => parseInt(p, 10))
  const dirty = f.unitPrice !== settings.unitPrice || f.thankYou !== settings.thankYou
    || presetNums.join() !== settings.presets.join()
    || f.charity.on !== settings.charity.on || Number(f.charity.percent) !== settings.charity.percent || f.charity.name !== settings.charity.name

  const save = () => {
    const e = {}
    if (f.unitPrice < 1000) e.unitPrice = 'Giá tối thiểu là 1.000 ₫.'
    else if (f.unitPrice > 10000000) e.unitPrice = 'Giá tối đa là 10.000.000 ₫.'
    if (presetNums.some((n) => !Number.isInteger(n) || n < 1 || n > 999)) e.presets = 'Mỗi mức là một số nguyên từ 1 đến 999.'
    else if (new Set(presetNums).size !== presetNums.length) e.presets = 'Ba mức chọn nhanh cần khác nhau.'
    if (!f.thankYou.trim()) e.thankYou = 'Hãy viết đôi lời cảm ơn người ủng hộ.'
    const pct = Number(f.charity.percent)
    if (f.charity.on) {
      if (!Number.isInteger(pct) || pct < 1 || pct > 100) e.percent = 'Nhập tỷ lệ từ 1 đến 100.'
      if (!f.charity.name.trim()) e.charityName = 'Hãy cho người ủng hộ biết tên quỹ.'
    }
    setErrors(e)
    if (Object.keys(e).length) { toast({ title: 'Chưa lưu được', desc: 'Vui lòng kiểm tra lại các ô được đánh dấu.', tone: 'neg' }); return }
    const sorted = [...presetNums].sort((a, b) => a - b)
    mutate((d) => {
      d.settings.unitPrice = f.unitPrice
      d.settings.presets = sorted
      d.settings.thankYou = f.thankYou.trim()
      d.settings.charity = { on: f.charity.on, percent: f.charity.on ? pct : settings.charity.percent, name: f.charity.name.trim() }
    })
    setF((x) => ({ ...x, presets: sorted.map(String), thankYou: x.thankYou.trim(), charity: { ...x.charity, name: x.charity.name.trim(), percent: String(f.charity.on ? pct : settings.charity.percent) } }))
    toast('Đã lưu thay đổi')
  }

  return (
    <>
      <Section title={`Giá mỗi ${page.item.name}`} desc={`Người ủng hộ chọn số ${page.item.name} muốn tặng; tổng tiền = số lượng × giá này.`}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {QUICK_PRICES.map((p) => {
            const on = !f.custom && f.unitPrice === p
            return (
              <button key={p} type="button" aria-pressed={on} onClick={() => set({ unitPrice: p, custom: false })}
                className={cn('h-11 rounded-xl border text-[14px] font-[600] num transition-[border,background,box-shadow]',
                  on ? 'border-brand-400 bg-brand-50 text-brand-ink ring-[3px] ring-brand-100' : 'border-line-strong bg-surface text-fg hover:border-faint')}>
                {formatVND(p)}
              </button>
            )
          })}
          <button type="button" aria-pressed={f.custom} onClick={() => set({ custom: true })}
            className={cn('col-span-2 sm:col-span-1 h-11 rounded-xl border text-[14px] font-[550] transition-[border,background,box-shadow]',
              f.custom ? 'border-brand-400 bg-brand-50 text-brand-ink ring-[3px] ring-brand-100' : 'border-line-strong bg-surface text-fg hover:border-faint')}>
            Số khác
          </button>
        </div>
        {f.custom && (
          <MoneyInput className="mt-3 max-w-[240px]" label="Giá tự nhập" value={f.unitPrice} onChange={(v) => set({ unitPrice: v })} autoFocus />
        )}
        {errors.unitPrice && <p className="mt-2 text-[12.5px] text-neg">{errors.unitPrice}</p>}
      </Section>

      <Section title="Các mức chọn nhanh" desc="Ba nút số lượng hiện sẵn trên trang để người ủng hộ chọn trong một chạm.">
        <div className="grid grid-cols-3 gap-3 max-w-[420px]">
          {f.presets.map((p, i) => (
            <Input key={i} aria-label={`Mức ${i + 1}`} inputMode="numeric" value={p} prefix={page.item.emoji} inputClassName="num"
              onChange={(e) => set({ presets: f.presets.map((x, j) => (j === i ? e.target.value.replace(/\D/g, '').slice(0, 3) : x)) })} />
          ))}
        </div>
        {errors.presets
          ? <p className="mt-2 text-[12.5px] text-neg">{errors.presets}</p>
          : (
            <div className="mt-3 flex flex-wrap gap-2">
              {presetNums.filter((n) => n > 0).map((n, i) => (
                <span key={i} className="inline-flex items-center gap-1.5 rounded-full bg-subtle px-3 py-1 text-[12.5px] text-muted">
                  <span className="num font-[600] text-fg">{n} {page.item.emoji}</span>= <span className="num">{formatVND(n * f.unitPrice)}</span>
                </span>
              ))}
            </div>
          )}
      </Section>

      <Section title="Lời cảm ơn" desc="Hiện ngay sau khi người hâm mộ tặng hoa thành công."
        action={<Button size="sm" variant="outline" icon={Eye} onClick={() => setPreview(true)}>Xem trước</Button>}>
        <Textarea rows={4} maxLength={300} value={f.thankYou} onChange={(e) => set({ thankYou: e.target.value })} error={errors.thankYou}
          hint={`${f.thankYou.length}/300 ký tự`} placeholder="Cảm ơn bạn đã tặng hoa!" />
      </Section>

      <Section>
        <Toggle checked={f.charity.on} onChange={(v) => set({ charity: { ...f.charity, on: v } })}
          label="Trích một phần cho quỹ thiện nguyện" desc="Cho người ủng hộ biết một phần mỗi bông hoa sẽ được gửi tới quỹ bạn chọn." />
        {f.charity.on && (
          <div className="mt-4 grid gap-3 sm:grid-cols-[140px_1fr] animate-fade-in">
            <Input label="Tỷ lệ trích" inputMode="numeric" suffix="%" inputClassName="num" value={f.charity.percent} error={errors.percent}
              onChange={(e) => set({ charity: { ...f.charity, percent: e.target.value.replace(/\D/g, '').slice(0, 3) } })} />
            <Input label="Tên quỹ" value={f.charity.name} error={errors.charityName} maxLength={80} placeholder="Ví dụ: Quỹ Trồng cây cho trường vùng cao"
              onChange={(e) => set({ charity: { ...f.charity, name: e.target.value } })} />
            <Callout tone="brand" icon={HandCoins} className="sm:col-span-2">
              Với mỗi {page.item.name} giá {formatVND(f.unitPrice)}, khoảng <b className="num">{formatVND(Math.round(f.unitPrice * (Number(f.charity.percent) || 0) / 100))}</b> sẽ dành cho quỹ. Bạn tự chuyển khoản đóng góp này sau khi rút tiền.
            </Callout>
          </div>
        )}
      </Section>

      <div className="flex items-center justify-end gap-2">
        {dirty && <Button variant="ghost" onClick={() => { setF(initial()); setErrors({}) }}>Hoàn tác</Button>}
        <Button variant="primary" size="lg" disabled={!dirty} onClick={save}>Lưu thay đổi</Button>
      </div>

      <Modal open={preview} onClose={() => setPreview(false)} size="sm" title="Xem trước màn hình cảm ơn"
        footer={<Button variant="secondary" onClick={() => setPreview(false)}>Đóng</Button>}>
        <div className="rounded-2xl border border-line bg-canvas px-5 py-7 text-center">
          <div className="mx-auto flex w-fit items-end gap-1">
            <Flower kind="mai" size={22} /><Flower kind="dao" size={44} spin /><Flower kind="sen" size={22} />
          </div>
          <div className="mt-3 ds-h2">Cảm ơn bạn!</div>
          <p className="mt-1 text-[13.5px] text-muted">
            Bạn vừa tặng {page.name} <span className="num font-[600] text-fg">{presetNums[1] || 3} {page.item.emoji}</span> · <span className="num">{formatVND((presetNums[1] || 3) * f.unitPrice)}</span>
          </p>
          <div className="mt-4 flex items-start gap-2.5 text-left">
            <Avatar name={page.name} color={page.avatarColor} size={34} />
            <div className="min-w-0 rounded-2xl rounded-tl-sm bg-surface border border-line px-3.5 py-2.5">
              <div className="text-[12.5px] font-[600] text-fg">{page.name}</div>
              <p className="mt-0.5 text-[13.5px] text-dim whitespace-pre-line break-words">{f.thankYou.trim() || 'Lời cảm ơn của bạn sẽ hiện ở đây.'}</p>
            </div>
          </div>
          {f.charity.on && f.charity.name.trim() && (
            <p className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-ice-soft px-3 py-1 text-[12.5px] text-ice">
              <HandCoins size={13} /> {Number(f.charity.percent) || 0}% được gửi tới {f.charity.name.trim()}
            </p>
          )}
          <div className="mt-5 flex justify-center gap-2">
            <span className="inline-flex h-9 items-center rounded-full bg-brand-500 px-4 text-[13.5px] font-[550] text-white">Chia sẻ</span>
            <span className="inline-flex h-9 items-center rounded-full bg-subtle px-4 text-[13.5px] font-[550] text-fg">Về trang của {page.name.split(' ').pop()}</span>
          </div>
        </div>
      </Modal>
    </>
  )
}
