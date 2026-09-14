import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ArticleEditorialLinksView } from "@starter/site-ui/views";

describe("ArticleEditorialFooterLinks", () => {
  it("renders contextual service links below the article CTA", () => {
    const markup = renderToStaticMarkup(createElement(ArticleEditorialLinksView, {
      links: [{
        label: "Юрист по недвижимости в Краснодаре",
        href: "/yurist",
        description: "Проверка документов и сопровождение сделки.",
      }],
      variant: "footer",
      linkRenderer: ({ href, children, ...props }) => createElement("a", { href, ...props }, children),
    }));

    expect(markup).toContain('href="/yurist"');
    expect(markup).toContain("Следующий шаг");
  });
});
