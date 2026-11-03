# SajiloMart — Project Guide

> **Status:** Phase 0 — documentation and planning only. No application code exists yet.
>
> This document is the authoritative specification for SajiloMart. It captures the
> project scope, architecture, development rules, and sprint workflow. Other
> documents in `docs/` elaborate specific areas and must stay consistent with this
> guide.

---

## 1. Project identity

| Item | Value |
|---|---|
| Project name | SajiloMart |
| Type | Nationwide multi-vendor ecommerce marketplace |
| Country | Nepal |
| Coverage | 7 provinces, 77 districts |
| Architecture | Monorepo with separate frontend and backend applications |
| Initial objective | A simple, working ecommerce website |
| Final objective | A complete multi-vendor marketplace with customers, sellers, administrators, product management, order management, promotions, and related ecommerce functionality |

SajiloMart is inspired by the core shopping experience of Daraz and Amazon. The
final application **must** support multiple independent sellers. Multi-vendor
functionality is mandatory, not optional.

---

## 2. Development philosophy

Development happens in small, incremental, independently reviewable sprints:

**Start Simple → Implement → Test → Review → Document → Commit → Approve → Extend**

Rules:

- Start with the minimum functionality needed.
- Add features only when they become necessary.
- Keep permissions minimal at the beginning.
- Introduce additional permissions alongside their respective features.
- Do not implement future functionality prematurely.
- Avoid unnecessary abstractions and dependencies.
- Keep the application functional after each sprint.
- Maintain compatibility with the final multi-vendor requirements.
- Document important technical decisions.
- Preserve a clear Git development history.
- Do not begin another sprint without explicit approval.

Knowing what the final application must support does not mean implementing
everything during the initial sprints. The application must remain stoppable
after any milestone without requiring the remaining roadmap.

---

## 3. Technology stack

### 3.1 Frontend

- React
- TypeScript
- Vite
- Redux Toolkit
- React Router DOM
- Tailwind CSS
- Lucide React for icons
- Recharts for admin and seller dashboard charts

Feature-based architecture. Reference structure:

```text
frontend/
└── src/
    ├── app/
    │   ├── store/
    │   └── router/
    ├── components/
    ├── features/
    │   ├── auth/
    │   ├── products/
    │   ├── categories/
    │   ├── cart/
    │   ├── wishlist/
    │   ├── orders/
    │   ├── reviews/
    │   ├── seller/
    │   ├── admin/
    │   └── superadmin/
    ├── services/
    ├── hooks/
    ├── types/
    ├── utils/
    └── styles/
```

This is a reference, not a scaffold checklist. Introduce folders only when their
features are implemented.

Frontend requirements:

- Redux Toolkit for appropriate shared state; avoid unnecessary global state.
- Separate API communication from UI components.
- Reusable components and proper TypeScript types.
- Loading, error, empty, and success states.
- Responsive layouts and no unnecessary duplication.

### 3.2 Backend

- Node.js
- Express
- TypeScript
- TypeORM
- MySQL
- Winston
- Morgan
- Helmet
- CORS

Service-repository pattern:

| Layer | Responsibility |
|---|---|
| Routes | Define API endpoints |
| Controllers | Handle HTTP requests and responses |
| Services | Business logic |
| Repositories | Database operations |
| Entities | Database tables |
| Middlewares | Authentication, authorization, validation, error handling |

Business logic must not live in route files or controllers. Keep the architecture
simple and introduce modules as needed.

### 3.3 Database

- MySQL hosted on Aiven
- TypeORM for entities, relationships, queries, transactions, and migrations

### 3.4 Deployment

- Frontend: Vercel
- Database: Aiven MySQL
- Backend: provider-independent and deployment-ready

Never commit environment files or secrets.

---

## 4. Monorepo and application architecture

```text
SajiloMart/
├── AGENTS.md
├── README.md
├── docs/
├── frontend/        # introduced in Sprint 1
└── backend/         # introduced in Sprint 1
```

- One repository, two applications.
- Frontend and backend are independently startable and buildable.
- Shared knowledge lives in documentation, not in premature shared packages.
- Do not create a shared workspace package unless a real requirement appears.

---

## 5. Roles and incremental RBAC

Role-based access control is mandatory, but the complete permission system is
**not** implemented upfront.

Final roles:

