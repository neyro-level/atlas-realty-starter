#!/usr/bin/env bash
set -euo pipefail

APP_ENV="/etc/ams-platform/atlas-realty/runtime.env"
BACKUP_ENV="/etc/ams-platform/atlas-realty/backup.env"
RESTORE_DB="atlas_realty_restore_check"
RESTORE_ROOT="/var/backups/atlas-realty/restore-check"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root." >&2
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "${APP_ENV}"
# shellcheck disable=SC1090
source "${BACKUP_ENV}"
set +a

: "${BACKUP_S3_BUCKET:?BACKUP_S3_BUCKET is required}"
: "${BACKUP_AGE_IDENTITY_B64:?BACKUP_AGE_IDENTITY_B64 is required}"
: "${S3_ACCESS_KEY_ID:?S3_ACCESS_KEY_ID is required}"
: "${S3_SECRET_ACCESS_KEY:?S3_SECRET_ACCESS_KEY is required}"
: "${S3_ENDPOINT:?S3_ENDPOINT is required}"
: "${S3_REGION:?S3_REGION is required}"

export AWS_ACCESS_KEY_ID="${S3_ACCESS_KEY_ID}"
export AWS_SECRET_ACCESS_KEY="${S3_SECRET_ACCESS_KEY}"
export AWS_DEFAULT_REGION="${S3_REGION}"

install -d -o root -g root -m 0700 "${RESTORE_ROOT}"
temporary_dir="$(mktemp -d "${RESTORE_ROOT}/run.XXXXXX")"
trap 'sudo -u postgres dropdb --if-exists "${RESTORE_DB}" >/dev/null 2>&1 || true; rm -rf -- "${temporary_dir}"' EXIT

key="$(aws --endpoint-url "${S3_ENDPOINT}" s3api list-objects-v2 --bucket "${BACKUP_S3_BUCKET}" --prefix atlas_realty_prod/ --query 'reverse(sort_by(Contents,&LastModified))[?ends_with(Key, `.dump.age`)].Key | [0]' --output text)"
if [[ -z "${key}" || "${key}" == "None" ]]; then
  echo "No encrypted Atlas backup found." >&2
  exit 1
fi

encrypted_path="${temporary_dir}/backup.dump.age"
dump_path="${temporary_dir}/backup.dump"
identity_path="${temporary_dir}/identity.txt"
printf '%s' "${BACKUP_AGE_IDENTITY_B64}" | base64 --decode > "${identity_path}"
chmod 0600 "${identity_path}"
aws --endpoint-url "${S3_ENDPOINT}" s3 cp "s3://${BACKUP_S3_BUCKET}/${key}" "${encrypted_path}" --only-show-errors
age --decrypt --identity "${identity_path}" --output "${dump_path}" "${encrypted_path}"

sudo -u postgres dropdb --if-exists "${RESTORE_DB}"
sudo -u postgres createdb "${RESTORE_DB}"
sudo -u postgres pg_restore --dbname="${RESTORE_DB}" --no-owner --no-privileges "${dump_path}"
migrations="$(sudo -u postgres psql --dbname="${RESTORE_DB}" --tuples-only --no-align --command='select count(*) from payload_migrations;')"
properties="$(sudo -u postgres psql --dbname="${RESTORE_DB}" --tuples-only --no-align --command='select count(*) from properties;')"
[[ "${migrations}" -ge 7 && "${properties}" -eq 30 ]]

printf 'restore_ok migrations=%s properties=%s object=%s\n' "${migrations}" "${properties}" "${key}"
