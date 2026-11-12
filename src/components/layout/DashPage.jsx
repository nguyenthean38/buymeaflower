import { cn } from '@/lib/cn'
import { Tabs } from '@/components/ui'

/**
 * Khung một trang trong khu quản lý.
 * <DashPage title="Hội viên" desc="…" actions={<Button/>} tabs={[{ value, label, count }]} tab={tab} onTab={setTab}>…</DashPage>
 * Nội dung nên là các <Section> (thẻ trắng) xếp dọc.
 */
export function DashPage({ title, desc, actions, tabs, tab, onTab, children, className, narrow }) {
  return (
    <div className={cn('mx-auto w-full animate-fade-in', narrow ? 'max-w-[720px]' : 'max-w-[860px]', className)}>
      {(title || actions) && (
        <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
          <div className="min-w-0">
            {title && <h1 className="ds-h1">{title}</h1>}
            {desc && <p className="mt-1 text-[14px] text-muted max-w-xl">{desc}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      {tabs && <Tabs options={tabs} value={tab} onChange={onTab} className="mb-5" />}
      <div className="flex flex-col gap-5">{children}</div>
    </div>
  )
}

/** Thẻ trắng có tiêu đề: <Section title="Giá mỗi bông hoa" desc="…" action={…}>…</Section> */
export function Section({ title, desc, action, children, className, padded = true, badge }) {
  return (
    <section className={cn('card', padded && 'p-5 sm:p-6', className)}>
      {(title || action) && (
        <div className={cn('flex items-start justify-between gap-4', children && 'mb-4', !padded && 'p-5 sm:p-6 pb-0')}>
          <div className="min-w-0">
            {title && <h2 className="ds-h2 flex items-center gap-2">{title}{badge}</h2>}
            {desc && <p className="mt-1 text-[13.5px] text-muted">{desc}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

/** Ô chỉ số nhỏ dùng thành hàng 3 ô: <StatTile label="Người ủng hộ" value="128" icon={Heart} /> */
export function StatTile({ label, value, icon: Icon, className }) {
  return (
    <div className={cn('rounded-2xl bg-subtle px-4 py-3.5', className)}>
      <div className="text-[22px] font-[650] tracking-tight num leading-tight">{value}</div>
      <div className="mt-1 flex items-center gap-1.5 text-[12.5px] text-muted">{Icon && <Icon size={13} />}{label}</div>
    </div>
  )
}
