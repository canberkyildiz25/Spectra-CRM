# Spectra CRM

Customers, deals, proposals and tasks in one CRM, built with Next.js 16, Node.js/Express and MongoDB Atlas.

**Live demo:** https://client-xi-three-50.vercel.app — no sign-up; the demo account opens by itself.

The design system lives in `client/design.md`: a dark ground and a single colour scale in which every deal carries the temperature of its stage, from a cold lead to a hot negotiation.

---

## Features

- **Deal pipeline** — a kanban board; drag a deal to the next stage, or move it from its menu with a keyboard or on a touch screen
- **Proposals** — built from line items with VAT, printable as a PDF document, tracked as draft, sent, accepted or rejected
- **Customers** — contact details with their deals and proposals in one record
- **Tasks** — sorted by due date and marked by priority
- **Dashboard** — open pipeline by stage, won and lost value, proposal acceptance, computed from the database
- **Authentication** — JWT, plus a demo account for visitors

---

## Tech stack

| Layer | Technology |
|--------|-----------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS 4 |
| Motion | GSAP ScrollTrigger (landing and sign-in), Framer Motion (app) |
| Backend | Node.js, Express, TypeScript |
| Database | MongoDB Atlas |
| Auth | JWT (JSON Web Token) |
| State | Zustand |
| Deploy | Vercel, with the client and the API as separate projects |

---

## Project structure

```
Spectra-CRM/
├── client/          # Next.js app
│   ├── app/         # Routes (App Router)
│   ├── components/  # Shared components
│   ├── lib/         # API client, store, formatters, stage scale
│   └── design.md    # The locked design system
├── server/          # Express REST API
│   └── src/
│       ├── controllers/
│       ├── models/
│       ├── routes/
│       ├── middleware/
│       └── seed.ts  # Demo data
├── shared/          # Shared TypeScript types
└── docs/            # Technical notes
```

---

## Running it locally

### Requirements

- Node.js 20.9+
- A MongoDB Atlas cluster, or a local MongoDB

### 1. Clone the repository

```bash
git clone https://github.com/canberkyildiz25/Spectra-CRM.git
cd Spectra-CRM
```

### 2. Install dependencies

The repository is an npm workspace, so one install at the root covers the client and the server.

```bash
npm install
```

### 3. Set the environment variables

Create `server/.env`:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster0.xxxx.mongodb.net/spectra-crm
JWT_SECRET=a_long_random_secret
JWT_EXPIRE=7d
SERVER_PORT=5000
NODE_ENV=development
```

Create `client/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

### 4. Load the demo data

```bash
cd server && npx ts-node --transpile-only src/seed.ts
```

This creates the demo user (`demo@spectra.com` / `demo1234`) and replaces the customers, deals, tasks and proposals with the demo set.

### 5. Start the development servers

```bash
# Terminal 1 — API (http://localhost:5000)
cd server && npm run dev

# Terminal 2 — client (http://localhost:3000)
cd client && npm run dev
```

---

## Deployment

- **API** → one serverless function on Vercel (`server/api/index.ts`)
- **Client** → a separate Vercel project with `client` as its root directory
- **Database** → MongoDB Atlas (M0 free tier)

---

## License

© 2026 Spectra CRM — All rights reserved.
