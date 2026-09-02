import type { CommercialPageConfig } from '@/shared/types/commercial-pages'

export type CommercialPageKey =
  | 'about'
  | 'contacts'
  | 'ipoteka'
  | 'rabota-rieltorom-rostov'
  | 'reviews'
  | 'semeinaya-ipoteka-rostov'
  | 'stroitelstvo-domov'

const principleItems = [
  { title: 'Данные раньше обещаний', text: 'Публикуем только подтверждённые объекты и условия.' },
  { title: 'Один маршрут', text: 'Подбор, ипотека и документы связаны между собой.' },
  { title: 'Понятный выбор', text: 'Сравниваем варианты по одинаковым критериям.' },
  { title: 'Ответственность', text: 'У каждого обращения есть следующий шаг и владелец.' },
]

const mortgageItems = [
  { title: 'Первоначальный взнос', text: 'Фиксируем доступную сумму и резерв после сделки.' },
  { title: 'Ежемесячный платёж', text: 'Сравниваем платёж с текущими обязательствами семьи.' },
  { title: 'Требования банка', text: 'Проверяем заёмщика и объект до подачи заявки.' },
  { title: 'Альтернативы', text: 'Сопоставляем программы без обещания одобрения.' },
]

export const commercialPages: Record<CommercialPageKey, CommercialPageConfig> = {
  about: {
    key: 'about', family: 'about', heroImage: '/images/ui-about.webp', eyebrow: 'О компании',
    title: 'Недвижимость под контролем одной команды',
    description: 'Объединяем подбор объекта, ипотеку, проверку документов и сопровождение сделки в одном понятном процессе.',
    cta: 'Посмотреть новостройки', ctaHref: '/novostroyki-rostova',
    facts: [{ label: 'Фокус', value: 'Ростов-на-Дону' }, { label: 'Контур', value: 'Подбор + ипотека + сделка' }, { label: 'Подход', value: 'Сначала сценарий, потом объект' }],
    steps: [{ title: 'Разбираем задачу', description: 'Фиксируем бюджет, срок, район и требования семьи.' }, { title: 'Сравниваем варианты', description: 'Показываем ЖК и квартиры в одной логике сравнения.' }, { title: 'Сопровождаем решение', description: 'Проверяем условия, документы и путь до сделки.' }],
    familySection: { eyebrow: 'Принципы', title: 'Как команда принимает решения', items: principleItems },
  },
  contacts: {
    key: 'contacts', family: 'contacts', heroImage: '/images/ui-home-hero.webp', eyebrow: 'Контакты',
    title: 'Офис и консультации в Ростове-на-Дону',
    description: 'Свяжитесь с командой, чтобы обсудить новостройку, готовую квартиру, ипотеку или строительство дома.',
    cta: 'Позвонить', ctaHref: '#contact-details',
    facts: [{ label: 'Город', value: 'Ростов-на-Дону' }, { label: 'Формат', value: 'Встреча или консультация' }, { label: 'Направления', value: 'ЖК, квартиры, ипотека' }],
    steps: [{ title: 'Коротко опишите задачу', description: 'Что ищете, какой бюджет и когда планируете покупку.' }, { title: 'Получите маршрут', description: 'Подготовим подходящие варианты и следующий шаг.' }, { title: 'Назначьте встречу', description: 'Разберём выбранные объекты и условия покупки.' }],
  },
  ipoteka: {
    key: 'ipoteka', family: 'mortgage', heroImage: '/images/ui-mortgage.png', eyebrow: 'Ипотечный центр',
    title: 'Разберём ипотеку до выбора объекта',
    description: 'Сначала считаем реальный платёж, первый взнос и требования банка, затем подбираем квартиру или дом.',
    cta: 'Смотреть новостройки', ctaHref: '/novostroyki-rostova',
    facts: [{ label: 'Сначала', value: 'Платёж и лимит' }, { label: 'Потом', value: 'Объект и документы' }, { label: 'Результат', value: 'Понятный сценарий покупки' }],
    steps: [{ title: 'Проверяем исходные данные', description: 'Доход, взнос, действующие обязательства и состав семьи.' }, { title: 'Сравниваем программы', description: 'Смотрим не рекламную ставку, а полный платёж и ограничения.' }, { title: 'Связываем с объектом', description: 'Проверяем, подходит ли конкретный ЖК или квартира требованиям банка.' }],
    familySection: { eyebrow: 'Программы и расчёт', title: 'Считаем не ставку, а полный сценарий', items: mortgageItems },
  },
  'rabota-rieltorom-rostov': {
    key: 'rabota-rieltorom-rostov', family: 'career', heroImage: '/images/ui-careers.webp', eyebrow: 'Карьера',
    title: 'Работа риэлтором в Ростове-на-Дону',
    description: 'Системная работа с входящими обращениями, каталогом объектов и поддержкой команды на каждом этапе сделки.',
    cta: 'Связаться с офисом', ctaHref: '/contacts',
    facts: [{ label: 'Формат', value: 'Команда и обучение' }, { label: 'Продукт', value: 'ЖК и готовое жильё' }, { label: 'Инструменты', value: 'Единый кабинет' }],
    steps: [{ title: 'Знакомство', description: 'Обсуждаем опыт, ожидания и формат работы.' }, { title: 'Погружение', description: 'Изучаем продукт, районы, сценарии клиентов и инструменты.' }, { title: 'Работа с наставником', description: 'Первые подборы и сделки проходят с поддержкой команды.' }],
    familySection: { eyebrow: 'Система работы', title: 'Команда вместо одиночной гонки', items: [{ title: 'Обучение продукту', text: 'Каталог, районы, ипотека и документы сделки.' }, { title: 'Наставник', text: 'Первые разборы и показы проходят с поддержкой.' }, { title: 'Единый кабинет', text: 'Объекты, обращения и этапы сделки в одном контуре.' }, { title: 'Стандарты сервиса', text: 'Факты, договорённости и следующий шаг фиксируются явно.' }] },
  },
  reviews: {
    key: 'reviews', family: 'reviews', heroImage: '/images/ui-reviews.webp', eyebrow: 'Отзывы',
    title: 'Отзывы о работе Союза Застройщиков',
    description: 'Раздел для проверяемых отзывов клиентов о подборе, ипотеке и сопровождении сделки.',
    cta: 'Обсудить задачу', ctaHref: '/contacts',
    facts: [{ label: 'Принцип', value: 'Проверяемый источник' }, { label: 'Темы', value: 'Подбор, ипотека, сделка' }, { label: 'Модерация', value: 'Через Payload Admin' }],
    steps: [{ title: 'Собираем обратную связь', description: 'Фиксируем фактический сценарий клиента и результат.' }, { title: 'Проверяем публикацию', description: 'Не публикуем выдуманные отзывы или неподтверждённый опыт.' }, { title: 'Используем для улучшений', description: 'Возвращаем сигналы в процесс подбора и сопровождения.' }],
  },
  'semeinaya-ipoteka-rostov': {
    key: 'semeinaya-ipoteka-rostov', family: 'mortgage', heroImage: '/images/ui-mortgage.png', eyebrow: 'Семейная ипотека',
    title: 'Проверим семейную ипотеку под вашу ситуацию',
    description: 'Разберём право на программу, первоначальный взнос, платёж и объекты, которые подходят банку.',
    cta: 'Сравнить ЖК', ctaHref: '/novostroyki-rostova',
    facts: [{ label: 'Проверка', value: 'Состав семьи и условия' }, { label: 'Расчёт', value: 'Полный ежемесячный платёж' }, { label: 'Подбор', value: 'Подходящие новостройки' }],
    steps: [{ title: 'Проверяем условия', description: 'Сверяем актуальные условия программы с вашей ситуацией.' }, { title: 'Считаем бюджет', description: 'Определяем комфортный платёж и безопасный ценовой диапазон.' }, { title: 'Выбираем ЖК', description: 'Сравниваем аккредитацию, сроки, планировки и условия покупки.' }],
    familySection: { eyebrow: 'Программы и расчёт', title: 'Считаем не ставку, а полный сценарий', items: mortgageItems },
  },
  'stroitelstvo-domov': {
    key: 'stroitelstvo-domov', family: 'construction', heroImage: '/images/ui-construction.jpg', eyebrow: 'Строительство домов',
    title: 'Дом начинается с участка, сметы и честного бюджета',
    description: 'Помогаем связать участок, проект, подрядчика, коммуникации и ипотеку в один проверяемый план.',
    cta: 'Рассчитать ипотеку', ctaHref: '/ipoteka',
    facts: [{ label: 'Основа', value: 'Участок и ограничения' }, { label: 'Бюджет', value: 'Смета с резервом' }, { label: 'Контроль', value: 'Этапы и документы' }],
    steps: [{ title: 'Проверяем участок', description: 'Назначение земли, подъезд, коммуникации и ограничения.' }, { title: 'Собираем смету', description: 'Сравниваем комплектацию, сроки и то, что не входит в рекламную цену.' }, { title: 'Фиксируем этапы', description: 'Связываем платежи, приёмку и ответственность подрядчика.' }],
    familySection: { eyebrow: 'Контроль строительства', title: 'Участок, проект, смета и приёмка', items: [{ title: 'Исходные данные', text: 'Границы участка, геология, коммуникации и ограничения.' }, { title: 'Комплектация', text: 'Материалы и работы фиксируются до сравнения цены.' }, { title: 'Этапы оплаты', text: 'Платежи привязаны к проверяемому результату.' }, { title: 'Приёмка', text: 'Замечания и ответственность подрядчика оформляются документально.' }] },
  },
}

export const commercialPageKeys = Object.keys(commercialPages) as CommercialPageKey[]

export function isCommercialPageKey(value: string): value is CommercialPageKey {
  return value in commercialPages
}
