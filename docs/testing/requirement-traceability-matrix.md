# Requirement Traceability Matrix

Track requirement-to-implementation and requirement-to-test links so evaluators can verify completeness quickly.

| Requirement ID | Requirement Summary | Workstream | Endpoint or UI | Test Type | Test Reference | Result |
|---|---|---|---|---|---|---|
| A-01 | Add and manage resources | WS1 | /api/v1/resources, CataloguePage | Unit + Integration | Pending | Pending |
| A-02 | Search and filter resources | WS1 | GET /api/v1/resources with query params | Integration + UI | Pending | Pending |
| B-01 | Create booking request | WS2 | POST /api/v1/bookings | Unit + Integration | Pending | Pending |
| B-02 | Prevent overlapping bookings | WS2 | Booking conflict validation service | Unit + Integration | Pending | Pending |
| B-03 | Approve or reject bookings | WS2 | PATCH approve/reject endpoints | Integration + UI | Pending | Pending |
| C-01 | Create and track tickets | WS3 | /api/v1/tickets, TicketsPage | Unit + Integration | Pending | Pending |
| C-02 | Attachment limit max 3 images | WS3 | attachments endpoint validation | Unit + Integration | Pending | Pending |
| C-03 | Comment ownership rules | WS3 | comment edit/delete authorization | Unit + Integration | Pending | Pending |
| D-01 | Notify booking and ticket changes | WS4 | notifications endpoints and UI panel | Integration + UI | Pending | Pending |
| E-01 | OAuth2 login and role control | WS4 | auth + protected routes | Integration + UI | Pending | Pending |

## Usage

1. Add exact test class, test name, or Postman request path in Test Reference.
2. Update Result as Pass or Fail.
3. Keep this matrix in sync with docs/api/endpoint-ownership-matrix.md.