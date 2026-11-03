# SajiloMart — Project Overview

> **Status:** Phase 0 planning. No application code exists yet.

## 1. What SajiloMart is

SajiloMart is a nationwide, multi-vendor ecommerce marketplace for Nepal. It is
inspired by the core shopping experience of Daraz and Amazon and is designed to
serve customers across all 7 provinces and 77 districts.

At maturity, the platform connects three sides:

- **Customers** who discover products, shop, pay, and track orders.
- **Sellers** who operate independent stores and fulfill their own orders.
- **Administrators** who keep the marketplace safe and operational.

## 2. Why it exists

Customers in Nepal need a simple, trustworthy online shopping experience with
nationwide delivery coverage. Independent sellers need a shared marketplace where
they can list products without building their own storefront. Administrators need
control over catalog quality, seller onboarding, orders, and platform operations.

The business case, detailed requirements, use cases, and data model are owned by
the project owner and will be completed in the corresponding documents.

## 3. Goals

- Deliver a working public product-browsing ecommerce site early.
- Add authentication, cart, checkout, and order history incrementally.
- Introduce secure administrative roles without over-building permissions.
- Onboard independent sellers and give them ownership-scoped tooling.
- Support true multi-vendor carts, checkout, and fulfillment.
- Keep the application secure, maintainable, and deployable throughout.
- Keep every completed sprint independently reviewable and functional.

## 4. Initial scope (first working product)

The early application is deliberately simple:

- Public homepage, catalog, categories, search, filtering, sorting, and product
  detail pages backed by seeded data.
- Customer registration and login with secure cookie-based JWT sessions.
- Cart with backend-calculated totals and stock validation.
- Delivery addresses using Nepal province/district data.
- Cash-on-Delivery checkout, order creation, and order history.
- Basic administration with minimal permissions.
- A codebase and database schema that can evolve to multi-vendor without a
  rewrite.

## 5. Mandatory final scope (multi-vendor)

The final application must support multiple independent sellers:

- Seller applications, approval, profiles, and store information.
- Seller-owned products, inventory, and product management.
- Seller dashboards and statistics.
- Multi-seller carts and checkout.
- Parent customer orders with seller-specific suborders or fulfillment groups.
- Independent seller fulfillment and statuses.
- Customer-seller messaging.
- Admin and superadmin seller and order management.
- Strict seller ownership and data isolation.

This scope is mandatory. It is introduced progressively and is never dropped from
the roadmap.

## 6. Explicit non-goals for early sprints

- No province or district administrator roles.
- No dynamic permission-management system or permission tables without a real
  requirement.
- No online payment processing before the dedicated, approved payment sprint.
- No fabricated payment success or fake APIs.
- No WebSocket infrastructure for chat unless a real requirement appears.
- No premature abstractions, microservices, or shared packages.
- No full future permission matrix implemented upfront.
- No automatic schema synchronization.

## 7. Users and roles

| Role | Audience | First introduced |
|---|---|---|
| Visitor (not a role) | Public browsing | Public catalog |
| `CUSTOMER` | Shoppers | Authentication sprint |
| `ADMIN` | Platform operators | Administration sprint |
| `SUPERADMIN` | Privileged platform owner | Administration sprint |
| `SELLER` | Independent merchants | Seller onboarding sprint |

See [`ROLES_AND_PERMISSIONS.md`](./ROLES_AND_PERMISSIONS.md) for responsibilities
and the evolving permission matrix.

## 8. Delivery approach

Work proceeds through small sprints, each independently reviewable:

1. Inspect the repository and docs.
2. Plan the focused scope.
3. Implement end-to-end.
4. Test what was built.
5. Update documentation.
6. Commit on a sprint branch.
7. Review, report, and stop for approval.

The application must remain functional after every sprint. Development may pause
at any milestone.

See [`SPRINT_ROADMAP.md`](./SPRINT_ROADMAP.md) for the full sequence and
[`PROJECT_GUIDE.md`](./PROJECT_GUIDE.md) for the authoritative rules.

## 9. Success indicators

- A visitor can browse and understand the catalog without an account.
- A customer can register, shop, check out with Cash on Delivery, and review
  order history.
- An administrator can manage catalog and orders within their permissions.
- A seller can apply, get approved, manage their own products, and fulfill their
  own orders.
- A multi-seller order is visible in full to the customer, split correctly for
  each seller, and fully visible to administrators.
- Authorization and ownership are enforced by the backend and verified by tests.
- Every sprint leaves the application working and documented.

## 10. Open decisions

The following decisions are intentionally deferred and tracked in
[`DECISIONS_LOG.md`](./DECISIONS_LOG.md):

- Final parent-order and suborder naming and splitting rules.
- Seller application review workflow details.
- Password reset and email verification timing.
- Product image storage strategy.
- Search implementation (database vs. external engine).
- Shipping fee and delivery-zone rules.
- Exact CSRF strategy.
- Audit log scope and retention.
