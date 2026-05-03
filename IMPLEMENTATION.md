# Local Butler — Implementation Summary

## Product

Local Butler is a travel concierge platform. Travelers submit trip requests; the AI builds a plan; vetted local experts execute each task (restaurant reservations, drivers, guides, photographers, etc.). Operators manage requests and experts via an admin dashboard.

---

## Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), Clerk for auth |
| Backend | NestJS, Prisma ORM |
| Database | PostgreSQL |
| AI | OpenAI `gpt-4o-mini` |
| SMS / Voice | Twilio |
| Monorepo | Turborepo + pnpm |
| Deployment | Railway |

**Packages:**
- `apps/web` — Next.js customer + admin + expert UI
- `apps/api` — NestJS REST API
- `packages/db` — Prisma schema + generated client

---

## Auth — Three Personas

All auth is handled by Clerk. Three distinct personas share the same Clerk tenant but have separate entry points and protections.

### 1. Customer (`/account`)
- Signs in at `/sign-in` → lands on `/portal` persona selector
- `/portal` shows two cards: "Plan a trip" (→ `/account`) and "Expert dashboard" (→ `/expert`)
- A user can be both a customer and an expert simultaneously
- `/account` layout: protected by Clerk middleware (any authenticated user)
- Bookings are linked to Clerk identity via `Lead.clerkUserId`

### 2. Expert (`/expert`)
- Signs in at `/expert/sign-in`
- `/expert` layout: protected by Clerk middleware, redirects to `/expert/sign-in`
- Expert profile is linked to Clerk identity via `Expert.clerkUserId`
- Endpoints: `GET /experts/me`, `PUT /experts/me`

### 3. Admin (`/dashboard`)
- Signs in at `/sign-in`
- `/dashboard` layout: server component checks `userId === ADMIN_CLERK_USER_ID` env var; redirects non-admins to `/`
- No DB role needed — single env var gate

### API Auth Guard
`ClerkAuthGuard` (`apps/api/src/guards/clerk-auth.guard.ts`):
- Extracts Bearer token from `Authorization` header
- Calls `verifyToken(token, { secretKey })` from `@clerk/backend`
- Attaches `req.clerkUserId = payload.sub`
- Requires `CLERK_SECRET_KEY` env var on the API service

### Middleware (`apps/web/middleware.ts`)
Public routes (no auth required): `/`, `/travel/*`, `/sign-in/*`, `/sign-up/*`, `/expert/sign-in/*`, `/expert/sign-up/*`, `/account/sign-in/*`, `/account/sign-up/*`, `/experts/*`, `/health`

Everything else (including `/portal`, `/account`, `/expert`, `/dashboard`) is protected.

---

## Customer Flow

### 1. Travel Intake (`/travel`)
Form with two modes:
- **Full delegation** — destination, dates, travelers, budget → AI builds full itinerary
- **Specific services** — pick from 10 service tiles + same fields

On submit → `POST /travel-butler/intake` → creates `Lead` + `Experience` + generates tasks via OpenAI → redirects to `/travel/plan-preview/:id`.

### 2. Plan Preview (`/travel/plan-preview/[id]`)
- Displays the AI-generated plan
- Chat interface to revise (`POST /travel-butler/experiences/:id/revise`)
- Confirm button (`POST /travel-butler/experiences/:id/confirm`) moves status to `in_coordination`

### 3. Experience Tracker (`/travel/experience/[id]`)
- Shows experience status, task list, task details
- Per-task view at `/travel/experience/[id]/task/[taskId]`

### 4. Account Portal (`/account`)
- Lists all experiences linked to the signed-in Clerk user
- Loaded via `GET /account/my-experiences` (authenticated)
- Empty state links to `/travel`

---

## Expert Flow

### Onboarding (`/expert/onboarding`)
- Expert fills profile: name, bio, categories, cities, credentials, rate
- Submitted to `POST /experts` with `clerkUserId`
- Status starts as `pending` — must be approved by admin

### Expert Dashboard (`/expert/dashboard`)
- Available tasks matching the expert's categories
- `GET /tasks` filtered by category

### My Tasks (`/expert/jobs`, `/expert/my-tasks/[taskId]`)
- Tasks assigned to this expert
- Status update flow: accept → in_progress → completed

---

## Admin Flow (`/dashboard`)

### Experts (`/dashboard/experts`)
- Tabs: pending / approved / suspended / all
- Approve (`POST /experts/:id/approve`) or Suspend (`POST /experts/:id/suspend`) inline
- Detail page at `/dashboard/experts/[id]`: full profile, credentials, reviews

### Experiences (`/dashboard/experiences`)
- All travel experiences across all customers
- Status filter, link to detail

### Tasks (`/dashboard/tasks`)
- All tasks across all experiences
- Assign expert (`POST /tasks/:taskId/assign`), update status

### Vendor Applications (`/dashboard/applications`)
- Review + approve/reject expert applications

---

## API — Key Endpoints

### Travel Butler
| Method | Path | Description |
|---|---|---|
| POST | `/travel-butler/intake` | Create experience from form |
| POST | `/travel-butler/experiences/:id/revise` | AI plan revision chat |
| POST | `/travel-butler/experiences/:id/confirm` | Confirm plan |

### Account (authenticated)
| Method | Path | Description |
|---|---|---|
| GET | `/account/my-experiences` | Experiences for signed-in user |

### Experts
| Method | Path | Description |
|---|---|---|
| GET | `/experts` | List (status/category filter) |
| POST | `/experts` | Register new expert |
| GET | `/experts/me` | Own profile (auth) |
| PUT | `/experts/me` | Update own profile (auth) |
| POST | `/experts/:id/approve` | Approve expert |
| POST | `/experts/:id/suspend` | Suspend expert |

### Tasks
| Method | Path | Description |
|---|---|---|
| GET | `/tasks` | List tasks (status/category filter) |
| POST | `/tasks/:id/assign` | Assign expert to task |
| PATCH | `/tasks/:id/status` | Update task status |

### Experiences
| Method | Path | Description |
|---|---|---|
| GET | `/experiences` | List all (status/type filter) |
| GET | `/experiences/:id` | Single experience |
| PATCH | `/experiences/:id/status` | Update status |

---

## Database — Core Models

```
Lead              id, name, phone, email, clerkUserId
Experience        id, leadId, type, status, city, dates, travelers, budget, plan(JSON)
Task              id, experienceId, category, title, description, status, assignedExpertId
Expert            id, clerkUserId, name, bio, categories[], cities[], status, rate
ExpertReview      id, expertId, rating, comment
VendorApplication id, name, email, category, status
TaskMessage       id, taskId, role, content
```

**Experience statuses:** `intake → plan_ready → in_coordination → confirmed → in_progress → completed | cancelled`

**Task statuses:** `new → matched → accepted → in_progress → completed | cancelled | declined`

**Expert statuses:** `pending → approved | suspended`

---

## Environment Variables

### API service (Railway)
```
DATABASE_URL=
CLERK_SECRET_KEY=
OPENAI_API_KEY=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=
```

### Web service (Railway)
```
NEXT_PUBLIC_API_URL=https://<api-railway-url>
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=
ADMIN_CLERK_USER_ID=<your-clerk-user-id>
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/portal
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/portal
```

---

## Deployment

- Both services deployed on Railway from the same GitHub repo
- API startup runs `prisma db push --accept-data-loss` to sync schema
- Web is a standard Next.js build (`next build`)
- `NEXT_PUBLIC_API_URL` must be set at build time (baked into the bundle)
