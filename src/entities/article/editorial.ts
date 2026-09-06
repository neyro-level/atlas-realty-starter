import type { ArticleSummary } from "./model";
import { tenant } from "@/project/tenant";

export type EditorialLink = {
  label: string;
  href: string;
  description: string;
};

export type ArticleTopicKey = "buying" | "selling" | "doma" | "ipoteka" | "stroitelstvo" | "uchastki" | "novostroyki";

export type ArticleEditorialMeta = {
  topic: ArticleTopicKey;
  topicLabel: string;
  eyebrow: string;
  summary: string;
  keywords: string[];
  relatedRoutes: EditorialLink[];
  manualSelections: EditorialLink[];
  /** 2-3 contextual links shown inside the article flow after the body text */
  inlineLinks: EditorialLink[];
  /** 3 pre-footer cards shown below the CTA block */
  footerLinks: EditorialLink[];
  cta: {
    title: string;
    text: string;
    label: string;
    href: string;
  };
};

export type EditorialHubCard = {
  title: string;
  text: string;
  href: string;
  label: string;
};

const editorialHubCards: Record<ArticleTopicKey, EditorialHubCard> = {
  buying: {
    title: "Покупка квартиры через осмысленный маршрут",
    text: "Не общий поток объявлений, а связка статьи, продуктовой страницы квартир и специалистов агентства недвижимости.",
    href: "/kvartiry",
    label: "Открыть квартирный маршрут",
  },
  selling: {
    title: "Продажа объекта как управляемый процесс",
    text: "Статьи должны вести не в абстрактный блог, а в сервисный контур подготовки, переговоров и сопровождения сделки.",
    href: "/prodazha-nedvizhimosti",
    label: "Открыть маршрут продажи",
  },
  doma: { title: "Дома в вашем городе: подбор и проверка", text: "Два объекта в одной сделке: дом и земля. Маршрут проверки документов и безопасной покупки.", href: "/doma", label: "Смотреть дома" },
  ipoteka: { title: "Ипотечный маршрут", text: "Выбор программы, объекта и условий.", href: "/ipoteka", label: "Открыть ипотечный центр" },
  stroitelstvo: { title: "Строительство дома", text: "Участок, смета и этапы до договора.", href: "/stroitelstvo", label: "Открыть строительство" },
  uchastki: { title: "Участки и земля", text: "Выбор и проверка земли до покупки.", href: "/zemelnye-uchastki", label: "Открыть участки" },
  novostroyki: { title: "Новостройки и ЖК", text: "Выбор ЖК, квартиры и ипотечного сценария.", href: "/novostroyki", label: "Открыть новостройки" },
};

export function getArticleEditorialMeta(slug: string) {
  return getJournalMeta(slug);
}

type JournalEntry = {
  topic: ArticleTopicKey;
  topicLabel: string;
  href: string;
  cta: ArticleEditorialMeta["cta"];
  inlineLinks: EditorialLink[];
  footerLinks: EditorialLink[];
};

const topicCta: Record<ArticleTopicKey, ArticleEditorialMeta["cta"]> = {
  buying: {
    title: "Нашли квартиру — давайте разберём её вместе",
    text: "Расскажите, что смотрите: адрес, тип объекта, кто продаёт. Проверим документы и скажем, на что обратить внимание до аванса.",
    label: "Обсудить квартиру",
    href: "/kvartiry",
  },
  selling: {
    title: "Готовите объект к продаже?",
    text: "Расскажите, что за недвижимость и какая ситуация. Разберём маршрут: цена, документы, показы и безопасный расчёт.",
    label: "Обсудить продажу",
    href: "/prodazha-nedvizhimosti",
  },
  doma: {
    title: "Нашли дом, который нравится?",
    text: "Расскажите адрес или покажите объявление. Проверим документы на дом и землю, скажем, что смотреть до аванса.",
    label: "Обсудить дом с агентством недвижимости",
    href: "/doma",
  },
  ipoteka: {
    title: "Считаем ипотеку под ваш конкретный объект",
    text: "Скажите, что рассматриваете: новостройку, вторичку или дом. Подберём программу и рассчитаем реальный платёж без лишних звонков в банки.",
    label: "Рассчитать ипотеку",
    href: "/ipoteka",
  },
  stroitelstvo: {
    title: "Есть участок или сценарий стройки?",
    text: "Расскажите, что планируете. Разберём, с чего начать и какие вопросы закрыть до договора с подрядчиком.",
    label: "Обсудить стройку",
    href: "/stroitelstvo",
  },
  uchastki: {
    title: "Нашли участок — проверим документы",
    text: "Расскажите адрес или что смотрите. Скажем, что нужно проверить и какие риски реальные именно в вашем случае.",
    label: "Обсудить участок",
    href: "/zemelnye-uchastki",
  },
  novostroyki: {
    title: "Выбираете ЖК — помогаем сравнить",
    text: "Расскажите, что рассматриваете. Сравним по застройщику, срокам сдачи и ипотечным условиям, которые реально действуют.",
    label: "Обсудить новостройку",
    href: "/novostroyki",
  },
};

