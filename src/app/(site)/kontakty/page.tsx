import type { Metadata } from "next";
import Image, { type ImageProps } from "next/image";
import { ArrowUpRight } from "lucide-react";
import type { ContactsPageDto } from "@starter/site-contracts";
import { type SiteImageRendererProps } from "@starter/site-ui/contracts";
import { ContactsPageView } from "./ContactsPageView";
import { siteConfig } from "@/project/site-config";
import { routes } from "@/project/routes";
import { getSiteEngine } from "@/site-engine";
import { ContactsMapFrame } from "./ContactsMapFrame";
import { OfficeNavigatorRouteLink } from "./OfficeNavigatorRouteLink";
import { OfficePhoneReveal } from "./OfficePhoneReveal";
import { tenant } from "@/project/tenant.config";

const officeService = "Покупка, продажа и консультации по сделкам";

export const metadata: Metadata = {
  title: `Офисы в ${tenant.cityRuLocative}`,
  description: `Офисы агентства недвижимости в ${tenant.cityRuLocative}: адреса, телефон, график работы и запись на встречу.`,
  alternates: { canonical: routes.contacts() },
  openGraph: {
    title: `Офисы в ${tenant.cityRuLocative}`,
    description: `Офисы агентства недвижимости в ${tenant.cityRuLocative}: адреса, телефон, график работы и запись на встречу.`,
    url: routes.contacts(),
    siteName: siteConfig.clientFullName,
    type: "website",
  },
};

export default async function ContactsPage() {
  const engine = await getSiteEngine();
  const [shell, offices] = await Promise.all([engine.getShell(), engine.getOffices()]);
  const publicContacts = shell.contacts;
  const mapSrc = offices.find((office) => office.mapUrl)?.mapUrl ?? null;
  const page: ContactsPageDto = {
    title: `Офисы в ${tenant.cityRuLocative}`,
    serviceLabel: officeService,
    contacts: publicContacts,
    offices,
    mapTitle: `Карта офисов ${siteConfig.clientName}`,
    mapSrc,
  };
  const phoneActions = Object.fromEntries(offices.map((office) => [
    office.id,
    <OfficePhoneReveal key={office.id} phone={publicContacts.phone} phoneHref={publicContacts.phoneHref} office={office.id} />,
  ]));
  const routeActions = Object.fromEntries(offices.map((office) => [
    office.id,
    <OfficeNavigatorRouteLink key={office.id} address={office.address}>
      <span className="inline-flex min-h-10 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-3 text-support font-semibold leading-compact-copy text-[var(--text-primary)] transition hover:border-[var(--accent)] hover:text-[var(--accent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)] lg:hidden">
        Маршрут в Яндекс.Навигаторе
        <ArrowUpRight className="size-4 shrink-0" aria-hidden />
      </span>
    </OfficeNavigatorRouteLink>,
  ]));

  return (
    <ContactsPageView
      page={page}
      phoneActions={phoneActions}
      routeActions={routeActions}
      map={mapSrc ? <ContactsMapFrame title={page.mapTitle} src={mapSrc} /> : null}
      imageRenderer={ContactsImage}
    />
  );
}

function ContactsImage({ alt, ...props }: SiteImageRendererProps) {
  return <Image alt={alt} {...props as Omit<ImageProps, "alt">} />;
}
