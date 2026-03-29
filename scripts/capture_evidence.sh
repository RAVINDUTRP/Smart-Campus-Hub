#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
EVIDENCE_DIR="${ROOT_DIR}/docs/evidence/ws4-proof-2026-03-30"
API_BASE="http://localhost:8080/api/v1"
RECIPIENT_EMAIL="student1@smartcampus.local"

auto_write_response() {
  local outfile="$1"
  shift

  local body_file
  body_file="${outfile}.body"

  local status
  status=$(curl -sS -o "$body_file" -w "%{http_code}" "$@")

  cat "$body_file" > "$outfile"
  echo "HTTP:${status}" >> "$outfile"
  rm -f "$body_file"
}

extract_first_id() {
  local file_path="$1"
  grep -o '"id":[0-9][0-9]*' "$file_path" | head -1 | cut -d: -f2
}

mkdir -p "$EVIDENCE_DIR"

echo "Generated at: $(date)" > "${EVIDENCE_DIR}/00_timestamp.txt"

auto_write_response "${EVIDENCE_DIR}/01_health.txt" "${API_BASE}/health"

TS="$(date +%s)"
RESOURCE_NAME="Evidence Room ${TS}"

auto_write_response "${EVIDENCE_DIR}/02_resource_create.txt" \
  -X POST "${API_BASE}/resources" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"${RESOURCE_NAME}\",\"type\":\"MEETING_ROOM\",\"capacity\":25,\"location\":\"Evidence Block\",\"status\":\"ACTIVE\",\"availabilityDays\":\"MON-FRI\",\"availabilityStart\":\"08:00\",\"availabilityEnd\":\"17:00\"}"

RESOURCE_ID="$(extract_first_id "${EVIDENCE_DIR}/02_resource_create.txt")"

auto_write_response "${EVIDENCE_DIR}/03_booking_create.txt" \
  -X POST "${API_BASE}/bookings" \
  -H "Content-Type: application/json" \
  -d "{\"resourceId\":${RESOURCE_ID},\"requesterEmail\":\"${RECIPIENT_EMAIL}\",\"startTime\":\"2026-05-01T09:00:00\",\"endTime\":\"2026-05-01T11:00:00\",\"purpose\":\"Evidence Capture Session\",\"expectedAttendees\":18}"

BOOKING_ID="$(extract_first_id "${EVIDENCE_DIR}/03_booking_create.txt")"

auto_write_response "${EVIDENCE_DIR}/04_booking_approve.txt" \
  -X PATCH "${API_BASE}/bookings/${BOOKING_ID}/approve"

auto_write_response "${EVIDENCE_DIR}/05_ticket_create.txt" \
  -X POST "${API_BASE}/tickets" \
  -H "Content-Type: application/json" \
  -d "{\"category\":\"EVIDENCE_${TS}\",\"description\":\"WS4 evidence flow validation\",\"priority\":\"HIGH\",\"location\":\"Evidence Lab\",\"requesterEmail\":\"${RECIPIENT_EMAIL}\",\"preferredContact\":\"${RECIPIENT_EMAIL}\"}"

TICKET_ID="$(extract_first_id "${EVIDENCE_DIR}/05_ticket_create.txt")"

auto_write_response "${EVIDENCE_DIR}/06_ticket_assign.txt" \
  -X PATCH "${API_BASE}/tickets/${TICKET_ID}/assign" \
  -H "Content-Type: application/json" \
  -d '{"technicianEmail":"tech1@smartcampus.local"}'

auto_write_response "${EVIDENCE_DIR}/07_ticket_status_resolved.txt" \
  -X PATCH "${API_BASE}/tickets/${TICKET_ID}/status" \
  -H "Content-Type: application/json" \
  -d '{"status":"RESOLVED","resolutionNotes":"Evidence resolution notes"}'

auto_write_response "${EVIDENCE_DIR}/08_ticket_comment_create.txt" \
  -X POST "${API_BASE}/tickets/${TICKET_ID}/comments" \
  -H "Content-Type: application/json" \
  -d '{"authorEmail":"tech1@smartcampus.local","content":"Evidence comment for notification trigger"}'

auto_write_response "${EVIDENCE_DIR}/09_notifications_list.txt" \
  "${API_BASE}/notifications?recipientEmail=${RECIPIENT_EMAIL}&unreadOnly=false"

auto_write_response "${EVIDENCE_DIR}/10_notifications_summary_before_read.txt" \
  "${API_BASE}/notifications/summary?recipientEmail=${RECIPIENT_EMAIL}"

NOTIFICATION_ID="$(extract_first_id "${EVIDENCE_DIR}/09_notifications_list.txt" || true)"
if [[ -n "${NOTIFICATION_ID}" ]]; then
  auto_write_response "${EVIDENCE_DIR}/11_notification_mark_read.txt" \
    -X PATCH "${API_BASE}/notifications/${NOTIFICATION_ID}/read?recipientEmail=${RECIPIENT_EMAIL}"
else
  echo "No notification id found in notifications list." > "${EVIDENCE_DIR}/11_notification_mark_read.txt"
fi

auto_write_response "${EVIDENCE_DIR}/12_notifications_summary_after_read.txt" \
  "${API_BASE}/notifications/summary?recipientEmail=${RECIPIENT_EMAIL}"

docker exec smartcampus-postgres psql -U smartcampus_user -d smartcampus -tAc \
  "select id,name,type,status,created_at from resources where id=${RESOURCE_ID};" \
  > "${EVIDENCE_DIR}/13_db_resource_row.txt"

docker exec smartcampus-postgres psql -U smartcampus_user -d smartcampus -tAc \
  "select id,requester_email,status,created_at from bookings where id=${BOOKING_ID};" \
  > "${EVIDENCE_DIR}/14_db_booking_row.txt"

docker exec smartcampus-postgres psql -U smartcampus_user -d smartcampus -tAc \
  "select id,requester_email,status,assigned_technician_email,created_at from tickets where id=${TICKET_ID};" \
  > "${EVIDENCE_DIR}/15_db_ticket_row.txt"

docker exec smartcampus-postgres psql -U smartcampus_user -d smartcampus -tAc \
  "select id,recipient_email,type,is_read,created_at from notifications where recipient_email='${RECIPIENT_EMAIL}' order by id desc limit 10;" \
  > "${EVIDENCE_DIR}/16_db_notifications_rows.txt"

cat > "${EVIDENCE_DIR}/README.md" <<EOF
# WS4 Evidence Pack (Auto Generated)

Generated: $(date)

## Scenario IDs
- Resource ID: ${RESOURCE_ID}
- Booking ID: ${BOOKING_ID}
- Ticket ID: ${TICKET_ID}
- Notification ID Marked Read: ${NOTIFICATION_ID:-N/A}

## API Proof Files
- 01_health.txt
- 02_resource_create.txt
- 03_booking_create.txt
- 04_booking_approve.txt
- 05_ticket_create.txt
- 06_ticket_assign.txt
- 07_ticket_status_resolved.txt
- 08_ticket_comment_create.txt
- 09_notifications_list.txt
- 10_notifications_summary_before_read.txt
- 11_notification_mark_read.txt
- 12_notifications_summary_after_read.txt

## PostgreSQL Proof Files
- 13_db_resource_row.txt
- 14_db_booking_row.txt
- 15_db_ticket_row.txt
- 16_db_notifications_rows.txt
EOF

echo "Evidence generated at: ${EVIDENCE_DIR}"