| Role | Responsibility |
|---|---|
| `CUSTOMER` | Regular ecommerce customer |
| `SELLER` | Manages their own store and products |
| `ADMIN` | Manages normal platform operations |
| `SUPERADMIN` | Controls privileged platform-level operations |

Unauthenticated visitors are not an application role. They receive public access
to permitted resources.

### 5.1 Core permission rule

Start with the minimum permissions each role needs for currently implemented
functionality. Add permissions progressively as features arrive.

Every permission entry must be classified as:

- **Implemented** — the feature and permission actually work.
- **Planned** — scheduled for a future sprint.
- **Not applicable** — the role should not receive that permission.

Do not create the full future permission matrix as if everything were
implemented.

### 5.2 Role summaries

**CUSTOMER** — starts with public browsing, registration, login, and basic
profile. Later gains cart, wishlist, addresses, checkout, order history, reviews,
and buyer-seller messaging. Can only access their own private resources.

**ADMIN** — starts with dashboard access, product viewing/creation/update,
category management, and basic order management. Later gains customer
management, seller approval and management, moderation, inventory
administration, flash sales, and operational reports. Must not access
SUPERADMIN-only operations.

**SUPERADMIN** — introduced with the administrative functionality sprint.
Starts with secure dashboard access, administrator account creation, ADMIN role
assignment/revocation, administrator suspension/restoration, and permitted
normal ADMIN operations. Later gains critical platform settings, audit logs,
global configuration, and advanced reports. Always retains a higher privilege
level than ADMIN. Only SUPERADMIN can manage ADMIN accounts through normal
application functionality. Provisioned through a secure setup process; public
SUPERADMIN registration is never allowed.

**SELLER** — introduced when multi-vendor functionality begins. Starts with
seller application, approved seller account, basic store profile, and own-product
create/update/view. Later gains inventory, own order listing and processing,
statistics, messaging, and store improvements. Inherits appropriate CUSTOMER
shopping functionality. Cannot manage another seller's products or private
orders, approve themselves, assign themselves privileged roles, or access ADMIN
or SUPERADMIN functionality.

Detailed rules and the evolving matrix live in
[`ROLES_AND_PERMISSIONS.md`](./ROLES_AND_PERMISSIONS.md).

### 5.3 Authorization implementation

- Enforce authorization on the backend.
- Frontend permission checks are for UI visibility only.
- Never trust roles supplied by the frontend.
- Verify resource ownership.
- Prevent users from assigning themselves privileged roles.
- Keep permission checks centralized.
- Introduce only the middleware needed by the current sprint.
- Do not create a dynamic permission-management system or permission tables
  without a genuine requirement.

Expected helpers as needed:

```ts
requireAuth
requireRole("ADMIN")
requireRole("SUPERADMIN")
requireRole("SELLER")
requireOwnership(...)
```

Account creation rules:

- Public registration always creates `CUSTOMER` accounts.
- `SELLER` accounts go through an approval process.
- `ADMIN` accounts are created or assigned by `SUPERADMIN`.
- `SUPERADMIN` uses secure provisioning.

Add authorization tests as each permission is introduced.

---

## 6. Nepal geographical structure

```text
Province
   |
   └── District
          |
          └── Delivery Address
```

- Every district belongs to exactly one province.
- Seed all 7 provinces and all 77 districts.
- Verify the complete dataset.
- The database is the source of truth.
- Province and district selections are used in delivery address forms.

Geography is exclusively for delivery addresses and location-related
functionality. Do not create province or district administrative roles. Do not
restrict ADMIN or SUPERADMIN by geographical scope.

Geographical entities are introduced when delivery-address functionality is
implemented, not in the initial scaffold.

---

## 7. Authentication and security

### 7.1 Initial authentication

Introduce:

- Customer registration
- Email/password login
- Secure password hashing
- Input validation
- Duplicate account prevention
- JWT access tokens
- JWT refresh tokens
- HTTP-only cookies
- Logout
- Refresh-token rotation
- Session restoration
- Protected routes

Use short-lived access tokens and longer-lived refresh tokens. Store refresh
session information securely and hash refresh tokens before database storage.
Never store JWTs in `localStorage` or `sessionStorage`.

Configuration:

- HttpOnly cookies
- Secure cookies in production
- Appropriate `SameSite` settings
- Explicit CORS origins
- Credential support
- Frontend requests with credentials
- Appropriate CSRF protection

