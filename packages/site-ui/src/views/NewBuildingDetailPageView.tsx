import type { ReactNode } from "react";

export function NewBuildingDetailPageView({ hero, content, sidebar, frameClassName }: { hero: ReactNode; content: ReactNode; sidebar: ReactNode; frameClassName: string }) {
  return (
    <main className="min-h-screen bg-white text-[#1f1f1f]">
      {hero}
      <section className="bg-white pb-14 text-[var(--text-primary)] md:pb-18 lg:pb-22">
        <div className={frameClassName}><div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_324px] xl:grid-cols-[minmax(0,1fr)_342px]"><div className="min-w-0">{content}</div>{sidebar}</div></div>
      </section>
    </main>
  );
}
