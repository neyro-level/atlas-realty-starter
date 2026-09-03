# Incident Response

## Purpose

Runbook for security incidents, suspected secret disclosure, account compromise, data corruption, lost job execution or backup recovery. It contains no credentials or personal data.

## First response

1. Stop the harmful path without deleting evidence: block the account, disable the affected integration or remove public routing at Nginx.
2. Record UTC time, release SHA, affected system and operator in a safe incident record.
3. Preserve redacted logs, relevant audit events and worker status.
4. Do not publish tokens, passwords, database URLs, leads or raw request payloads in chat, tickets or Git.
5. Decide with the owner whether service must be degraded, stopped or restored.

## Containment

- Account compromise: disable account, invalidate sessions through supported Payload operation, rotate affected secret in Doppler.
- Secret disclosure: revoke/rotate in provider first, then update deployment environment and investigate access logs.
- Import/feed incident: disable source, preserve redacted ImportRun/issues, prevent deactivation.
- Delivery incident: pause channel, retain outbox rows, do not discard pending deliveries.
- Database/schema incident: stop release progression, preserve backup identifiers and choose forward-fix or restore only through a destructive recovery decision.

## Recovery

1. Verify the exact affected release and migration state.
2. Restore only from a verified backup to an isolated target first where feasible.
3. Run health, access, queue, import and lead-delivery checks relevant to the incident.
4. Confirm secrets, account access and public routes are safe before reopening traffic.

## Post-incident

- Record root cause, timeline, impact and redacted evidence.
- Add regression test, monitoring or runbook change.
- Review legal notification obligations with the client or legal counsel; AI does not invent deadlines.
- Update `FLEET.md` after a production restore drill or material operational recovery.