Never log tokens, passwords, or cookies.

### 7.2 Google OAuth

Google OAuth 2.0 is an additional authentication feature, introduced later.

Flow:

1. User clicks "Login with Google".
2. Backend initiates OAuth.
3. Google authenticates the user.
4. Backend validates identity and OAuth state.
5. Backend finds or creates the application user.
6. Backend issues application access and refresh tokens.
7. Backend sets HTTP-only cookies.
8. User is redirected to the frontend.

Google's access token must never be used as the application JWT. Support safe
account linking and prevent account takeover. JWT and OAuth must work together.

---

## 8. Ecommerce functionality

Implement each feature only in its assigned sprint.

### 8.1 Public product browsing

Visitors can view the homepage, browse products and categories, search, filter,
sort, view product details, price, stock availability, and published reviews.
Browsing does not require authentication.

### 8.2 Restricted interactions

Visitors cannot add to cart, add to wishlist, submit reviews, chat with sellers,
or place orders. Unauthenticated attempts show a suitable login/register prompt.
Implement each restriction alongside the corresponding feature sprint.

### 8.3 Product catalog

Product listing and detail, images, categories, descriptions, prices, stock
availability, search, filtering, sorting, pagination, and seller/store
information once sellers exist. Seed data is used initially. Do not build all
product-management screens before the admin sprint.

### 8.4 Cart

Introduced after authentication: add, remove, update quantities, subtotal,
backend total calculation, stock validation, persistence, and authentication
requirements.

### 8.5 Delivery addresses and checkout

Delivery addresses, Nepal geography selections, checkout, order creation, Cash on
Delivery, order items, price snapshots, address snapshots, order history, order
statuses, and stock updates. Start simple; extend the order model for
multi-vendor fulfillment through migrations.

### 8.6 Wishlist

Add/remove products, view wishlist, and move products to cart.

### 8.7 Reviews and ratings

Product rating, review description, customer/product associations, timestamps,
verified-purchase checks, and duplicate review prevention. Authentication is
required to submit; reading is public.

### 8.8 Multi-vendor marketplace (mandatory)

The final application must support multiple independent sellers:

- Seller applications and approval
- Seller profiles and store information
- Seller-owned products and inventory
- Seller dashboard
- Seller-specific orders and order processing
- Customer-seller communication
- Seller statistics
- Multi-seller carts and checkout
- Seller-specific fulfillment
- Admin seller management
- Seller ownership enforcement

Do not implement all of this in early sprints, but do not design the application
so that multi-vendor expansion requires a complete rewrite. Introduce ownership
relationships and schema changes at the appropriate stages.

### 8.9 Orders

Start with simple ecommerce orders. When seller functionality arrives, introduce
an appropriate multi-vendor model:

- The customer sees the complete order.
- Each seller sees only their relevant order items.
- Each seller manages their own fulfillment.
- ADMIN and SUPERADMIN see and manage all orders.
- Price snapshots are preserved.
- Inventory operations remain transactionally consistent.

Choose and document a parent-order plus seller-specific suborder/fulfillment
model. The detailed decision belongs to the multi-vendor sprint.

### 8.10 Buyer-seller chat

Introduced after sellers exist: conversations, messages, message history,
product association where relevant, and access control. Keep the initial
implementation simple; do not introduce WebSocket infrastructure unnecessarily.

### 8.11 Flash sales

Introduced later: title and description, start/end time, product associations,
percentage or fixed discounts, limited quantities, active/upcoming/expired
states, countdown timer, discount and stock validation, and administrative
management. ADMIN and SUPERADMIN manage flash sales.

### 8.12 Payment

Cash on Delivery is the initial payment method. Stripe Sandbox is the planned
online provider.

For the payment-preparation sprint, create appropriate payment structures and
explicit TODO placeholders. Do not implement fake payments. Do not mark orders as
paid without verified payment confirmation. Actual Stripe processing is not
implemented until explicitly approved.

Expected TODO shape:

```ts
// TODO: Initialize Stripe with sandbox credentials.
// TODO: Create a Stripe Checkout Session.
// TODO: Implement verified webhook handling.
// TODO: Update payment/order status transactionally.
// TODO: Handle payment failure and cancellation.
// TODO: Prevent duplicate webhook processing.
```

