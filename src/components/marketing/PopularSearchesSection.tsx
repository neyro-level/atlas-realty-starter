import Link from "next/link";
import { tenant } from "@/project/tenant";

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
      catalogLink("Квартиры на улице 50-летия Обороны вашего города", "/kvartiry", {
        category: "flat",
        q: "50-летия Обороны вашего города",
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
      { label: "Купить квартиру в вашем городе", href: "/kvartiry" },
      { label: "Купить дом в вашем городе", href: "/doma" },
      { label: "Новостройки вашего города", href: "/novostroyki" },
      { label: "Ипотека в вашем городе", href: "/ipoteka" },
    ],
  },
];

export function PopularSearchesSection() {
  return (
    <section id="section-popular-searches" className="bg-white" aria-labelledby="section-popular-searches-title">
      <div className="mx-auto max-w-site-frame px-5 pb-16 md:pb-20 lg:pb-24">
        <div className="border-t border-[#E3E3E1] pt-10 md:pt-12 lg:pt-14">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:gap-12">
            <div className="shrink-0 lg:w-[230px]">
              <p className="mb-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#8A1515]">
                Популярные подборки
              </p>
              <h2
                id="section-popular-searches-title"
                className="text-[28px] font-extrabold leading-[1.14] text-[#17161A] md:text-[34px] lg:text-[36px]"
              >
                Часто ищут
              </h2>
            </div>

            <div className="grid flex-1 gap-x-8 gap-y-7 sm:grid-cols-2 xl:grid-cols-4">
              {popularSearchGroups.map((group) => (
                <nav
                  key={group.title}
                  className="min-w-0 border-t border-[#E3E3E1] pt-4 lg:border-l lg:border-t-0 lg:pl-5 lg:pt-0"
                  aria-label={group.title}
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-[11px] font-bold tabular-nums text-[#8A1515]">{group.kicker}</span>
                    <h3 className="text-[15px] font-extrabold leading-tight text-[#17161A]">{group.title}</h3>
                  </div>

                  <div className="mt-4 space-y-2">
                    {group.links.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        className="block text-[14px] font-medium leading-5 text-[#413F41] transition hover:text-[#8A1515]"
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
