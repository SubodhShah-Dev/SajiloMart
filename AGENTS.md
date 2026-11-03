# SajiloMart — Agent Instructions

Permanent project rules for AI agents and developers. Read this file before any
work, then read [`docs/PROJECT_GUIDE.md`](docs/PROJECT_GUIDE.md) and the
documentation relevant to the current sprint.

## Non-negotiables

- Work in small, independently reviewable sprints. Never start a new sprint
  without explicit owner approval.
- Keep the application functional after every sprint.
- Start with the minimum functionality and minimum permissions. Add permissions
  only with the feature they protect.
- Multi-vendor marketplace support is mandatory in the final application, but do
  not build future functionality prematurely.
- Preserve user changes. Inspect `git status` and existing code before editing.
  Never reset, stash, or overwrite unrelated work.
- Never claim work or tests are complete without running the checks and observing
  the result.

## Architecture

- Monorepo: `frontend/` (React, TypeScript, Vite, Redux Toolkit, React Router
  DOM, Tailwind CSS, Lucide React, Recharts) and `backend/` (Node.js, Express,
  TypeScript, TypeORM, MySQL, Winston, Morgan, Helmet, CORS).
- Backend layering: routes → controllers → services → repositories; entities and
  middleware. No business logic in routes or controllers.
- Frontend is feature-based. Introduce folders only when their feature exists.
- API communication is separated from UI components.
- Use TypeScript with proper types; avoid unexplained `any`.

## Database

- MySQL on Aiven through TypeORM.
- **Never use `synchronize: true`.** Disable automatic schema synchronization in
  every environment.
- Every schema change uses a TypeORM migration with working `up` and `down`.
- Use foreign keys, indexes, unique constraints, correct decimal precision for
  money, transactions for multi-step writes, and snapshots for order history.
- Do not create permission tables without a genuine requirement.

## Roles and security

- Roles: `CUSTOMER`, `SELLER`, `ADMIN`, `SUPERADMIN`. Visitors are not a role.
- Public registration creates `CUSTOMER` only. `SELLER` requires approval.
  `ADMIN` is created by `SUPERADMIN`. `SUPERADMIN` is securely provisioned.
- Backend authorization is authoritative. Frontend checks are for UI only.
- Verify ownership on every customer and seller resource.
- JWTs live in HTTP-only cookies, never in `localStorage` or `sessionStorage`.
  Refresh tokens are hashed and rotated.
- Never log passwords, tokens, cookies, or secrets. Never commit `.env` files.
- Geography is reference data for addresses only. No geographic admin roles.

## Sprint workflow

1. **Inspect** — read docs, source, branch, and `git status`.
2. **Plan** — report objective, scope, tasks, APIs, roles, permissions,
   dependencies, security, acceptance criteria, and tests.
3. **Implement** — end-to-end across the required layers. No fake APIs or fake
   success responses.
4. **Test** — run the narrowest relevant checks, then broader checks. Verify
   authorization and ownership whenever permissions change.
5. **Document** — update the implementation log, roles/permissions, ERD,
   decisions, and API/deployment docs as applicable.
6. **Git** — work on a sprint branch, make small meaningful commits, stage only
   relevant files, never force-push or push without permission.
7. **Review and stop** — provide the completion report and wait for approval.

Use [`docs/SPRINT_TEMPLATE.md`](docs/SPRINT_TEMPLATE.md) for every sprint.

## Commands

Project scripts exist from Sprint 1. Inspect the root and application
`package.json` files before running commands, and never invent scripts or
dependencies.

- Root: `npm install`, `npm run dev`, `npm run dev:backend`,
  `npm run dev:frontend`, `npm run build`, `npm run typecheck`, `npm run lint`,
  `npm test`.
- Backend and frontend also expose their own workspace scripts.

## Documentation map

| Document | Purpose |
|---|---|
| [`docs/README.md`](docs/README.md) | Documentation index |
| [`docs/PROJECT_GUIDE.md`](docs/PROJECT_GUIDE.md) | Authoritative specification |
| [`docs/PROJECT_OVERVIEW.md`](docs/PROJECT_OVERVIEW.md) | Scope and direction |
| [`docs/ROLES_AND_PERMISSIONS.md`](docs/ROLES_AND_PERMISSIONS.md) | Roles and evolving permissions |
| [`docs/SPRINT_ROADMAP.md`](docs/SPRINT_ROADMAP.md) | Sprint sequence |
| [`docs/SPRINT_TEMPLATE.md`](docs/SPRINT_TEMPLATE.md) | Sprint plan/report template |
| [`docs/IMPLEMENTATION_LOG.md`](docs/IMPLEMENTATION_LOG.md) | Completed work |
| [`docs/DECISIONS_LOG.md`](docs/DECISIONS_LOG.md) | Architecture decisions |

## Git

- Branch per sprint: `sprint/NN-short-name` (Phase 0: `docs/phase-0`).
- Commit messages: `feat:`, `fix:`, `chore:`, `test:`, `docs:`, `refactor:`.
- Never commit secrets, `.env` files, generated logs, or build artifacts.
- Never merge, push, deploy, or tag without explicit owner approval.
