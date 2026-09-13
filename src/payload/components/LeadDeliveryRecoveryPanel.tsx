'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@payloadcms/ui'

type DeliveryRow = { attempts: number; channel: string; id: string | number; lastError?: string | null; status: string }

export function LeadDeliveryRecoveryPanel() {
  const [rows, setRows] = useState<DeliveryRow[]>([])
  const [busy, setBusy] = useState<string | null>(null)
  const load = useCallback(async () => {
    const response = await fetch('/api/lead-deliveries?depth=0&limit=20&sort=-updatedAt&where[status][in][0]=dead&where[status][in][1]=failed', { credentials: 'same-origin' })
    if (response.ok) setRows((await response.json()).docs ?? [])
  }, [])
  useEffect(() => {
    let active = true
    void fetch('/api/lead-deliveries?depth=0&limit=20&sort=-updatedAt&where[status][in][0]=dead&where[status][in][1]=failed', { credentials: 'same-origin' })
      .then(async (response) => response.ok ? (await response.json()).docs ?? [] : [])
      .then((docs: DeliveryRow[]) => { if (active) setRows(docs) })
    return () => { active = false }
  }, [])
  if (!rows.length) return null

  async function retry(id: string | number) {
    const key = String(id)
    setBusy(key)
    try {
      const response = await fetch(`/api/lead-deliveries/${encodeURIComponent(key)}/retry`, { credentials: 'same-origin', method: 'POST' })
      if (response.ok) await load()
    } finally { setBusy(null) }
  }

  return <section style={{ marginBlock: 16, paddingBlock: 8 }}>
    <h3 style={{ marginTop: 0 }}>Требуют внимания</h3>
    <p>Показаны только технические данные доставки — без имени, телефона и текста заявки.</p>
    <div style={{ display: 'grid', gap: 8 }}>
      {rows.map((row) => <div key={row.id} style={{ alignItems: 'center', display: 'grid', gap: 12, gridTemplateColumns: 'minmax(100px, 1fr) 90px 80px minmax(140px, 2fr) auto' }}>
        <code>{row.channel}</code><span>{row.status}</span><span>Попыток: {row.attempts}</span><span>{row.lastError || 'Ошибка не указана'}</span>
        <Button buttonStyle="secondary" disabled={busy === String(row.id)} margin={false} onClick={() => void retry(row.id)} size="small" type="button">Повторить</Button>
      </div>)}
    </div>
  </section>
}
