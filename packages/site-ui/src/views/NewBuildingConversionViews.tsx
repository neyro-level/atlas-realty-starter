import type { NewBuildingDetailDto } from "@starter/site-contracts";
import type { LucideIcon } from "lucide-react";
import { BadgePercent, Building2, CalendarDays, CheckCircle2, Handshake, Home, Layers3, Scale, SearchCheck } from "lucide-react";
import type { ReactNode } from "react";
import { Badge } from "../components/ui/badge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Separator } from "../components/ui/separator";
import { RequestModalButton, type RequestOverlayDetail } from "../components/shared/site-overlay-context";
import type { SiteImageRenderer, SiteLinkRenderer } from "../lib/adapters";

type DetailProps = { detail: NewBuildingDetailDto };

export type NewBuildingQuickSelectionItem = {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  href?: string;
  active?: boolean;
  request?: RequestOverlayDetail;
};

export function NewBuildingQuickSelectionsView({ items, linkRenderer: Link }: { items: readonly NewBuildingQuickSelectionItem[]; linkRenderer: SiteLinkRenderer }) {
  return (
    <section className="mb-5 lg:hidden" aria-labelledby="new-building-quick-selections-title" data-new-building-quick-selections>
      <h2 id="new-building-quick-selections-title" className="text-[21px] font-extrabold leading-[1.08] md:text-[24px]">Выберите, что для вас важно</h2>
      <div className="mt-5 grid grid-cols-2 gap-2.5 md:grid-cols-4">
        {items.map((item) => {
          const content = <QuickSelectionContent item={item} />;
          const className = `grid min-h-[124px] min-w-0 grid-rows-[36px_minmax(0,1fr)] gap-4 rounded-lg border bg-[var(--surface-card-soft)] p-3.5 text-left shadow-[var(--catalog-controls-shadow-01)] transition hover:border-[var(--accent)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-offset-2 md:min-h-[132px] md:p-4 ${item.active ? "border-[var(--accent)] ring-1 ring-[var(--accent)]/10" : "border-[var(--border)]"}`;
          if (item.href) return <Link key={item.id} href={item.href} scroll={false} ariaCurrent={item.active ? "true" : undefined} className={className}>{content}</Link>;
          if (item.request) return <RequestModalButton key={item.id} type="button" unstyled request={item.request} className={className}>{content}</RequestModalButton>;
          return null;
        })}
      </div>
    </section>
  );
}

export function NewBuildingMobileCommercialView({ detail, primaryAction, mortgageAction }: DetailProps & { primaryAction: ReactNode; mortgageAction: ReactNode }) {
  const facts = [
    { icon: CalendarDays, label: "Сдача", value: detail.completionLabel ?? "Уточняется" },
    { icon: Building2, label: "Застройщик", value: detail.developerName },
    { icon: Home, label: "Квартиры", value: detail.apartmentsLabel ?? "Наличие уточняется" },
    { icon: Layers3, label: "Этажность", value: detail.floorsLabel ?? "Уточняется" },
  ];

  return (
    <section className="grid gap-3 pt-7 md:gap-4 md:pt-9 lg:hidden" aria-label={`Цены, планировки и ипотека в ${detail.name}`} data-new-building-mobile-commercial>
      <Card className="overflow-hidden rounded-lg bg-white shadow-[var(--new-building-detail-sections-shadow-02)]">
        <CardHeader className="gap-4 p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="grid gap-1">
              <p className="text-[11px] font-bold uppercase text-[var(--text-muted)]">Стоимость квартир от</p>
              <p className="text-[30px] font-extrabold leading-none tabular-nums text-[var(--text-primary)] md:text-[34px]">{formatPrice(detail.priceFrom)}</p>
            </div>
            <Badge variant="soft" className="max-w-[150px] whitespace-normal text-center">Ипотека: условия банка</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-5 pt-0 md:p-6 md:pt-0">
          <dl className="grid grid-cols-2 gap-2 md:grid-cols-4">
            {facts.map(({ icon: Icon, label, value }) => <Fact key={label} icon={Icon} label={label} value={value} />)}
          </dl>
          <div className="mt-5 rounded-lg bg-[var(--surface-card-soft)] p-4 md:p-5">
            <h2 className="text-[20px] font-extrabold leading-tight text-[var(--text-primary)] md:text-[23px]">Получите актуальные цены и планировки</h2>
            <p className="mt-2 text-sm leading-6 text-[var(--text-secondary)]">Проверим свободные квартиры в {detail.name}, запросим планировки и уточним условия покупки.</p>
          </div>
        </CardContent>
        <CardFooter className="flex-col items-stretch gap-3 p-5 pt-0 md:p-6 md:pt-0">
          {primaryAction}
          <p className="flex items-start gap-2 text-xs font-medium leading-5 text-[var(--text-secondary)]"><CheckCircle2 className="mt-0.5 size-4 shrink-0 text-[var(--status-success)]" aria-hidden />Подбор квартиры и консультация по ипотеке бесплатны для покупателя.</p>
        </CardFooter>
      </Card>

      <Card className="overflow-hidden rounded-lg border-[var(--surface-dark)] bg-[var(--surface-dark)] text-white shadow-[var(--new-building-detail-sections-shadow-02)] md:grid md:grid-cols-[minmax(0,1fr)_240px] md:items-center">
        <CardHeader className="p-5 md:p-6">
          <span className="grid size-10 place-items-center rounded-lg bg-white/10 text-white"><BadgePercent className="size-5" aria-hidden /></span>
          <CardTitle className="mt-4 text-[22px] font-extrabold leading-[1.14] text-white md:text-[25px]">Поможем разобраться с ипотекой</CardTitle>
          <CardDescription className="mt-2 text-sm leading-6 text-white/72">Сравним применимые программы, проверим документы и подготовим заявку. Решение принимает банк.</CardDescription>
          <Separator className="mt-4 bg-white/12" />
          <p className="pt-4 text-sm font-bold leading-5 text-white">Консультация бесплатна для покупателя</p>
        </CardHeader>
        <CardFooter className="p-5 pt-0 md:p-6">{mortgageAction}</CardFooter>
      </Card>
    </section>
  );
}

