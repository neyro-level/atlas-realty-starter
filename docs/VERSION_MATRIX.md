# Version matrix

| Component | Exact baseline |
| --- | --- |
| Node.js | 24.20.x |
| pnpm | 11.24.0 |
| Next.js | 16.3.4 |
| React / React DOM | 19.2.8 |
| TypeScript | 6.0.3 |
| Payload and all @payloadcms packages | 3.88.0 |
| PostgreSQL | 18 |
| Zod | 4.5.4 |
| pino | 9.14.0 |

All direct dependencies are pinned exactly in package.json and pnpm-lock.yaml. Payload packages must stay on one exact version. Major upgrades are separate HEAVY tasks.

Verified on 2026-09-04 against official Payload installation requirements: Node 20.9+ and the supported Next.js 16.2.6+ line cover this baseline. Installed package types were also checked for Local API access flags, auth cookies and lockTime.
