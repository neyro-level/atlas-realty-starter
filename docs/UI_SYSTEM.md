# UI system

This document implements AMS UI Development Constitution 3.1 for the public Atlas product. The active layering is `Project Design System -> Tailwind theme -> shadcn primitives -> shared UI -> realty domain UI -> page composition`. Payload Admin stays CMS-native.

## Ownership

The private SourceCraft repository `integrator-p/ams-ui-registry` is the canonical distribution source for admitted reusable components. `packages/site-ui` (`@ams/realty-ui`) is Atlas's private development mirror and composition package; it is not published to npm. Application routes compose those views but do not create a second design system. Payload, database access, secrets, project identity and project-specific fetching are forbidden inside the package. Atlas identity and theme values belong to the Project Design System and `SiteProfile`.

The root and package `components.json` files keep the same ShadCN style, React Server Components mode, TypeScript mode, base color, icon library and authenticated `@ams` namespace. The namespace resolves `https://ui.ams24.ru/r/{name}.json` and reads its bearer credential only from `AMS_UI_REGISTRY_TOKEN`. `registry.json` and `packages/site-ui/registry.json` are validated with `pnpm ui:registry:check`; `pnpm ui:shadcn:info` provides a Windows-safe CLI entry when a checkout name begins with a numbered dot prefix.

## Tokens

`packages/site-ui/src/theme.css` is the only global token source. Manrope is the sole primary font. Brand, surfaces, text, borders, focus, status colors, radius, shadows, spacing and motion use semantic CSS variables. Application components must not add raw HEX values or import Radix directly; `pnpm ui:check` enforces both boundaries.

The canonical token groups are `surface`, `content`, `border`, `action`, `status`, `typography`, `spacing`, `radius`, `shadow`, `container` and `motion`. The initial Constitution 3.1 inventory contained exactly 752 declarations: 67 semantic foundation tokens, 30 project/theme tokens, 579 used numbered component tokens and 76 compatibility or dead candidates. The completed migration contains 851 declared semantic/project/component-role tokens, zero numbered tokens, zero compatibility aliases and zero unresolved references. `pnpm ui:tokens` enforces that contract for every migrated domain.

## Shared components

The private AMS registry owns ShadCN Button, Card, Badge, Dialog, Carousel, Aspect Ratio, Scroll Area, Skeleton, Tabs, Form, Field, Input, Textarea, Select and Checkbox plus neutral realty gallery, catalog cards, filters, request forms and CTA blocks. Registry items use the `ams-realty-*` namespace and never contain client branding, domains, legal data or city-specific copy.

`ams-realty-shell` owns the neutral Container, Section, SectionHeader, responsive Header, navigation and Footer contract, including its explicit shell stylesheet. Site identity, contact values, links and brand assets enter only through typed props. Buttons use semantic variants, Checkbox is the only binary form control, and Button controls inherit the canonical icon size unless a non-button composition owns the icon.

Global shell CSS contains only shared surface/link utilities. Request modal and footer styles are owned by `request-modal.css` and `site-footer.css` and are shipped by their corresponding Registry items; page code must not rely on their incidental global presence.

Home, leadgen promo and journal styles are route-owned imports (`home-page.css`, `promo.css`, `journal.css`) instead of global `styles.css` dependencies. Their component tokens use named roles, and Atlas copy/media remain in application wrappers or page data rather than Registry manifests.

`ams-realty-new-building` is the umbrella Registry item for the complete residential-complex presentation module. It installs the separate `catalog`, `detail` and `conversion` items, their neutral view models and every required Registry dependency. Atlas wrappers provide brand, city, expert identity and portrait, optional verified rating, Next adapters, Payload-derived DTOs and typed request context. `pnpm ui:registry:consumer` builds the items and verifies their clean dependency closure without relying on the Atlas application.

`ams-realty-catalog`, `ams-realty-catalog-map` and `ams-realty-property` are neutral umbrella items for discovery, map composition, property cards and detail pages. Their contracts are presentation DTOs owned by Registry source; Atlas adapters remain responsible for translating `SiteEngine` DTOs. Catalog, property, session-collection and residential-complex views use semantic tokens and do not import `home.css` or Payload documents.

New UI follows `reuse -> variant -> create`. Application components do not import Radix directly and do not recreate native controls when an admitted primitive or semantic variant exists.

`MediaGallery` is the only gallery API used by property and residential-complex pages. It wraps Embla through ShadCN Carousel and `yet-another-react-lightbox` with thumbnails, counter, zoom and fullscreen. The wrapper owns focus restore, keyboard and touch behavior, scroll locking, preload limits, empty/single states and Atlas token styling; application code must not import the lightbox directly.

The `/novostroyki` mobile showcase uses one large complex card with the edge of the next card visible. Each card has one image and one horizontal swipe owner; nested image swiping and autoplay are forbidden. Tablet and desktop keep the normal list/grid/map showcase, with list as the route default.

## Visual and media gates

- `pnpm test:visual` compares the key routes at 390, 768, 1280 and 1440 px.
- `pnpm ui:check` rejects raw colors outside the theme, palette tokens, arbitrary shadows, native controls outside primitives, legacy modal event bridges, direct Radix imports outside primitives, oversized page compositions, identity/registry drift, duplicate static images and static images above 512 KiB. All migrated UI debt ceilings are zero.
- The Constitution 3.1 baseline in `scripts/quality/ui-debt-baseline.json` is zero in every covered category. The guard rejects numbered component tokens, repeated arbitrary typography/layout, unstyled controls, checkbox misuse, `space-x/y`, manual Button icon sizing, Registry workspace imports, project assets and hardcoded business claims inside shared UI.
- `pnpm images:optimize` converts only oversized PNG files to high-quality WebP, updates tracked references and removes proven duplicates.
- Logos, UI graphics, social previews and small fallbacks may stay in Git. Property and ЖК photography belongs to Payload Media and persistent local/S3 storage.

The active identity lives in `src/project/site-profile.ts`. Project themes override neutral semantic tokens without changing component APIs. `templates/site-profile.neutral.json` and `pnpm template:profile` provide a neutral starting profile for a new city. The neutral preset contains no Atlas theme or Краснодар coordinates; map activation requires reviewed coordinates. The generator also emits a brand asset manifest and deployment checklist into `.ams-client/`. One client still receives its own repository, database, S3 bucket and deployment contour.

`RequestForm` is the canonical React Hook Form + Zod entry point for inline leads. Overlay triggers use the registry-owned typed context instead of DOM events or `data-*` dispatch attributes. All lead entry points retain the same server action, phone normalization, consent, honeypot, idempotency and server-error contract.
