# ✦ An Pardaz Platform

### همه‌چیز در یک اکوسیستم

> **An Pardaz — یک پلتفرم یکپارچه برای خدمات مالی، بازار، محتوا و ابزارهای هوشمند**

An Pardaz Platform is the central monorepo for the next generation of the **An Pardaz ecosystem**. The project is being built as a modular, secure and scalable platform in which independent applications and services can evolve together while remaining technically isolated where required.

---

## 🚀 Project Vision

**«آن پرداز همه چیز در یک اپلیکیشن»**

The long-term ecosystem brings financial services, digital-asset services, marketplace capabilities, classified listings, intelligent assistance and financial management into one connected experience.

The platform is designed around four principles:

- **Modular** — applications and services remain independently maintainable.
- **Scalable** — individual services can scale without redesigning the entire platform.
- **Secure** — sensitive financial and exchange data are isolated by design.
- **User-centered** — the experience remains consistent across mobile and web.

---

## 🧩 Ecosystem

| Product | Purpose |
|---|---|
| **An Pardaz** | Financial, banking and transaction services |
| **An Sarraf** | Digital-asset exchange and related services |
| **An Banner** | Classified advertisements and local listings |
| **An Market** | Product marketplace and price comparison |
| **An Hoosh** | Intelligent assistant and AI-powered capabilities |
| **Financial Center** | Income, expenses and personal financial management |
| **An Yab** | Planned future ecosystem service |

---

## 📱 Applications

### Mobile

`apps/mobile`

The primary An Pardaz mobile frontend. The current approved UI is preserved as the baseline for development and future Android/iOS builds.

### Web

`apps/web`

The independent An Pardaz web frontend, providing the public web experience and the foundation for the wider ecosystem's web services.

Both frontends are maintained inside the same monorepo while remaining independently runnable.

---

## 🏗️ Repository Structure

```text
anpardaz-platform/
│
├── apps/
│   ├── mobile/          # An Pardaz mobile frontend
│   └── web/             # An Pardaz web frontend
│
├── packages/            # Shared packages and reusable modules
│
├── services/
│   ├── anpardaz/        # Future An Pardaz services
│   ├── ansarraf/        # Future An Sarraf services
│   └── platform/        # Future platform services
│
├── databases/
│   ├── anpardaz/        # Future An Pardaz database definitions
│   ├── ansarraf/        # Future An Sarraf database definitions
│   └── platform/        # Future platform database definitions
│
├── infrastructure/     # Future deployment/infrastructure configuration
├── docs/                # Architecture and project documentation
└── README.md
```

> **Current phase:** Frontend development only. Backend, databases and infrastructure are intentionally not active yet.

---

## 🛠️ Development Roadmap

### Phase 1 — Frontend Foundation

- [x] Create central monorepo
- [x] Import approved Mobile frontend
- [x] Import approved Web frontend
- [x] Configure both applications for independent execution
- [x] Verify frontend builds
- [x] Run both frontends in GitHub Codespaces
- [ ] Complete frontend navigation and runtime verification
- [ ] Complete responsive/desktop web verification
- [ ] Final frontend cleanup and synchronization

### Phase 2 — Backend

After both frontends are fully verified:

- API architecture
- Authentication and authorization
- Service boundaries
- Validation and error handling
- Security architecture

### Phase 3 — Data Layer

Three logically independent PostgreSQL databases are planned:

- **An Pardaz DB** — banking, cards, accounts and financial transactions
- **An Sarraf DB** — wallets, assets, orders, trades, deposits and withdrawals
- **Platform DB** — Banner, Market, Hoosh, forum, news and other non-sensitive platform data

No frontend will connect directly to PostgreSQL. All database access will be mediated through APIs/services.

### Phase 4 — Infrastructure & Scale

The future deployment model is designed around isolated service groups:

```text
VPS 1 → An Pardaz / Banking
VPS 2 → An Sarraf / Exchange
VPS 3 → Platform Services
```

Each group is intended to have independent runtime, secrets, database, network, firewall and deployment boundaries, while the repository remains a monorepo.

---

## 🔐 Security Principles

Security is a foundational requirement of the platform, especially for financial and exchange functionality.

- Sensitive financial data must remain isolated.
- An Pardaz and An Sarraf databases must not be directly accessible from one another.
- Frontends must never connect directly to PostgreSQL.
- Secrets must be managed independently from source code.
- Services should communicate through explicit APIs and controlled interfaces.
- Infrastructure must support least-privilege access and future horizontal scaling.

---

## 💻 Local / Codespaces Development

The current frontend applications can be developed independently:

```bash
cd apps/mobile
npm install
npm run build
```

```bash
cd apps/web
npm install
npm run build
```

Development servers can then be started independently according to each application's Vite configuration.

The project is developed with **GitHub Codespaces** and the `main` branch is kept synchronized with the active development environment.

---

## 📌 Development Rules

1. Preserve the approved frontend UI unless an explicit UI change is requested.
2. Do not modify the legacy `Anpardaz_working_-` application; it is reference-only.
3. Do not introduce backend, PostgreSQL or production infrastructure before frontend verification is complete.
4. Investigate real project files before making architectural decisions.
5. Avoid unrelated changes when fixing a frontend issue.
6. Keep Mobile and Web independently runnable.
7. Commit and push meaningful changes to `main` as development progresses.

---

## 🌱 Long-Term Architecture

The intended architecture is a **monorepo with independently deployable applications and services**:

```text
                    ┌─────────────────────┐
                    │   An Pardaz Platform │
                    └──────────┬──────────┘
                               │
          ┌────────────────────┼────────────────────┐
          │                    │                    │
      An Pardaz            An Sarraf          Platform
      Banking              Exchange            Services
          │                    │                    │
       DB-A                 DB-B                 DB-C
```

The architecture is intentionally being built in stages so that the frontend foundation can be validated before introducing financial infrastructure and persistent data services.

---

## 📜 Status

**Current status: 🟢 Frontend Foundation**

Mobile and Web frontends are imported into the central repository, build successfully, and are being verified through GitHub Codespaces.

Backend and database implementation will begin only after the frontend phase has been completed and explicitly approved.

---

## © An Pardaz

**An Pardaz — همه‌چیز در یک اپلیکیشن**

Built as a modular foundation for a larger Persian-first digital ecosystem.
