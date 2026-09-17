# Production Deployment Blueprint

Production is intentionally split into three service groups:

1. **VPS 1 — An Pardaz / Banking**
   - `services/anpardaz`
   - An Pardaz PostgreSQL database on the banking network
2. **VPS 2 — An Sarraf / Exchange**
   - `services/ansarraf`
   - An Sarraf PostgreSQL database on the exchange network
3. **VPS 3 — Platform**
   - `services/platform`
   - Platform PostgreSQL database

## Isolation rules

- Never expose PostgreSQL to the public Internet.
- Each VPS gets its own database credentials, JWT secret and deployment secrets.
- Banking and exchange databases must not accept connections from the other service group.
- Cross-service communication must use authenticated HTTPS APIs and explicit allowlists.
- Containers run as the unprivileged `node` user with a read-only filesystem and dropped Linux capabilities.
- Put TLS termination and public routing in the infrastructure layer; backend ports are bound to loopback in the supplied compose templates.

## First deployment

For each VPS, copy its matching `*.env.example` to an environment-only file, replace all placeholders, build the service image and start its compose file.

Run the database migrations from the database host/network before enabling authenticated traffic. The migration runner is idempotent and applies migrations in filename order.

## Secrets

Generate unique high-entropy `JWT_SECRET` values per environment. Do not store production secrets in GitHub source files. Use the VPS secret manager or protected environment configuration.

## Operational checks

After deployment verify:

- `GET /health` returns HTTP 200.
- `GET /health/db` returns HTTP 200 only when the intended database is reachable and migrations are present.
- `GET /api/v1/status` reports `v1` and `ready`.
- Authentication registration/login works only over HTTPS.
- Public traffic cannot reach PostgreSQL or internal backend ports directly.

The supplied compose files are deployment templates, not a claim that a particular VPS provider, firewall or domain has already been configured.
