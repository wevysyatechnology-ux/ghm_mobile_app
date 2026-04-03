-- Add ai_consent column to users_profile for per-user, user-based consent storage.
-- Values: 'accepted' | 'declined' | NULL (pending – popup will show on next login)

ALTER TABLE public.users_profile
  ADD COLUMN IF NOT EXISTS ai_consent TEXT
    CHECK (ai_consent IN ('accepted', 'declined'))
    DEFAULT NULL;

-- Allow authenticated users to update only their own ai_consent field
-- (RLS on users_profile is already enabled; this policy covers the new column)
-- No separate policy needed – the existing "Users can update own profile" policy covers it.

COMMENT ON COLUMN public.users_profile.ai_consent IS
  'Per-user AI data processing consent. NULL = pending (popup shown on login), accepted, or declined.';
