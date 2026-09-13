/** Yandex Metrika browser endpoints. Use is subject to Yandex Metrika terms and consent policy. */
export const YANDEX_METRIKA_ORIGIN = 'https://mc.yandex.ru'
export const YANDEX_METRIKA_SCRIPT_URL = `${YANDEX_METRIKA_ORIGIN}/metrika/tag.js`

export function yandexMetrikaWatchURL(counterId: number) {
  return `${YANDEX_METRIKA_ORIGIN}/watch/${counterId}`
}
