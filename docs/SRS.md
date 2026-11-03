# SajiloMart — Software Requirements Specification (SRS)

> **Status:** Template — to be completed by the project owner.
>
> This document provides structure, identifiers, and writing guidance. Detailed
> functional and non-functional requirements will be written by the project
> owner. Placeholders are not approved requirements.

## Document control

| Field | Value |
|---|---|
| Document | Software Requirements Specification |
| Project | SajiloMart |
| Version | 0.1 (template) |
| Owner | `TBD — project owner` |
| Last updated | Phase 0 |
| Related documents | [`BRD.md`](./BRD.md), [`USE_CASES.md`](./USE_CASES.md), [`ERD.md`](./ERD.md), [`ROLES_AND_PERMISSIONS.md`](./ROLES_AND_PERMISSIONS.md) |

## 1. Introduction

### 1.1 Purpose

> **Writing guidance:** State who will use this SRS and what decisions it
> supports (design, implementation, testing, acceptance).

`TBD — project owner`

### 1.2 Scope

> **Writing guidance:** Summarize the software being specified and its boundaries.
> Reference the initial and final scopes in [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md).

`TBD — project owner`

### 1.3 Definitions and acronyms

| Term | Definition |
|---|---|
| RBAC | Role-based access control |
| JWT | JSON Web Token |
| COD | Cash on Delivery |
| `TBD` | To be defined by the project owner |

### 1.4 References

- [`PROJECT_GUIDE.md`](./PROJECT_GUIDE.md) — authoritative project rules.
- [`BRD.md`](./BRD.md) — business requirements.
- [`USE_CASES.md`](./USE_CASES.md) — actors and use cases.
- [`ERD.md`](./ERD.md) — conceptual data model.
- [`ROLES_AND_PERMISSIONS.md`](./ROLES_AND_PERMISSIONS.md) — permission policy.
- [`SPRINT_ROADMAP.md`](./SPRINT_ROADMAP.md) — delivery sequence.

## 2. Overall description

### 2.1 Product perspective

> **Writing guidance:** Describe SajiloMart as a monorepo web application with a
> React frontend, an Express/TypeORM backend, and an Aiven MySQL database. Mention
> that it starts simple and grows into a multi-vendor marketplace.

`TBD — project owner`

### 2.2 User classes and characteristics

| Class | Description | Technical skill | Frequency of use |
|---|---|---|---|
| Visitor | Unauthenticated browser | Low | Occasional |
| Customer | Registered shopper | Low | Regular |
| Seller | Approved merchant | Low–Medium | Daily |
| Admin | Platform operator | Medium | Daily |
| Superadmin | Privileged owner | Medium–High | As needed |

`TBD — refine personas`

### 2.3 Operating environment

> **Writing guidance:** Record supported browsers, network assumptions, hosting
> (Vercel + Aiven), and development environment constraints.

`TBD — project owner`

### 2.4 Design and implementation constraints

- React, TypeScript, Vite, Redux Toolkit, React Router DOM, Tailwind CSS, Lucide
  React, and Recharts on the frontend.
- Node.js, Express, TypeScript, TypeORM, MySQL, Winston, Morgan, Helmet, and CORS
  on the backend.
- Service-repository layering; no business logic in routes or controllers.
- Migrations only; `synchronize` is always disabled.
- JWT access and refresh tokens in HTTP-only cookies with refresh rotation.
- Secrets supplied through environment variables and never committed.
- Incremental RBAC: implement only permissions required by the current sprint.

### 2.5 Assumptions and dependencies

`TBD — project owner`

## 3. Functional requirements

> **Writing guidance:** Use one row per requirement. Each requirement must be
> testable, have an ID, and reference its source business requirement or use case.
> Mark status as Draft, Approved, Implemented, or Deferred. Only mark Implemented
> after verification.

### 3.1 Public catalog and discovery

