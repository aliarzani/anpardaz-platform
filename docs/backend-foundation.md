# Backend Foundation

The backend is split into three independently deployable services:

- `services/anpardaz` — banking and financial services
- `services/ansarraf` — digital-asset exchange services
- `services/platform` — Banner, Market, Hoosh, content and other platform services

Each service is a Fastify application with a small, explicit HTTP surface. Business APIs are being added incrementally behind the service boundaries and security model.

## Health and readiness

Every service exposes:

- `GET /health` — process/liveness check; does not require a database connection.
- `GET /health/db` — database readiness check; returns HTTP 503 when the database is not configured or unavailable.
- `GET /api/v1/status` — service and API version status.

The Platform service additionally exposes:

- `GET /api/v1/news` — latest published news articles, limited to 20 records.

No frontend connects directly to PostgreSQL. Frontends will call the appropriate HTTP API only.

## Local environment

Copy the relevant `.env.example` into a local `.env` when running a service manually. Never commit a real `.env` file or production credentials.

The local PostgreSQL instances are exposed on ports 5433–5435. The three services use separate database users, databases and containers.

## Database boundaries

- An Pardaz DB: customers, accounts, cards and financial transactions.
- An Sarraf DB: customers, assets, wallets, orders, trades, deposits and withdrawals.
- Platform DB: users, Banner, Market, forum and content/news.

Sensitive banking and exchange data must not be copied into the Platform DB. Cross-service communication must use authenticated APIs rather than direct database access.

## Development

Backend services use Node.js 24 native TypeScript execution for the development watcher, avoiding the previous `tsx`/esbuild dependency. Production builds use `tsc` and run the generated JavaScript with Node.

The repository CI workflow builds all three backend services plus the mobile and web applications on every push to `main` and every pull request.
