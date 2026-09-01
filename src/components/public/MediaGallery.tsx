'use client'

import { ChevronLeft, ChevronRight, Image as ImageIcon, MapPinned, Play, X } from 'lucide-react'
import Image from 'next/image'
import { useMemo, useRef, useState, type TouchEvent } from 'react'

export type GalleryImage = { alt: string; src: string }
type Tab = 'photos' | 'video' | 'map'

export function MediaGallery({ address, images, latitude, longitude, name, videoUrl }: { address: string; images: GalleryImage[]; latitude?: number; longitude?: number; name: string; videoUrl?: string }) {
  const unique = useMemo(() => Array.from(new Map(images.map((image) => [image.src, image])).values()), [images])
  const [tab, setTab] = useState<Tab>('photos')
  const [index, setIndex] = useState(0)
  const [lightbox, setLightbox] = useState(false)
  const touch = useRef<{ x: number; y: number } | null>(null)
  const current = unique[Math.min(index, Math.max(unique.length - 1, 0))]
  const previous = () => setIndex((value) => value === 0 ? unique.length - 1 : value - 1)
  const next = () => setIndex((value) => (value + 1) % unique.length)
  const onTouchStart = (event: TouchEvent) => { const point = event.touches[0]; if (point) touch.current = { x: point.clientX, y: point.clientY } }
  const onTouchEnd = (event: TouchEvent) => { const start = touch.current; const point = event.changedTouches[0]; touch.current = null; if (!start || !point) return; const dx = point.clientX - start.x; const dy = point.clientY - start.y; if (Math.abs(dx) < 42 || Math.abs(dx) <= Math.abs(dy)) return; if (dx < 0) next(); else previous() }
  const videoEmbed = safeVideoEmbed(videoUrl)
  const mapHref = latitude !== undefined && longitude !== undefined ? `https://yandex.ru/maps/?pt=${longitude},${latitude}&z=16&l=map` : `https://yandex.ru/maps/?text=${encodeURIComponent(`${name}, ${address}`)}`
  const mapEmbed = latitude !== undefined && longitude !== undefined ? `https://yandex.ru/map-widget/v1/?ll=${longitude}%2C${latitude}&z=16&pt=${longitude}%2C${latitude}%2Cpm2rdm` : `https://yandex.ru/map-widget/v1/?text=${encodeURIComponent(`${name}, ${address}`)}&z=16`

  return (
    <div className="grid h-[392px] grid-rows-[minmax(0,1fr)_50px] gap-2 md:h-[510px] md:grid-rows-[minmax(0,1fr)_52px] lg:h-[640px] lg:gap-3 lg:rounded-lg lg:border lg:border-[#E3E3E1] lg:bg-white lg:p-3 lg:shadow-[0_1px_2px_rgba(0,0,0,0.03),0_18px_42px_rgba(23,22,26,0.08)]">
      <div className="relative min-h-0 overflow-hidden rounded-lg bg-[#EBEBE9]" onTouchEnd={onTouchEnd} onTouchStart={onTouchStart}>
        {tab === 'photos' ? current ? <><button aria-label="Открыть фото на весь экран" className="relative block h-full w-full cursor-zoom-in border-0 bg-transparent p-0" onClick={() => setLightbox(true)} type="button"><Image alt={current.alt} className="object-cover" fill priority sizes="(min-width:1180px) calc(var(--site-frame-max) - 372px), 100vw" src={current.src} unoptimized={current.src.startsWith('http')} />{unique.length > 1 ? <span className="absolute left-3 top-3 rounded-lg bg-[#18181A]/82 px-3 py-1.5 text-xs font-semibold tabular-nums text-white backdrop-blur-sm">{index + 1} / {unique.length}</span> : null}</button>{unique.length > 1 ? <><button aria-label="Предыдущее фото" className="absolute left-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-lg border border-white/70 bg-[#18181A]/76 text-white transition hover:bg-[#18181A]" onClick={previous} type="button"><ChevronLeft className="size-5" /></button><button aria-label="Следующее фото" className="absolute right-3 top-1/2 inline-flex size-11 -translate-y-1/2 items-center justify-center rounded-lg border border-white/70 bg-[#18181A]/76 text-white transition hover:bg-[#18181A]" onClick={next} type="button"><ChevronRight className="size-5" /></button></> : null}</> : <GalleryPlaceholder text="Фото объекта уточняется" /> : null}
        {tab === 'video' ? videoEmbed ? <iframe allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowFullScreen className="h-full w-full border-0" loading="lazy" src={videoEmbed} title={`Видео: ${name}`} /> : <GalleryPlaceholder text="Видео объекта не загружено" /> : null}
        {tab === 'map' ? <div className="relative h-full w-full"><iframe allowFullScreen className="h-full w-full border-0" src={mapEmbed} title={`Расположение: ${name}`} /><a className="absolute bottom-3 right-3 inline-flex min-h-10 items-center gap-2 rounded-lg bg-white px-3 text-xs font-semibold text-[#17161A] shadow-[0_12px_30px_rgba(0,0,0,0.14)] transition hover:text-[#8A1515]" href={mapHref} rel="noreferrer" target="_blank"><MapPinned className="size-3.5" />Открыть на карте</a></div> : null}
      </div>
      <div className="grid min-h-0 w-full grid-cols-3 gap-2" role="tablist" aria-label="Медиа объекта">
        <TabButton active={tab === 'photos'} icon={ImageIcon} label="Фотографии" onClick={() => setTab('photos')} />
        <TabButton active={tab === 'video'} icon={Play} label="Видео" onClick={() => setTab('video')} />
        <TabButton active={tab === 'map'} icon={MapPinned} label="На карте" onClick={() => setTab('map')} />
      </div>
      {lightbox && current ? <div className="fixed inset-0 z-[100] grid place-items-center bg-[#101011]/92 p-4 md:p-16" role="dialog" aria-modal="true" aria-label="Медиа объекта"><button aria-label="Закрыть просмотр" className="absolute right-5 top-5 inline-flex size-11 items-center justify-center rounded-lg border border-white/70 bg-[#18181A]/76 text-white" onClick={() => setLightbox(false)} type="button"><X className="size-5" /></button><div className="relative h-[82vh] w-full max-w-[1120px]"><Image alt={current.alt} className="object-contain" fill sizes="100vw" src={current.src} unoptimized={current.src.startsWith('http')} /></div></div> : null}
    </div>
  )
}

