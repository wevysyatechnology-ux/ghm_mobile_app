-- Add profile_photo column to users_profile table
ALTER TABLE public.users_profile
ADD COLUMN IF NOT EXISTS profile_photo TEXT DEFAULT NULL;
