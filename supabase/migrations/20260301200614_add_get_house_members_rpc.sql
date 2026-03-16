-- Create a secure function to fetch house members bypassing RLS on profiles
CREATE OR REPLACE FUNCTION get_house_members(p_house_id UUID)
RETURNS TABLE (
  id UUID,
  full_name TEXT,
  phone_number TEXT,
  business_category TEXT,
  city TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.full_name,
    up.phone_number,
    up.business_category,
    COALESCE(up.city, p.zone) as city
  FROM profiles p
  LEFT JOIN users_profile up ON up.id = p.id
  WHERE p.house_id = p_house_id
    AND p.approval_status = 'approved';
END;
$$;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION get_house_members(UUID) TO authenticated;
