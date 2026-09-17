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
    sed -i "s#^PORT=.*#PORT=${port}#; s#^DATABASE_URL=.*#DATABASE_URL=postgresql://${user}:${password}@localhost:${dbport}/${db}#" "$file"
  fi
}

make_service_env anpardaz 4001 anpardaz 5433 anpardaz local-anpardaz-password
make_service_env ansarraf 4002 ansarraf 5434 ansarraf local-ansarraf-password
make_service_env platform 4003 platform 5435 platform local-platform-password

# Generate one Ed25519 signing key for the central identity service and distribute only its public key.
if ! grep -q '^IDENTITY_PRIVATE_KEY_B64=' services/platform/.env 2>/dev/null || grep -q 'generated-by-bootstrap-local' services/platform/.env; then
  tmpdir="$(mktemp -d)"
  trap 'rm -rf "$tmpdir"' EXIT
  openssl genpkey -algorithm Ed25519 -outform DER -out "$tmpdir/private.der" >/dev/null 2>&1
  openssl pkey -in "$tmpdir/private.der" -inform DER -pubout -outform DER -out "$tmpdir/public.der" >/dev/null 2>&1
  private_b64="$(base64 -w0 "$tmpdir/private.der")"
  public_b64="$(base64 -w0 "$tmpdir/public.der")"
  sed -i '/^IDENTITY_PRIVATE_KEY_B64=/d;/^IDENTITY_ISSUER=/d' services/platform/.env
  printf '\nIDENTITY_ISSUER=anpardaz-platform\nIDENTITY_PRIVATE_KEY_B64=%s\n' "$private_b64" >> services/platform/.env
  for service in anpardaz ansarraf; do
    sed -i '/^IDENTITY_SERVICE_URL=/d;/^IDENTITY_ISSUER=/d;/^IDENTITY_PUBLIC_KEY_B64=/d' "services/${service}/.env"
    printf '\nIDENTITY_SERVICE_URL=http://localhost:4003\nIDENTITY_ISSUER=anpardaz-platform\nIDENTITY_PUBLIC_KEY_B64=%s\n' "$public_b64" >> "services/${service}/.env"
  done
fi

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
echo "Local An Pardaz platform bootstrap completed successfully. Shared identity is configured across Platform, An Pardaz and An Sarraf."
