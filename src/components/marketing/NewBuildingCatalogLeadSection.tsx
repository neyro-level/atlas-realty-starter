import { AgencyInlineLeadForm } from "@/components/marketing/AgencyInlineLeadForm";

export function NewBuildingCatalogLeadSection() {
  return (
    <section id="novostroyki-selection" className="bg-white py-12 sm:py-16 lg:py-20" aria-labelledby="novostroyki-selection-title">
      <div className="mx-auto max-w-site-frame px-5"><div className="rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] px-5 py-11 shadow-[var(--catalog-controls-shadow-panel)] sm:px-10 sm:py-14 lg:px-14 lg:py-16"><div className="mx-auto max-w-210 text-center"><h2 id="novostroyki-selection-title" className="text-section-large font-semibold leading-[1.13] sm:text-display-small"><span className="block">Получите цены, планировки</span><span className="block">и актуальное наличие квартир</span></h2><p className="mt-3 text-sm leading-6 text-[var(--text-secondary)] sm:text-body-compact">Специалист уточнит вашу задачу и сравнит подходящие варианты в нескольких жилых комплексах Краснодара.</p></div><div className="mx-auto max-w-240"><AgencyInlineLeadForm sourcePage="/novostroyki" source="catalog:novostroyki:inline" formType="new_building_prices_plans_request" message="Новостройки Краснодара: запрос цен, планировок и актуального наличия квартир." submitLabel="Получить подборку" centerConsent /></div></div></div>
    </section>
  );
}
