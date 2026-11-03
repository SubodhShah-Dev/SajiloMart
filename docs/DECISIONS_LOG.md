# SajiloMart — Decisions Log

> Lightweight Architecture Decision Records (ADRs). Add an entry when a decision
> affects architecture, security, data, permissions, or delivery process.
>
> Status values: Proposed, Accepted, Superseded, Deprecated, Deferred.

## Index

| ID | Title | Status | Date |
|---|---|---|---|
| ADR-001 | Monorepo with separate frontend and backend applications | Accepted | 2026-11-03 |
| ADR-002 | Initial technology stack | Accepted | 2026-11-03 |
| ADR-003 | Migration-only schema management | Accepted | 2026-11-03 |
| ADR-004 | Service-repository backend layering | Accepted | 2026-11-03 |
| ADR-005 | Incremental role-based access control without permission tables | Accepted | 2026-11-03 |
| ADR-006 | Cookie-based JWT authentication with refresh rotation | Accepted | 2026-11-03 |
| ADR-007 | Geography as reference data, not authorization scope | Accepted | 2026-11-03 |
| ADR-008 | Parent order plus seller-specific fulfillment groups | Accepted (details deferred) | 2026-11-03 |
| ADR-009 | Flat documentation with owner-authored requirement documents | Accepted | 2026-11-03 |
| ADR-010 | Cash on Delivery first; Stripe preparation only until approved | Accepted | 2026-11-03 |
| ADR-011 | Provider-independent backend | Accepted | 2026-11-03 |
| ADR-012 | No application code during Phase 0 | Accepted | 2026-11-03 |

---

## ADR-001 — Monorepo with separate frontend and backend applications

**Status:** Accepted
**Date:** 2026-11-03

**Context:** The project needs a React frontend and an Express backend with a
shared roadmap and documentation, developed by a small team or solo developer.

**Decision:** Use a single repository containing `frontend/` and `backend/`
applications, introduced in Sprint 1.

**Consequences:**

- One place for documentation, issues, and sprint history.
- Independent build and deployment per application.
- No shared package until a real requirement appears.
- Repository-level tooling must not accidentally couple the applications.

**Alternatives considered:** Separate repositories; a single full-stack
framework. Both add coordination or migration cost without a current benefit.

---

## ADR-002 — Initial technology stack

**Status:** Accepted
**Date:** 2026-11-03

**Context:** The project needs a mainstream, maintainable stack the owner can
review and extend.

**Decision:**

- Frontend: React, TypeScript, Vite, Redux Toolkit, React Router DOM, Tailwind
  CSS, Lucide React, Recharts.
- Backend: Node.js, Express, TypeScript, TypeORM, MySQL, Winston, Morgan, Helmet,
  CORS.
- Database: MySQL on Aiven.
- Deployment: Vercel for the frontend; provider-independent backend.

**Consequences:**

- Well-documented ecosystem and straightforward hiring/handover.
- Recharts is introduced only with dashboards.
- No dependency is added before its feature needs it.

**Alternatives considered:** Next.js, NestJS, PostgreSQL, Prisma, and other
stacks. Not selected because the specified stack matches the development plan and
owner preferences.

---

## ADR-003 — Migration-only schema management

**Status:** Accepted
**Date:** 2026-11-03

**Context:** Automatic schema synchronization risks data loss and environment
drift.

**Decision:** Disable `synchronize` in every environment. Every schema change is a
TypeORM migration with working `up` and `down` operations.

**Consequences:**

- Explicit, reviewable schema history.
- Migrations must be tested on fresh and existing databases.
- Constraint and index changes belong in the same migration as the schema change.

**Alternatives considered:** `synchronize: true` for development. Rejected
because it can hide migration defects and diverge from production.

---

## ADR-004 — Service-repository backend layering

**Status:** Accepted
**Date:** 2026-11-03

**Context:** Business logic must be testable and not trapped in HTTP handlers.

**Decision:** Use routes → controllers → services → repositories, with entities
and middleware. Controllers handle HTTP only; services hold business rules;
repositories own database access.

**Consequences:**

- Clear responsibilities and easier testing.
- Some additional files per module.
- Avoid abstractions that do not yet earn their place.

**Alternatives considered:** Fat controllers or active-record style. Rejected for
maintainability and testability.

---

## ADR-005 — Incremental role-based access control without permission tables

**Status:** Accepted
**Date:** 2026-11-03

**Context:** The final product has four roles, but a full permission system is not
needed upfront.

**Decision:** Use a simple role field on the user and centralized
role/ownership middleware. Add permissions only with the feature they protect.
Do not create permission tables or a dynamic permission-management system without
a genuine requirement.

**Consequences:**

- Simple, auditable authorization early.
- `ROLES_AND_PERMISSIONS.md` must evolve every sprint.
- Backend checks are authoritative; frontend checks are cosmetic.
- A future permission system remains possible if a real need appears.

**Alternatives considered:** Full permission tables and dynamic policies.
Rejected as premature complexity.

---

## ADR-006 — Cookie-based JWT authentication with refresh rotation

**Status:** Accepted
**Date:** 2026-11-03

**Context:** Token storage in browser storage exposes tokens to XSS. Sessions need
safe refresh behavior.

**Decision:** Issue short-lived access JWTs and longer-lived refresh JWTs in
HTTP-only cookies. Hash refresh tokens before storage, rotate on refresh, revoke
on logout, and support session restoration. Use explicit CORS origins,
credentials, secure cookies in production, and appropriate SameSite and CSRF
protection.

