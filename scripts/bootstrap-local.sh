#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

cp -n databases/.env.example databases/.env 2>/dev/null || true

make_service_env() {
  local service="$1"
  local port="$2"
  local db="$3"
  local dbport="$4"
  local user="$5"
  local password="$6"
  local file="services/${service}/.env"
  if [[ ! -f "$file" ]]; then
    cp "services/${service}/.env.example" "$file"
    sed -i "s#^PORT=.*#PORT=${port}#; s#^DATABASE_URL=.*#DATABASE_URL=postgresql://${user}:${password}@localhost:${dbport}/${db}#; s#^JWT_SECRET=.*#JWT_SECRET=$(openssl rand -hex 32)#" "$file"
  fi
}

make_service_env anpardaz 4001 anpardaz 5433 anpardaz local-anpardaz-password
make_service_env ansarraf 4002 ansarraf 5434 ansarraf local-ansarraf-password
make_service_env platform 4003 platform 5435 platform local-platform-password

docker compose --env-file databases/.env -f databases/docker-compose.yml up -d
bash databases/migrate.sh

pnpm --dir services/anpardaz install
pnpm --dir services/ansarraf install
pnpm --dir services/platform install
pnpm --dir services/anpardaz build
pnpm --dir services/ansarraf build
pnpm --dir services/platform build
pnpm --dir apps/mobile install
pnpm --dir apps/mobile run build
pnpm --dir apps/web install
pnpm --dir apps/web run build

echo "Local An Pardaz platform bootstrap completed successfully."
