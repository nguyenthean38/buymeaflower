import { useMemo, useState } from 'react'
import { CalendarDays, Download, Eye, EyeOff, ExternalLink, FileText, Pencil, Plus, ShoppingBag, Store, Trash2, Undo2, Wallet } from 'lucide-react'
import { DashPage, Section, StatTile } from '@/components/layout/DashPage'
import { Avatar, Badge, Button, Confirm, DynIcon, EmptyState, KeyValue, Modal, SearchInput, Select } from '@/components/ui'
import { Flower, FlowerArt } from '@/components/brand/Flower'
import { useApp, toast, netOf } from '@/store'
import { DOMAIN, SHOP_KIND_LABEL, SHOP_TEMPLATES } from '@/data/reference'
import { formatDateTime, formatNumber, formatVND, timeAgo } from '@/lib/format'
import { cn } from '@/lib/cn'
import { CopyLink, RowMenu, Toolbar, downloadCsv, inLastDays, matches } from '@/features/kiemtien/shared'
import { ProductEditor, priceLabel } from '@/features/kiemtien/ProductEditor'

const WORDS = ['Cửa hàng', 'Sản phẩm', 'Quà tặng', 'Dịch vụ']

export default function ShopPage() {
  const word = useApp((s) => s.shop.word)
  const orderCount = useApp((s) => s.shop.claims.length)
  const itemCount = useApp((s) => s.shop.items.length)
  const [tab, setTab] = useState('orders')
  return (
    <DashPage title={word || 'Cửa hàng'} desc="Bán tệp tải về, vé sự kiện, lịch hẹn và nhận đặt hàng ngay trên trang của bạn." tab={tab} onTab={setTab}
      tabs={[{ value: 'orders', label: 'Đơn hàng', count: orderCount }, { value: 'items', label: 'Sản phẩm', count: itemCount }]}>
      {tab === 'orders' ? <OrdersTab onGoItems={() => setTab('items')} /> : <ItemsTab />}
    </DashPage>
  )
}

