import type { Metadata } from "next";
import { SessionCollectionPage } from "@/modules/session-collections";
import { routes } from "@/project/routes";

export const metadata: Metadata = {
  title: "Избранное",
  description: "Объекты недвижимости, добавленные в избранное в текущей сессии браузера.",
  alternates: { canonical: routes.favorites() },
  robots: { index: false, follow: false },
};

export default function FavoritesPage() {
  return <SessionCollectionPage kind="favorites" />;
}

