import { ArrowRight, Building2, Calculator, Home, ShieldCheck } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import type { PublicComplex, PublicProperty } from '@/payload/public/queries'

import { PropertyCard } from './PropertyCard'
import { ResidentialComplexCard } from './ResidentialComplexCard'

export function PublicHomePage({ complexes, properties }: { complexes: PublicComplex[]; properties: PublicProperty[] }) {
  const heroImage = complexes[0]?.gallery[0] ?? { alt: 'Каталог недвижимости', src: '/images/ui-home-hero.webp' }

  return (
    <main>
      <section className="bg-white py-8 lg:py-12">
        <div className="site-shell">
          <div className="grid min-h-[520px] overflow-hidden rounded-lg border border-[#e3e3e1] bg-[#fafafa] lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col justify-center p-7 lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#8a1515]">Союз Застройщиков · Ростов-на-Дону</p>
              <h1 className="mt-5 text-balance text-5xl font-extrabold leading-[0.92] md:text-6xl xl:text-7xl">
                <span className="block">Проверенная</span>
                <span className="block">недвижимость</span>
                <span className="block text-[#8a1515]">в Ростове</span>
              </h1>
              <p className="mt-6 max-w-xl text-base leading-7 text-[#413f41] lg:text-lg">Сравниваем жилые комплексы, готовые квартиры, ипотеку и строительство в одной понятной системе.</p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link className="inline-flex min-h-12 items-center gap-2 rounded-lg bg-[#8a1515] px-5 font-semibold text-white transition hover:bg-[#630e0e]" href="/novostroyki-rostova">Смотреть новостройки<ArrowRight className="size-4" /></Link>
                <span className="text-sm font-semibold text-[#827f81]">{complexes.length > 0 ? `${complexes.length} ЖК` : 'Каталог ЖК'} · готовые квартиры · ипотека</span>
              </div>
            </div>
            <Link className="group relative min-h-[360px] overflow-hidden bg-[#ebebe9] lg:min-h-full" href="/novostroyki-rostova">
              <Image alt={heroImage.alt} className="object-cover transition duration-700 group-hover:scale-[1.02]" fill priority sizes="(max-width: 1024px) 100vw, 46vw" src={heroImage.src} unoptimized={heroImage.src.startsWith('http')} />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
              <span className="absolute bottom-5 left-5 right-5 flex items-center justify-between rounded-lg bg-white/92 px-4 py-3 text-sm font-semibold backdrop-blur">Каталог жилых комплексов <ArrowRight className="size-4 text-[#8a1515]" /></span>
            </Link>
          </div>
        </div>
      </section>

      <section className="bg-white pb-12 lg:pb-16">
        <div className="site-shell grid gap-3 md:grid-cols-3">
          <DirectionCard description="Районы, сроки сдачи, планировки и условия покупки." href="/novostroyki-rostova" icon={Building2} title="Новостройки" />
          <DirectionCard description="Опубликованные объекты из единого Payload-каталога." href="/kvartiry-rostova" icon={Home} title="Готовые квартиры" />
          <DirectionCard description="Платёж, первый взнос и требования банка до выбора." href="/ipoteka" icon={Calculator} title="Ипотечный центр" />
        </div>
      </section>

      <section className="catalog-section">
        <div className="site-shell">
          <SectionHeading eyebrow="Новостройки" href="/novostroyki-rostova" title="Жилые комплексы Ростова" />
          {complexes.length > 0 ? <div className="catalog-grid mt-7">{complexes.slice(0, 6).map((complex, index) => <ResidentialComplexCard complex={complex} key={complex.id} priority={index < 3} />)}</div> : <EmptyHomeBlock text="ЖК появятся после публикации в Payload Admin." />}
        </div>
      </section>

      <section className="bg-white py-14 lg:py-20">
        <div className="site-shell">
          <SectionHeading eyebrow="Готовое жильё" href="/kvartiry-rostova" title="Квартиры и объекты" />
          {properties.length > 0 ? <div className="catalog-grid mt-7">{properties.slice(0, 6).map((property) => <PropertyCard key={property.id} property={property} />)}</div> : <EmptyHomeBlock text="Мы не показываем фиктивные квартиры: карточки появятся после публикации проверенных объектов." />}
        </div>
      </section>

      <section className="bg-[#17161a] py-14 text-white lg:py-20">
        <div className="site-shell grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <div>
            <ShieldCheck className="size-6 text-[#d78c8c]" />
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.14em] text-white/45">Подход</p>
            <h2 className="mt-3 text-balance text-4xl font-bold leading-tight">Сначала проверяем сценарий, потом показываем объект</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {['Бюджет и реальный платёж', 'Район и ежедневный маршрут', 'Срок сдачи и документы', 'Условия банка и сделки'].map((item, index) => <div className="rounded-lg border border-white/10 bg-white/5 p-5" key={item}><span className="text-xs text-white/35">0{index + 1}</span><strong className="mt-4 block">{item}</strong></div>)}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 lg:py-20">
        <div className="site-shell rounded-lg border border-[#e3e3e1] bg-[#fafafa] p-7 lg:flex lg:items-center lg:justify-between lg:gap-10 lg:p-10">
          <div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a1515]">Следующий шаг</p><h2 className="mt-3 text-3xl font-bold">Соберём короткий список под вашу задачу</h2><p className="mt-3 max-w-2xl text-sm leading-6 text-[#827f81]">Только опубликованные ЖК и объекты, без выдуманных предложений.</p></div>
          <Link className="mt-6 inline-flex min-h-12 shrink-0 items-center rounded-lg bg-[#8a1515] px-6 font-semibold text-white lg:mt-0" href="/contacts">Обсудить подбор</Link>
        </div>
      </section>
    </main>
  )
}

function DirectionCard({ description, href, icon: Icon, title }: { description: string; href: string; icon: typeof Building2; title: string }) {
  return <Link className="group rounded-lg border border-[#e3e3e1] bg-white p-6 transition hover:-translate-y-0.5 hover:border-[#8a1515]/25 hover:shadow-[var(--shadow-card-hover)]" href={href}><Icon className="size-6 text-[#8a1515]" /><div className="mt-8 flex items-center justify-between"><h2 className="text-xl font-bold">{title}</h2><ArrowRight className="size-4 transition group-hover:translate-x-1" /></div><p className="mt-3 text-sm leading-6 text-[#827f81]">{description}</p></Link>
}

function SectionHeading({ eyebrow, href, title }: { eyebrow: string; href: string; title: string }) {
  return <div className="flex flex-wrap items-end justify-between gap-5"><div><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a1515]">{eyebrow}</p><h2 className="mt-3 text-3xl font-bold md:text-4xl">{title}</h2></div><Link className="inline-flex items-center gap-2 text-sm font-semibold text-[#413f41] transition hover:text-[#8a1515]" href={href}>Смотреть все<ArrowRight className="size-4" /></Link></div>
}

function EmptyHomeBlock({ text }: { text: string }) {
  return <div className="mt-7 rounded-lg border border-dashed border-[#d0d0cd] bg-white px-6 py-12 text-center text-sm text-[#827f81]">{text}</div>
}
