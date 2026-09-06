import type { ReactNode } from "react";

export function ReviewsPageView({ hero, reviews, consultation }: { hero: ReactNode; reviews: ReactNode; consultation: ReactNode }) {
  return <main className="min-h-screen bg-white text-[var(--text-primary)]">{hero}{reviews}{consultation}</main>;
}
