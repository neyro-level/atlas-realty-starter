import {
  BadgePercent,
  Building2,
  HousePlus,
  Landmark,
  ShieldCheck,
} from "lucide-react";

const MORTGAGE_PROGRAMS = [
  {
    title: "Ипотека на новостройки",
    description: "Квартиры в аккредитованных жилых комплексах",
    rate: "По актуальным условиям",
    Icon: Building2,
  },
  {
    title: "Вторичное жильё",
    description: "Готовая квартира, дом или таунхаус",
    rate: "По актуальным условиям",
    Icon: Landmark,
  },
  {
    title: "Строительство дома",
    description: "На своём участке или с подрядчиком",
    rate: "По актуальным условиям",
    Icon: HousePlus,
  },
] as const;

const SUPPORT_OPTIONS = [
  {
    title: "Материнский капитал",
    Icon: BadgePercent,
  },
  {
    title: "Военный сертификат",
    Icon: ShieldCheck,
  },
  {
    title: "Жилищные сертификаты",
    Icon: Landmark,
  },
] as const;

export function MortgageProgramsView({ cityPrepositional }: { cityPrepositional: string }) {
  return (
    <section className="bg-white py-12 sm:py-16 lg:py-[88px]" aria-labelledby="mortgage-programs-title">
      <div className="mx-auto max-w-site-frame px-5">
        <div className="pb-7 sm:pb-9">
          <h2
            id="mortgage-programs-title"
            className="text-[24px] font-semibold leading-[1.1] tracking-[-0.03em] text-[var(--text-primary)] sm:text-[clamp(24px,1.8vw,30px)] sm:whitespace-nowrap"
          >
            Ипотечные программы в {cityPrepositional}
          </h2>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {MORTGAGE_PROGRAMS.map((program) => (
            <article
              key={program.title}
              className="group flex min-h-[184px] flex-col rounded-2xl bg-[var(--mortgage-programs-surface-01)] p-5 transition duration-300 ease-out hover:-translate-y-0.5 hover:bg-[var(--accent-soft)] hover:shadow-[var(--mortgage-programs-shadow-01)] sm:p-6"
            >
              <span className="flex size-10 items-center justify-center rounded-xl bg-white text-[var(--text-secondary)] transition duration-300 group-hover:text-[var(--accent)]">
                <program.Icon className="size-[18px]" strokeWidth={1.6} aria-hidden />
              </span>
              <h3 className="mt-5 text-[16px] font-semibold leading-snug text-[var(--text-primary)]">{program.title}</h3>
              <p className="mt-2 text-[13px] leading-5 text-[var(--text-muted)]">{program.description}</p>
              <p className="mt-auto pt-6 text-[14px] font-medium leading-none text-[var(--accent)]">{program.rate}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 border-t border-[var(--mortgage-programs-border-01)] pt-7 sm:mt-12 sm:pt-8">
          <h3 className="text-[15px] font-medium leading-none text-[var(--text-secondary)]">Сертификаты</h3>
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {SUPPORT_OPTIONS.map((option) => (
              <li key={option.title} className="flex min-h-14 items-center gap-3 rounded-xl bg-[var(--mortgage-programs-surface-02)] px-4 py-3.5">
                <option.Icon className="size-[17px] shrink-0 text-[var(--text-muted)]" strokeWidth={1.6} aria-hidden />
                <p className="text-[14px] font-medium leading-5 text-[var(--mortgage-programs-content-01)]">{option.title}</p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
