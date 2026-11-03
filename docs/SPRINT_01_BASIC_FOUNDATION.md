# SajiloMart — Sprint 1 — Basic Project Foundation

## Sprint metadata

| Field | Value |
|---|---|
| Sprint | `1 — Basic Project Foundation` |
| Branch | `sprint/01-basic-project-foundation` |
| Objective | Runnable frontend and backend monorepo with safe defaults |
| Status | In review — waiting for owner approval |
| Started | 2026-11-03 |
| Completed | 2026-11-03 (implementation complete) |
| Related docs | [`PROJECT_GUIDE.md`](./PROJECT_GUIDE.md), [`SPRINT_ROADMAP.md`](./SPRINT_ROADMAP.md), [`ROLES_AND_PERMISSIONS.md`](./ROLES_AND_PERMISSIONS.md) |

## 1. Inspect

- [x] Read `AGENTS.md`.
- [x] Read `docs/PROJECT_GUIDE.md` and Sprint 1 roadmap scope.
- [x] Read roles, decisions, implementation, and sprint-template docs.
- [x] Inspected the repository and confirmed Phase 0 contained documentation only.
- [x] Confirmed the starting branch was `main` with a clean working tree.
- [x] Confirmed no existing application code or user changes would be overwritten.
- [x] Confirmed no `plans/` folder existed and no prior sprint implementation existed.

**Findings:**

- Phase 0 ended on `main` at commit `7bf8803` with only documentation.
- No `.gitignore`, `frontend/`, `backend/`, dependencies, or scripts existed.
- Local runtime: Node.js `26.10.0`, npm `11.19.1`.
- Sprint 1 scope excludes authentication, database entities, and ecommerce features.

## 2. Plan

### Scope

**Included:**

- npm workspace monorepo with `frontend/` and `backend/`.
- React, TypeScript, Vite, and Tailwind CSS frontend scaffolding.
- Node.js, Express, and TypeScript backend scaffolding.
- Development, build, typecheck, lint, and test scripts.
- `.env.example` files and `.gitignore`.
- Helmet, explicit CORS, Morgan request logging, and Winston application logging.
- Health endpoint and centralized 404/error handling.
- Minimal foundation page that verifies API connectivity.
- Backend integration tests and ESLint configuration.
- Sprint documentation.

**Excluded:**

- Authentication, JWTs, cookies, roles, and permissions.
- TypeORM, MySQL/Aiven, entities, migrations, and seeds.
- Product catalog, cart, orders, payments, OAuth, dashboards, Recharts, Redux
  Toolkit, and React Router.
- API versioning, Docker, CI/CD, deployment, and Sprint 2 work.

### Work breakdown

| Area | Tasks |
|---|---|
| Frontend | Vite + React + TypeScript + Tailwind, foundation page, API health service |
| Redux/state | Deferred; no shared state exists in Sprint 1 |
| API services | `frontend/src/services/api.ts` health client |
| Backend routes/controllers | `/api/health` route and controller |
| Services/repositories | No business services or repositories needed yet |
| Database/entities/migrations | None in Sprint 1 |
| Validation | Startup environment validation, basic request body limits |
| Authorization | None introduced |
| Error handling | 404 middleware, centralized error handler, AppError, malformed JSON handling |
| Tests | Backend Vitest + Supertest tests for health, 404, errors, malformed JSON |

### API endpoints

| Method | Path | Auth | Roles | Purpose |
|---|---|---|---|---|
| GET | `/api/health` | None | None | Report API liveness and metadata |

Response convention:

- Success: `{ "success": true, "data": { ... } }`
- Error: `{ "success": false, "error": { "message": "...", "detail"?: "..." } }`
- Unexpected error details are only included in non-production environments.

### Database changes

| Change | Reason | Migration | Up/down | Data impact |
|---|---|---|---|---|
| None | Sprint 1 intentionally excludes the database | — | — | None |

### Roles and permissions

| Role | Permission introduced/changed | Status |
|---|---|---|
| All roles | None | Not introduced in Sprint 1 |

### Dependencies

- Backend runtime: `express`, `cors`, `helmet`, `morgan`, `winston`, `dotenv`.
- Frontend runtime: `react`, `react-dom`.
- Build/dev tooling: Vite, Tailwind CSS, TypeScript, ESLint,
  typescript-eslint, tsx, Vitest, Supertest, concurrently, matching types.
- TypeScript is pinned to `6.0.3` because current `typescript-eslint` supports
  `<6.1.0`.
- Node.js engines are set to `>=22.12.0` to satisfy Vite and Vitest.

### Security considerations

