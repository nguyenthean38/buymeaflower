import { useMemo, useState } from 'react'
import { ArrowDownToLine, Banknote, HandCoins, Landmark, Percent, Receipt, ShieldCheck } from 'lucide-react'
import { DashPage, Section, StatTile } from '@/components/layout/DashPage'
import { Badge, Button, Callout, Confirm, EmptyState, KeyValue, Modal, Money, MoneyInput, Select, Table, THead, Th, Tr, Td } from '@/components/ui'
import { SplitBar } from '@/components/charts'
import { useApp, toast, uid, nowISO, balanceOf, netOf } from '@/store'
import { formatDate, formatTime, formatVND } from '@/lib/format'
import { BankLinkFlow, BankLogo, bankById, maskAccount } from '@/features/thietlap/BankLinkFlow'

const MIN_PAYOUT = 50000
const SCHEDULES = [
  { value: 'weekly', label: 'Hằng tuần', note: 'Toàn bộ số dư được tự chuyển vào thứ Hai mỗi tuần.' },
  { value: 'monthly', label: 'Hằng tháng', note: 'Toàn bộ số dư được tự chuyển vào ngày 1 mỗi tháng.' },
  { value: 'manual', label: 'Thủ công', note: 'Tiền chỉ được chuyển khi bạn bấm “Rút tiền”.' },
]
const STATUS = { done: { label: 'Đã chuyển', tone: 'pos' }, processing: { label: 'Đang xử lý', tone: 'warn' } }

function WithdrawModal({ balance, bank, onClose }) {
  const mutate = useApp((s) => s.mutate)
  const [amount, setAmount] = useState(0)
  const [touched, setTouched] = useState(false)
  const [confirming, setConfirming] = useState(false)
  const [loading, setLoading] = useState(false)
  const info = bankById(bank.bankId)

  const error = amount < MIN_PAYOUT ? `Số tiền rút tối thiểu là ${formatVND(MIN_PAYOUT)}.`
    : amount > balance ? `Số tiền vượt quá số dư có thể rút (${formatVND(balance)}).` : ''

  const next = () => { setTouched(true); if (!error) setConfirming(true) }
  const submit = () => {
    setLoading(true)
    setTimeout(() => {
      mutate((d) => { d.payout.history.unshift({ id: uid('rt'), amount, at: nowISO(), status: 'processing' }) })
      toast({ title: 'Đã tạo lệnh rút tiền', desc: `${formatVND(amount)} sẽ về tài khoản trong 1–2 ngày làm việc.` })
      onClose()
    }, 900)
  }

  if (confirming) {
    return (
      <Modal open onClose={loading ? undefined : onClose} size="sm" title="Xác nhận rút tiền"
        footer={<>
          <Button variant="secondary" disabled={loading} onClick={() => setConfirming(false)}>Quay lại</Button>
          <Button variant="primary" loading={loading} onClick={submit}>Xác nhận rút</Button>
        </>}>
        <div className="mb-3 text-center">
          <div className="ds-caption">Số tiền rút</div>
          <div className="mt-0.5 text-[30px] font-[650] tracking-tight"><Money value={amount} hideable={false} /></div>
        </div>
        <div className="rounded-2xl bg-subtle px-4 py-1">
          <KeyValue items={[
            { label: 'Ngân hàng', value: info?.name || 'Ngân hàng' },
            { label: 'Số tài khoản', value: <span className="num">{maskAccount(bank.number)}</span> },
            { label: 'Chủ tài khoản', value: bank.holder },
            { label: 'Phí rút tiền', value: 'Miễn phí' },
            { label: 'Số dư còn lại', value: <Money value={balance - amount} hideable={false} /> },
          ]} />
        </div>
      </Modal>
    )
  }
  return (
    <Modal open onClose={onClose} size="sm" title="Rút tiền" desc={`Có thể rút ${formatVND(balance)}.`}
      footer={<>
        <Button variant="secondary" onClick={onClose}>Huỷ</Button>
        <Button variant="primary" onClick={next}>Tiếp tục</Button>
      </>}>
      <form onSubmit={(e) => { e.preventDefault(); next() }} className="flex flex-col gap-3 pt-2">
        <MoneyInput big autoFocus value={amount} onChange={setAmount} />
        {touched && error ? <p className="text-[12.5px] text-neg">{error}</p> : <p className="ds-caption">Tối thiểu {formatVND(MIN_PAYOUT)} mỗi lần rút.</p>}
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => setAmount(balance)}>Rút tất cả</Button>
          {balance >= MIN_PAYOUT * 2 && <Button size="sm" variant="ghost" onClick={() => setAmount(Math.floor(balance / 2000) * 1000)}>Một nửa</Button>}
        </div>
      </form>
    </Modal>
  )
}

