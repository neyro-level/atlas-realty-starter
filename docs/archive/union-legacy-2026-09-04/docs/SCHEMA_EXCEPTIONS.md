# Schema Exceptions

## Rule

Payload collections, fields and indexes are canonical schema sources. Any database object created outside ordinary Payload schema must be recorded here with its migration, reason, query evidence and removal plan.

## Current state

No approved V2 exceptions.

## Legacy note

The pre-Standard schema includes historical low-level indexes and migrations in `src/payload/migrations`. They are not loaded by the V2 Payload configuration and are not approved V2 exceptions.

## Required entry format

| Object | Migration | Why Payload schema was insufficient | Query/EXPLAIN evidence | Owner | Review/removal condition |
|---|---|---|---|---|---|
