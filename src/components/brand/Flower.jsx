import { useMemo } from 'react'
import { seeded } from '@/lib/random'
import { cn } from '@/lib/cn'
import { photoFor } from '@/data/photos'

/* Các giống hoa vẽ bằng SVG — dùng cho logo, ảnh bìa, ảnh minh hoạ, hiệu ứng. */
export const FLOWER_KINDS = {
  dao: { label: 'Hoa đào', petals: 5, w: 0.36, l: 0.5, color: '#f66699', center: '#f2b632' },
  mai: { label: 'Hoa mai', petals: 5, w: 0.36, l: 0.5, color: '#f5b82e', center: '#e0701a' },
  cuc: { label: 'Hoa cúc', petals: 13, w: 0.15, l: 0.5, color: '#9a6be0', center: '#f2b632' },
  huongduong: { label: 'Hướng dương', petals: 16, w: 0.14, l: 0.5, color: '#f5a623', center: '#6b3f1d' },
  sen: { label: 'Hoa sen', petals: 8, w: 0.26, l: 0.5, color: '#f08ab0', center: '#f2d16b' },
  luuly: { label: 'Lưu ly', petals: 6, w: 0.3, l: 0.5, color: '#5b8def', center: '#fff3c4' },
  cam: { label: 'Cẩm chướng', petals: 9, w: 0.24, l: 0.5, color: '#f08a4b', center: '#ffe9a8' },
}
export const KIND_KEYS = Object.keys(FLOWER_KINDS)

/** Một bông hoa. <Flower kind="dao" size={32} /> hoặc truyền color để ghi đè màu cánh. */
export function Flower({ kind = 'dao', size = 24, color, center, className, style, spin }) {
  const k = FLOWER_KINDS[kind] || FLOWER_KINDS.dao
  const petals = Array.from({ length: k.petals })
  return (
    <svg width={size} height={size} viewBox="-50 -50 100 100" className={cn('shrink-0', spin && 'animate-sway', className)} style={style} aria-hidden>
      <g fill={color || k.color}>
        {petals.map((_, i) => (
          <ellipse key={i} rx={k.w * 50} ry={k.l * 50} cy={-k.l * 50 + 4} transform={`rotate(${(360 / k.petals) * i})`} opacity={k.petals > 8 ? 0.9 : 1} />
        ))}
      </g>
      <circle r={k.petals > 8 ? 15 : 12} fill={center || k.center} />
    </svg>
  )
}

/** Nhóm hoa trong SVG (để ghép vào tranh) */
function Bloom({ x, y, r, kind, rot = 0, stem }) {
  const k = FLOWER_KINDS[kind]
  return (
    <g>
      {stem && <path d={`M${x} ${y} C ${x + stem * 0.3} ${y + 60}, ${x - stem * 0.3} ${y + 140}, ${x + stem} 420`} stroke="#3f9463" strokeWidth={Math.max(2, r * 0.09)} fill="none" strokeLinecap="round" opacity=".85" />}
      <g transform={`translate(${x} ${y}) rotate(${rot}) scale(${r / 50})`}>
        <g fill={k.color}>
          {Array.from({ length: k.petals }).map((_, i) => (
            <ellipse key={i} rx={k.w * 50} ry={k.l * 50} cy={-k.l * 50 + 4} transform={`rotate(${(360 / k.petals) * i})`} opacity=".93" />
          ))}
        </g>
        <circle r={k.petals > 8 ? 15 : 12} fill={k.center} />
      </g>
    </g>
  )
}

const SKIES = [
  ['#ffe3ec', '#fff6e5'], ['#e6f4ea', '#fdf6d8'], ['#e8ecff', '#ffe9f1'], ['#fff0d9', '#ffdfe0'],
  ['#e2f3f7', '#f3e9ff'], ['#fbe7ff', '#fff3e0'], ['#243b53', '#5b3a6b'], ['#f9f1e4', '#e8f3dc'],
]

