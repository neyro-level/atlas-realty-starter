import type { JournalArticleMediaDto } from "@starter/site-contracts";
import type { SiteImageRenderer } from "../../lib/adapters";
import { ArticleGalleryScroller } from "../journal/ArticleGalleryScroller";

export function ArticleGalleryView({ images, title = "Офис агентства недвижимости", className = "", imageRenderer: ImageRenderer }: { images: JournalArticleMediaDto[]; title?: string; className?: string; imageRenderer: SiteImageRenderer }) {
  if (!images.length) return null;
  return <ArticleGalleryScroller imageCount={images.length} title={title} className={className}>{images.map((image, imageIndex) => <figure key={image.src} data-gallery-slide className="journal-article-gallery__slide"><div className="journal-article-gallery__frame"><ImageRenderer src={image.src} alt={image.alt} fill className="object-cover" sizes="(min-width: 1024px) 680px, (min-width: 768px) 70vw, 88vw" priority={imageIndex === 0} /></div></figure>)}</ArticleGalleryScroller>;
}
