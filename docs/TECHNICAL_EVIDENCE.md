# BruceOps/Thought Weaver - Technical Evidence Document

**Generated:** 2025-12-27
**Status:** Production Deployed
**Live URL:** https://harriswildlands.com
**GitHub:** https://github.com/buckjoewild/harriswildlands.com

---

## 1. Database Schema (PostgreSQL with Drizzle ORM)

### Tables Implemented

#### `logs` - LifeOps Daily Calibration
```typescript
- id: serial (primary key)
- userId: text (user isolation)
- date: text (YYYY-MM-DD)
- Vices: vaping, alcohol, junkFood, doomScrolling, lateScreens, skippedMeals, excessCaffeine, exercise (boolean)
- Life Metrics: energy, stress, mood, focus, sleepQuality, sleepHours, moneyPressure, connection (1-10 scales)
- Quick Context: dayType, primaryEmotion, winCategory, timeDrain (text selects)
- Reflections: topWin, topFriction, tomorrowPriority (text)
- Deep Dives: familyConnection, faithAlignment, driftCheck (text)
- System: rawTranscript, aiSummary, createdAt
```

#### `ideas` - ThinkOps Idea Pipeline
```typescript
- id: serial (primary key)
- userId: text
- Basic: title, pitch, category, captureMode
- Deep Capture: whoItHelps, painItSolves, whyICare, tinyTest, resourcesNeeded, timeEstimate, excitement, feasibility
- Pipeline: status (draft/parked/promoted/shipped/discarded), priority (0-5)
- AI Analysis: realityCheck (jsonb), promotedSpec (jsonb)
- Progress: milestones (jsonb), nextAction
```

#### `teachingRequests` - Teaching Assistant
```typescript
- id: serial (primary key)
- userId: text
- grade, standard, topic, generatedPlan (text)
- createdAt
```

#### `harrisContent` - HarrisWildlands Brand Content
```typescript
- id: serial (primary key)
- userId: text
- contentType, prompt, generatedContent (text)
- createdAt
```

#### `users` & `sessions` - Replit Auth
```typescript
- users: id, email, firstName, lastName, profileImageUrl, createdAt, updatedAt
- sessions: sid, sess (jsonb), expire
```

---

## 2. Authentication Provider

**Provider:** Replit OpenID Connect (OIDC)
**Implementation:** `server/replit_integrations/auth/`

### Auth Flow
1. User clicks "Log in with Replit"
2. Redirects to Replit OIDC authorization
3. Callback receives user profile
4. Session stored in PostgreSQL via connect-pg-simple
5. User data synced to `users` table

### Environment Variables Required
- `REPL_ID` - Replit app identifier
- `ISSUER_URL` - https://replit.com/oidc
- `SESSION_SECRET` - Session encryption key
- `DATABASE_URL` - PostgreSQL connection

---

## 3. File Structure (Production)

```
├── client/src/
│   ├── App.tsx                 # Main router
│   ├── components/
│   │   ├── Layout.tsx          # Sidebar layout
│   │   ├── ThemeProvider.tsx   # Field/Lab/Sanctuary themes
│   │   ├── BotanicalMotifs.tsx # UI decorations
│   │   └── ui/                 # shadcn components (50+ files)
│   ├── hooks/
│   │   ├── use-auth.ts         # Authentication hook
│   │   ├── use-bruce-ops.ts    # API hooks for all lanes
│   │   └── use-toast.ts        # Notifications
│   ├── pages/
│   │   ├── Dashboard.tsx       # Main dashboard
│   │   ├── LifeOps.tsx         # Lane 1: Daily calibration
│   │   ├── ThinkOps.tsx        # Lane 2: Idea pipeline
│   │   ├── TeachingAssistant.tsx # Lane 3: Lesson plans
│   │   ├── HarrisWildlands.tsx # Lane 4: Brand content
│   │   └── Settings.tsx        # User settings
│   └── lib/
│       └── queryClient.ts      # TanStack Query setup
│
├── server/
│   ├── index.ts                # Express server entry
│   ├── routes.ts               # API endpoints
│   ├── storage.ts              # Database access layer
│   ├── db.ts                   # Drizzle connection
│   ├── google-drive.ts         # Drive integration
│   └── replit_integrations/
│       └── auth/               # Replit Auth implementation
│
├── shared/
│   ├── schema.ts               # Database models + Zod schemas
│   ├── routes.ts               # API route definitions
│   └── models/auth.ts          # User model
│
├── release/                    # Standalone deployment kit
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── deploy-windows.bat
│   ├── test-app.bat
│   └── manage-app.bat
│
└── docs/                       # Documentation
```

