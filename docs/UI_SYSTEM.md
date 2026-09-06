# UI system

## Ownership

`packages/site-ui` is the sole owner of reusable presentation primitives and views. Application routes compose those views but do not create a second design system. Payload, database access, secrets and project-specific fetching are forbidden inside the package.

The root and package `components.json` files must keep the same ShadCN style, React Server Components mode, TypeScript mode, base color and icon library. `registry.json` and `packages/site-ui/registry.json` are validated with `pnpm ui:registry:check`.

## Tokens

`packages/site-ui/src/theme.css` is the only global token source. Manrope is the sole primary font. Brand, surfaces, text, borders, focus, status colors, radius, shadows, spacing and motion use semantic CSS variables. Application components must not add raw HEX values or import Radix directly; `pnpm ui:check` enforces both boundaries.

## Shared components

The registry owns ShadCN Button, Card, Badge, Dialog, Carousel, Aspect Ratio, Scroll Area, Skeleton, Tabs, Form, Field, Input and Checkbox plus Atlas `media-gallery`, catalog cards, filters, request forms and CTA blocks.

`MediaGallery` is the only gallery API used by property and residential-complex pages. It wraps Embla through ShadCN Carousel and `yet-another-react-lightbox` with thumbnails, counter, zoom and fullscreen. The wrapper owns focus restore, keyboard and touch behavior, scroll locking, preload limits, empty/single states and Atlas token styling; application code must not import the lightbox directly.

## Visual and media gates

- `pnpm test:visual` compares the key routes at 390, 768, 1280 and 1440 px.
- `pnpm ui:check` rejects raw colors outside the theme, direct Radix imports outside primitives, duplicate static images and static images above 512 KiB.
- `pnpm images:optimize` converts only oversized PNG files to high-quality WebP, updates tracked references and removes proven duplicates.
- Logos, UI graphics, social previews and small fallbacks may stay in Git. Property and ЖК photography belongs to Payload Media and persistent local/S3 storage.

The active identity lives in `src/project/site-profile.ts`. `templates/site-profile.neutral.json` and `pnpm template:profile` provide a neutral starting profile for a new city. One client still receives its own repository, database, S3 bucket and deployment contour.
