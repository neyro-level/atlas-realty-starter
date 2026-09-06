import type { SiteIdentity } from "@starter/site-contracts";
import { siteExpert } from "@/project/site-expert";
import { clientEnv } from "@/project/public-env";

const configuredUrl = clientEnv.siteUrl;
const configuredIndexable = clientEnv.indexable;

export const siteIdentity: SiteIdentity = {
  brand: "АТЛАС",
  legalName: null,
  projectName: "АТЛАС — стартовый сайт агентства недвижимости",
  tagline: "Навигация в мире недвижимости",
  city: {
    nominative: "Ваш город",
    genitive: "вашего города",
    prepositional: "вашем городе",
    slug: "city",
  },
  domain: configuredUrl || "http://localhost:3000",
  indexable: configuredIndexable,
  expert: siteExpert,
  contacts: {
    phone: null,
    email: null,
    address: null,
    hours: null,
  },
  social: {
    telegram: null,
    max: null,
    vk: null,
  },
  legal: {
    name: null,
    inn: null,
    registrationNumber: null,
  },
};
