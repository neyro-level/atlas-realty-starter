import type { ReactNode } from "react";

type HomePageViewProps = {
  hero: ReactNode;
  services: ReactNode;
  newBuildings: ReactNode;
  interests: ReactNode;
  legalServices: ReactNode;
  director: ReactNode;
  purchaseLead: ReactNode;
  articles: ReactNode;
  preFooter: ReactNode;
};

export function HomePageView({ hero, services, newBuildings, interests, legalServices, director, purchaseLead, articles, preFooter }: HomePageViewProps) {
  return <main className="home-page">{hero}{services}{newBuildings}{interests}{legalServices}{director}{purchaseLead}{articles}{preFooter}</main>;
}
