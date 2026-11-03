# SajiloMart — Documentation

This folder contains the project's documentation. It is intentionally flat and
uses relative links so it works in both GitHub and Obsidian.

> **Current phase:** Sprint 1 — Basic project foundation implemented and in
> review. The frontend and backend run locally; no ecommerce, authentication, or
> database features exist yet.

## Reading order

1. [Project Overview](PROJECT_OVERVIEW.md) — what we are building and why.
2. [Project Guide](PROJECT_GUIDE.md) — authoritative rules and specification.
3. [Roles and Permissions](ROLES_AND_PERMISSIONS.md) — who can do what, and the
   incremental policy.
4. [Sprint Roadmap](SPRINT_ROADMAP.md) — the delivery sequence.
5. [Sprint Template](SPRINT_TEMPLATE.md) — how each sprint is planned and
   reported.

## Documents

| Document | Purpose | Owner |
|---|---|---|
| [PROJECT_GUIDE.md](PROJECT_GUIDE.md) | Complete project specification, architecture, and workflow | Maintained by agents/developers |
| [PROJECT_OVERVIEW.md](PROJECT_OVERVIEW.md) | Scope, goals, initial vs. final product | Maintained by agents/developers |
| [BRD.md](BRD.md) | Business requirements template | Project owner |
| [SRS.md](SRS.md) | Functional and non-functional requirements template | Project owner |
| [USE_CASES.md](USE_CASES.md) | Actors, use-case template, and catalog | Project owner |
| [ERD.md](ERD.md) | Conceptual entity outline and migration expectations | Project owner / architecture |
| [ROLES_AND_PERMISSIONS.md](ROLES_AND_PERMISSIONS.md) | Four roles, ownership rules, evolving permission matrix | Updated every sprint |
| [SPRINT_ROADMAP.md](SPRINT_ROADMAP.md) | Phase and sprint sequence with milestones | Maintained by agents/developers |
| [SPRINT_TEMPLATE.md](SPRINT_TEMPLATE.md) | Reusable sprint plan and completion report | Maintained by agents/developers |
| [SPRINT_01_BASIC_FOUNDATION.md](SPRINT_01_BASIC_FOUNDATION.md) | Sprint 1 plan, verification, and completion report | Maintained by agents/developers |
| [IMPLEMENTATION_LOG.md](IMPLEMENTATION_LOG.md) | Completed sprint history | Updated every sprint |
| [DECISIONS_LOG.md](DECISIONS_LOG.md) | Architecture decisions and open questions | Updated as decisions are made |

## Documentation rules

- Keep documents flat unless a real need requires a subfolder.
- Use relative links and Markdown headings that work on GitHub and in Obsidian.
- Distinguish **Implemented**, **Planned**, and **Not applicable**.
- Do not fabricate requirements; mark owner-authored content as `TBD`.
- Update the implementation log, roles document, ERD, and decisions log at the
  end of every sprint.
- Never include secrets, credentials, tokens, or personal data.

## Status legend

| Status | Meaning |
|---|---|
| Implemented | Verified working functionality |
| Planned | Scheduled in a future sprint |
| Deferred | Intentionally postponed, may not be scheduled |
| Not applicable | The role or feature must not have this capability |