/**
 * Khung ảnh theo hạt giống: lấy ảnh trong public/images (xem data/photos.js); bản demo dùng nó thay cho ảnh người dùng tải lên.
 * <FlowerArt seed={7} className="w-full h-40" variant="field|bouquet|scatter" />
 */
export function FlowerArt(props) {
  const src = photoFor(props.seed ?? 1)
  if (src) return <img src={src} alt="" loading="lazy" className={cn('block object-cover bg-subtle', props.rounded && 'rounded-xl', props.className)} />
  return <FlowerSvg {...props} />
}

/** Tranh hoa vẽ bằng SVG — dùng khi chưa có ảnh cho hạt giống đó */
function FlowerSvg({ seed = 1, className, variant, rounded, wide }) {
  const art = useMemo(() => {
    const r = seeded(seed * 7919 + 13)
    const sky = SKIES[r.int(0, SKIES.length - 1)]
    const W = wide ? 1200 : 400
    const v = wide ? (variant === 'scatter' ? 'scatter' : 'field') : variant || r.pick(['field', 'scatter', 'bouquet'])
    const kinds = [r.pick(KIND_KEYS), r.pick(KIND_KEYS), r.pick(KIND_KEYS)]
    const blooms = []
    if (v === 'field') {
      const n = r.int(7, 11) * (wide ? 3 : 1)
      for (let i = 0; i < n; i++) blooms.push({ x: 20 + ((W - 40) / n) * i + r.int(-14, 14), y: r.int(110, 230), r: r.int(20, 42), kind: r.pick(kinds), rot: r.int(0, 60), stem: r.int(-20, 20) })
    } else if (v === 'bouquet') {
      const n = r.int(5, 7)
      for (let i = 0; i < n; i++) {
        const a = (-Math.PI / 2) + ((i - (n - 1) / 2) * 0.42)
        const d = r.int(70, 120)
        blooms.push({ x: 200 + Math.cos(a) * d, y: 250 + Math.sin(a) * d, r: r.int(30, 46), kind: r.pick(kinds), rot: r.int(0, 60), stem: (200 - (200 + Math.cos(a) * d)) * 0.9 })
      }
    } else {
      const n = r.int(9, 14) * (wide ? 3 : 1)
      for (let i = 0; i < n; i++) blooms.push({ x: r.int(0, W), y: r.int(0, 300), r: r.int(14, 44), kind: r.pick(kinds), rot: r.int(0, 60) })
    }
    blooms.sort((a, b) => a.r - b.r)
    return { sky, blooms, W, id: 'fa' + seed + (variant || '') + (wide ? 'w' : '') }
  }, [seed, variant, wide])
  return (
    <svg viewBox={`0 0 ${art.W} 300`} preserveAspectRatio="xMidYMid slice" className={cn('block', rounded && 'rounded-xl', className)} role="img" aria-label="Tranh hoa minh hoạ">
      <defs>
        <linearGradient id={art.id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={art.sky[0]} /><stop offset="1" stopColor={art.sky[1]} />
        </linearGradient>
      </defs>
      <rect width={art.W} height="300" fill={`url(#${art.id})`} />
      {art.blooms.map((b, i) => <Bloom key={i} {...b} />)}
    </svg>
  )
}

/** Cánh hoa rơi khi ủng hộ thành công */
export function PetalRain({ count = 26, kinds = ['dao', 'mai', 'sen'] }) {
  const items = useMemo(() => {
    const r = seeded(Date.now() % 100000)
    return Array.from({ length: count }, (_, i) => ({ left: r.int(0, 100), delay: r.next() * 1.2, size: r.int(14, 30), dx: r.int(-80, 80), kind: kinds[i % kinds.length] }))
  }, [count]) // eslint-disable-line react-hooks/exhaustive-deps
  return (
    <div className="pointer-events-none fixed inset-0 z-[120] overflow-hidden" aria-hidden>
      {items.map((p, i) => (
        <span key={i} className="absolute top-0 animate-petal opacity-0" style={{ left: p.left + '%', animationDelay: p.delay + 's', '--dx': p.dx + 'px' }}>
          <Flower kind={p.kind} size={p.size} />
        </span>
      ))}
    </div>
  )
}
