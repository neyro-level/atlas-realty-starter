import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { EmployeeReviewsSection } from "./EmployeeReviewsSection";

vi.mock("@/modules/employees/ui/EmployeePortrait", () => ({
  EmployeePortrait: ({ fullName }: { fullName: string }) => createElement("span", null, fullName),
}));

describe("EmployeeReviewsSection", () => {
  it("renders the public review, employee link and pagination without private author data", () => {
    const html = renderToStaticMarkup(
      createElement(EmployeeReviewsSection, {
        reviews: {
          items: [
            {
              id: "review-1",
              publicName: "Елена Б.",
              rating: 5,
              text: "Спасибо специалисту за спокойное сопровождение сделки.",
              publishedAt: "2026-08-20T10:00:00.000Z",
              employee: {
                slug: "ivan-ivanov",
                fullName: "Иванов Иван Иванович",
                position: "Специалист по недвижимости",
                photoUrl: null,
              },
            },
          ],
          total: 19,
          page: 1,
          pageSize: 18,
        },
      }),
    );

    expect(html).toContain("Отзывы о специалистах агентства недвижимости");
    expect(html).toContain("Елена Б.");
    expect(html).toContain("Спасибо специалисту за спокойное сопровождение сделки.");
    expect(html).toContain('href="/sotrudniki/ivan-ivanov"');
    expect(html).toContain('href="/otzyvy?reviews_page=2#employee-reviews"');
    expect(html).not.toContain("authorPhone");
  });

  it("renders a collapsed excerpt inside the summary for long reviews", () => {
    const longText = "Подробный отзыв о сопровождении сделки. ".repeat(12);
    const html = renderToStaticMarkup(
      createElement(EmployeeReviewsSection, {
        reviews: {
          items: [{
            id: "review-long",
            publicName: "Анна П.",
            rating: 5,
            text: longText,
            publishedAt: "2026-08-20T10:00:00.000Z",
            employee: {
              slug: "ivan-ivanov",
              fullName: "Иванов Иван Иванович",
              position: "Специалист по недвижимости",
              photoUrl: null,
            },
          }],
          total: 1,
          page: 1,
          pageSize: 18,
        },
      }),
    );

    expect(html).toMatch(/<summary[^>]*>[\s\S]*line-clamp-7[\s\S]*Подробный отзыв/u);
    expect(html).toContain("Читать полностью");
    expect(html).toContain("Свернуть");
  });
});
