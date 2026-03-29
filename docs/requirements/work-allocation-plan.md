# Work Allocation Plan (Solo Developer, Member-Style Split)

## Objective

Show assignment-compliant work allocation in a way that is transparent and auditable in GitHub, even when one developer implements all modules.

## Ownership Model

All work is implemented by one developer, but split into four assignment-aligned workstreams.

| Workstream | Assignment Member Mapping | Scope | Main Backend Areas | Main Frontend Areas |
|---|---|---|---|---|
| WS1 | Member 1 | Facilities and assets catalogue | resource entity, repository, service, controller | catalogue pages, resource forms, filters |
| WS2 | Member 2 | Booking workflow and conflict rules | booking endpoints, status transitions, overlap validation | booking request UI, approval/rejection UI |
| WS3 | Member 3 | Incident ticketing and technician flow | tickets, attachments, comments, assignment logic | ticket creation UI, ticket timeline, comments UI |
| WS4 | Member 4 | Notifications and access control | notifications, role rules, OAuth2 integration | notification panel, route guards, auth UX |

## Git Workflow Rules

1. Branch naming uses workstream prefix:
   - feat/ws1-*
   - feat/ws2-*
   - feat/ws3-*
   - feat/ws4-*
2. Commit messages start with WS code:
   - WS1:
   - WS2:
   - WS3:
   - WS4:
3. Every pull request must mention:
   - assignment module
   - endpoints added or changed
   - UI components added or changed
   - tests and evidence links
4. Merge only after updating:
   - docs/api/endpoint-ownership-matrix.md
   - docs/testing/requirement-traceability-matrix.md

## Evidence Strategy

For each merged PR, keep evidence for viva and report:

- commit hash
- API test proof (Postman or integration test)
- UI screenshot or short screen recording
- test result summary

Use docs/evidence/contribution-log-template.md to record each completed PR.