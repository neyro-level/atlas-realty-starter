import { kvartiryPromoContent, type LeadgenPromoContent } from "./kvartiry-promo-content";

/** Homepage-only new-building quiz. Not shared with /promo/novostroyki or other Direct landings. */
export const homeNewBuildingQuizContent = {
  ...kvartiryPromoContent,
  formPrefix: "home_new_building",
  route: "/",
  title: "Подбор новостроек в вашем городе",
  description:
    "Подберите новостройку в вашем городе на главной странице агентства недвижимости: бюджет, сроки и способ оплаты.",
  manager: {
    name: "Роман Александрович",
    role: "Эксперт по новостройкам",
    photo: "/images/leadgen/roman-aleksandrovich-new-buildings.png",
  },
  headerTrust: {
    value: "170+",
    label: "квартир в базе новостроек агентства недвижимости",
  },
  quiz: {
    title: "Подбор новостроек в вашем городе",
    expertText:
      "Ответьте на 4 коротких вопроса. Я подберу подходящие новостройки в вашем городе и помогу с ипотекой и проверкой документов.",
    expertNote:
      "Перед отправкой подборки уточню детали по телефону и предложу только релевантные варианты.",
    questionHint: "Выберите один вариант.",
    finalTitle: "Подберём новостройку под ваши параметры",
    finalText:
      "Оставьте контакты — эксперт агентства недвижимости перезвонит, уточнит детали и отправит персональную подборку новостроек.",
    successText:
      "Роман Александрович свяжется с вами в течение 10 минут, уточнит детали и отправит подборку в удобный мессенджер.",
    submitLabel: "Получить подборку",
    loadingLabel: "Отправляем...",
    formType: "home_new_building_quiz",
    messageIntro: "Клиент просит подбор новостроек в вашем городе.",
    errors: {
      noAnswer: "Выберите один из вариантов.",
      name: "Введите имя.",
      phone: "Введите номер в формате +7 (9XX) XXX-XX-XX.",
      consent: "Необходимо согласие на обработку персональных данных.",
      delay: "Подождите пару секунд и попробуйте ещё раз.",
    },
    fields: {
      nameLabel: "Ваше имя",
      namePlaceholder: "Как к вам обращаться",
      phoneLabel: "Номер телефона",
      phonePlaceholder: "+7 (___) ___-**-**",
    },
    steps: [
      {
        key: "purchaseGoal",
        label: "Цель покупки",
        question: "Для чего ищете новостройку?",
        options: [
          "Для себя и семьи",
          "Для сдачи в аренду",
          "Как инвестицию",
          "Пока присматриваюсь",
        ],
      },
      {
        key: "budget",
        label: "Бюджет",
        question: "Какой у вас бюджет?",
        options: ["До 4 млн", "4–6 млн", "6–8 млн", "От 8 млн", "Нужна консультация"],
      },
      {
        key: "paymentMethod",
        label: "Способ оплаты",
        question: "Как планируете оплачивать?",
        options: ["Ипотека", "Военная ипотека или сертификаты", "Наличные", "Нужна помощь с одобрением"],
      },
      {
        key: "timeline",
        label: "Сроки",
        question: "Когда планируете покупку?",
        options: [
          "В ближайший месяц",
          "В течение 3 месяцев",
          "В течение полугода",
          "Пока изучаю варианты",
        ],
      },
    ],
  },
} as const satisfies LeadgenPromoContent;
