import { useCallback, useEffect, useRef, useState } from 'react'
import { Bold, Heading2, ImagePlus, Italic, Link2, Link2Off, List, ListOrdered, Minus, Quote, Underline } from 'lucide-react'
import { Button } from '@/components/ui'
import { cn } from '@/lib/cn'

const exec = (cmd, value = null) => document.execCommand(cmd, false, value)

function normalizeUrl(raw) {
  const v = raw.trim()
  if (!v) return ''
  if (/^(https?:\/\/|mailto:)/i.test(v)) return v
  if (/^[a-z][a-z0-9+.-]*:/i.test(v)) return '' // chặn các giao thức khác (javascript:, data:…)
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? `mailto:${v}` : `https://${v}`
}

function ToolButton({ icon: Icon, label, active, onAction }) {
  return (
    <button type="button" title={label} aria-label={label} aria-pressed={!!active}
      onMouseDown={(e) => e.preventDefault()} onClick={onAction}
      className={cn('grid size-8 shrink-0 place-items-center rounded-lg transition-colors', active ? 'bg-brand-50 text-brand-ink' : 'text-dim hover:bg-hover hover:text-fg')}>
      <Icon size={16} strokeWidth={2} />
    </button>
  )
}

const Sep = () => <span className="mx-1 h-5 w-px shrink-0 bg-line" />

/**
 * Trình soạn văn bản giàu định dạng (contentEditable + execCommand).
 * HTML ban đầu chỉ được nạp một lần; mỗi thay đổi báo ra ngoài qua onChange(html).
 */
