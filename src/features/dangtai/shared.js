import { FileText, Globe, Heart, Images, Lock, Mic } from 'lucide-react'
import { stripAccents, TODAY } from '@/lib/format'

/** Hạt giống tranh hoa mới cho ảnh "tải lên" (mô phỏng) */
export const randomArt = () => Math.floor(Math.random() * 900) + 100

/** Mốc "bây giờ" của bản demo: giờ thật hoặc mốc demo, lấy cái muộn hơn */
export const demoNow = () => Math.max(Date.now(), TODAY.getTime())

/** 125 → "02:05" · 3725 → "1:02:05" */
export function clock(sec = 0) {
  const s = Math.max(0, Math.floor(sec))
  const pad = (n) => String(n).padStart(2, '0')
  const h = Math.floor(s / 3600)
  return h ? `${h}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}` : `${pad(Math.floor(s / 60))}:${pad(s % 60)}`
}

/** Tìm không phân biệt hoa thường và dấu */
export const matches = (text, q) => stripAccents(text || '').toLowerCase().includes(stripAccents(q || '').toLowerCase().trim())

const escapeHtml = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

/** Văn bản thuần (nhiều dòng) → HTML gồm các đoạn <p> */
export function textToHtml(text = '') {
  return text.split(/\n+/).map((l) => l.trim()).filter(Boolean).map((l) => `<p>${escapeHtml(l)}</p>`).join('')
}

/** HTML → văn bản thuần, mỗi khối một dòng */
export function htmlToText(html = '') {
  const el = document.createElement('div')
  el.innerHTML = html.replace(/<\/(p|div|h2|h3|li|blockquote)>/gi, '\n').replace(/<br\s*\/?>/gi, '\n')
  return (el.textContent || '').replace(/\n{2,}/g, '\n').trim()
}

export const POST_TYPES = {
  text: { label: 'Bài viết', icon: FileText },
  album: { label: 'Album ảnh', icon: Images },
  audio: { label: 'Bài âm thanh', icon: Mic },
}

export const VISIBILITY_ICON = { public: Globe, supporters: Heart, members: Lock }

export async function copyText(text) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}
