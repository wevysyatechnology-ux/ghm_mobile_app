# Supabase CLI Setup (Windows + VS Code)

This project already has Supabase migrations in `supabase/migrations` and uses project ref:

- `vlwppdpodavowfnyhtkh`

Use this guide to connect CLI, run migrations, and fetch DB info.

## 1) Authenticate CLI

```powershell
npx supabase login --no-browser
```

- Open the login URL shown in terminal
- Copy the verification code
- Paste code back into terminal

You can also log in with token directly:

```powershell
npx supabase login --token "<your_supabase_access_token>"
```

## 2) Link this repo to remote project

```powershell
npm run supabase:link
```

When prompted, enter your **database password** (Project Settings → Database).

## 3) Run migrations from CLI

```powershell
npm run db:push
```

This applies SQL files in `supabase/migrations` to the linked remote database.

## 4) Fetch DB information for debugging

```powershell
npm run db:dump:schema
npm run db:types
npm run db:diff
npm run db:lint
```

Outputs:
- `supabase/schema.sql` → current remote public schema snapshot
- `types/database.types.ts` → generated TypeScript DB types

## 5) Useful troubleshooting

### Verify auth

```powershell
npx supabase projects list
```

### Verify link

```powershell
npx supabase link --project-ref vlwppdpodavowfnyhtkh
```

### If Docker error appears on `supabase status`

That command checks local containers. It is **not required** for remote migration work.
Use linked commands (`db push`, `db dump`, `db diff`) instead.
