import { Building2 } from 'lucide-react'

import { publicSite } from '@/project/public-site'

type BrandMarkProps = {
  compact?: boolean
  inverted?: boolean
  showSlogan?: boolean
  variant?: 'default' | 'header'
  markClassName?: string
}

export function BrandMark({ compact = false, inverted = false, showSlogan = true, variant = 'default', markClassName }: BrandMarkProps) {
  const colorClass = inverted ? 'text-white' : 'text-[#17161a]'
  const sloganClass = inverted ? 'text-white/62' : 'text-[#555555]'
  const markSize = markClassName ?? (variant === 'header' ? (compact ? 'h-[48px] w-[88px] lg:h-[38px] lg:w-[69px]' : 'h-[48px] w-[88px] lg:h-[46px] lg:w-[84px]') : compact ? 'h-[34px] w-[61px]' : 'h-[42px] w-[76px]')

  return (
    <span className="inline-flex shrink-0 items-center gap-2.5">
      <span className={`flex shrink-0 items-center gap-2 ${markSize} ${colorClass}`} aria-label={publicSite.name}>
        <Building2 className="size-6 shrink-0" aria-hidden />
        <span className="grid text-[10px] font-extrabold uppercase leading-[0.95] tracking-[0.06em]"><span>Союз</span><span>Застройщиков</span></span>
      </span>
      {!compact && showSlogan ? <span className={`max-w-[118px] text-[10px] font-semibold leading-[1.18] ${sloganClass}`}>Недвижимость в Ростове-на-Дону</span> : null}
    </span>
  )
}
