import type { CorporateArticlePreviewDto } from "@starter/site-contracts";
import type { SiteLinkRenderer } from "../lib/adapters";
import { Card } from "../components/ui/card";

export function CorporateRelatedArticlesView({ articles, linkRenderer: LinkRenderer }: { articles: CorporateArticlePreviewDto[]; linkRenderer: SiteLinkRenderer }) {
  if (!articles.length) return null;
  return (
    <section className="bg-[var(--journal-surface)] py-10 lg:py-14" aria-labelledby="related-articles-title">
      <div className="mx-auto max-w-site-frame px-5">
        <h2 id="related-articles-title" className="text-2xl font-extrabold text-[var(--text-primary)]">Полезные материалы</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {articles.slice(0, 3).map((article) => (
            <Card key={article.slug} className="rounded-lg border-[var(--border)] bg-white p-5 shadow-none">
              <h3 className="text-lg font-extrabold leading-tight text-[var(--text-primary)]"><LinkRenderer href={`/journal/${article.slug}`} className="transition hover:text-[var(--accent)]">{article.title}</LinkRenderer></h3>
              <p className="mt-3 line-clamp-3 text-sm leading-6 text-[var(--text-secondary)]">{article.excerpt}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
