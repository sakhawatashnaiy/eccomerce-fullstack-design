# Full Stack Ecommerce (Firebase + Cloudinary + Vite)

A full-stack ecommerce app with:
- **Frontend**: React (Vite) + Redux Toolkit Query + Tailwind
- **Backend**: Node.js + Express
- **Auth/DB**: Firebase (client SDK on frontend + Admin SDK on backend)
- **Images**: Cloudinary (product image hosting)

This repo is split into two apps: `frontend/` and `backend/`.

---

## Folder Structure (quick)

- `backend/` — Express API (`/api/v1/*`), Firebase Admin, Cloudinary upload helper
- `frontend/` — React UI + RTK Query API client + Firebase client auth

---

## Prerequisites

- Node.js 18+ (recommended)
- A Firebase project
- A Cloudinary account

---

## Environment Variables

### Backend (`backend/.env`)

Required:

```bash
# Server
PORT=5000
NODE_ENV=development

# Firebase Admin (choose ONE option)
# Option A (recommended): full service account JSON as a single line
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"...",...}

# Option B: split fields (useful on hosts that don’t like JSON)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_PRIVATE_KEY_ID=...  # optional

# Admin allowlist (either one is fine)
ADMIN_UIDS=uid1,uid2
ADMIN_EMAILS=admin@example.com

# Cloudinary
CLOUDINARY_CLOUD_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_API_SECRET=...
```

Notes:
- `FIREBASE_PRIVATE_KEY` supports escaped newlines (`\n`).
- Admin allowlist supports commas (e.g. `uid1,uid2`).

### Frontend (`frontend/.env`)

Required (Firebase client):

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_APP_ID=...
```

Optional:

```bash
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...

# API base URL (IMPORTANT)
# Must point to the backend base, WITHOUT /products at the end.
VITE_API_URL=http://localhost:5000/api/v1
```

---

## Install & Run (Local)

### 1) Backend

```bash
cd backend
npm install
npm run dev
```

Health check:
- `GET http://localhost:5000/health`

### 2) Frontend

```bash
cd frontend
npm install
npm run dev
```

Open the URL shown by Vite (usually `http://localhost:5173`).

---

## API Overview

Base path:
- `http://localhost:5000/api/v1`

Key routes:
- `GET /products` — list products (supports `?search=`, `?category=`, `?featured=true`, `?limit=`)
- `POST /products` — create product (admin)
- `PUT /products/:id` — update product (admin)
- `DELETE /products/:id` — delete product (admin)
- `POST /products/seed` — seed sample products (admin)

---

## Product Images (Cloudinary)

### How images work in this project

- The admin UI reads an image file, converts it to a base64 **data URL**, then sends it in the product payload as `image`.
- The backend detects `data:image/...;base64,...` and uploads it to Cloudinary.
- The backend stores the returned Cloudinary URL in Firestore.

### “Cloudinary se data aane mein late hota hai” (slow upload) — what to check

1) **Image size**
- Big phone images (5–15MB) become even larger in base64.
- The admin page now **auto-resizes + compresses** images before sending (faster request + faster Cloudinary upload).

2) **Backend request body limit**
- Backend JSON limit is set to `20mb`. If you still hit payload issues, upload smaller images.

3) **Cloudinary credentials**
- Make sure `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` are set.

4) **Network / Cloudinary latency**
- Uploads depend on your internet speed.
- The backend has a **hard timeout** (default ~60s). If Cloudinary is slow/unreachable, the request returns a timeout error instead of hanging.

---

## Seeding Sample Products

Backend script:

```bash
cd backend
npm run seed:products
```

Or via API (admin only):
- `POST /api/v1/products/seed`

---

## Common Troubleshooting

### Products are not loading

- Ensure `VITE_API_URL` is set correctly:
  - ✅ `http://localhost:5000/api/v1`
  - ❌ `http://localhost:5000/api/v1/products` (this causes `/products/products` calls)

### Firebase Admin auth errors

- Double-check your service account values.
- If using `FIREBASE_PRIVATE_KEY`, ensure newlines are escaped as `\n`.

---

## Scripts

Backend:
- `npm run dev` — run with nodemon
- `npm start` — run with node

Frontend:
- `npm run dev` — Vite dev server
- `npm run build` — production build
- `npm run preview` — preview build
