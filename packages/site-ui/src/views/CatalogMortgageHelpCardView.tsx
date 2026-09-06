import { Button } from "../components/ui/button";
import type { SiteImageRenderer } from "../lib/adapters";
import type { CatalogView } from "./PropertyCardView";

const MORTGAGE_SERVICE_IMAGE = "/images/catalog-mortgage-service.png";

export const CATALOG_MORTGAGE_HELP_CARD_INDEX = 8;

type Props = {
  variant?: CatalogView;
  placement?: "catalog" | "new-building";
  source?: string;
  formType?: string;
  imageRenderer: SiteImageRenderer;
  onRequest?: (source: string, formType: string) => void;
};

export function CatalogMortgageHelpCardView({
  variant = "grid",
  placement = "catalog",
  source = "catalog:mortgage-help-card",
  formType = "mortgage_catalog_request",
  imageRenderer,
  onRequest,
}: Props) {
  if (variant === "list") {
    return <CatalogMortgageEditorialListCard source={`${source}:list`} formType={formType} imageRenderer={imageRenderer} onRequest={onRequest} />;
  }

  if (placement === "new-building") {
    return <CatalogMortgageGridCard source={source} formType={formType} imageRenderer={imageRenderer} onRequest={onRequest} />;
  }

  return <CatalogMortgageInlineGridCard source={source} formType={formType} imageRenderer={imageRenderer} onRequest={onRequest} />;
}

type CardProps = {
  source: string;
  formType: string;
  imageRenderer: SiteImageRenderer;
  onRequest?: (source: string, formType: string) => void;
};

