import { useEffect, useRef, useState } from 'react'
import { AudioLines, Mic, Pause, Play, RotateCcw, RotateCw, Square, Trash2, Upload } from 'lucide-react'
import { Button, IconButton } from '@/components/ui'
import { cn } from '@/lib/cn'
import { clock } from './shared'

/** Trình phát mô phỏng: thanh tiến độ chạy theo thời gian thật, không phát tiếng. */
export function MockPlayer({ duration, name, onRemove, className }) {
  const [pos, setPos] = useState(0)
  const [playing, setPlaying] = useState(false)

  useEffect(() => { setPos(0); setPlaying(false) }, [duration])
  useEffect(() => {
    if (!playing) return
    const t = setInterval(() => setPos((p) => Math.min(duration, p + 0.25)), 250)
    return () => clearInterval(t)
  }, [playing, duration])
  useEffect(() => { if (playing && pos >= duration) setPlaying(false) }, [pos, playing, duration])

  const seek = (v) => setPos(Math.max(0, Math.min(duration, v)))
  const toggle = () => { if (!playing && pos >= duration) setPos(0); setPlaying(!playing) }
  const pct = duration ? (pos / duration) * 100 : 0

  return (
    <div className={cn('rounded-2xl bg-subtle p-4 sm:p-5', className)}>
      <div className="flex items-center gap-3">
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-brand-50 text-brand-ink"><AudioLines size={19} /></span>
        <div className="min-w-0 flex-1">
          <div className="truncate text-[13.5px] font-[600] text-fg">{name || 'Tệp âm thanh'}</div>
          <div className="ds-caption">Thời lượng {clock(duration)} · trình phát mô phỏng của bản demo</div>
        </div>
        {onRemove && <IconButton icon={Trash2} label="Gỡ âm thanh" size="sm" onClick={onRemove} />}
      </div>

      <div className="mt-4 flex items-center gap-3">
        <span className="num w-11 shrink-0 text-[12.5px] text-muted">{clock(pos)}</span>
        <div className="relative h-5 flex-1">
          <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 overflow-hidden rounded-full bg-line-strong">
            <div className="h-full rounded-full bg-brand-500" style={{ width: pct + '%' }} />
          </div>
          <span className="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-brand-500 bg-surface shadow-sm" style={{ left: pct + '%' }} />
          <input type="range" min={0} max={duration} step={1} value={Math.floor(pos)} onChange={(e) => seek(Number(e.target.value))}
            aria-label="Vị trí phát" className="absolute inset-0 h-full w-full cursor-pointer opacity-0" />
        </div>
        <span className="num w-11 shrink-0 text-right text-[12.5px] text-muted">{clock(duration)}</span>
      </div>

      <div className="mt-2 flex items-center justify-center gap-2">
        <Button variant="ghost" size="sm" icon={RotateCcw} onClick={() => seek(pos - 10)} aria-label="Lùi 10 giây">10s</Button>
        <button type="button" onClick={toggle} aria-label={playing ? 'Tạm dừng' : 'Phát'}
          className="grid size-11 place-items-center rounded-full bg-brand-500 text-white transition-colors hover:bg-brand-600">
          {playing ? <Pause size={19} fill="currentColor" /> : <Play size={19} fill="currentColor" className="ml-0.5" />}
        </button>
        <Button variant="ghost" size="sm" iconRight={RotateCw} onClick={() => seek(pos + 10)} aria-label="Tới 10 giây">10s</Button>
      </div>
    </div>
  )
}

/** Đọc thời lượng thật của tệp âm thanh; không đọc được thì trả về một thời lượng mô phỏng. */
function readDuration(file) {
  return new Promise((resolve) => {
    const fallback = () => resolve(Math.floor(Math.random() * 600) + 120)
    try {
      const url = URL.createObjectURL(file)
      const a = new Audio()
      const done = (v) => { URL.revokeObjectURL(url); clearTimeout(timer); Number.isFinite(v) && v >= 1 ? resolve(Math.round(v)) : fallback() }
      const timer = setTimeout(() => done(NaN), 2500)
      a.preload = 'metadata'
      a.onloadedmetadata = () => done(a.duration)
      a.onerror = () => done(NaN)
      a.src = url
    } catch {
      fallback()
    }
  })
}

