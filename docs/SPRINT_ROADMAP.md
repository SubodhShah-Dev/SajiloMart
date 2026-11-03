# SajiloMart — Sprint Roadmap

> **Status:** Planning baseline. Sprints may be split, adjusted, or shortened
> based on actual requirements.
>
> Multi-vendor functionality is mandatory and must remain in the final project.
> No sprint begins without explicit approval.

## How to use this roadmap

- Each sprint delivers an end-to-end, independently reviewable increment.
- The application must remain functional after every sprint.
- Development may stop after any milestone without completing the rest.
- Permissions are added only with the feature they protect.
- All schema changes use TypeORM migrations; `synchronize` stays disabled.
- Use [`SPRINT_TEMPLATE.md`](./SPRINT_TEMPLATE.md) for every sprint plan and
  report.

## Milestones

| Milestone | Sprints | Outcome |
|---|---|---|
| Documentation and planning | 0 | Scope, roles, roadmap, templates |
| Foundation and public catalog | 1–2 | Runnable monorepo and browsable catalog |
| Customer authentication and shopping | 3–5 | Accounts, cart, addresses, COD orders |
| Administration and roles | 6–7 | ADMIN/SUPERADMIN and daily operations |
| Customer engagement | 8–9 | Wishlist, reviews, moderation |
| Seller onboarding and management | 10–11 | Seller application, approval, own products |
| Mandatory multi-vendor orders | 12 | Parent orders plus seller fulfillment |
| Extended authentication and messaging | 13–14 | Google OAuth and buyer-seller chat |
| Promotions and payment preparation | 15–16 | Flash sales and Stripe-ready structures |
| Dashboards, hardening, deployment | 17–18 | Reports, security review, deployment prep |

## Sprint sequence

### Phase 0 — Documentation and planning

**Objective:** Establish scope, roles, roadmap, and documentation structure.

- Project overview, guide, BRD/SRS/use-case/ERD templates.
- Initial role definitions and incremental permission policy.
- Mandatory multi-vendor requirements documented.
- Sprint roadmap and reusable sprint template.
- No application code, dependencies, entities, or migrations.

**Exit criteria:** Documentation reviewed and approved by the owner.

---

### Sprint 1 — Basic project foundation

**Objective:** Runnable frontend and backend monorepo with safe defaults.

- Monorepo structure.
- React + TypeScript + Vite.
- Node + Express + TypeScript.
- Development scripts.
- Frontend and backend startup.
- `.env.example` placeholders.
- Git configuration and `.gitignore`.
- Helmet, CORS, Morgan, and Winston baseline.
- Health endpoint and basic error handling.

**Excluded:** Any ecommerce feature, authentication, database entities.

**Exit criteria:** Both applications start; health check works; no secrets
committed.

---

### Sprint 2 — Database and public product catalog

**Objective:** A working public product-browsing website backed by MySQL.

- Aiven MySQL connection and TypeORM setup.
- Migration infrastructure with `synchronize: false`.
- `Category` and `Product` entities with a minimal, extensible ownership design.
- Initial migrations.
- Sample categories and products via seed data.
- Homepage, product listing, product detail.
- Search, filtering, sorting, pagination.
- Loading, empty, and error states.

**Excluded:** Seller registration, product management UI, authentication.

**Exit criteria:** Visitors can browse and find seeded products.

---

### Sprint 3 — Basic customer authentication

**Objective:** Secure customer accounts with cookie-based JWT sessions.

- Registration and email/password login.
- Password hashing and validation.
- Access and refresh JWTs in HTTP-only cookies.
- Refresh-token rotation and hashed session storage.
- Logout and session restoration.
- Protected routes and auth Redux state.
- Public registration creates `CUSTOMER` only.

**Excluded:** Google OAuth, password reset unless explicitly approved.

**Exit criteria:** Register, log in, refresh, restore, and log out work; tokens are
never exposed to browser storage or logs.

---

### Sprint 4 — Cart

**Objective:** Authenticated customers can manage a persistent cart.

- `Cart` and `CartItem` entities and migrations.
- Cart APIs and Redux state.
- Add, remove, and update quantity.
- Backend-calculated totals.
- Stock validation.
- Authentication and ownership enforcement.

**Exit criteria:** Customers modify only their own cart; totals are server-side;
visitors are prompted to log in.

---

### Sprint 5 — Delivery addresses and basic orders

**Objective:** Customers can check out with Cash on Delivery.

- `Province` and `District` seed data (7 and 77, verified).
- `Address`, `Order`, and `OrderItem` entities.
- Province/district selection.
- Checkout UI and COD order creation.
- Price and address snapshots.
- Order status and order history.
- Stock validation and transactional order creation.
- Schema kept evolvable for multi-vendor splitting.

**Excluded:** Seller-specific fulfillment, online payment.

**Exit criteria:** A customer can place and view a COD order; history is
preserved.

---

### Sprint 6 — Basic ADMIN and SUPERADMIN

**Objective:** Minimal, secure administration with distinct privilege levels.

- Role constants and authorization middleware.
- Secure superadmin provisioning.
- Superadmin creation and management of ADMIN accounts.
- Admin and superadmin dashboards.
- Basic product and category management.
- Basic order viewing and management.
- Protected admin routes and role-aware UI.
- ADMIN versus SUPERADMIN tests.

