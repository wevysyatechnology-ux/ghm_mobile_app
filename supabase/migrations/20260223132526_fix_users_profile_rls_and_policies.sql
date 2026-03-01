/*
  # Fix Users Profile RLS and Policies for Signup

  ## Changes Made
  
  1. **Enable RLS on users_profile table**
     - RLS was disabled, causing signup failures
     - Enable RLS to enforce security policies
  
  2. **Drop and recreate policies with proper permissions**
     - Drop existing policies that may have conflicts
     - Create new policies with correct permissions for:
       - Profile creation during signup (INSERT)
       - Reading own profile (SELECT)
       - Updating own profile (UPDATE)
  
  3. **Security Notes**
     - INSERT policy allows authenticated users to create their own profile during signup
     - Policy checks that the user can only create a profile with their own user ID
     - SELECT and UPDATE policies ensure users can only access their own data
  
  ## Policies Created
  
  - **Profile creation during signup**: Allows authenticated users to insert their profile with matching auth.uid()
  - **Users can read own profile**: Allows users to read only their own profile data
  - **Users can update own profile**: Allows users to update only their own profile data
*/

-- Enable RLS on users_profile table (currently disabled)
ALTER TABLE users_profile ENABLE ROW LEVEL SECURITY;

-- Drop existing policies to recreate them with proper permissions
DROP POLICY IF EXISTS "Allow profile creation during signup" ON users_profile;
DROP POLICY IF EXISTS "Users can read own profile" ON users_profile;
DROP POLICY IF EXISTS "Users can update own profile" ON users_profile;

-- Create policy for profile creation during signup
-- Allows authenticated users to create their own profile
CREATE POLICY "Users can create own profile"
  ON users_profile
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Create policy for reading own profile
CREATE POLICY "Users can read own profile"
  ON users_profile
  FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

-- Create policy for updating own profile
CREATE POLICY "Users can update own profile"
  ON users_profile
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Grant necessary permissions to authenticated users
GRANT SELECT, INSERT, UPDATE ON users_profile TO authenticated;
