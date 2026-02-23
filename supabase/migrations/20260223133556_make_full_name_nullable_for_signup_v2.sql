/*
  # Make full_name Nullable for Signup Flow (v2)

  ## Problem
  
  The users_profile table has full_name as NOT NULL, but during signup we don't collect
  the user's name yet. This causes signup to fail when trying to create the profile.

  ## Solution
  
  1. **Make full_name nullable**
     - Change full_name column to allow NULL values
     - This allows profile creation during signup without a name
     - Users can complete their profile with their name later
  
  2. **Set default value for existing empty strings**
     - Use 'User' as placeholder for existing empty names
     - Then make the column nullable
  
  ## Security Notes
  
  - RLS policies remain unchanged
  - Users still can only create/read/update their own profiles
  - Profile completion flow remains the same
*/

-- First, update any existing empty strings to a placeholder
-- This ensures no constraint violations
UPDATE users_profile 
SET full_name = 'User' 
WHERE full_name = '' OR full_name IS NULL;

-- Now make full_name nullable to allow profile creation during signup
ALTER TABLE users_profile 
ALTER COLUMN full_name DROP NOT NULL;

-- Set default value for new rows
ALTER TABLE users_profile 
ALTER COLUMN full_name SET DEFAULT '';
