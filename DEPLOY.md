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

- `CLIENT_URL` = `https://<your-vercel-url>.vercel.app` (exact browser origin)
- `NODE_ENV` = `production`

Save → **Manual Deploy** → **Clear build cache & deploy** (optional if only env changed).

## 4. Firebase Auth — authorized domains

Firebase Console → **Authentication** → **Settings** → **Authorized domains** → add:

- `localhost` (dev)
- `<your-project>.vercel.app` (your production preview domain; Vercel may also show a `*.vercel.app` pattern — add the exact host Vercel shows in the browser)

## 5. Smoke test

- Open `https://<service>.onrender.com/api/health` → `{"status":"ok",...}`
- Open Vercel URL → register / login → network tab: API calls go to Render, not `localhost`.

## Repo files

- `render.yaml` — optional Render **Blueprint** (same env vars; still enter secrets in dashboard).
- `client/vercel.json` — SPA fallback so React Router routes don’t 404 on refresh.