**Consequences:**

- Tokens are never readable by frontend JavaScript.
- CSRF protection becomes necessary.
- Refresh-session data must be stored and cleaned up.
- Google OAuth must issue the same application session after identity
  validation.

**Alternatives considered:** localStorage JWTs and server-side sessions. Local
storage was rejected for security; server-side sessions were not selected for the
specified JWT-based design.

---

## ADR-007 — Geography as reference data, not authorization scope

**Status:** Accepted
**Date:** 2026-11-03

**Context:** Nepal has 7 provinces and 77 districts that are needed for delivery
addresses.

**Decision:** Store provinces and districts as reference data used by address
forms. Do not create province or district administrator roles. Do not scope ADMIN
or SUPERADMIN authority geographically.

**Consequences:**

- Simpler authorization model.
- Seed data must be complete and verified.
- Geography is introduced only with the address feature.

**Alternatives considered:** Regional administrators. Rejected as out of scope.

---

## ADR-008 — Parent order plus seller-specific fulfillment groups

**Status:** Accepted (details deferred to Sprint 12)
**Date:** 2026-11-03

**Context:** A customer order may contain products from multiple sellers, and each
seller must fulfill only their items.

**Decision:** Use a parent customer order plus seller-specific suborders or
fulfillment groups. The customer sees the whole order; each seller sees only their
group; ADMIN and SUPERADMIN see all. Preserve price snapshots and transactional
inventory consistency.

**Consequences:**

- Multi-vendor compatibility from the start.
- Order status is split between overall and seller-level state.
- The exact naming, status transitions, and schema are decided and documented in
  Sprint 12 with migrations.

**Alternatives considered:** One order per seller at checkout, or one flat order
with per-item seller status. Both remain possible but the parent/suborder model is
the working direction.

---

## ADR-009 — Flat documentation with owner-authored requirement documents

**Status:** Accepted
**Date:** 2026-11-03

**Context:** The owner wants to review and write business requirements personally
while keeping documentation easy to navigate.

**Decision:** Keep `docs/` flat. Provide complete guides, logs, and templates, but
leave BRD, SRS, Use Cases, and detailed ERD content to the owner. Mark
placeholders clearly and do not fabricate requirements.

**Consequences:**

- Documentation stays discoverable.
- Templates must be updated as requirements are approved.
- Implementation must stay consistent with approved documents.

**Alternatives considered:** Nested documentation trees. Rejected as unnecessary
at this stage.

---

## ADR-010 — Cash on Delivery first; Stripe preparation only until approved

**Status:** Accepted
**Date:** 2026-11-03

**Context:** Online payment adds provider integration, webhook security, and
reconciliation complexity.

**Decision:** Start with Cash on Delivery. Prepare payment structures and Stripe
Sandbox placeholders in Sprint 16, but do not implement actual payment processing
or fake success until explicitly approved.

**Consequences:**

- Orders can be placed without a payment provider dependency.
- Payment status must never be marked paid without verified confirmation.
- Webhook handling must be idempotent and transactional when implemented.

**Alternatives considered:** Implement Stripe immediately or simulate payments.
Both rejected for scope and integrity reasons.

---

## ADR-011 — Provider-independent backend

**Status:** Accepted
**Date:** 2026-11-03

**Context:** The deployment provider for the backend is not fixed.

**Decision:** Keep the backend deployable to any Node.js host. Avoid
provider-specific runtime APIs and document required environment variables.

**Consequences:**

- Portable deployment.
- Provider-specific features require explicit evaluation.
- Frontend remains on Vercel as planned.

**Alternatives considered:** Tight coupling to a single backend platform.
Rejected for flexibility.

---

## ADR-012 — No application code during Phase 0

**Status:** Accepted
**Date:** 2026-11-03

**Context:** The owner wants to review scope and documentation before code exists.

**Decision:** Phase 0 creates documentation only. No scaffolding, dependencies,
entities, migrations, APIs, or authentication.

**Consequences:**

- Scope and roles are reviewed before implementation.
- Sprint 1 can start from a clean, documented baseline.
- The repository intentionally has no runnable app yet.

**Alternatives considered:** Scaffold early. Rejected to preserve the incremental
review process.

---

## Open decisions

| ID | Decision needed | Owner | Target | Notes |
|---|---|---|---|---|
| OD-001 | Primary key strategy (integer vs. UUID) | Project owner / architecture | Sprint 2 | Affects all entities |
| OD-002 | Product image storage strategy | Project owner | Sprint 2 | Local/files vs. object storage |
| OD-003 | Search implementation | Project owner | Sprint 2 | Database search vs. external engine |
| OD-004 | Seller approval authority | Project owner | Sprint 10 | ADMIN vs. SUPERADMIN |
| OD-005 | Seller suborder naming and status model | Architecture | Sprint 12 | Parent/suborder direction accepted |
| OD-006 | Shipping fee and delivery-zone rules | Project owner | Sprint 5 | Business requirement needed |
| OD-007 | CSRF strategy | Architecture | Sprint 3 | SameSite plus token vs. other |
| OD-008 | Password reset and email verification timing | Project owner | Sprint 3+ | Requires email provider decision |
| OD-009 | Audit log scope and retention | Project owner | Future | Superadmin privilege |
| OD-010 | Soft-delete scope | Architecture | Per sprint | Users, products, stores |
| OD-011 | Suspended-user session behavior | Project owner | Sprint 6 | Revoke sessions or block on use |
