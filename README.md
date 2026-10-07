# Kinship Family Management System — Phase 1

A family workspace with household-scoped accounts, role-based access, private and shared diary entries, profiles, and admin-managed family alerts.

## Requirements

- Node.js 20 or newer
- PostgreSQL 14 or newer

## Local setup

1. Create a PostgreSQL database named `family_management` (or use another database and update the connection string).
2. In `backend`, copy `.env.example` to `.env`, set `DATABASE_URL`, and replace `JWT_SECRET` with a randomly generated secret of at least 32 characters.
3. Run `npm install` and `npm run db:setup` from `backend`, then start the API with `npm run dev`.
4. In `frontend`, copy `.env.example` to `.env`, run `npm install`, then start Vite with `npm run dev`.
5. Open `http://localhost:5173`. The first person to create a household becomes its admin; family members join using the invite code shown in their profile.

The first registration creates the initial household, so no default accounts or sample passwords are inserted into the database.

## API overview

- `POST /api/auth/register`, `POST /api/auth/login`
- `GET /api/dashboard`
- `GET|POST /api/diary`, `PUT|DELETE /api/diary/:id`
- `GET|PUT /api/users/me`, `GET /api/users`, `PATCH /api/users/:id/role`
- `GET|POST /api/alerts`, `PATCH /api/alerts/:id/resolve`
- `GET /api/health`

All protected routes require a bearer token. Diary entries are visible to their author; entries marked shared are additionally visible to members of that author's household. Only admins can create or resolve family alerts and change another household member's role. Role and household membership are read from PostgreSQL on authenticated requests.

## Production notes

Use HTTPS, a managed secret store for `JWT_SECRET`, a least-privilege PostgreSQL account, automated backups, and a restrictive `FRONTEND_ORIGIN`. Set `DB_SSL=true` when connecting to a PostgreSQL server with a trusted TLS certificate. Browser tokens are stored in `localStorage` as allowed by the Phase 1 requirements; deploy a strong Content Security Policy and prevent script injection.
