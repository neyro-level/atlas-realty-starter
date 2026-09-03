# Analytics Contract

## Status

Analytics and Yandex Metrika are not enabled in Wave 0. No counter ID, form data or PII is present in public scripts.

## Target design

- `project/modules/metrika` owns optional client Metrika integration.
- Metrika ID is public configuration and the module is disabled when absent.
- SPA navigation emits one manual pageview per route transition; initial render is not duplicated.
- Goal names come only from a typed core contract: `lead_submitted`, `phone_revealed`, `map_used`, `filter_applied`, `complex_viewed`, `mortgage_requested`.
- `stat-events` contains pseudonymous/HMAC identifiers only; no direct PII.
- Background aggregation creates `stat-daily`; dashboards read aggregates, not raw event history.
- Raw events default to 90-day retention. Aggregates without PII may be retained longer.
- Form inputs and PII are excluded from Webvisor/session replay and foreign analytics.

Implementation belongs to Wave 10 after public events, leads and maps have canonical contracts.
