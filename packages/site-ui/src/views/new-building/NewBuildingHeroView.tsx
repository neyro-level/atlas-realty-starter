import type { ReactNode } from "react";

export function NewBuildingHeroView({ name, breadcrumbs, frameClassName }: { name: string; breadcrumbs: ReactNode; frameClassName: string }) {
  return (
    <section className="bg-[var(--surface-card)] text-[var(--text-primary)]">
      <div className={`${frameClassName} pb-7 pt-8 md:pb-9 md:pt-10 lg:pb-10 lg:pt-11`}>
        {breadcrumbs}
        <h1 className="max-w-245 text-heading-extra-large font-extrabold leading-[1.06] text-[var(--text-primary)] md:text-display-large lg:text-[48px]">{name}</h1>
      </div>
    </section>
  );
}