function TabButton({ active, icon: Icon, label, onClick }: { active: boolean; icon: typeof ImageIcon; label: string; onClick: () => void }) { return <button aria-selected={active} className={`inline-flex min-h-[36px] items-center justify-center gap-1.5 rounded-[12px] border px-2 text-[11px] font-semibold transition md:min-h-[38px] ${active ? 'border-[#8A1515] bg-[#8A1515] text-white' : 'border-[#E3E3E1] bg-[#FAFAFA] text-[#413F41] hover:border-[#8A1515] hover:bg-[#F7F2F2] hover:text-[#8A1515]'}`} onClick={onClick} role="tab" type="button"><Icon className="size-[13px] md:size-[14px]" />{label}</button> }
function GalleryPlaceholder({ text }: { text: string }) { return <div className="flex h-full flex-col items-center justify-center text-[#827f81]"><ImageIcon className="size-10" /><p className="mt-4 text-sm font-semibold">{text}</p></div> }
function safeVideoEmbed(value?: string) { if (!value) return null; try { const url = new URL(value); if (url.hostname.endsWith('youtube.com') && url.searchParams.get('v')) return `https://www.youtube.com/embed/${url.searchParams.get('v')}`; if (url.hostname === 'youtu.be') return `https://www.youtube.com/embed/${url.pathname.slice(1)}`; if (url.hostname.endsWith('vk.com') && url.pathname.includes('video_ext.php')) return url.toString(); return null } catch { return null } }
