#!/usr/bin/env bash
set -euo pipefail

APP_USER="soyuz-rostov"
APP_ROOT="/opt/soyuz-rostov"
ENV_FILE="/etc/soyuz-rostov/runtime.env"
ARCHIVE="${1:-}"
RELEASE_SHA="${2:-}"
EXPECTED_SHA256="${3:-}"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root." >&2
  exit 1
fi
if [[ ! "${RELEASE_SHA}" =~ ^[0-9a-f]{40}$ || ! "${EXPECTED_SHA256}" =~ ^[0-9a-f]{64}$ ]]; then
  echo "Usage: install-release.sh <archive> <full-sha> <sha256>" >&2
  exit 1
fi
if [[ ! -f "${ARCHIVE}" || ! -f "${ENV_FILE}" ]]; then
  echo "Archive or runtime environment is missing." >&2
  exit 1
fi

actual_sha256="$(sha256sum "${ARCHIVE}" | cut -d' ' -f1)"
if [[ "${actual_sha256}" != "${EXPECTED_SHA256}" ]]; then
  echo "Release checksum mismatch." >&2
  exit 1
fi

release_dir="${APP_ROOT}/releases/${RELEASE_SHA}"
if [[ -e "${release_dir}" ]]; then
  echo "Immutable release already exists: ${release_dir}" >&2
  exit 1
fi

previous_release=""
if [[ -L "${APP_ROOT}/current" ]]; then
  previous_release="$(readlink -f "${APP_ROOT}/current")"
fi

install -d -o "${APP_USER}" -g "${APP_USER}" -m 0750 "${release_dir}"
tar -xzf "${ARCHIVE}" -C "${release_dir}"
printf '%s\n' "${RELEASE_SHA}" > "${release_dir}/.release-sha"
printf '%s\n' "${EXPECTED_SHA256}" > "${release_dir}/.release-sha256"
chown -R "${APP_USER}:${APP_USER}" "${release_dir}"

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a
export NODE_ENV=production
export RELEASE_SHA="${RELEASE_SHA}"
export NEXT_PUBLIC_RELEASE_SHA="${RELEASE_SHA}"
export HOME="${APP_ROOT}"
export COREPACK_HOME="${APP_ROOT}/.cache/node/corepack"
export PNPM_HOME="${APP_ROOT}/.local/share/pnpm"
export PATH="/usr/local/bin:/usr/bin:/bin"
unset BASH_ENV ENV

run_as_app() {
  /usr/sbin/runuser --preserve-environment -u "${APP_USER}" -- /bin/bash -c 'cd "$1"; shift; exec "$@"' _ "${release_dir}" "$@"
}

run_as_app /usr/local/bin/pnpm install --frozen-lockfile
run_as_app /usr/local/bin/pnpm payload migrate
run_as_app /usr/local/bin/pnpm build

printf 'RELEASE_SHA=%s\n' "${RELEASE_SHA}" > /etc/soyuz-rostov/release.env
chmod 0640 /etc/soyuz-rostov/release.env
chown root:"${APP_USER}" /etc/soyuz-rostov/release.env

ln -sfn "${release_dir}" "${APP_ROOT}/current.next"
mv -Tf "${APP_ROOT}/current.next" "${APP_ROOT}/current"
systemctl restart soyuz-rostov.service

for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error http://127.0.0.1:3000/api/health >/dev/null; then
    systemctl reload nginx
    printf 'release_ok sha=%s previous=%s\n' "${RELEASE_SHA}" "${previous_release:-none}"
    exit 0
  fi
  sleep 2
done

if [[ -n "${previous_release}" && -d "${previous_release}" ]]; then
  previous_sha="$(cat "${previous_release}/.release-sha")"
  printf 'RELEASE_SHA=%s\n' "${previous_sha}" > /etc/soyuz-rostov/release.env
  ln -sfn "${previous_release}" "${APP_ROOT}/current.next"
  mv -Tf "${APP_ROOT}/current.next" "${APP_ROOT}/current"
  systemctl restart soyuz-rostov.service
fi

echo "Release health check failed; previous symlink restored when available." >&2
exit 1