**Excluded:** Advanced settings, audit dashboards, comprehensive reports.

**Exit criteria:** ADMIN cannot perform SUPERADMIN-only operations; SUPERADMIN can
manage admins and perform implemented admin operations.

---

### Sprint 7 — Basic ADMIN product and order improvements

**Objective:** Make daily administration practical.

- Improved product management.
- Basic inventory controls.
- Basic customer management.
- Order status management.
- Basic operational reporting.
- Permissions added with each feature.

**Exit criteria:** Admins can complete routine catalog and order tasks within
their permissions.

---

### Sprint 8 — Wishlist

**Objective:** Customers can save products for later.

- Wishlist storage and APIs.
- Wishlist page.
- Add/remove operations.
- Move wishlist items to cart.
- Authentication and ownership checks.

**Exit criteria:** Wishlists are private and persist across sessions.

---

### Sprint 9 — Reviews and ratings

**Objective:** Customers can review purchased products; visitors can read them.

- Review and rating entities.
- Public review listing.
- Authenticated submission.
- Verified-purchase checks.
- Duplicate-review prevention.
- Basic admin moderation.

**Exit criteria:** One review per customer per product; unauthorized submissions
rejected; moderation works.

---

### Sprint 10 — Seller onboarding

**Objective:** Introduce the SELLER role safely.

- Seller application flow.
- Seller profile and store information.
- Admin/superadmin approval.
- Role assignment protection.
- Seller authorization baseline.

**Excluded:** Full seller product CRUD and order fulfillment.

**Exit criteria:** Only approved applicants receive the `SELLER` role; sellers
cannot self-approve or escalate.

---

### Sprint 11 — Basic seller dashboard and product management

**Objective:** Sellers can manage their own store and products.

- Seller dashboard.
- Own store profile.
- Own product CRUD and listing.
- Basic stock management.
- Ownership validation on every seller operation.

**Exit criteria:** Sellers can only view and modify their own products.

---

### Sprint 12 — Mandatory multi-vendor orders

**Objective:** Fully functional multi-seller ordering and fulfillment.

- Multiple sellers in one cart and checkout.
- Parent customer order plus seller suborders/fulfillment groups.
- Seller-specific order management and statuses.
- Customer order overview.
- Transactional inventory consistency.
- Global ADMIN/SUPERADMIN order management.
- Data isolation tests.

**Note:** Mandatory marketplace milestone. Migrations must preserve existing
order data.

**Exit criteria:** A mixed-seller order is visible in full to the customer, split
correctly for sellers, and fully manageable by administrators.

---

### Sprint 13 — Google OAuth

**Objective:** Add Google login without replacing application JWTs.

- Google OAuth 2.0 authorization code flow.
- State validation.
- Safe account linking.
- Application access and refresh token issuance.
- HTTP-only cookie integration.
- Session restoration.

**Exit criteria:** Google login produces the same secure session model as
password login; unsafe linking is prevented.

---

### Sprint 14 — Seller and buyer messaging

**Objective:** Simple, access-controlled buyer-seller conversations.

- Conversations and messages.
- Message history.
- Optional product association.
- Access control.
- No unnecessary WebSocket infrastructure.

**Exit criteria:** Only participants can read or send messages.

---

### Sprint 15 — Flash sales and promotions

**Objective:** Time-limited promotional pricing with safe validation.

- Flash-sale creation and scheduling.
- Product associations.
- Percentage or fixed discounts.
- Limited quantities.
- Active/upcoming/expired states.
- Countdown UI.
- Purchase and stock validation.
- Admin management.

**Exit criteria:** Invalid or expired promotions cannot be applied; stock limits
are enforced.

---

### Sprint 16 — Stripe Sandbox preparation

**Objective:** Prepare payment structures without fake payments.

- Payment module structure.
- Payment database preparation.
- Stripe environment placeholders.
- Payment service interface.
- Explicit TODOs for integration.
- COD continues to work.

**Excluded:** Actual Stripe processing until explicit approval.

**Exit criteria:** No order is marked paid without verified confirmation; TODOs
clearly identify remaining integration work.

---

### Sprint 17 — Advanced dashboards and reports

**Objective:** Actionable dashboards for each role.

- Customer account experience.
- Seller dashboard improvements.
- Admin dashboard improvements.
- Superadmin dashboard improvements.
- Recharts visualizations.
- Permissions added only as features require.

**Exit criteria:** Each role sees only its permitted metrics and actions.

---

### Sprint 18 — Final testing, security, and deployment

**Objective:** Production readiness.

- Integration and end-to-end tests.
- Authorization and multi-vendor isolation tests.
- Security and permission-matrix review.
- Responsive UI review.
- Performance improvements.
- Vercel frontend preparation.
- Backend deployment preparation.
- Aiven production configuration.
- Environment and deployment documentation.

**Exit criteria:** Checks pass, deployment steps are documented, and no secrets are
committed.

---

## Cross-sprint rules

- Every sprint follows the workflow in
  [`PROJECT_GUIDE.md`](./PROJECT_GUIDE.md) and
  [`SPRINT_TEMPLATE.md`](./SPRINT_TEMPLATE.md).
- Every sprint uses its own branch and small commits.
- Every sprint updates the implementation log, roles document, and decisions log
  where relevant.
- Every sprint ends with a report and an explicit stop.
- Never push, merge, deploy, or start the next sprint without permission.
