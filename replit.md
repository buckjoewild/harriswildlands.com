# BruceOps

## Project Context (Audit Summary)

| Field | Value |
|-------|-------|
| **Project Name** | HarrisWildlands (also: BruceOps / Thought-Weaver) |
| **Production URL** | https://harriswildlands.com |
| **GitHub Repo** | https://github.com/buckjoewild/harriswildlands.com |
| **Hosting** | Replit Autoscale (with Docker portability) |
| **Auth** | Replit OIDC + PostgreSQL sessions |
| **Database** | PostgreSQL with Drizzle ORM (Neon-backed) |
| **Key Users** | Solo admin (faith-centered father/teacher/creator) |
| **Privacy** | Private by default, no sharing, user-scoped data |
| **Theme** | Botanical sci-fi terminal (MS-DOS meets forest intelligence) |
| **Last Updated** | December 27, 2025 |

## Overview

BruceOps is a modular personal operating system that consolidates four operational "lanes" into a unified web application:

1. **LifeOps** - Daily calibration, routines, logs, and family leadership tracking
2. **ThinkOps** - Idea capture, reality-checking, and project pipeline management
3. **Teaching Assistant** - Standards-aligned lesson plan generation for classroom use
4. **HarrisWildlands** - Brand content and website copy generation

The application serves as a personalized AI assistant for a faith-centered father/teacher/creator, with strict privacy guardrails and a distinctive "botanical sci-fi" visual design aesthetic.

### Core Philosophy
> "Faith over fear & systems over skills"

### Non-Negotiables
- LifeOps outputs are **factual/pattern-based** - no invented context
- ThinkOps separates **Known / Likely / Speculation** with self-deception filters
- Teaching outputs are **standards-aligned, printable-ready, minimal prep**
- Red-zone privacy: support "summaries only" sharing; never assume raw logs should be shared

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter (lightweight React router)
- **State Management**: TanStack Query for server state, React hooks for local state
- **Styling**: Tailwind CSS with custom design system featuring three themes (Field/Lab/Sanctuary)
- **UI Components**: shadcn/ui component library with Radix UI primitives
- **Forms**: React Hook Form with Zod validation
- **Build Tool**: Vite with custom plugins for Replit integration

### Backend Architecture
- **Runtime**: Node.js with Express
- **Language**: TypeScript (ESM modules)
- **API Design**: RESTful endpoints with typed contracts using Zod schemas
- **AI Integration**: OpenRouter API for LLM calls (GPT-4o-mini default)
- **Authentication**: Replit Auth with OpenID Connect and Passport.js

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM
- **Schema Location**: `shared/schema.ts` (shared between frontend and backend)
- **Migrations**: Drizzle Kit (`drizzle-kit push` for schema sync)
- **Session Storage**: PostgreSQL-backed sessions via connect-pg-simple

### Project Structure
```
├── client/           # React frontend
│   └── src/
│       ├── components/   # UI components and layout
│       ├── hooks/        # Custom React hooks (API, auth, etc.)
│       ├── pages/        # Route components (including new AI pages)
│       └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts     # API handlers (with AI endpoints)
│   ├── storage.ts    # Database access layer
│   └── replit_integrations/  # Auth integration
├── shared/           # Shared code (schema, types, routes)
└── docs/             # Technical documentation (Priority 1-4)
    ├── PRIORITY1_CORE_ARCHITECTURE.md  # Server, API, Storage, Auth
    ├── PRIORITY2_FRONTEND.md           # Pages, Components, Hooks
    ├── PRIORITY3_CONFIG_DEPLOY.md      # Config, Docker, Env vars
    ├── PRIORITY4_DOCS_COMPLETE.md      # Complete reference
    ├── ARCHITECTURE.md                 # Original architecture
    └── STANDALONE.md                   # Self-hosted deployment
```

