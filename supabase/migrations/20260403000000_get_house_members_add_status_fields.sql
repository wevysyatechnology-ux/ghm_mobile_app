-- Update get_house_members RPC to also return membership_status and is_suspended
-- so the mobile app can filter out inactive/suspended members client-side.

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
  membership_status text,
  is_suspended boolean,
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
    COALESCE(up.membership_status::text, 'active') AS membership_status,
    COALESCE(up.is_suspended, false) AS is_suspended,
    up.created_at
  FROM public.profiles p
  LEFT JOIN public.users_profile up ON up.id = p.id
     OR up.id = p.auth_user_id
  WHERE p.house_id = p_house_id
    AND (p.approval_status = 'approved' OR p.approval_status IS NULL)
    -- Exclude members with explicitly inactive membership status
    AND COALESCE(up.membership_status::text, 'active') NOT IN ('expired', 'resigned', 'terminated', 'inactive', 'suspended')
    -- Exclude suspended members
    AND COALESCE(up.is_suspended, false) = false;
END;
$$;

GRANT EXECUTE ON FUNCTION public.get_house_members(uuid) TO authenticated;