---

## 4. Feature Completion Status

| Feature | Status | Evidence |
|---------|--------|----------|
| Login with Replit | Working | Auth returns 401 for unauthenticated, 200 for authenticated |
| LifeOps Daily Logs | Implemented | `logs` table, `/api/logs` endpoints, LifeOps.tsx page |
| ThinkOps Ideas | Implemented | `ideas` table, `/api/ideas` endpoints, ThinkOps.tsx page |
| Teaching Assistant | Implemented | `teachingRequests` table, TeachingAssistant.tsx page |
| HarrisWildlands Content | Implemented | `harrisContent` table, HarrisWildlands.tsx page |
| Three Themes | Implemented | Field/Lab/Sanctuary in ThemeProvider.tsx |
| Google Drive Integration | Working | `server/google-drive.ts`, file sync verified |
| PDF Export | Not Yet | Planned feature |
| Voice Transcripts | Schema Ready | `rawTranscript` field in logs table |
| AI Summaries | Schema Ready | `aiSummary` field, AI provider configurable |

---

## 5. API Endpoints

```
GET  /api/health              # System health check
GET  /api/auth/user           # Current user
POST /api/auth/login          # Replit OAuth redirect
GET  /api/auth/callback       # OAuth callback
POST /api/logout              # End session

GET  /api/logs                # List user's logs
POST /api/logs                # Create new log
GET  /api/logs/:id            # Get specific log

GET  /api/ideas               # List user's ideas
POST /api/ideas               # Create new idea
PATCH /api/ideas/:id          # Update idea

POST /api/teaching/generate   # Generate lesson plan

POST /api/harris/generate     # Generate brand content

GET  /api/drive/files         # List Drive files
POST /api/drive/upload        # Upload to Drive
GET  /api/drive/download/:id  # Download from Drive

GET  /api/export/data         # Export all user data (JSON)
```

---

## 6. Server Logs (Sample)

```
AI Provider: off (configured: off)
4:52:08 AM [express] serving on port 5000
GET /api/health 200 {"status":"ok","database":"connected","ai_provider":"off"}
GET /api/auth/user 401 {"message":"Unauthorized"}
```

---

## 7. Deployment Artifacts

### Production (Replit)
- **URL:** harriswildlands.com
- **Hosting:** Replit Autoscale
- **Database:** Neon PostgreSQL
- **Auth:** Replit OIDC

### Standalone (Docker)
- **Files:** `release/Dockerfile`, `release/docker-compose.yml`
- **Scripts:** `deploy-windows.bat`, `test-app.bat`, `manage-app.bat`
- **Features:** Health checks, smoke tests, stress tests

### Backup (Google Drive)
- **Folder:** "thoughtweaver-complete"
- **Contents:** 129+ files including all source code
- **Sync:** Automated via Replit Google Drive connector

---

## 8. Verification Commands

```bash
# Check database connection
curl https://harriswildlands.com/api/health

# Verify auth is configured (should return 401, not standalone error)
curl https://harriswildlands.com/api/auth/user

# List files in GitHub
git ls-files | wc -l  # Should show 90+ files
```

---

**This document provides evidence that the BruceOps/Thought Weaver system is:**
1. Deployed and live at harriswildlands.com
2. Using PostgreSQL with proper schema for all 4 lanes
3. Authenticated via Replit OIDC
4. Backed up to GitHub and Google Drive
5. Ready for standalone deployment via Docker
