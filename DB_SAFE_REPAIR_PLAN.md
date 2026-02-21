# DB Safe Repair Plan (Non-Destructive)

This plan is designed to **avoid destructive changes** and fix migration drift safely.

## Current Situation

- Remote migration history contains versions that are not in local repo.
- Local repo contains pending versions not recorded in remote history.
- Two tables required by admin services are missing remotely:
  - `approval_requests`
  - `attendance_records`

A safe additive migration is prepared:

- `supabase/migrations/20260221123000_add_admin_approval_and_attendance_tables.sql`

## Safety Rules

1. Do not run `DROP TABLE`, `TRUNCATE`, or `db reset`.
2. Start with dry-run and status commands only.
3. Repair migration history first, then push additive migrations.
4. Validate table existence immediately after push.

## Step 1: Read-only checks

```powershell
npx supabase migration list
npx supabase db push --dry-run
```

## Step 2: Repair migration history (metadata-only)

If `db push --dry-run` shows remote versions not found locally, mark those remote-only versions as reverted in migration history (this updates migration metadata, not business tables):

```powershell
npx supabase migration repair --status reverted 20260205090033 20260205090048 20260205090321 20260205090520 20260205092029 20260205092149 20260205092211 20260205092243 20260205092523 20260210094450 20260210100046 20260210101413
```

Then mark local-but-already-existing schema migrations as applied (metadata-only):

```powershell
npx supabase migration repair --status applied 20260216000000 20260216135033 20260218
```

## Step 3: Re-check dry-run

```powershell
npx supabase db push --dry-run
```

Expected: only truly new local migration(s), including:

- `20260221123000_add_admin_approval_and_attendance_tables.sql`

## Step 4: Apply additive migration

```powershell
npx supabase db push
```

This should create only missing objects with `IF NOT EXISTS` and additive constraints/indexes.

## Step 5: Post-apply validation

```powershell
npx supabase migration list
```

And API-level table existence checks:

```powershell
node -e "require('dotenv').config(); const { createClient } = require('@supabase/supabase-js'); const s = createClient(process.env.EXPO_PUBLIC_SUPABASE_URL, process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY); (async () => { const tables=['approval_requests','attendance_records','notifications','push_tokens','notification_preferences','knowledge_base']; for (const t of tables){ const { error } = await s.from(t).select('*').limit(0); console.log(t, '=>', error ? error.message : 'OK'); } })();"
```

## Notes

- `supabase db pull` and `supabase db dump` may fail in your current environment due missing Docker Desktop. This does not block linked remote migration push/repair commands.
- The new migration intentionally does not disable/alter RLS on existing tables to avoid destabilizing current behavior.
