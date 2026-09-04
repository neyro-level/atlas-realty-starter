#!/usr/bin/env bash
set -euo pipefail

NODE_VERSION="24.20.0"
PNPM_VERSION="11.24.0"
APP_USER="ams-realty-platform-starter"
APP_ROOT="/opt/ams-realty-platform-starter"
SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

if [[ "${EUID}" -ne 0 ]]; then
  echo "Run as root." >&2
  exit 1
fi

export DEBIAN_FRONTEND=noninteractive
apt-get update
apt-get install -y --no-install-recommends ca-certificates curl nginx xz-utils build-essential

node_archive="node-v${NODE_VERSION}-linux-x64.tar.xz"
node_root="/opt/node-v${NODE_VERSION}-linux-x64"
if [[ ! -x "${node_root}/bin/node" ]]; then
  temp_dir="$(mktemp -d)"
  trap 'rm -rf "${temp_dir}"' EXIT
  curl --fail --location --silent --show-error "https://nodejs.org/dist/v${NODE_VERSION}/${node_archive}" --output "${temp_dir}/${node_archive}"
  curl --fail --location --silent --show-error "https://nodejs.org/dist/v${NODE_VERSION}/SHASUMS256.txt" --output "${temp_dir}/SHASUMS256.txt"
  expected_checksum="$(awk -v archive="${node_archive}" '$2 == archive { print $1 }' "${temp_dir}/SHASUMS256.txt")"
  actual_checksum="$(sha256sum "${temp_dir}/${node_archive}" | cut -d' ' -f1)"
  [[ -n "${expected_checksum}" && "${expected_checksum}" == "${actual_checksum}" ]]
  tar -xJf "${temp_dir}/${node_archive}" -C /opt
fi

for binary in node npm npx corepack; do
  ln -sfn "${node_root}/bin/${binary}" "/usr/local/bin/${binary}"
done
corepack enable --install-directory /usr/local/bin
corepack prepare "pnpm@${PNPM_VERSION}" --activate

if ! id -u "${APP_USER}" >/dev/null 2>&1; then
  useradd --system --home-dir "${APP_ROOT}" --create-home --shell /usr/sbin/nologin "${APP_USER}"
fi
install -d -o "${APP_USER}" -g "${APP_USER}" -m 0750 "${APP_ROOT}/releases" "${APP_ROOT}/shared"
install -d -o root -g "${APP_USER}" -m 0750 /etc/ams-realty-platform-starter

if [[ -z "$(swapon --show --noheadings)" && ! -f /swapfile ]]; then
  fallocate -l 4G /swapfile
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  printf '/swapfile none swap sw 0 0\n' >> /etc/fstab
fi

install -m 0644 "${SCRIPT_DIR}/ams-realty-platform-starter.service" /etc/systemd/system/ams-realty-platform-starter.service
install -m 0644 "${SCRIPT_DIR}/ams-realty-platform-starter-imports.service" /etc/systemd/system/ams-realty-platform-starter-imports.service
install -m 0644 "${SCRIPT_DIR}/ams-realty-platform-starter-maintenance.service" /etc/systemd/system/ams-realty-platform-starter-maintenance.service
install -m 0644 "${SCRIPT_DIR}/ams-realty-platform-starter-maintenance-scheduler.service" /etc/systemd/system/ams-realty-platform-starter-maintenance-scheduler.service
install -m 0644 "${SCRIPT_DIR}/nginx-internal.conf" /etc/nginx/sites-available/ams-realty-platform-starter.conf
ln -sfn /etc/nginx/sites-available/ams-realty-platform-starter.conf /etc/nginx/sites-enabled/ams-realty-platform-starter.conf
rm -f /etc/nginx/sites-enabled/default
systemctl daemon-reload
systemctl enable ams-realty-platform-starter.service
systemctl enable ams-realty-platform-starter-imports.service
systemctl enable ams-realty-platform-starter-maintenance.service
systemctl enable ams-realty-platform-starter-maintenance-scheduler.service
nginx -t
systemctl enable --now nginx

node --version
pnpm --version
