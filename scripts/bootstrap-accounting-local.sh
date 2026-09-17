#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"
cp -n databases/.env.example databases/.env 2>/dev/null || true
if [[ ! -f services/accounting/.env ]]; then cp services/accounting/.env.example services/accounting/.env; sed -i 's#^DATABASE_URL=.*#DATABASE_URL=postgresql://accounting:local-accounting-password@localhost:5436/accounting#' services/accounting/.env; sed -i 's#^ACCOUNTING_INTERNAL_TOKEN=.*#ACCOUNTING_INTERNAL_TOKEN=local-accounting-internal-token#' services/accounting/.env; fi
docker compose --env-file databases/.env -f databases/docker-compose.yml up -d accounting-db
bash databases/migrate.sh
pnpm --dir services/accounting install
pnpm --dir services/accounting build
echo "Accounting service and database are ready."
