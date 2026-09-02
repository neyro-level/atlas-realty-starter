import type { ContentPagesConfig } from '@/shared/types/content-pages'

export const contentPages: ContentPagesConfig = {
  shell: { homeHref: '/', homeLabel: 'Главная' },
  employees: {
    eyebrow: 'Команда',
    title: 'Специалисты Союза Застройщиков',
    description: 'Публичные профили сотрудников управляются в Payload и появляются здесь только после разрешения на публикацию.',
    basePath: '/sotrudniki',
    emptyTitle: 'Публичные профили пока не опубликованы',
    emptyDescription: 'Команда появится после проверки данных и разрешения сотрудников на публикацию.',
  },
  employeeProfile: {
    homeHref: '/', homeLabel: 'Главная', employeesHref: '/sotrudniki', employeesLabel: 'Сотрудники',
  },
  journal: {
    eyebrow: 'Журнал',
    title: 'Практика покупки и строительства недвижимости',
    description: 'Материалы будут публиковаться после появления канонической коллекции статей в Payload. Вымышленные статьи не создаются.',
    emptyTitle: 'Журнал готов к публикациям',
    emptyDescription: 'Сейчас в CMS нет коллекции статей. Поэтому маршрут и состояние перенесены, но контент не подменён демонстрационными материалами.',
  },
  sitemap: {
    eyebrow: 'Навигация', title: 'Карта сайта', description: 'Основные публичные разделы платформы.',
    groups: [
      { title: 'Недвижимость', links: [{ label: 'Все объекты', href: '/nedvizhimost-rostov' }, { label: 'Новостройки', href: '/novostroyki-rostova' }, { label: 'Квартиры', href: '/kvartiry-rostova' }, { label: 'Дома', href: '/doma-rostov' }, { label: 'Коммерческая недвижимость', href: '/kommercheskaya-nedvizhimost' }] },
      { title: 'Сервисы', links: [{ label: 'Ипотека', href: '/ipoteka' }, { label: 'Семейная ипотека', href: '/semeinaya-ipoteka-rostov' }, { label: 'Строительство домов', href: '/stroitelstvo-domov' }] },
      { title: 'Компания', links: [{ label: 'О компании', href: '/about' }, { label: 'Сотрудники', href: '/sotrudniki' }, { label: 'Отзывы', href: '/reviews' }, { label: 'Контакты', href: '/contacts' }, { label: 'Вакансии', href: '/rabota-rieltorom-rostov' }, { label: 'Журнал', href: '/journal' }] },
    ],
  },
  legal: {
    eyebrow: 'Правовая информация', title: 'Документы и правила использования сайта', description: 'Публичные правовые документы размещаются только после утверждения владельцем.',
    cards: [
      { title: 'Политика обработки персональных данных', body: 'До утверждения юридического текста сайт не заявляет несуществующие условия обработки данных. Обращения направляются через опубликованные контакты.', status: 'требует утверждения' },
      { title: 'Пользовательское соглашение', body: 'Условия использования, ответственность сторон и порядок обращений требуют отдельного утверждённого документа.', status: 'требует утверждения' },
    ],
  },
  leadgen: {
    construction: { eyebrow: 'Строительство дома', title: 'Проверьте участок, бюджет и этапы до договора', text: 'Получите маршрут проверки проекта без обещаний автоматического расчёта.', image: '/images/ui-construction.jpg', href: '/contacts?request=construction', disclaimer: 'Форма не имитирует отправку: обращение оформляется только через действующий контактный маршрут.' },
    apartments: { eyebrow: 'Подбор квартиры', title: 'Сравните квартиры по бюджету, району и сроку', text: 'Каталог использует только опубликованные объекты Payload.', image: '/images/ui-home-hero.webp', href: '/kvartiry-rostova', disclaimer: 'Форма не имитирует отправку: обращение оформляется только через действующий контактный маршрут.' },
    'new-buildings': { eyebrow: 'Новостройки Ростова', title: 'Выберите жилой комплекс по проверенным условиям', text: 'Показываем только опубликованные данные застройщиков.', image: '/images/ui-home-hero.webp', href: '/novostroyki-rostova', disclaimer: 'Форма не имитирует отправку: обращение оформляется только через действующий контактный маршрут.' },
  },
}
