# Personal OS — Phase 0 Setup

**Status as of 2026-05-12:**
- ✅ Supabase project live: `tymghjilkvjsjyrdngqk` (eu-west-1)
- ✅ Schema applied (7 tables, RLS enabled)
- ⏳ Anthropic + OpenAI keys — waiting on AI engineer (not needed for heartbeat)
- ⏳ GitHub + Vercel + Slack — do these tonight (steps below)

Heartbeat only needs Supabase + Slack. The Anthropic/OpenAI keys are for Phase 1+. So you can fully verify Phase 0 tonight if you push through.

---

## Step 1 — Get the Supabase credentials

Go to https://supabase.com/dashboard/project/tymghjilkvjsjyrdngqk/settings/api

Copy two values, you'll paste them into Vercel later:
- **Project URL** → this is `SUPABASE_URL` (looks like `https://tymghjilkvjsjyrdngqk.supabase.co`)
- **service_role** secret (NOT anon!) → this is `SUPABASE_SERVICE_ROLE_KEY`

⚠️ The `service_role` key bypasses RLS. Never commit it. Only paste into Vercel.

---

## Step 2 — Push to GitHub

Open PowerShell in `c:\Users\Matteo\Documents\Claude\Projects\Personal OS\app`:

```powershell
cd "c:\Users\Matteo\Documents\Claude\Projects\Personal OS\app"
git init
git add .
git commit -m "Phase 0 scaffold"
```

Then either:

**Option A — via `gh` CLI (if installed):**
```powershell
gh repo create matteo-personal-os --private --source=. --push
```

**Option B — manual:**
1. Go to https://github.com/new
2. Name: `matteo-personal-os`, Private, do NOT initialize with README
3. Then:
```powershell
git remote add origin https://github.com/YOUR_USERNAME/matteo-personal-os.git
git branch -M main
git push -u origin main
```

---

## Step 3 — Link & deploy to Vercel

```powershell
npm install -g vercel
vercel login
vercel link
```
When prompted: link to existing project? **N**. Create new, name `matteo-personal-os`, link to the GitHub repo you just pushed.

Deploy a preview first (no env vars yet, won't run heartbeat properly — that's fine, we want the URL):
```powershell
vercel deploy
```

Note the production domain (looks like `matteo-personal-os.vercel.app`). You'll need it for the next step.

---

## Step 4 — Create the Slack app

1. Open https://api.slack.com/apps → **Create New App** → **From a manifest** → pick your workspace
2. Open `slack-manifest.yml` in the `app/` folder. Replace all 3 occurrences of `REPLACE_WITH_VERCEL_DOMAIN` with your Vercel domain (no `https://`, e.g., `matteo-personal-os.vercel.app`)
3. Paste the edited manifest. Confirm.
4. **Install to Workspace**. Approve.
5. **OAuth & Permissions** → copy **Bot User OAuth Token** (`xoxb-...`) → that's `SLACK_BOT_TOKEN`
6. **Basic Information** → **App Credentials** → copy **Signing Secret** → that's `SLACK_SIGNING_SECRET`
7. In Slack, open a DM with "Personal OS" bot, say "hi" (this materializes the DM channel)
8. Get the DM channel ID:
   - Open Slack in browser (not desktop app)
   - Open the DM with the bot
   - URL contains `/D0XXXXXXXXX/` — that's the channel ID, starts with `D`
   - That's `SLACK_MATTEO_DM_CHANNEL`

---

## Step 5 — Generate CRON_SECRET

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```
Copy the output. That's `CRON_SECRET`.

---

## Step 6 — Add env vars to Vercel

```powershell
vercel env add SUPABASE_URL production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
vercel env add SLACK_BOT_TOKEN production
vercel env add SLACK_SIGNING_SECRET production
vercel env add SLACK_MATTEO_DM_CHANNEL production
vercel env add CRON_SECRET production
```

Each command prompts for the value — paste it.

For now, set placeholders for the ones blocked on your AI engineer (the heartbeat doesn't use them, but the lib clients validate them at boot):
```powershell
vercel env add ANTHROPIC_API_KEY production
# paste: pending-from-ai-engineer
vercel env add OPENAI_API_KEY production
# paste: pending-from-ai-engineer
```

When you get the real keys tomorrow:
```powershell
vercel env rm ANTHROPIC_API_KEY production
vercel env add ANTHROPIC_API_KEY production
# paste the real key
vercel deploy --prod
```

---

## Step 7 — Production deploy

```powershell
vercel deploy --prod
```

---

## Step 8 — Verify cron registered

Vercel dashboard → your project → Settings → Cron Jobs.
You should see `/api/cron/heartbeat` scheduled at `0 6 * * *`.

---

## Step 9 — Manually trigger the heartbeat

From the Vercel Cron Jobs page, click **Run** next to the heartbeat row.

Or from PowerShell:
```powershell
$secret = "YOUR_CRON_SECRET"
$domain = "matteo-personal-os.vercel.app"
curl.exe -H "Authorization: Bearer $secret" "https://$domain/api/cron/heartbeat"
```

**Confirm:**
1. Slack DM receives `Personal OS alive — [timestamp]`
2. In Supabase SQL editor: `select * from eval_scores;` shows one row with `workflow = 'heartbeat'`

If both ✅ → **Phase 0 complete.** Wait for tomorrow 06:00 UTC for the auto-fire.

---

## Troubleshooting

| Symptom | Likely cause |
|---|---|
| 401 on curl test | `CRON_SECRET` mismatch between your local copy and Vercel env |
| Slack message doesn't post | Bot isn't a member of the DM channel; or `SLACK_MATTEO_DM_CHANNEL` is wrong. Open the DM in Slack first |
| DB insert fails | Migration didn't run (check Supabase Table Editor for 7 tables); or you copied the anon key instead of service_role |
| `Cannot find module '@anthropic-ai/sdk'` | Run `npm install` in `app/` |
| Vercel build fails on `lib/anthropic.ts` import | Boot validation throws on placeholder key; for Phase 0 only, just put any non-empty string in `ANTHROPIC_API_KEY` |
