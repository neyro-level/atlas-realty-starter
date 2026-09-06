export function SaleFinalCtaView() {
  return (
    <section className="bg-white py-14 sm:py-16 lg:py-[88px]" aria-labelledby="sale-final-cta-title">
      <div className="mx-auto max-w-site-frame px-5">
        <div className="rounded-xl bg-[var(--text-primary)] px-6 py-12 text-center text-white sm:px-10 sm:py-16 lg:px-16 lg:py-20">
          <h2
            id="sale-final-cta-title"
            className="mx-auto max-w-[820px] text-[24px] font-semibold leading-[1.24] tracking-[-0.03em] text-balance sm:text-[clamp(24px,1.8vw,30px)] sm:leading-[1.2]"
          >
            Работаем за фиксированную комиссию без скрытых платежей
          </h2>
          <p className="mx-auto mt-4 max-w-[720px] text-[15px] leading-6 text-white/70 sm:text-[16px] sm:leading-7">
            Оценка, фотосъёмка, реклама, переговоры и регистрация уже включены в эту сумму.
          </p>

          <button
            type="button"
            data-request-modal
            data-request-modal-title="Получите план продаж объекта недвижимости."
            data-request-modal-subtitle="Оценка, фотосъёмка, реклама, переговоры и регистрация уже включены в эту сумму."
            data-request-modal-source="corporate:prodazha-nedvizhimosti:final"
            data-request-modal-form-type="corporate_prodazha_nedvizhimosti_city"
            className="mt-8 inline-flex min-h-12 w-full items-center justify-center rounded-lg bg-[var(--accent)] px-6 text-sm font-semibold text-white transition hover:bg-[var(--accent-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white sm:w-auto sm:min-w-[260px]"
          >
            Получить план продажи
          </button>
          <p className="mt-3 text-[12px] leading-5 text-white/55">
            Это бесплатно и ни к чему вас не обязывает.
          </p>
        </div>
      </div>
    </section>
  );
}
