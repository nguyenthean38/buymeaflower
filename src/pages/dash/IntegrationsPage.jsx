import { useState } from 'react'
import { Check, MessagesSquare, Plug, Radio, Send, Settings2, Sheet, Users, Webhook } from 'lucide-react'
import { DashPage, Section } from '@/components/layout/DashPage'
import { Badge, Button, Callout, Checkbox, Confirm, Field, Input, Modal } from '@/components/ui'
import { useApp, toast } from '@/store'
import { Row } from '@/features/thietlap/shared'

/* Tên dịch vụ là tên chung, không gắn với thương hiệu nào */
const ITEMS = [
  { key: 'discord', name: 'Máy chủ cộng đồng (vai trò cho hội viên)', short: 'máy chủ cộng đồng', icon: Users, color: '#5b6ee0', recommended: true,
    desc: 'Tự cấp vai trò riêng trong máy chủ trò chuyện của bạn theo từng hạng hội viên, và gỡ khi họ rời đi.',
    perms: ['Xem danh sách vai trò trong máy chủ của bạn', 'Cấp và gỡ vai trò cho hội viên', 'Gửi tin chào mừng hội viên mới'] },
  { key: 'zalo', name: 'Nhóm trò chuyện OA', short: 'nhóm trò chuyện OA', icon: MessagesSquare, color: '#1f7fd1',
    desc: 'Mời hội viên mới vào nhóm trò chuyện riêng và báo tin mỗi khi bạn đăng bài.',
    perms: ['Xem các nhóm do bạn quản lý', 'Gửi lời mời vào nhóm cho hội viên', 'Đăng thông báo bài viết mới vào nhóm'] },
  { key: 'wordpress', name: 'Trình cắm cho trang blog', short: 'trang blog', icon: Plug, color: '#2f9e6e',
    desc: 'Hiện nút tặng hoa và khoá bài dành riêng cho hội viên ngay trên blog của bạn.',
    perms: ['Đọc hạng hội viên của người đang xem blog', 'Hiển thị nút tặng hoa trong bài viết'] },
  { key: 'webhook', name: 'Webhook', short: 'webhook', icon: Webhook, color: '#8a5cd6',
    desc: 'Gửi dữ liệu tới máy chủ của bạn mỗi khi có lượt ủng hộ, hội viên hay đơn hàng mới.' },
  { key: 'sheets', name: 'Bảng tính trực tuyến', short: 'bảng tính', icon: Sheet, color: '#e0a019',
    desc: 'Tự thêm một dòng vào bảng tính của bạn cho mỗi lượt ủng hộ, tiện đối soát và làm báo cáo.',
    perms: ['Tạo một bảng tính mới trong tài khoản của bạn', 'Thêm dòng vào bảng tính đó khi có lượt ủng hộ'] },
]
const EVENTS = [
  { value: 'support.new', label: 'Có người ủng hộ mới' },
  { value: 'member.new', label: 'Có hội viên mới' },
  { value: 'member.cancel', label: 'Hội viên huỷ gia hạn' },
  { value: 'order.new', label: 'Có đơn hàng mới trong cửa hàng' },
]
const URL_RE = /^https:\/\/[^\s/.]+(\.[^\s/.]+)+(\/\S*)?$/i

function WebhookModal({ connected, config, onClose }) {
  const mutate = useApp((s) => s.mutate)
  const [url, setUrl] = useState(config?.url || '')
  const [events, setEvents] = useState(config?.events || ['support.new', 'member.new'])
  const [touched, setTouched] = useState(false)
  const [busy, setBusy] = useState('')

  const urlError = !url.trim() ? 'Hãy nhập URL nhận dữ liệu.' : !URL_RE.test(url.trim()) ? 'URL cần bắt đầu bằng https:// và là một địa chỉ hợp lệ.' : ''
  const eventError = events.length ? '' : 'Chọn ít nhất một sự kiện.'
  const toggle = (v) => setEvents((list) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]))

  const run = (kind) => {
    setTouched(true)
    if (urlError || (kind === 'save' && eventError)) return
    setBusy(kind)
    setTimeout(() => {
      setBusy('')
      if (kind === 'test') {
        toast({ title: 'Đã gửi sự kiện thử', desc: `Một lượt ủng hộ mẫu vừa được gửi tới ${new URL(url.trim()).host} (mô phỏng).` })
        return
      }
      mutate((d) => { d.integrations.webhook = true; d.integrations.webhookConfig = { url: url.trim(), events } })
      toast(connected ? 'Đã lưu cấu hình webhook' : 'Đã kết nối webhook')
      onClose()
    }, 800)
  }

  return (
    <Modal open onClose={onClose} title={connected ? 'Cấu hình webhook' : 'Kết nối webhook'} desc="Chúng tôi sẽ gửi một yêu cầu POST dạng JSON tới URL của bạn khi sự kiện xảy ra."
      footer={<>
        <Button variant="outline" icon={Send} loading={busy === 'test'} disabled={!!busy} onClick={() => run('test')} className="mr-auto">Gửi thử</Button>
        <Button variant="secondary" onClick={onClose}>Huỷ</Button>
        <Button variant="primary" loading={busy === 'save'} disabled={!!busy} onClick={() => run('save')}>{connected ? 'Lưu' : 'Kết nối'}</Button>
      </>}>
      <div className="flex flex-col gap-5">
        <Input label="URL nhận dữ liệu" placeholder="https://maychu.vidu.vn/webhook" value={url} autoFocus inputMode="url"
          onChange={(e) => setUrl(e.target.value)} error={touched ? urlError : ''} />
        <Field label="Sự kiện cần nhận" error={touched ? eventError : ''}>
          <div className="flex flex-col gap-2.5 rounded-xl bg-subtle p-3.5">
            {EVENTS.map((ev) => (
              <Checkbox key={ev.value} checked={events.includes(ev.value)} onChange={() => toggle(ev.value)} label={ev.label} desc={<code className="font-mono text-[11.5px]">{ev.value}</code>} />
            ))}
          </div>
        </Field>
      </div>
    </Modal>
  )
}

