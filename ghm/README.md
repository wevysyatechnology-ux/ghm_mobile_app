# WeVysya GHM (Global House Management Portal)

Admin-only web portal for managing WeVysya operations, built with React, TypeScript, and Vite.

## Features

- **Dashboard**: Overview metrics for members, houses, attendance, and memberships
- **Members Management**: View and manage all WeVysya members
- **Houses Management**: Create and manage houses with member assignments
- **Attendance Management**: Track attendance with automatic status updates
- **Approvals**: Review and process approval requests
- **Audit Logging**: Complete audit trail of all admin actions

## Tech Stack

- React 18
- TypeScript
- Vite
- React Router
- Supabase (Auth & Database)

## Setup

1. Navigate to the GHM directory:
```bash
cd ghm
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```

4. Add your Supabase credentials to `.env`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. Apply the database migration:

The migration file is located at: `../supabase/migrations/20251229000001_add_ghm_admin_features.sql`

You can apply it using the Supabase CLI or dashboard.

## Development

Start the development server:
```bash
npm run dev
```

The portal will be available at `http://localhost:3001`

## Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Access Control

Only users with the following admin roles can access the GHM portal:

- global_president
- global_vice_president
- global_support
- state_president
- zonal_president
- house_president
- secretary
- treasurer
- manager
- accounts_assistant
- membership_committee_chairman

## Attendance Policy

The system automatically enforces the following attendance policy for Inner Circle members:

- **1st & 2nd Absence**: No action
- **3rd Absence**: Status changes to "Probation"
- **4th Absence**: Status changes to "Category Opened" (auto-generates approval request)
- **5th Absence**: Status changes to "Removal Eligible" (auto-generates approval request)

## Mobile App Integration

Attendance status automatically reflects in the mobile app:
- Members see a banner when on Probation, Category Open, or Removal Eligible
- Status is private and only visible to the member
- No public shaming

## Database Structure

### New Tables

- **attendance_records**: Weekly attendance tracking
- **approval_requests**: Approval workflow management
- **audit_logs**: Complete audit trail

### Modified Tables

- **users_profile**: Added `admin_role`, `attendance_status`, `absence_count`, `is_suspended`

## Security

- Row Level Security (RLS) enabled on all tables
- Admin-only access enforced at database and application level
- All actions logged in audit_logs table
- Secure authentication via Supabase Auth

## Design System

Matches the WeVysya mobile app design:

- **Dark mode only**
- **Background colors**: #0B0F0E, #0F1F1A, #111615
- **Text colors**: #EDEDED, #A1A5A4, #6E7372
- **Accent colors**: #2AFF6A (primary), #1ED760 (secondary), #6FE8B0 (soft mint)
- **Danger color**: #FF4D4D
- **Clean, professional UI** with subtle gradients