/**
 * Chọn nguồn âm thanh cho bài: tải tệp hoặc thu âm (mô phỏng).
 * value = thời lượng (giây) hoặc null; onChange(duration | null).
 */
export function AudioStudio({ value, onChange, error }) {
  const fileRef = useRef(null)
  const [mode, setMode] = useState('idle') // idle | record
  const [recording, setRecording] = useState(false)
  const [elapsed, setElapsed] = useState(0)
  const [loading, setLoading] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    if (!recording) return
    const t = setInterval(() => setElapsed((s) => s + 1), 1000)
    return () => clearInterval(t)
  }, [recording])

  const pickFile = async (e) => {
    const f = e.target.files?.[0]
    e.target.value = ''
    if (!f) return
    setLoading(true)
    const d = await readDuration(f)
    setLoading(false)
    setName(f.name)
    onChange(d)
  }
  const startRecord = () => { setElapsed(0); setRecording(true) }
  const stopRecord = () => {
    setRecording(false)
    setMode('idle')
    setName('Bản thu âm mới')
    onChange(Math.max(1, elapsed))
  }
  const cancelRecord = () => { setRecording(false); setElapsed(0); setMode('idle') }

  if (value) return <MockPlayer duration={value} name={name || 'Âm thanh của bài'} onRemove={() => { setName(''); onChange(null) }} />

  if (mode === 'record') {
    return (
      <div className="flex flex-col items-center rounded-2xl bg-subtle px-5 py-8 text-center">
        <span className={cn('grid size-14 place-items-center rounded-full', recording ? 'bg-neg-soft text-neg' : 'bg-surface text-muted')}>
          <Mic size={24} className={recording ? 'animate-pulse' : ''} />
        </span>
        <div className="num mt-4 text-[40px] font-[550] leading-none tracking-tight text-fg" role="timer" aria-live="off">{clock(elapsed)}</div>
        <p className="ds-caption mt-2">{recording ? 'Đang thu âm… bấm Dừng khi bạn nói xong.' : 'Bấm Bắt đầu để thu. Bản demo chỉ đếm giờ, không ghi tiếng thật.'}</p>
        <div className="mt-5 flex items-center gap-2">
          {recording
            ? <Button variant="danger" icon={Square} onClick={stopRecord}>Dừng</Button>
            : <Button variant="primary" icon={Mic} onClick={startRecord}>Bắt đầu</Button>}
          <Button variant="ghost" onClick={cancelRecord}>Huỷ</Button>
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className={cn('grid gap-3 rounded-2xl border border-dashed p-4 sm:grid-cols-2 sm:p-5', error ? 'border-neg' : 'border-line-strong')}>
        <button type="button" onClick={() => fileRef.current?.click()} disabled={loading}
          className="flex flex-col items-center gap-2 rounded-xl bg-subtle px-4 py-6 text-center transition-colors hover:bg-hover disabled:opacity-60">
          <span className="grid size-11 place-items-center rounded-full bg-surface text-brand-ink"><Upload size={19} /></span>
          <span className="text-[14px] font-[600] text-fg">{loading ? 'Đang xử lý tệp…' : 'Tải tệp âm thanh'}</span>
          <span className="ds-caption">MP3, M4A hoặc WAV, tối đa 200 MB</span>
        </button>
        <button type="button" onClick={() => { setElapsed(0); setMode('record') }} disabled={loading}
          className="flex flex-col items-center gap-2 rounded-xl bg-subtle px-4 py-6 text-center transition-colors hover:bg-hover disabled:opacity-60">
          <span className="grid size-11 place-items-center rounded-full bg-surface text-brand-ink"><Mic size={19} /></span>
          <span className="text-[14px] font-[600] text-fg">Thu âm</span>
          <span className="ds-caption">Thu trực tiếp ngay trên trình duyệt</span>
        </button>
        <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={pickFile} />
      </div>
      {error && <p className="mt-1.5 text-[12.5px] text-neg">{error}</p>}
    </div>
  )
}
