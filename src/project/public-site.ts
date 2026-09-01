export const publicSite = {
  name: 'Союз Застройщиков',
  fullName: 'Союз Застройщиков Ростов',
  city: 'Ростов-на-Дону',
  defaultDescription:
    'Новостройки, готовые квартиры, строительство и ипотека в Ростове-на-Дону с проверкой условий и сопровождением сделки.',
} as const

export const publicNavigation = [
  {
    label: 'Недвижимость',
    href: '/novostroyki-rostova',
    children: [
      { label: 'Новостройки Ростова', href: '/novostroyki-rostova' },
      { label: 'Готовые квартиры', href: '/kvartiry-rostova' },
      { label: 'Строительство домов', href: '/stroitelstvo-domov' },
    ],
  },
  { label: 'Ипотека', href: '/ipoteka' },
  {
    label: 'Компания',
    href: '/about',
    children: [
      { label: 'О компании', href: '/about' },
      { label: 'Отзывы', href: '/reviews' },
      { label: 'Работа риэлтором', href: '/rabota-rieltorom-rostov' },
      { label: 'Контакты', href: '/contacts' },
    ],
  },
] as const

export const footerColumns = [
  {
    title: 'Недвижимость',
    links: [
      { label: 'Новостройки Ростова', href: '/novostroyki-rostova' },
      { label: 'Готовые квартиры', href: '/kvartiry-rostova' },
      { label: 'Строительство домов', href: '/stroitelstvo-domov' },
    ],
  },
  {
    title: 'Сервисы',
    links: [
      { label: 'Ипотечный центр', href: '/ipoteka' },
      { label: 'Семейная ипотека', href: '/semeinaya-ipoteka-rostov' },
    ],
  },
  {
    title: 'Компания',
    links: [
      { label: 'О компании', href: '/about' },
      { label: 'Отзывы', href: '/reviews' },
      { label: 'Контакты', href: '/contacts' },
    ],
  },
] as const

export type CommercialPageKey =
  | 'about'
  | 'contacts'
  | 'ipoteka'
  | 'rabota-rieltorom-rostov'
  | 'reviews'
  | 'semeinaya-ipoteka-rostov'
  | 'stroitelstvo-domov'

