import { useRef } from 'react'
import { Copy, ImageUp, MoreHorizontal, Shuffle } from 'lucide-react'
import { Avatar, Button, IconButton, Menu, Popover } from '@/components/ui'
import { FlowerArt } from '@/components/brand/Flower'
import { toast } from '@/store'
import { TODAY, addDays, startOfDay, stripAccents } from '@/lib/format'
import { cn } from '@/lib/cn'

export const randomArt = () => Math.floor(Math.random() * 900) + 100
export const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(s).trim())

/** Tìm không dấu trên nhiều trường */
export function matches(query, ...fields) {
  const q = stripAccents(query).toLowerCase().trim()
  if (!q) return true
  return fields.some((f) => stripAccents(f || '').toLowerCase().includes(q))
}

/** Bản ghi có nằm trong `days` ngày gần nhất không (cùng mốc với summarize trong kho) */
export function inLastDays(at, days) {
  const from = addDays(startOfDay(new Date(Math.max(Date.now(), TODAY.getTime()))), -days + 1)
  return new Date(at) >= from
}

/** Tạo tệp CSV thật và tải về máy */
export function downloadCsv(filename, headers, rows) {
  const cell = (v) => {
    let s = v == null ? '' : String(v)
    if (/^[=+\-@\t\r]/.test(s)) s = "'" + s
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
  }
  const csv = [headers, ...rows].map((r) => r.map(cell).join(',')).join('\r\n')
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
  toast({ title: 'Đã xuất tệp CSV', desc: `${rows.length} dòng · ${filename}` })
}

export async function copyText(text, message = 'Đã sao chép liên kết') {
  try {
    await navigator.clipboard.writeText(text)
  } catch {
    const ta = document.createElement('textarea')
    ta.value = text
    ta.style.cssText = 'position:fixed;opacity:0'
    document.body.appendChild(ta)
    ta.select()
    try { document.execCommand('copy') } catch { /* bỏ qua */ }
    ta.remove()
  }
  toast(message)
}

/** Nút "…" mở menu ở cuối mỗi dòng */
export function RowMenu({ items, label = 'Thao tác', width = 210 }) {
  return (
    <span className="inline-flex" onClick={(e) => e.stopPropagation()}>
      <Popover align="end" width={width} trigger={(p) => <IconButton {...p} icon={MoreHorizontal} label={label} size="sm" />}>
        {(close) => <Menu items={items} onClose={close} />}
      </Popover>
    </span>
  )
}

/** Ô liên kết có nút sao chép */
export function CopyLink({ url, className }) {
  return (
    <div className={cn('flex items-center gap-2 rounded-xl border border-line bg-subtle pl-3.5 pr-1.5 py-1.5', className)}>
      <span className="min-w-0 flex-1 truncate text-[13.5px] text-dim">{url}</span>
      <Button variant="primary" size="sm" icon={Copy} onClick={() => copyText(`https://${url}`)}>Sao chép</Button>
    </div>
  )
}

/** Chọn ảnh mô phỏng: mỗi lần đổi là một ảnh khác trong kho ảnh mẫu */
export function ArtPicker({ value, onChange, label = 'Ảnh', className, height = 'h-40' }) {
  const file = useRef(null)
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <div className="text-[13px] font-[550] text-dim">{label}</div>}
      <div className="overflow-hidden rounded-2xl border border-line">
        <FlowerArt seed={value} className={cn('w-full', height)} />
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <Button size="sm" icon={Shuffle} onClick={() => onChange(randomArt())}>Đổi ảnh ngẫu nhiên</Button>
        <Button size="sm" variant="ghost" icon={ImageUp} onClick={() => file.current?.click()}>Tải ảnh lên</Button>
        <input ref={file} type="file" accept="image/*" className="hidden"
          onChange={(e) => { if (e.target.files?.[0]) { onChange(randomArt()); toast({ title: 'Đã đổi ảnh', desc: 'Bản demo dùng ảnh trong kho ảnh mẫu thay cho tệp bạn chọn.', tone: 'info' }) } e.target.value = '' }} />
      </div>
      <p className="ds-caption">Bản demo lấy ảnh từ kho ảnh mẫu.</p>
    </div>
  )
}

/** Avatar + tên + dòng phụ */
export function Person({ name, color, sub, size = 36, badge }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar name={name} color={color} size={size} />
      <div className="min-w-0">
        <div className="flex items-center gap-2">
          <span className="truncate text-[14px] font-[550] text-fg">{name}</span>
          {badge}
        </div>
        {sub && <div className="truncate text-[12.5px] text-muted">{sub}</div>}
      </div>
    </div>
  )
}

/** Thanh công cụ của danh sách: tìm kiếm + bộ lọc + nút */
export function Toolbar({ children, className }) {
  return <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-center', className)}>{children}</div>
}
