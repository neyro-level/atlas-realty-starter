import { beforeEach, describe, expect, it, vi } from "vitest";

const { getListingMock, getContactsMock } = vi.hoisted(() => ({
  getListingMock: vi.fn(),
  getContactsMock: vi.fn(),
}));

vi.mock("@/server/services/catalog-service", () => ({
  getCatalogSnapshot: vi.fn(),
  getRequestScopedListingBySlug: getListingMock,
}));

vi.mock("@/modules/house-projects", () => ({
  getHouseProject: vi.fn(() => null),
}));

vi.mock("@/server/settings/site-contacts", () => ({
  getPublicSiteContacts: getContactsMock,
}));

import { generateMetadata } from "./page";

function makeListing(overrides: Record<string, unknown> = {}) {
  return {
    id: "property-1",
    slug: "property-1",
    title: "Объект недвижимости",
    h1: null,
    seoTitle: null,
    seoDescription: null,
    dealType: "sale",
    origin: "XML",
    category: "Квартира",
    categoryKey: "flat",
    rooms: 3,
    isStudio: false,
    area: 74,
    city: "Ваш город",
    district: null,
    address: "квартал Гагарина, 1",
    price: 5_000_000,
    status: "active",
    isPublished: true,
    unpublishedAt: null,
    images: [],
    image: null,
    ...overrides,
  };
}

function getAbsoluteMetadataTitle(metadata: Awaited<ReturnType<typeof generateMetadata>>) {
  const title = metadata.title;
  if (title && typeof title === "object" && "absolute" in title && typeof title.absolute === "string") {
    return title.absolute;
  }
  throw new Error("Expected absolute metadata title");
}

