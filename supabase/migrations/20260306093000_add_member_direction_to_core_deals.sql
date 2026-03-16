-- Add explicit sender/receiver member IDs to core_deals
-- Business mapping:
--   from_member_id = selected member from dropdown (amount given by)
--   to_member_id   = authenticated user (amount received by)

ALTER TABLE core_deals
ADD COLUMN IF NOT EXISTS from_member_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS to_member_id UUID REFERENCES profiles(id) ON DELETE SET NULL;

-- Backfill receiver for old rows so existing data remains consistent
UPDATE core_deals
SET to_member_id = creator_id
WHERE to_member_id IS NULL;

-- Helpful indexes for activity/detail lookups
CREATE INDEX IF NOT EXISTS idx_core_deals_from_member_id ON core_deals(from_member_id);
CREATE INDEX IF NOT EXISTS idx_core_deals_to_member_id ON core_deals(to_member_id);
