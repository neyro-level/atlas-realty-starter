import type { PropertyRelatedItemDto } from "../contracts/property";
import { Building2, MapPin } from "lucide-react";
import type { SiteImageRenderer, SiteLinkRenderer } from "../lib/adapters";

export function PropertyRelatedView({
  items,
  linkRenderer: Link,
  imageRenderer: Image,
}: {
  items: PropertyRelatedItemDto[];
  linkRenderer: SiteLinkRenderer;
  imageRenderer: SiteImageRenderer;
}) {
  if (!items.length) return null;

  return (
    <section className="scroll-mt-[140px] grid gap-4 rounded-lg border border-[var(--border)] bg-white p-5 shadow-[var(--shadow-card)] md:p-6" aria-labelledby="object-similar-title">
      <h2 id="object-similar-title" className="scroll-mt-[130px] text-[22px] font-semibold leading-tight text-[var(--text-primary)]">
        Похожие объекты рядом
      </h2>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((item) => (
          <Link
            key={item.id}
            href={item.href}
            target="_blank"
            rel="noopener noreferrer"
            className="group grid overflow-hidden rounded-lg border border-[var(--border)] bg-white transition hover:-translate-y-0.5 hover:border-[var(--input)] hover:shadow-[var(--property-related-shadow-card)]"
          >
            <div className="relative aspect-[4/3] bg-[var(--surface-muted)]">
              {item.image ? (
                <Image
                  src={item.image}
                  alt={item.imageAlt}
                  fill
                  loading="lazy"
                  sizes="(min-width: 1280px) 300px, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-[1.03]"
                />
              ) : (
                <span className="grid h-full place-items-center text-[var(--text-muted)]">
                  <Building2 className="size-7" aria-hidden />
                </span>
              )}
            </div>
            <div className="grid gap-2 p-3">
              <p className="text-[17px] font-semibold leading-none tabular-nums text-[var(--text-primary)]">{item.priceLabel}</p>
              <h3 className="line-clamp-2 text-[13px] font-semibold leading-5 text-[var(--text-primary)]">{item.title}</h3>
              <p className="flex min-w-0 items-center gap-1.5 text-[11px] leading-4 text-[var(--text-muted)]">
                <MapPin className="size-3 shrink-0 text-[var(--accent)]" aria-hidden />
                <span className="truncate">{item.address}</span>
              </p>
              {item.facts.length ? (
                <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold leading-4 text-[var(--text-secondary)]">
                  {item.facts.map((fact) => <span key={fact} className="rounded-md bg-[var(--background)] px-2 py-1">{fact}</span>)}
                </div>
              ) : null}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
