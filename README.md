# ✦ An Pardaz Platform

### همه‌چیز در یک اکوسیستم

> **An Pardaz — یک پلتفرم یکپارچه برای خدمات مالی، بازار، محتوا و ابزارهای هوشمند**

An Pardaz Platform is the central monorepo for the An Pardaz ecosystem. The architecture is modular: Mobile, Web and backend services evolve together in one repository while sensitive financial and exchange workloads remain isolated.

---

## 🚀 Vision

**«آن پرداز همه چیز در یک اپلیکیشن»**

The ecosystem brings financial services, digital-asset services, marketplace capabilities, classified listings, intelligent assistance and financial management into one connected experience.

Core principles:

- **Modular** — independently maintainable applications and services.
- **Scalable** — service groups can scale independently.
- **Secure** — sensitive financial and exchange data are isolated by design.
- **User-centered** — consistent Persian-first experiences across Mobile and Web.

## 🧩 Ecosystem

| Product | Purpose |
|---|---|
| **An Pardaz** | Financial, banking and transaction services |
| **An Sarraf** | Digital-asset exchange services |
| **An Banner** | Classified advertisements and local listings |
| **An Market** | Product marketplace and price comparison |
| **An Hoosh** | Intelligent assistant and AI capabilities |
| **Financial Center** | Income, expenses and personal financial management |
| **An Yab** | Planned future ecosystem service |

## 🏗️ Repository

```text
anpardaz-platform/
├── apps/
│   ├── mobile/          # Approved An Pardaz mobile frontend
│   └── web/             # Approved An Pardaz web frontend
├── packages/            # Shared modules
├── services/
│   ├── anpardaz/        # Banking / financial API service
│   ├── ansarraf/        # Exchange API service
│   └── platform/        # Banner / Market / content API service
├── databases/
│   ├── anpardaz/        # An Pardaz PostgreSQL migrations
│   ├── ansarraf/        # An Sarraf PostgreSQL migrations
│   └── platform/        # Platform PostgreSQL migrations
├── infrastructure/      # Deployment configuration
├── docs/                # Architecture and engineering documentation
└── .github/workflows/   # Continuous integration
```

## ✅ Current implementation status

### Frontend

- [x] Central monorepo created
- [x] Approved Mobile frontend imported
- [x] Approved Web frontend imported
- [x] Frontend builds verified in Codespaces
- [x] Existing frontend UI preserved as the implementation baseline

### Backend foundation

- [x] Three independently deployable Fastify services
- [x] CORS configuration
- [x] Liveness and database readiness endpoints
- [x] API version/status endpoints
- [x] PostgreSQL connection pools with bounded connections/timeouts
- [x] Platform published-news API with pagination
- [x] Node.js 24 native TypeScript development workflow; no `tsx`/esbuild dependency in backend services
- [x] Local environment templates

### Data layer

- [x] Three separate PostgreSQL 17 instances for local development
- [x] Separate database users, databases and persistent volumes
- [x] Foundation and core migrations for all three databases
- [x] Migration runner
- [x] Financial, exchange and platform data separated by database boundary

### CI

- [x] GitHub Actions build checks for Mobile, Web and all backend services

## 🗄️ Database boundaries

**An Pardaz DB** contains banking-domain data such as customers, accounts, cards and financial transactions.

**An Sarraf DB** contains exchange-domain data such as customers, assets, wallets, orders, trades, deposits and withdrawals.

**Platform DB** contains non-sensitive platform data such as Banner, Market, forum and news/content.

No frontend connects directly to PostgreSQL. Cross-service communication will use authenticated APIs. Sensitive banking and exchange data must not be copied into the Platform database.

## 🔐 Deployment model

The target production topology is:

```text
VPS 1 → An Pardaz / Banking → An Pardaz DB
VPS 2 → An Sarraf / Exchange → An Sarraf DB
VPS 3 → Platform Services   → Platform DB
```

The repository remains a monorepo, but each service group is designed for independent runtime, secrets, network, firewall and deployment boundaries.

## 🛠️ Development

Frontend builds:

```bash
cd apps/mobile && pnpm install && pnpm run build
cd apps/web && pnpm install && pnpm run build
```

Backend builds:

```bash
pnpm --dir services/anpardaz install && pnpm --dir services/anpardaz build
pnpm --dir services/ansarraf install && pnpm --dir services/ansarraf build
pnpm --dir services/platform install && pnpm --dir services/platform build
```

Local PostgreSQL is defined in `databases/docker-compose.yml`. Copy `databases/.env.example` to `databases/.env`, start the three containers, then run `bash databases/migrate.sh`.

Backend environment examples are provided in each service directory. Real secrets must never be committed.

## 📡 Backend endpoints

Each backend service provides:

- `GET /health`
- `GET /health/db`
- `GET /api/v1/status`

Platform additionally provides:

- `GET /api/v1/news?page=1&limit=20`

The API surface will expand only after authentication, authorization, validation and service-boundary rules are established.

## 🔒 Engineering rules

1. Preserve the approved frontend UI unless an explicit UI change is requested.
2. Do not modify the legacy `Anpardaz_working_-` application; it is reference-only.
3. Never expose PostgreSQL directly to a frontend.
4. Keep An Pardaz Banking and An Sarraf Exchange isolated at database, secrets, network and deployment levels.
5. Never commit real credentials or tokens.
6. Use explicit API boundaries for cross-service communication.
7. Avoid unrelated changes when fixing a specific issue.
8. Keep meaningful changes committed and pushed to `main`.

## 📚 Documentation

- `docs/backend-foundation.md` — backend boundaries, health/readiness and local environment
- `databases/` — PostgreSQL migrations and local database orchestration
- `.github/workflows/ci.yml` — automated build checks

## 📜 Status

**Current phase: Backend + Database Foundation**

The project has moved beyond the frontend-only foundation. The next implementation layer is the secure API platform: authentication/authorization, request validation, domain repositories and controlled business APIs, followed by production infrastructure and deployment automation.

---

## © An Pardaz

**An Pardaz — همه‌چیز در یک اپلیکیشن**
