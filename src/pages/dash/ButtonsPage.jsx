import { useState } from 'react'
import { Download, Images } from 'lucide-react'
import { DashPage, Section } from '@/components/layout/DashPage'
import { Badge, Button, QrCode } from '@/components/ui'
import { Flower, FlowerArt } from '@/components/brand/Flower'
import { useApp } from '@/store'
import { ButtonBuilder, QrModal, StreamAlert, ThanksCards, WidgetBuilder, downloadLogo, downloadMark } from '@/features/thietlap/tools'

/* Hình minh hoạ nhỏ cho từng công cụ */
function ArtButton({ emoji }) {
  return (
    <div className="flex flex-col items-center gap-2.5">
      <span className="inline-flex h-9 items-center gap-2 rounded-full bg-brand-500 px-4 text-[13px] font-[650] text-white shadow-sm">
        <span>{emoji}</span><span className="h-1.5 w-16 rounded-full bg-white/80" />
      </span>
      <span className="h-1.5 w-24 rounded-full bg-line-strong" />
    </div>
  )
}
function ArtWidget({ emoji }) {
  return (
    <div className="relative h-[84px] w-[132px] overflow-hidden rounded-lg border border-line-strong bg-surface">
      <div className="flex h-3.5 items-center gap-1 border-b border-line bg-subtle px-1.5">
        <span className="size-1 rounded-full bg-faint" /><span className="size-1 rounded-full bg-faint" /><span className="size-1 rounded-full bg-faint" />
      </div>
      <div className="flex flex-col gap-1.5 p-2.5">
        <span className="h-1.5 w-12 rounded-full bg-line-strong" /><span className="h-1.5 w-20 rounded-full bg-line" /><span className="h-1.5 w-16 rounded-full bg-line" />
      </div>
      <span className="absolute bottom-1.5 right-1.5 grid size-7 place-items-center rounded-full bg-brand-500 text-[13px] shadow-md">{emoji}</span>
    </div>
  )
}
function ArtStream({ emoji }) {
  return (
    <div className="relative h-[84px] w-[132px] overflow-hidden rounded-lg bg-[#211a22]">
      <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded bg-[#d43d3d] px-1 text-[7.5px] font-[700] leading-[13px] text-white"><span className="size-1 rounded-full bg-white" />TRỰC TIẾP</span>
      <span className="absolute inset-x-3 top-8 flex items-center gap-1.5 rounded-lg bg-white px-2 py-1.5 shadow-md">
        <Flower size={16} /><span className="h-1.5 flex-1 rounded-full bg-[#eadfd7]" /><span className="text-[10px]">{emoji}</span>
      </span>
    </div>
  )
}
function ArtQr() {
  return (
    <div className="relative rounded-xl bg-white p-2 text-[#2b1622] shadow-sm ring-1 ring-line">
      <QrCode value="minh-hoa" size={68} />
      <span className="absolute left-1/2 top-1/2 grid size-5 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-md bg-white"><Flower size={15} /></span>
    </div>
  )
}

function ToolCard({ art, title, desc, action, onClick, badge }) {
  return (
    <div className="card flex flex-col p-4">
      <button type="button" onClick={onClick} aria-label={title} className="grid h-32 place-items-center rounded-xl bg-subtle transition-colors hover:bg-hover">{art}</button>
      <div className="mt-4 flex items-center gap-2">
        <h3 className="ds-h3">{title}</h3>{badge}
      </div>
      <p className="mt-1 flex-1 text-[13.5px] text-muted">{desc}</p>
      <div className="mt-4"><Button variant="outline" onClick={onClick}>{action}</Button></div>
    </div>
  )
}

export default function ButtonsPage() {
  const emoji = useApp((s) => s.page.item.emoji)
  const streamOn = useApp((s) => s.integrations.stream)
  const [tool, setTool] = useState(null)
  const close = () => setTool(null)

  return (
    <DashPage title="Nút & hình ảnh" desc="Công cụ để đưa trang tặng hoa của bạn đến nơi người hâm mộ đang ở: trang web, buổi phát trực tiếp, ấn phẩm in.">
      <div className="grid gap-4 sm:grid-cols-2">
        <ToolCard art={<ArtButton emoji={emoji} />} title="Nút cho trang web" action="Tạo nút" onClick={() => setTool('button')}
          desc="Một nút bấm mang màu và chữ của riêng bạn, dẫn thẳng về trang cá nhân." />
        <ToolCard art={<ArtWidget emoji={emoji} />} title="Tiện ích nổi trên trang web" action="Tạo tiện ích" onClick={() => setTool('widget')}
          desc="Nút tròn nổi ở góc trang, người xem tặng hoa mà không cần rời trang web của bạn." />
        <ToolCard art={<ArtStream emoji={emoji} />} title="Thông báo khi phát trực tiếp" action="Thiết lập" onClick={() => setTool('stream')}
          badge={streamOn ? <Badge tone="pos" dot size="sm">Đang bật</Badge> : null}
          desc="Hiện băng thông báo trên buổi phát mỗi khi có người vừa tặng hoa." />
        <ToolCard art={<ArtQr />} title="Mã QR" action="Xem mã QR" onClick={() => setTool('qr')}
          desc="Mã QR dẫn về trang của bạn, tiện để in lên thiệp, bao bì hay đặt ở quầy." />
      </div>

      <Section title="Hình ảnh chia sẻ" desc="Hình có sẵn để bạn dùng khi nhắc đến trang tặng hoa của mình.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col rounded-2xl bg-subtle p-4">
            <div className="grid grid-cols-2 gap-2">
              <div className="grid h-24 place-items-center rounded-xl bg-white px-2"><span className="inline-flex items-center gap-1.5"><Flower size={20} color="#e83e7c" /><span className="text-[13px] font-[800] leading-none tracking-[-0.03em] text-[#2b1622]">Buy me a <span className="text-[#c8245f]">flower</span></span></span></div>
              <div className="grid h-24 place-items-center rounded-xl bg-[#2b1622]"><Flower size={44} color="#f66699" /></div>
            </div>
            <h3 className="ds-h3 mt-4">Bộ nhận diện</h3>
            <p className="mt-1 flex-1 text-[13.5px] text-muted">Logo và biểu tượng bông hoa của Buy Me a Flower, dạng SVG sắc nét ở mọi kích cỡ.</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Button variant="outline" icon={Download} onClick={downloadLogo}>Tải logo</Button>
              <Button variant="ghost" icon={Download} onClick={downloadMark}>Tải biểu tượng</Button>
            </div>
          </div>
          <div className="flex flex-col rounded-2xl bg-subtle p-4">
            <div className="relative h-24 overflow-hidden rounded-xl">
              <FlowerArt seed={7} variant="field" className="absolute inset-0 size-full" />
              <div className="absolute inset-x-[14%] top-1/2 -translate-y-1/2 rounded-lg bg-white/90 py-2 text-center text-[13px] font-[800] tracking-tight text-[#2b1622]">Cảm ơn bạn đã tặng hoa</div>
            </div>
            <h3 className="ds-h3 mt-4">Thiệp cảm ơn</h3>
            <p className="mt-1 flex-1 text-[13.5px] text-muted">Bốn mẫu thiệp để gửi lời cảm ơn tới người vừa ủng hộ bạn.</p>
            <div className="mt-4"><Button variant="outline" icon={Images} onClick={() => setTool('cards')}>Xem 4 mẫu thiệp</Button></div>
          </div>
        </div>
      </Section>

      {tool === 'button' && <ButtonBuilder onClose={close} />}
      {tool === 'widget' && <WidgetBuilder onClose={close} />}
      {tool === 'stream' && <StreamAlert onClose={close} />}
      {tool === 'qr' && <QrModal onClose={close} />}
      {tool === 'cards' && <ThanksCards onClose={close} />}
    </DashPage>
  )
}
