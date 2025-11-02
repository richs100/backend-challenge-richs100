# Copilot instructions for this repository

This file contains concise, actionable guidance for AI-assisted coding in this Next.js frontend. Follow these notes to be immediately productive and to avoid introducing behavior regressions.

1) Project overview (big picture)
- This is a Next.js 14 application using the App Router (`/app`) with server and client components.
- The main UI is in `app/page.tsx` (client component) and global layout is `app/layout.tsx` (server component).
- Authentication is handled locally with `next-auth` via the route `app/api/auth/[...nextauth]/route.ts` (CredentialsProvider). JWT encoding/decoding uses HS512.
- The frontend proxies requests to an external backend API via `app/api/ask/route.ts`. That route calls `${process.env.BACKEND_API_URL}/ask` and forwards a bearer token obtained via `getToken(..., raw: true)`.

2) Important files to reference (use these as examples)
- `app/page.tsx` — client-side UI: uses `use client`, React state, MUI components, and calls `fetch('/api/ask', { method: 'POST', body: JSON.stringify({ question, history, filepath? }) })`.
- `app/layout.tsx` — global layout and font setup (next/font/google). Server component.
- `app/api/ask/route.ts` — server-side proxy: checks `getToken` using `NEXTAUTH_SECRET`, requires `BACKEND_API_URL` env var, forwards Authorization header.
- `app/api/auth/[...nextauth]/route.ts` — next-auth config (CredentialsProvider) and custom JWT encode/decode using `jsonwebtoken`.
- `.vscode/launch.json` — useful debug tasks: `Run Script: dev` runs `npm run dev`; Chrome config available for attaching to `http://localhost:3000`.

3) Key environment variables
- NEXTAUTH_SECRET — required for next-auth and for `getToken` in the ask proxy.
- BACKEND_API_URL — the backend service the `/api/ask` endpoint forwards to.

4) How to run & debug (developer workflows)
- Install and run locally (Windows PowerShell):
```powershell
npm install
npm run dev
```
- To debug in VS Code, use the `.vscode/launch.json` entries: use "Run Script: dev" to start the dev server or the Chrome launch config to open `http://localhost:3000`.
- API endpoints are at `http://localhost:3000/api/*` during development (e.g. POST `/api/ask`).

5) Project-specific patterns and gotchas
- Server vs client: components in `app/` default to server components. Files with `"use client"` (like `app/page.tsx`) are client components — changes that affect runtime/browser code must live in client files.
- Auth token flow: The ask proxy calls `getToken({ req: request, secret: process.env.NEXTAUTH_SECRET, raw: true })` and forwards that raw token as `Authorization: Bearer <token>` to the backend. Do not replace this with session object parsing—keep the raw token behavior.
- JWT handling: `app/api/auth/[...nextauth]/route.ts` overrides `jwt.encode`/`jwt.decode` to use HS512 via `jsonwebtoken`. Any change to token format must preserve algorithm/compatibility with backend expectations.
- File upload: `app/page.tsx` includes a file input but does not actually upload files yet (placeholder path `placeholder`). If implementing uploads, update both the client and the `ask` server proxy to accept and forward file references or multipart payloads.
- Styling/UI: The app uses MUI v7 and `@mui/material` with `@emotion` for styling. Keep MUI imports and theming consistent with existing patterns.

6) Testing and linting
- Linting: `npm run lint` runs `next lint` (ESLint). There are no automated tests present in the repo—add focused unit tests for any new server logic.

7) Small change safety checklist (before creating PR)
- If changing auth or tokens: verify `NEXTAUTH_SECRET` behavior and confirm backend accepts the token format (HS512).
- If changing API routes: ensure `app/api/ask/route.ts` still guards requests with `getToken` and returns appropriate 401/500 codes on missing env or auth.
- If adding uploads: do not break the existing POST body contract expected by the backend (the current frontend sends `{ question, history, filepath }`).

8) Example snippets (from this repo)
- Client asks backend via local proxy (see `app/page.tsx`):
  - POST `/api/ask` with JSON body: `{ question, history, filepath? }`.
- Proxy implementation (see `app/api/ask/route.ts`):
  - Reads token: `getToken({ req: request, secret: process.env.NEXTAUTH_SECRET, raw: true })`
  - Forwards to backend: `fetch(`${BACKEND_API_URL}/ask`, { method: 'POST', headers: { 'Content-Type':'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({question, history}) })`

9) When to ask the repo owner
- If you need to change token algorithm / secret handling — confirm with the backend owner whether HS512 must be preserved.
- If adding persistent storage or file uploads — ask where files should be stored and whether backend expects multipart form-data or a file URL.

If anything above is unclear or you want this file expanded with more examples (cURL snippets, PR checklist, or component-level guidance), tell me which area to expand and I will iterate.