describe("property metadata title", () => {
  beforeEach(() => {
    vi.stubEnv("SITE_ENGINE", "prisma");
    getListingMock.mockReset();
    getContactsMock.mockReset();
    getContactsMock.mockResolvedValue({ hidePropertyHouseNumbers: false });
  });

  it.each([
    ["flat", { categoryKey: "flat", rooms: 3, area: 74 }, "Продаётся трёхкомнатная квартира, 74 м² в вашем городе — квартал Гагарина, 1 | АТЛАС"],
    ["house", { categoryKey: "house", category: "Дом", rooms: null, area: 115 }, "Продаётся дом, 115 м² в вашем городе — квартал Гагарина, 1 | АТЛАС"],
    ["land", { categoryKey: "land", category: "Участок", rooms: null, area: null }, "Продаётся земельный участок в вашем городе — квартал Гагарина, 1 | АТЛАС"],
    ["commercial", { categoryKey: "commercial", category: "Коммерция", rooms: null, area: 120 }, "Продаётся коммерческий объект, 120 м² в вашем городе — квартал Гагарина, 1 | АТЛАС"],
    ["construction", { categoryKey: "construction", category: "Строительство", rooms: null, area: 90 }, "Продаётся проект строительства, 90 м² в вашем городе — квартал Гагарина, 1 | АТЛАС"],
    ["reserve", { status: "inactive", isPublished: false, unpublishedAt: "2026-08-20T09:00:00.000Z" }, "Продаётся трёхкомнатная квартира, 74 м² в вашем городе — квартал Гагарина, 1 | АТЛАС"],
  ])("uses one absolute brand for %s", async (_kind, overrides, expectedTitle) => {
    getListingMock.mockResolvedValue(makeListing(overrides));

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "property-1" }) });

    expect(metadata).toMatchObject({
      title: { absolute: expectedTitle },
      openGraph: { title: expectedTitle },
      twitter: { title: expectedTitle },
    });
  });

  it.each([
    ["manual without brand", "Квартира у парка", "Квартира у парка | АТЛАС"],
    ["manual with brand", "Квартира у парка | АТЛАС", "Квартира у парка | АТЛАС"],
    ["manual duplicate brand", "Квартира у парка | АТЛАС | АТЛАС", "Квартира у парка | АТЛАС"],
    ["empty manual title", "   ", "Продаётся трёхкомнатная квартира, 74 м² в вашем городе — квартал Гагарина, 1 | АТЛАС"],
  ])("normalizes %s", async (_case, seoTitle, expectedTitle) => {
    getListingMock.mockResolvedValue(makeListing({ seoTitle }));

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "property-1" }) });

    expect(metadata).toMatchObject({
      title: { absolute: expectedTitle },
      openGraph: { title: expectedTitle },
      twitter: { title: expectedTitle },
    });
  });

  it("distinguishes objects with the same type and area by address", async () => {
    const street = "улица имени Героя Советского Союза";
    getListingMock
      .mockResolvedValueOnce(makeListing({ address: `${street}, 11` }))
      .mockResolvedValueOnce(makeListing({ address: `${street}, 12` }));

    const first = await generateMetadata({ params: Promise.resolve({ slug: "property-1" }) });
    const second = await generateMetadata({ params: Promise.resolve({ slug: "property-2" }) });
    const firstTitle = (first.title as { absolute: string }).absolute;
    const secondTitle = (second.title as { absolute: string }).absolute;

    expect(firstTitle).not.toBe(secondTitle);
    expect(firstTitle).toContain(", 11");
    expect(secondTitle).toContain(", 12");
    expect(firstTitle.length).toBeLessThanOrEqual(90);
    expect(secondTitle.length).toBeLessThanOrEqual(90);
  });

  it("does not expose a configured hidden house number in metadata", async () => {
    getContactsMock.mockResolvedValue({ hidePropertyHouseNumbers: true });
    getListingMock.mockResolvedValue(makeListing({
      origin: "XML",
      categoryKey: "flat",
      address: "Ваш город, улица Советская, 11",
    }));

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "property-1" }) });
    const title = getAbsoluteMetadataTitle(metadata);

    expect(title).toContain("улица Советская");
    expect(title).not.toContain("11");
    expect(metadata.openGraph).toMatchObject({ title });
    expect(metadata.twitter).toMatchObject({ title });
  });

  it("replaces hidden exact-address custom metadata with a safe address variant", async () => {
    const rawAddress = "Ваш город, улица Советская, 11";
    getContactsMock.mockResolvedValue({ hidePropertyHouseNumbers: true });
    getListingMock.mockResolvedValue(makeListing({
      origin: "XML",
      categoryKey: "flat",
      district: "Центр",
      address: rawAddress,
      seoTitle: `Квартира по адресу ${rawAddress}`,
      seoDescription: `Срочная продажа: ${rawAddress}. Ипотека возможна.`,
    }));

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "property-1" }) });
    const title = getAbsoluteMetadataTitle(metadata);

    expect(title).toContain("улица Советская, …");
    expect(title).not.toContain(rawAddress);
    expect(metadata.description).toContain("«АТЛАС» проверит документы");
    expect(metadata.description).not.toContain(", 11");
    expect(metadata.description).not.toContain(rawAddress);
    expect(metadata.openGraph).toMatchObject({ title, description: metadata.description });
    expect(metadata.twitter).toMatchObject({ title, description: metadata.description });
  });

  it("falls back to generated safe metadata for abbreviated custom addresses", async () => {
    getContactsMock.mockResolvedValue({ hidePropertyHouseNumbers: true });
    getListingMock.mockResolvedValue(makeListing({
      origin: "XML",
      categoryKey: "flat",
      district: "Центр",
      address: "Ваш город, улица Советская, 11",
      seoTitle: "Квартира на Советской, 11",
      seoDescription: "Срочная продажа на Советской, 11. Ипотека возможна.",
    }));

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "property-1" }) });
    const title = getAbsoluteMetadataTitle(metadata);

    expect(title).toContain("улица Советская, …");
    expect(title).not.toContain("Советской, 11");
    expect(metadata.description).toContain("«АТЛАС» проверит документы");
    expect(metadata.description).not.toContain(", 11");
    expect(metadata.description).not.toContain("Советской, 11");
    expect(metadata.openGraph).toMatchObject({ title, description: metadata.description });
    expect(metadata.twitter).toMatchObject({ title, description: metadata.description });
  });

  it("hides both house and apartment tokens in generated metadata", async () => {
    getContactsMock.mockResolvedValue({ hidePropertyHouseNumbers: true });
    getListingMock.mockResolvedValue(makeListing({
      origin: "XML",
      categoryKey: "flat",
      address: "Ваш город, ул. Советская, 10, кв. 5",
      seoTitle: "Квартира на Советской, 10",
      seoDescription: "Срочная продажа на Советской, 10, квартира 5.",
    }));

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "property-1" }) });
    const title = getAbsoluteMetadataTitle(metadata);

    expect(title).toContain("ул. Советская, …");
    expect(title).not.toContain(", 10");
    expect(title).not.toContain("кв. 5");
    expect(metadata.description).not.toContain(", 10");
    expect(metadata.description).not.toContain("кв. 5");
    expect(metadata.openGraph).toMatchObject({ title, description: metadata.description });
    expect(metadata.twitter).toMatchObject({ title, description: metadata.description });
  });

  it("keeps custom exact-address overrides when the hide policy is disabled", async () => {
    const rawAddress = "Ваш город, улица Советская, 11";
    const seoTitle = `Квартира по адресу ${rawAddress}`;
    const seoDescription = `Срочная продажа: ${rawAddress}. Ипотека возможна.`;
    getContactsMock.mockResolvedValue({ hidePropertyHouseNumbers: false });
    getListingMock.mockResolvedValue(makeListing({
      origin: "XML",
      categoryKey: "flat",
      address: rawAddress,
      seoTitle,
      seoDescription,
    }));

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "property-1" }) });
    const title = getAbsoluteMetadataTitle(metadata);

    expect(title).toBe(`${seoTitle} | АТЛАС`);
    expect(metadata.description).toBe(seoDescription);
    expect(metadata.openGraph).toMatchObject({ title, description: seoDescription });
    expect(metadata.twitter).toMatchObject({ title, description: seoDescription });
  });

  it("limits a long generated title and description without losing the brand or benefit", async () => {
    getListingMock.mockResolvedValue(makeListing({
      address: "Ваш город, очень длинная улица имени важного исторического события, дом 123, корпус 45, строение 6",
    }));

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "property-1" }) });
    const title = getAbsoluteMetadataTitle(metadata);

    expect(title.length).toBeLessThanOrEqual(90);
    expect(title.endsWith(" | АТЛАС")).toBe(true);
    expect(metadata.description?.length).toBeLessThanOrEqual(160);
    expect(metadata.description).toContain("«АТЛАС» проверит документы");
  });

  it.each([
    ["sale", "Продаётся", "«АТЛАС» проверит документы"],
    ["rent", "Сдаётся", "«АТЛАС» уточнит условия аренды"],
  ])("keeps %s intent in title and description", async (dealType, action, benefit) => {
    getListingMock.mockResolvedValue(makeListing({ dealType }));

    const metadata = await generateMetadata({ params: Promise.resolve({ slug: "property-1" }) });
    const title = getAbsoluteMetadataTitle(metadata);

    expect(title).toContain(action);
    expect(metadata.description).toContain(benefit);
  });
});
