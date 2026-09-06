# Version matrix

| Component                                | Exact baseline |
| ---------------------------------------- | -------------- |
| Node.js                                  | 24.20.0        |
| pnpm                                     | 11.24.0        |
| Next.js                                  | 16.3.4         |
| React / React DOM                        | 19.2.8         |
| TypeScript                               | 6.0.3          |
| Payload and all `@payloadcms/*` packages | 3.88.0         |
| PostgreSQL                               | 18             |
| Zod                                      | 4.5.4          |
| pino                                     | 9.14.0         |
| saxes                                    | 6.0.0          |
| server-only                              | 0.0.1          |

All direct dependencies are pinned exactly in `package.json` and `pnpm-lock.yaml`. Payload packages must stay on one exact version. Major upgrades are separate HEAVY tasks.

## Compatibility check

Rechecked on 2026-09-06 against the official [Payload installation requirements](https://payloadcms.com/docs/getting-started/installation), the npm stable package metadata and installed package types:

- Payload supports Node.js 20.9+ and Next.js 16.2.6+; the installed Node 24.20.0 and Next.js 16.3.4 are inside that published range.
- `payload` and every installed `@payloadcms/*` package remain on the same exact stable line, 3.88.0.
- The official stable npm tag remains 3.88.0; Payload 4 is prerelease/canary and is not part of this baseline.
- [GHSA-jg8r-5jh2-v2xj](https://github.com/advisories/GHSA-jg8r-5jh2-v2xj) still lists `<= 3.88.0` as affected with no patched version. The mandatory owner-only unlock mitigation is documented in `SECURITY.md` and enforced by project guards/tests.

Compatibility evidence does not authorize an automatic dependency update. Any Next/Payload upgrade requires official-doc verification, generated-artifact checks, targeted security/runtime tests and a HEAVY gate.
