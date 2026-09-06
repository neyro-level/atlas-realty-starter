import type { ComplexBootstrapRecord } from '@/core/data-access/system/bootstrap/krasnodar-complexes'

export const KRASNODAR_COMPLEXES_SOURCE = {
  code: 'domrf-eiszh',
  title: 'ЕИСЖС наш.дом.рф',
  verifiedAt: '2026-09-06',
} as const

const sourceUrl = (id: string) =>
  `https://xn--80az8a.xn--d1aqf.xn--p1ai/сервисы/каталог-новостроек/объект/${id}`

export const KRASNODAR_COMPLEXES: readonly ComplexBootstrapRecord[] = [
  { sourceObjectId: '50184', name: 'ЖК «Самолёт 6» Литер 31 (уч. 599 Л1)', address: 'Краснодарский край, город Краснодар, улица им. Ивана Беличенко, д. 84', developer: 'ООО СЗ ПАРК ПОБЕДЫ-2', developerSlug: 'sz-park-pobedy-2', readiness: 'commissioned', sourceUrl: sourceUrl('50184') },
  { sourceObjectId: '50185', name: 'ЖК «Самолёт 6» Литер 32 (уч. 599 Л2)', address: 'Краснодарский край, город Краснодар, улица им. Ивана Беличенко, д. 84, корпус 1', developer: 'ООО СЗ ПАРК ПОБЕДЫ-2', developerSlug: 'sz-park-pobedy-2', readiness: 'commissioned', sourceUrl: sourceUrl('50185') },
  { sourceObjectId: '50186', name: 'ЖК «Самолёт 6» Литер 33 (уч. 599 Л3)', address: 'Краснодарский край, город Краснодар, улица им. Ивана Беличенко, д. 84, корпус 2', developer: 'ООО СЗ ПАРК ПОБЕДЫ-2', developerSlug: 'sz-park-pobedy-2', readiness: 'commissioned', sourceUrl: sourceUrl('50186') },
  { sourceObjectId: '50187', name: 'ЖК «Самолёт 6» Литер 34 (уч. 599 Л4)', address: 'Краснодарский край, город Краснодар, улица им. Ивана Беличенко, д. 84, корпус 3', developer: 'ООО СЗ ПАРК ПОБЕДЫ-2', developerSlug: 'sz-park-pobedy-2', readiness: 'commissioned', sourceUrl: sourceUrl('50187') },
  { sourceObjectId: '49650', name: 'ЖК «Самолёт 6» Литер 39 (уч. 594 Л1)', address: 'Краснодарский край, город Краснодар, район посёлка Колосистого, отделение № 1 КНИИСХ (ОПХ «Колос»)', developer: 'ООО СЗ ПАРК ПОБЕДЫ-2', developerSlug: 'sz-park-pobedy-2', readiness: 'commissioned', sourceUrl: sourceUrl('49650') },
  { sourceObjectId: '49651', name: 'ЖК «Самолёт 6» Литер 40 (уч. 594 Л2)', address: 'Краснодарский край, город Краснодар, район посёлка Колосистого, отделение № 1 КНИИСХ (ОПХ «Колос»)', developer: 'ООО СЗ ПАРК ПОБЕДЫ-2', developerSlug: 'sz-park-pobedy-2', readiness: 'commissioned', sourceUrl: sourceUrl('49651') },
  { sourceObjectId: '49652', name: 'ЖК «Самолёт 6» Литер 41 (уч. 594 Л3)', address: 'Краснодарский край, город Краснодар, район посёлка Колосистого, отделение № 1 КНИИСХ (ОПХ «Колос»)', developer: 'ООО СЗ ПАРК ПОБЕДЫ-2', developerSlug: 'sz-park-pobedy-2', readiness: 'commissioned', sourceUrl: sourceUrl('49652') },
  { sourceObjectId: '49653', name: 'ЖК «Самолёт 6» Литер 42 (уч. 594 Л4)', address: 'Краснодарский край, город Краснодар, район посёлка Колосистого, отделение № 1 КНИИСХ (ОПХ «Колос»)', developer: 'ООО СЗ ПАРК ПОБЕДЫ-2', developerSlug: 'sz-park-pobedy-2', readiness: 'commissioned', sourceUrl: sourceUrl('49653') },
  { sourceObjectId: '49654', name: 'ЖК «Самолёт 6» Литер 43 (уч. 594 Л5)', address: 'Краснодарский край, город Краснодар, район посёлка Колосистого, отделение № 1 КНИИСХ (ОПХ «Колос»)', developer: 'ООО СЗ ПАРК ПОБЕДЫ-2', developerSlug: 'sz-park-pobedy-2', readiness: 'commissioned', sourceUrl: sourceUrl('49654') },
  { sourceObjectId: '49655', name: 'ЖК «Самолёт 6» Литер 44 (уч. 594 Л6)', address: 'Краснодарский край, город Краснодар, район посёлка Колосистого, отделение № 1 КНИИСХ (ОПХ «Колос»)', developer: 'ООО СЗ ПАРК ПОБЕДЫ-2', developerSlug: 'sz-park-pobedy-2', readiness: 'commissioned', sourceUrl: sourceUrl('49655') },
  { sourceObjectId: '49656', name: 'ЖК «Самолёт 6» Литер 45 (уч. 594 Л7)', address: 'Краснодарский край, город Краснодар, район посёлка Колосистого, отделение № 1 КНИИСХ (ОПХ «Колос»)', developer: 'ООО СЗ ПАРК ПОБЕДЫ-2', developerSlug: 'sz-park-pobedy-2', readiness: 'commissioned', sourceUrl: sourceUrl('49656') },
  { sourceObjectId: '49657', name: 'ЖК «Самолёт 6» Литер 46 (уч. 594 Л8)', address: 'Краснодарский край, город Краснодар, район посёлка Колосистого, отделение № 1 КНИИСХ (ОПХ «Колос»)', developer: 'ООО СЗ ПАРК ПОБЕДЫ-2', developerSlug: 'sz-park-pobedy-2', readiness: 'commissioned', sourceUrl: sourceUrl('49657') },
  { sourceObjectId: '49640', name: 'ЖК «Самолёт 6» Литер 47 (уч. 593 Л1)', address: 'Краснодарский край, город Краснодар, район посёлка Колосистого', developer: 'ООО СЗ ПАРК ПОБЕДЫ-2', developerSlug: 'sz-park-pobedy-2', readiness: 'commissioned', sourceUrl: sourceUrl('49640') },
  { sourceObjectId: '49641', name: 'ЖК «Самолёт 6» Литер 48 (уч. 593 Л2)', address: 'Краснодарский край, город Краснодар, район посёлка Колосистого', developer: 'ООО СЗ ПАРК ПОБЕДЫ-2', developerSlug: 'sz-park-pobedy-2', readiness: 'commissioned', sourceUrl: sourceUrl('49641') },
  { sourceObjectId: '49642', name: 'ЖК «Самолёт 6» Литер 49 (уч. 593 Л3)', address: 'Краснодарский край, город Краснодар, район посёлка Колосистого', developer: 'ООО СЗ ПАРК ПОБЕДЫ-2', developerSlug: 'sz-park-pobedy-2', readiness: 'commissioned', sourceUrl: sourceUrl('49642') },
  { sourceObjectId: '49643', name: 'ЖК «Самолёт 6» Литер 50 (уч. 593 Л4)', address: 'Краснодарский край, город Краснодар, район посёлка Колосистого', developer: 'ООО СЗ ПАРК ПОБЕДЫ-2', developerSlug: 'sz-park-pobedy-2', readiness: 'commissioned', sourceUrl: sourceUrl('49643') },
  { sourceObjectId: '49582', name: 'МКР «ДОГМА ПАРК» Литер 15 (уч. 2863 Л2)', address: 'Краснодарский край, город Краснодар, улица Анны Ахматовой', developer: 'ООО СЗ ДОГМА-ПАРК 21', developerSlug: 'sz-dogma-park-21', readiness: 'commissioned', sourceUrl: sourceUrl('49582') },
  { sourceObjectId: '49587', name: 'МКР «ДОГМА ПАРК» Литер 17 (уч. 2862 Л2)', address: 'Краснодарский край, город Краснодар, улица им. Анны Ахматовой, д. 12', developer: 'ООО СЗ ДОГМА-ПАРК 21', developerSlug: 'sz-dogma-park-21', readiness: 'commissioned', sourceUrl: sourceUrl('49587') },
  { sourceObjectId: '49586', name: 'МКР «ДОГМА ПАРК» Литер 18 (уч. 2862 Л1)', address: 'Краснодарский край, город Краснодар, улица им. Анны Ахматовой, д. 12', developer: 'ООО СЗ ДОГМА-ПАРК 21', developerSlug: 'sz-dogma-park-21', readiness: 'commissioned', sourceUrl: sourceUrl('49586') },
  { sourceObjectId: '49588', name: 'МКР «ДОГМА ПАРК» Литер 19 (уч. 2862 Л3)', address: 'Краснодарский край, город Краснодар, улица им. Анны Ахматовой, д. 12', developer: 'ООО СЗ ДОГМА-ПАРК 21', developerSlug: 'sz-dogma-park-21', readiness: 'commissioned', sourceUrl: sourceUrl('49588') },
] as const
