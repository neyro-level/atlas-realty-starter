import { z } from "zod";
import { routes } from "@/project/routes";

const isoDateSchema = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Ожидается дата YYYY-MM-DD");
const optionalUrlSchema = z.string().url().nullable();

export const mediaAssetSchema = z.object({
  src: z.string().min(1),
  alt: z.string().min(3),
  sourceUrl: z.string().url().nullable(),
  checkedAt: isoDateSchema,
});

export const newBuildingSchema = z
  .object({
    sourceId: z.uuid().nullable().optional(),
    slug: z.string().regex(/^[a-z0-9-]+$/),
    status: z.enum(["draft", "published", "archived"]),
    updatedAt: isoDateSchema,
    name: z.string().min(3),
    shortName: z.string().min(2),
    seo: z.object({
      title: z.string().min(3).max(100),
      description: z.string().min(70).max(220),
      h1: z.string().min(3).max(140),
      canonical: z.string().regex(/^\/[a-z0-9-]+$/),
    }),
    positioning: z.string().min(40),
    location: z.object({
      city: z.string().min(2),
      district: z.string().nullable(),
      address: z.string().nullable(),
      latitude: z.number().min(-90).max(90).nullable(),
      longitude: z.number().min(-180).max(180).nullable(),
    }),
    developer: z.object({
      name: z.string().min(2),
      description: z.string().nullable(),
      website: optionalUrlSchema,
    }),
    facts: z.object({
      completionLabel: z.string().nullable(),
      classLabel: z.string().nullable(),
      buildingsLabel: z.string().nullable(),
      apartmentsLabel: z.string().nullable(),
      floorsLabel: z.string().nullable(),
      priceFrom: z.number().int().positive().nullable(),
      areaFrom: z.number().positive().nullable(),
      areaTo: z.number().positive().nullable(),
      formats: z.array(z.string().min(1)).min(1),
      mortgageLabel: z.string().nullable(),
    }),
    verification: z.object({
      factsVerifiedAt: isoDateSchema.nullable(),
      priceVerifiedAt: isoDateSchema.nullable(),
    }),
    sources: z
      .array(
        z.object({
          label: z.string().min(3),
          url: optionalUrlSchema,
          checkedAt: isoDateSchema,
        }),
      )
      .min(1),
    media: z.object({
      hero: mediaAssetSchema.nullable(),
      gallery: z.array(mediaAssetSchema),
      videoUrl: optionalUrlSchema.optional(),
    }),
    audiences: z
      .array(z.object({ title: z.string().min(3), text: z.string().min(20) }))
      .min(4)
      .max(4),
    about: z.object({
      intro: z.string().min(40),
      features: z.array(z.object({ title: z.string().min(3), text: z.string().min(2) })).min(4),
    }),
    layouts: z
      .array(
        z.object({
          id: z.string().regex(/^[a-z0-9-]+$/),
          label: z.string().min(1),
          areaFrom: z.number().positive().nullable(),
          areaTo: z.number().positive().nullable(),
          priceFrom: z.number().int().positive().nullable(),
          image: mediaAssetSchema.nullable(),
        }),
      )
      .min(1),
    purchaseOptions: z
      .array(z.object({ title: z.string().min(3), text: z.string().min(20), value: z.string().nullable() }))
      .min(3),
    infrastructure: z.object({
      intro: z.string().min(30),
      items: z.array(z.object({ title: z.string().min(2), text: z.string().min(15), timeLabel: z.string().nullable() })),
    }),
    purchaseProcess: z
      .array(z.object({ title: z.string().min(3), text: z.string().min(15) }))
      .length(5),
    documents: z
      .array(
        z.object({
          title: z.string().min(3),
          text: z.string().min(2),
          href: optionalUrlSchema,
          statusLabel: z.string().min(3),
        }),
      )
      .min(4),
    faq: z
      .array(z.object({ question: z.string().min(10), answer: z.string().min(25) }))
      .min(6),
    whyAgency: z
      .array(z.object({ title: z.string().min(3), text: z.string().min(20) }))
      .length(4),
    cta: z.object({
      primaryLabel: z.string().min(8),
      secondaryLabel: z.string().min(8),
      microtext: z.string().min(20),
    }),
    relatedSlugs: z.array(z.string().regex(/^[a-z0-9-]+$/)).max(3),
  })
  .superRefine((value, context) => {
    if (value.seo.canonical !== routes.residentialComplex(value.slug)) {
      context.addIssue({
        code: "custom",
        path: ["seo", "canonical"],
        message: "Canonical должен совпадать с коротким slug страницы",
      });
    }

    if (value.facts.areaFrom && value.facts.areaTo && value.facts.areaTo < value.facts.areaFrom) {
      context.addIssue({
        code: "custom",
        path: ["facts", "areaTo"],
        message: "Максимальная площадь не может быть меньше минимальной",
      });
    }

    if (value.relatedSlugs.includes(value.slug)) {
      context.addIssue({
        code: "custom",
        path: ["relatedSlugs"],
        message: "ЖК не может ссылаться сам на себя",
      });
    }

    if (new Set(value.relatedSlugs).size !== value.relatedSlugs.length) {
      context.addIssue({
        code: "custom",
        path: ["relatedSlugs"],
        message: "Связанные slug не должны повторяться",
      });
    }

    if (value.status === "published") {
      const serialized = JSON.stringify(value);
      const forbidden = [/\bTODO\b/i, /example\.com/i, /\[(?:Название|Адрес|Цена|Срок|Уточнить)[^\]]*\]/i];
      if (forbidden.some((pattern) => pattern.test(serialized))) {
        context.addIssue({
          code: "custom",
          path: [],
          message: "Опубликованный ЖК содержит плейсхолдер или тестовое значение",
        });
      }

      if (value.verification.factsVerifiedAt === null) {
        context.addIssue({
          code: "custom",
          path: ["verification", "factsVerifiedAt"],
          message: "Опубликованный ЖК должен иметь дату проверки фактов",
        });
      }

      if (value.facts.priceFrom !== null && value.verification.priceVerifiedAt === null) {
        context.addIssue({
          code: "custom",
          path: ["verification", "priceVerifiedAt"],
          message: "Опубликованная цена должна иметь дату проверки",
        });
      }

      if (!value.sources.some((source) => source.url !== null)) {
        context.addIssue({
          code: "custom",
          path: ["sources"],
          message: "Опубликованный ЖК должен ссылаться минимум на один проверяемый источник",
        });
      }

      if (value.media.hero === null) {
        context.addIssue({
          code: "custom",
          path: ["media", "hero"],
          message: "Опубликованный ЖК должен иметь hero-изображение",
        });
      }
    }
  });

export type NewBuilding = z.infer<typeof newBuildingSchema>;
export type NewBuildingInput = z.input<typeof newBuildingSchema>;
export type NewBuildingMediaAsset = z.infer<typeof mediaAssetSchema>;
