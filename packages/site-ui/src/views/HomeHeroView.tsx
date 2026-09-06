import type { HomePageDto } from "@starter/site-contracts";
import type { SiteImageRenderer, SiteLinkRenderer } from "../lib/adapters";
import { Button } from "../components/ui/button";

export type HomeHeroContentDto = {
  eyebrow: string;
  titleLines: [string, string, string];
  leadLines: [string, string];
  cta: string;
  ctaSubtitle: string;
  trustItems: string[];
  image: string;
  imageAlt?: string;
};

type HomeHeroViewProps = {
  featured: HomePageDto["featured"];
  content: HomeHeroContentDto;
  linkRenderer: SiteLinkRenderer;
  imageRenderer: SiteImageRenderer;
};

export function HomeHeroView({ featured, content, linkRenderer: LinkRenderer, imageRenderer: ImageRenderer }: HomeHeroViewProps) {
  return (
    <section id="section-home-hero" className="home-hero" aria-labelledby="home-hero-title">
      <div className="home-shell">
        <div className="home-hero__grid">
          <div className="home-hero__intro">
            <p className="home-eyebrow home-eyebrow--plain">{content.eyebrow}</p>
            <h1 id="home-hero-title" className="home-hero__title">
              <span>{content.titleLines[0]}</span>
              <span>{content.titleLines[1]}</span>
              <span className="home-hero__title-city">{content.titleLines[2]}</span>
            </h1>
            <p className="home-hero__lead">
              <span>{content.leadLines[0]}</span>
              <br className="home-hero__lead-break" />
              <span className="home-hero__lead-second">{content.leadLines[1]}</span>
            </p>
            <div className="home-hero__actions">
              <Button
                type="button"
                className="home-btn-primary"
                data-request-modal
                data-request-modal-title={content.cta}
                data-request-modal-subtitle={content.ctaSubtitle}
                data-request-modal-source="home-hero"
                data-request-modal-form-type="home_hero"
              >
                {content.cta}
              </Button>
              <p className="home-hero__trust tabular-nums">
                {content.trustItems.map((item) => <span key={item}>{item}</span>)}
              </p>
            </div>
          </div>
          <LinkRenderer href={featured.href} className="home-hero__featured group">
            <div className="home-hero__featured-media" aria-hidden>
              <ImageRenderer
                src={content.image}
                alt={content.imageAlt ?? ""}
                fill
                priority
                sizes="(max-width: 980px) 100vw, 40vw"
                className="home-hero__featured-image"
              />
            </div>
            <div className="home-hero__featured-overlay" aria-hidden />
          </LinkRenderer>
        </div>
      </div>
    </section>
  );
}
