ALTER TABLE resources
    ADD COLUMN IF NOT EXISTS availability_days VARCHAR(100);

ALTER TABLE resources
    ADD COLUMN IF NOT EXISTS availability_start TIME;

ALTER TABLE resources
    ADD COLUMN IF NOT EXISTS availability_end TIME;