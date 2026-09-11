import type { SiteProfile } from "@starter/site-contracts";
import { siteExpert } from "@/project/site-expert";
import { clientEnv } from "@/project/public-env";

const domain = clientEnv.siteUrl || "http://localhost:3000";

export const siteProfile = {
  brand: "АТЛАС",
  legalName: "ИП Скрицкая Юлия Викторовна",
  projectName: "АТЛАС — агентство недвижимости в Краснодаре",
  tagline: "Навигация в мире недвижимости",
  city: {
    nominative: "Краснодар",
    genitive: "Краснодара",
    prepositional: "Краснодаре",
    slug: "krasnodar",
  },
  domain,
  indexable: clientEnv.indexable,
  expert: siteExpert,
  contacts: {
    phone: "+7 (918) 320-99-96",
    email: "integrator-p@yandex.ru",
    address: "г. Краснодар, ул. Игнатова, 4/3, офис 10",
    hours: "Ежедневно, 9:00–20:00 (МСК)",
  },
  social: { telegram: null, max: null, vk: null },
  legal: {
    name: "ИП Скрицкая Юлия Викторовна",
    inn: "231295699557",
    registrationNumber: "323237500365055",
  },
  logo: {
    mark: "/images/brand/atlas-mark.svg",
    wordmark: null,
    favicon: "/favicon.ico",
    socialPreview: "/images/brand/atlas-social-preview.jpg",
  },
  media: {
    catalogMortgageService: "/images/catalog-mortgage-service.webp",
  },
  seo: {
    title: "Недвижимость в Краснодаре | АТЛАС",
    description: "АТЛАС: квартиры, дома, новостройки, участки, коммерческая недвижимость и сопровождение сделки.",
  },
  theme: {
    preset: "atlas-burgundy",
    primary: "var(--accent)",
    primaryHover: "var(--accent-hover)",
  },
  map: {
    provider: "yandex",
    center: [45.03547, 38.975313],
    zoom: 12,
    catalogZoom: 12,
  },
  features: {
    catalogMap: true,
    mediaGallery: true,
    requests: true,
  },
} as const satisfies SiteProfile;

export const legalOperatorAddress = "г. Краснодар, улица им. Игнатова, дом 4/3, корп. 2";