export default function PayoutPage() {
  const balance = useApp(balanceOf)
  const supports = useApp((s) => s.supports)
  const payout = useApp((s) => s.payout)
  const mutate = useApp((s) => s.mutate)
  const [linking, setLinking] = useState(false)
  const [withdrawing, setWithdrawing] = useState(false)
  const [unlinking, setUnlinking] = useState(false)

  const totals = useMemo(() => {
    const gross = supports.reduce((a, s) => a + s.amount, 0)
    const net = supports.reduce((a, s) => a + netOf(s.amount), 0)
    return { gross, fee: gross - net }
  }, [supports])
  const history = useMemo(() => [...payout.history].sort((a, b) => new Date(b.at) - new Date(a.at)), [payout.history])
  const withdrawn = payout.history.reduce((a, p) => a + p.amount, 0)
  const processing = payout.history.filter((p) => p.status === 'processing').reduce((a, p) => a + p.amount, 0)

  const connected = payout.connected && !!payout.bank
  const bank = connected ? bankById(payout.bank.bankId) : null
  const schedule = SCHEDULES.find((s) => s.value === payout.schedule) || SCHEDULES[0]
  const canWithdraw = connected && balance >= MIN_PAYOUT
  const blockedReason = !connected ? 'Liên kết tài khoản ngân hàng để rút tiền.' : balance < MIN_PAYOUT ? `Cần tối thiểu ${formatVND(MIN_PAYOUT)} để rút.` : ''

  return (
    <DashPage title="Rút tiền" desc="Chuyển số dư từ những bông hoa bạn nhận được về tài khoản ngân hàng của bạn.">
      <Section>
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="min-w-0">
            <div className="text-[13.5px] text-muted">Số dư có thể rút</div>
            <div className="mt-1 text-[38px] font-[650] leading-none tracking-tight"><Money value={balance} /></div>
            <p className="ds-caption mt-2.5">Đã trừ phí nền tảng 5% trên mỗi lượt ủng hộ.{processing > 0 && <> Đang chuyển về ngân hàng: <span className="num font-[600] text-dim">{formatVND(processing)}</span>.</>}</p>
          </div>
          <div className="flex flex-col items-start gap-1.5 sm:items-end">
            <Button variant="primary" size="lg" icon={ArrowDownToLine} disabled={!canWithdraw} onClick={() => setWithdrawing(true)}>Rút tiền</Button>
            {blockedReason && <span className="ds-caption">{blockedReason}</span>}
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 [&>div>div:first-child]:truncate [&>div>div:first-child]:text-[19px] [&>div]:min-w-0">
          <StatTile label="Tổng đã nhận" value={formatVND(totals.gross)} icon={HandCoins} />
          <StatTile label="Phí nền tảng (5%)" value={formatVND(totals.fee)} icon={Percent} />
          <StatTile label="Tổng đã rút" value={formatVND(withdrawn)} icon={Banknote} />
        </div>
        {totals.gross > 0 && (
          <SplitBar className="mt-5" parts={[
            { label: 'có thể rút', value: balance, color: 'var(--c-brand-500)' },
            { label: 'đã rút', value: withdrawn, color: 'var(--c-ice)' },
            { label: 'phí nền tảng', value: totals.fee, color: 'var(--c-chart-6)' },
          ]} />
        )}
      </Section>

      {connected ? (
        <Section title="Tài khoản nhận tiền" badge={<Badge tone="pos" dot size="sm">Đã liên kết</Badge>}>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl bg-subtle p-4">
            <BankLogo bank={bank} className="h-11 w-[76px] text-[11px]" />
            <div className="min-w-0 flex-1 basis-40">
              <div className="truncate text-[14.5px] font-[600]">{bank?.name || 'Ngân hàng'}</div>
              <div className="mt-0.5 text-[13.5px] text-muted"><span className="num">{maskAccount(payout.bank.number)}</span> · {payout.bank.holder}</div>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" onClick={() => setLinking(true)}>Đổi tài khoản</Button>
              <Button variant="ghost" size="sm" className="text-neg hover:bg-neg-soft hover:text-neg" onClick={() => setUnlinking(true)}>Ngắt liên kết</Button>
            </div>
          </div>
          <div className="mt-5 max-w-sm">
            <Select label="Lịch chuyển tiền" value={schedule.value} options={SCHEDULES} hint={schedule.note}
              onChange={(e) => { const v = e.target.value; mutate((d) => { d.payout.schedule = v }); toast(`Lịch chuyển tiền: ${SCHEDULES.find((s) => s.value === v).label.toLowerCase()}`) }} />
          </div>
        </Section>
      ) : (
        <Section>
          <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center">
            <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-brand-50 text-brand-ink"><Landmark size={22} /></span>
            <div className="min-w-0 flex-1">
              <h2 className="ds-h2">Liên kết tài khoản ngân hàng</h2>
              <p className="mt-1 text-[13.5px] text-muted">Mất chừng 2 phút. Bạn cần email, số điện thoại và số tài khoản ngân hàng đứng tên mình.</p>
            </div>
            <Button variant="primary" onClick={() => setLinking(true)}>Liên kết ngay</Button>
          </div>
          <Callout tone="neutral" icon={ShieldCheck} className="mt-5">Tiền của bạn vẫn được giữ an toàn trong số dư cho tới khi bạn liên kết tài khoản.</Callout>
        </Section>
      )}

      <Section title="Lịch sử rút tiền" padded={false}>
        {history.length ? (
          <Table minWidth={380} className="mt-3 pb-2">
            <THead><Th>Ngày</Th><Th align="right">Số tiền</Th><Th align="right">Trạng thái</Th></THead>
            <tbody>
              {history.map((p) => {
                const st = STATUS[p.status] || STATUS.processing
                return (
                  <Tr key={p.id}>
                    <Td><span className="num">{formatDate(p.at)}</span> <span className="num text-faint">{formatTime(p.at)}</span></Td>
                    <Td align="right" className="font-[600]"><Money value={p.amount} /></Td>
                    <Td align="right"><Badge tone={st.tone} dot>{st.label}</Badge></Td>
                  </Tr>
                )
              })}
            </tbody>
          </Table>
        ) : (
          <EmptyState icon={Receipt} title="Chưa có lần rút tiền nào" desc="Các lần rút tiền của bạn sẽ hiện ở đây cùng trạng thái chuyển khoản." />
        )}
      </Section>

      {linking && <BankLinkFlow initial={payout.bank} onClose={() => setLinking(false)} />}
      {withdrawing && connected && <WithdrawModal balance={balance} bank={payout.bank} onClose={() => setWithdrawing(false)} />}
      <Confirm open={unlinking} onClose={() => setUnlinking(false)} danger confirmLabel="Ngắt liên kết" title="Ngắt liên kết tài khoản ngân hàng?"
        desc="Bạn sẽ không rút tiền được cho tới khi liên kết lại. Số dư và lịch sử rút tiền vẫn được giữ nguyên."
        onConfirm={() => { mutate((d) => { d.payout.connected = false; d.payout.bank = null }); toast('Đã ngắt liên kết tài khoản ngân hàng') }} />
    </DashPage>
  )
}
