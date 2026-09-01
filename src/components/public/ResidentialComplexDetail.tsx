import { Building2, CalendarDays, Home, MapPin, Ruler, type LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

import type { PublicComplex } from '@/payload/public/queries'

import { Breadcrumbs } from './Breadcrumbs'
import { ComplexDecisionSidebar } from './DetailDecisionPanels'
import { MediaGallery } from './MediaGallery'
import { ResidentialComplexCard } from './ResidentialComplexCard'

const FRAME = 'mx-auto w-full max-w-site-frame px-3 sm:px-5 lg:px-10 xl:px-12'

export function ResidentialComplexDetail({ complex, related }: { complex: PublicComplex; related: PublicComplex[] }) {
  return (
    <main className="min-h-screen bg-white text-[#17161A]">
      <section className="bg-white">
        <div className={`${FRAME} pb-7 pt-8 md:pb-9 md:pt-10 lg:pb-10 lg:pt-11`}>
          <Breadcrumbs className="mb-7 md:mb-8" items={[{ href: '/', label: 'Главная' }, { href: '/nedvizhimost-rostov', label: 'Недвижимость' }, { href: '/novostroyki-rostova', label: 'Новостройки' }, { label: complex.title }]} />
          <h1 className="max-w-[980px] text-[32px] font-extrabold leading-[1.06] md:text-[42px] lg:text-[48px]">{complex.title}</h1>
        </div>
      </section>
      <section className="bg-white pb-14 md:pb-18 lg:pb-22">
        <div className={FRAME}>
          <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_324px] xl:grid-cols-[minmax(0,1fr)_342px]">
            <div className="min-w-0 space-y-6">
              <MediaGallery address={complex.address} images={complex.gallery} latitude={complex.latitude} longitude={complex.longitude} name={complex.title} videoUrl={complex.videoUrl} />
              <section className="grid gap-4 rounded-lg border border-[#E3E3E1] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:p-6">
                <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#827F81]">Коротко о жилом комплексе</p>
                <div className="grid grid-cols-4 gap-3 max-[1180px]:grid-cols-2 max-md:grid-cols-1">
                  <SummaryFact icon={Building2} label="Застройщик" value={complex.developer} />
                  <SummaryFact icon={CalendarDays} label="Срок сдачи" value={complex.completionLabel} />
                  <SummaryFact icon={Ruler} label="Площади" value={complex.areaLabel} />
                  <SummaryFact icon={MapPin} label="Район" value={complex.district} />
                </div>
              </section>
              <DetailSection title={`О ${complex.title}`}>
                <p className="whitespace-pre-line text-[13px] leading-6 text-[#413F41] md:text-sm">{complex.description || complex.shortDescription || 'Подробное описание добавляется после проверки данных жилого комплекса.'}</p>
                {complex.advantages.length ? <div className="mt-5 grid gap-3 sm:grid-cols-2">{complex.advantages.map((item) => <article className="rounded-lg bg-[#F4F4F3] p-4" key={item.title}><strong className="text-sm">{item.title}</strong>{item.description ? <p className="mt-1.5 text-xs leading-5 text-[#827F81]">{item.description}</p> : null}</article>)}</div> : null}
              </DetailSection>
              <DetailSection title="Условия покупки">
                <div className="grid gap-3 sm:grid-cols-2">{complex.purchaseTerms.length ? complex.purchaseTerms.map((item) => <div className="rounded-lg border border-[#E3E3E1] p-4" key={item.title}><span className="text-xs text-[#827F81]">{item.title}</span><strong className="mt-1 block text-sm">{item.value}</strong></div>) : <p className="text-sm text-[#827F81]">Условия появятся после подтверждения данных застройщика.</p>}</div>
              </DetailSection>
              <DetailSection title="Выбрать квартиру">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{complex.roomTypes.length ? complex.roomTypes.map((room) => <div className="rounded-lg border border-[#E3E3E1] bg-[#FAFAFA] p-4" key={room}><Home className="size-5 text-[#8A1515]" /><strong className="mt-3 block">{room === 'studio' ? 'Студия' : `${room}-комнатная`}</strong><span className="mt-1 block text-xs text-[#827F81]">{complex.areaLabel}</span></div>) : <p className="text-sm text-[#827F81]">Планировки появятся после подтверждения данных.</p>}</div>
              </DetailSection>
              <DetailSection title="Расположение">
                <div className="flex items-start gap-3 rounded-lg bg-[#F4F4F3] p-4"><MapPin className="mt-0.5 size-5 shrink-0 text-[#8A1515]" /><div><strong className="text-sm">{complex.address}</strong><p className="mt-1 text-xs leading-5 text-[#827F81]">Интерактивная карта доступна во вкладке медиагалереи.</p></div></div>
              </DetailSection>
              {related.length ? <DetailSection title="Другие жилые комплексы"><div className="grid gap-4 md:grid-cols-2">{related.slice(0, 4).map((item) => <ResidentialComplexCard complex={item} key={item.id} />)}</div></DetailSection> : null}
            </div>
            <ComplexDecisionSidebar complex={complex} />
          </div>
        </div>
      </section>
    </main>
  )
}

function DetailSection({ children, title }: { children: ReactNode; title: string }) { return <section className="grid gap-4 rounded-lg border border-[#E3E3E1] bg-white p-5 shadow-[0_1px_2px_rgba(0,0,0,0.02)] md:p-6"><h2 className="scroll-mt-[130px] text-[22px] font-semibold leading-tight">{title}</h2><div>{children}</div></section> }
function SummaryFact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) { return <div className="flex items-center gap-3 rounded-lg border border-[#E3E3E1] bg-white px-3 py-3"><Icon className="size-5 shrink-0 text-[#413F41]" /><div className="grid min-w-0 gap-0.5"><strong className="text-sm font-semibold leading-5">{value}</strong><span className="text-[11px] leading-4 text-[#827F81]">{label}</span></div></div> }
