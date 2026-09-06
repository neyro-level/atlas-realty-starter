import { siteIdentity } from "@/project/site-identity";

export const siteConfig = {
  clientSlug: "atlas",
  clientName: siteIdentity.brand,
  clientFullName: siteIdentity.brand,
  legalName: siteIdentity.legal.name ?? "Требует настройки перед публикацией",
  projectName: siteIdentity.projectName,
  tagline: siteIdentity.tagline,
  city: siteIdentity.city.nominative,
  timezone: "Europe/Moscow",
  stagingDomain: siteIdentity.domain,
  productionDomain: siteIdentity.domain,
  defaultTitle: `Недвижимость в ${siteIdentity.city.prepositional} | ${siteIdentity.brand}`,
  defaultDescription: `${siteIdentity.brand}: квартиры, дома, новостройки, участки, коммерческая недвижимость и сопровождение сделки.`,
  logo: "/images/brand/atlas-mark.svg",
  favicon: "/favicon.ico",
  copyright: `© 2026 ${siteIdentity.legal.name ?? siteIdentity.brand}. Все права защищены.`,
  registry: siteIdentity.legal.inn ? `ИНН ${siteIdentity.legal.inn}` : "",
  disclaimer: "Информация на сайте носит справочный характер и не является публичной офертой.",
} as const;

export type SocialLink = { label: string; shortLabel: string; href?: string };

const phone = siteIdentity.contacts.phone ?? "";
const email = siteIdentity.contacts.email ?? "";

export const contactsConfig = {
  phone,
  phoneHref: phone ? `tel:${phone.replace(/[^+\d]/gu, "")}` : "",
  email,
  emailHref: email ? `mailto:${email}` : "",
  hours: siteIdentity.contacts.hours ?? "Время работы настраивается",
  callbackHref: phone ? `tel:${phone.replace(/[^+\d]/gu, "")}` : "",
  callbackLabel: "Оставить заявку",
  privacyUrl: "/politika-konfidencialnosti",
  socials: {
    telegram: { label: "Telegram", shortLabel: "TG", href: siteIdentity.social.telegram ?? undefined },
    max: { label: "Max", shortLabel: "MAX", href: siteIdentity.social.max ?? undefined },
    vk: { label: "VK", shortLabel: "VK", href: siteIdentity.social.vk ?? undefined },
  },
  offices: siteIdentity.contacts.address
    ? [{ city: siteIdentity.city.nominative, address: siteIdentity.contacts.address }]
    : [],
} as const;

export const citySwitcherConfig = {
  currentSlug: siteIdentity.city.slug,
  cities: [{
    slug: siteIdentity.city.slug,
    label: siteIdentity.city.nominative,
    href: "/",
    domainLabel: new URL(siteIdentity.domain).host,
    current: true,
  }],
} as const;

export const featuresConfig = {
  adminLite: true,
  localLeads: true,
  propertyRoute: "/obekty",
} as const;

export function getSiteUrl() { return siteIdentity.domain; }
export function isIndexable() { return siteIdentity.indexable; }
export function getPropertyPath(slug: string) { return `${featuresConfig.propertyRoute}/${slug}`; }
