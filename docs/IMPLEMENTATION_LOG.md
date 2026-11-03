# SajiloMart — Implementation Log

> Chronological record of completed work. Update this file at the end of every
> sprint, before the sprint report.

## Summary

| Sprint | Name | Branch | Status | Completed |
|---|---|---|---|---|
| 0 | Documentation and planning | `docs/phase-0` | Complete | 2026-11-03 |
| 1 | Basic project foundation | — | Not started | — |
| 2 | Database and public product catalog | — | Not started | — |
| 3 | Basic customer authentication | — | Not started | — |
| 4 | Cart | — | Not started | — |
| 5 | Delivery addresses and basic orders | — | Not started | — |
| 6 | Basic ADMIN and SUPERADMIN | — | Not started | — |
| 7 | ADMIN product and order improvements | — | Not started | — |
| 8 | Wishlist | — | Not started | — |
| 9 | Reviews and ratings | — | Not started | — |
| 10 | Seller onboarding | — | Not started | — |
| 11 | Seller dashboard and product management | — | Not started | — |
| 12 | Multi-vendor orders | — | Not started | — |
| 13 | Google OAuth | — | Not started | — |
| 14 | Seller and buyer messaging | — | Not started | — |
| 15 | Flash sales and promotions | — | Not started | — |
| 16 | Stripe Sandbox preparation | — | Not started | — |
| 17 | Advanced dashboards and reports | — | Not started | — |
| 18 | Final testing, security, deployment | — | Not started | — |

## Sprint entries

### Sprint 0 — Documentation and planning

| Field | Value |
|---|---|
| Date | 2026-11-03 |
| Branch | `docs/phase-0` |
| Type | Documentation only |
| Application code | None |
| Dependencies installed | None |

**Objective:** Establish the project scope, structure, roles, roadmap, and
documentation system before writing application code.

**Completed:**

- Root `README.md` expanded with documentation navigation.
- Root `AGENTS.md` with permanent project rules.
- `docs/README.md` documentation index.
- `docs/PROJECT_GUIDE.md` authoritative specification.
- `docs/PROJECT_OVERVIEW.md` initial and final scope.
- `docs/BRD.md`, `docs/SRS.md`, and `docs/USE_CASES.md` templates with writing
  guidance, marked for project-owner completion.
- `docs/ERD.md` conceptual entity outline.
- `docs/ROLES_AND_PERMISSIONS.md` with four roles and incremental policy.
- `docs/SPRINT_ROADMAP.md` and `docs/SPRINT_TEMPLATE.md`.
- `docs/DECISIONS_LOG.md` with initial decisions and open questions.

**Not completed (intentionally):**

- No frontend or backend scaffolding.
- No dependencies, entities, migrations, APIs, or authentication.
- No final permission matrix, final schema, or fabricated requirements.
- BRD, SRS, Use Cases, and detailed ERD content remain owner-authored.

**Verification:**

- Documentation files exist in the flat `docs/` structure.
- Relative links resolve.
- No secrets or `.env` content committed.
- No application source code created.

**Known limitations:**

- BRD, SRS, Use Cases, and detailed ERD are templates awaiting owner input.
- Roadmap may be adjusted before Sprint 1.
- No build, lint, or test commands exist yet.

**Recommended next sprint:** Sprint 1 — Basic project foundation, after owner
approval.
