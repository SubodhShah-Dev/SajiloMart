# SajiloMart — Use Cases

> **Status:** Template — to be completed by the project owner.
>
> This document defines actors and a reusable use-case template, plus a
> high-level catalog of expected use cases. Detailed flows will be written by the
> project owner. Catalog entries are placeholders, not approved requirements.

## Document control

| Field | Value |
|---|---|
| Document | Use Cases |
| Project | SajiloMart |
| Version | 0.1 (template) |
| Owner | `TBD — project owner` |
| Last updated | Phase 0 |
| Related documents | [`BRD.md`](./BRD.md), [`SRS.md`](./SRS.md), [`ROLES_AND_PERMISSIONS.md`](./ROLES_AND_PERMISSIONS.md) |

## 1. Actors

Unauthenticated visitors are actors in use cases but are **not** an application
role. Application roles are defined in
[`ROLES_AND_PERMISSIONS.md`](./ROLES_AND_PERMISSIONS.md).

| Actor | Role | Description | Introduced |
|---|---|---|---|
| Visitor | None (public) | Browses public catalog and reads reviews | Sprint 2 |
| Customer | `CUSTOMER` | Registered shopper | Sprint 3 |
| Seller | `SELLER` | Approved merchant managing their own store | Sprint 10 |
| Admin | `ADMIN` | Platform operator | Sprint 6 |
| Superadmin | `SUPERADMIN` | Privileged platform owner | Sprint 6 |
| Google | External system | Identity provider for OAuth login | Sprint 13 |
| Stripe | External system | Planned online payment provider | Sprint 16 (preparation) |

## 2. Use-case template

Copy this template for each use case. Keep it short and testable.

```markdown
### UC-XXX — Title

| Field | Value |
|---|---|
| Actor(s) | |
| Supporting actor(s) | |
| Goal | |
| Preconditions | |
| Trigger | |
| Priority | Must / Should / Could |
| Sprint | |
| Related requirements | FR-XXX, BR-XXX |
| Status | Draft / Approved / Implemented / Deferred |

**Main success scenario**

1. ...
2. ...
3. ...

**Alternate flows**

- A1. ...

**Error flows**

- E1. ...

**Postconditions**

- ...

**Authorization and ownership**

- Roles allowed:
- Ownership rule:
- Unauthenticated behavior:

**Acceptance criteria**

- [ ] ...

**Notes**

- ...
```

> **Writing guidance:** Describe observable behavior, not implementation. State
> who may perform the action and which resources they may touch. Every use case
> must map to at least one functional requirement and one test.

## 3. Use-case catalog

> **Writing guidance:** Confirm the list, merge or split entries, and assign
> priorities. Fill in details only when the corresponding sprint is planned.
> Do not treat this catalog as approved scope.

### 3.1 Public and discovery

| ID | Use case | Primary actor | Sprint | Status |
|---|---|---|---|---|
| UC-001 | Browse homepage | Visitor | 2 | Draft |
| UC-002 | Browse product catalog | Visitor | 2 | Draft |
| UC-003 | Search products | Visitor | 2 | Draft |
| UC-004 | Filter and sort products | Visitor | 2 | Draft |
| UC-005 | View product details | Visitor | 2 | Draft |
| UC-006 | Browse categories | Visitor | 2 | Draft |
| UC-007 | Read published reviews | Visitor | 9 | Draft |

### 3.2 Account and authentication

| ID | Use case | Primary actor | Sprint | Status |
|---|---|---|---|---|
| UC-010 | Register customer account | Visitor | 3 | Draft |
| UC-011 | Log in with email and password | Customer | 3 | Draft |
| UC-012 | Restore session | Customer | 3 | Draft |
| UC-013 | Log out | Customer | 3 | Draft |
| UC-014 | Manage own profile | Customer | 3 | Draft |
| UC-015 | Log in with Google | Visitor | 13 | Draft |

### 3.3 Shopping

| ID | Use case | Primary actor | Sprint | Status |
|---|---|---|---|---|
| UC-020 | Add product to cart | Customer | 4 | Draft |
| UC-021 | Update cart quantity | Customer | 4 | Draft |
| UC-022 | Remove item from cart | Customer | 4 | Draft |
| UC-023 | Add product to wishlist | Customer | 8 | Draft |
| UC-024 | Move wishlist item to cart | Customer | 8 | Draft |

