# Backend Foundation

The backend is split into three independently deployable services:

- `services/anpardaz` — banking and financial services
- `services/ansarraf` — digital-asset exchange services
- `services/platform` — Banner, Market, Hoosh, content and other platform services

Each service currently exposes only a `/health` endpoint. Business APIs and database schemas will be added incrementally after the service boundaries and security model are validated.

## Databases

`databases/docker-compose.yml` defines three separate PostgreSQL instances for local development. They use separate containers, databases, users and persistent volumes.

No frontend connects directly to PostgreSQL.
