import { useEffect, useMemo, useRef, useState } from 'react'
import { Check, Code2, Download, Link2, Play, X } from 'lucide-react'
import { Button, Callout, Input, Modal, QrCode, Segmented, Select, Toggle } from '@/components/ui'
import { Flower, FlowerArt } from '@/components/brand/Flower'
import { useApp, toast, supporterCount } from '@/store'
import { DOMAIN } from '@/data/reference'
import { formatNumber, formatVND } from '@/lib/format'
import { cn } from '@/lib/cn'
import { BRAND_HEX, INK_HEX, CodeBlock, ColorDots, CopyField, copyText, downloadFile, escapeHtml, flowerMarkup, readableOn } from './shared'

const TOOL_COLORS = ['#e83e7c', '#2f9e6e', '#4a78e0', '#8a5cd6', '#e0a019', '#2b1622']
const FONTS = [
  { value: 'sans', label: 'Be Vietnam Pro', css: "'Be Vietnam Pro', sans-serif" },
  { value: 'serif', label: 'Serif (chữ có chân)', css: "Georgia, 'Times New Roman', serif" },
  { value: 'mono', label: 'Monospace (đều nét)', css: "'JetBrains Mono', Consolas, monospace" },
  { value: 'cursive', label: 'Cursive (viết tay)', css: "'Brush Script MT', 'Segoe Script', cursive" },
]
const toCss = (style) => Object.entries(style).map(([k, v]) => `${k.replace(/[A-Z]/g, (m) => '-' + m.toLowerCase())}:${v}`).join(';')

