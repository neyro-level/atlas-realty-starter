# Frontend Integration Contract

## Rule

Будущая Next.js UI-библиотека подключается к starter только через serializable DTO и thin API handlers.

## DTO set

- `PublicPropertyCardDTO`
- `PublicPropertyDetailDTO`
- `ResidentialComplexDTO`
- `DeveloperDTO`
- `AgentPublicDTO`
- `CatalogQueryDTO`
- `CatalogResultDTO`
- `FacetDTO`
- `MapPointDTO`
- `PageDTO`
- `PostDTO`
- `SeoDocumentDTO`
- `LeadInput`
- `LeadReceipt`
- `PhoneRevealInput`
- `StatEventInput`

## Future public gateway surface

- `publicGateway.catalog.search`
- `publicGateway.properties.getBySlug`
- `publicGateway.complexes.list`
- `publicGateway.complexes.getBySlug`
- `publicGateway.developers.list`
- `publicGateway.developers.getBySlug`
- `publicGateway.agents.getPublicProfile`
- `publicGateway.content.getPage`
- `publicGateway.content.getPost`
- `publicGateway.seo.resolve`
- `publicGateway.maps.query`
- `publicGateway.config.getPublicConfig`

## Future HTTP boundary

- `GET /api/public/v1/catalog`
- `GET /api/public/v1/properties/:slug`
- `GET /api/public/v1/complexes/:slug`
- `GET /api/public/v1/facets`
- `GET /api/public/v1/map-points`
- `GET /api/public/v1/content/:slug`
- `GET /api/public/v1/config`
- `POST /api/public/v1/leads`
- `POST /api/public/v1/phone-reveals`
- `POST /api/public/v1/events`

## Forbidden

- UI imports from `payload.config.ts`
- UI imports from Payload collections
- UI imports from generated Payload types
- direct browser access to raw Payload business REST as a site API
