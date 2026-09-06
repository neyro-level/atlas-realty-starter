import type { LucideIcon } from "lucide-react";
import {
  BadgeRussianRuble,
  Building2,
  Calculator,
  KeyRound,
  UserRoundSearch,
  Waves,
} from "lucide-react";
import { siteExpert } from "@/project/site-expert";

export type HomeCollectionCard = {
  title: string;
  href: string;
  icon: LucideIcon;
  queryKey: "flat" | "novostroy" | "house" | "land" | "commercial" | "sale";
};

export type HomeServiceAction = {
  title: string;
  icon: LucideIcon;
  href?: string;
  modal?: {
    variant?: "quiz" | "request";
    title?: string;
    subtitle?: string;
    source: string;
    formType: string;
    submitLabel?: string;
  };
};

export type HomeDirectorStatement = {
  eyebrow: string;
  titleLines: string[];
  paragraphs: string[];
  stats: {
    value: string;
    label: string;
  }[];
  photoBadge: string;
};


export type HomeDirector = {
  eyebrow: string;
  name: string;
  role: string;
  quote: string;
  image: string;
};

export const HOME_HERO_BRIEF = {
  eyebrow: "— АГЕНТСТВО НЕДВИЖИМОСТИ АТЛАС",
  title: "Проверенная недвижимость в Краснодаре",
  leadLines: [
    "Помогаем купить готовое жилье, подобрать новостройку от 2%",
    "или выгодно продать ваш объект.",
  ],
  cta: "Подобрать проверенный объект",
  trustLine: "19 лет на рынке  ·  0 оспоренных сделок  ·  Проверка по 40 параметрам",
} as const;

/** Fixed marketing visual for the hero featured card (title/price/link stay dynamic). */
export const HOME_HERO_FEATURED_IMAGE = "/images/agency-home-secondary-hero.webp";

export const HOME_SERVICE_ACTIONS: HomeServiceAction[] = [
  {
    title: "Подобрать новостройку",
    icon: Building2,
    modal: {
      variant: "quiz",
      source: "home-services:new-building-quiz",
      formType: "home_new_building_quiz",
    },
  },
  {
    title: "Подобрать агента",
    href: "/sotrudniki",
    icon: UserRoundSearch,
  },
  {
    title: "Выбрать квартиру",
    href: "/kvartiry",
    icon: KeyRound,
  },
  {
    title: "Рассчитать ипотеку",
    href: "/ipoteka",
    icon: Calculator,
  },
  {
    title: "Продать квартиру",
    href: "/prodazha-nedvizhimosti",
    icon: BadgeRussianRuble,
  },
  {
    title: "Квартиры на море",
    href: "/kvartiry",
    icon: Waves,
  },
];

export const HOME_DIRECTOR: HomeDirector = {
  eyebrow: "Основатель агентства",
  name: siteExpert.name,
  role: siteExpert.role,
  quote: "«Мы не продаём недвижимость. Мы обеспечиваем безопасность сделки.»",
  image: siteExpert.portrait,
};

export const HOME_DIRECTOR_STATEMENT: HomeDirectorStatement = {
  eyebrow: "Основатель агентства",
  titleLines: ["Личную ответственность", "за сделки в агентстве", "я беру на себя"],
  paragraphs: [
    "19 лет в недвижимости.",
    "Я не раз видел, как сделка срывалась перед самым подписанием — просто потому что документы вовремя не проверили. Поэтому появился стандарт безопасной сделки: проверка объекта по 40 параметрам до того, как вы отдадите деньги.",
    "Продаём быстро — за объектом работает вся команда, а не один агент. И мы постоянно ищем новые способы продвижения, чтобы объект не месяцами висел в базе.",
    "Если мы берёмся за вашу покупку — значит, всё в порядке. И я лично за это отвечаю.",
  ],
  stats: [
    { value: "19", label: "лет на рынке" },
    { value: "500+", label: "сделок закрыто" },
    { value: "0", label: "оспоренных сделок" },
  ],
  photoBadge: "с 2007",
};
