import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@starter/site-ui/primitives";
import { routes } from "@/project/routes";
import { tenant } from "@/project/tenant.config";

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
          <p className="text-caption font-extrabold uppercase tracking-spaced text-[var(--spasibo-page-content-secondary)]">Контактный переход</p>
          <h1 className="mt-5 max-w-3xl text-thank-you font-extrabold leading-compressed">Спасибо, заявка отправлена</h1>
          <p className="mt-5 max-w-2xl text-body leading-step-relaxed text-white/74">Команда агентства недвижимости получила ваш запрос. Специалист свяжется с вами, чтобы уточнить задачу и собрать следующий шаг по объекту, подборке или сопровождению сделки.</p>
        </div>
      </section>

      <section className="bg-white py-10 lg:py-14">
        <div className="mx-auto grid max-w-5xl gap-5 px-5 md:grid-cols-2">
          <article className="rounded-3xl border border-[var(--spasibo-page-border-secondary)] bg-[var(--surface-card-soft)] p-6 shadow-[var(--page-shadow-primary)]">
            <h2 className="text-section-small font-extrabold leading-tight-copy text-[var(--spasibo-page-content-tertiary)]">Что дальше</h2>
            <p className="mt-4 text-body leading-step-relaxed text-[var(--spasibo-page-content-subtle)]">Мы уточним сценарий сделки, приоритетные районы, бюджет и нужный контур: покупка, продажа, новостройки или сопровождение.</p>
          </article>
          <article className="rounded-3xl border border-[var(--spasibo-page-border-secondary)] bg-[var(--surface-card-soft)] p-6 shadow-[var(--page-shadow-primary)]">
            <h2 className="text-section-small font-extrabold leading-tight-copy text-[var(--spasibo-page-content-tertiary)]">Пока ждёте ответ</h2>
            <p className="mt-4 text-body leading-step-relaxed text-[var(--spasibo-page-content-subtle)]">Можно вернуться к разделам недвижимости, открыть нужный маршрут или посмотреть контакты агентства, если нужна более быстрая связь.</p>
          </article>
        </div>

        <div className="mx-auto mt-8 flex max-w-5xl flex-col gap-3 px-5 sm:flex-row sm:flex-wrap">
          <Button asChild size="lg"><Link href={routes.rootPage("nedvizhimost")}>Открыть недвижимость {tenant.cityRuGenitive}</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href={routes.rootPage("kvartiry")}>Открыть маршрут квартир</Link></Button>
          <Button asChild size="lg" variant="outline"><Link href={routes.contacts()}>Контакты агентства</Link></Button>
        </div>
      </section>
    </main>
  );
}