export function NewBuildingMobileWhyAgencyView({ detail, brand, requestAction }: DetailProps & { brand: string; requestAction: ReactNode }) {
  const icons: LucideIcon[] = [SearchCheck, BadgePercent, Scale, Handshake];
  return (
    <section className="bg-white pt-6 text-[var(--text-primary)] md:pt-7 lg:hidden" aria-labelledby="mobile-why-agency-title">
      <Card className="rounded-lg bg-[var(--surface-card-soft)] p-5 shadow-[var(--new-building-detail-sections-shadow-02)] md:p-6">
        <Badge>Бесплатный подбор</Badge>
        <h2 id="mobile-why-agency-title" className="mt-4 text-[24px] font-extrabold leading-[1.12] md:text-[28px]">Почему выгодно покупать через {brand}</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--text-secondary)]">Сравним предложения, проверим условия и поможем пройти путь до сделки без лишних рисков.</p>
        <ol className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4">
          {detail.whyAgency.map((benefit, index) => {
            const Icon = icons[index % icons.length];
            return <li key={benefit.title} className="min-w-0 rounded-lg border border-[var(--border)] bg-white p-3.5 md:p-4"><span className="grid size-9 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"><Icon className="size-[18px]" aria-hidden /></span><h3 className="mt-4 text-sm font-extrabold leading-5">{benefit.title}</h3><p className="mt-2 text-xs leading-5 text-[var(--text-secondary)]">{benefit.text}</p></li>;
          })}
        </ol>
        <div className="mt-5">{requestAction}</div>
      </Card>
    </section>
  );
}

