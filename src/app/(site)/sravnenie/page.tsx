import type { Metadata } from "next";
import { SessionCollectionPage } from "@/modules/session-collections";
import { routes } from "@/project/routes";

export const metadata: Metadata = {
  title: "Сравнение",
  description: "Сравнение объектов недвижимости, добавленных в текущей сессии браузера.",
  alternates: { canonical: routes.comparison() },
  robots: { index: false, follow: false },
};

export default function ComparePage() {
  return <SessionCollectionPage kind="compare" />;
}

