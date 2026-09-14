import type { Metadata } from "next";
import { RouteStatusState } from "@/components/layout/RouteStatusState";
import { tenant } from "@/project/tenant.config";

export const metadata: Metadata = {
  title: "Страница не найдена",
  description: "Страница не найдена: проверьте адрес или вернитесь в каталог недвижимости агентства недвижимости.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <RouteStatusState
      eyebrow="404 / страница не найдена"
      title="Такой страницы нет"
      description={`Адрес мог измениться или в ссылке есть ошибка. Перейдите в каталог недвижимости ${tenant.cityRuGenitive} или вернитесь на главную страницу.`}
      primaryHref="/nedvizhimost"
      primaryLabel="Перейти в каталог"
      secondaryHref="/"
      secondaryLabel="На главную"
    />
  );
}
