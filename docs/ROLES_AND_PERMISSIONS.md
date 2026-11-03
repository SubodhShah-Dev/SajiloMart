# SajiloMart — Roles and Permissions

> **Status:** Phase 0 initial policy. No permissions are implemented yet.
>
> This document evolves with each sprint. Add detailed rows only when the
> corresponding feature is implemented or formally planned. Do not treat future
> rows as implemented.

## 1. Purpose

Define the application roles, their responsibilities, the incremental permission
policy, ownership rules, and how permissions are documented over time.

## 2. Roles

| Role | Responsibility | Introduced |
|---|---|---|
| `CUSTOMER` | Regular ecommerce customer | Sprint 3 |
| `SELLER` | Manages their own store and products | Sprint 10 |
| `ADMIN` | Manages normal platform operations | Sprint 6 |
| `SUPERADMIN` | Controls privileged platform-level operations | Sprint 6 |

Unauthenticated visitors are **not** an application role. They receive public
access to permitted resources.

There are no province or district administrator roles. Geography is data for
delivery addresses only, and it never scopes administrative authority.

## 3. Incremental permission policy

1. Start with the minimum permissions each role needs for currently implemented
   functionality.
2. Introduce permissions in the same sprint as the feature they protect.
3. Never create the complete future permission matrix as if everything were
   implemented.
4. Keep every permission entry classified as:
   - **Implemented** — the feature and permission actually work and are tested.
   - **Planned** — scheduled for a future sprint.
   - **Not applicable** — the role must not receive that permission.
5. Update this document in the same sprint that changes permissions.
6. Enforce permissions on the backend. Frontend checks are only for UI
   visibility.

## 4. Current implementation status

**Implemented permissions: none.** Phase 0 contains documentation only.

The rows below are a planning outline. They must not be read as working
functionality.

### 4.1 Initial permission outline

| Feature | CUSTOMER | SELLER | ADMIN | SUPERADMIN | Status |
|---|---|---|---|---|---|
| Public catalog and reviews | View | View | View | View | Planned — Sprint 2/9 |
| Own account and profile | Own | Own | Own | Own | Planned — Sprint 3 |
| Cart | Own | Own | — | — | Planned — Sprint 4 |
| Delivery addresses | Own | Own | — | — | Planned — Sprint 5 |
| Checkout and own orders | Own | Own | — | — | Planned — Sprint 5 |
| Own order history | Own | Own | — | — | Planned — Sprint 5 |
| Admin dashboard | — | — | Access | Access | Planned — Sprint 6 |
| Product management | — | Own products | Manage all | Manage all | Planned — Sprint 6/11 |
| Category management | — | — | Manage | Manage | Planned — Sprint 6 |
| Order management | Own only | Own seller items | Manage all | Manage all | Planned — Sprint 6/12 |
| Admin account management | — | — | — | Manage | Planned — Sprint 6 |
| Admin suspension/restoration | — | — | — | Manage | Planned — Sprint 6 |
| Customer management | — | — | Manage | Manage | Planned — Sprint 7 |
| Wishlist | Own | Own | — | — | Planned — Sprint 8 |
| Review submission | Own | Own | — | — | Planned — Sprint 9 |
| Review moderation | — | — | Moderate | Moderate | Planned — Sprint 9 |
| Seller application | Apply | — | Review | Review | Planned — Sprint 10 |
| Seller store profile | — | Own | View/manage | View/manage | Planned — Sprint 10/11 |
| Seller inventory | — | Own | Manage all | Manage all | Planned — Sprint 11 |
| Multi-vendor order fulfillment | — | Own seller items | Manage all | Manage all | Planned — Sprint 12 |
| Buyer-seller messaging | Own threads | Own threads | — | — | Planned — Sprint 14 |
| Flash-sale management | — | — | Manage | Manage | Planned — Sprint 15 |
| Platform settings | — | — | — | Manage | Planned — future |
| Audit logs | — | — | — | View | Planned — future |
| Advanced platform reports | — | — | View | View | Planned — future |

`—` means **not applicable**. `Own` means the actor may act only on resources
they own.

## 5. Ownership rules

- Customers may access only their own profile, addresses, cart, wishlist, orders,
  reviews, and conversations.
- Sellers may access only their own store, products, inventory, seller order
  items, and conversations.
- A seller never sees another seller's private orders or data.
- Admins and superadmins may access platform-wide resources within their
  implemented permissions; they do not inherit a customer's private session.
- Ownership is verified from authenticated server-side identity, never from a
  request-supplied user ID or role.
- Query scoping is mandatory: list endpoints for customers and sellers must be
  filtered by the authenticated owner at the repository level.

## 6. CUSTOMER

Initial permissions:

- View public pages.
- Browse products and categories.
- View product details.
- Register and log in.
- Manage their own basic profile.

