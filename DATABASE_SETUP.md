# Wevysya Database Setup Guide

Your Supabase database connection is configured and ready. Now you need to create the database tables by running the migration files.

## Quick Setup Steps

### 1. Open Supabase SQL Editor

Visit your Supabase dashboard:
```
https://vlwppdpodavowfnyhtkh.supabase.co
```

Navigate to: **SQL Editor** (in the left sidebar)

### 2. Run Migrations in Order

Copy and paste each migration file's contents into the SQL Editor and click **RUN** for each one:

#### Migration 1: Create Core Tables
**File:** `supabase/migrations/20251221095249_create_wevysya_tables.sql`

This creates:
- `users_profile` - User profiles and information
- `core_memberships` - Inner Circle memberships
- `virtual_memberships` - Open Circle memberships
- `core_houses` - Physical meeting locations
- `core_house_members` - House membership mappings
- `core_links` - Business connections
- `core_deals` - Deal tracking
- `core_i2we` - One-on-one meetings

#### Migration 2: Create Channels System
**File:** `supabase/migrations/20251221095256_create_channels_table.sql`

This creates:
- `channels` - Discussion channels (Jobs, Links, Events, etc.)
- `channel_posts` - Posts within channels

And populates default channels:
- 12we Meetings
- Links
- Visitors
- Jobs
- Opportunities
- Asks
- Deals
- Events

#### Migration 3: Add House Restrictions
**File:** `supabase/migrations/20251221100731_update_links_deals_i2we_with_house_restrictions.sql`

This updates:
- `core_links` - Adds house validation and contact fields
- `core_deals` - Restructures for house/network deals
- `deal_participants` - NEW table for deal participation
- `core_i2we` - Adds house restriction

## Database Schema Overview

### User Management
- **users_profile**: Extended user profiles with attendance tracking
  - Tracks attendance status (normal, probation, category_open, removal_eligible)
  - Monitors absence count and suspension status

- **core_memberships**: Inner Circle (Core) membership
  - Types: regular (annual) or privileged (lifetime)
  - Status tracking: active, expired, suspended

- **virtual_memberships**: Open Circle membership
  - All have expiry dates
  - Limited access to platform features

### House System
- **core_houses**: Physical meeting locations
- **core_house_members**: User-house relationships

### Collaboration Tools
- **core_links**: Business referrals (house-restricted)
  - Include contact details and urgency ratings
  - Can only be sent to same-house members

- **core_deals**: Opportunities and deals
  - **House Deals**: Internal to house members
  - **WeVysya Deals**: Open to all members

- **deal_participants**: Track who joins deals

- **core_i2we**: One-on-one meetings (house-restricted)

### Social Features
- **channels**: Discussion channels by category
- **channel_posts**: User-generated content in channels

## Security (Row Level Security)

All tables have RLS enabled with policies that:
- Users can only access their own profile data
- House members can only see their house's data
- Links and I2WE meetings restricted to same-house members
- WeVysya deals visible to all, house deals restricted
- Proper authentication checks on all operations

## Verification

After running all migrations, verify the setup by running:

```bash
npx tsx scripts/init-database.ts
```

You should see all tables marked with ✅

## Need Help?

If you encounter any errors:
1. Make sure you're logged into Supabase dashboard
2. Check that all three migrations ran successfully
3. Look for error messages in the SQL Editor output
4. Try running migrations one at a time

---

**Next Steps**: Once your database is set up, your app will be fully functional and ready to use!
