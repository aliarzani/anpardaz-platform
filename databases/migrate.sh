#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENV_FILE="${ROOT_DIR}/.env"
COMPOSE_FILE="${ROOT_DIR}/docker-compose.yml"

if [[ ! -f "${ENV_FILE}" ]]; then
  echo "Missing ${ENV_FILE}. Copy .env.example to .env first."
  exit 1
fi

set -a
source "${ENV_FILE}"
set +a

run_migrations() {
  local service="$1"
  local database="$2"
  local user="$3"
  local password="$4"
  local dir="$5"
  local migration_file

  echo "Migrating ${service}..."
  shopt -s nullglob
  local migrations=("${ROOT_DIR}/${dir}"/*.sql)
  shopt -u nullglob

  if (( ${#migrations[@]} == 0 )); then
    echo "No SQL migrations found for ${service}."
    return 0
  fi

  IFS=$'\n' migrations=( $(printf '%s\n' "${migrations[@]}" | sort) )

  for migration_file in "${migrations[@]}"; do
    echo "  -> $(basename "${migration_file}")"
    docker compose --env-file "${ENV_FILE}" -f "${COMPOSE_FILE}" exec -T "${service}" \
      env PGPASSWORD="${password}" psql -v ON_ERROR_STOP=1 -U "${user}" -d "${database}" \
      < "${migration_file}"
  done
}

run_migrations anpardaz-db "${ANPARDAZ_DB_NAME}" "${ANPARDAZ_DB_USER}" "${ANPARDAZ_DB_PASSWORD}" anpardaz
run_migrations ansarraf-db "${ANSARRAF_DB_NAME}" "${ANSARRAF_DB_USER}" "${ANSARRAF_DB_PASSWORD}" ansarraf
run_migrations platform-db "${PLATFORM_DB_NAME}" "${PLATFORM_DB_USER}" "${PLATFORM_DB_PASSWORD}" platform

echo "All database migrations completed."
