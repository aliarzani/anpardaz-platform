# Shared Identity Architecture

## Goal

A user has one ecosystem identity. The same identity is recognized by the An Pardaz app, web platform, An Sarraf, An Banner, An Market, forum and future ecosystem services.

## Design

- Platform owns the central identity record and authentication credentials.
- The identity is a UUID (`identity_id`) and is the stable user identifier across the ecosystem.
- Platform issues short-lived Ed25519-signed access tokens with `sub=identity_id`, `iss=anpardaz-platform`, `aud=anpardaz-ecosystem`, email and role claims.
- An Pardaz and An Sarraf receive only the public verification key. They never receive the private signing key.
- Each domain keeps its own isolated customer/profile record linked to the same `identity_id`.
- No cross-database foreign keys are used and no service connects directly to another service's database.
- Domain records are provisioned lazily on the first authenticated request, so a user can register once and then immediately be recognized in each domain.

## Authentication flow

1. User registers or logs in through any ecosystem auth endpoint.
2. An Pardaz/An Sarraf proxy the credential operation to Platform Identity.
3. Platform validates credentials and returns the same ecosystem access token format.
4. The calling domain verifies the signature locally using the public key.
5. The domain creates or updates its local customer record using `identity_id`.
6. All subsequent protected requests use the same Bearer token.

## Security boundaries

- Identity private key exists only in the identity service environment.
- An Pardaz and An Sarraf databases remain separate.
- Banking and exchange data remain domain-specific and are never merged into the identity database.
- Production services use distinct environment secrets and isolated infrastructure.
- Access tokens are short-lived; refresh/session infrastructure can be added later without changing the stable identity model.

## Local development

`scripts/bootstrap-local.sh` generates an Ed25519 key pair automatically, places the private key only in `services/platform/.env`, and places the public key in the An Pardaz and An Sarraf local environments.

Never commit generated `.env` files or production private keys.
