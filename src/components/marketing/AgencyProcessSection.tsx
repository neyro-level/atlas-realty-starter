export type AgencyProcessStep = {
  number?: string;
  title: string;
  titleLines?: string[];
  text: string;
};

type AgencyProcessSectionProps = {
  id: string;
  title: string;
  lead?: string;
  steps: AgencyProcessStep[];
};

export function AgencyProcessSection({ id, title, lead, steps }: AgencyProcessSectionProps) {
  const titleId = `${id}-title`;

  return (
    <section id={id} className="bg-white" aria-labelledby={titleId}>
      <div className="mx-auto max-w-site-frame px-5 py-18 md:py-22 lg:py-26">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface-card-soft)] p-5 md:p-8 lg:p-10">
          <div className="mx-auto mb-10 grid max-w-205 gap-5 text-center md:mb-12 lg:mb-14">
            <h2
              id={titleId}
              className="text-section-title font-extrabold leading-section-title text-[var(--text-primary)]"
            >
              {title}
            </h2>
            {lead ? (
              <p className="mx-auto max-w-160 text-body-large leading-7 text-[var(--agency-process-section-content-primary)] md:text-lead">
                {lead}
              </p>
            ) : null}
          </div>

          <div className="grid overflow-hidden rounded-lg border border-[var(--border)] bg-white lg:grid-cols-3">
            {steps.map((step, index) => {
              const number = step.number ?? String(index + 1).padStart(2, "0");
              const isLast = index === steps.length - 1;

              return (
                <article
                  key={`${number}-${step.title}`}
                  className={`relative flex flex-col border-[var(--border)] p-6 md:p-8 lg:min-h-75 lg:p-8 xl:p-10 ${
                    isLast ? '' : 'border-b lg:border-b-0 lg:border-r'
                  }`}
                >
                  <span
                    className="mb-6 block select-none text-[72px] font-black leading-none tracking-normal text-[var(--accent)]/14 md:text-[88px] lg:text-[104px]"
                    aria-hidden
                  >
                    {number}
                  </span>
                  <h3 className="flex min-h-12.25 max-w-100 flex-col justify-start text-heading-small font-bold leading-[1.22] text-[var(--text-primary)] md:min-h-13.5 md:text-heading-compact">
                    {step.titleLines?.length
                      ? step.titleLines.map((line) => (
                          <span key={line} className="block">
                            {line}
                          </span>
                        ))
                      : step.title}
                  </h3>
                  <p className="mt-4 max-w-105 text-body-compact leading-7 text-[var(--agency-process-section-content-secondary)] md:text-body-large">
                    {step.text}
                  </p>
                </article>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
