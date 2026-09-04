import React from 'react'

import { projectConfig } from '@/project/config'

function initials(value: string) {
  return value
    .split(/\s+/)
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
}

export function BrandIcon() {
  return (
    <div
      style={{
        alignItems: 'center',
        background: 'linear-gradient(135deg, #0e2a3a 0%, #bc6c25 100%)',
        borderRadius: 14,
        color: '#fff',
        display: 'flex',
        fontSize: 14,
        fontWeight: 700,
        height: 32,
        justifyContent: 'center',
        letterSpacing: '0.08em',
        textTransform: 'uppercase',
        width: 32,
      }}
    >
      {initials(projectConfig.projectName)}
    </div>
  )
}
