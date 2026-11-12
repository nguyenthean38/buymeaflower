import { useId, useState } from 'react'
import { cn } from '@/lib/cn'
import { formatVND } from '@/lib/format'

/**
 * Biểu đồ vùng theo ngày (SVG tự vẽ).
 * <AreaChart data={[{ label: '12/11', value: 120000 }]} height={200} color="var(--c-brand-500)" />
 */
export function AreaChart({ data = [], height = 200, color = 'var(--c-brand-500)', format = formatVND, className }) {
  const id = useId()
  const [hover, setHover] = useState(null)
  const W = 720, H = height, padL = 46, padR = 22, padT = 12, padB = 24
  const max = Math.max(1, ...data.map((d) => d.value))
  const nice = niceMax(max)
  const x = (i) => padL + (data.length <= 1 ? 0 : (i / (data.length - 1)) * (W - padL - padR))
  const y = (v) => padT + (1 - v / nice) * (H - padT - padB)
  const line = data.map((d, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(d.value).toFixed(1)}`).join(' ')
  const area = data.length ? `${line} L${x(data.length - 1)} ${H - padB} L${x(0)} ${H - padB} Z` : ''
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => nice * t)
  const step = Math.max(1, Math.ceil(data.length / 7))
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect()
    const px = ((e.clientX - r.left) / r.width) * W
    const i = Math.round(((px - padL) / (W - padL - padR)) * (data.length - 1))
    setHover(Math.max(0, Math.min(data.length - 1, i)))
  }
  const h = hover != null ? data[hover] : null
  return (
    <div className={cn('relative', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" onMouseMove={onMove} onMouseLeave={() => setHover(null)} role="img" aria-label="Biểu đồ thu nhập theo ngày">
        <defs>
          <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity=".28" /><stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {ticks.map((t, i) => (
          <g key={i}>
            <line x1={padL} x2={W - padR} y1={y(t)} y2={y(t)} stroke="var(--c-line)" strokeDasharray={i ? '3 4' : undefined} />
            <text x={padL - 8} y={y(t) + 4} textAnchor="end" fontSize="11" fill="var(--c-faint)" className="num">{axis(t)}</text>
          </g>
        ))}
        {data.map((d, i) => (i % step === 0 || i === data.length - 1) && (
          <text key={i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="11" fill="var(--c-faint)" className="num">{d.label}</text>
        ))}
        <path d={area} fill={`url(#${id})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" />
        {h && (
          <g>
            <line x1={x(hover)} x2={x(hover)} y1={padT} y2={H - padB} stroke="var(--c-line-strong)" />
            <circle cx={x(hover)} cy={y(h.value)} r="4.5" fill="var(--c-surface)" stroke={color} strokeWidth="2.2" />
          </g>
        )}
      </svg>
      {h && (
        <div className="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-fg text-canvas px-2.5 py-1.5 text-[12px] shadow-md whitespace-nowrap"
          style={{ left: `${(x(hover) / W) * 100}%`, top: `${(y(h.value) / H) * 100}%`, marginTop: -8 }}>
          <div className="opacity-70">{h.label}</div>
          <div className="font-[650] num">{format(h.value)}</div>
        </div>
      )}
    </div>
  )
}

const axis = (v) => (!v ? '0' : v >= 1e6 ? `${+(v / 1e6).toFixed(1)}tr`.replace('.', ',') : `${Math.round(v / 1000)}k`)

function niceMax(v) {
  const p = Math.pow(10, Math.floor(Math.log10(v)))
  const n = v / p
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p
}

/** Cột nhỏ: data [{ label, value }] */
export function MiniBars({ data = [], height = 56, color = 'var(--c-brand-400)', className }) {
  const max = Math.max(1, ...data.map((d) => d.value))
  return (
    <div className={cn('flex items-end gap-[3px]', className)} style={{ height }} aria-hidden>
      {data.map((d, i) => (
        <span key={i} title={`${d.label}: ${formatVND(d.value)}`} className="flex-1 rounded-t-[3px] min-h-[2px]" style={{ height: `${(d.value / max) * 100}%`, background: d.value ? color : 'var(--c-line)' }} />
      ))}
    </div>
  )
}

/** Thanh tỷ lệ nhiều phần: parts [{ label, value, color }] */
export function SplitBar({ parts = [], className }) {
  const total = parts.reduce((a, p) => a + p.value, 0) || 1
  return (
    <div className={className}>
      <div className="flex h-2 w-full overflow-hidden rounded-full bg-subtle">
        {parts.map((p) => p.value > 0 && <span key={p.label} style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />)}
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5">
        {parts.map((p) => (
          <span key={p.label} className="inline-flex items-center gap-1.5 text-[12.5px] text-muted">
            <span className="size-2 rounded-full" style={{ background: p.color }} />
            <span className="num font-[550] text-fg">{formatVND(p.value)}</span> {p.label}
          </span>
        ))}
      </div>
    </div>
  )
}
