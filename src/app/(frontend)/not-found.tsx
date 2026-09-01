import type { Metadata } from 'next'

import { RouteStatusState } from '@/components/layout/RouteStatusState'

export const metadata: Metadata = {
  title: 'Страница не найдена',
  description: 'Страница не найдена: проверьте адрес или вернитесь в каталог недвижимости.',
  robots: { follow: false, index: false },
}

export default function NotFound() {
  return (
    <RouteStatusState
      description="Адрес мог измениться или в ссылке есть ошибка. Перейдите в каталог недвижимости или вернитесь на главную страницу."
      eyebrow="404 / страница не найдена"
      primaryHref="/nedvizhimost-rostov"
      primaryLabel="Перейти в каталог"
      secondaryHref="/"
      secondaryLabel="На главную"
      title="Такой страницы нет"
    />
  )
}
