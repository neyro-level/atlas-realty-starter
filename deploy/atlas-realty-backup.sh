#!/usr/bin/env bash
set -euo pipefail

APP_ENV="/etc/ams-platform/atlas-realty/runtime.env"
MIGRATION_ENV="/etc/ams-platform/atlas-realty/migration.env"
BACKUP_ENV="/etc/ams-platform/atlas-realty/backup.env"
BACKUP_ROOT="/var/backups/atlas-realty"
DATABASE_NAME="atlas_realty_prod"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${APP_ENV}"
# shellcheck disable=SC1090
source "${MIGRATION_ENV}"
# shellcheck disable=SC1090
source "${BACKUP_ENV}"
set +a

: "${MIGRATION_DATABASE_URL:?MIGRATION_DATABASE_URL is required}"
: "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET is required}"
: "${BACKUP_AGE_RECIPIENT:?BACKUP_AGE_RECIPIENT is required}"
: "${S3_ACCESS_KEY_ID:?S3_ACCESS_KEY_ID is required}"
: "${S3_SECRET_ACCESS_KEY:?S3_SECRET_ACCESS_KEY is required}"
: "${S3_ENDPOINT:?S3_ENDPOINT is required}"
: "${S3_REGION:?S3_REGION is required}"

export AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY}"
export AWS_DEFAULT_REGION="${S3_REGION}"

install -d -o root -g root -m 0700 "${BACKUP_ROOT}"
temporary_dir="$(mktemp -d "${BACKUP_ROOT}/run.XXXXXX")"
trap 'rm -rf -- "${temporary_dir}"' EXIT

stamp="$(date -u +%Y%m%dT%H%M%SZ)"
dump_path="${temporary_dir}/${DATABASE_NAME}-${stamp}.dump"
encrypted_path="${dump_path}.age"
checksum_path="${encrypted_path}.sha256"
object_prefix="${DATABASE_NAME}"
object_name="$(basename "${encrypted_path}")"

pg_dump "${MIGRATION_DATABASE_URL}" --format=custom --no-owner --no-privileges --file="${dump_path}"
age --recipient "${BACKUP_AGE_RECIPIENT}" --output "${encrypted_path}" "${dump_path}"
sha256sum "${encrypted_path}" | sed "s#${encrypted_path}#${object_name}#" > "${checksum_path}"

aws --endpoint-url "${S3_ENDPOINT}" s3 cp "${encrypted_path}" "s3://${BACKUP_S3_BUCKET}/${object_prefix}/${object_name}" --only-show-errors
aws --endpoint-url "${S3_ENDPOINT}" s3 cp "${checksum_path}" "s3://${BACKUP_S3_BUCKET}/${object_prefix}/${object_name}.sha256" --only-show-errors
aws --endpoint-url "${S3_ENDPOINT}" s3api head-object --bucket "${BACKUP_S3_BUCKET}" --key "${object_prefix}/${object_name}" >/dev/null

printf 'backup_ok database=%s object=%s/%s\n' "${DATABASE_NAME}" "${object_prefix}" "${object_name}"
