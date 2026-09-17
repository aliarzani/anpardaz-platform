# An Pardaz Platform — Capability Map

This document is the implementation contract between the existing Web/Mobile UX and the backend architecture. New backend tables or APIs must map to a real capability, an operational need, or a documented platform requirement.

## 1. Identity and account

- One ecosystem identity: `identity_id` is the stable cross-platform user key.
- Platform identity is authoritative for authentication.
- An Pardaz and An Sarraf keep domain-local customer records keyed by the same identity.
- Admin must be able to open one user and see a cross-service operational timeline.

## 2. An Pardaz — banking and card services

- Customer/profile and identity status
- Bank/card management
- Account balances
- Card balance inquiry where supported
- Money transfer
- Top-up/charge
- Transfer descriptions and references
- Transaction history
- Incoming/outgoing transaction states
- Pending/failed/completed operations
- Financial notifications
- Sensitive operations require authorization, idempotency and auditability

Every money-moving operation must have a durable financial event and an accounting reference. No UI balance is authoritative by itself.

## 3. An Sarraf — exchange

- Asset catalog
- Wallets
- Available and locked balances
- Buy/sell orders
- Market/limit order lifecycle
- Trades
- Deposits
- Withdrawals
- Fees
- Market data and price sources
- Withdrawal review/approval workflow
- Exchange transaction history

Market-data ingestion is separate from accounting and settlement. External quotes never directly mutate balances.

## 4. An Banner

- Categories and city filtering
- Listing creation/editing
- Images and listing metadata
- Draft/published/paused/sold/archived lifecycle
- Search and pagination
- User-owned listings
- Likes/comments where enabled
- Moderation
- AI-assisted listing creation, rewriting and suggestions
- Reports and support escalation

## 5. An Market

- Product catalog
- Categories and search
- Product detail
- Seller information
- Price/seller comparison
- Product/order lifecycle
- User orders and payment references
- Inventory/out-of-stock state
- Likes/reviews/comments where enabled
- AI-assisted product discovery and assistance

An Market is a product marketplace/comparison area, not An Banner classifieds.

## 6. An Hoosh / AI Gateway

AI is a platform capability, not a hard-coded dependency on one model vendor.

- Conversational assistance
- Context-aware assistance inside An Banner, An Market, An Pardaz and Financial Center
- Action proposals and, where explicitly authorized, action execution through audited tools
- Provider abstraction for future OpenAI/other providers
- Model, provider, cost and usage tracking
- Prompt/version/configuration management
- Safety and permission boundaries
- Human/admin review for sensitive automated actions

AI must never receive unrestricted database access. Actions go through typed application tools with authorization and audit logs.

## 7. Financial Center

- Income and expense aggregation
- Categorization
- Manual income/job entries
- Transaction classification
- Spending summaries
- Alerts and thresholds
- Cross-domain financial-event references

The Financial Center consumes normalized financial events; it does not invent or overwrite the source-of-truth transaction ledger.

## 8. Content, news and education

- Crypto news
- Educational content from beginner to advanced
- Trading terminology/strategies/educational material
- Search-friendly article pages
- Tags and hashtags
- SEO title, description, canonical slug and structured metadata
- Images/media references
- Draft/review/published lifecycle
- Comments/likes where enabled

Content ingestion and AI rewriting are asynchronous jobs. Source attribution and editorial status must remain traceable.

## 9. Forum and community

- Threads
- Posts/replies
- Categories
- User participation
- Moderation
- Reporting
- Likes/comments where enabled
- Admin/support visibility

## 10. Support and customer operations

- Tickets
- Ticket messages
- Priority/status/category
- Assignment to operator/team
- Attachments/references
- Internal notes
- Customer contact history
- Links from a ticket to user, transaction, order, withdrawal, listing or other operational object
- Full audit trail

A support operator must be able to move from a user to the relevant transaction/order/event without asking the customer to repeat information unnecessarily.

## 11. Admin / Operations Panel

The admin panel is an operational control plane, not a second customer application.

Core views:

- Global dashboard
- User search by identity/email/phone/domain identifier
- Unified user profile
- User activity timeline
- Financial operations
- Pending approvals
- Exchange withdrawals/deposits
- Tickets and customer conversations
- Banner moderation
- Market moderation/orders
- Forum moderation
- News/content workflow
- AI jobs and provider health
- Notifications
- Audit log
- Role/permission management

Sensitive actions require explicit permission, reason/reference, idempotency where applicable, and an immutable audit event.

## 12. Cross-cutting platform requirements

Every new capability should be evaluated for:

1. Authentication
2. Authorization / role
3. Ownership checks
4. Idempotency
5. State machine
6. Accounting impact
7. Audit event
8. Notification
9. Support traceability
10. Rate limiting / abuse protection
11. Observability
12. AI involvement, if useful
13. Admin visibility
14. Data retention/privacy requirements

## 13. Implementation rule

The frontend is the capability reference. The database is the source-of-record for persisted state. APIs are the controlled boundary. Accounting is the financial source-of-truth. Audit is the operational history. Admin is the control plane.

Do not add a speculative field merely to satisfy a guessed UI contract. First identify the capability and its lifecycle, then define the API and persistence model.
