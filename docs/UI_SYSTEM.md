# UI system

This document implements AMS UI Core v5.0 for a public real-estate product. The active layering is `Project Design System -> Tailwind theme -> shadcn primitives -> shared UI -> realty domain UI -> page composition`. Payload Admin stays CMS-native.

## Ownership

`packages/site-ui` (`@starter/site-ui`) is the starter's internal component and view library. It is part of this repository and is not published to npm or installed from a remote Registry. Application routes compose its views but do not create a second design system. Payload, database access, secrets, project identity and project-specific fetching are forbidden inside the package. Tenant identity and theme values belong to the Project Design System and `SiteProfile`.

The root and package `components.json` files keep the same local ShadCN style, React Server Components mode, TypeScript mode, base color and Lucide icon library. New primitives are added into `packages/site-ui` and then admitted through its public exports. `pnpm ui:shadcn:info` provides a Windows-safe CLI entry when a checkout name begins with a numbered dot prefix.

## Tokens

`packages/site-ui/src/theme.css` is the only global token source. Manrope is the sole primary font. Brand, surfaces, text, borders, focus, status colors, radius, shadows, spacing and motion use semantic CSS variables. Application components must not add raw HEX values or import Radix directly; `pnpm ui:check` enforces both boundaries.

The package-owned `theme.css` decision is the accepted Project Design System implementation for this starter: it is portable with the repository and remains the only numeric token source. The completed v5 migration contains 1,004 referenced semantic, project and component-role declarations, zero numbered compatibility aliases and zero unresolved or unused root tokens. `pnpm ui:tokens` fails on both missing references and newly introduced dead root tokens.

Typography is governed by the same token source. Page and component code uses semantic Tailwind aliases emitted from `theme.css`; CSS-only rules use the corresponding `site-type`, `site-leading` and `site-tracking` variables. Default Tailwind text/leading/tracking scales and raw numeric typography are forbidden. `pnpm ui:typography` enforces a zero baseline across all nine tracked categories.

Dark mode is class-based through `@custom-variant dark`, as required by UI Core v5.0. Atlas remains intentionally light-only: application code does not attach `.dark`, and `pnpm ui:check` rejects any attempt to activate it.

The mortgage and lawyer service pages are the canonical reference for normal commercial page typography. Commercial first-screen H1 uses `text-page-title leading-page-title` (`clamp(30px, 3.75vw, 52px)`), and every ordinary commercial section H2 uses `text-section-title leading-section-title` (`clamp(24px, 1.8vw, 30px)`). Card titles use `text-body-emphasis`, `text-body-large` or an approved `text-heading-*` role; body copy uses `text-body` or `text-body-compact`; supporting labels use `text-support`, `text-caption` or `text-label`. The home page and shared marketing blocks obey the same scale and must not introduce a parallel H2 hierarchy.

The journal has one explicit editorial hierarchy, confirmed against its hub, category and article routes. Hub/category/article H1 uses `text-editorial-title leading-editorial-title` (`clamp(28px, 3vw, 38px)`), article section H2 uses `text-editorial-heading leading-editorial-heading` (`clamp(22px, 1.8vw, 25px)`), and long-form copy uses `text-editorial-body leading-editorial-body` (`16px/1.75`). Promotional inserts inside an article remain card-level UI and do not inherit the article heading role. `pnpm ui:typography` rejects oversized commercial H2, non-editorial journal page titles and raw heading sizes in governed shared-marketing files.

## Shared components

The internal UI package owns ShadCN Button, Card, Badge, Dialog, Carousel, Aspect Ratio, Scroll Area, Skeleton, Tabs, Form, Field, Input, Textarea, Select and Checkbox plus neutral realty gallery, catalog cards, filters, request forms and CTA blocks. Shared components never contain client branding, domains, legal data or city-specific copy.

The shell layer owns the neutral Container, Section, SectionHeader, responsive Header, navigation and Footer contract, including its explicit stylesheet. Site identity, contact values, links and brand assets enter only through typed props. Buttons use semantic variants, Checkbox is the only binary form control, and Button controls inherit the canonical icon size unless a non-button composition owns the icon.

