# BruceOps

## Overview

BruceOps is a modular personal operating system that consolidates four operational "lanes" into a unified web application:

1. **LifeOps** - Daily calibration, routines, logs, and family leadership tracking
2. **ThinkOps** - Idea capture, reality-checking, and project pipeline management
3. **Teaching Assistant** - Standards-aligned lesson plan generation for classroom use
4. **HarrisWildlands** - Brand content and website copy generation

The application serves as a personalized AI assistant for a faith-centered father/teacher/creator, with strict privacy guardrails and a distinctive "botanical sci-fi" visual design aesthetic.

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
│       ├── pages/        # Route components
│       └── lib/          # Utilities and query client
├── server/           # Express backend
│   ├── routes.ts     # API handlers
│   ├── storage.ts    # Database access layer
│   └── replit_integrations/  # Auth integration
├── shared/           # Shared code (schema, types, routes)
└── docs/             # Architecture documentation
```

### Key Design Patterns
- **Shared Schema**: Database models and Zod validation schemas defined once in `shared/schema.ts`, used by both frontend and backend
- **Type-Safe API**: Route definitions in `shared/routes.ts` ensure frontend/backend contract alignment
- **User-Scoped Data**: All four lanes store data with `userId` for multi-user isolation
- **AI Context**: Global "Bruce context" prompt personalizes all AI responses to the user's goals

## External Dependencies

### AI Services
- **OpenRouter API**: Primary LLM gateway (requires `OPENROUTER_API_KEY` environment variable)
- Default model: `openai/gpt-4o-mini`

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

### Key NPM Packages
- `drizzle-orm` / `drizzle-kit`: Database ORM and migrations
- `@tanstack/react-query`: Server state management
- `react-hook-form` + `@hookform/resolvers`: Form handling with Zod validation
- `wouter`: Client-side routing
- `express-session` + `connect-pg-simple`: Session management
- `passport` + `openid-client`: Authentication flow