| ID | Requirement | Priority | Source | Sprint | Status |
|---|---|---|---|---|---|
| FR-CAT-001 | `TBD` | Must | `TBD` | 2 | Draft |
| FR-CAT-002 | `TBD` | Should | `TBD` | 2 | Draft |

### 3.2 Authentication and account

| ID | Requirement | Priority | Source | Sprint | Status |
|---|---|---|---|---|---|
| FR-AUTH-001 | `TBD` | Must | `TBD` | 3 | Draft |
| FR-AUTH-002 | `TBD` | Must | `TBD` | 13 | Draft |

### 3.3 Cart and wishlist

| ID | Requirement | Priority | Source | Sprint | Status |
|---|---|---|---|---|---|
| FR-CART-001 | `TBD` | Must | `TBD` | 4 | Draft |
| FR-WISH-001 | `TBD` | Should | `TBD` | 8 | Draft |

### 3.4 Addresses, checkout, and orders

| ID | Requirement | Priority | Source | Sprint | Status |
|---|---|---|---|---|---|
| FR-CHK-001 | `TBD` | Must | `TBD` | 5 | Draft |
| FR-ORD-001 | `TBD` | Must | `TBD` | 5 | Draft |
| FR-ORD-002 | `TBD` | Must | `TBD` | 12 | Draft |

### 3.5 Reviews

| ID | Requirement | Priority | Source | Sprint | Status |
|---|---|---|---|---|---|
| FR-REV-001 | `TBD` | Should | `TBD` | 9 | Draft |

### 3.6 Seller and multi-vendor

| ID | Requirement | Priority | Source | Sprint | Status |
|---|---|---|---|---|---|
| FR-SELL-001 | `TBD` | Must | `TBD` | 10 | Draft |
| FR-SELL-002 | `TBD` | Must | `TBD` | 11 | Draft |
| FR-MV-001 | `TBD` | Must | `TBD` | 12 | Draft |

### 3.7 Administration and superadministration

| ID | Requirement | Priority | Source | Sprint | Status |
|---|---|---|---|---|---|
| FR-ADM-001 | `TBD` | Must | `TBD` | 6 | Draft |
| FR-SADM-001 | `TBD` | Must | `TBD` | 6 | Draft |

### 3.8 Messaging, promotions, and payment

| ID | Requirement | Priority | Source | Sprint | Status |
|---|---|---|---|---|---|
| FR-MSG-001 | `TBD` | Should | `TBD` | 14 | Draft |
| FR-PROMO-001 | `TBD` | Should | `TBD` | 15 | Draft |
| FR-PAY-001 | `TBD` | Must | `TBD` | 16 | Draft |

### 3.9 Requirement writing checklist

Each approved functional requirement should answer:

- Who performs the action?
- What precondition is required?
- What is the main flow?
- What are the alternate and error flows?
- What is the observable result?
- Which roles may perform it, and what ownership applies?
- Which sprint implements it?
- How is it verified?

## 4. Non-functional requirements

> **Writing guidance:** Make targets measurable. Replace placeholders with
> concrete thresholds only after the owner approves them.

### 4.1 Security

| ID | Requirement | Target | Status |
|---|---|---|---|
| NFR-SEC-001 | Passwords hashed with a modern adaptive algorithm | `TBD` | Draft |
| NFR-SEC-002 | JWTs only in HTTP-only cookies; never in browser storage | Required | Draft |
| NFR-SEC-003 | Refresh tokens hashed at rest and rotated on use | Required | Draft |
| NFR-SEC-004 | Backend enforces authorization and ownership | Required | Draft |
| NFR-SEC-005 | Secrets supplied via environment variables | Required | Draft |
| NFR-SEC-006 | Sensitive values never logged | Required | Draft |
| NFR-SEC-007 | TLS certificate verification enabled for Aiven | Required | Draft |

### 4.2 Performance and scalability

