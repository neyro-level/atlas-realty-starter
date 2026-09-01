import { spawnSync } from 'node:child_process'

const verificationScript = `
set -eu
backup_path=/tmp/soyuz-rostov-restore-check.dump
restore_db="\${POSTGRES_DB}_restore_check"
cleanup() {
  dropdb -U "$POSTGRES_USER" --if-exists "$restore_db" >/dev/null 2>&1 || true
  rm -f "$backup_path"
}
trap cleanup EXIT
pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" -Fc -f "$backup_path"
dropdb -U "$POSTGRES_USER" --if-exists "$restore_db" >/dev/null 2>&1 || true
createdb -U "$POSTGRES_USER" "$restore_db"
pg_restore -U "$POSTGRES_USER" -d "$restore_db" "$backup_path"
migration_count=$(psql -U "$POSTGRES_USER" -d "$restore_db" -Atc 'SELECT COUNT(*) FROM payload_migrations')
test "$migration_count" -ge 1
printf 'backup_restore_ok migrations=%s\n' "$migration_count"
`

const result = spawnSync(
  'docker',
  ['compose', 'exec', '-T', 'postgres', 'sh', '-lc', verificationScript],
  {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  },
)

if (result.status !== 0) {
  process.stderr.write(result.stderr || 'Backup/restore verification failed.\n')
  process.exit(result.status ?? 1)
}

process.stdout.write(result.stdout)
