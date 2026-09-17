# An Pardaz — Accounting and Ledger Architecture

## Objective

The platform will use a proper double-entry accounting engine rather than treating UI balances as financial truth. Every money-moving operation must be represented by an immutable accounting transaction with balanced debit/credit entries.

## Principles

- Every posted ledger transaction is balanced: total debits = total credits.
- Posted entries are immutable. Corrections are new compensating transactions, never edits to history.
- Business operations have explicit state machines: initiated, pending, approved, posted, failed, reversed, or cancelled as appropriate.
- Idempotency keys prevent duplicate financial posting when clients retry.
- Domain services own their operational records; the accounting layer owns accounting truth.
- No frontend or AI component can write ledger entries directly.
- Sensitive admin actions require authorization, reason/reference and an audit event.

## Canonical flow

```text
User action
   -> Domain API
   -> validation + authorization
   -> business transaction/state change
   -> accounting command
   -> double-entry ledger transaction
   -> notification/event
   -> audit log
   -> admin/support timeline
```

## Required accounting concepts

- Chart of accounts
- Ledger accounts
- Journal transactions
- Journal entries
- Currencies/assets
- Exchange rates where required
- Fees and commissions
- Holds/reservations
- Settlement
- Reversal/refund
- Reconciliation
- Idempotency
- Period/reporting metadata

## Cross-platform examples

### An Pardaz transfer

A transfer must create accounting entries for the source account, destination account, and any applicable fee account. The transfer record and ledger transaction share a stable reference.

### An Sarraf trade

A trade affects asset balances and fee accounts. Market prices are market data; the accounting amount is derived from the executed trade and settlement rules.

### Withdrawal

Withdrawal request -> risk/operations review -> approval -> funds hold -> settlement -> final posting -> external reference -> audit.

### An Market

A completed paid order creates the appropriate customer, seller/merchant and platform fee accounting events according to the marketplace settlement policy.

## Admin controls

The Operations Panel must expose pending financial operations, but an operator must never edit a posted balance manually. Supported corrections use controlled adjustment/reversal workflows with permissions and complete audit history.

## Data boundaries

The current platform keeps An Pardaz, An Sarraf and Platform domain databases isolated. The accounting engine should be introduced as a dedicated service/database boundary rather than copying sensitive domain tables into the Platform database. Cross-domain linkage uses `identity_id`, stable transaction references and signed/service-authenticated commands, not cross-database foreign keys.

## Future implementation stages

1. Define chart of accounts and accounting events.
2. Introduce the dedicated ledger service/database.
3. Add posting adapters for An Pardaz and An Sarraf.
4. Add marketplace/content/AI monetization events where applicable.
5. Add reconciliation and settlement jobs.
6. Expose read-only accounting views to Admin and Financial Center.
7. Add automated balance/invariant tests and reconciliation reports.

This document is intentionally separate from the current domain migrations so the accounting boundary can be implemented deliberately and safely instead of creating a partial ledger that later has to be replaced.