---

## 9. Database design rules

Introduce entities only when features require them. Planning list:

| Entity | Introduced when |
|---|---|
| User | Authentication |
| Category | Product catalog |
| Product | Product catalog |
| Store / SellerProfile | Seller ownership and onboarding |
| Province | Delivery addresses |
| District | Delivery addresses |
| Address | Checkout |
| Cart | Cart |
| CartItem | Cart |
| Order | Checkout |
| OrderItem | Checkout |
| SellerOrder or fulfillment entity | Multi-vendor order handling |
| RefreshSession | JWT authentication |
| WishlistItem | Wishlist |
| Review | Reviews |
| Conversation | Chat |
| Message | Chat |
| FlashSale | Promotions |
| FlashSaleItem | Promotions |
| Payment | Payment preparation |

This is a planning list, not a requirement to create every table initially.

Before introducing an entity, explain:

1. Why it is necessary.
2. Its relationships.
3. Its constraints.
4. Its indexes.
5. Its migration requirements.
6. Its effect on existing functionality.

Mandatory rules:

- **Never use `synchronize: true`.** Disable automatic schema synchronization in
  every environment.
- Every schema modification uses a TypeORM migration with working `up` and
  `down` operations.
- Use appropriate foreign keys, indexes, and unique constraints.
- Use transactions where multiple operations must succeed or fail together.
- Use correct decimal precision for monetary values.
- Avoid N+1 queries.
- Preserve historical order details using snapshots.
- Use timestamps and safe deletion strategies.
- Initial RBAC uses a simple role field and centralized policies; do not create
  permission tables unnecessarily.

---

## 10. UI/UX requirements

Build the UI alongside actual functionality.

Initial interface: homepage, header/navigation, search, categories, product
cards, product listing, product detail, and responsive layout.

Later interfaces: login/register, cart, checkout, customer profile, order
history, wishlist, reviews, seller store, seller dashboard, admin dashboard,
superadmin dashboard, and messaging.

Use responsive design, consistent spacing and typography, reusable components,
loading skeletons, empty states, error states, toast notifications, confirmation
dialogs, and accessible controls. Use Recharts when seller and administrative
statistics are introduced.

### Role-aware UI

Navigation, pages, dashboards, and buttons must reflect currently implemented
permissions. Do not build future dashboard features prematurely. Frontend
restrictions are for user experience; backend authorization is authoritative.
Never create fake or nonfunctional primary buttons.

---

## 11. Logging and backend quality

Use Winston and Morgan:

- Morgan for HTTP request logging.
- Winston for application and error logging.
- Logs stored under `backend/logs/`.
- Separate error and general logs where appropriate.
- Include timestamps and useful context.
- Never log passwords, JWTs, cookies, or credentials.
- Ignore generated logs in Git.

Also use centralized error handling, input validation, consistent API responses,
proper HTTP status codes, Helmet, explicit CORS origins, TypeScript strict mode
where practical, environment validation, and no unexplained `any` types.

---

## 12. Environment variables

`.env.example` files are created when scaffolding begins.

Backend:

```env
NODE_ENV=development
PORT=5000

FRONTEND_URL=
BACKEND_URL=

DB_HOST=
DB_PORT=
DB_USERNAME=
DB_PASSWORD=
DB_DATABASE=
DB_SSL=

GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=

JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
ACCESS_TOKEN_EXPIRES_IN=
REFRESH_TOKEN_EXPIRES_IN=

STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
```

Frontend:

```env
VITE_API_BASE_URL=
```

Rules:

- The project owner configures actual secrets.
- Never hardcode credentials or commit real `.env` files.
- Do not expose backend secrets in Vite variables.
- Configure Aiven TLS correctly; never disable certificate verification in
  production as a shortcut.
- Introduce environment variables only when the related feature is introduced.

---

## 13. Documentation

Documentation is flat and lives in `docs/`. See [`README.md`](./README.md) in this
folder for the index.

Documentation rules:

- Obsidian-friendly and GitHub-compatible Markdown.
- Relative links and Mermaid diagrams where useful.
- Update documentation after every sprint.
- Document what was implemented, why, how it works, how to test it, and known
  limitations.
- Keep implemented, planned, and not-applicable permissions distinct.
- The owner prepares the BRD, SRS, Use Cases, and ERD; the repository provides
  structured templates and guidance until then.