export function NewBuildingCatalogWhyAgencyView({ brand, benefits, expertName, expertRole, portrait, imageRenderer: Image }: { brand: string; benefits: readonly string[]; expertName: string; expertRole: string; portrait: string; imageRenderer: SiteImageRenderer }) {
  return (
    <section className="bg-white pb-16 sm:pb-20 lg:pb-24" aria-labelledby="new-building-why-agency-title">
      <div className="mx-auto max-w-site-frame px-5">
        <Card className="grid overflow-hidden rounded-lg bg-[var(--surface-card-soft)] shadow-[var(--new-building-detail-sections-shadow-02)] lg:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
          <div className="flex flex-col px-5 py-10 sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <Badge className="rounded-md">Подбор и ипотечная консультация бесплатны</Badge>
            <h2 id="new-building-why-agency-title" className="mt-7 max-w-[720px] text-[30px] font-extrabold leading-[1.08] sm:text-[38px] lg:text-[46px]">Почему новостройку выбирают через <span className="text-[var(--accent)]">{brand}</span></h2>
            <p className="mt-5 max-w-[650px] text-[15px] leading-7 text-[var(--text-secondary)] sm:text-base">Смотрим на рынок целиком и остаёмся на стороне покупателя от первого сравнения до сделки.</p>
            <ol className="mt-8 sm:mt-10">
              {benefits.map((benefit, index) => <li key={benefit}><Separator /><div className="flex items-center gap-4 py-4 sm:gap-5"><span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[var(--accent-soft)] text-[11px] font-bold text-[var(--accent)]">{String(index + 1).padStart(2, "0")}</span><span className="text-[15px] font-semibold leading-[1.4] text-[var(--text-primary)] sm:text-base">{benefit}</span></div></li>)}
              <Separator />
            </ol>
          </div>
          <div className="relative min-h-[360px] overflow-hidden border-t border-[var(--border)] bg-[var(--surface-muted)] sm:min-h-[460px] lg:min-h-full lg:border-l lg:border-t-0">
            <Image src={portrait} alt={`${expertName}, ${expertRole}`} fill quality={95} sizes="(max-width: 1023px) calc(100vw - 40px), 42vw" className="object-cover object-[50%_10%] sm:object-[50%_20%] lg:object-[50%_30%]" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_52%,var(--catalog-hero-effect-02)_100%)]" />
            <div className="absolute inset-x-5 bottom-5 rounded-lg border border-white/50 bg-white/95 px-4 py-3 shadow-[var(--new-building-detail-sections-shadow-02)] backdrop-blur sm:inset-x-6 sm:bottom-6 sm:px-5 sm:py-4"><p className="text-[15px] font-bold leading-5">{expertName}</p><p className="mt-1 text-[12px] leading-5 text-[var(--text-secondary)] sm:text-[13px]">{expertRole}</p></div>
          </div>
        </Card>
      </div>
    </section>
  );
}

export function NewBuildingPurchaseProcessView({ steps }: { steps: readonly { title: string; description: string }[] }) {
  return (
    <section className="bg-[var(--surface-card-soft)] py-12 sm:py-16 lg:py-[88px]" aria-labelledby="new-building-process-title">
      <div className="mx-auto max-w-site-frame px-5">
        <h2 id="new-building-process-title" className="max-w-[880px] text-[24px] font-semibold leading-[1.1] sm:text-[30px]">Как проходит подбор и покупка: от первого обращения до сделки</h2>
        <ol className="relative mt-12 grid max-w-[900px] gap-9 before:absolute before:bottom-4 before:left-[23px] before:top-4 before:w-px before:bg-[var(--border)]">
          {steps.map((step, index) => <li key={step.title} className="relative grid grid-cols-[48px_minmax(0,1fr)] gap-5"><span className="relative z-10 flex h-[50px] items-center bg-[var(--surface-card-soft)] pr-2 text-[32px] font-light leading-none text-[var(--accent)]">{String(index + 1).padStart(2, "0")}</span><div className="pt-1"><h3 className="text-lg font-semibold leading-snug">{step.title}</h3><p className="mt-3 max-w-[720px] text-sm leading-6 text-[var(--text-secondary)]">{step.description}</p></div></li>)}
        </ol>
      </div>
    </section>
  );
}

function Fact({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return <div className="min-w-0 rounded-lg border border-[var(--border)] bg-white p-3"><span className="grid size-8 place-items-center rounded-lg bg-[var(--accent-soft)] text-[var(--accent)]"><Icon className="size-4" aria-hidden /></span><dt className="mt-3 text-[11px] font-semibold uppercase leading-4 text-[var(--text-muted)]">{label}</dt><dd className="mt-1 break-words text-sm font-bold leading-5 text-[var(--text-primary)]">{value}</dd></div>;
}

function QuickSelectionContent({ item }: { item: NewBuildingQuickSelectionItem }) {
  const Icon = item.icon;
  return <><span className="flex size-9 items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--accent-soft)] text-[var(--accent)]"><Icon className="size-[18px]" aria-hidden /></span><span className="flex min-w-0 flex-col justify-end"><strong className="block text-[14px] font-extrabold leading-[1.15]">{item.title}</strong><span className="mt-1 block text-[11px] font-medium leading-4 text-[var(--text-secondary)]">{item.description}</span></span></>;
}

function formatPrice(value: number | null) {
  if (value === null) return "уточняется";
  if (value >= 1_000_000) return `${new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 1 }).format(value / 1_000_000)} млн ₽`;
  return `${new Intl.NumberFormat("ru-RU").format(value)} ₽`;
}
