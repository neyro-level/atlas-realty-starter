import { ArrowRight, CheckCircle2 } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import type { CommercialPageConfig, CommercialPageData } from '@/shared/types/commercial-pages'

import { Breadcrumbs } from './Breadcrumbs'
import { OfficesDirectory, ReviewsDirectory } from './ContentDirectoryPages'

export function CommercialPageView({
  contactHref,
  data,
  homeHref,
  page,
}: {
  contactHref: string
  data: CommercialPageData
  homeHref: string
  page: CommercialPageConfig
}) {
  const { contacts, offices = [], reviews = [] } = data

  return (
    <main className="bg-white">
      <section className="py-6 lg:py-8">
        <div className="site-shell"><Breadcrumbs items={[{ href: homeHref, label: 'Главная' }, { label: page.eyebrow }]} /></div>
      </section>

      <section className="pb-10 lg:pb-14">
        <div className="site-shell">
          <div className="relative min-h-[380px] overflow-hidden rounded-lg bg-[#17161a] text-white lg:min-h-[500px]">
            <Image alt="" className="object-cover opacity-52" fill priority sizes="100vw" src={page.heroImage} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/82 via-black/48 to-black/10" />
            <div className="relative flex min-h-[380px] max-w-4xl flex-col justify-end p-7 lg:min-h-[500px] lg:p-12">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-white/60">{page.eyebrow}</p>
              <h1 className="mt-4 max-w-3xl text-balance text-4xl font-extrabold leading-[0.96] md:text-6xl">{page.title}</h1>
              <p className="mt-5 max-w-2xl text-base leading-7 text-white/75 lg:text-lg">{page.description}</p>
              <Link className="mt-7 inline-flex min-h-12 w-fit items-center gap-2 rounded-lg bg-[#8a1515] px-5 font-semibold text-white transition hover:bg-[#630e0e]" href={page.ctaHref}>{page.cta}<ArrowRight className="size-4" /></Link>
            </div>
          </div>
        </div>
      </section>

      <section className="pb-14 lg:pb-20">
        <div className="site-shell">
          <div className="grid gap-3 md:grid-cols-3">
            {page.facts.map((fact) => (
              <article className="rounded-lg border border-[#e3e3e1] bg-[#fafafa] p-6" key={fact.label}>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-[#827f81]">{fact.label}</p>
                <strong className="mt-3 block text-xl leading-tight">{fact.value}</strong>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CommercialFamilySection content={page.familySection} />

      <section className="bg-[#f4f4f3] py-14 lg:py-20">
        <div className="site-shell">
          <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8a1515]">Как работаем</p>
          <h2 className="mt-3 max-w-2xl text-balance text-3xl font-bold md:text-4xl">Понятный маршрут без лишних шагов</h2>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {page.steps.map((step, index) => (
              <article className="rounded-lg border border-[#e3e3e1] bg-white p-6" key={step.title}>
                <span className="inline-flex size-9 items-center justify-center rounded-full bg-[#17161a] text-sm font-bold text-white">{index + 1}</span>
                <h3 className="mt-6 text-xl font-bold">{step.title}</h3>
                <p className="mt-3 text-sm leading-6 text-[#827f81]">{step.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {page.family === 'reviews' ? <ReviewsDirectory reviews={reviews} /> : null}
      {page.family === 'contacts' && contacts ? <OfficesDirectory contacts={contacts} offices={offices} /> : null}

      <section className="py-14 lg:py-20">
        <div className="site-shell grid gap-7 rounded-lg bg-[#17161a] p-7 text-white lg:grid-cols-[1fr_auto] lg:items-center lg:p-10">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-white/45">Следующий шаг</p>
            <h2 className="mt-3 text-3xl font-bold">Соберём варианты под вашу задачу</h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/65">Без вымышленных гарантий и случайной выдачи. Сначала проверяем данные, затем предлагаем решение.</p>
          </div>
          <Link className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-white px-6 font-semibold text-[#17161a]" href={contactHref}><CheckCircle2 className="size-4" />Связаться</Link>
        </div>
      </section>
    </main>
  )
}

function CommercialFamilySection({ content }: { content?: CommercialPageConfig['familySection'] }) {
  if (!content) return null
  return <section className="border-y border-[#E3E3E1] bg-white py-14 lg:py-20"><div className="site-shell"><p className="text-xs font-bold uppercase tracking-[.12em] text-[#8A1515]">{content.eyebrow}</p><h2 className="mt-3 max-w-3xl text-balance text-3xl font-bold md:text-4xl">{content.title}</h2><div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-[#E3E3E1] bg-[#E3E3E1] md:grid-cols-2">{content.items.map((item) => <article className="bg-white p-6 lg:p-8" key={item.title}><h3 className="text-xl font-bold">{item.title}</h3><p className="mt-3 text-sm leading-6 text-[#827F81]">{item.text}</p></article>)}</div></div></section>
}
