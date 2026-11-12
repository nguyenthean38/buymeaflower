import { useState } from 'react'
import { Check, Copy } from 'lucide-react'
import { Button, Field } from '@/components/ui'
import { FLOWER_KINDS } from '@/components/brand/Flower'
import { toast } from '@/store'
import { cn } from '@/lib/cn'

/** Màu hồng thương hiệu dạng mã cứng, dùng trong tệp xuất ra (SVG, mã nhúng) nơi không có biến CSS */
export const BRAND_HEX = '#e83e7c'
export const INK_HEX = '#2b1622'

/** Sao chép vào bộ nhớ tạm, có phương án dự phòng khi trình duyệt chặn Clipboard API */
export async function copyText(text, message = 'Đã sao chép') {
  let ok = false
  try {
    await navigator.clipboard.writeText(text)
    ok = true
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.setAttribute('readonly', '')
    ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    try { ok = document.execCommand('copy') } catch { ok = false }
    ta.remove()
  }
  if (ok) toast(message)
  else toast({ title: 'Không sao chép được', desc: 'Bạn hãy bôi đen và sao chép thủ công nhé.', tone: 'neg' })
  return ok
}

/** Tải một tệp văn bản (SVG, mã…) về máy */
export function downloadFile(filename, content, type = 'image/svg+xml;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([content], { type }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export const escapeHtml = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

/** Các cánh + nhuỵ của một bông hoa trong hệ toạ độ -50…50 (để ghép vào SVG xuất ra) */
export function flowerMarkup(kind = 'dao', color, center) {
  const k = FLOWER_KINDS[kind] || FLOWER_KINDS.dao
  const petals = Array.from({ length: k.petals }, (_, i) =>
    `<ellipse rx="${k.w * 50}" ry="${k.l * 50}" cy="${-k.l * 50 + 4}" transform="rotate(${(360 / k.petals) * i})"/>`).join('')
  return `<g fill="${color || k.color}">${petals}</g><circle r="${k.petals > 8 ? 15 : 12}" fill="${center || k.center}"/>`
}

/** Chữ sáng hay tối để đọc được trên nền `hex` */
export function readableOn(hex) {
  const m = /^#?([0-9a-f]{6})$/i.exec(hex || '')
  if (!m) return '#ffffff'
  const n = parseInt(m[1], 16)
  const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255
  return lum > 0.68 ? INK_HEX : '#ffffff'
}

/** Ô chỉ đọc kèm nút sao chép */
export function CopyField({ label, hint, value, message = 'Đã sao chép liên kết', className, mono, children }) {
  const [done, setDone] = useState(false)
  const copy = async () => {
    if (await copyText(value, message)) { setDone(true); setTimeout(() => setDone(false), 1600) }
  }
  return (
    <Field label={label} hint={hint} className={className}>
      <div className="flex flex-wrap items-center gap-2">
        <input
          readOnly
          value={value}
          aria-label={label || 'Liên kết'}
          onFocus={(e) => e.target.select()}
          className={cn('h-10 min-w-0 flex-1 basis-48 rounded-[10px] border border-line-strong bg-subtle px-3 text-[13.5px] text-dim outline-none focus:border-brand-400', mono && 'font-mono text-[12.5px]')}
        />
        <Button variant="outline" icon={done ? Check : Copy} onClick={copy}>{done ? 'Đã chép' : 'Sao chép'}</Button>
        {children}
      </div>
    </Field>
  )
}

/** Khối mã nhúng + nút sao chép */
export function CodeBlock({ code, className }) {
  return (
    <div className={cn('animate-slide-up rounded-xl border border-line bg-subtle', className)}>
      <pre className="max-h-44 overflow-auto whitespace-pre-wrap break-all px-3.5 py-3 font-mono text-[12px] leading-relaxed text-dim">{code}</pre>
      <div className="flex items-center justify-between gap-3 border-t border-line px-3.5 py-2.5">
        <span className="ds-caption">Dán đoạn mã này vào trang web của bạn.</span>
        <Button size="sm" variant="primary" icon={Copy} onClick={() => copyText(code, 'Đã sao chép mã')}>Sao chép mã</Button>
      </div>
    </div>
  )
}

/** Hàng chấm màu để chọn, tuỳ chọn thêm ô màu tự do */
export function ColorDots({ value, onChange, colors, custom, label = 'Màu' }) {
  const isCustom = custom && !colors.includes(value)
  return (
    <Field label={label}>
      <div className="flex flex-wrap items-center gap-2.5">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            aria-label={`Màu ${c}`}
            aria-pressed={value === c}
            onClick={() => onChange(c)}
            className={cn('grid size-8 place-items-center rounded-full transition-transform hover:scale-105', value === c && 'ring-2 ring-fg ring-offset-2 ring-offset-surface')}
            style={{ background: c }}
          >
            {value === c && <Check size={15} strokeWidth={3} color={readableOn(c)} />}
          </button>
        ))}
        {custom && (
          <label
            title="Màu tuỳ ý"
            className={cn('relative grid size-8 cursor-pointer place-items-center overflow-hidden rounded-full border border-line-strong', isCustom && 'ring-2 ring-fg ring-offset-2 ring-offset-surface')}
            style={{ background: isCustom ? value : 'conic-gradient(#e83e7c, #e0a019, #2f9e6e, #4a78e0, #8a5cd6, #e83e7c)' }}
          >
            <input type="color" value={value} onChange={(e) => onChange(e.target.value)} aria-label="Màu tuỳ ý" className="absolute inset-0 size-full cursor-pointer opacity-0" />
          </label>
        )}
      </div>
    </Field>
  )
}

/** Dòng trong danh sách: nội dung bên trái, hành động bên phải, tự xuống dòng trên màn hình hẹp */
export function Row({ children, className }) {
  return <div className={cn('flex flex-wrap items-center gap-x-4 gap-y-3 py-4 first:pt-0 last:pb-0', className)}>{children}</div>
}