export function RichEditor({ initialHtml = '', onChange, onAddImage, placeholder = 'Bắt đầu viết…', className }) {
  const ref = useRef(null)
  const saved = useRef(null)
  const urlRef = useRef(null)
  const [active, setActive] = useState({})
  const [empty, setEmpty] = useState(!initialHtml)
  const [linking, setLinking] = useState(false)
  const [url, setUrl] = useState('')
  const [urlError, setUrlError] = useState('')

  const closest = useCallback((tag) => {
    const sel = window.getSelection()
    let n = sel?.anchorNode
    while (n && n !== ref.current) {
      if (n.nodeType === 1 && n.tagName === tag) return n
      n = n.parentNode
    }
    return null
  }, [])

  const inEditor = useCallback(() => {
    const sel = window.getSelection()
    return !!sel?.rangeCount && !!ref.current?.contains(sel.anchorNode)
  }, [])

  const refresh = useCallback(() => {
    if (!inEditor()) return
    const state = (c) => { try { return document.queryCommandState(c) } catch { return false } }
    setActive({
      bold: state('bold'), italic: state('italic'), underline: state('underline'),
      ul: state('insertUnorderedList'), ol: state('insertOrderedList'),
      h2: !!closest('H2'), quote: !!closest('BLOCKQUOTE'), link: !!closest('A'),
    })
  }, [closest, inEditor])

  const emit = useCallback(() => {
    const el = ref.current
    if (!el) return
    const blank = !el.textContent.trim() && !el.querySelector('img,hr,li')
    setEmpty(blank)
    onChange?.(blank ? '' : el.innerHTML)
  }, [onChange])

  useEffect(() => {
    ref.current.innerHTML = initialHtml
    try { exec('defaultParagraphSeparator', 'p') } catch { /* trình duyệt cũ */ }
    document.addEventListener('selectionchange', refresh)
    return () => document.removeEventListener('selectionchange', refresh)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const run = (cmd, value) => {
    ref.current.focus()
    exec(cmd, value)
    emit(); refresh()
  }
  const toggleBlock = (tag) => run('formatBlock', closest(tag.toUpperCase()) ? 'p' : tag)

  const restore = () => {
    ref.current.focus()
    const sel = window.getSelection()
    if (saved.current) { sel.removeAllRanges(); sel.addRange(saved.current) }
  }
  const openLink = () => {
    if (linking) { setLinking(false); return }
    const sel = window.getSelection()
    saved.current = inEditor() ? sel.getRangeAt(0).cloneRange() : null
    setUrl(closest('A')?.getAttribute('href') || '')
    setUrlError('')
    setLinking(true)
    setTimeout(() => urlRef.current?.focus(), 0)
  }
  const applyLink = () => {
    const href = normalizeUrl(url)
    if (!href) { setUrlError('Nhập một địa chỉ hợp lệ, ví dụ: vidu.vn/bai-viet'); return }
    restore()
    const sel = window.getSelection()
    if (sel.isCollapsed && !closest('A')) {
      const a = document.createElement('a')
      a.href = href; a.textContent = url.trim()
      exec('insertHTML', a.outerHTML)
    } else {
      if (sel.isCollapsed) sel.selectAllChildren(closest('A'))
      exec('createLink', href)
    }
    setLinking(false)
    emit(); refresh()
  }
  const removeLink = () => {
    restore()
    const a = closest('A')
    const sel = window.getSelection()
    if (a && sel.isCollapsed) sel.selectAllChildren(a)
    exec('unlink')
    setLinking(false)
    emit(); refresh()
  }

  const onPaste = (e) => {
    e.preventDefault()
    exec('insertText', e.clipboardData.getData('text/plain'))
    emit()
  }
  const onKeyDown = (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); openLink() }
  }

  return (
    <div className={className}>
      {linking && (
        <div className="mb-2 animate-fade-in">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-subtle p-1.5 pl-3">
            <Link2 size={15} className="shrink-0 text-faint" />
            <input ref={urlRef} value={url} onChange={(e) => { setUrl(e.target.value); setUrlError('') }} placeholder="Dán hoặc nhập địa chỉ liên kết"
              aria-label="Địa chỉ liên kết" inputMode="url"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); applyLink() } if (e.key === 'Escape') { e.stopPropagation(); setLinking(false); restore() } }}
              className="h-8 min-w-0 flex-1 bg-transparent text-[13.5px] outline-none" />
            {active.link && <Button size="sm" variant="ghost" icon={Link2Off} onClick={removeLink}><span className="hidden sm:inline">Gỡ</span></Button>}
            <Button size="sm" variant="primary" onClick={applyLink}>Chèn</Button>
          </div>
          {urlError && <p className="mt-1 px-1 text-[12.5px] text-neg">{urlError}</p>}
        </div>
      )}

      <div role="toolbar" aria-label="Định dạng văn bản" className="sticky top-14 z-10 flex items-center gap-0.5 overflow-x-auto rounded-xl border border-line bg-surface p-1 no-scrollbar lg:top-2">
        <ToolButton icon={Bold} label="Đậm (Ctrl+B)" active={active.bold} onAction={() => run('bold')} />
        <ToolButton icon={Italic} label="Nghiêng (Ctrl+I)" active={active.italic} onAction={() => run('italic')} />
        <ToolButton icon={Underline} label="Gạch chân (Ctrl+U)" active={active.underline} onAction={() => run('underline')} />
        <ToolButton icon={Link2} label="Liên kết (Ctrl+K)" active={active.link || linking} onAction={openLink} />
        <Sep />
        <ToolButton icon={Heading2} label="Tiêu đề" active={active.h2} onAction={() => toggleBlock('h2')} />
        <ToolButton icon={List} label="Danh sách chấm" active={active.ul} onAction={() => run('insertUnorderedList')} />
        <ToolButton icon={ListOrdered} label="Danh sách số" active={active.ol} onAction={() => run('insertOrderedList')} />
        <ToolButton icon={Quote} label="Trích dẫn" active={active.quote} onAction={() => toggleBlock('blockquote')} />
        <ToolButton icon={Minus} label="Đường kẻ ngang" onAction={() => run('insertHorizontalRule')} />
        {onAddImage && (
          <>
            <Sep />
            <ToolButton icon={ImagePlus} label="Chèn ảnh minh hoạ" onAction={onAddImage} />
          </>
        )}
      </div>

      <div className="relative mt-3">
        {empty && <div className="pointer-events-none absolute left-0 top-0 prose-post text-faint" aria-hidden><p>{placeholder}</p></div>}
        <div ref={ref} contentEditable suppressContentEditableWarning role="textbox" aria-multiline="true" aria-label="Nội dung bài viết"
          onInput={emit} onBlur={emit} onPaste={onPaste} onKeyDown={onKeyDown} onKeyUp={refresh} onMouseUp={refresh}
          className="prose-post min-h-[320px] break-words outline-none [&>*:first-child]:mt-[.7em]" />
      </div>
    </div>
  )
}
