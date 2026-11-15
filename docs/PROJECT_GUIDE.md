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
- **Self-serve seller onboarding** (no admin approval), product management, and order fulfillment.
- **Admin seller moderation** (verify, suspend, reject verification), product moderation, and review moderation.

Roles are `CUSTOMER`, `VENDOR`, and `ADMIN`. `SUPERADMIN` is deferred. Out of
scope for the MVP: payouts, returns/refunds, coupons, flash sales, email
verification, password reset, file uploads, product variants, WebSockets,
multi-currency, production deployment, and **identity documents for KYC**.

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
- `VENDOR` is self-serve: a CUSTOMER creates a store and immediately becomes VENDOR.
  Admin verifies identity, lifts listing limits, and suspends for policy violations.
  There is no admission queue or approval step for becoming a vendor.
- `ADMIN` is securely provisioned; there is no public admin registration.
- Backend authorization is authoritative. Frontend checks are for UI only.
- Verify ownership on every customer and seller resource.
- JWTs live in HTTP-only cookies, never in `localStorage` or `sessionStorage`.
  Refresh tokens are hashed and rotated.
- Never log passwords, tokens, cookies, or secrets. Never commit `.env` files.
- Geography is reference data for addresses only. No geographic admin roles.

### Google OAuth

Google sign-in uses Google's official `google-auth-library` on the backend.

- `GET /api/auth/google` generates the consent redirect with `OAuth2Client.generateAuthUrl()`
  and scopes `openid email profile` (`access_type=offline`, `prompt=consent`).
- `GET /api/auth/google/callback` exchanges the code with `getToken()`, then
  verifies the returned ID token with `verifyIdToken()` against `GOOGLE_CLIENT_ID`.
  Identity claims (`sub`, `email`, `email_verified`, name, picture) come only from
  the verified token; no separate UserInfo request is made.
- The OAuth state is still generated per request, stored in the HttpOnly
  `google_oauth_state` cookie, compared in constant time, and cleared before use.
- Accounts with a password are never auto-linked to Google; they must use password
  login. Google-only accounts are created as `CUSTOMER` with an empty password hash.
- The backend keeps `GOOGLE_CLIENT_SECRET`; Google tokens are never sent to the client.

### Production hosting

The production deployment serves the SPA and the API from one origin.

- The backend build includes `frontend/dist` in the deploy artifact. With `NODE_ENV=production`,
  Express serves those static files and rewrites non-`/api`, non-file `GET` requests to
  `index.html` so React Router owns client-side routes.
- Only `frontend/dist` is exposed (`dotfiles: "deny"`); `/api` paths are never rewritten, so
  unknown endpoints keep returning JSON 404s.
- Helmet's CSP extends `img-src` to `https:` because product images and Google avatars are
  external URLs.
- `trust proxy` is enabled in production so `req.ip`/`req.protocol` reflect the proxy's
  `X-Forwarded-*` headers.
- Production request logs omit query strings so OAuth codes and similar credentials are not
  written to logs.
- `VITE_API_BASE_URL` may be left unset for a same-origin build: the SPA then uses a relative
  base. When the frontend and API are served from different origins, that variable must be set
  and cookies need `SameSite=None` (which requires HTTPS).
- Entity relations are typed `Relation<T>` so the compiled ESM build does not evaluate entity
  classes in decorator metadata at import time (which breaks with circular entity imports).


### Seller trust tiers

- **UNVERIFIED** (default): listing limit = `SELLER_UNVERIFIED_LISTING_LIMIT` (default 5).
- **VERIFIED**: listing limit = `NULL` (unlimited).
- New store starts with `status = APPROVED`, `verification_status = UNVERIFIED`.
- Admin actions: verify (with optional listing limit), reject verification, suspend, unsuspend.
- Products from suspended stores are hidden from browse and product detail.

### Payments (Stripe Sandbox + Cash on Delivery)

Checkout creates an order in one transaction: it verifies address ownership,
locks inventory rows, snapshots prices and the shipping address, creates a
`PENDING` payment row, reserves stock, and soft-deletes the cart items. Nothing
is final until payment is confirmed.

- **Stripe Checkout (redirect mode).** The API creates a Checkout Session and
  returns its URL; the browser redirects to Stripe. Card data never touches the
  SajiloMart frontend, so PCI scope stays minimal.
- **Success.** `checkout.session.completed` (or `async_payment_succeeded`) marks
  the payment and order `COMPLETED`/`CONFIRMED`, converts the reservation into a
  sale (`total_stock -= qty`, `reserved_stock -= qty`), and stores the
  PaymentIntent id.
- **Failure or abandonment.** `checkout.session.expired` and
  `async_payment_failed` mark the payment `FAILED` and the order `CANCELLED`, and
  release only the reservation (`total_stock` is untouched). The same release
  runs when Stripe rejects session creation, because no expiry event would ever
  arrive for that order.
- **Idempotency.** Handlers ignore anything that is not still `PENDING`, so
  duplicate webhook deliveries are safe.
- **COD.** Completion is admin-only (`POST /api/payments/cod/:orderId/complete`);
  there is no provider proof, so an administrator records that cash was
  collected. It performs the same reservation-to-sale conversion.
- **Minimum charge.** Stripe refuses card sessions under roughly US$0.50, which
  is a realistic NPR order total. `POST /api/orders` rejects a `STRIPE` order
  below `STRIPE_MIN_ORDER_TOTAL_NPR` (default `100`) with a `400` before any row
  is written, so the cart, stock and order table stay untouched. The Stripe
  error handler keeps its release-and-cancel path as a backstop for anything
  Stripe rejects that we did not predict.

| Endpoint | Access | Purpose |
|---|---|---|
| `POST /api/orders` | customer | Create an order from the cart |
| `GET /api/orders` | customer | List the caller's orders |
| `GET /api/orders/:orderId` | owner | Order detail |
| `POST /api/payments/stripe/:orderId/session` | owner | Create the Checkout Session |
| `POST /api/payments/webhook` | Stripe signature | Payment state changes |
| `POST /api/payments/cod/:orderId/complete` | `ADMIN` | Record cash collected |
| `GET /api/addresses`, `POST /api/addresses` | customer | Checkout addresses |
| `GET /api/districts` | public | Address reference data |

Environment: `STRIPE_SECRET_KEY` and `STRIPE_WEBHOOK_SECRET` in `backend/.env`.
`STRIPE_PUBLISHABLE_KEY` is reserved for a future embedded checkout and is not
needed for redirect mode. `STRIPE_MIN_ORDER_TOTAL_NPR` (optional, default `100`)
sets the lowest card order total, kept above Stripe's US$0.50 floor.
Outside production the API refuses any key that does
not start with `sk_test_`. Local webhooks need the Stripe CLI forwarding to the
backend port from `backend/.env`:

```bash
stripe listen --forward-to localhost:4000/api/payments/webhook \
  --events checkout.session.completed,checkout.session.expired,checkout.session.async_payment_succeeded,checkout.session.async_payment_failed
```

Copy the printed `whsec_...` into `STRIPE_WEBHOOK_SECRET` and restart the API.
Test cards: `4242 4242 4242 4242` succeeds, `4000 0000 0000 9995` is declined.


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