/* ---------------- Tab: Đơn hàng ---------------- */
function OrdersTab({ onGoItems }) {
  const { items, claims } = useApp((s) => s.shop)
  const mutate = useApp((s) => s.mutate)
  const [query, setQuery] = useState('')
  const [itemFilter, setItemFilter] = useState('')
  const [shown, setShown] = useState(12)
  const [openId, setOpenId] = useState(null)
  const [refund, setRefund] = useState(null)

  const itemById = useMemo(() => Object.fromEntries(items.map((i) => [i.id, i])), [items])
  const nameOf = (c) => itemById[c.itemId]?.name || 'Sản phẩm đã xoá'
  const paid = claims.filter((c) => c.status !== 'refunded')
  const total = paid.reduce((a, c) => a + c.amount, 0)
  const total30 = paid.filter((c) => inLastDays(c.at, 30)).reduce((a, c) => a + c.amount, 0)

  const list = claims.filter((c) => (!itemFilter || c.itemId === itemFilter) && matches(query, c.name, c.email, nameOf(c)))
  const open = claims.find((c) => c.id === openId)

  const doRefund = () => {
    const c = refund
    mutate((d) => {
      const x = d.shop.claims.find((k) => k.id === c.id)
      if (x) x.status = 'refunded'
      const i = d.supports.findIndex((s) => s.type === 'shop' && s.itemId === c.itemId && s.email === c.email && s.at === c.at)
      if (i >= 0) d.supports.splice(i, 1)
    })
    toast({ title: 'Đã hoàn tiền đơn hàng', desc: `${formatVND(c.amount)} sẽ về tài khoản của ${c.name} trong 3–5 ngày làm việc.` })
  }

  const exportCsv = () => downloadCsv('don-hang.csv',
    ['Mã đơn', 'Người mua', 'Email', 'Sản phẩm', 'Số tiền (VND)', 'Trạng thái', 'Câu trả lời', 'Thời gian'],
    list.map((c) => [c.id, c.name, c.email, nameOf(c), c.amount, c.status === 'refunded' ? 'Đã hoàn tiền' : 'Đã thanh toán', c.answer || '', formatDateTime(c.at)]))

  const set = (fn) => (v) => { fn(v); setShown(12) }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <StatTile label="Đơn hàng" value={formatNumber(claims.length)} icon={ShoppingBag} />
        <StatTile label="30 ngày qua" value={formatVND(total30)} icon={CalendarDays} />
        <StatTile label="Toàn thời gian" value={formatVND(total)} icon={Wallet} />
      </div>

      <Section title="Đơn hàng gần đây" padded={false}
        action={claims.length > 0 && <Button size="sm" variant="outline" icon={Download} onClick={exportCsv} disabled={!list.length}>Xuất CSV</Button>}>
        {claims.length === 0 ? (
          <EmptyState icon={ShoppingBag} title="Chưa có đơn hàng nào"
            desc="Khi có người mua sản phẩm của bạn, đơn hàng sẽ hiện ở đây kèm câu trả lời của họ."
            action={<Button variant="primary" icon={Plus} onClick={onGoItems}>{items.length ? 'Xem sản phẩm' : 'Thêm sản phẩm đầu tiên'}</Button>} />
        ) : (
          <>
            <Toolbar className="px-5 sm:px-6 pt-4">
              <SearchInput value={query} onChange={set(setQuery)} placeholder="Tìm theo người mua, sản phẩm" className="sm:max-w-xs" />
              <Select size="sm" className="sm:w-56 [&>div]:h-9" value={itemFilter} onChange={(e) => set(setItemFilter)(e.target.value)}
                placeholder="Tất cả sản phẩm" options={items.map((i) => ({ value: i.id, label: i.name }))} />
              <span className="ds-caption sm:ml-auto">{formatNumber(list.length)} đơn</span>
            </Toolbar>
            {list.length === 0 ? (
              <EmptyState compact title="Không có đơn hàng phù hợp" desc="Thử đổi từ khoá hoặc bộ lọc sản phẩm." />
            ) : (
              <ul className="mt-2 pb-2">
                {list.slice(0, shown).map((c) => {
                  const refunded = c.status === 'refunded'
                  return (
                    <li key={c.id} onClick={() => setOpenId(c.id)}
                      className="flex items-center gap-3 px-5 sm:px-6 py-3.5 border-b border-line last:border-0 cursor-pointer transition-colors hover:bg-subtle">
                      <Avatar name={c.name} color={c.avatarColor} size={38} />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="text-[14px] font-[550] text-fg">{c.name}</span>
                          {refunded && <Badge size="sm" tone="neg">Đã hoàn tiền</Badge>}
                        </div>
                        <div className="truncate text-[13px] text-muted">{nameOf(c)}</div>
                        <div className="ds-caption">{timeAgo(c.at)}</div>
                      </div>
                      <div className="flex shrink-0 items-center gap-1">
                        <span className={cn('num text-[14px] font-[600]', refunded ? 'text-faint line-through' : 'text-fg')}>{formatVND(c.amount)}</span>
                        <RowMenu items={[
                          { label: 'Xem thông tin', icon: FileText, onClick: () => setOpenId(c.id) },
                          !refunded && { divider: true },
                          !refunded && { label: 'Hoàn tiền', icon: Undo2, danger: true, onClick: () => setRefund(c) },
                        ]} />
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
            {list.length > shown && (
              <div className="flex justify-center border-t border-line py-3">
                <Button variant="ghost" size="sm" onClick={() => setShown((n) => n + 12)}>Xem thêm {Math.min(12, list.length - shown)} đơn</Button>
              </div>
            )}
          </>
        )}
      </Section>

      <Modal open={!!open} onClose={() => setOpenId(null)} title="Thông tin đơn hàng"
        footer={open && <>
          {open.status !== 'refunded' && <Button variant="danger-soft" icon={Undo2} className="mr-auto" onClick={() => setRefund(open)}>Hoàn tiền</Button>}
          <Button variant="secondary" onClick={() => setOpenId(null)}>Đóng</Button>
        </>}>
        {open && (
          <>
            <div className="flex items-center gap-3">
              <Avatar name={open.name} color={open.avatarColor} size={48} />
              <div className="min-w-0">
                <div className="ds-h2 truncate">{open.name}</div>
                <div className="ds-caption truncate">{open.email || 'Không để lại email'}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 rounded-2xl bg-subtle p-3">
              <div className="size-14 shrink-0 overflow-hidden rounded-xl">
                <FlowerArt seed={itemById[open.itemId]?.art || 1} className="size-full" />
              </div>
              <div className="min-w-0">
                <div className="text-[14px] font-[550] text-fg break-words">{nameOf(open)}</div>
                <div className="ds-caption">{SHOP_KIND_LABEL[itemById[open.itemId]?.kind] || 'Sản phẩm'}</div>
              </div>
            </div>
            <KeyValue className="mt-2" items={[
              { label: 'Mã đơn', value: <span className="num text-muted">{open.id}</span> },
              { label: 'Thời gian', value: formatDateTime(open.at) },
              { label: 'Số tiền', value: <span className="num font-[600]">{formatVND(open.amount)}</span> },
              open.status !== 'refunded' && { label: 'Bạn thực nhận (sau phí 5%)', value: <span className="num">{formatVND(netOf(open.amount))}</span> },
              { label: 'Trạng thái', value: open.status === 'refunded' ? <Badge tone="neg" dot>Đã hoàn tiền</Badge> : <Badge tone="pos" dot>Đã thanh toán</Badge> },
            ]} />
            {(itemById[open.itemId]?.question || open.answer) && (
              <div className="mt-4">
                <div className="ds-label">Câu trả lời của người mua</div>
                {itemById[open.itemId]?.question && <div className="mt-2 text-[13px] text-muted break-words">{itemById[open.itemId].question}</div>}
                <p className="mt-1.5 rounded-xl rounded-tl-sm bg-subtle px-3.5 py-2.5 text-[14px] text-fg break-words">{open.answer || <span className="text-faint">Người mua chưa trả lời.</span>}</p>
              </div>
            )}
          </>
        )}
      </Modal>
      <Confirm open={!!refund} onClose={() => setRefund(null)} onConfirm={doRefund} danger confirmLabel="Hoàn tiền"
        title="Hoàn tiền đơn hàng này?"
        desc={refund ? `${formatVND(refund.amount)} sẽ được trả lại cho ${refund.name}. Đơn hàng được giữ lại với nhãn “Đã hoàn tiền”.` : ''} />
    </>
  )
}

/* ---------------- Tab: Sản phẩm ---------------- */
function ItemsTab() {
  const { items, claims, word } = useApp((s) => s.shop)
  const username = useApp((s) => s.page.username)
  const mutate = useApp((s) => s.mutate)
  const [editor, setEditor] = useState(null) // { item } | { kind, preset }
  const [created, setCreated] = useState(null)
  const [remove, setRemove] = useState(null)
  const soldOf = (id) => claims.filter((c) => c.itemId === id && c.status !== 'refunded').length

  const toggleActive = (it) => {
    mutate((d) => { const x = d.shop.items.find((k) => k.id === it.id); if (x) x.active = !x.active })
    toast(it.active ? `Đã ẩn “${it.name}” khỏi trang của bạn` : `“${it.name}” đã hiện trở lại`)
  }
  const doRemove = () => {
    const it = remove
    mutate((d) => { d.shop.items = d.shop.items.filter((x) => x.id !== it.id) })
    toast(`Đã xoá “${it.name}”`)
  }

  return (
    <>
      <Section title="Tạo nhanh từ mẫu" desc="Chọn một mẫu để có sẵn tên, giá và mô tả gợi ý; bạn sửa lại trước khi đăng bán.">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {SHOP_TEMPLATES.map((t) => (
            <button key={t.kind} type="button" onClick={() => setEditor({ kind: t.kind, preset: t.preset })}
              className={cn('group flex min-h-[104px] flex-col justify-between rounded-2xl p-4 text-left transition-transform hover:-translate-y-0.5 active:translate-y-0', t.tone)}>
              <span className="grid size-9 place-items-center rounded-xl bg-surface/80 text-fg"><DynIcon name={t.icon} size={18} /></span>
              <span className="mt-3 text-[14px] font-[600] leading-snug text-fg">{t.label}</span>
            </button>
          ))}
        </div>
      </Section>

      <Section title="Sản phẩm của tôi" padded={false} badge={items.length > 0 && <Badge size="sm">{items.length}</Badge>}
        action={<Button size="sm" variant="primary" icon={Plus} onClick={() => setEditor({ kind: 'scratch' })}>Thêm sản phẩm</Button>}>
        {items.length === 0 ? (
          <EmptyState icon={Store} title="Kệ hàng còn trống"
            desc="Thêm sản phẩm đầu tiên: một bộ hình nền, một buổi trò chuyện hay một suất đặt vẽ đều được." />
        ) : (
          <ul className="pb-2">
            {items.map((it) => (
              <li key={it.id} className="flex items-center gap-3.5 px-5 sm:px-6 py-3.5 border-b border-line last:border-0">
                <button type="button" onClick={() => setEditor({ item: it })} aria-label={`Sửa ${it.name}`}
                  className={cn('size-16 shrink-0 overflow-hidden rounded-xl transition-opacity', !it.active && 'opacity-50')}>
                  <FlowerArt seed={it.art} className="size-full" />
                </button>
                <div className="min-w-0 flex-1">
                  <div className="text-[14px] font-[550] text-fg break-words">{it.name}</div>
                  <div className="mt-1 flex flex-wrap items-center gap-1.5">
                    <Badge size="sm">{SHOP_KIND_LABEL[it.kind] || SHOP_KIND_LABEL.scratch}</Badge>
                    {!it.active && <Badge size="sm" tone="warn" icon={EyeOff}>Đang ẩn</Badge>}
                    <span className="text-[12.5px] text-muted">Đã bán <span className="num font-[550] text-dim">{formatNumber(soldOf(it.id))}</span>{it.limit ? `/${formatNumber(it.limit)}` : ''}</span>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <span className="num text-[14px] font-[600] text-fg">{priceLabel(it)}</span>
                  <RowMenu items={[
                    { label: 'Sửa', icon: Pencil, onClick: () => setEditor({ item: it }) },
                    { label: it.active ? 'Ẩn khỏi trang' : 'Hiện lại', icon: it.active ? EyeOff : Eye, onClick: () => toggleActive(it) },
                    { divider: true },
                    { label: 'Xoá', icon: Trash2, danger: true, onClick: () => setRemove(it) },
                  ]} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Section title="Đổi tên gọi cửa hàng" desc="Tên mục này trên trang của bạn. Chọn cách gọi hợp với thứ bạn bán.">
        <Select className="max-w-[280px]" value={WORDS.includes(word) ? word : WORDS[0]} options={WORDS}
          onChange={(e) => { const w = e.target.value; mutate((d) => { d.shop.word = w }); toast(`Đã đổi tên gọi thành “${w}”`) }} />
      </Section>

      {editor && <ProductEditor item={editor.item} kind={editor.kind} preset={editor.preset} onClose={() => setEditor(null)} onCreated={setCreated} />}

      <Modal open={!!created} onClose={() => setCreated(null)} size="sm" hideClose>
        {created && (
          <div className="pt-2 text-center">
            <div className="relative mx-auto size-24 overflow-hidden rounded-2xl border border-line">
              <FlowerArt seed={created.art} className="size-full" />
            </div>
            <div className="mx-auto -mt-4 relative w-fit rounded-full bg-surface p-1"><Flower kind="dao" size={28} spin /></div>
            <h2 className="mt-2 ds-h1">Sản phẩm đã lên kệ</h2>
            <p className="mt-1.5 text-[14px] text-muted">
              <b className="text-fg">“{created.name}”</b> đang được bán với giá <span className="num">{priceLabel(created).toLowerCase()}</span>. Chia sẻ liên kết để có đơn hàng đầu tiên nhé.
            </p>
            <CopyLink url={`${DOMAIN}/${username}`} className="mt-5 text-left" />
            <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
              <Button variant="outline" icon={ExternalLink} to={`/${username}`}>Xem trang của tôi</Button>
              <Button variant="secondary" onClick={() => setCreated(null)}>Xong</Button>
            </div>
          </div>
        )}
      </Modal>
      <Confirm open={!!remove} onClose={() => setRemove(null)} onConfirm={doRemove} danger confirmLabel="Xoá sản phẩm"
        title={remove ? `Xoá “${remove.name}”?` : ''}
        desc={remove && soldOf(remove.id) > 0 ? `Sản phẩm đã có ${soldOf(remove.id)} đơn. Các đơn hàng cũ vẫn được giữ lại nhưng người mua không thể mua thêm.` : 'Sản phẩm sẽ biến mất khỏi trang của bạn. Thao tác này không hoàn tác được.'} />
    </>
  )
}
