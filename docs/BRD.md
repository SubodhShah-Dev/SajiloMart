# SajiloMart — Business Requirements Document (BRD)

> **Status:** Template — to be completed by the project owner.
>
> This document provides structure and writing guidance only. Detailed business
> requirements will be written by the project owner. Do not treat placeholders as
> approved requirements.

## Document control

| Field | Value |
|---|---|
| Document | Business Requirements Document |
| Project | SajiloMart |
| Version | 0.1 (template) |
| Owner | `TBD — project owner` |
| Reviewers | `TBD` |
| Last updated | Phase 0 |
| Related documents | [`PROJECT_OVERVIEW.md`](./PROJECT_OVERVIEW.md), [`SRS.md`](./SRS.md), [`USE_CASES.md`](./USE_CASES.md) |

## 1. Executive summary

> **Writing guidance:** In 3–5 sentences, state what SajiloMart is, the market
> problem it solves, who benefits, and what success looks like in the first year.
> Avoid technical architecture here.

`TBD — project owner`

## 2. Business context

### 2.1 Market and opportunity

> **Writing guidance:** Describe ecommerce adoption in Nepal, buyer expectations,
> and the opportunity for a multi-vendor marketplace. Cite sources if used.

`TBD — project owner`

### 2.2 Problem statement

> **Writing guidance:** State the specific problems for customers, sellers, and
> administrators. Prefer measurable statements where possible.

`TBD — project owner`

### 2.3 Why now

> **Writing guidance:** Explain market timing, operational readiness, or
> competitive gaps.

`TBD — project owner`

## 3. Business objectives and success metrics

> **Writing guidance:** Objectives should be outcomes, not features. Metrics
> should be measurable and time-bound.

| ID | Objective | Success metric | Target | Timeframe |
|---|---|---|---|---|
| BO-001 | `TBD` | `TBD` | `TBD` | `TBD` |
| BO-002 | `TBD` | `TBD` | `TBD` | `TBD` |
| BO-003 | `TBD` | `TBD` | `TBD` | `TBD` |

## 4. Stakeholders

> **Writing guidance:** List everyone with an interest in the product, including
> external parties such as payment or delivery partners.

| Stakeholder | Type | Interest | Influence |
|---|---|---|---|
| Customers | External | `TBD` | `TBD` |
| Sellers | External | `TBD` | `TBD` |
| Platform administrators | Internal | `TBD` | `TBD` |
| Superadmin / owner | Internal | `TBD` | `TBD` |
| Payment provider | External | `TBD` | `TBD` |
| Delivery partners | External | `TBD` | `TBD` |

## 5. Business scope

### 5.1 In scope — initial product

> **Writing guidance:** Confirm or edit this starting scope. It reflects the
> incremental plan, not the final marketplace.

- Public product browsing with seeded catalog data.
- Customer registration, login, and session management.
- Cart, delivery addresses, Cash-on-Delivery checkout, and order history.
- Basic administration with minimal permissions.
- A schema ready for later multi-vendor expansion.

### 5.2 In scope — final product

- Full multi-vendor marketplace across Nepal.
- Seller onboarding, store management, products, inventory, and fulfillment.
- Customer-seller messaging.
- Reviews and ratings.
- Flash sales and promotions.
- Online payment (Stripe Sandbox planned; approval required before implementation).
- Administrative and superadministrative operations.

### 5.3 Out of scope

> **Writing guidance:** Record explicit exclusions so expectations stay clear.

`TBD — project owner`

Examples to consider: province-level administration, warehouse management,
logistics fleet ownership, native mobile apps, international shipping.

## 6. Business processes

> **Writing guidance:** Describe each process at business level: trigger, actors,
> steps, outcome. Detailed flows belong in [`USE_CASES.md`](./USE_CASES.md).

| ID | Process | Trigger | Primary actors | Outcome |
|---|---|---|---|---|
| BP-001 | Customer purchase | Customer decides to buy | Customer | Order placed for fulfillment |
| BP-002 | Seller onboarding | Seller applies | Seller, Admin | Approved seller store |
| BP-003 | Seller fulfillment | Paid/confirmed order | Seller | Items delivered and order updated |
| BP-004 | Catalog administration | Product or category change | Admin | Accurate public catalog |
| BP-005 | Customer support/messaging | Buyer or seller initiates contact | Customer, Seller | Resolved conversation |

`TBD — expand each process`

## 7. Business requirements

> **Writing guidance:** Write one requirement per row with a unique ID. Each must
> be testable and traceable to an objective. Add rows as requirements are
> approved. Do not mark anything as approved until the owner signs off.

| ID | Requirement | Rationale | Priority | Traces to | Status |
|---|---|---|---|---|---|
| BR-001 | `TBD` | `TBD` | Must / Should / Could | BO-00x | Draft |
| BR-002 | `TBD` | `TBD` | `TBD` | `TBD` | Draft |

Priority guidance:

- **Must** — required for the milestone to be acceptable.
- **Should** — important but deferrable within the milestone.
- **Could** — desirable and easy to drop.

## 8. Constraints

> **Writing guidance:** Record real constraints such as budget, timeline, team
> capacity, legal requirements, and provider limitations.

| ID | Constraint | Type | Impact |
|---|---|---|---|
| C-001 | `TBD` | Budget / Time / Legal / Technical / Operational | `TBD` |

## 9. Assumptions and dependencies

| ID | Assumption or dependency | Impact if false |
|---|---|---|
| A-001 | `TBD` | `TBD` |
| D-001 | `TBD` | `TBD` |

## 10. Risks

> **Writing guidance:** Include likelihood, impact, mitigation, and owner.

| ID | Risk | Likelihood | Impact | Mitigation | Owner |
|---|---|---|---|---|---|
| R-001 | `TBD` | Low / Medium / High | Low / Medium / High | `TBD` | `TBD` |

## 11. Glossary

| Term | Definition |
|---|---|
| Marketplace | A platform where multiple independent sellers offer products |
| Seller | A merchant who owns and fulfills products in their store |
| Superadmin | The highest-privilege platform role |
| Suborder / fulfillment group | The seller-specific part of a customer order |
| Snapshot | A stored copy of data (price, address) at order time |
| `TBD` | To be defined by the project owner |

## 12. Approval

| Role | Name | Decision | Date |
|---|---|---|---|
| Project owner | `TBD` | Pending | |

> **Completion checklist**
>
> - [ ] Executive summary written.
> - [ ] Objectives have measurable success metrics.
> - [ ] Stakeholders and processes confirmed.
> - [ ] Business requirements assigned IDs and priorities.
> - [ ] Constraints, assumptions, and risks recorded.
> - [ ] Scope reviewed against the incremental roadmap.
> - [ ] Document approved by the owner.
