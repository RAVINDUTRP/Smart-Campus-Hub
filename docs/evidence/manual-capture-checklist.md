# Final Evidence Capture Checklist

Use this checklist to complete final assignment submission evidence.

## Auto-Generated Proof (already scriptable)

Run:

```bash
./scripts/capture_evidence.sh
```

Output folder:

- docs/evidence/ws4-proof-2026-03-30

This contains:

- API flow proofs for resource, booking, ticket, notifications
- PostgreSQL row query proofs for resources, bookings, tickets, notifications

## Manual Screenshot Capture (UI)

Take and save screenshots in docs/evidence/screenshots/ with clear file names.

1. Catalogue page: resource creation success message and table row visible.
2. Bookings page: booking in PENDING and then APPROVED state.
3. Tickets page: ticket create, assign, resolve, and comment visible.
4. Notifications page: unread list and then one item marked as read.
5. Sidebar profile card: role-aware display from /auth/me.

Suggested names:

- ws4-01-catalogue-resource-created.png
- ws4-02-booking-approved.png
- ws4-03-ticket-resolved-commented.png
- ws4-04-notification-mark-read.png
- ws4-05-profile-role-card.png

## Manual Video Capture (2-4 minutes)

Record one continuous demo:

1. Create booking -> approve booking.
2. Create ticket -> assign -> resolve -> add comment.
3. Open notifications page -> load notifications -> mark one as read.
4. Show PostgreSQL proof files in docs/evidence/ws4-proof-2026-03-30.

Save as:

- docs/evidence/ws4-demo-video.mp4

## Final Documentation Update

After capturing screenshots/video, update:

- docs/evidence/contribution-log-template.md
- docs/testing/requirement-traceability-matrix.md
- docs/api/endpoint-ownership-matrix.md

Replace pending evidence paths with real screenshot and video file paths.
