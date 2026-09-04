# Onboarding Checklist

This checklist is executed for each client deployment after reusable core extraction.

- [ ] Dedicated server and private Timeweb Managed PostgreSQL are provisioned in one region.
- [ ] Database public networking is disabled; backup policy is configured.
- [ ] Doppler project/config is created; no secrets are committed.
- [ ] `VERSION_MATRIX.md` and exact core package version are selected.
- [ ] Fresh compatible schema is migrated; no schema push is used.
- [ ] First owner account is bootstrapped through the approved script.
- [ ] Client contacts, legal documents, consent version and PDN retention matrix are approved.
- [ ] TLS, Nginx rate limits, trusted proxy and headers are enabled.
- [ ] S3 media storage is verified with a controlled upload.
- [ ] Outbound hosts, map, Metrika and lead channels are configured only when enabled.
- [ ] Approved feed fixtures and parser mappings exist before imports are enabled.
- [ ] First import, lead delivery, health and worker recovery checks pass.
- [ ] Backup restore drill passes and is recorded in `FLEET.md`.
- [ ] SourceCraft CI, branch protection, release identity and monitoring are confirmed.
