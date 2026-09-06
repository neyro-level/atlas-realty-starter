import { newBuildingsPromoContent } from "./new-buildings-promo-content";
import type { LeadgenPromoContent } from "./kvartiry-promo-content";

export const izhsPromoContent = {
  ...newBuildingsPromoContent,
  formPrefix: "leadgen_izhs_promo",
  route: "/promo/stroitelstvo-domov",
  title: "Строительство домов в вашем городе",
  description:
    "Рассчитайте стоимость строительства дома в вашем городе и получите каталог популярных проектов агентства недвижимости.",
  heroBackgroundImage: "/images/agency-home-houses.jpg",
  hideAfterRequest: true,
  hideBaseSection: true,
  hideBonusSection: true,
  hideStandardExamples: true,
  hero: {
    eyebrow: "Строительство домов в вашем городе и пригороде",
    h1: "Рассчитайте точную стоимость строительства вашего дома за 1 минуту и получите фиксированную смету без скрытых доплат",
    h1Accent: "фиксированную смету без скрытых доплат",
    subtitle:
      "Пройдите короткий тест. Мы не называем «цены с потолка». Вы получите реальный расчет по проверенным проектам с гарантией сроков и фиксацией цены в договоре.",
    cta: "Рассчитать стоимость и получить каталог проектов",
    microtext: "Это бесплатно. Расчет и каталог из 5 популярных проектов",
    modalTitle: "Рассчитать стоимость строительства дома",
    modalSubtitle:
      "Оставьте контакты. Специалист агентства недвижимости уточнит параметры дома и подготовит расчет по проверенным проектам.",
    badge: "Построено в вашем городе, 2024 г.",
  },
  headerTrust: {
    value: "",
    label: "Строительство домов в вашем городе",
  },
  headerRequest: {
    subtitle:
      "Оставьте контакты. Специалист перезвонит и поможет рассчитать строительство дома в вашем городе.",
    message:
      "Клиент просит звонок по расчету строительства дома в вашем городе.",
  },
  manager: {
    ...newBuildingsPromoContent.manager,
    name: "Специалист агентства недвижимости",
    role: "Эксперт по строительству домов",
  },
  quiz: {
    ...newBuildingsPromoContent.quiz,
    title: "Бесплатный расчет строительства дома",
    expertText:
      "Отвечайте на вопросы. Я помогу рассчитать стоимость каменного дома, подберу подходящий проект и покажу, из чего складывается фиксированная смета.",
    expertNote:
      "Перед отправкой расчета я уточню детали по телефону и подготовлю только реалистичные варианты по вашему бюджету.",
    finalTitle: "Подготовим расчет по вашему дому",
    finalText:
      "Мы посчитаем стоимость по проверенным проектам, покажем ключевые статьи сметы и объясним, какие решения влияют на итоговый бюджет строительства.",
    successText:
      "Специалист агентства недвижимости свяжется с вами в течение 10 минут, уточнит детали и отправит расчет в мессенджер.",
    submitLabel: "Получить расчет",
    formType: "leadgen_izhs_promo_quiz",
    messageIntro: "Клиент просит расчет стоимости строительства дома в вашем городе.",
    steps: [
      {
        key: "houseArea",
        label: "Площадь дома",
        question: "Какую площадь дома рассматриваете?",
        options: ["До 80 м²", "До 110 м²", "До 150 м²", "Пока не определились"],
      },
      {
        key: "material",
        label: "Материал",
        question: "Из какого материала хотите строить?",
        options: ["Газоблок", "Кирпич", "Керамический блок", "Нужна консультация"],
      },
      {
        key: "landPlot",
        label: "Участок",
        question: "У вас уже есть участок?",
        options: ["Есть в вашем городе", "Есть в пригороде", "Подбираю участок", "Пока участка нет"],
      },
      {
        key: "timeline",
        label: "Сроки",
        question: "Когда планируете начать строительство?",
        options: ["В ближайшие 3 месяца", "В течение полугода", "В течение года", "Пока считаю бюджет"],
      },
    ],
  },
  examplesTitle: "Примеры реализованных\nпроектов в вашем городе",
  constructionExamples: [
    {
      id: "gasoblock-100",
      material: "Дом из газоблока",
      area: "100 м²",
      buildTime: "4-5 месяцев",
      priceFrom: "от 5 544 000 ₽",
      image: "/images/construction-projects/project-104-1.jpg",
      imageAlt: "Проект дома из газоблока в вашем городе",
    },
    {
      id: "brick-120",
      material: "Кирпичный дом",
      area: "120 м²",
      buildTime: "6-8 месяцев",
      priceFrom: "от 6 900 000 ₽",
      image: "/images/construction-projects/project-101-1.jpg",
      imageAlt: "Кирпичный проект дома в вашем городе",
    },
    {
      id: "keramoblock-80",
      material: "Дом из керамоблока",
      area: "80 м²",
      buildTime: "3-4 месяца",
      priceFrom: "от 4 592 000 ₽",
      image: "/images/construction-projects/project-111-1.jpg",
      imageAlt: "Проект дома из керамоблока в вашем городе",
    },
  ],
  finalCta: {
    title: "Пройдите тест за 1 минуту и получите расчет стоимости вашего дома",
    image: "/images/construction-projects/project-101-1.jpg",
    imageAlt: "Проект дома агентства недвижимости для расчета строительства в вашем городе",
    bullets: [
      {
        text: "Это бесплатно и ни к чему вас не обязывает",
        icon: "check",
      },
      {
        text: "Наш инженер свяжется с вами, кратко уточнит детали участка и отправит расчет в мессенджер",
        icon: "check",
      },
    ],
    microtext: "",
    cta: "Рассчитать стоимость и получить каталог",
    formType: "leadgen_izhs_promo_final_quiz",
    modalTitle: "Рассчитать стоимость строительства дома",
    source: "leadgen_yandex_direct",
  },
} as const satisfies LeadgenPromoContent;
