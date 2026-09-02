import React from 'react'
import { projectConfig } from '@/project/config'

export function BrandLogo() {
  return (
    <div
      style={{
        alignItems: 'center',
        display: 'flex',
        gap: 12,
      }}
    >
      <div
        style={{
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0e2a3a 0%, #bc6c25 100%)',
          borderRadius: 16,
          color: '#fff',
          display: 'flex',
          fontSize: 14,
          fontWeight: 700,
          height: 40,
          justifyContent: 'center',
          letterSpacing: '0.08em',
          textTransform: 'uppercase',
          width: 40,
        }}
      >
        {projectConfig.projectName.split(/\s+/).map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 700, lineHeight: 1.2 }}>{projectConfig.adminTitleSuffix}</div>
        <div style={{ color: '#55636e', fontSize: 12, lineHeight: 1.2 }}>Payload кабинет</div>
      </div>
    </div>
  )
}
