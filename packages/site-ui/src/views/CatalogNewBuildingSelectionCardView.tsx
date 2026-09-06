import { Building2 } from "lucide-react";
import { Button } from "../components/ui/button";
import type { CatalogView } from "./PropertyCardView";

type Props = {
  variant?: CatalogView;
  source?: string;
  formType?: string;
  onRequest?: () => void;
};

export const NEW_BUILDING_SELECTION_CARD_INDEX = 7;

export function CatalogNewBuildingSelectionCardView({
  variant = "grid",
  source = "catalog:new-building-selection-card",
  formType = "new_building_selection_request",
  onRequest,
}: Props) {
  if (variant === "list") {
    return <CatalogNewBuildingSelectionListCard source={`${source}:list`} formType={formType} onRequest={onRequest} />;
  }

  return <CatalogNewBuildingSelectionGridCard source={source} formType={formType} onRequest={onRequest} />;
}

function CatalogNewBuildingSelectionGridCard({ source, formType, onRequest }: { source: string; formType: string; onRequest?: () => void }) {
  return (
    <article className="-m-2 min-w-0 p-2">
      <div className="flex h-full min-h-[342px] flex-col rounded-lg border border-[#E6DCDC] bg-[var(--accent-soft)] p-5 transition duration-300 hover:-translate-y-0.5 hover:border-[#D8C9C9] hover:shadow-[0_1px_2px_rgba(0,0,0,0.03),0_18px_42px_rgba(0,0,0,0.08)]">
        <div className="flex size-11 items-center justify-center rounded-lg bg-white text-[var(--accent)] shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
          <Building2 className="size-5" aria-hidden />
        </div>
        <h3 className="mt-5 text-[1.18rem] font-extrabold leading-[1.25] text-[var(--text-primary)]">
          Объективный подбор новостроек в вашем городе. Бесплатно.
        </h3>
        <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
          Застройщик продаёт свой объект. Мы найдём для вас лучшие условия на всём рынке.
        </p>
        <Button
          type="button"
          data-request-modal-source={source}
          data-request-modal-form-type={formType}
          onClick={onRequest}
          className="mt-auto inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-center text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
        >
          Узнать свои варианты
        </Button>
      </div>
    </article>
  );
}

function CatalogNewBuildingSelectionListCard({ source, formType, onRequest }: { source: string; formType: string; onRequest?: () => void }) {
  return (
    <article className="bg-transparent py-6">
      <div className="grid gap-5 rounded-lg border border-[#E6DCDC] bg-[var(--accent-soft)] p-6 md:grid-cols-[minmax(0,1fr)_260px] md:items-end">
        <div className="max-w-2xl">
          <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[var(--accent)]">Бесплатный подбор</p>
          <h3 className="mt-3 text-[1.45rem] font-extrabold leading-[1.16] text-[var(--text-primary)]">
            Объективный подбор новостроек в вашем городе. Бесплатно.
          </h3>
          <p className="mt-3 text-sm leading-6 text-[var(--text-secondary)]">
            Застройщик продаёт свой объект. Мы найдём для вас лучшие условия на всём рынке.
          </p>
        </div>
        <Button
          type="button"
          data-request-modal-source={source}
          data-request-modal-form-type={formType}
          onClick={onRequest}
          className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[var(--accent)] px-4 text-center text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)]"
        >
          Узнать свои варианты
        </Button>
      </div>
    </article>
  );
}