/* ---------------- Nút cho trang web ---------------- */
export function ButtonBuilder({ onClose }) {
  const page = useApp((s) => s.page)
  const count = useApp((s) => supporterCount(s.supports))
  const [color, setColor] = useState(TOOL_COLORS[0])
  const [font, setFont] = useState('sans')
  const [text, setText] = useState(`Tặng mình một ${page.item.name}`)
  const [kind, setKind] = useState('plain')
  const [showCode, setShowCode] = useState(false)

  const label = text.trim()
  const fg = readableOn(color)
  const style = {
    display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '11px 22px', borderRadius: '999px',
    background: color, color: fg, fontFamily: FONTS.find((f) => f.value === font).css,
    fontSize: '16px', fontWeight: '600', lineHeight: '1.2', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,.18)',
  }
  const countStyle = { padding: '2px 9px', borderRadius: '999px', background: fg === '#ffffff' ? 'rgba(255,255,255,.24)' : 'rgba(0,0,0,.1)', fontSize: '13px' }
  const url = `https://${DOMAIN}/${page.username}`
  const code = `<a href="${url}" target="_blank" rel="noopener" style="${toCss(style)}">${page.item.emoji} ${escapeHtml(label)}${kind === 'count' ? `<span style="${toCss(countStyle)}">${formatNumber(count)}</span>` : ''}</a>`

  return (
    <Modal open onClose={onClose} size="lg" title="Nút cho trang web" desc="Đặt nút này lên blog, trang giới thiệu hay chữ ký thư để mọi người ghé trang của bạn."
      footer={<>
        <Button variant="secondary" onClick={onClose}>Đóng</Button>
        {!showCode && <Button variant="primary" icon={Code2} disabled={!label} onClick={() => setShowCode(true)}>Tạo mã</Button>}
      </>}>
      <div className="flex flex-col gap-5">
        <div className="grid min-h-[132px] place-items-center overflow-hidden rounded-xl bg-[#211a22] px-4 py-8" style={{ backgroundImage: 'radial-gradient(rgba(255,255,255,.07) 1px, transparent 1px)', backgroundSize: '16px 16px' }}>
          <a href={url} onClick={(e) => e.preventDefault()} style={{ ...style, maxWidth: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
            {page.item.emoji} {label || '…'}
            {kind === 'count' && <span style={countStyle}>{formatNumber(count)}</span>}
          </a>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Chữ trên nút" value={text} maxLength={40} onChange={(e) => setText(e.target.value)} error={!label ? 'Nút cần có chữ.' : undefined} className="sm:col-span-2" />
          <ColorDots label="Màu nút" value={color} onChange={setColor} colors={TOOL_COLORS} custom />
          <Select label="Phông chữ" value={font} onChange={(e) => setFont(e.target.value)} options={FONTS} />
          <div className="sm:col-span-2">
            <div className="mb-1.5 text-[13px] font-[550] text-dim">Kiểu nút</div>
            <Segmented value={kind} onChange={setKind} options={[{ value: 'plain', label: 'Nút thường' }, { value: 'count', label: 'Nút kèm số người ủng hộ' }]} className="max-w-full" />
          </div>
        </div>

        {showCode && <CodeBlock code={code} />}
      </div>
    </Modal>
  )
}

/* ---------------- Tiện ích nổi ---------------- */
export function WidgetBuilder({ onClose }) {
  const page = useApp((s) => s.page)
  const unitPrice = useApp((s) => s.settings.unitPrice)
  const [color, setColor] = useState(TOOL_COLORS[0])
  const [position, setPosition] = useState('right')
  const [message, setMessage] = useState('Cảm ơn bạn ghé thăm! Tặng mình một bông hoa nhé')
  const [open, setOpen] = useState(false)
  const [qty, setQty] = useState(3)
  const [name, setName] = useState('')
  const [note, setNote] = useState('')
  const [showCode, setShowCode] = useState(false)

  const fg = readableOn(color)
  const side = position === 'left' ? 'left-3' : 'right-3'
  const code = `<script data-name="bmf-widget" data-id="${page.username}" data-color="${color}" data-position="${position}" data-message="${escapeHtml(message.trim())}" src="https://${DOMAIN}/widget.js"></script>`
  const field = 'w-full rounded-lg border border-[#e6dcd4] bg-white px-2.5 text-[12.5px] text-[#2b1622] outline-none placeholder:text-[#b09aa2] focus:border-[#b09aa2]'

  return (
    <Modal open onClose={onClose} size="lg" title="Tiện ích nổi trên trang web" desc="Một nút tròn nằm ở góc trang web của bạn. Người xem tặng hoa ngay tại chỗ, không cần rời trang."
      footer={<>
        <Button variant="secondary" onClick={onClose}>Đóng</Button>
        {!showCode && <Button variant="primary" icon={Code2} onClick={() => setShowCode(true)}>Tạo mã</Button>}
      </>}>
      <div className="flex flex-col gap-5">
        {/* Trang web giả: màu cố định vì mô phỏng trang bên ngoài */}
        <div className="relative h-[360px] overflow-hidden rounded-xl border border-line bg-white text-[#2b1622]">
          <div className="flex h-8 items-center gap-1.5 border-b border-[#eee6df] bg-[#f7f2ed] px-3">
            <span className="size-2 rounded-full bg-[#e6a39a]" /><span className="size-2 rounded-full bg-[#e8cf8e]" /><span className="size-2 rounded-full bg-[#a9d3a4]" />
            <span className="ml-2 h-4 flex-1 truncate rounded-full bg-white px-2.5 text-[10.5px] leading-4 text-[#9c8a91]">trangcuaban.vidu.vn</span>
          </div>
          <div className="flex flex-col gap-2.5 p-5" aria-hidden>
            <div className="h-4 w-2/5 rounded bg-[#eadfd7]" />
            <div className="h-2.5 w-full rounded bg-[#f3ebe4]" /><div className="h-2.5 w-11/12 rounded bg-[#f3ebe4]" /><div className="h-2.5 w-4/5 rounded bg-[#f3ebe4]" />
            <div className="mt-2 h-24 w-full rounded-lg bg-[#f7f0ea]" />
            <div className="h-2.5 w-full rounded bg-[#f3ebe4]" /><div className="h-2.5 w-3/4 rounded bg-[#f3ebe4]" />
          </div>

          {open ? (
            <div className={cn('absolute bottom-[68px] flex w-[236px] max-w-[calc(100%-24px)] animate-pop-in flex-col gap-2 rounded-2xl bg-white p-3 shadow-[0_8px_30px_rgba(43,22,34,.2)] ring-1 ring-[#efe4da]', side)}>
              <div className="text-[13px] font-[650] leading-snug">Tặng {page.name} một {page.item.name}</div>
              <div className="flex items-center gap-1.5">
                <span className="text-[18px]">{page.item.emoji}</span><X size={11} className="text-[#b09aa2]" />
                {[1, 3, 5].map((n) => (
                  <button key={n} type="button" onClick={() => setQty(n)} aria-pressed={qty === n}
                    className="grid size-8 place-items-center rounded-full border text-[12.5px] font-[650] transition-colors"
                    style={qty === n ? { background: color, borderColor: color, color: fg } : { borderColor: '#e6dcd4', color: '#4d3542' }}>
                    {n}
                  </button>
                ))}
              </div>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Tên của bạn" aria-label="Tên của bạn" className={cn(field, 'h-8')} />
              <textarea value={note} onChange={(e) => setNote(e.target.value)} placeholder="Lời nhắn (không bắt buộc)" aria-label="Lời nhắn" rows={2} className={cn(field, 'resize-none py-1.5')} />
              <button type="button" className="h-9 rounded-full text-[13px] font-[650]" style={{ background: color, color: fg }}
                onClick={() => toast({ title: 'Đây là bản xem trước', desc: 'Trên trang web thật, người ủng hộ sẽ chuyển sang bước thanh toán.', tone: 'info' })}>
                Tặng {formatVND(qty * unitPrice)}
              </button>
            </div>
          ) : message.trim() ? (
            <div className={cn('absolute bottom-[68px] max-w-[220px] animate-fade-in rounded-2xl bg-white px-3 py-2 text-[12.5px] leading-snug shadow-[0_6px_22px_rgba(43,22,34,.16)] ring-1 ring-[#efe4da]', side)}>
              {message}
            </div>
          ) : null}

          <button type="button" onClick={() => setOpen(!open)} aria-label={open ? 'Đóng khung ủng hộ' : 'Mở khung ủng hộ'}
            className={cn('absolute bottom-3 grid size-12 place-items-center rounded-full text-[22px] shadow-[0_6px_18px_rgba(43,22,34,.28)] transition-transform hover:scale-105', side)}
            style={{ background: color, color: fg }}>
            {open ? <X size={20} /> : page.item.emoji}
          </button>
        </div>
        <p className="ds-caption -mt-3">Bấm vào nút tròn để thử khung ủng hộ.</p>

        <div className="grid gap-4 sm:grid-cols-2">
          <ColorDots label="Màu tiện ích" value={color} onChange={setColor} colors={TOOL_COLORS} custom />
          <div>
            <div className="mb-1.5 text-[13px] font-[550] text-dim">Vị trí</div>
            <Segmented value={position} onChange={setPosition} options={[{ value: 'left', label: 'Góc trái' }, { value: 'right', label: 'Góc phải' }]} />
          </div>
          <Input label="Lời chào" value={message} maxLength={80} onChange={(e) => setMessage(e.target.value)} hint="Hiện cạnh nút khi người xem vừa vào trang. Để trống nếu không cần." className="sm:col-span-2" />
        </div>

        {showCode && <CodeBlock code={code} />}
      </div>
    </Modal>
  )
}

/* ---------------- Thông báo khi phát trực tiếp ---------------- */
const SOUNDS = { 'Chuông gió': [1318, 1760, 2093], 'Tiếng chim': [2400, 3100, 2700], 'Đàn tranh': [587, 784, 880] }

function playSound(name) {
  const notes = SOUNDS[name]
  const Ctx = window.AudioContext || window.webkitAudioContext
  if (!notes || !Ctx) return
  try {
    const ctx = new Ctx()
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      const t = ctx.currentTime + i * 0.13
      osc.type = name === 'Đàn tranh' ? 'triangle' : 'sine'
      osc.frequency.value = freq
      gain.gain.setValueAtTime(0.0001, t)
      gain.gain.exponentialRampToValueAtTime(0.12, t + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.5)
      osc.connect(gain).connect(ctx.destination)
      osc.start(t)
      osc.stop(t + 0.55)
    })
    setTimeout(() => ctx.close(), 1500)
  } catch { /* trình duyệt không cho phát âm thanh thì bỏ qua */ }
}

