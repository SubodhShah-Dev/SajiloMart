# SajiloMart

A multi-vendor ecommerce marketplace for Nepal, scoped to a one-week MVP.

> **Status:** Sprint 1 — basic project foundation implemented and in review. The
> React frontend and Express API run locally with a health check, logging, and
> tests. Project docs are tracked in `docs/`, except local-only guides under
> `docs/implementation/`; Step 1 (foundation and data) is next.

## MVP scope

SajiloMart connects customers, independent sellers, and platform administrators.
The MVP includes:

- Public catalog, search, categories, and product detail.
- Email/password and Google authentication.
- Authenticated cart, wishlist, reviews, and buyer–seller chat.
- Multi-vendor checkout with Cash on Delivery and Stripe Checkout Sandbox.
- Seller onboarding, product management, and order fulfillment.
- Admin seller approval, product moderation, and review moderation.

Roles are `CUSTOMER`, `VENDOR`, and `ADMIN`. `SUPERADMIN` is deferred. Out of
scope for the MVP: payouts, returns/refunds, coupons, flash sales, email
verification, password reset, file uploads, product variants, WebSockets,
multi-currency, and production deployment.

## Documentation

Project documentation is tracked under `docs/`. Reference-only implementation
guides in `docs/implementation/` are local-only and intentionally gitignored.
Start with [`docs/PROJECT_GUIDE.md`](docs/PROJECT_GUIDE.md).

The docs cover the project guide, MVP scope, BRD/SRS/use cases, ERD, roles and
permissions, the seven-step plan, implementation log, decisions, and
reference-only implementation guides. Supporting docs that have not been
restored yet may be absent; use the project guide as the fallback.

Agent and developer rules are in [`AGENTS.md`](AGENTS.md).

## Technology

- **Frontend:** React, TypeScript, Vite, Redux Toolkit, React Router DOM,
  Tailwind CSS, Lucide React, Recharts.
- **Backend:** Node.js, Express, TypeScript, TypeORM, MySQL, Winston, Morgan,
  Helmet, CORS.
- **Database:** MySQL on Aiven, managed exclusively through TypeORM migrations.
- **Deployment:** Vercel (frontend), provider-independent backend, Aiven (database).

## Getting started

Prerequisites: Node.js `>=22.12.0` and npm `>=11`.

```bash
npm install
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
npm run dev
```

- Frontend: <http://localhost:5173>
- API: <http://localhost:5000>
- Health check: <http://localhost:5000/api/health>

| Command | Purpose |
|---|---|
| `npm run dev` | Start the backend and frontend together |
| `npm run dev:backend` | Start only the API |
| `npm run dev:frontend` | Start only the web client |
| `npm run build` | Build both applications |
| `npm run typecheck` | Typecheck both applications |
| `npm run lint` | Lint both applications |
| `npm test` | Run backend integration tests |

Real `.env` files are never committed. Application logs are written to
`backend/logs/` and are ignored by Git.

## Development workflow

1. Inspect the repository and docs.
2. Plan the step scope.
3. Implement end-to-end.
4. Test what was built.
5. Update documentation.
6. Commit on the step branch.
7. Review, report, and stop for approval.

Never commit secrets or `.env` files. Never push or merge without explicit owner
approval.

## License

`TBD — project owner`
