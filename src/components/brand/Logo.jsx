import { Link } from 'react-router-dom'
import { cn } from '@/lib/cn'
import { Flower } from './Flower'

/** Logo: bông hoa năm cánh + chữ "Buy me a flower". */
export function Logo({ to = '/', size = 26, wordmark = true, className, light }) {
  const body = (
    <span className={cn('inline-flex items-center gap-2 select-none', className)}>
      <Flower kind="dao" size={size} color="var(--c-brand-500)" />
      {wordmark && (
        <span className={cn('whitespace-nowrap font-[800] tracking-[-0.03em] leading-none', light ? 'text-white' : 'text-fg')} style={{ fontSize: size * 0.66 }}>
          Buy me a <span className={light ? 'text-white' : 'text-brand-ink'}>flower</span>
        </span>
      )}
    </span>
  )
  return to ? <Link to={to} aria-label="Buy Me a Flower — về trang chủ">{body}</Link> : body
}