function ConnectModal({ item, onClose }) {
  const mutate = useApp((s) => s.mutate)
  const [loading, setLoading] = useState(false)
  const connect = () => {
    setLoading(true)
    setTimeout(() => {
      mutate((d) => { d.integrations[item.key] = true })
      toast({ title: 'Đã kết nối', desc: item.name })
      onClose()
    }, 800)
  }
  return (
    <Modal open onClose={loading ? undefined : onClose} size="sm" title={`Kết nối ${item.short}`} desc="Buy Me a Flower xin các quyền sau để tích hợp hoạt động:"
      footer={<>
        <Button variant="secondary" disabled={loading} onClick={onClose}>Huỷ</Button>
        <Button variant="primary" loading={loading} onClick={connect}>Cho phép và kết nối</Button>
      </>}>
      <ul className="flex flex-col gap-2.5">
        {item.perms.map((p) => (
          <li key={p} className="flex items-start gap-2.5 text-[13.5px]">
            <span className="mt-0.5 grid size-[18px] shrink-0 place-items-center rounded-full bg-pos-soft text-pos"><Check size={12} strokeWidth={3} /></span>{p}
          </li>
        ))}
      </ul>
      <p className="ds-caption mt-4">Bạn có thể ngắt kết nối bất cứ lúc nào. Đây là bản demo nên không có dữ liệu nào được gửi đi.</p>
    </Modal>
  )
}

export default function IntegrationsPage() {
  const integrations = useApp((s) => s.integrations)
  const mutate = useApp((s) => s.mutate)
  const [connecting, setConnecting] = useState(null)
  const [webhookOpen, setWebhookOpen] = useState(false)
  const [removing, setRemoving] = useState(null)

  const start = (item) => (item.key === 'webhook' ? setWebhookOpen(true) : setConnecting(item))
  const count = ITEMS.filter((i) => integrations[i.key]).length

  return (
    <DashPage title="Tích hợp" desc="Nối trang tặng hoa với những công cụ bạn đang dùng để chăm sóc cộng đồng.">
      <Section title="Dịch vụ có thể kết nối" badge={count ? <Badge tone="pos" size="sm">{count} đang kết nối</Badge> : null} padded={false}>
        <div className="divide-y divide-line px-5 pb-5 pt-4 sm:px-6 sm:pb-6">
          {ITEMS.map((item) => {
            const on = !!integrations[item.key]
            const Icon = item.icon
            return (
              <Row key={item.key}>
                <div className="flex min-w-0 flex-1 basis-64 items-start gap-3.5">
                  <span className="grid size-11 shrink-0 place-items-center rounded-xl" style={{ background: `color-mix(in srgb, ${item.color} 14%, var(--c-surface))`, color: item.color }}>
                    <Icon size={21} />
                  </span>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                      <span className="text-[14px] font-[600] text-fg">{item.name}</span>
                      {on ? <Badge tone="pos" dot size="sm">Đã kết nối</Badge> : item.recommended ? <Badge tone="brand" size="sm">Đề xuất</Badge> : null}
                    </div>
                    <p className="mt-0.5 text-[13.5px] text-muted">{item.desc}</p>
                    {item.key === 'webhook' && on && integrations.webhookConfig?.url && (
                      <p className="mt-1 truncate font-mono text-[12px] text-dim">{integrations.webhookConfig.url}</p>
                    )}
                  </div>
                </div>
                <div className="ml-[58px] flex shrink-0 items-center gap-2 sm:ml-0">
                  {on && item.key === 'webhook' && <Button variant="ghost" size="sm" icon={Settings2} onClick={() => setWebhookOpen(true)}>Cấu hình</Button>}
                  {on
                    ? <Button variant="outline" size="sm" onClick={() => setRemoving(item)}>Ngắt kết nối</Button>
                    : <Button variant="primary" size="sm" onClick={() => start(item)}>Kết nối</Button>}
                </div>
              </Row>
            )
          })}
        </div>
      </Section>

      <Callout tone="neutral" icon={Radio} title="Bạn phát trực tiếp?" action={<Button size="sm" variant="outline" to="/quan-ly/nut-va-hinh">Mở công cụ</Button>}>
        Thông báo trên buổi phát{integrations.stream ? ' đang bật' : ''} được thiết lập ở trang Nút &amp; hình ảnh.
      </Callout>

      {connecting && <ConnectModal item={connecting} onClose={() => setConnecting(null)} />}
      {webhookOpen && <WebhookModal connected={!!integrations.webhook} config={integrations.webhookConfig} onClose={() => setWebhookOpen(false)} />}
      <Confirm open={!!removing} onClose={() => setRemoving(null)} danger confirmLabel="Ngắt kết nối"
        title={`Ngắt kết nối ${removing?.short || ''}?`} desc="Tích hợp sẽ ngừng hoạt động ngay. Bạn có thể kết nối lại bất cứ lúc nào."
        onConfirm={() => { mutate((d) => { d.integrations[removing.key] = false }); toast({ title: 'Đã ngắt kết nối', desc: removing.name }) }} />
    </DashPage>
  )
}
