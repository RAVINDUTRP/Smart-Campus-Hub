# Contribution Log Template

Create one entry per merged pull request.

## Entry

- Date:
- Workstream: WS1 or WS2 or WS3 or WS4
- Branch:
- PR Number:
- Commit Hash:
- Assignment Module:
- Endpoints Added or Updated:
- UI Components or Pages Added or Updated:
- Tests Added or Updated:
- Evidence Links:
  - Screenshot path:
  - Postman collection path:
  - Test report path:
- Notes:

## Completed Entries

Add entries below this line as the project progresses.

- Date: 2026-03-29
- Workstream: WS1
- Branch: feat/ws1-resource-catalogue
- PR Number: Pending
- Commit Hash: Pending
- Assignment Module: A
- Endpoints Added or Updated: POST/GET/GET by id/PUT/DELETE /api/v1/resources
- UI Components or Pages Added or Updated: frontend/src/pages/CataloguePage.jsx, frontend/src/features/catalogue/resourceApi.js, frontend/src/styles/global.css
- Tests Added or Updated: ResourceServiceTest, ResourceControllerIntegrationTest
- Evidence Links:
  - Screenshot path: Pending
  - Postman collection path: Pending
  - Test report path: backend/target/surefire-reports
- Notes: WS1 backend CRUD, filtering, validation, global exception handling, and frontend Catalogue integration completed.

- Date: 2026-03-29
- Workstream: WS2
- Branch: feat/ws2-booking-workflow
- PR Number: Pending
- Commit Hash: Pending
- Assignment Module: B
- Endpoints Added or Updated: POST/GET/GET my/PATCH approve/PATCH reject/PATCH cancel /api/v1/bookings
- UI Components or Pages Added or Updated: frontend/src/pages/BookingsPage.jsx, frontend/src/features/bookings/bookingApi.js
- Tests Added or Updated: BookingServiceTest, BookingControllerIntegrationTest
- Evidence Links:
  - Screenshot path: Pending
  - Postman collection path: postman/ws2-booking-workflow.postman_collection.json
  - Test report path: backend/target/surefire-reports
- Notes: WS2 backend booking workflow, conflict validation, status transition rules, and frontend bookings integration completed.

- Date: 2026-03-30
- Workstream: WS3
- Branch: feat/ws3-ticketing-workflow
- PR Number: Pending
- Commit Hash: Pending
- Assignment Module: C
- Endpoints Added or Updated: /api/v1/tickets core endpoints, comments, attachments, assignment, status, rejection
- UI Components or Pages Added or Updated: frontend/src/pages/TicketsPage.jsx, frontend/src/features/tickets/ticketApi.js
- Tests Added or Updated: TicketServiceTest, TicketControllerIntegrationTest
- Evidence Links:
  - Screenshot path: Pending
  - Postman collection path: postman/ws3-ticketing-workflow.postman_collection.json
  - Test report path: backend/target/surefire-reports
- Notes: WS3 ticket lifecycle, safe attachment upload constraints, and comment ownership rules implemented with frontend integration.