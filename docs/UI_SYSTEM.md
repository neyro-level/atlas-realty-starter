# UI system

This document implements AMS UI Development Constitution 3.1 for the public Atlas product. The active layering is `Project Design System -> Tailwind theme -> shadcn primitives -> shared UI -> realty domain UI -> page composition`. Payload Admin stays CMS-native.

## Ownership

`packages/site-ui` (`@ams/realty-ui`) owns neutral reusable presentation primitives and views. Application routes compose those views but do not create a second design system. Payload, database access, secrets, project identity and project-specific fetching are forbidden inside the package. Atlas identity and theme values belong to the Project Design System and `SiteProfile`.

The root and package `components.json` files must keep the same ShadCN style, React Server Components mode, TypeScript mode, base color and icon library. `registry.json` and `packages/site-ui/registry.json` are validated with `pnpm ui:registry:check`.

## Tokens

`packages/site-ui/src/theme.css` is the only global token source. Manrope is the sole primary font. Brand, surfaces, text, borders, focus, status colors, radius, shadows, spacing and motion use semantic CSS variables. Application components must not add raw HEX values or import Radix directly; `pnpm ui:check` enforces both boundaries.

## Shared components

The private AMS registry owns ShadCN Button, Card, Badge, Dialog, Carousel, Aspect Ratio, Scroll Area, Skeleton, Tabs, Form, Field, Input, Textarea, Select and Checkbox plus neutral realty gallery, catalog cards, filters, request forms and CTA blocks. Registry items use the `ams-realty-*` namespace and never contain client branding, domains, legal data or city-specific copy.

`ams-realty-new-building` is the umbrella Registry item for the complete residential-complex presentation module. It installs the separate `catalog`, `detail` and `conversion` items, their neutral view models and every required Registry dependency. Atlas wrappers provide brand, city, expert identity and portrait, optional verified rating, Next adapters, Payload-derived DTOs and typed request context. `pnpm ui:registry:consumer` builds the items and verifies their clean dependency closure without relying on the Atlas application.

New UI follows `reuse -> variant -> create`. Application components do not import Radix directly and do not recreate native controls when an admitted primitive or semantic variant exists.

`MediaGallery` is the only gallery API used by property and residential-complex pages. It wraps Embla through ShadCN Carousel and `yet-another-react-lightbox` with thumbnails, counter, zoom and fullscreen. The wrapper owns focus restore, keyboard and touch behavior, scroll locking, preload limits, empty/single states and Atlas token styling; application code must not import the lightbox directly.

The `/novostroyki` mobile showcase uses one large complex card with the edge of the next card visible. Each card has one image and one horizontal swipe owner; nested image swiping and autoplay are forbidden. Tablet and desktop keep the normal list/grid/map showcase, with list as the route default.

## Visual and media gates

- `pnpm test:visual` compares the key routes at 390, 768, 1280 and 1440 px.
- `pnpm ui:check` rejects raw colors outside the theme, palette tokens, arbitrary shadows, native controls outside primitives, legacy modal event bridges, direct Radix imports outside primitives, oversized page compositions, identity/registry drift, duplicate static images and static images above 512 KiB. All migrated UI debt ceilings are zero.
- `pnpm images:optimize` converts only oversized PNG files to high-quality WebP, updates tracked references and removes proven duplicates.
- Logos, UI graphics, social previews and small fallbacks may stay in Git. Property and ЖК photography belongs to Payload Media and persistent local/S3 storage.

The active identity lives in `src/project/site-profile.ts`. Project themes override neutral semantic tokens without changing component APIs. `templates/site-profile.neutral.json` and `pnpm template:profile` provide a neutral starting profile for a new city. The neutral preset contains no Atlas theme or Краснодар coordinates; map activation requires reviewed coordinates. The generator also emits a brand asset manifest and deployment checklist into `.ams-client/`. One client still receives its own repository, database, S3 bucket and deployment contour.

`RequestForm` is the canonical React Hook Form + Zod entry point for inline leads. Overlay triggers use the registry-owned typed context instead of DOM events or `data-*` dispatch attributes. All lead entry points retain the same server action, phone normalization, consent, honeypot, idempotency and server-error contract.
