ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS requester_email VARCHAR(150) DEFAULT 'student@smartcampus.local';

ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS expected_attendees INTEGER;

ALTER TABLE bookings
    ADD COLUMN IF NOT EXISTS rejection_reason VARCHAR(255);

ALTER TABLE bookings
    ALTER COLUMN requester_email SET NOT NULL;