function getJournalMeta(slug: string): ArticleEditorialMeta | null {
  const entries: Record<string, JournalEntry> = {
    "kak-proverit-kvartiru-pered-pokupkoy": {
      topic: "buying", topicLabel: "Квартиры", href: "/kvartiry", cta: topicCta.buying,
      inlineLinks: [
        { label: "Документы при покупке квартиры", href: "/journal/dokumenty-pri-pokupke-kvartiry", description: "Какие бумаги смотреть, что спрашивать у продавца и как устроена безопасная сделка." },
        { label: "Безопасная сделка", href: "/bezopasnaya-sdelka", description: "Как агентство проверяет сделки: согласованный стандарт проверки." },
        { label: "Квартиры в вашем городе", href: "/kvartiry", description: "Витрина проверенных квартир с подбором по бюджету и комнатности." },
      ],
      footerLinks: [
        { label: "Квартиры в вашем городе", href: "/kvartiry", description: "Подобрать квартиру с проверкой документов через «АТЛАС»." },
        { label: "Документы при покупке квартиры", href: "/journal/dokumenty-pri-pokupke-kvartiry", description: "Полный список документов, которые нужно проверить до аванса." },
        { label: "Юрист по недвижимости в вашем городе", href: "/yurist", description: "Проверка документов, собственников, обременений и рисков до аванса." },
      ],
    },
    "dokumenty-pri-pokupke-kvartiry": {
      topic: "buying", topicLabel: "Квартиры", href: "/kvartiry", cta: topicCta.buying,
      inlineLinks: [
        { label: "Как проверить квартиру перед покупкой", href: "/journal/kak-proverit-kvartiru-pered-pokupkoy", description: "Чек-лист проверки квартиры: с чего начинать и что смотреть до показа." },
        { label: "Безопасная сделка", href: "/bezopasnaya-sdelka", description: "Стандарт проверки: документы, собственники, история объекта и безопасный расчёт." },
        { label: "Ипотека в вашем городе", href: "/ipoteka", description: "Программы, платёж, банки и помощь с одобрением." },
      ],
      footerLinks: [
        { label: "Квартиры в вашем городе", href: "/kvartiry", description: "Проверенные квартиры с маршрутом сделки от агентства недвижимости." },
        { label: "Безопасная сделка", href: "/bezopasnaya-sdelka", description: "Как устроена юридическая проверка сделки." },
        { label: "Юрист по недвижимости в вашем городе", href: "/yurist", description: "Юридическая помощь с документами, регистрацией права и сопровождением сделки." },
      ],
    },
    "kak-my-pomogaem-kupit-kvartiru": {
      topic: "buying",
      topicLabel: "Квартиры",
      href: "/kvartiry",
      cta: {
        title: "Хотите посмотреть подходящие варианты?",
        text: "Позвоните нам или оставьте заявку - подберём объекты под ваш запрос и организуем показ уже в ближайшие дни.",
        label: "Оставить заявку",
        href: "/kvartiry",
      },
      inlineLinks: [
        { label: "Квартиры в вашем городе", href: "/kvartiry", description: "Витрина проверенных квартир с подбором по бюджету и комнатности." },
        { label: "Безопасная сделка", href: "/bezopasnaya-sdelka", description: "Как агентство проверяет сделки: согласованный стандарт проверки." },
        { label: "Ипотека в вашем городе", href: "/ipoteka", description: "Программы, платёж, банки и помощь с одобрением." },
      ],
      footerLinks: [
        { label: "Квартиры в вашем городе", href: "/kvartiry", description: "Подобрать квартиру с проверкой документов через «АТЛАС»." },
        { label: "Новостройки вашего города", href: "/novostroyki", description: "ЖК, цены, ипотека по актуальным программам и квартиры в строящихся домах." },
        { label: "Юрист по недвижимости", href: "/yurist", description: "Наследство, перепланировки и сопровождение сделок." },
      ],
    },
    "etapy-stroitelstva-doma": {
      topic: "stroitelstvo", topicLabel: "Строительство", href: "/stroitelstvo", cta: topicCta.stroitelstvo,
      inlineLinks: [
        { label: "Как выбрать участок под строительство", href: "/journal/kak-vybrat-uchastok-pod-stroitelstvo", description: "Назначение земли, границы, подъезд и документы, которые нужно проверить до покупки." },
        { label: "Смета на строительство дома", href: "/journal/smeta-na-stroitelstvo-doma", description: "Что смотреть в смете, как она должна быть структурирована и на что не соглашаться." },
        { label: "Строительство домов в вашем городе", href: "/stroitelstvo", description: "Строительство под ключ с льготной льготная ипотека." },
      ],
      footerLinks: [
        { label: "Строительство домов в вашем городе", href: "/stroitelstvo", description: "Построить дом под ключ под льготную ипотеку." },
        { label: "Земельные участки в вашем городе", href: "/zemelnye-uchastki", description: "Подобрать участок под строительство с проверкой документов." },
        { label: "Ипотека в вашем городе", href: "/ipoteka", description: "Ипотека на строительство дома: программы и расчёт платежа." },
      ],
    },
    "smeta-na-stroitelstvo-doma": {
      topic: "stroitelstvo", topicLabel: "Строительство", href: "/stroitelstvo", cta: topicCta.stroitelstvo,
      inlineLinks: [
        { label: "Этапы строительства частного дома", href: "/journal/etapy-stroitelstva-doma", description: "Что происходит от первого колышка до приёмки и как контролировать подрядчика." },
        { label: "Как выбрать участок для строительства", href: "/journal/kak-vybrat-uchastok-pod-stroitelstvo", description: "Семь проверок, которые нужно пройти до покупки земли под стройку." },
        { label: "Строительство домов в вашем городе", href: "/stroitelstvo", description: "Строительство под ключ с сопровождением от агентства недвижимости." },
      ],
      footerLinks: [
        { label: "Строительство домов в вашем городе", href: "/stroitelstvo", description: "Дом под ключ от участка до ввода в эксплуатацию." },
        { label: "Земельные участки в вашем городе", href: "/zemelnye-uchastki", description: "Участки под строительство: каталог и проверка документов." },
        { label: "Безопасная сделка", href: "/bezopasnaya-sdelka", description: "Проверка договора с подрядчиком и сделки с землёй." },
      ],
    },
    "kak-vybrat-ipoteku": {
      topic: "ipoteka", topicLabel: "Ипотека", href: "/ipoteka", cta: topicCta.ipoteka,
      inlineLinks: [
        { label: "Как выбрать квартиру в ипотеку", href: "/journal/kak-vybrat-kvartiru-v-ipoteku", description: "7 критериев, по которым банк одобрит объект и не откажет перед сделкой." },
        { label: "Новостройки вашего города под актуальную ипотечную программу", href: "/novostroyki", description: "ЖК, которые подходят под льготную ипотечную программу." },
        { label: "Ипотека в вашем городе", href: "/ipoteka", description: "Ипотечный центр агентства недвижимости: программы, банки и помощь с одобрением." },
      ],
      footerLinks: [
        { label: "Ипотека в вашем городе", href: "/ipoteka", description: "Программы, платёж и сопровождение ипотечной сделки." },
        { label: "Новостройки вашего города", href: "/novostroyki", description: "ЖК под актуальную ипотечную программу: цены, сроки, планировки." },
        { label: "Квартиры в вашем городе", href: "/kvartiry", description: "Готовые квартиры под ипотеку на вторичном рынке." },
      ],
    },
    "kak-vybrat-kvartiru-v-ipoteku": {
      topic: "ipoteka", topicLabel: "Ипотека", href: "/ipoteka", cta: topicCta.ipoteka,
      inlineLinks: [
        { label: "Как выбрать ипотеку для покупки жилья", href: "/journal/kak-vybrat-ipoteku", description: "Программы, банки, первый взнос и условия, на которые стоит обращать внимание." },
        { label: "Как проверить квартиру перед покупкой", href: "/journal/kak-proverit-kvartiru-pered-pokupkoy", description: "Проверка документов, собственника и рисков объекта до аванса." },
        { label: "Ипотека в вашем городе", href: "/ipoteka", description: "Программы для вторичного жилья, новостроек, домов и строительства." },
      ],
      footerLinks: [
        { label: "Ипотека в вашем городе", href: "/ipoteka", description: "Разобраться с программой, платежом и банком." },
        { label: "Квартиры в вашем городе", href: "/kvartiry", description: "Квартиры, которые подходят под ипотеку." },
        { label: "Безопасная сделка", href: "/bezopasnaya-sdelka", description: "Проверка объекта и сделки до выдачи кредита." },
      ],
    },
    "kak-vybrat-uchastok-pod-stroitelstvo": {
      topic: "uchastki", topicLabel: "Участки", href: "/zemelnye-uchastki", cta: topicCta.uchastki,
      inlineLinks: [
        { label: "Как проверить земельный участок перед покупкой", href: "/journal/kak-proverit-zemelnyy-uchastok", description: "Чек-лист: права, границы, назначение, ограничения и что уточнить до аванса." },
        { label: "Этапы строительства частного дома", href: "/journal/etapy-stroitelstva-doma", description: "Что будет после покупки участка: порядок строительства и контроль работ." },
        { label: "Земельные участки в вашем городе", href: "/zemelnye-uchastki", description: "Каталог участков под строительство с проверкой документов." },
      ],
      footerLinks: [
        { label: "Земельные участки в вашем городе", href: "/zemelnye-uchastki", description: "Подобрать участок под строительство или дачу." },
        { label: "Строительство домов в вашем городе", href: "/stroitelstvo", description: "Что будет после покупки участка: дом под ключ." },
        { label: "Безопасная сделка", href: "/bezopasnaya-sdelka", description: "Проверка документов на землю и сделки с участком." },
      ],
    },
    "kak-proverit-zemelnyy-uchastok": {
      topic: "uchastki", topicLabel: "Участки", href: "/zemelnye-uchastki", cta: topicCta.uchastki,
      inlineLinks: [
        { label: "Как выбрать участок для строительства дома", href: "/journal/kak-vybrat-uchastok-pod-stroitelstvo", description: "Семь проверок, которые нужно пройти до того, как подписать договор." },
        { label: "Безопасная сделка", href: "/bezopasnaya-sdelka", description: "Как «АТЛАС» проверяет сделки с землёй и что входит в стандарт." },
        { label: "Земельные участки в вашем городе", href: "/zemelnye-uchastki", description: "Каталог участков и помощь с проверкой документов на землю." },
      ],
      footerLinks: [
        { label: "Земельные участки в вашем городе", href: "/zemelnye-uchastki", description: "Проверенные участки с маршрутом сделки от агентства недвижимости." },
        { label: "Строительство домов в вашем городе", href: "/stroitelstvo", description: "Построить дом на выбранном участке." },
        { label: "Юрист по земельным вопросам в вашем городе", href: "/yurist", description: "Межевание, приватизация участка, ошибки в документах на землю." },
      ],
    },
    "kak-vybrat-novostroyku": {
      topic: "novostroyki", topicLabel: "Новостройки", href: "/novostroyki", cta: topicCta.novostroyki,
      inlineLinks: [
        { label: "Как выбрать квартиру в новостройке", href: "/journal/kak-vybrat-kvartiru-v-novostroyke", description: "Планировка, этаж, инфраструктура и документы, которые нужно запросить у застройщика." },
        { label: "Как выбрать ипотеку для покупки жилья", href: "/journal/kak-vybrat-ipoteku", description: "Как устроена ипотека по актуальным программам и что нужно проверить до одобрения." },
        { label: "Новостройки вашего города", href: "/novostroyki", description: "Актуальные ЖК: цены, сроки, планировки и ипотека по актуальным программам." },
      ],
      footerLinks: [
        { label: "Новостройки вашего города", href: "/novostroyki", description: "Все ЖК вашего города: цены, сроки сдачи, ипотека по актуальным программам." },
        { label: "Ипотека в вашем городе", href: "/ipoteka", description: "Разобраться с ипотечными программами для новостройки." },
        { label: "Квартиры в вашем городе", href: "/kvartiry", description: "Готовые квартиры — как альтернатива новостройке." },
      ],
    },
    "kak-vybrat-kvartiru-v-novostroyke": {
      topic: "novostroyki", topicLabel: "Новостройки", href: "/novostroyki", cta: topicCta.novostroyki,
      inlineLinks: [
        { label: "Как выбрать новостройку в вашем городе", href: "/journal/kak-vybrat-novostroyku", description: "С чего начать: район, застройщик, срок и ипотечный сценарий." },
        { label: "Как выбрать ипотеку для покупки жилья", href: "/journal/kak-vybrat-ipoteku", description: "Ипотека по актуальным программам, условия банков и что проверить до одобрения." },
        { label: "Новостройки вашего города", href: "/novostroyki", description: "Актуальные ЖК с ценами, сроками и ипотекой." },
      ],
      footerLinks: [
        { label: "Новостройки вашего города", href: "/novostroyki", description: "ЖК, квартиры и ипотека по актуальным программам от агентства недвижимости." },
        { label: "Ипотека в вашем городе", href: "/ipoteka", description: "Ипотека на новостройку: программы и одобрение." },
        { label: "Безопасная сделка", href: "/bezopasnaya-sdelka", description: "Проверка договора с застройщиком и сделки." },
      ],
    },
    // --- Волна 2 ---
    "kak-proverit-dom-pered-pokupkoy": {
      topic: "doma", topicLabel: "Дома", href: "/doma", cta: topicCta.doma,
      inlineLinks: [
        { label: "Документы при покупке дома и земли", href: "/journal/dokumenty-pri-pokupke-doma", description: "Полный список документов на строение и участок: что проверить до аванса." },
        { label: "Безопасная сделка", href: "/bezopasnaya-sdelka", description: "Как «АТЛАС» проверяет сделки с домами: согласованный стандарт проверки." },
        { label: "Дома в вашем городе", href: "/doma", description: "Каталог домов с проверкой документов через «АТЛАС»." },
      ],
      footerLinks: [
        { label: "Дома в вашем городе", href: "/doma", description: "Подобрать дом с проверкой документов." },
        { label: "Документы при покупке дома", href: "/journal/dokumenty-pri-pokupke-doma", description: "Два пакета документов: на дом и на землю под ним." },
        { label: "Юрист по земельным вопросам", href: "/yurist", description: "Когда нужна юридическая помощь с документами на дом и участок." },
      ],
    },
    "dokumenty-pri-pokupke-doma": {
      topic: "doma", topicLabel: "Дома", href: "/doma", cta: topicCta.doma,
      inlineLinks: [
        { label: "Как проверить дом перед покупкой", href: "/journal/kak-proverit-dom-pered-pokupkoy", description: "Чек-лист осмотра: документы, фундамент, коммуникации и красные флаги." },
        { label: "Безопасная сделка", href: "/bezopasnaya-sdelka", description: "Проверка документов и сделки по стандарту агентства недвижимости." },
        { label: "Юрист по земельным вопросам", href: "/yurist", description: "Межевание, приватизация, ошибки в документах на землю." },
      ],
      footerLinks: [
        { label: "Дома в вашем городе", href: "/doma", description: "Проверенные дома с маршрутом сделки." },
        { label: "Безопасная сделка", href: "/bezopasnaya-sdelka", description: "Юридическая проверка дома, земли и сделки." },
        { label: "Земельные участки в вашем городе", href: "/zemelnye-uchastki", description: "Участки под строительство, если рассматриваете стройку вместо покупки." },
      ],
    },
    "kak-prodat-kvartiru-v-gorode": {
      topic: "selling", topicLabel: "Продажа", href: "/prodazha-nedvizhimosti", cta: topicCta.selling,
      inlineLinks: [
        { label: "Продажа недвижимости в вашем городе", href: "/prodazha-nedvizhimosti", description: "Управляемый маршрут продажи от оценки до сделки." },
        { label: "Безопасная сделка", href: "/bezopasnaya-sdelka", description: "Проверка документов и безопасные расчёты для продавца." },
        { label: "Юрист по недвижимости в вашем городе", href: "/yurist", description: "Когда при продаже нужна юридическая помощь." },
      ],
      footerLinks: [
        { label: "Продажа недвижимости в вашем городе", href: "/prodazha-nedvizhimosti", description: "Продать квартиру, дом или участок через «АТЛАС»." },
        { label: "Безопасная сделка", href: "/bezopasnaya-sdelka", description: "Безопасный расчёт и проверка покупателя." },
        { label: "Отзывы клиентов агентства недвижимости", href: "/otzyvy", description: "Реальные истории о продаже и покупке недвижимости." },
      ],
    },
    "lgotnye-ipotechnye-programmy": {
      topic: "ipoteka", topicLabel: "Ипотека", href: "/ipoteka", cta: {
        title: "Хотите разобраться с льготная ипотека под конкретный объект?",
        text: "Расскажите, что рассматриваете: ЖК, квартиру, планировку. Проверим, подходит ли объект под программу, и рассчитаем реальный платёж.",
        label: "Рассчитать ипотеку",
        href: "/ipoteka",
      },
      inlineLinks: [
        { label: "Как выбрать новостройку в вашем городе", href: "/journal/kak-vybrat-novostroyku", description: "ЖК, застройщики, сроки и ипотечные сценарии." },
        { label: "Как выбрать квартиру в новостройке", href: "/journal/kak-vybrat-kvartiru-v-novostroyke", description: "Планировка, этаж, инфраструктура и документы от застройщика." },
        { label: "Новостройки вашего города под актуальную ипотечную программу", href: "/novostroyki", description: "Актуальные ЖК, цены и условия ипотечной программы." },
      ],
      footerLinks: [
        { label: "Ипотека в вашем городе", href: "/ipoteka", description: "Условия программ, расчёт платежа и помощь с одобрением." },
        { label: "Новостройки вашего города", href: "/novostroyki", description: "ЖК под ипотеку: цены, сроки, планировки." },
        { label: "Как выбрать ипотеку", href: "/journal/kak-vybrat-ipoteku", description: "Как сравнить программу, банк, первый взнос и ежемесячный платёж." },
      ],
    },
  };
  const item = entries[slug];
  return item
    ? {
        topic: item.topic,
        topicLabel: item.topicLabel,
        eyebrow: "Журнал агентства",
        summary: "Практический материал о выборе и проверке недвижимости.",
        keywords: [item.topicLabel, tenant.cityRu],
        relatedRoutes: [{ label: item.topicLabel, href: item.href, description: "Основной маршрут агентства недвижимости по теме материала." }],
        manualSelections: [],
        inlineLinks: item.inlineLinks,
        footerLinks: item.footerLinks,
        cta: item.cta,
      }
    : null;
}

export function getEditorialHubCards(articles: ArticleSummary[]) {
  const topics = new Set(
    articles
      .map((article) => getArticleEditorialMeta(article.slug)?.topic)
      .filter(Boolean) as ArticleTopicKey[],
  );

  return Array.from(topics).map((topic) => editorialHubCards[topic]);
}

export function getRelatedArticles(current: ArticleSummary, articles: ArticleSummary[], limit = 3) {
  const currentMeta = getArticleEditorialMeta(current.slug);
  const candidates = articles.filter((article) => article.slug !== current.slug);

  if (!currentMeta) {
    return candidates.slice(0, limit);
  }

  const sameTopic = candidates.filter(
    (article) => getArticleEditorialMeta(article.slug)?.topic === currentMeta.topic,
  );
  const fallback = candidates.filter(
    (article) => getArticleEditorialMeta(article.slug)?.topic !== currentMeta.topic,
  );

  return [...sameTopic, ...fallback].slice(0, limit);
}
