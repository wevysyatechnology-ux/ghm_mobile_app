# WeVysya Project Structure

This repository contains both the WeVysya mobile app and the GHM (Global House Management) admin portal.

## Overview

- **Mobile App**: Built with Expo and React Native for iOS, Android, and Web
- **GHM Portal**: Built with React, TypeScript, and Vite for admin management

Both applications share the same Supabase backend.

## Directory Structure

```
project/
├── app/                          # Mobile app screens (Expo Router)
│   ├── (tabs)/                   # Tab-based navigation
│   │   ├── index.tsx            # Home feed
│   │   ├── discover.tsx         # Discover members
│   │   ├── activity.tsx         # Activity feed
│   │   └── profile.tsx          # User profile with attendance status
│   ├── auth/                    # Authentication screens
│   ├── *.tsx                    # Other app screens
│   └── _layout.tsx              # Root layout
│
├── components/                   # Mobile app components
│   ├── ai/                      # AI-related components
│   ├── profile/                 # Profile components
│   │   └── AttendanceStatusBanner.tsx  # Shows attendance status
│   ├── channels/                # Channel components
│   ├── discover/                # Discovery components
│   └── shared/                  # Shared components
│
├── contexts/                     # Mobile app contexts
│   ├── AuthContext.tsx          # Authentication state
│   └── AIContext.tsx            # AI state
│
├── services/                     # Mobile app API services
│   ├── authService.ts
│   ├── channelsService.ts
│   ├── dealsService.ts
│   └── ...
│
├── types/                        # TypeScript type definitions
│   ├── database.ts              # Database types (shared)
│   └── index.ts
│
├── ghm/                         # GHM Admin Portal
│   ├── src/
│   │   ├── components/
│   │   │   ├── Layout.tsx       # Main layout with sidebar
│   │   │   ├── LoadingScreen.tsx
│   │   │   └── AccessDenied.tsx
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx
│   │   │   ├── MembersPage.tsx
│   │   │   ├── HousesPage.tsx
│   │   │   ├── AttendancePage.tsx
│   │   │   └── ApprovalsPage.tsx
│   │   ├── services/
│   │   │   ├── authService.ts
│   │   │   ├── dashboardService.ts
│   │   │   ├── membersService.ts
│   │   │   ├── housesService.ts
│   │   │   ├── attendanceService.ts
│   │   │   ├── approvalsService.ts
│   │   │   └── supabase.ts
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx
│   │   ├── types/
│   │   │   └── database.ts
│   │   ├── styles/
│   │   │   └── global.css
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.ts
│   └── README.md
│
├── supabase/
│   └── migrations/
│       ├── 20251221074110_create_wevysya_tables.sql
│       ├── 20251221084027_create_channels_table.sql
│       ├── 20251221095249_create_wevysya_tables.sql
│       ├── 20251221095256_create_channels_table.sql
│       ├── 20251221100731_update_links_deals_i2we_with_house_restrictions.sql
│       └── 20251229000001_add_ghm_admin_features.sql
│
├── .env                         # Shared environment variables
├── package.json                 # Mobile app dependencies
└── PROJECT_STRUCTURE.md         # This file
```

## Key Features

### Mobile App
- AI-powered conversational interface
- Member discovery and networking
- Channels for different verticals
- Links, Deals, and I2WE meetings
- Attendance status display for Inner Circle members

### GHM Portal
- Dashboard with metrics
- Member management
- House management
- Attendance tracking with automatic status updates
- Approval workflows
- Audit logging

## Database Schema

### Core Tables
- `users_profile`: User information and attendance status
- `core_houses`: House information
- `core_house_members`: House membership
- `core_memberships`: Regular/Privileged memberships
- `virtual_memberships`: Virtual memberships
- `core_links`: Member connections (house-specific)
- `core_deals`: Business deals (house or network-wide)
- `core_i2we`: One-on-one meetings (house-specific)
- `channels`: Content channels
- `channel_posts`: Channel content

### GHM Tables
- `attendance_records`: Weekly attendance tracking
- `approval_requests`: Approval workflows
- `audit_logs`: Audit trail

## Setup

### Mobile App
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

### GHM Portal
```bash
# Navigate to GHM directory
cd ghm

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Add Supabase credentials to .env

# Start development server
npm run dev
```

## Environment Variables

Both apps use the same Supabase instance. Create a `.env` file in the root:

```
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

For the GHM portal, create `ghm/.env`:

```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Database Migrations

Apply all migrations in order:

1. Create core tables and channels
2. Update links, deals, i2we with house restrictions
3. Add GHM admin features (attendance, approvals, audit)

Use Supabase CLI or dashboard to apply migrations from `supabase/migrations/`.

## Design System

Both apps share the same dark-mode design system:

- **Base background**: #0B0F0E
- **Secondary backgrounds**: #0F1F1A, #111615
- **Text colors**: #EDEDED, #A1A5A4, #6E7372
- **Primary accent**: #2AFF6A
- **Secondary accent**: #1ED760
- **Danger**: #FF4D4D

## Security

- Row Level Security (RLS) enabled on all tables
- Admin roles enforced for GHM portal access
- Mobile app shows private attendance status (no public shaming)
- All sensitive operations logged in audit_logs

## Development Notes

- Mobile app uses Expo Router for file-based routing
- GHM portal uses React Router for routing
- Both share TypeScript types for consistency
- Database operations use Supabase client with RLS
- Attendance status updates automatically via database triggers
