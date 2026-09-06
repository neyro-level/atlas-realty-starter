import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { DeferredSimilarPropertyImage, PropertyObjectGallery } from "./PropertyObjectGallery";

function renderGallery(image: string) {
  return renderToStaticMarkup(createElement(PropertyObjectGallery, {
    images: [image],
    imageAlt: "Дом в Краснодаре",
    address: "Краснодар",
    mapUrl: "https://yandex.ru/maps/",
  }));
}

describe("PropertyObjectGallery", () => {
  it("optimizes the LCP image from the trusted property CDN", () => {
    const markup = renderGallery("https://is.vladis.ru/api/upload/obekty.jpg");

    expect(markup).toContain("/_next/image?url=https%3A%2F%2Fis.vladis.ru%2Fapi%2Fupload%2Fobekty.jpg");
  });

  it("keeps unknown external hosts outside the image optimizer", () => {
    const markup = renderGallery("https://unknown.example/obekty.jpg");

    expect(markup).toContain('src="https://unknown.example/obekty.jpg"');
    expect(markup).not.toContain("/_next/image?url=https%3A%2F%2Funknown.example");
  });

  it("keeps below-fold similar images out of the initial HTML", () => {
    const markup = renderToStaticMarkup(createElement(DeferredSimilarPropertyImage, {
      src: "https://is.vladis.ru/api/upload/similar.jpg",
      alt: "Похожий объект",
    }));

    expect(markup).toContain("data-deferred-similar-image");
    expect(markup).not.toContain("similar.jpg");
  });
});
