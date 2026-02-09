/*
  # Remove Unused Indexes and Improve Database Performance

  ## Overview
  This migration removes unused indexes that are consuming storage and slowing down write operations
  without providing query performance benefits.

  ## Changes

  ### Dropped Indexes

  #### Deals Table
  - `idx_deals_house_id` - Not being used by queries
  - `idx_deals_to_member_id` - Not being used by queries  
  - `idx_deals_created_by` - Not being used by queries
  - `idx_deals_from_member_id` - Not being used by queries

  #### Attendance Table
  - `idx_attendance_marked_by` - Not being used by queries
  - `idx_attendance_member_id` - Not being used by queries

  #### Channel Posts Table
  - `idx_channel_posts_channel_id` - Not being used by queries
  - `idx_channel_posts_user_id` - Not being used by queries

  #### Core Deals Table
  - `idx_core_deals_creator_id` - Not being used by queries
  - `idx_core_deals_house_id` - Not being used by queries

  #### Core House Members Table
  - `idx_core_house_members_house_id` - Not being used by queries

  #### Core I2WE Table
  - `idx_core_i2we_house_id` - Not being used by queries
  - `idx_core_i2we_member_1_id` - Not being used by queries
  - `idx_core_i2we_member_2_id` - Not being used by queries

  #### Core Links Table
  - `idx_core_links_from_user_id` - Not being used by queries
  - `idx_core_links_house_id` - Not being used by queries
  - `idx_core_links_to_user_id` - Not being used by queries

  #### Deal Participants Table
  - `idx_deal_participants_user_id` - Not being used by queries

  #### Houses Table
  - `idx_houses_created_by` - Not being used by queries

  #### I2WE Events Table
  - `idx_i2we_events_created_by` - Not being used by queries
  - `idx_i2we_events_member_id` - Not being used by queries

  #### Links Table
  - `idx_links_created_by` - Not being used by queries
  - `idx_links_from_member_id` - Not being used by queries
  - `idx_links_house_id` - Not being used by queries
  - `idx_links_to_member_id` - Not being used by queries

  #### Members Table
  - `idx_members_house_id` - Not being used by queries
  - `idx_members_profile_id` - Not being used by queries

  #### Profiles Table
  - `idx_profiles_house_id` - Not being used by queries

  ## Benefits
  - Reduced storage usage
  - Faster write operations (INSERT, UPDATE, DELETE)
  - Improved database maintenance performance
  - Lower overall database overhead

  ## Note
  If these indexes become necessary in the future based on query patterns,
  they can be recreated as needed.
*/

-- Drop unused indexes on deals table
DROP INDEX IF EXISTS idx_deals_house_id;
DROP INDEX IF EXISTS idx_deals_to_member_id;
DROP INDEX IF EXISTS idx_deals_created_by;
DROP INDEX IF EXISTS idx_deals_from_member_id;

-- Drop unused indexes on attendance table
DROP INDEX IF EXISTS idx_attendance_marked_by;
DROP INDEX IF EXISTS idx_attendance_member_id;

-- Drop unused indexes on channel_posts table
DROP INDEX IF EXISTS idx_channel_posts_channel_id;
DROP INDEX IF EXISTS idx_channel_posts_user_id;

-- Drop unused indexes on core_deals table
DROP INDEX IF EXISTS idx_core_deals_creator_id;
DROP INDEX IF EXISTS idx_core_deals_house_id;

-- Drop unused indexes on core_house_members table
DROP INDEX IF EXISTS idx_core_house_members_house_id;

-- Drop unused indexes on core_i2we table
DROP INDEX IF EXISTS idx_core_i2we_house_id;
DROP INDEX IF EXISTS idx_core_i2we_member_1_id;
DROP INDEX IF EXISTS idx_core_i2we_member_2_id;

-- Drop unused indexes on core_links table
DROP INDEX IF EXISTS idx_core_links_from_user_id;
DROP INDEX IF EXISTS idx_core_links_house_id;
DROP INDEX IF EXISTS idx_core_links_to_user_id;

-- Drop unused indexes on deal_participants table
DROP INDEX IF EXISTS idx_deal_participants_user_id;

-- Drop unused indexes on houses table
DROP INDEX IF EXISTS idx_houses_created_by;

-- Drop unused indexes on i2we_events table
DROP INDEX IF EXISTS idx_i2we_events_created_by;
DROP INDEX IF EXISTS idx_i2we_events_member_id;

-- Drop unused indexes on links table
DROP INDEX IF EXISTS idx_links_created_by;
DROP INDEX IF EXISTS idx_links_from_member_id;
DROP INDEX IF EXISTS idx_links_house_id;
DROP INDEX IF EXISTS idx_links_to_member_id;

-- Drop unused indexes on members table
DROP INDEX IF EXISTS idx_members_house_id;
DROP INDEX IF EXISTS idx_members_profile_id;

-- Drop unused indexes on profiles table
DROP INDEX IF EXISTS idx_profiles_house_id;