Global shell CSS contains only shared surface/link utilities. Request modal and footer styles are owned by `request-modal.css` and `site-footer.css`; page code must not rely on their incidental global presence.

Home, leadgen promo and journal styles are route-owned imports (`home-page.css`, `promo.css`, `journal.css`) instead of global `styles.css` dependencies. Their component tokens use named roles, and tenant copy/media remain in application wrappers or page data rather than shared components.

The new-buildings domain in `packages/site-ui` contains the catalog, detail and conversion views behind one public package API. Application wrappers provide brand, city, expert identity and portrait, optional verified rating, Next adapters, Payload-derived DTOs and typed request context.

Catalog, map, property-card and property-detail views are neutral modules of the internal package. Their contracts are presentation DTOs; application adapters remain responsible for translating `SiteEngine` DTOs. Catalog, property, session-collection and residential-complex views use semantic tokens and do not import `home.css` or Payload documents.

On mobile and tablet, the main `/nedvizhimost` catalog uses a compact hero, tenant-owned quick-category copy, one collapsed filter-and-sort entry and a contextual bottom selection action. Grid cards keep their full-card link and expose a visible `Подробнее` affordance instead of duplicating phone and chat actions inside every card. Category pages retain their existing filter composition. Desktop layout and interactions remain unchanged.

`packages/site-ui/src/lib/realty-format.ts` is the single presentation formatter for ruble prices, compact prices, areas, floor labels and Russian count forms. Shared and application views use this module instead of creating local `Intl` or pluralization implementations. Server DTO adapters remain independent from the UI package.

New UI follows `reuse -> variant -> create`. Application components do not import Radix directly and do not recreate native controls when an admitted primitive or semantic variant exists.

`MediaGallery` is the only gallery API used by property and residential-complex pages. It wraps Embla through ShadCN Carousel and `yet-another-react-lightbox` with thumbnails, counter, zoom and fullscreen. The wrapper owns focus restore, keyboard and touch behavior, scroll locking, preload limits, empty/single states and project-token styling; application code must not import the lightbox directly.

The carousel and its first visible image stay in the initial page path. Fullscreen lightbox code and plugins load only after the visitor opens a photo, so routes do not pay that client-JavaScript cost during the first render.

The `/novostroyki` mobile showcase uses one large complex card with the edge of the next card visible. Each card has one image and one horizontal swipe owner; nested image swiping and autoplay are forbidden. Tablet and desktop keep the normal list/grid/map showcase, with list as the route default.

## Visual and media gates

- `pnpm test:visual` compares the key routes at 390, 768, 1280 and 1440 px.
- `pnpm ui:check` rejects raw colors outside the theme, palette tokens, arbitrary shadows, native controls outside primitives, legacy modal event bridges, direct Radix imports outside primitives, oversized page compositions, identity drift, duplicate static images and static images above 512 KiB. All migrated UI debt ceilings are zero.
- The UI Core v5 baseline in `scripts/quality/ui-debt-baseline.json` and `scripts/quality/typography-baseline.json` is zero in every covered category. The guards reject numbered or dead tokens, raw typography, repeated arbitrary layout, unstyled controls, checkbox misuse, `space-x/y`, manual Button icon sizing, project assets and hardcoded business claims inside shared UI.
- `pnpm images:optimize` converts only oversized PNG files to high-quality WebP, updates tracked references and removes proven duplicates.
- Logos, UI graphics, social previews and small fallbacks may stay in Git. Property and ЖК photography belongs to Payload Media and persistent local/S3 storage.

The active identity lives in `src/project/tenant.config.ts`; `pnpm init:tenant` replaces its managed values together with the root package name, README tenant block and local `.env`. Project themes override neutral semantic tokens without changing component APIs. `templates/site-profile.neutral.json` and `pnpm template:profile` remain the reviewed design-profile path for a new city. The neutral preset contains no tenant theme or coordinates; map activation requires reviewed coordinates. One client still receives its own repository, database, S3 bucket and deployment contour.

`RequestForm` is the canonical React Hook Form + Zod entry point for inline leads. Overlay triggers use the shared typed context instead of DOM events or `data-*` dispatch attributes. All lead entry points retain the same server action, phone normalization, consent, honeypot, idempotency and server-error contract.