### Key Design Patterns
- **Shared Schema**: Database models and Zod validation schemas defined once in `shared/schema.ts`, used by both frontend and backend
- **Type-Safe API**: Route definitions in `shared/routes.ts` ensure frontend/backend contract alignment
- **User-Scoped Data**: All four lanes store data with `userId` for multi-user isolation
- **AI Context**: Global "Bruce context" prompt personalizes all AI responses to the user's goals

## External Dependencies

### AI Services (Provider Ladder)
AI providers are tried in this order with automatic fallback:
1. **Gemini** (Google AI Studio free tier) - requires `GOOGLE_GEMINI_API_KEY`
2. **OpenRouter** (paid, multiple models) - requires `OPENROUTER_API_KEY`
3. **Off** - graceful degradation, app works without AI

Configuration via `AI_PROVIDER` env var: `gemini` | `openrouter` | `off`
Default model: `openai/gpt-4o-mini` (OpenRouter) or `gemini-1.5-flash` (Gemini)

### Database
- **PostgreSQL**: Primary data store (requires `DATABASE_URL` environment variable)
- Session and user data stored in dedicated tables for Replit Auth

### Authentication
- **Replit Auth**: OpenID Connect-based authentication
- Requires `ISSUER_URL`, `REPL_ID`, and `SESSION_SECRET` environment variables
- **Standalone Mode**: When REPL_ID is missing, falls back to memory sessions and shows demo mode prompt

### Standalone Deployment (Phase 1)
The app supports standalone operation outside Replit:
- **Demo Mode**: Enabled via `?demo=true` URL parameter or localStorage
- **Health Check**: `/api/health` endpoint for Docker health checks
- **Data Export**: `/api/export/data` downloads all user data as JSON
- **Graceful Auth Fallback**: Non-Replit environments use memory sessions with demo mode

### Google Drive Integration
- **Connector**: Replit Google Drive connector (automatic OAuth handling)
- **Client File**: `server/google-drive.ts`
- **API Endpoints**:
  - `GET /api/drive/files` - List files (optional `?q=` query)
  - `POST /api/drive/upload` - Upload file (name, content, mimeType)
  - `GET /api/drive/download/:fileId` - Download file content
  - `POST /api/drive/folder` - Create folder
- **Permissions**: Full Drive access for app data, files, docs, sheets

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Server state management
- `react-hook-form` + `@hookform/resolvers`: Form handling with Zod validation
- `wouter`: Client-side routing
- `express-session` + `connect-pg-simple`: Session management
- `passport` + `openid-client`: Authentication flow
- `googleapis`: Google Drive API client
- `recharts`: Data visualization for weekly review

## AI-Powered Features (December 2025)

### New AI Pages
1. **Reality Check** (`/reality-check`) - Validates ideas with Known/Likely/Speculation classification and self-deception pattern detection
2. **Weekly Review** (`/weekly-review`) - Visualizes goal completion with charts and generates AI-powered weekly insights
3. **Bruce Steward Chat** (`/chat`) - Conversational AI interface with context-aware responses

### AI Endpoints
| Endpoint | Purpose |
|----------|---------|
| `POST /api/ideas/:id/reality-check` | Enhanced reality check with market research |
| `POST /api/review/weekly/insight` | Generate weekly action recommendation (cached daily) |
| `POST /api/chat` | Conversational AI with user data context |

### callAI() Function
Unified AI caller that uses the provider ladder (Gemini -> OpenRouter -> Off) with automatic fallback. Located in `server/routes.ts`.

## Technical Documentation

Comprehensive documentation compiled for sharing with other AI systems:

| Document | Contents |
|----------|----------|
| `docs/PRIORITY1_CORE_ARCHITECTURE.md` | Server, API routes, storage, auth, schemas |
| `docs/PRIORITY2_FRONTEND.md` | Pages, components, hooks, query client |
| `docs/PRIORITY3_CONFIG_DEPLOY.md` | Vite, Tailwind, TypeScript, Docker, env vars |
| `docs/PRIORITY4_DOCS_COMPLETE.md` | Complete reference covering all systems |