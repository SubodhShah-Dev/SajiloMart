# SajiloMart

A nationwide, multi-vendor ecommerce marketplace for Nepal, built incrementally
from a simple product-browsing ecommerce site into a complete marketplace.

> **Status:** Sprint 1 — Basic project foundation implemented and in review. The
> React frontend and Express API run locally with a health check, logging, and
> tests. Catalog, authentication, and database work begin in later sprints.

## Vision

SajiloMart connects customers, independent sellers, and platform administrators
across all 7 provinces and 77 districts of Nepal. The final application supports
multiple sellers, seller-owned products and fulfillment, promotions, reviews,
messaging, and secure role-based administration.

The initial application stays intentionally simple: public catalog, customer
accounts, cart, Cash-on-Delivery checkout, and basic administration. Each sprint
adds one coherent, reviewable increment while keeping the application working.

## Documentation

Start with the [documentation index](docs/README.md) or jump to a specific
document:

| Document | Purpose |
|---|---|
| [Project Guide](docs/PROJECT_GUIDE.md) | Authoritative specification and development rules |
| [Project Overview](docs/PROJECT_OVERVIEW.md) | Initial scope, final scope, and direction |
| [BRD](docs/BRD.md) | Business requirements template (owner to complete) |
| [SRS](docs/SRS.md) | Software requirements template (owner to complete) |
| [Use Cases](docs/USE_CASES.md) | Actors and use-case template (owner to complete) |
| [ERD](docs/ERD.md) | Conceptual data model outline |
| [Roles and Permissions](docs/ROLES_AND_PERMISSIONS.md) | Roles and incremental permission policy |
| [Sprint Roadmap](docs/SPRINT_ROADMAP.md) | Sprint sequence and milestones |
| [Sprint Template](docs/SPRINT_TEMPLATE.md) | Reusable sprint plan and report |
| [Sprint 1 Report](docs/SPRINT_01_BASIC_FOUNDATION.md) | Foundation plan, verification, and completion report |
| [Implementation Log](docs/IMPLEMENTATION_LOG.md) | Completed work |
| [Decisions Log](docs/DECISIONS_LOG.md) | Architecture decisions and open questions |

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
2. Plan the sprint scope.
3. Implement end-to-end.
4. Test what was built.
5. Update documentation.
6. Commit on the sprint branch.
7. Review, report, and stop for approval.

Never commit secrets or `.env` files. Never push or merge without explicit owner
approval.

## License

`TBD — project owner`
