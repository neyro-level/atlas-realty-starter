import { Skeleton } from "@ams/realty-ui";

export default function SiteLoading() {
  return (
    <main className="mx-auto min-h-[70vh] w-full max-w-site-frame px-5 py-8" aria-busy="true" aria-label="Загрузка страницы">
      <Skeleton className="h-8 w-44 rounded-lg" />
      <Skeleton className="mt-7 h-[42vh] min-h-72 w-full rounded-xl" />
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => <Skeleton key={index} className="h-52 rounded-xl" />)}
      </div>
    </main>
  );
}
