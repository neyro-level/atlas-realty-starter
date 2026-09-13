import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@ams/realty-ui";
import { routes } from "@/project/routes";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Спасибо за заявку",
  description: "Страница подтверждения отправки заявки в контуре агентства недвижимости.",
  alternates: { canonical: routes.thankYou() },
  robots: { index: false, follow: false },
};

export default function ThanksPage() {
  return (
    <main className="min-h-screen bg-white text-[var(--spasibo-page-content-primary)]">
      <section className="border-b border-[var(--spasibo-page-border-primary)] bg-[var(--spasibo-page-surface-primary)] text-white">
        <div className="mx-auto max-w-5xl px-5 py-14 lg:py-20">
          <p className="text-caption font-extrabold uppercase tracking-[0.18em] text-[var(--spasibo-page-content-secondary)]">Контактный переход</p>
          <h1 className="mt-5 max-w-3xl text-[clamp(2.2rem,4vw,3.8rem)] font-extrabold leading-[0.96]">Спасибо, заявка отправлена</h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/74">Команда агентства недвижимости получила ваш запрос. Специалист свяжется с вами, чтобы уточнить задачу и собрать следующий шаг по объекту, подборке или сопровождению сделки.</p>
        </div>
      </section>

      <section className="bg-white py-10 lg:py-14">
        <div className="mx-auto grid max-w-5xl gap-5 px-5 md:grid-cols-2">
          <article className="rounded-3xl border border-[var(--spasibo-page-border-secondary)] bg-[var(--surface-card-soft)] p-6 shadow-[var(--page-shadow-primary)]">
            <h2 className="text-2xl font-extrabold leading-tight text-[var(--spasibo-page-content-tertiary)]">Что дальше</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--spasibo-page-content-subtle)]">Мы уточним сценарий сделки, приоритетные районы, бюджет и нужный контур: покупка, продажа, новостройки или сопровождение.</p>
          </article>
          <article className="rounded-3xl border border-[var(--spasibo-page-border-secondary)] bg-[var(--surface-card-soft)] p-6 shadow-[var(--page-shadow-primary)]">
            <h2 className="text-2xl font-extrabold leading-tight text-[var(--spasibo-page-content-tertiary)]">Пока ждёте ответ</h2>
            <p className="mt-4 text-sm leading-7 text-[var(--spasibo-page-content-subtle)]">Можно вернуться к разделам недвижимости, открыть нужный маршрут или посмотреть контакты агентства, если нужна более быстрая связь.</p>
          </article>
        </div>

        <div className="mx-auto mt-8 flex max-w-5xl flex-col gap-3 px-5 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg"><Link href={routes.rootPage("nedvizhimost")}>Открыть недвижимость Краснодара</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href={routes.rootPage("kvartiry")}>Открыть маршрут квартир</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href={routes.contacts()}>Контакты агентства</Link></Button>
        </div>
      </section>
    </main>
  );
}