### 3.4 Checkout and orders

| ID | Use case | Primary actor | Sprint | Status |
|---|---|---|---|---|
| UC-030 | Manage delivery addresses | Customer | 5 | Draft |
| UC-031 | Place Cash-on-Delivery order | Customer | 5 | Draft |
| UC-032 | View own order history | Customer | 5 | Draft |
| UC-033 | View own order details | Customer | 5 | Draft |
| UC-034 | Place multi-seller order | Customer | 12 | Draft |
| UC-035 | Track fulfillment per seller | Customer | 12 | Draft |

### 3.5 Reviews

| ID | Use case | Primary actor | Sprint | Status |
|---|---|---|---|---|
| UC-040 | Submit product review | Customer | 9 | Draft |
| UC-041 | Moderate reviews | Admin | 9 | Draft |

### 3.6 Seller

| ID | Use case | Primary actor | Sprint | Status |
|---|---|---|---|---|
| UC-050 | Apply to become a seller | Customer | 10 | Draft |
| UC-051 | Review seller application | Admin / Superadmin | 10 | Draft |
| UC-052 | Manage own store profile | Seller | 11 | Draft |
| UC-053 | Create own product | Seller | 11 | Draft |
| UC-054 | Update own product | Seller | 11 | Draft |
| UC-055 | Manage own inventory | Seller | 11 | Draft |
| UC-056 | View own seller orders | Seller | 12 | Draft |
| UC-057 | Fulfill own seller order items | Seller | 12 | Draft |
| UC-058 | View seller statistics | Seller | 17 | Draft |

### 3.7 Administration

| ID | Use case | Primary actor | Sprint | Status |
|---|---|---|---|---|
| UC-060 | Access admin dashboard | Admin | 6 | Draft |
| UC-061 | Create, update, and delete products | Admin | 6 | Draft |
| UC-062 | Manage categories | Admin | 6 | Draft |
| UC-063 | View and manage orders | Admin | 6 | Draft |
| UC-064 | Manage customers | Admin | 7 | Draft |
| UC-065 | Access superadmin dashboard | Superadmin | 6 | Draft |
| UC-066 | Create and manage admin accounts | Superadmin | 6 | Draft |
| UC-067 | Suspend or restore an admin | Superadmin | 6 | Draft |
| UC-068 | Manage flash sales | Admin / Superadmin | 15 | Draft |
| UC-069 | View operational reports | Admin / Superadmin | 17 | Draft |

### 3.8 Messaging

| ID | Use case | Primary actor | Sprint | Status |
|---|---|---|---|---|
| UC-070 | Start a buyer-seller conversation | Customer | 14 | Draft |
| UC-071 | Reply to a conversation | Customer / Seller | 14 | Draft |
| UC-072 | View conversation history | Customer / Seller | 14 | Draft |

### 3.9 Payment

| ID | Use case | Primary actor | Sprint | Status |
|---|---|---|---|---|
| UC-080 | Choose payment method at checkout | Customer | 16 | Draft |
| UC-081 | Complete Stripe Sandbox payment | Customer | Not scheduled | Deferred |
| UC-082 | Process verified payment webhook | System | Not scheduled | Deferred |

## 4. Cross-cutting authorization rules

These apply to every use case and must be reflected in backend tests:

- Unauthenticated visitors may only perform public use cases.
- Customers may access only their own carts, addresses, orders, wishlists, and
  reviews.
- Sellers may access only their own store, products, inventory, and seller order
  items.
- Admins may perform implemented administrative use cases but never
  superadmin-only operations.
- Superadmins may perform implemented administrative and privileged operations.
- Roles supplied by the frontend are never trusted.

## 5. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Project owner | `TBD` | Pending | |

> **Completion checklist**
>
> - [ ] Actors confirmed.
> - [ ] Catalog reviewed and priorities assigned.
> - [ ] Detailed flows written for the next sprint's use cases.
> - [ ] Authorization rules confirmed for each use case.
> - [ ] Use cases traced to functional requirements.
> - [ ] Document approved by the owner.