- `.env` files are ignored; only placeholder `.env.example` files are committed.
- Helmet is enabled and `x-powered-by` is disabled.
- CORS uses an explicit `FRONTEND_URL` origin with credentials enabled.
- JSON and URL-encoded bodies are limited to `1mb`.
- Environment variables are validated at startup; production requires
  `FRONTEND_URL` and defaults are not silently used.
- Morgan logs request metadata through Winston; request bodies, cookies, tokens,
  and secrets are not logged.
- The API does not connect to a database in Sprint 1.

### Acceptance criteria

- [x] Root `npm install` succeeds and workspaces resolve.
- [x] Both applications start with the development scripts.
- [x] `GET /api/health` returns a `200` JSON response.
- [x] Unknown routes return a structured JSON `404`.
- [x] Malformed JSON returns a structured JSON `400`.
- [x] Helmet, CORS, Morgan, and Winston are active.
- [x] Frontend displays loading, connected, and error states.
- [x] Typecheck, lint, builds, and backend tests pass.
- [x] Browser verification passes at desktop and mobile sizes.
- [x] No secrets, `.env`, logs, or build output are committed.
- [x] Documentation is updated and Sprint 2 has not started.

### Test plan

- [x] TypeScript check
- [x] Lint
- [x] Frontend build
- [x] Backend build
- [x] Unit/integration tests
- [x] Migration up/down — not applicable (no database)
- [x] Browser verification
- [x] Authorization matrix — not applicable (no permissions)
- [x] Ownership/isolation checks — not applicable (no owned resources)

## 3. Implementation notes

- Root npm workspaces provide one lockfile and shared install while keeping both
  applications independently buildable.
- The frontend was kept intentionally minimal: React, Vite, TypeScript, and
  Tailwind only. Redux Toolkit, React Router, Lucide, and Recharts are deferred
  until features require them.
- The foundation page calls the real health endpoint and renders loading,
  connected, and error states. This verifies the frontend/API integration without
  faking catalog or account functionality.
- The backend uses `createApp()` so the Express app can be integration-tested
  without opening a port.
- `.env` is loaded from `backend/.env` by module location rather than the current
  working directory. Logs are written under `backend/logs/` regardless of the
  process working directory.
- TypeScript is pinned because the current `typescript-eslint` release does not
  support TypeScript `>=6.1.0`.
- No database, entity, migration, authentication, or permission code was added.

## 4. Verification results

| Check | Command | Result | Notes |
|---|---|---|---|
| TypeScript | `npm run typecheck` | Passed | Backend and frontend |
| Lint | `npm run lint` | Passed | Backend and frontend |
| Frontend build | `npm run build` | Passed | Vite output built |
| Backend build | `npm run build` | Passed | `tsc -p tsconfig.build.json` |
| Unit/integration tests | `npm test` | Passed | 3 files, 5 tests |
| Migrations | — | Not applicable | No database in Sprint 1 |
| Health endpoint | `curl http://localhost:5000/api/health` | Passed | `200` with expected payload |
| Unknown route | `curl http://localhost:5000/api/nope` | Passed | `404` structured error |
| Malformed JSON | `curl -X POST ...` with invalid body | Passed | `400` structured error |
| Invalid `PORT` | `PORT=abc npx tsx src/server.ts` | Passed | Process exited with status `1` |
| Missing production origin | `NODE_ENV=production ...` | Passed | Process exited with status `1` |
| Production build runtime | Built server on port `5001` | Passed | `200` health response |
| Browser checks | `playwright-cli` | Passed | 1440×900 and 390×844, no horizontal overflow |
| Console | `playwright-cli console` | Passed | No errors or warnings; only React DevTools info |
| Error state | Simulated `503` health response | Passed | UI showed “API unreachable” and retry worked |
| Dependency audit | `npm audit --omit=dev` | Passed | 0 production vulnerabilities |
| Dev dependency audit | `npm audit` | Advisory | 12 moderate dev-only advisories; no non-breaking fix |

## 5. Authorization verification

No authorization or ownership rules were introduced in Sprint 1, so the
authorization matrix is not applicable. Every implemented endpoint is public and
read-only.

| Scenario | Expected | Actual | Pass |
|---|---|---|---|
| Correct role performs action | N/A | No roles yet | N/A |
| Wrong role performs action | N/A | No roles yet | N/A |
| Unauthenticated request | Allowed for public health only | `GET /api/health` succeeds | Yes |
| Customer accesses another customer's resource | N/A | No customer resources | N/A |
| Seller accesses another seller's resource | N/A | No seller resources | N/A |
| ADMIN performs SUPERADMIN-only action | N/A | No admin operations | N/A |
| SUPERADMIN performs privileged action | N/A | No superadmin operations | N/A |

## 6. Documentation updates

