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

## Consequences

Client-specific composition can change without forking primitives. The package stays presentation-only and consumes safe DTOs. Theme ownership, Select behavior and shadcn installation no longer require repeated audit interpretation.

The 2026-09-13 production measurement used the aggregate size of `.next/static/chunks/**/*.js`: 4,847,964 bytes before and 4,883,092 bytes after (+35,128 bytes, +0.72%). The total includes the new semantic Table primitive and does not show a meaningful bundle regression; route-level ownership and package subpaths are now enforceable independently of this aggregate.
