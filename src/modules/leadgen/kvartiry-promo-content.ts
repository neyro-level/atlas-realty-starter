import { siteIdentity } from "@/project/site-identity";
import { tenant } from "@/project/tenant";
import type { LeadgenPromoApartmentDto, LeadgenPromoConstructionExampleDto, LeadgenPromoContentDto, LeadgenPromoNewBuildingExampleDto, LeadgenQuizStepDto } from "@starter/site-contracts";

export type LeadgenPromoApartment = LeadgenPromoApartmentDto;

export type LeadgenPromoNewBuildingExample = LeadgenPromoNewBuildingExampleDto;

export type LeadgenPromoConstructionExample = LeadgenPromoConstructionExampleDto;

export type LeadgenQuizStep = LeadgenQuizStepDto;

export type LeadgenPromoContent = LeadgenPromoContentDto;

export const kvartiryPromoContent = {
  formPrefix: "leadgen_kvartiry_promo",
  route: "/promo/kvartiry",
  title: "Закрытая база квартир",
  description:
    "Оставьте заявку и получите подборку квартир из закрытой базы агентства недвижимости по вашим параметрам.",
  hero: {
    eyebrow: "Хотите выгодно купить квартиру в Краснодаре?",
    h1: "Пройдите тест за 1 минуту и получите подборку квартир из закрытой базы по Вашим параметрам",
    h1Accent: "закрытой базы",
    cta: "Пройти тест и получить подборку",
    microtext: "Это бесплатно и ни к чему Вас не обязывает",
    modalTitle: "Получить подборку квартир из закрытой базы",
    modalSubtitle: "Оставьте контакты. Специалист агентства недвижимости уточнит параметры и отправит актуальные варианты.",
  },
  afterRequestTitle: "Вы сразу получите:",
  baseSection: {
    title: "Квартиры, которых нет",
    accentTitle: "на Авито и Дом клик",
    subtitle: "Закрытая база квартир включает в себя",
    points: [
      "Уникальные предложения от собственников, которые подписали с нами договоры и доверили ключи от своих квартир",
      "База наших партнеров из других агентств, которую мы собрали для вас на единой площадке",
      "Квартиры на срочной продаже, с дисконтом до 15%. Реальные цены и понимание, какой сегодня рынок недвижимости",
      "Квартиры, в которых собственники хотят произвести обмен на встречные варианты",
    ],
    preview: {
      variant: "apartments",
      label: "Закрытая база",
      city: tenant.cityRu,
      countLabel: "4 объекта",
    },
  },
  phone: siteIdentity.contacts.phone ?? "",
  phoneHref: siteIdentity.contacts.phone
    ? "tel:" + siteIdentity.contacts.phone.replace(/[^\d+]/g, "")
    : "",
  hours: siteIdentity.contacts.hours ?? "",
  headerTrust: {
    value: "",
    label: "Подбор по параметрам вашей сделки",
  },
  manager: {
    name: siteIdentity.expert.name,
    role: siteIdentity.expert.role,
    photo: siteIdentity.expert.portrait,
  },
  quiz: {
    title: "Бесплатный подбор проверенных квартир в Краснодаре",
    expertText:
      "Отвечайте на вопросы. Я лично подберу квартиры из закрытой базы, которых нет на Авито, включая срочные продажи до 15% ниже рынка. Все варианты проверены юристами.",
    expertNote: "Подборку с реальными фото отправлю в мессенджер. Без спама и навязчивых звонков.",
    questionHint: "Выберите один вариант, чтобы мы сузили подборку.",
    finalTitle: "Мы подбираем только проверенные квартиры",
    finalText:
      "Мы отсеиваем проблемные объекты и проверяем документы по 10 параметрам. Вы получите не список «всего подряд», а только юридически чистые варианты из закрытой базы, готовые к сделке.",
    successText: "Специалист агентства недвижимости свяжется с вами в ближайшее время.",
    submitLabel: "Получить подборку",
    loadingLabel: "Отправляем...",
    messageIntro: "Клиент просит бесплатный подбор проверенных квартир в Краснодаре.",
    errors: {
      noAnswer: "Выберите один из вариантов, чтобы перейти дальше.",
      name: "Введите имя, чтобы специалист понимал, как к вам обращаться.",
      phone: "Введите российский мобильный номер в формате +7 (9XX) XXX-XX-XX.",
      consent: "Необходимо согласие на обработку персональных данных.",
      delay: "Подождите пару секунд и отправьте заявку ещё раз.",
    },
    fields: {
      nameLabel: "Ваше имя",
      namePlaceholder: "Как к вам обращаться",
      phoneLabel: "Номер телефона",
      phonePlaceholder: "+7 (___) ___-__-__",
    },
    steps: [
      {
        key: "rooms",
        label: "Комнаты",
        question: "Сколько комнат вы рассматриваете?",
        options: ["Однокомнатная", "Двухкомнатная", "Трехкомнатная", "Пока не определились"],
      },
      {
        key: "budget",
        label: "Бюджет",
        question: "В каком бюджете вы планируете покупку?",
        options: ["До 3 млн", "3-5 млн", "5-7 млн", "7-9 млн", "От 10 млн"],
      },
      {
        key: "purchasePlan",
        label: "Формат покупки",
        question: "Как вы планируете покупку?",
        options: ["За наличные", "Продаю свое жилье", "Часть наличные плюс ипотека", "Пока не решили"],
      },
      {
        key: "timeline",
        label: "Сроки",
        question: "В какие сроки планируете покупку?",
        options: ["В ближайший месяц", "В течение 2-3 месяцев", "В течение 6 месяцев", "Пока присматриваюсь"],
      },
    ],
  },
  phoneMockup:
    "https://optim.tildacdn.com/tild3638-6534-4934-b066-343837626261/-/resize/380x/-/format/webp/___1.png.webp",
  examplesTitle: "Примеры квартир из недавних подборок",
  trustItems: [
    {
      title: 'Доступ к "Закрытой базе"',
      text: "Отправим Вам 5-10 уникальных вариантов квартир подходящих по Вашим параметрам с фото, ценами и планировками",
    },
    {
      title: "Гарантию низкой цены",
      text: "В нашей базе есть предложения на срочной продаже от собственников, которые могут быть ниже рынка на 15%",
    },
    {
      title: "Гарантию надежности",
      text: "Все квартиры проверены нашими юристами по 10 различным параметрам. От отсутствия обременений, до долгов по квартплате",
    },
  ],
  baseIncludes: [
    "Уникальные предложения от собственников, которые подписали с нами договоры и доверили ключи от своих квартир",
    "База наших партнеров из других агентств, которую мы собрали для вас на единой площадке",
    "Квартиры на срочной продаже, с дисконтом до 15%. Реальные цены и понимание, какой сегодня рынок недвижимости",
    "Квартиры, в которых собственники хотят произвести обмен на встречные варианты",
  ],
  bonusItems: [
    "Бесплатное полное юридическое сопровождение сделки, в том числе проверки объекта недвижимости",
    "Бесплатное ипотечное сопровождение. Помощь в открытии ипотеки и оформлении кредита",
  ],
  apartments: [
    {
      id: "1918068",
      image:
        "https://static.tildacdn.com/tild6630-3033-4165-b933-303665316137/ac64b057-def1-421c-a.jpeg",
      images: [
        "https://static.tildacdn.com/tild6630-3033-4165-b933-303665316137/ac64b057-def1-421c-a.jpeg",
        "https://static.tildacdn.com/tild3338-3763-4933-b632-363430353933/7df31f8d-1a4b-4b22-9.jpeg",
        "https://static.tildacdn.com/tild3730-3136-4462-a434-353039323332/373d4682-626c-4c0d-b.jpeg",
        "https://static.tildacdn.com/tild3765-6265-4639-a634-366164616364/d21897b0-2b1f-49b2-9.jpeg",
        "https://static.tildacdn.com/tild6638-6238-4238-a462-653638303333/e1e65da9-3767-4097-8.jpeg",
      ],
      facts: [
        ["Количество комнат", "двухкомнатная"],
        ["Общая площадь", "44,7"],
        ["Площадь кухни", "5,0"],
        ["Отделка", "Евро ремонт"],
        ["Этаж", "4"],
        ["Этажей в доме", "5"],
        ["Тип дома", "кирпич"],
      ],
      price: "5 800 000 руб.",
    },
    {
      id: "1917970",
      image:
        "https://static.tildacdn.com/tild3638-3734-4238-b838-636532383061/98a25588-a929-48df-9.jpeg",
      images: [
        "https://static.tildacdn.com/tild3638-3734-4238-b838-636532383061/98a25588-a929-48df-9.jpeg",
        "https://static.tildacdn.com/tild6632-3139-4232-b939-643430633462/63a7f2a3-4678-4705-a.jpeg",
        "https://static.tildacdn.com/tild3765-3738-4366-a632-646365333732/3f230a56-b0a0-418d-8.jpeg",
        "https://static.tildacdn.com/tild6464-6437-4236-b930-646131366235/64af2da2-02fd-43c5-a.jpeg",
        "https://static.tildacdn.com/tild6131-3632-4863-a266-646334323362/350c2642-4546-49fd-8.jpeg",
        "https://static.tildacdn.com/tild3761-3330-4931-a263-303862393137/51102bac-acab-45fc-8.jpeg",
      ],
      facts: [
        ["Количество комнат", "однокомнатная"],
        ["Общая площадь", "33,0"],
        ["Площадь кухни", "5,5"],
        ["Отделка", "Хороший ремонт"],
        ["Этаж", "4"],
        ["Этажей в доме", "5"],
        ["Тип дома", "кирпич"],
      ],
      price: "5 750 000 руб.",
    },
    {
      id: "1917239",
      image:
        "https://static.tildacdn.com/tild6436-6164-4531-b066-333666373064/90bd7700-6a4e-41e8-a.jpeg",
      images: [
        "https://static.tildacdn.com/tild6436-6164-4531-b066-333666373064/90bd7700-6a4e-41e8-a.jpeg",
        "https://static.tildacdn.com/tild6536-6531-4333-b961-376532373035/d7dc4817-a5fc-47d7-b.jpeg",
        "https://static.tildacdn.com/tild6436-6636-4362-b833-396136313339/f2b180c6-6408-4dfa-8.jpeg",
        "https://static.tildacdn.com/tild3537-6566-4238-a533-383562396236/bab579b6-976c-4420-a.jpeg",
        "https://static.tildacdn.com/tild6134-3139-4238-b162-633037363233/b84e31f7-643c-49b4-9.jpeg",
        "https://static.tildacdn.com/tild3037-3365-4762-b761-643134366232/3d8619b4-7c74-4c2e-8.jpeg",
        "https://static.tildacdn.com/tild3831-6239-4834-a437-303261613932/f4c08abd-5d42-40c4-9.jpeg",
      ],
      facts: [
        ["Количество комнат", "двухкомнатная"],
        ["Общая площадь", "53,0"],
        ["Площадь кухни", "6,8"],
        ["Отделка", "Хороший ремонт"],
        ["Этаж", "7"],
        ["Этажей в доме", "9"],
        ["Тип дома", "панель"],
      ],
      price: "6 300 000 руб.",
    },
    {
      id: "1918954",
      image:
        "https://static.tildacdn.com/tild3463-6238-4366-a636-363464343333/7b1931f3-6f5d-44c5-a.jpeg",
      images: [
        "https://static.tildacdn.com/tild3463-6238-4366-a636-363464343333/7b1931f3-6f5d-44c5-a.jpeg",
        "https://static.tildacdn.com/tild3564-3232-4134-a433-333866643032/a6a537bd-ab13-438a-9.jpeg",
        "https://static.tildacdn.com/tild3163-3461-4064-a162-396431393535/f79b1430-bee2-47e2-9.jpeg",
        "https://static.tildacdn.com/tild3037-6263-4266-a665-643563383066/f19405f9-e091-4f3a-b.jpeg",
        "https://static.tildacdn.com/tild3730-3063-4135-b566-633664623235/fa92ec3d-2da5-4202-b.jpeg",
        "https://static.tildacdn.com/tild6235-6133-4530-b736-323336366631/547f5ace-5d3a-4e64-a.jpeg",
        "https://static.tildacdn.com/tild3363-3664-4639-a163-656631653736/f6bd7ace-c60c-47cd-b.jpeg",
        "https://static.tildacdn.com/tild6361-6430-4365-b331-353236353731/9ce7ce28-f375-45f3-b.jpeg",
      ],
      facts: [
        ["Количество комнат", "двухкомнатная"],
        ["Общая площадь", "42,0"],
        ["Площадь кухни", "6,2"],
        ["Отделка", "Хороший ремонт"],
        ["Этаж", "3"],
        ["Этажей в доме", "5"],
        ["Тип дома", "кирпич"],
      ],
      price: "6 800 000 руб.",
    },
  ],
  footerOffices: [],
} as const satisfies LeadgenPromoContent;
