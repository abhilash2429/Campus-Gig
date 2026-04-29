# Deploy Campus GIG (free tier): Vercel + Render

You get **no custom domain**: `https://<app>.vercel.app` and `https://<service>.onrender.com`.

## 0. Prerequisites

- Code pushed to **GitHub** (or GitLab / Bitbucket supported by both hosts).
- **MongoDB Atlas** M0 cluster + `MONGO_URI` connection string (Network Access: allow `0.0.0.0/0` for a demo).
- **Firebase** project (Auth + Storage), Admin SDK JSON for the server, web app config for the client.
- **Razorpay** test keys (`rzp_test_...`).

## 1. Render — API

1. [Render Dashboard](https://dashboard.render.com) → **New +** → **Blueprint** (connect repo) **or** **Web Service**.
2. If **Web Service** (manual):
   - **Root directory:** `server`
   - **Runtime:** Node
   - **Build command:** `npm install`
   - **Start command:** `npm start`
   - **Instance type:** Free
3. **Health check path:** `/api/health`
4. **Environment variables** (same names as `server/.env.example`):
   - `MONGO_URI`, ~~`PORT`~~ (Render sets `PORT` automatically — do not override)
   - `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY` (paste full key with `\n` for newlines, or use Render’s “secret file” pattern)
   - `RAZORPAY_KEY_ID`, `RAZORPAY_KEY_SECRET`
   - `SUPER_ADMIN_EMAIL`
   - Optional: `FIREBASE_STORAGE_BUCKET`

**First-time CORS (chicken and egg):**

- Do **not** set `NODE_ENV=production` until you have your Vercel URL.
- Leave `NODE_ENV` **unset** for the first deploy so the API starts with permissive CORS and you can sanity-check `/api/health`.
- After Vercel is live (step 2), set **`CLIENT_URL`** to your exact Vercel origin (example: `https://campus-gig.vercel.app`, no trailing slash) and set **`NODE_ENV=production`**, then **Manual Deploy** again.

5. Note your API URL: `https://<service-name>.onrender.com` → API base for the client is  
   **`https://<service-name>.onrender.com/api`**

**Free tier:** the service **spins down** after idle; the first request can take ~30–60s.

## 2. Vercel — frontend

1. [Vercel](https://vercel.com) → **Add New…** → **Project** → import the repo.
2. **Root Directory:** `client`
3. **Framework Preset:** Vite (auto-detected).
4. **Environment Variables** (Production) — must match `client/.env.example` but point API at Render:

   | Name | Value |
   |------|--------|
   | `VITE_API_BASE_URL` | `https://<service-name>.onrender.com/api` |
   | `VITE_FIREBASE_API_KEY` | from Firebase console |
   | `VITE_FIREBASE_AUTH_DOMAIN` | … |
   | `VITE_FIREBASE_PROJECT_ID` | … |
   | `VITE_FIREBASE_STORAGE_BUCKET` | … |
   | `VITE_FIREBASE_MESSAGING_SENDER_ID` | … |
   | `VITE_FIREBASE_APP_ID` | … |
   | `VITE_RAZORPAY_KEY_ID` | Razorpay **test** key id |

5. Deploy. Copy the site URL (e.g. `https://campus-gig-xxx.vercel.app`).

## 3. Lock CORS on Render

On Render → your service → **Environment**:

- `CLIENT_URL` = `https://<your-vercel-url>.vercel.app` (exact browser origin — copy from address bar, **no trailing slash**)
- `NODE_ENV` = `production`

**Super admin sign-in “network error”** is usually **CORS**: the tab’s URL must be allowed. If you use a **different** Vercel URL (e.g. preview: `your-app-git-main-xxx.vercel.app`) than the one in `CLIENT_URL`, the browser blocks `/auth/me` and Axios reports a network error.

Fix one of:

- Put the **exact** preview URL in `CLIENT_URL` (comma-separate multiple origins), **or**
- Set **`CORS_ALLOW_VERCEL=true`** on Render to allow any `https://*.vercel.app` (fine for demos; tighten for real production).

Also set **`SUPER_ADMIN_EMAIL`** on Render to the **same** email you use in Firebase (case-insensitive). Otherwise `/auth/me` returns 404 after Firebase login (not a network error, but confusing).

Save → **Manual Deploy** → **Clear build cache & deploy** (optional if only env changed).

## 4. Firebase Auth — authorized domains

Firebase Console → **Authentication** → **Settings** → **Authorized domains** → add:

- `localhost` (dev)
- `<your-project>.vercel.app` (your production preview domain; Vercel may also show a `*.vercel.app` pattern — add the exact host Vercel shows in the browser)

## 5. Smoke test

- Open `https://<service>.onrender.com/api/health` → `{"status":"ok",...}`
- Open Vercel URL → register / login → network tab: API calls go to Render, not `localhost`.

## 6. Render exits with status 1 (startup crash)

This app **does not use `JWT_SECRET`** (auth is Firebase). Ignore guides that mention it.

**Check Render logs** for lines starting with `[campus-gig-api]` — they name the fix.

Common causes:

| Symptom | Fix |
|--------|-----|
| `CLIENT_URL is required when NODE_ENV=production` | Set `CLIENT_URL` to your exact Vercel `https://….vercel.app`, or unset `NODE_ENV` until Vercel exists. |
| `Missing required environment variable: …` | Add **every** key from `server/.env.example` in Render → **Environment** (not the `.env` file upload). |
| `MongoDB connection failed` / `Server selection timed out` | Atlas → **Network Access** → allow **`0.0.0.0/0`** for demo (Render uses random IPs). |
| `Firebase Admin failed to initialize` | `FIREBASE_PRIVATE_KEY` must include newlines as **`\n`** in the env string (same as local `.env` with quoted PEM). |
| Browser “network error” after Firebase login | Almost always **CORS**: `CLIENT_URL` on Render must **exactly** match the tab’s origin. Previews → `CORS_ALLOW_VERCEL=true` or list each URL in `CLIENT_URL`. |
| Super admin stuck after login | Set **`SUPER_ADMIN_EMAIL`** on Render to match the Firebase login email. Check **Network** tab: 404 on `/auth/me` means Mongo/bootstrap mismatch, not CORS. |
| Wrong port | Do **not** set `PORT` in Render; Render injects it. Code uses `process.env.PORT \|\| 5000` and binds **`0.0.0.0`**. |

## Repo files

- `render.yaml` — optional Render **Blueprint** (same env vars; still enter secrets in dashboard).
- `client/vercel.json` — SPA fallback so React Router routes don’t 404 on refresh.