export function StreamAlert({ onClose }) {
  const page = useApp((s) => s.page)
  const stream = useApp((s) => s.stream)
  const on = useApp((s) => s.integrations.stream)
  const mutate = useApp((s) => s.mutate)
  const [visible, setVisible] = useState(false)
  const timer = useRef(null)
  useEffect(() => () => clearTimeout(timer.current), [])

  const key = useMemo(() => {
    let h = 7
    for (const ch of page.username) h = (h * 33 + ch.charCodeAt(0)) >>> 0
    return h.toString(36).padStart(7, '0')
  }, [page.username])
  const source = `https://${DOMAIN}/phat-truc-tiep/${page.username}?khoa=${key}`
  const duration = stream?.duration || 6
  const sound = stream?.sound || 'Chuông gió'

  const fire = () => {
    clearTimeout(timer.current)
    setVisible(true)
    playSound(sound)
    timer.current = setTimeout(() => setVisible(false), duration * 1000)
  }
  const setStream = (patch) => mutate((d) => { d.stream = { sound, duration, ...patch } })

  return (
    <Modal open onClose={onClose} size="lg" title="Thông báo khi phát trực tiếp" desc="Mỗi khi có người tặng hoa, một băng thông báo sẽ hiện ngay trên màn hình buổi phát của bạn."
      footer={<Button variant="primary" onClick={onClose}>Xong</Button>}>
      <div className="flex flex-col gap-5">
        <div className="relative h-48 overflow-hidden rounded-xl bg-[#1b141d]" style={{ backgroundImage: 'linear-gradient(135deg, #2a1b2b 0%, #171019 60%, #23162a 100%)' }}>
          <span className="absolute left-3 top-3 inline-flex items-center gap-1.5 rounded-md bg-[#d43d3d] px-2 py-0.5 text-[10.5px] font-[700] tracking-wide text-white">
            <span className="size-1.5 animate-pulse rounded-full bg-white" />TRỰC TIẾP
          </span>
          <span className="absolute bottom-3 left-3 text-[11.5px] text-white/45">Màn hình buổi phát của bạn</span>
          <div aria-live="polite" className={cn('absolute inset-x-3 top-11 flex justify-center transition-all duration-500', visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-4 opacity-0')}>
            <div className="flex max-w-full items-center gap-3 rounded-2xl bg-white px-4 py-3 text-[#2b1622] shadow-[0_10px_34px_rgba(0,0,0,.4)]">
              <Flower size={34} spin />
              <div className="min-w-0">
                <div className="text-[15px] font-[700] leading-tight">Có người vừa tặng 3 {page.item.emoji}!</div>
                <div className="mt-0.5 truncate text-[12.5px] text-[#7d6570]">“Chúc buổi phát thật vui nhé!”</div>
              </div>
            </div>
          </div>
          <Button size="sm" variant="inverse" icon={Play} onClick={fire} className="absolute bottom-3 right-3 bg-white text-[#2b1622]">Gửi thử</Button>
        </div>

        <Toggle checked={on} label="Bật thông báo khi phát trực tiếp" desc="Tắt đi nếu bạn tạm thời không muốn hiện thông báo trên buổi phát."
          onChange={(v) => { mutate((d) => { d.integrations.stream = v }); toast(v ? 'Đã bật thông báo khi phát trực tiếp' : 'Đã tắt thông báo khi phát trực tiếp') }} />

        <CopyField label="URL nguồn trình duyệt" value={source} mono message="Đã sao chép URL nguồn"
          hint="Trong phần mềm phát trực tiếp, thêm một “Nguồn trình duyệt” rồi dán URL này. Đừng chia sẻ URL cho người khác." />

        <div className="grid gap-4 sm:grid-cols-2">
          <Select label="Âm báo" value={sound} options={['Chuông gió', 'Tiếng chim', 'Đàn tranh', 'Tắt']}
            onChange={(e) => { setStream({ sound: e.target.value }); playSound(e.target.value) }} />
          <Select label="Thời gian hiển thị" value={String(duration)} options={[3, 5, 6, 8, 10, 15].map((n) => ({ value: String(n), label: `${n} giây` }))}
            onChange={(e) => setStream({ duration: Number(e.target.value) })} />
        </div>
      </div>
    </Modal>
  )
}

/* ---------------- Mã QR ---------------- */
const QR_SIZE = 200

export function QrModal({ onClose }) {
  const username = useApp((s) => s.page.username)
  const box = useRef(null)
  const url = `https://${DOMAIN}/${username}`

  const download = () => {
    const svg = box.current?.querySelector('svg')
    if (!svg) return
    const pad = 20
    const total = QR_SIZE + pad * 2
    const c = total / 2
    const cells = svg.outerHTML.replace(/^<svg[^>]*>|<\/svg>$/g, '').replace(/currentColor/g, INK_HEX).replace(/var\(--qr-bg,\s*#fff\)/g, '#ffffff')
    downloadFile(`ma-qr-${username}.svg`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="${total * 2}" height="${total * 2}" viewBox="0 0 ${total} ${total}">` +
      `<rect width="${total}" height="${total}" rx="24" fill="#ffffff"/><g transform="translate(${pad} ${pad})">${cells}</g>` +
      `<rect x="${c - 25}" y="${c - 25}" width="50" height="50" rx="14" fill="#ffffff"/><g transform="translate(${c} ${c}) scale(.36)">${flowerMarkup('dao', BRAND_HEX)}</g></svg>`)
    toast('Đã tải mã QR về máy')
  }

  return (
    <Modal open onClose={onClose} size="sm" title="Mã QR" desc="In lên thiệp, đặt ở quầy hàng hay chiếu cuối video để mọi người quét và ghé trang của bạn."
      footer={<>
        <Button variant="outline" icon={Link2} onClick={() => copyText(url, 'Đã sao chép liên kết')}>Sao chép liên kết</Button>
        <Button variant="primary" icon={Download} onClick={download}>Tải xuống</Button>
      </>}>
      <div className="flex flex-col items-center gap-3 py-2">
        <div ref={box} className="relative rounded-3xl bg-white p-5 text-[#2b1622] shadow-sm ring-1 ring-line">
          <QrCode value={url} size={QR_SIZE} />
          <span className="absolute left-1/2 top-1/2 grid size-[50px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-[14px] bg-white">
            <Flower size={36} color={BRAND_HEX} />
          </span>
        </div>
        <div className="text-[13.5px] font-[600]">{DOMAIN}/{username}</div>
        <p className="ds-caption text-center">Mã QR trong bản demo chỉ để minh hoạ, chưa quét được.</p>
      </div>
    </Modal>
  )
}

/* ---------------- Bộ nhận diện ---------------- */
export function downloadLogo() {
  downloadFile('buy-me-a-flower-logo.svg',
    `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="160" viewBox="0 0 640 160">` +
    `<g transform="translate(84 80) scale(1.1)">${flowerMarkup('dao', BRAND_HEX)}</g>` +
    `<text x="160" y="98" font-family="'Be Vietnam Pro', system-ui, sans-serif" font-weight="800" font-size="52" letter-spacing="-1.5" fill="${INK_HEX}">Buy me a <tspan fill="#c8245f">flower</tspan></text></svg>`)
  toast('Đã tải logo về máy')
}
export function downloadMark() {
  downloadFile('buy-me-a-flower-bieu-tuong.svg',
    `<svg xmlns="http://www.w3.org/2000/svg" width="256" height="256" viewBox="-64 -64 128 128"><rect x="-64" y="-64" width="128" height="128" rx="30" fill="#fff0f5"/>${flowerMarkup('dao', BRAND_HEX)}</svg>`)
  toast('Đã tải biểu tượng về máy')
}

/* ---------------- Thiệp cảm ơn ---------------- */
const CARDS = [
  { id: 'bo-tulip', name: 'Bó tulip', seed: 114, pos: 'top' },
  { id: 'hoa-hong', name: 'Hoa hồng', seed: 116, pos: 'top' },
  { id: 'anh-dao', name: 'Anh đào', seed: 115, pos: 'center' },
  { id: 'cuc-nang', name: 'Cúc nắng', seed: 120, pos: 'center' },
]
const CARD_POS = { top: 'top-[8%]', center: 'top-1/2 -translate-y-1/2' }

export function ThanksCards({ onClose }) {
  const name = useApp((s) => s.page.name)
  const username = useApp((s) => s.page.username)
  const [picked, setPicked] = useState(CARDS[0].id)
  const refs = useRef({})

  const download = async () => {
    const card = CARDS.find((c) => c.id === picked)
    const img = refs.current[picked]?.querySelector('img')
    if (!img) return
    // nhúng ảnh nền vào tệp SVG dưới dạng data URL để thiệp mở được ở mọi nơi
    let href = img.src
    try {
      const blob = await (await fetch(img.src)).blob()
      href = await new Promise((res) => { const r = new FileReader(); r.onload = () => res(r.result); r.readAsDataURL(blob) })
    } catch { /* giữ đường dẫn gốc */ }
    const art = `<image href="${href}" width="400" height="300" preserveAspectRatio="xMidYMid slice"/>`
    const y = card.pos === 'top' ? 24 : 111
    downloadFile(`thiep-cam-on-${card.id}.svg`,
      `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 400 300">${art}` +
      `<rect x="44" y="${y}" width="312" height="78" rx="14" fill="#ffffff" fill-opacity=".88"/>` +
      `<text x="200" y="${y + 36}" text-anchor="middle" font-family="'Be Vietnam Pro', system-ui, sans-serif" font-weight="800" font-size="21" letter-spacing="-.4" fill="${INK_HEX}">Cảm ơn bạn đã tặng hoa</text>` +
      `<text x="200" y="${y + 59}" text-anchor="middle" font-family="'Be Vietnam Pro', system-ui, sans-serif" font-size="11.5" fill="#7d6570">${escapeHtml(name)} · ${DOMAIN}/${username}</text></svg>`)
    toast({ title: 'Đã tải thiệp về máy', desc: `Mẫu “${card.name}”, tệp SVG.` })
  }

  return (
    <Modal open onClose={onClose} size="lg" title="Thiệp cảm ơn" desc="Chọn một mẫu để đăng lên mạng xã hội hoặc gửi riêng cho người đã ủng hộ bạn."
      footer={<>
        <Button variant="secondary" onClick={onClose}>Đóng</Button>
        <Button variant="primary" icon={Download} onClick={download}>Tải thiệp đã chọn</Button>
      </>}>
      <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
        {CARDS.map((c) => {
          const on = picked === c.id
          return (
            <button key={c.id} type="button" aria-pressed={on} onClick={() => setPicked(c.id)} className="group text-left">
              <div ref={(el) => { refs.current[c.id] = el }} className={cn('relative aspect-[4/3] overflow-hidden rounded-xl transition-shadow', on ? 'ring-[3px] ring-brand-400' : 'ring-1 ring-line group-hover:ring-line-strong')}>
                <FlowerArt seed={c.seed} variant={c.variant} className="absolute inset-0 size-full" />
                <div className={cn('absolute inset-x-[11%] rounded-xl bg-white/90 px-2 py-2.5 text-center text-[#2b1622]', CARD_POS[c.pos])}>
                  <div className="text-[14px] font-[800] leading-tight tracking-tight sm:text-[15px]">Cảm ơn bạn đã tặng hoa</div>
                  <div className="mt-0.5 truncate text-[10.5px] text-[#7d6570]">{name} · {DOMAIN}/{username}</div>
                </div>
                {on && <span className="absolute right-2 top-2 grid size-6 place-items-center rounded-full bg-brand-500 text-white"><Check size={14} strokeWidth={3} /></span>}
              </div>
              <div className="mt-1.5 text-[13px] font-[550] text-dim">{c.name}</div>
            </button>
          )
        })}
      </div>
      <Callout tone="neutral" className="mt-4">Thiệp tải về ở dạng SVG, có sẵn tên và địa chỉ trang của bạn.</Callout>
    </Modal>
  )
}
