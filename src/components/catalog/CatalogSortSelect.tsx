'use client'

import { ArrowUpDown } from 'lucide-react'
import { useRouter } from 'next/navigation'

import type { CatalogSort } from '@/modules/catalog/query'

const options: Array<{ label: string; value: CatalogSort }> = [
  { label: 'Сначала новые', value: 'newest' },
  { label: 'Сначала дешевле', value: 'price-asc' },
  { label: 'Сначала дороже', value: 'price-desc' },
  { label: 'Больше площадь', value: 'area-desc' },
]

export function CatalogSortSelect({ basePath, value }: { basePath: string; value: CatalogSort }) {
  const router = useRouter()
  return <label className="relative inline-flex items-center gap-2"><ArrowUpDown className="size-4 text-[#827f81]" /><span className="sr-only">Сортировка</span><select className="h-10 rounded-lg border border-[#d0d0cd] bg-white px-3 pr-8 text-sm font-semibold" value={value} onChange={(event) => { const params = new URLSearchParams(window.location.search); if (event.target.value === 'newest') params.delete('sort'); else params.set('sort', event.target.value); params.delete('page'); router.push(`${basePath}${params.size ? `?${params}` : ''}`) }}>{options.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select></label>
}
