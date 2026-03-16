
/*
  # Fix profiles auth_user_id and house member lookup

  ## Problem
  1. Several profiles rows have auth_user_id = NULL because they were created
     with id matching auth.users.id but auth_user_id was never populated.
  2. get_my_house_id() only checks auth_user_id, so users with NULL auth_user_id
     get no house_id, breaking RLS policies and member discovery.
  3. get_house_members RPC runs under caller's RLS returning no rows when
     RLS blocks profile reads.

  ## Fixes
  1. Backfill auth_user_id = id for all profiles where auth_user_id IS NULL
     and id exists in auth.users.
  2. Replace get_my_house_id() to also fall back to id = auth.uid() lookup.
  3. Drop and recreate get_house_members as SECURITY DEFINER with richer return type.
*/

-- 1. Backfill auth_user_id where it is NULL but id matches auth.users
UPDATE public.profiles
SET auth_user_id = id
WHERE auth_user_id IS NULL
  AND id IN (SELECT id FROM auth.users);

-- 2. Fix get_my_house_id to also check id column as fallback
CREATE OR REPLACE FUNCTION public.get_my_house_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT house_id
  FROM public.profiles
  WHERE auth_user_id = auth.uid()
     OR id = auth.uid()
  LIMIT 1;
$$;

-- 3. Drop and recreate get_house_members as SECURITY DEFINER with richer columns
DROP FUNCTION IF EXISTS public.get_house_members(uuid);

CREATE OR REPLACE FUNCTION public.get_house_members(p_house_id uuid)
RETURNS TABLE (
  id uuid,
  full_name text,
  phone_number text,
  business_category text,
  city text,
  state text,
  vertical_type text,
  created_at timestamptz
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.id,
    p.full_name,
    up.phone_number,
    up.business_category,
    COALESCE(up.city, p.zone) AS city,
    up.state,
    up.vertical_type::text,
    up.created_at
  FROM public.profiles p
  LEFT JOIN public.users_profile up ON up.id = p.id
     OR up.id = p.auth_user_id
  WHERE p.house_id = p_house_id
    AND (p.approval_status = 'approved' OR p.approval_status IS NULL);
END;
$$;
