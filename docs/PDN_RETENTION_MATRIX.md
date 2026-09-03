# PDN Retention Matrix

> Legal basis, final periods and approved client texts are owner/legal decisions. This matrix is a required operating contract, not legal advice.

| Data category | Purpose | Current retention | Action at expiry | Owner | Status |
|---|---|---|---|---|---|
| Leads | Request handling and client communication | Not approved | Irreversible anonymization or delete after client/legal approval | Client owner | BLOCKED_OWNER_DECISION |
| Lead deliveries | Delivery recovery and audit | Bound to lead policy, redacted errors only | Delete/anonymize with related lead policy | Client owner | BLOCKED_OWNER_DECISION |
| Spam leads | False-positive review and abuse detection | To be set with anti-spam policy | Delete/anonymize | Client owner | BLOCKED_OWNER_DECISION |
| Import issues | Operational diagnostics, redacted | 90 days default | Delete | Technical owner | Planned Wave 3 |
| Stat events | Product statistics without direct PII | 90 days default | Delete; retain non-PII aggregates | Technical owner | Planned Wave 10 |
| Stat daily aggregates | Long-term non-PII reporting | Indefinite unless client policy differs | Retain | Client owner | Planned Wave 10 |
| Audit events | Security and operational accountability, redacted | Not approved | Retain only permissible non-PII facts | Client owner | BLOCKED_OWNER_DECISION |
| Backups | Recovery | Provider policy plus client decision | Expire securely | Technical owner | Planned Wave 11 |

No new collection with PII may be released without a row in this matrix, a declared purpose, an owner and a deletion/anonymization action.
