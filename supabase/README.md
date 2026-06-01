# Supabase backend (optional)

The AI Tailor feature runs **fully local by default** — it calls your chosen AI
provider (Anthropic or OpenRouter) directly from the browser with a key you
paste into **AI Settings**, and your reference CV is stored in the browser
(IndexedDB). No backend required.

This folder is the **optional** Supabase setup for when you want to keep your AI
key server-side instead of in the browser. The app already has the client code
for it — you just flip **AI Settings → Backend → Supabase proxy** and fill in the
project URL + anon key.

## What's here

- `migrations/0001_cv_tailor.sql` — tables for the reference CV (`cv_profiles`)
  and saved analyses (`tailor_sessions`). RLS is on with **no public policies**,
  so only the Edge Function (service-role) can touch them.
- `functions/cv-ai/index.ts` — an Edge Function that proxies the AI request so
  the provider key stays on the server. Its request/response shape matches the
  browser-direct client in `site/src/utils/ai/index.ts`.

## Setup

1. Create a project (or reuse one) and apply the migration:

   ```bash
   supabase link --project-ref <your-ref>
   supabase db push
   ```

2. Set the provider key(s) and (optionally) a shared access code as secrets:

   ```bash
   supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
   supabase secrets set OPENROUTER_API_KEY=sk-or-...   # if using OpenRouter
   supabase secrets set APP_ACCESS_CODE=some-long-random-string   # optional gate
   ```

3. Deploy the function (public endpoint guarded by the access code):

   ```bash
   supabase functions deploy cv-ai --no-verify-jwt
   ```

4. In the app, open **AI Settings**, switch **Backend** to **Supabase proxy**,
   and enter your **project URL**, **anon key**, and the **access code** (if set).

> The function currently implements the `complete` action (AI proxy). Storing
> the reference CV in `cv_profiles` / `tailor_sessions` is scaffolded in the
> schema for a future iteration; the app stores the reference CV locally today.
