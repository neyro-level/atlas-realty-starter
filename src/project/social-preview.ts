export const defaultSocialPreviewPath = "/images/brand/atlas-social-preview.svg";

export const defaultSocialPreview = {
  url: defaultSocialPreviewPath,
  alt: "АТЛАС — агентство недвижимости в Краснодаре",
  width: 1200,
  height: 630,
} as const;

export function socialImage(path: string | null | undefined, alt: string = defaultSocialPreview.alt) {
  return {
    url: path || defaultSocialPreviewPath,
    alt,
    width: defaultSocialPreview.width,
    height: defaultSocialPreview.height,
  };
}