- Create extra technical documents only when needed (for example
  `DATABASE_DESIGN.md`, `AUTHENTICATION_FLOW.md`, `API_REFERENCE.md`,
  `DEPLOYMENT.md`).

---

## 14. Mandatory sprint workflow

Follow this workflow for every sprint.

### Step 1 — Inspect

Read `AGENTS.md`, this guide, and relevant docs. Inspect source, branch, and
`git status`. Understand completed sprints and dependencies. Never overwrite user
modifications.

### Step 2 — Plan

Report objective, included and excluded features, frontend/backend/database
tasks, API endpoints, affected roles, permission changes, dependencies, security
considerations, acceptance criteria, and tests.

### Step 3 — Implement

Implement end-to-end across the required layers: UI, state, API services,
routes, controllers, services, repositories, entities, migrations, validation,
authorization, error handling, and tests. No disconnected implementations, fake
APIs, or fake success responses.

### Step 4 — Test

Run relevant TypeScript checks, linting, frontend/backend builds, unit and
integration tests, migration tests, and browser verification where appropriate.

Whenever permissions change, verify: correct role succeeds, wrong role is
rejected, unauthenticated requests are rejected where required, customers cannot
access other customers' resources, sellers cannot access other sellers'
resources, ADMIN cannot perform SUPERADMIN-only operations, and SUPERADMIN can
perform implemented privileged operations. Test multi-vendor isolation and order
separation.

Never claim a test passed unless it was executed. Fix sprint-related problems
before declaring completion.

### Step 5 — Documentation

Update the implementation log, relevant technical documents, database design,
API reference, roles and permissions, and architecture decisions. Add only
permissions introduced or changed in the current sprint.

### Step 6 — Git workflow

- Use a separate branch per sprint.
- Make small, meaningful commits.
- Inspect before staging.
- Stage only relevant files.
- Never commit secrets, `.env`, or generated logs.
- Never force-push.
- Never push remotely without explicit permission.
- Preserve full history.
- After approval, merge the sprint branch into `main` with a normal merge.

### Step 7 — Review and stop

Report objective/summary, functionality, files changed, database changes and
migrations, API endpoints, roles and permissions, authorization tests, actual
test results, documentation updated, branch and commits, manual testing
instructions, known limitations and TODOs, and the recommended next sprint.

Then stop. Do not begin another sprint without explicit approval.

---

## 15. Sprint roadmap summary

Phase 0 is documentation only. The full sequence is maintained in
[`SPRINT_ROADMAP.md`](./SPRINT_ROADMAP.md). High-level milestones:

| Milestone | Sprints |
|---|---|
| Documentation and planning | 0 |
| Foundation and public catalog | 1–2 |
| Customer authentication and shopping | 3–5 |
| Administration and roles | 6–7 |
| Customer engagement | 8–9 |
| Seller onboarding and management | 10–11 |
| Mandatory multi-vendor orders | 12 |
| Extended authentication and messaging | 13–14 |
| Promotions and payment preparation | 15–16 |
| Dashboards, hardening, and deployment | 17–18 |

The roadmap may be split, adjusted, or shortened based on actual requirements.
Multi-vendor functionality must remain part of the final project.

---

## 16. Final development principles

1. Begin with the simplest useful version.
2. Add functionality only when necessary.
3. Start every role with minimal permissions.
4. Expand role permissions alongside each sprint's functionality.
5. Do not implement future permissions prematurely.
6. Distinguish implemented from planned permissions.
7. Build one independently reviewable sprint at a time.
8. Keep the application functional after each sprint.
9. Multi-vendor functionality is mandatory in the final application.
10. Preserve multi-vendor compatibility without building everything upfront.
11. Avoid premature abstractions and unnecessary complexity.
12. Implement features end-to-end.
13. Use TypeORM migrations for every schema change.
14. Maintain CUSTOMER, SELLER, ADMIN, and SUPERADMIN roles.
15. Keep ADMIN and SUPERADMIN permissions distinct.
16. Keep geographical information separate from authorization.
17. Preserve user modifications.
18. Maintain meaningful Git history.
19. Synchronize implementation and documentation.
20. Explain important architectural decisions.
21. Never claim unfinished functionality is complete.
22. Never start another sprint without explicit approval.