export const commercialPages: Record<CommercialPageKey, {
  eyebrow: string
  title: string
  description: string
  cta: string
  ctaHref: string
  facts: { label: string; value: string }[]
  steps: { title: string; description: string }[]
}> = {
  about: {
    eyebrow: 'О компании',
    title: 'Недвижимость под контролем одной команды',
    description: 'Объединяем подбор объекта, ипотеку, проверку документов и сопровождение сделки в одном понятном процессе.',
    cta: 'Посмотреть новостройки',
    ctaHref: '/novostroyki-rostova',
    facts: [
      { label: 'Фокус', value: 'Ростов-на-Дону' },
      { label: 'Контур', value: 'Подбор + ипотека + сделка' },
      { label: 'Подход', value: 'Сначала сценарий, потом объект' },
    ],
    steps: [
      { title: 'Разбираем задачу', description: 'Фиксируем бюджет, срок, район и требования семьи.' },
      { title: 'Сравниваем варианты', description: 'Показываем ЖК и квартиры в одной логике сравнения.' },
      { title: 'Сопровождаем решение', description: 'Проверяем условия, документы и путь до сделки.' },
    ],
  },
  contacts: {
    eyebrow: 'Контакты',
    title: 'Офис и консультации в Ростове-на-Дону',
    description: 'Свяжитесь с командой, чтобы обсудить новостройку, готовую квартиру, ипотеку или строительство дома.',
    cta: 'Позвонить',
    ctaHref: '#contact-details',
    facts: [
      { label: 'Город', value: 'Ростов-на-Дону' },
      { label: 'Формат', value: 'Встреча или консультация' },
      { label: 'Направления', value: 'ЖК, квартиры, ипотека' },
    ],
    steps: [
      { title: 'Коротко опишите задачу', description: 'Что ищете, какой бюджет и когда планируете покупку.' },
      { title: 'Получите маршрут', description: 'Подготовим подходящие варианты и следующий шаг.' },
      { title: 'Назначьте встречу', description: 'Разберём выбранные объекты и условия покупки.' },
    ],
  },
  ipoteka: {
    eyebrow: 'Ипотечный центр',
    title: 'Разберём ипотеку до выбора объекта',
    description: 'Сначала считаем реальный платёж, первый взнос и требования банка, затем подбираем квартиру или дом.',
    cta: 'Смотреть новостройки',
    ctaHref: '/novostroyki-rostova',
    facts: [
      { label: 'Сначала', value: 'Платёж и лимит' },
      { label: 'Потом', value: 'Объект и документы' },
      { label: 'Результат', value: 'Понятный сценарий покупки' },
    ],
    steps: [
      { title: 'Проверяем исходные данные', description: 'Доход, взнос, действующие обязательства и состав семьи.' },
      { title: 'Сравниваем программы', description: 'Смотрим не рекламную ставку, а полный платёж и ограничения.' },
      { title: 'Связываем с объектом', description: 'Проверяем, подходит ли конкретный ЖК или квартира требованиям банка.' },
    ],
  },
  'rabota-rieltorom-rostov': {
    eyebrow: 'Карьера',
    title: 'Работа риэлтором в Ростове-на-Дону',
    description: 'Системная работа с входящими обращениями, каталогом объектов и поддержкой команды на каждом этапе сделки.',
    cta: 'Связаться с офисом',
    ctaHref: '/contacts',
    facts: [
      { label: 'Формат', value: 'Команда и обучение' },
      { label: 'Продукт', value: 'ЖК и готовое жильё' },
      { label: 'Инструменты', value: 'Единый кабинет' },
    ],
    steps: [
      { title: 'Знакомство', description: 'Обсуждаем опыт, ожидания и формат работы.' },
      { title: 'Погружение', description: 'Изучаем продукт, районы, сценарии клиентов и инструменты.' },
      { title: 'Работа с наставником', description: 'Первые подборы и сделки проходят с поддержкой команды.' },
    ],
  },
  reviews: {
    eyebrow: 'Отзывы',
    title: 'Отзывы о работе Союза Застройщиков',
    description: 'Раздел для проверяемых отзывов клиентов о подборе, ипотеке и сопровождении сделки.',
    cta: 'Обсудить задачу',
    ctaHref: '/contacts',
    facts: [
      { label: 'Принцип', value: 'Проверяемый источник' },
      { label: 'Темы', value: 'Подбор, ипотека, сделка' },
      { label: 'Модерация', value: 'Через Payload Admin' },
    ],
    steps: [
      { title: 'Собираем обратную связь', description: 'Фиксируем фактический сценарий клиента и результат.' },
      { title: 'Проверяем публикацию', description: 'Не публикуем выдуманные отзывы или неподтверждённый опыт.' },
      { title: 'Используем для улучшений', description: 'Возвращаем сигналы в процесс подбора и сопровождения.' },
    ],
  },
  'semeinaya-ipoteka-rostov': {
    eyebrow: 'Семейная ипотека',
    title: 'Проверим семейную ипотеку под вашу ситуацию',
    description: 'Разберём право на программу, первоначальный взнос, платёж и объекты, которые подходят банку.',
    cta: 'Сравнить ЖК',
    ctaHref: '/novostroyki-rostova',
    facts: [
      { label: 'Проверка', value: 'Состав семьи и условия' },
      { label: 'Расчёт', value: 'Полный ежемесячный платёж' },
      { label: 'Подбор', value: 'Подходящие новостройки' },
    ],
    steps: [
      { title: 'Проверяем eligibility', description: 'Сверяем актуальные условия программы с вашей ситуацией.' },
      { title: 'Считаем бюджет', description: 'Определяем комфортный платёж и безопасный ценовой диапазон.' },
      { title: 'Выбираем ЖК', description: 'Сравниваем аккредитацию, сроки, планировки и условия покупки.' },
    ],
  },
  'stroitelstvo-domov': {
    eyebrow: 'Строительство домов',
    title: 'Дом начинается с участка, сметы и честного бюджета',
    description: 'Помогаем связать участок, проект, подрядчика, коммуникации и ипотеку в один проверяемый план.',
    cta: 'Рассчитать ипотеку',
    ctaHref: '/ipoteka',
    facts: [
      { label: 'Основа', value: 'Участок и ограничения' },
      { label: 'Бюджет', value: 'Смета с резервом' },
      { label: 'Контроль', value: 'Этапы и документы' },
    ],
    steps: [
      { title: 'Проверяем участок', description: 'Назначение земли, подъезд, коммуникации и ограничения.' },
      { title: 'Собираем смету', description: 'Сравниваем комплектацию, сроки и то, что не входит в рекламную цену.' },
      { title: 'Фиксируем этапы', description: 'Связываем платежи, приёмку и ответственность подрядчика.' },
    ],
  },
}
