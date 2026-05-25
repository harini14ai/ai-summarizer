# TODO — Production auth end-to-end debugging

## Step 1 — Tighten production URL handling (frontend) ✅
- Edit `client/src/services/api.js` to fail fast if `VITE_API_URL` is missing in production builds (instead of silently falling back to `/api`).

## Step 2 — Add backend auth debug endpoint ✅
- Add `GET /api/auth/test` to verify env + Mongo connectivity and JWT secret presence.
- Wire it in `server/src/routes/authRoutes.js`.

## Step 3 — Harden CORS behavior ✅ (logging scaffolding)
- Edit `server/src/server.js` to add production troubleshooting scaffolding.

## Step 4 — Improve auth controller logging (no secrets) ✅
- Edit `server/src/controllers/authController.js` to log env presence and login validation issues.

## Step 5 — Verify end-to-end ⏳
- Use production `/api/health` and `/api/auth/test`.
- Confirm `POST /api/auth/login` returns correct status.
- Confirm JWT saved in localStorage.
- Confirm protected route access.

## Step 6 — Update graceful error messaging (optional)
- If needed, adjust `client/src/pages/LoginPage.jsx` to display CORS/network errors more accurately.


