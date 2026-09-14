import type { ElementType } from 'react'

export function LeadgenPromoFooter({
  copyright,
  registry,
  privacyModal: PrivacyModal,
}: {
  copyright: string
  registry: string
  privacyModal: ElementType
}) {
  return (
    <footer
      id="leadgen-footer"
      className="bg-[var(--leadgen-promo-landing-surface-emphasis)] text-white"
    >
      <div className="mx-auto w-full max-w-290 px-5 py-8 sm:px-8 sm:py-9">
        <div className="flex flex-col gap-4 border-t border-white/12 pt-5 text-xs font-medium leading-5 text-white/58 sm:flex-row sm:items-center sm:justify-between">
          <p className="flex flex-col gap-1 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
            <span>{copyright}</span>
            <span>{registry}</span>
          </p>
          <div className="sm:text-right">
            <PrivacyModal />
          </div>
        </div>
      </div>
    </footer>
  )
}
