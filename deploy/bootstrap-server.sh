#!/usr/bin/env bash
set -euo pipefail

NODE_VERSION="24.20.0"
PNPM_VERSION="11.24.0"
APP_USER="atlas-realty"
APP_RELEASE_USER="atlas-realty-release"
APP_ROOT="/opt/ams-platform/atlas-realty"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root." >&2
  exit 1
fi
if ! id -u "${APP_RELEASE_USER}" >/dev/null 2>&1; then
  useradd --system --home-dir /nonexistent --no-create-home --shell /usr/sbin/nologin "${APP_RELEASE_USER}"
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends ca-certificates certbot curl nginx openssl xz-utils

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  useradd --system --home-dir "${APP_ROOT}" --create-home --shell /usr/sbin/nologin "${APP_USER}"
fi
install -d -o root -g root -m 0755 "${APP_ROOT}"

node_archive="node-v${NODE_VERSION}-linux-x64.tar.xz"
runtime_root="${APP_ROOT}/runtime"
node_root="${runtime_root}/node-v${NODE_VERSION}-linux-x64"
if [[ ! -x "${node_root}/bin/node" ]]; then
  temp_dir="$(mktemp -d)"
  trap 'rm -rf "${temp_dir}"' EXIT
  curl --fail --location --silent --show-error "https://nodejs.org/dist/v${NODE_VERSION}/${node_archive}" --output "${temp_dir}/${node_archive}"
  curl --fail --location --silent --show-error "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt" --output "${temp_dir}/SHASUMS256.txt"
  expected_checksum="$(awk -v archive="${node_archive}" '$2 == archive { print $1 }' "${temp_dir}/SHASUMS256.txt")"
  actual_checksum="$(sha256sum "${temp_dir}/${node_archive}" | cut -d' ' -f1)"
  [[ -n "${expected_checksum}" && "${expected_checksum}" == "${actual_checksum}" ]]
  install -d -o root -g root -m 0755 "${runtime_root}"
  tar -xJf "${temp_dir}/${node_archive}" -C "${runtime_root}"
fi

install -d -o root -g root -m 0755 "${runtime_root}/bin" "${runtime_root}/corepack"
ln -sfn "${node_root}/bin/node" "${runtime_root}/bin/node"
PATH="${runtime_root}/bin:${node_root}/bin:/usr/local/bin:/usr/bin:/bin" \
  COREPACK_HOME="${runtime_root}/corepack" \
  "${node_root}/bin/corepack" enable --install-directory "${runtime_root}/bin"
PATH="${runtime_root}/bin:${node_root}/bin:/usr/local/bin:/usr/bin:/bin" \
  COREPACK_HOME="${runtime_root}/corepack" \
  "${node_root}/bin/corepack" prepare "pnpm@${PNPM_VERSION}" --activate

install -d -o root -g root -m 0755 "${APP_ROOT}/releases"
find "${APP_ROOT}/releases" -mindepth 1 -xdev ! -type l -exec chown root:"${APP_USER}" {} +
find "${APP_ROOT}/releases" -mindepth 1 -xdev -type l -exec chown -h root:"${APP_USER}" {} +
find "${APP_ROOT}/releases" -mindepth 1 -type d -exec chmod 0750 {} +
find "${APP_ROOT}/releases" -type f ! -perm /111 -exec chmod 0640 {} +
find "${APP_ROOT}/releases" -type f -perm /111 -exec chmod 0750 {} +
install -d -o "${APP_USER}" -g "${APP_USER}" -m 0750 "${APP_ROOT}/shared" "${APP_ROOT}/shared/cache" "${APP_ROOT}/shared/home" "${APP_ROOT}/shared/media" "${APP_ROOT}/shared/tmp"
install -d -o root -g "${APP_USER}" -m 0750 /etc/ams-platform/atlas-realty
install -d -o root -g root -m 0755 /etc/ams-platform/atlas-realty/tls

if [[ ! -s /etc/ams-platform/atlas-realty/tls/fullchain.pem || ! -s /etc/ams-platform/atlas-realty/tls/privkey.pem ]]; then
  openssl req -x509 -newkey rsa:3072 -sha256 -nodes -days 825 \
    -subj "/CN=atlas.ams24.ru" \
    -addext "subjectAltName=DNS:atlas.ams24.ru,DNS:localhost,IP:127.0.0.1" \
    -keyout /etc/ams-platform/atlas-realty/tls/privkey.pem \
    -out /etc/ams-platform/atlas-realty/tls/fullchain.pem
  chmod 0600 /etc/ams-platform/atlas-realty/tls/privkey.pem
  chmod 0644 /etc/ams-platform/atlas-realty/tls/fullchain.pem
fi

if [[ -z "$(swapon --show --noheadings)" && ! -f /swapfile ]]; then
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  printf '/swapfile none swap sw 0 0\n' >> /etc/fstab
fi

install -m 0644 "${SCRIPT_DIR}/atlas-realty.service" /etc/systemd/system/atlas-realty.service
install -m 0644 "${SCRIPT_DIR}/atlas-realty-worker.service" /etc/systemd/system/atlas-realty-worker.service
install -m 0644 "${SCRIPT_DIR}/nginx-internal.conf" /etc/nginx/sites-available/atlas-realty.conf
ln -sfn /etc/nginx/sites-available/atlas-realty.conf /etc/nginx/sites-enabled/atlas-realty.conf
systemctl daemon-reload
systemctl enable atlas-realty.service
systemctl enable atlas-realty-worker.service
nginx -t
systemctl enable --now nginx
systemctl reload nginx

"${runtime_root}/bin/node" --version
PATH="${runtime_root}/bin:${node_root}/bin:/usr/local/bin:/usr/bin:/bin" \
  COREPACK_HOME="${runtime_root}/corepack" \
  "${runtime_root}/bin/pnpm" --version
