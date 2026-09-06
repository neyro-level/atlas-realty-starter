import type { ReactNode } from "react";

export function AboutCompanyFinalCtaView({ form }: { form: ReactNode }) {
  return <section id="about-company-consultation" className="bg-white py-12 sm:py-16 lg:py-[88px]" aria-labelledby="about-company-consultation-title">
    <div className="mx-auto max-w-site-frame px-5 md:px-8 lg:px-10"><div className="w-full rounded-2xl border border-[var(--palette-e5e7eb)] bg-[var(--palette-f9fafb)] px-5 py-9 text-center shadow-[0_18px_50px_rgba(17,24,39,0.06)] sm:px-10 sm:py-12 lg:px-16 lg:py-14">
      <h2 id="about-company-consultation-title" className="mx-auto max-w-[900px] text-[26px] font-semibold leading-[1.13] text-[var(--palette-111827)] sm:text-[clamp(28px,2vw,34px)]">Расскажите, какая у вас задача по недвижимости</h2>
      <p className="mx-auto mt-4 max-w-[760px] text-[15px] leading-7 text-[var(--palette-4b5563)]">Подскажем, с какого шага лучше начать: подбор объекта, продажа, ипотека, новостройка или юридическая проверка.</p>
      <div className="mx-auto mt-8 max-w-[600px] text-left text-[var(--palette-111827)] [&>form]:mt-0">{form}</div>
    </div></div>
  </section>;
}

export function MortgageConsultationView({ form }: { form: ReactNode }) {
  return <section className="bg-white pb-16 pt-0 sm:pb-20 lg:pb-24" aria-labelledby="mortgage-consultation-title">
    <div className="mx-auto max-w-site-frame px-5"><div className="border-t border-[var(--border)] px-0 pb-1 pt-9 sm:pt-11 lg:pt-12">
      <div className="mx-auto max-w-[840px] text-center"><h2 id="mortgage-consultation-title" className="text-[26px] font-semibold leading-[1.13] tracking-[-0.035em] text-[var(--text-primary)] sm:text-[clamp(28px,2vw,34px)]"><span className="block">Получите бесплатную консультацию по ипотеке</span><span className="block">и узнайте свой ипотечный потенциал</span></h2><p className="mt-3 text-sm leading-6 text-[var(--palette-5e5a5f)] sm:text-[15px]">Заполните эту форму, и мы перезвоним вам.</p></div>
      <div className="mx-auto max-w-[960px]">{form}</div>
    </div></div>
  </section>;
}