| ID | Requirement | Target | Status |
|---|---|---|---|
| NFR-PERF-001 | Public catalog page response time | `TBD` | Draft |
| NFR-PERF-002 | API p95 latency under expected load | `TBD` | Draft |
| NFR-PERF-003 | No N+1 queries in catalog/order paths | Required | Draft |
| NFR-PERF-004 | Pagination on all list endpoints | Required | Draft |

### 4.3 Reliability and data integrity

| ID | Requirement | Target | Status |
|---|---|---|---|
| NFR-REL-001 | Multi-step writes use transactions | Required | Draft |
| NFR-REL-002 | Order price and address snapshots preserved | Required | Draft |
| NFR-REL-003 | Migrations provide working up and down operations | Required | Draft |
| NFR-REL-004 | Monetary values use correct decimal precision | Required | Draft |

### 4.4 Usability and accessibility

| ID | Requirement | Target | Status |
|---|---|---|---|
| NFR-UX-001 | Responsive across mobile and desktop | `TBD` | Draft |
| NFR-UX-002 | Keyboard-accessible controls and visible focus | Required | Draft |
| NFR-UX-003 | Loading, empty, error, and success states | Required | Draft |

### 4.5 Maintainability and quality

| ID | Requirement | Target | Status |
|---|---|---|---|
| NFR-QA-001 | TypeScript strict mode where practical | Required | Draft |
| NFR-QA-002 | No unexplained `any` types | Required | Draft |
| NFR-QA-003 | Centralized error handling and consistent responses | Required | Draft |
| NFR-QA-004 | Tests cover authorization and ownership | Required | Draft |

### 4.6 Observability

| ID | Requirement | Target | Status |
|---|---|---|---|
| NFR-OBS-001 | HTTP request logging via Morgan | Required | Draft |
| NFR-OBS-002 | Application and error logs via Winston | Required | Draft |
| NFR-OBS-003 | Generated logs excluded from Git | Required | Draft |

## 5. External interfaces

> **Writing guidance:** Define API conventions, browser requirements, Google
> OAuth, Aiven MySQL, Stripe Sandbox, and any future delivery integrations.

| Interface | Purpose | Notes | Status |
|---|---|---|---|
| REST API | Frontend-backend communication | Versioned, consistent envelopes | Draft |
| Aiven MySQL | Persistent storage | TLS required | Draft |
| Google OAuth 2.0 | Federated login | Introduced Sprint 13 | Draft |
| Stripe Sandbox | Online payments | Preparation only until approved | Draft |
| SMTP / email | Verification and notifications | `TBD` | Draft |

## 6. Data requirements

- Entity and relationship details belong in [`ERD.md`](./ERD.md).
- Orders preserve price and address snapshots.
- Geography is data only: 7 provinces and 77 districts, no geographic roles.
- Each entity is introduced only when its feature requires it.
- Schema changes are migration-only.

## 7. Traceability

> **Writing guidance:** Maintain links from business objective → business
> requirement → functional requirement → use case → test. Add the matrix when
> requirements are approved.

| Objective | Business requirement | Functional requirement | Use case | Test |
|---|---|---|---|---|
| `TBD` | `TBD` | `TBD` | `TBD` | `TBD` |

## 8. Verification and acceptance

- Each functional requirement maps to at least one test.
- Authorization tests cover correct role, wrong role, unauthenticated access, and
  ownership boundaries.
- Multi-vendor isolation is tested when seller features arrive.
- Never report a test as passing unless it was executed.
- The sprint report records actual commands and results.

## 9. Open questions

| ID | Question | Owner | Needed by |
|---|---|---|---|
| Q-001 | `TBD` | `TBD` | `TBD` |

## 10. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Project owner | `TBD` | Pending | |

> **Completion checklist**
>
> - [ ] Scope and user classes confirmed.
> - [ ] Functional requirements written with IDs and acceptance criteria.
> - [ ] Non-functional targets set to measurable values.
> - [ ] External interfaces confirmed.
> - [ ] Traceability matrix completed.
> - [ ] Document approved by the owner.