- [x] `docs/IMPLEMENTATION_LOG.md`
- [x] `docs/ROLES_AND_PERMISSIONS.md`
- [x] `docs/ERD.md` — no change required (no entities)
- [x] API reference — health endpoint documented here; no separate reference yet
- [x] `docs/DECISIONS_LOG.md`
- [x] Root `README.md`, `docs/README.md`, `docs/PROJECT_GUIDE.md`,
      `docs/PROJECT_OVERVIEW.md`, and `AGENTS.md` command guidance

## 7. Git

- Branch: `sprint/01-basic-project-foundation`
- Commits:
  - `chore: scaffold npm workspace foundation`
  - `feat: add express typescript backend foundation`
  - `feat: add vite react tailwind frontend foundation`
  - `test: add backend foundation tests`
  - `docs: record sprint 1 foundation`
- [x] Only relevant Sprint 1 files staged.
- [x] No secrets, `.env`, logs, or build output committed.
- [x] No push, merge, or force operations performed.

## 8. Sprint completion report

### Summary

Sprint 1 establishes a runnable SajiloMart monorepo with a React/TypeScript/Vite
frontend, an Express/TypeScript backend, safe defaults, logging, health checking,
structured errors, tests, and documentation. No ecommerce, authentication, or
database functionality was added.

### Functionality implemented

- npm workspace root with development, build, typecheck, lint, and test scripts.
- Tailwind-styled foundation page with live API status, loading, error, and retry
  states.
- Express API with environment validation, Helmet, explicit CORS, Morgan/Winston
  logging, graceful shutdown, health endpoint, 404 handling, and centralized error
  handling.
- Backend tests for health, unknown routes, application errors, unexpected
  errors, and malformed JSON.

### Files created

- Root: `.gitignore`, `package.json`, `package-lock.json`.
- Frontend: Vite/TypeScript/ESLint config, `index.html`, favicon, `src/main.tsx`,
  `src/App.tsx`, `src/index.css`, `src/services/api.ts`, `src/vite-env.d.ts`,
  `.env.example`.
- Backend: TypeScript/Vitest/ESLint config, `.env.example`,
  `src/app.ts`, `src/server.ts`, config, controller, routes, middleware, error
  class, and three test files.
- Documentation: this sprint report.

### Files modified

- `AGENTS.md`, `README.md`, `docs/README.md`, `docs/PROJECT_GUIDE.md`,
  `docs/PROJECT_OVERVIEW.md`, `docs/ROLES_AND_PERMISSIONS.md`,
  `docs/IMPLEMENTATION_LOG.md`, and `docs/DECISIONS_LOG.md`.

### Database changes and migrations

None. Sprint 1 intentionally does not connect to a database or create entities.

### API endpoints

- `GET /api/health` — public health payload.

### Roles and permissions

No roles or permissions were introduced. All current functionality is public and
infrastructure-only.

### Actual test results

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm run build` — passed for backend and frontend.
- `npm test` — 3 test files and 5 tests passed.
- Health, 404, malformed JSON, invalid environment, production runtime, and
  browser checks passed as recorded above.
- `npm audit --omit=dev` reported 0 vulnerabilities. `npm audit` reported 12
  moderate dev-only advisories in the lint toolchain.

### Documentation updated

- Sprint report, implementation log, decisions log, roles document, root README,
  docs index, project guide status, project overview status, and agent commands.

### Manual testing instructions

1. Run `npm install` from the repository root.
2. Copy `backend/.env.example` to `backend/.env`.
3. Copy `frontend/.env.example` to `frontend/.env`.
4. Run `npm run dev`.
5. Open `http://localhost:5173` and confirm the API status shows “Connected”.
6. Run `curl http://localhost:5000/api/health` and confirm the success payload.
7. Run `curl http://localhost:5000/api/nope` and confirm the structured `404`.
8. Run `npm run typecheck`, `npm run lint`, `npm run build`, and `npm test`.
9. Stop the development servers with `Ctrl+C`.

### Known limitations and TODOs

- No authentication, roles, database, catalog, cart, or orders yet.
- `/api` is not versioned yet; versioning will be decided when the first domain
  endpoints are introduced.
- The health endpoint is the only API endpoint.
- Frontend behavior is browser-verified but has no automated component tests yet.
- No CI, Docker, or deployment pipeline exists yet.
- Single explicit CORS origin; multi-origin deployment configuration is deferred.
- `npm audit` reports dev-only advisories with no non-breaking fix available.
- `npm install` emits an environment-specific npm `allowScripts` warning for
  esbuild; builds and tests still passed.

### Recommended next sprint

Sprint 2 — Database and public product catalog, only after explicit owner
approval.

> **STOP.** Do not begin another sprint without explicit approval.
