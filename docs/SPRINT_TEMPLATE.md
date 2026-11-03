# SajiloMart — Sprint Template

> Copy this file for each sprint. Replace placeholders, keep the structure, and
> delete sections that do not apply.
>
> A sprint is complete only when implementation, verification, documentation,
> and the review report are all done. Then stop and wait for approval.

---

## Sprint metadata

| Field | Value |
|---|---|
| Sprint | `NN — Name` |
| Branch | `sprint/NN-short-name` |
| Objective | |
| Status | Planned / In progress / In review / Approved / Merged |
| Started | |
| Completed | |
| Related docs | |

## 1. Inspect

- [ ] Read `AGENTS.md`.
- [ ] Read `docs/PROJECT_GUIDE.md`.
- [ ] Read the relevant feature docs.
- [ ] Inspect existing source code.
- [ ] Confirm current branch and `git status`.
- [ ] Review completed sprints and dependencies.
- [ ] Confirm no user modifications will be overwritten.

**Findings:**

- ...

## 2. Plan

### Scope

**Included:**

- ...

**Excluded:**

- ...

### Work breakdown

| Area | Tasks |
|---|---|
| Frontend | |
| Redux/state | |
| API services | |
| Backend routes/controllers | |
| Services/repositories | |
| Database/entities/migrations | |
| Validation | |
| Authorization | |
| Error handling | |
| Tests | |

### API endpoints

| Method | Path | Auth | Roles | Purpose |
|---|---|---|---|---|
| | | | | |

### Database changes

| Change | Reason | Migration | Up/down | Data impact |
|---|---|---|---|---|
| | | | | |

### Roles and permissions

| Role | Permission introduced/changed | Status |
|---|---|---|
| | | |

### Dependencies

- ...

### Security considerations

- ...

### Acceptance criteria

- [ ] ...
- [ ] ...

### Test plan

- [ ] TypeScript check
- [ ] Lint
- [ ] Frontend build
- [ ] Backend build
- [ ] Unit tests
- [ ] Integration tests
- [ ] Migration up/down
- [ ] Browser verification
- [ ] Authorization matrix
- [ ] Ownership/isolation checks

## 3. Implementation notes

> Record decisions and deviations while working. Link important decisions to
> `DECISIONS_LOG.md`.

- ...

## 4. Verification results

| Check | Command | Result | Notes |
|---|---|---|---|
| TypeScript | | | |
| Lint | | | |
| Frontend build | | | |
| Backend build | | | |
| Unit tests | | | |
| Integration tests | | | |
| Migrations | | | |
| Browser checks | | | |

> Never write "passed" without the command and observed result. Label
> pre-existing failures separately.

## 5. Authorization verification

| Scenario | Expected | Actual | Pass |
|---|---|---|---|
| Correct role performs action | Allowed | | |
| Wrong role performs action | Rejected | | |
| Unauthenticated request | Rejected where required | | |
| Customer accesses another customer's resource | Rejected | | |
| Seller accesses another seller's resource | Rejected | | |
| ADMIN performs SUPERADMIN-only action | Rejected | | |
| SUPERADMIN performs privileged action | Allowed | | |

## 6. Documentation updates

- [ ] `docs/IMPLEMENTATION_LOG.md`
- [ ] `docs/ROLES_AND_PERMISSIONS.md`
- [ ] `docs/ERD.md` or database design
- [ ] API reference, if present
- [ ] `docs/DECISIONS_LOG.md`
- [ ] Other: ...

## 7. Git

- Branch: `sprint/NN-short-name`
- Commits:
  - `...`
- [ ] Only relevant files staged.
- [ ] No secrets, `.env`, or logs committed.
- [ ] No push, merge, or force operations without approval.

## 8. Sprint completion report

### Summary

...

### Functionality implemented

- ...

### Files created

- ...

### Files modified

- ...

### Database changes and migrations

- ...

### API endpoints

- ...

### Roles and permissions

- ...

### Actual test results

...

### Documentation updated

- ...

### Manual testing instructions

1. ...
2. ...

### Known limitations and TODOs

- ...

### Recommended next sprint

...

> **STOP.** Do not begin another sprint without explicit approval.
