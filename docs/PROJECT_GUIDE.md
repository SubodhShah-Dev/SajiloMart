# SajiloMart — Project Guide

> **Status:** Sprint 1 foundation is complete. The project is moving through the
> seven focused MVP steps.
>
> This is the current authoritative guide for agents and developers. Tracked
> documentation lives in `docs/`; `docs/implementation/` is local-only and
> intentionally gitignored. If a supporting local doc is missing, use this guide
> and [`README.md`](../README.md) and continue.

## 1. Product

SajiloMart is a nationwide multi-vendor ecommerce marketplace for Nepal, scoped
to a one-week MVP. The final application must support independent sellers; do
not build future functionality before its MVP step.

The MVP includes:

- Public catalog, search, categories, and product detail.
- Email/password and Google authentication.
- Authenticated cart, wishlist, reviews, and buyer–seller chat.
- Multi-vendor checkout with Cash on Delivery and Stripe Checkout Sandbox.
- Seller onboarding, product management, and order fulfillment.
- Admin seller approval, product moderation, and review moderation.

Roles are `CUSTOMER`, `SELLER`, and `ADMIN`. `SUPERADMIN` is deferred. Out of
scope for the MVP: payouts, returns/refunds, coupons, flash sales, email
verification, password reset, file uploads, product variants, WebSockets,
multi-currency, and production deployment.

## 2. Repository layout

```text
.
├── backend/     Express + TypeScript API
├── frontend/    React + TypeScript client
├── docs/        Tracked project documentation
│   └── implementation/  Local-only reference guides (gitignored)
├── plans/       Local-only working plans (gitignored)
├── AGENTS.md    Permanent agent and developer rules
└── package.json npm workspace root
```

## 3. Technology

- **Frontend:** React, TypeScript, Vite, Redux Toolkit, React Router DOM,
  Tailwind CSS, Lucide React, Recharts.
- **Backend:** Node.js, Express, TypeScript, TypeORM, MySQL, Winston, Morgan,
  Helmet, CORS.
- **Database:** MySQL on Aiven, managed exclusively through TypeORM migrations.
- **Deployment:** Vercel (frontend), provider-independent backend, Aiven
  (database).

## 4. Architecture rules

- Backend layering: routes → controllers → services → repositories; entities and
  middleware. No business logic in routes or controllers.
- Frontend is feature-based. Introduce folders only when their feature exists.
- Keep API communication separate from UI components.
- Use TypeScript with proper types; avoid unexplained `any`.
- Do not create fake APIs or fake success responses.
- Keep the application functional after every change.

## 5. Database rules

- MySQL on Aiven through TypeORM.
- **Never use `synchronize: true`.** Disable automatic schema synchronization in
  every environment.
- Every schema change uses a TypeORM migration with working `up` and `down`.
- Use foreign keys, indexes, unique constraints, correct decimal precision for
  money, transactions for multi-step writes, and snapshots for order history.
- Do not create permission tables without a genuine requirement.

## 6. Roles and security

- Public registration creates `CUSTOMER` only.
- `SELLER` requires admin approval; `ADMIN` is securely provisioned.
- There is no public admin registration.
- Backend authorization is authoritative. Frontend checks are for UI only.
- Verify ownership on every customer and seller resource.
- JWTs live in HTTP-only cookies, never in `localStorage` or `sessionStorage`.
  Refresh tokens are hashed and rotated.
- Never log passwords, tokens, cookies, or secrets. Never commit `.env` files.
- Geography is reference data for addresses only. No geographic admin roles.

## 7. Step workflow

1. **Inspect** — read docs, source, branch, and `git status`.
2. **Plan** — report objective, scope, tasks, APIs, roles, permissions,
   dependencies, security, acceptance criteria, and tests.
3. **Implement** — end-to-end across the required layers.
4. **Test** — run the narrowest relevant checks, then broader checks. Verify
   authorization and ownership whenever permissions change.
5. **Document** — update the relevant docs as applicable.
6. **Git** — work on a step branch, make small meaningful commits, stage only
   relevant files, never force-push or push without permission.
7. **Review and stop** — provide the completion report and wait for approval.

Use `docs/SPRINT_TEMPLATE.md` for every step when it is present. The seven-step
sequence is defined here and in `docs/SPRINT_ROADMAP.md` when available. If a
local-only supporting doc is missing, use this guide and continue.

## 8. Commands

Inspect the root and application `package.json` files before running commands.
Never invent scripts or dependencies.

- `npm install` — install workspace dependencies.
- `npm run dev` — run backend and frontend together.
- `npm run dev:backend` — run the API only.
- `npm run dev:frontend` — run the web client only.
- `npm run build` — build both applications.
- `npm run typecheck` — typecheck both applications.
- `npm run lint` — lint both applications.
- `npm test` — run backend tests.
- `npm run start:backend` — start the built backend.

Backend and frontend also expose their own workspace scripts.

## 9. Documentation and Git

- The current tracked docs are `docs/PROJECT_GUIDE.md` and any other files under
  `docs/` except `docs/implementation/`.
- `docs/implementation/` and `plans/` are local-only and must never be committed
  or force-added.
- Never commit secrets, `.env` files, generated logs, or build artifacts.
- Branch per step: `step/NN-short-name` (existing work may use
  `sprint/NN-short-name`).
- Commit messages use `feat:`, `fix:`, `chore:`, `test:`, `docs:`, or
  `refactor:`.
- Never merge, push, deploy, or tag without explicit owner approval.
