#!/usr/bin/env bash
set -euo pipefail

APP_USER="ams-realty-platform-starter"
APP_RELEASE_USER="ams-realty-platform-release"
APP_ROOT="/opt/ams-realty-platform-starter"
ENV_FILE="/etc/ams-realty-platform-starter/runtime.env"
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
if [[ -e "${release_dir}" || -L "${release_dir}" ]]; then
  echo "Immutable release already exists: ${release_dir}" >&2
  exit 1
fi

keep_release=0
cleanup_failed_release() {
  exit_code=$?
  if [[ "${exit_code}" -ne 0 && "${keep_release}" -eq 0 && -d "${release_dir}" ]]; then
    rm -rf -- "${release_dir}"
  fi
  exit "${exit_code}"
}
trap cleanup_failed_release EXIT

previous_release=""
if [[ -L "${APP_ROOT}/current" ]]; then
  previous_release="$(readlink -f "${APP_ROOT}/current")"
fi

install -d -o "${APP_RELEASE_USER}" -g "${APP_RELEASE_USER}" -m 0750 "${release_dir}"
if tar -tzf "${ARCHIVE}" | grep -Eq '(^|/)(\.\.|\.release-sha|\.release-sha256|\.release-verified)(/|$)|^/'; then
  echo "Release archive contains a reserved or unsafe path." >&2
  exit 1
fi
/usr/sbin/runuser -u "${APP_RELEASE_USER}" -- tar --no-same-owner --no-same-permissions -xzf "${ARCHIVE}" -C "${release_dir}"

"${APP_ROOT}/runtime/bin/node" - "${release_dir}" "${RELEASE_SHA}" <<'NODE'
const fs = require('node:fs')
const path = require('node:path')
const [root, expectedSha] = process.argv.slice(2)
const rootWithSeparator = `${path.resolve(root)}${path.sep}`
const manifestPath = path.join(root, '.release.json')
const manifestStat = fs.lstatSync(manifestPath)
if (!manifestStat.isFile() || manifestStat.isSymbolicLink()) throw new Error('Embedded release manifest must be a regular file')
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
if (manifest.sha !== expectedSha) throw new Error('Embedded release SHA does not match requested SHA')
function walk(directory) {
  for (const entry of fs.readdirSync(directory)) {
    const full = path.join(directory, entry)
    const stat = fs.lstatSync(full)
    if (stat.isSymbolicLink()) {
      const resolved = path.resolve(path.dirname(full), fs.readlinkSync(full))
      if (resolved !== path.resolve(root) && !resolved.startsWith(rootWithSeparator)) throw new Error(`Escaping release symlink: ${full}`)
    } else if (stat.isDirectory()) walk(full)
    else if (!stat.isFile()) throw new Error(`Unsupported release entry type: ${full}`)
  }
}
walk(root)
NODE

rm -rf -- "${release_dir}/.next/cache" "${release_dir}/media"
chown -R root:"${APP_USER}" "${release_dir}"
find "${release_dir}" -type d -exec chmod 0750 {} +
find "${release_dir}" -type f ! -perm /111 -exec chmod 0640 {} +
find "${release_dir}" -type f -perm /111 -exec chmod 0750 {} +
ln -s "${APP_ROOT}/shared/cache" "${release_dir}/.next/cache"
ln -s "${APP_ROOT}/shared/media" "${release_dir}/media"
printf '%s\n' "${RELEASE_SHA}" > "${release_dir}/.release-sha"
printf '%s\n' "${EXPECTED_SHA256}" > "${release_dir}/.release-sha256"
printf '%s\n' "${RELEASE_SHA}" > "${release_dir}/.release-verified"
chown root:"${APP_USER}" "${release_dir}/.release-sha" "${release_dir}/.release-sha256" "${release_dir}/.release-verified"
chmod 0440 "${release_dir}/.release-sha" "${release_dir}/.release-sha256" "${release_dir}/.release-verified"

set -a
# shellcheck disable=SC1090
source "${ENV_FILE}"
set +a
export NODE_ENV=production
export RELEASE_SHA="${RELEASE_SHA}"
export NEXT_PUBLIC_RELEASE_SHA="${RELEASE_SHA}"
export HOME="${APP_ROOT}/shared/home"
export TMPDIR="${APP_ROOT}/shared/tmp"
export COREPACK_HOME="${APP_ROOT}/runtime/corepack"
export PATH="${APP_ROOT}/runtime/bin:/usr/local/bin:/usr/bin:/bin"
unset BASH_ENV ENV

run_as_app() {
  /usr/sbin/runuser --preserve-environment -u "${APP_USER}" -- /bin/bash -c 'cd "$1"; shift; exec "$@"' _ "${release_dir}" "$@"
}

if [[ ! -f "${release_dir}/server.js" || ! -x "${release_dir}/node_modules/.bin/payload" || ! -d "${release_dir}/src/payload/migrations-v2" ]]; then
  echo "Release artifact is incomplete." >&2
  exit 1
fi

run_as_app "${release_dir}/node_modules/.bin/payload" migrate

printf 'RELEASE_SHA=%s\n' "${RELEASE_SHA}" > /etc/ams-realty-platform-starter/release.env
chmod 0640 /etc/ams-realty-platform-starter/release.env
chown root:"${APP_USER}" /etc/ams-realty-platform-starter/release.env

ln -sfn "${release_dir}" "${APP_ROOT}/current.next"
mv -Tf "${APP_ROOT}/current.next" "${APP_ROOT}/current"
systemctl restart ams-realty-platform-starter.service

for attempt in $(seq 1 30); do
  if curl --fail --silent --show-error --max-time 5 http://127.0.0.1:3010/healthz >/dev/null; then
    systemctl restart ams-realty-platform-starter-worker.service
    if systemctl is-active --quiet ams-realty-platform-starter-worker.service; then
      systemctl reload nginx
      keep_release=1
      printf 'release_ok sha=%s previous=%s\n' "${RELEASE_SHA}" "${previous_release:-none}"
      exit 0
    fi
  fi
  sleep 2
done

if [[ -n "${previous_release}" && "${previous_release}" == "${APP_ROOT}/releases/"* && -d "${previous_release}" && -f "${previous_release}/.release-sha" && ! -L "${previous_release}/.release-sha" && -f "${previous_release}/.release-verified" && ! -L "${previous_release}/.release-verified" ]]; then
  previous_sha="$(cat "${previous_release}/.release-sha")"
  previous_verified_sha="$(cat "${previous_release}/.release-verified")"
  if [[ ! "${previous_sha}" =~ ^[0-9a-f]{40}$ || "${previous_verified_sha}" != "${previous_sha}" ]]; then
    echo "Previous release marker is invalid; rollback refused." >&2
    exit 1
  fi
  printf 'RELEASE_SHA=%s\n' "${previous_sha}" > /etc/ams-realty-platform-starter/release.env
  ln -sfn "${previous_release}" "${APP_ROOT}/current.next"
  mv -Tf "${APP_ROOT}/current.next" "${APP_ROOT}/current"
  systemctl restart ams-realty-platform-starter.service
  systemctl restart ams-realty-platform-starter-worker.service || true
else
  rm -f "${APP_ROOT}/current"
  systemctl stop ams-realty-platform-starter.service ams-realty-platform-starter-worker.service || true
fi

echo "Release health check failed; previous symlink restored when available." >&2
exit 1