Introduced with later features:

- Cart management.
- Wishlist management.
- Delivery address management.
- Checkout.
- Order history.
- Reviews.
- Buyer-seller messaging.

Customers can only access their own private resources.

## 7. SELLER

Introduced with multi-vendor functionality.

Initial permissions:

- Submit a seller application.
- Access an approved seller account.
- Manage a basic store profile.
- Create, update, and view own products.

Introduced progressively:

- Inventory management.
- Own order listing.
- Order processing and fulfillment.
- Seller statistics.
- Customer messaging.
- Store management improvements.

A seller inherits appropriate customer shopping functionality.

A seller cannot:

- Manage another seller's products.
- View another seller's private orders.
- Approve themselves.
- Assign themselves privileged roles.
- Access ADMIN or SUPERADMIN functionality.

## 8. ADMIN

Initial permissions:

- Access the admin dashboard.
- View, create, and update products.
- Manage categories.
- View and manage basic orders.

Introduced with later features:

- Customer management.
- Seller application approval and seller management.
- Product moderation.
- Inventory administration.
- Review moderation.
- Flash-sale management.
- Global operational reports.
- Other platform management features.

ADMIN must not access SUPERADMIN-only operations.

## 9. SUPERADMIN

Initial permissions:

- Secure access to the superadmin dashboard.
- Create administrator accounts.
- Assign and revoke ADMIN roles.
- Suspend and restore administrator accounts.
- Perform normal ADMIN operations where permitted.

Introduced as needed:

- Critical platform settings.
- Audit logs.
- Global administrative configuration.
- Advanced platform reports.
- Other platform-level management.

Rules:

- SUPERADMIN always retains a higher privilege level than ADMIN.
- Only SUPERADMIN can manage ADMIN accounts through normal application
  functionality.
- SUPERADMIN accounts are provisioned through a secure setup process.
- Public SUPERADMIN registration is never allowed.

## 10. Public visitor access

Visitors may:

- View the homepage.
- Browse products and categories.
- Search, filter, and sort.
- View product details, prices, stock, and published reviews.

Visitors may not:

- Add to cart or wishlist.
- Submit reviews.
- Chat with sellers.
- Place orders.

Restrictions are introduced alongside the corresponding feature, with a
login/register prompt in the UI and backend rejection.

## 11. Account creation and role assignment

| Path | Result | Who may perform |
|---|---|---|
| Public registration | Creates `CUSTOMER` only | Anyone |
| Seller application | Creates a pending application | Authenticated customer |
| Seller approval | Grants `SELLER` to an approved applicant | ADMIN or SUPERADMIN, within permissions |
| Admin creation/assignment | Grants `ADMIN` | SUPERADMIN only |
| Superadmin provisioning | Creates `SUPERADMIN` | Secure setup process only |

No endpoint may accept a client-supplied role that escalates privileges.

## 12. Authorization implementation

Use straightforward role-based middleware and ownership checks. Introduce only
what the current sprint needs.

Expected helpers:

```ts
requireAuth
requireRole("ADMIN")
requireRole("SUPERADMIN")
requireRole("SELLER")
requireOwnership(...)
```

Requirements:

- Enforce authorization on the backend.
- Never trust roles supplied by the frontend.
- Verify resource ownership.
- Keep permission checks centralized.
- Do not create a dynamic permission-management system or permission tables
  without a genuine requirement.
- Add authorization tests as each permission is introduced.

## 13. Authorization test checklist

Whenever permissions change, verify:

- Correct role can perform the action.
- Wrong role is rejected.
- Unauthenticated requests are rejected where required.
- Customers cannot access other customers' resources.
- Sellers cannot access other sellers' resources.
- ADMIN cannot perform SUPERADMIN-only operations.
- SUPERADMIN can perform its implemented privileged operations.
- Multi-vendor data isolation and order separation are enforced.

## 14. Documentation process

For every sprint:

1. Add or update rows only for permissions introduced or changed.
2. Set status to `Implemented` only after the permission is implemented and
   verified by tests.
3. Keep future permissions marked `Planned` with their sprint.
4. Keep inapplicable combinations marked `—`.
5. Record the change in [`IMPLEMENTATION_LOG.md`](./IMPLEMENTATION_LOG.md).
6. Record meaningful authorization decisions in
   [`DECISIONS_LOG.md`](./DECISIONS_LOG.md).

## 15. Open permission decisions

- Whether seller approval requires ADMIN or SUPERADMIN in the first seller
  sprint.
- Whether suspended users can keep sessions active.
- Whether ADMIN can view customer private data and to what extent.
- Whether review moderation includes deletion or only visibility changes.
- Whether multi-vendor customer-seller messaging is allowed for all customers or
  only verified buyers.
- Which superadmin actions require additional confirmation or re-authentication.
