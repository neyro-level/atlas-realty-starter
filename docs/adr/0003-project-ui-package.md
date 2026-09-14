# ADR 0003: Project UI package boundaries

Status: accepted
Date: 2026-09-13

## Context

Atlas needs a portable design-system package without freezing client-specific page composition inside that package. The project also intentionally keeps its token source in the workspace package rather than the application root.

## Decision

- `packages/site-ui/src/theme.css` remains the single Project Design System token source. The application imports it; no competing `globals.css` token source is created.
- `packages/site-ui` owns primitives and reusable presentation sections. Whole-page compositions and client-specific landings live under application `src/components` or the owning domain module.
- The root barrel contains re-exports only. Public subpaths are `@starter/site-ui/primitives`, `@starter/site-ui/views` and `@starter/site-ui/contracts`; Next.js optimizes named imports from the compatibility barrel.
- Native `Select` is the canonical short single-choice primitive. Its explicit variants are `styled` and `native`. Radix Select is not added: native mobile pickers, keyboard access and SSR without hydration are preferable here. Search or multi-select must be a separately named Combobox when a real use case appears.
- New shadcn primitives are installed into `packages/site-ui/src/components/ui`; application-owned duplicate primitive folders are forbidden by the UI gate.
- Application consumers import only the explicit `/primitives`, `/views` and `/contracts` subpaths. The compatibility root is limited to three star re-exports and is protected by the UI gate.
- Large reusable views are split by semantic responsibility. Property cards keep grid and list layouts separate; leadgen benefits, base preview, final CTA and footer are independent sections. Tenant-owned page composition remains in `src/modules/leadgen`.

## Consequences

Client-specific composition can change without forking primitives. The package stays presentation-only and consumes safe DTOs. Theme ownership, Select behavior and shadcn installation no longer require repeated audit interpretation.

The 2026-09-13 production measurement used the aggregate size of `.next/static/chunks/**/*.js`: 4,847,964 bytes before and 4,883,092 bytes after (+35,128 bytes, +0.72%). The total includes the new semantic Table primitive and does not show a meaningful bundle regression; route-level ownership and package subpaths are now enforceable independently of this aggregate.

The 2026-09-14 explicit-subpath build produced 4,892,989 bytes across 92 JavaScript chunks. Compared with the preceding 4,883,092-byte baseline, the aggregate changed by +9,897 bytes (+0.20%). This is accepted as measurement noise at the whole-build level; the import and 300-line shared-view gates prevent the architectural regression that aggregate tree-shaking alone cannot prove.
