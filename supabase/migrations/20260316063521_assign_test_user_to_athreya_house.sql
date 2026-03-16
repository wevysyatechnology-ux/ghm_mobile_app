
/*
  # Assign test user to Athreya house

  ## Changes
  - Updates the test user (test9902093811@wevysya.com) profiles row to have
    house_id = Athreya house so they can see house members and house info.
  - Also updates their full_name to something readable.
*/

UPDATE public.profiles
SET 
  house_id = 'bac34abe-f17d-45e4-8ece-fcdf8dce3341',
  full_name = CASE WHEN full_name = 'test9902093811@wevysya.com' THEN 'Test User' ELSE full_name END
WHERE auth_user_id = 'cf889956-be9c-48d2-a04e-dffbc50daa65'
   OR id = 'cf889956-be9c-48d2-a04e-dffbc50daa65';

UPDATE public.users_profile
SET
  full_name = CASE WHEN full_name = 'test9902093811@wevysya.com' THEN 'Test User' ELSE full_name END
WHERE id = 'cf889956-be9c-48d2-a04e-dffbc50daa65'
  AND (full_name IS NULL OR full_name = 'test9902093811@wevysya.com');
