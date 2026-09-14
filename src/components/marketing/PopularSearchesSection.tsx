import Link from "next/link";
import { tenant } from "@/project/tenant.config";

type PopularSearchLink = {
  label: string;
  href: string;
};

type PopularSearchGroup = {
  kicker: string;
  title: string;
  links: PopularSearchLink[];
};

const CATALOG_BASE_QUERY = {
  city: tenant.cityEn,
  deal_type: "sale",
  sort: "newest",
  view: "grid",
  limit: "16",
};

export const popularSearchGroups: PopularSearchGroup[] = [
  {
    kicker: "01",
    title: "По районам",
    links: [
      catalogLink("Квартиры в Камброде", "/kvartiry", { category: "flat", q: "Камброд" }),
      catalogLink("Квартиры в Артёмовском районе", "/kvartiry", { category: "flat", q: "Артемовский" }),
      catalogLink("Квартиры в Ленинском районе", "/kvartiry", { category: "flat", q: "Ленинский" }),
      catalogLink("Дома в Камброде", "/doma", { category: "house", q: "Камброд" }),
    ],
  },
  {
    kicker: "02",
    title: "По улицам",
    links: [
      catalogLink("Квартиры на улице Оборонной", "/kvartiry", { category: "flat", q: "Оборонная" }),
      catalogLink("Квартиры на Советской", "/kvartiry", { category: "flat", q: "Советская" }),
      catalogLink("Квартиры на 16-й Линии", "/kvartiry", { category: "flat", q: "16-я Линия" }),
      catalogLink("Квартиры на Центральной улице", "/kvartiry", {
        category: "flat",
        q: "Центральная",
      }),
    ],
  },
  {
    kicker: "03",
    title: "По жилым комплексам",
    links: [
      { label: "Квартиры в ЖК «Дружба»", href: "/druzhba" },
      { label: "Квартиры в ЖК «Аура»", href: "/aura" },
      { label: "Квартиры в ЖК «Трилистник»", href: "/trilistnik" },
      { label: "Квартиры в ЖК «Центральный квартал»", href: "/centralniy" },
    ],
  },
  {
    kicker: "04",
    title: "По сценарию покупки",
    links: [
      { label: `Купить квартиру в ${tenant.cityRuLocative}`, href: "/kvartiry" },
      { label: `Купить дом в ${tenant.cityRuLocative}`, href: "/doma" },
      { label: `Новостройки ${tenant.cityRuGenitive}`, href: "/novostroyki" },
      { label: `Ипотека в ${tenant.cityRuLocative}`, href: "/ipoteka" },
    ],
  },
];

export function PopularSearchesSection() {
  return (
    <section id="section-popular-searches" className="bg-[var(--surface-card)]" aria-labelledby="section-popular-searches-title">
      <div className="mx-auto max-w-site-frame px-5 pb-16 md:pb-20 lg:pb-24">
        <div className="border-t border-[var(--border)] pt-10 md:pt-12 lg:pt-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
            <div className="shrink-0 lg:w-57.5">
              <p className="mb-2 text-caption font-extrabold uppercase tracking-emphasis text-[var(--accent)]">
                Популярные подборки
              </p>
              <h2
                id="section-popular-searches-title"
                className="text-section-title font-extrabold leading-section-title text-[var(--text-primary)]"
              >
                Часто ищут
              </h2>
            </div>

            <div className="grid flex-1 gap-x-8 gap-y-7 sm:grid-cols-2 xl:grid-cols-4">
              {popularSearchGroups.map((group) => (
                <nav
                  key={group.title}
                  className="min-w-0 border-t border-[var(--border)] pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"
                  aria-label={group.title}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-caption font-bold tabular-nums text-[var(--accent)]">{group.kicker}</span>
                    <h3 className="text-body-compact font-extrabold leading-tight-copy text-[var(--text-primary)]">{group.title}</h3>
                  </div>

                  <div className="mt-4 grid gap-2">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block text-body font-medium leading-step-body text-[var(--text-secondary)] transition hover:text-[var(--accent)]"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </nav>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function catalogLink(label: string, pathname: string, query: Record<string, string>): PopularSearchLink {
  const params = new URLSearchParams({ ...CATALOG_BASE_QUERY, ...query });

  return {
    label,
    href: `${pathname}?${params.toString()}`,
  };
}
