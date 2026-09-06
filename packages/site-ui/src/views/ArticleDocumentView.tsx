import type { ArticleDocumentBlockDto, JournalArticlePageDto } from "@starter/site-contracts";
import type { ReactNode } from "react";
import type { SiteImageRenderer } from "../lib/adapters";
import { ArticleGalleryView } from "./ArticleGalleryView";

export function ArticleDocumentView({ page, imageRenderer: ImageRenderer, renderShowcase }: { page: JournalArticlePageDto; imageRenderer: SiteImageRenderer; renderShowcase: () => ReactNode }) {
  return <div className="space-y-9 text-[15px] leading-7 text-[var(--journal-body)] md:space-y-10 md:text-[16px]">
    {page.lead ? <p className="max-w-[740px] text-[16px] leading-7 md:text-[17px]">{page.lead}</p> : null}
    {page.galleryBeforeBody && page.gallery.length ? <div className="max-w-[740px]"><ArticleGalleryView images={page.gallery} imageRenderer={ImageRenderer} /></div> : null}
    {page.sections.map((section, index) => {
      const showHere = page.showcase?.afterSectionIndex === index;
      return <div key={section.id} className="space-y-9 md:space-y-10"><section id={section.id} className={`max-w-[740px] ${page.article.document ? "scroll-mt-28" : "scroll-mt-[132px]"} space-y-4`}><h2 className="text-[22px] font-semibold leading-tight text-[var(--text-primary)] md:text-[25px]">{section.title}</h2>{section.media ? <figure className="overflow-hidden rounded-lg border border-[var(--journal-media-border)] bg-[var(--journal-media-surface)] shadow-[var(--journal-shadow-media)]"><div className={`relative w-full overflow-hidden bg-[var(--journal-media-frame)] ${section.media.frameClassName ?? "aspect-[16/9]"}`}><ImageRenderer src={section.media.src} alt={section.media.alt} fill className={section.media.objectClassName ?? "object-cover"} sizes="(min-width: 1280px) 760px, (min-width: 768px) 80vw, 100vw" /></div></figure> : null}{section.blocks.map(renderBlock)}{showHere && page.showcase?.insideSection ? renderShowcase() : null}</section>{page.galleryAfterSectionIndex === index && page.gallery.length ? <div className="max-w-[740px]"><ArticleGalleryView images={page.gallery} imageRenderer={ImageRenderer} /></div> : null}{showHere && !page.showcase?.insideSection ? renderShowcase() : null}</div>;
    })}
  </div>;
}

function renderBlock(block: ArticleDocumentBlockDto, index: number) {
  if (block.type === "paragraph") return <p key={`${block.type}-${index}`}>{block.text}</p>;
  if (block.type === "list") return <ul key={`${block.type}-${index}`} className={block.style === "checklist" ? "space-y-2" : "list-disc space-y-2 pl-6"}>{block.items.map((item) => <li key={item} className={block.style === "checklist" ? "flex gap-3" : undefined}>{block.style === "checklist" ? <span className="mt-1 text-[var(--accent)]">[ ]</span> : null}<span>{item}</span></li>)}</ul>;
  return <div key={`${block.type}-${index}`} className="rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] p-4 md:p-5"><p className="text-sm font-semibold tracking-[.02em] text-[var(--accent)]">{block.title}</p>{block.style === "checklist" ? <ul className="mt-3 space-y-2">{block.body.map((item) => <li key={item} className="flex gap-3"><span className="mt-1 text-[var(--accent)]">[ ]</span><span>{item}</span></li>)}</ul> : <div className="mt-3 space-y-3">{block.body.map((text) => <p key={text}>{text}</p>)}</div>}</div>;
}
