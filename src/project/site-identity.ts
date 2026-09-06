import type { SiteIdentity } from "@starter/site-contracts";
import { siteExpert } from "@/project/site-expert";
import { clientEnv } from "@/project/public-env";

const configuredUrl = clientEnv.siteUrl;
const configuredIndexable = clientEnv.indexable;

export const siteIdentity: SiteIdentity = {
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
  domain: configuredUrl || "http://localhost:3000",
  indexable: configuredIndexable,
  expert: siteExpert,
  contacts: {
    phone: "+7 (918) 320-99-96",
    email: "integrator-p@yandex.ru",
    address: "г. Краснодар, ул. Игнатова, 4/3, офис 10",
    hours: "Ежедневно, 9:00–20:00 (МСК)",
  },
  social: {
    telegram: null,
    max: null,
    vk: null,
  },
  legal: {
    name: "ИП Скрицкая Юлия Викторовна",
    inn: "231295699557",
    registrationNumber: "323237500365055",
  },
};

export const legalOperatorAddress = "г. Краснодар, улица им. Игнатова, дом 4/3, корп. 2";