function CatalogMortgageInlineGridCard({ source, formType, imageRenderer: ImageRenderer, onRequest }: CardProps) {
  return (
    <article className="group col-span-full overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] transition duration-300 hover:border-[#D8D2CD] hover:shadow-[0_4px_8px_rgba(0,0,0,0.02),0_22px_52px_rgba(0,0,0,0.09)]">
      <div className="grid md:grid-cols-[minmax(300px,0.9fr)_minmax(0,1.1fr)]">
        <div className="relative h-[220px] overflow-hidden bg-[var(--surface-muted)] md:h-auto md:min-h-[252px]">
          <ImageRenderer
            src={MORTGAGE_SERVICE_IMAGE}
            alt="Планировка, документы, ключи и калькулятор для ипотечного сервиса"
            fill
            sizes="(min-width: 1280px) 560px, (min-width: 768px) 45vw, 100vw"
            className="object-cover object-center transition duration-700 group-hover:scale-[1.018]"
          />
          <div className="absolute inset-y-0 right-0 hidden w-24 bg-gradient-to-l from-[var(--surface-card-soft)] to-transparent md:block" aria-hidden />
        </div>

        <div className="flex min-h-[252px] flex-col justify-center p-6 sm:p-8 lg:px-10 lg:py-8">
          <div className="max-w-[640px]">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">Бесплатная услуга</p>
            <h3 className="mt-4 text-[1.45rem] font-extrabold leading-[1.16] tracking-[-0.01em] text-[var(--text-primary)] md:text-[1.75rem]">
              <MortgageHelpTitle />
            </h3>
            <p className="mt-3 max-w-[560px] text-sm leading-6 tracking-[0.01em] text-[var(--text-secondary)] md:text-[15px]">
              <MortgageHelpSubtitle />
            </p>
          </div>

          <div className="mt-7">
            <Button
              type="button"
              data-request-modal-source={source}
              data-request-modal-form-type={formType}
              onClick={() => onRequest?.(source, formType)}
              className="inline-flex min-h-10 items-center justify-center rounded-lg bg-[var(--surface-dark)] px-5 text-sm font-semibold text-white transition hover:bg-[var(--accent)]"
            >
              Помощь с ипотекой
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function CatalogMortgageGridCard({ source, formType, imageRenderer: ImageRenderer, onRequest }: CardProps) {
  return (
    <article className="group flex h-[470px] min-w-0 flex-col overflow-hidden rounded-lg border border-[var(--border)] bg-white transition duration-300 hover:border-[#D8D2CD] hover:shadow-[0_1px_2px_rgba(0,0,0,0.03),0_18px_42px_rgba(0,0,0,0.08)]">
      <div className="relative h-[214px] overflow-hidden bg-[#F4F1EC]">
        <ImageRenderer
          src={MORTGAGE_SERVICE_IMAGE}
          alt="Планировка, документы, ключи и калькулятор для ипотечного сервиса"
          fill
          sizes="(min-width: 1280px) 395px, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-500 group-hover:scale-[1.018]"
        />
      </div>

      <div className="flex flex-1 flex-col p-5 text-center">
        <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">Бесплатная услуга</p>
        <h3 className="mt-3 text-[21px] font-extrabold leading-[1.16] tracking-[0] text-[var(--text-primary)]">
          <MortgageHelpTitle />
        </h3>
        <p className="mx-auto mt-4 max-w-[320px] text-sm leading-6 text-[var(--text-secondary)]">
          <MortgageHelpSubtitle />
        </p>

        <div className="mt-auto">
          <Button
            type="button"
            data-request-modal-source={source}
            data-request-modal-form-type={formType}
            onClick={() => onRequest?.(source, formType)}
            className="inline-flex min-h-9 items-center justify-center border-b border-[var(--accent)]/35 px-0 text-sm font-extrabold text-[var(--accent)] transition hover:border-[var(--accent-hover)] hover:text-[var(--accent-hover)]"
          >
            Помощь с ипотекой <span aria-hidden="true" className="ml-1 transition group-hover:translate-x-0.5">→</span>
          </Button>
        </div>
      </div>
    </article>
  );
}

function CatalogMortgageEditorialListCard({ source, formType, imageRenderer: ImageRenderer, onRequest }: CardProps) {
  return (
    <article className="group bg-transparent py-6">
      <div className="overflow-hidden rounded-lg border border-[var(--border)] bg-[#F7F5F2] transition duration-300 group-hover:border-[#D8D2CD] group-hover:shadow-[0_4px_8px_rgba(0,0,0,0.02),0_22px_52px_rgba(0,0,0,0.10)]">
        <div className="grid md:grid-cols-[minmax(0,1fr)_390px] xl:grid-cols-[minmax(0,1fr)_440px]">
          <div className="flex min-h-[266px] flex-col justify-between gap-8 p-6 sm:p-8 lg:p-10">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--text-muted)]">Ипотечный центр агентства недвижимости</p>
                <span className="h-px w-10 bg-[var(--accent)]/24" aria-hidden />
                <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">Бесплатная услуга</p>
              </div>
              <h3 className="mt-4 max-w-[690px] text-[1.45rem] font-extrabold leading-[1.16] tracking-[-0.01em] text-[var(--text-primary)] md:text-[1.8rem]">
                <MortgageHelpTitle />
              </h3>
              <p className="mt-3 max-w-[590px] text-sm leading-6 tracking-[0.01em] text-[var(--text-secondary)] md:text-[15px]">
                <MortgageHelpSubtitle />
              </p>
            </div>

            <MortgageHelpButton source={source} formType={formType} onRequest={onRequest} />
          </div>

          <div className="relative h-[220px] overflow-hidden bg-[#F4F1EC] md:h-auto">
            <ImageRenderer
              src={MORTGAGE_SERVICE_IMAGE}
              alt="Планировка, документы, ключи и калькулятор для ипотечного сервиса"
              fill
              sizes="(min-width: 1280px) 440px, (min-width: 768px) 390px, 100vw"
              className="object-cover object-center transition duration-700 group-hover:scale-[1.018]"
            />
            <div className="absolute inset-y-0 left-0 hidden w-24 bg-gradient-to-r from-[#F7F5F2] to-transparent md:block" aria-hidden />
          </div>
        </div>
      </div>
    </article>
  );
}

function MortgageHelpTitle() {
  return (
    <>
      <span className="md:hidden">Поможем получить одобрение ипотеки по выгодной ставке</span>
      <span className="hidden md:block">
        <span className="block">Поможем получить одобрение</span>
        <span className="block">ипотеки по выгодной ставке</span>
      </span>
    </>
  );
}

function MortgageHelpSubtitle() {
  return (
    <>
      <span className="md:hidden">Разберем ситуацию, подберем программу и подготовим документы к подаче в банк</span>
      <span className="hidden md:block">
        <span className="block">Разберем ситуацию, подберем программу,</span>
        <span className="block">и подготовим документы к подаче в банк</span>
      </span>
    </>
  );
}

function MortgageHelpButton({ source, formType, onRequest }: Pick<CardProps, "source" | "formType" | "onRequest">) {
  return (
    <Button
      type="button"
      data-request-modal-source={source}
      data-request-modal-form-type={formType}
      onClick={() => onRequest?.(source, formType)}
      className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg bg-[var(--surface-dark)] px-5 text-center text-sm font-semibold text-white transition hover:bg-[#2A292C]"
    >
      Помощь с ипотекой
    </Button>
  );
}
