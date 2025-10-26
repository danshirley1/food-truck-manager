# Food Truck Manager - Claude Context

## Project Overview
A portfolio showcase application featuring a Food Truck Manager simulation game. Players navigate scenarios like permits, supply chains, festival bookings, and customer interactions through decision-based gameplay.

## Development Approach
- **Web Application**: Next.js React frontend with AWS backend integration
- **Focus**: System design and architecture over complex game theory
- **AI Integration**: Generate scenario content and choices to minimize manual content creation

## Key Design Decisions

### 2025-09-07 - Initial Project Setup
- **Theme Selected**: Food Truck Manager (over Coffee Shop or Park Ranger)
- **Architecture**: JavaScript/TypeScript with AWS backend
- **AI Strategy**: Use AI for content generation (scenarios, choices) rather than complex game logic
- **Documentation Structure**: Created comprehensive design documentation hierarchy
- **Development Philosophy**: Keep game mechanics simple (resource deltas), let AI handle creative content

### 2025-09-07 - Core Game Design
- **Resource System**: 3 resources (money: -999 to 999, reputation: 0-100, energy: 0-100)
- **Game Length**: 15 turns representing 15 days of operation
- **Effect Constraints**: Individual effects limited to ±20, turn totals to ±30
- **Failure States**: Burnout (energy ≤ 0), reputation death (reputation ≤ 0), bankruptcy (money ≤ -500)
- **Victory Condition**: Complete all 15 turns successfully
- **Data Model**: TypeScript-first with Zod validation for AI safety
- **Difficulty Progression**: Early (1-5), Mid (6-10), Late (11-15) turns with escalating stakes

### 2025-09-07 - AI Integration & Content Strategy
- **AI Role**: Generate scenario narratives and choice labels, not game logic or effects
- **Content Safety**: Multi-layer validation (JSON schema, content moderation, effect bounds)
- **Fallback Strategy**: Static scenario library for AI failures, hybrid generation approach
- **Scenario Categories**: Customer service, supply management, equipment, permits, competition, weather, community events, crisis management, expansion
- **Caching Strategy**: Pre-generate common scenarios, context-aware cache keys
- **Cost Management**: Batch generation, smart caching, token optimization, budget alerts

## Commands to Remember
```bash
# Add any specific commands for this project here as they're discovered
```

## Design Documentation Structure
- `architecture/` - System design, data flow, AWS services
- `game-design/` - Game mechanics, scenarios, AI integration  
- `technical/` - Data models, algorithms, validation
- `ui-ux/` - Interface designs and user flows
- `deployment/` - Infrastructure and CI/CD

## Documentation Mandate
⚠️ **CRITICAL**: Always update design documentation when making ANY design changes or decisions. This includes:
- Updating relevant design files when decisions are made
- Creating new documentation files as needed
- Maintaining traceability of all design decisions
- Ensuring all design evolution is documented in real-time

### 2025-09-15 - Next.js Web Application Complete
- **Next.js 14 Setup**: Modern React application with TypeScript and Tailwind CSS
- **Shared Architecture**: Core game logic in shared module for reusability
- **React Components**: GameBoard, ScenarioCard, GameOverCard with responsive design
- **Game Hook**: useGame custom hook for React state management
- **Full Playability**: Complete web version with static scenario library
- **Unified Package Management**: Yarn workspace setup
- **Orchestrated Development**: Single `yarn dev` command starts all development servers
- **Static Content**: 8 curated scenarios across all difficulty levels

### 2025-10-04 - CLI Version Removed
- **Web-Only Focus**: Removed CLI application to simplify architecture
- **Streamlined Workspace**: Web and shared packages only
- **Updated Scripts**: Cleaned up all CLI-related build and dev scripts
- **Documentation Updated**: Design docs reflect web-only architecture

### 2025-10-04 - Refactored to Standard Next.js Structure
- **Removed Shared Package**: Moved all game logic into Next.js `/lib` directory
- **Standard Next.js Pattern**: Following Next.js best practices with `/lib` for business logic
- **Simplified Build**: No more workspace complexity, single Next.js app
- **Cleaner Imports**: All imports now use `@/lib/game` pattern
- **Updated Documentation**: Reflects new simpler architecture

### 2025-10-04 - Next.js Learning Phase: Server Components & API Routes
- **Learning Objective**: Understand Next.js App Router, Server Components, and API Routes
- **First Feature**: Move hardcoded scenarios to backend API endpoints
- **Server-Side Data**: Learn data fetching patterns with Server Components
- **API Design**: RESTful endpoints for game data
- **Progressive Enhancement**: Keep client-side working, add server features incrementally

## Current Architecture
```
/web (Single Next.js application)
  /src
    /app          # Next.js App Router pages & API routes
    /components   # React components (Client & Server)
    /hooks        # Custom React hooks
    /lib          # Game engine and logic
      /engine     # State management
      /types      # TypeScript definitions
      /scenarios  # Scenario system (moving to API)
      /game       # Main exports
```

## Current State: Fully Functional Web Game
- ✅ Complete playable game with 8 static scenarios
- ✅ Client-side game state management
- ✅ API Routes for scenarios (moved from hardcoded)
- ✅ Responsive UI with Tailwind CSS
- ✅ Game mechanics: 3 resources, 15 turns, difficulty progression

---

## 🎯 Portfolio Enhancement Plan (2025-01-26)

**NEW DIRECTION**: Transform into comprehensive full-stack portfolio piece demonstrating senior React/Next.js skills

**Timeline**: 4-6 weeks (incremental feature branches)
**Strategy**: Feature branches with digestible PRs for learning
**Documentation**: See `PORTFOLIO_ENHANCEMENT_PLAN.md` and `INTERVIEW_TALKING_POINTS.md`

### Key Changes from Original Plan
- ❌ AWS Lambda + DynamoDB → ✅ Vercel + PostgreSQL (Supabase)
- ❌ AI scenarios (future) → ✅ Focus on React patterns first
- ❌ Single state approach → ✅ Multiple state management patterns (Context + Redux + React Query)
- **Why**: Demonstrate breadth of React knowledge, easier deployment, better for portfolio interviews

### Planned Phases (4-6 weeks)

#### Phase 1: Authentication (Week 1)
- **Tech**: NextAuth.js v5 + PostgreSQL + Prisma
- **Features**: User registration, login, protected routes, user dashboard
- **Learning**: NextAuth setup, Prisma migrations, Server Components
- **Branch**: `feature/auth-system`

#### Phase 2: Settings & Preferences (Week 1-2)
- **Tech**: Context API + localStorage + database persistence
- **Features**: Theme, audio, difficulty settings
- **Learning**: Context patterns, TypeScript with Context, custom hooks
- **Branch**: `feature/settings-context`

#### Phase 3: Game Persistence (Week 2)
- **Tech**: Server Actions + PostgreSQL
- **Features**: Save/load game state, auto-save, multiple save slots
- **Learning**: Server Actions, optimistic updates, serialization
- **Branch**: `feature/game-persistence`

#### Phase 4: Achievement System (Week 2-3)
- **Tech**: React Portals + database
- **Features**: Achievement definitions, unlock detection, toast notifications
- **Learning**: Portals, notification queue, animation
- **Branch**: `feature/achievements`

#### Phase 5: Leaderboard (Week 3)
- **Tech**: React Query (TanStack Query)
- **Features**: Global leaderboard, filtering, pagination, score submission
- **Learning**: React Query setup, caching, optimistic updates
- **Branch**: `feature/leaderboard`

#### Phase 6: Redux Time-Travel (Week 3-4)
- **Tech**: Redux Toolkit + Redux DevTools
- **Features**: Undo/redo, turn history, replay functionality
- **Learning**: Redux setup, time-travel debugging, Redux patterns
- **Branch**: `feature/redux-time-travel`

#### Phase 7: Inventory System (Week 4)
- **Tech**: useReducer + Redux (optional persistence)
- **Features**: Ingredient/equipment inventory, add/remove/use items
- **Learning**: useReducer patterns, discriminated unions, complex state logic
- **Branch**: `feature/inventory-system`

#### Phase 8: Tech Tree & Upgrades (Week 5)
- **Tech**: Redux (for persistence)
- **Features**: 5-8 upgrades with prerequisites, permanent buffs, visualization
- **Learning**: Graph structures, dependency resolution, Redux integration
- **Branch**: `feature/tech-tree`

#### Phase 9: Polish & Documentation (Week 5-6)
- **Tech**: Performance optimization, accessibility, documentation
- **Features**: Code splitting, memoization, error boundaries, comprehensive docs
- **Learning**: React DevTools Profiler, a11y, deployment
- **Branch**: `feature/polish`

### State Management Strategy

**Critical Learning Objective**: Demonstrate understanding of when to use each tool

| State Type | Tool | Why | Examples |
|------------|------|-----|----------|
| Global settings | Context API | Low-frequency updates, simple state | Theme, audio, preferences |
| Complex game logic | Redux Toolkit | Time-travel, undo/redo, complex reducers | Game history, tech tree |
| Server state | React Query | Caching, refetching, optimistic updates | Leaderboard, user profile |
| Component state | useReducer | Complex logic, component-scoped | Inventory (within game) |
| Simple UI state | useState | Transient, simple | Modal open/closed |

### Tech Stack Updates

**New Additions**:
- **Auth**: NextAuth.js v5 (beta) - industry standard
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **State**: Redux Toolkit + React Query + Context API
- **Deployment**: Vercel (zero-config)

**Database Schema** (Prisma):
- `users`, `accounts`, `sessions` (NextAuth)
- `game_saves` (serialized game state)
- `achievements`, `user_achievements` (M2M)
- `leaderboard_entries` (scores with metadata)
- `tech_tree_progress` (unlocked upgrades)
- `user_settings` (preferences)

### Learning Objectives

**React Patterns**:
- ✅ Context API (global settings)
- ✅ Redux Toolkit (complex state, time-travel)
- ✅ React Query (server state, caching)
- ✅ useReducer (complex component logic)
- ✅ React Portals (notifications, modals)
- ✅ Custom Hooks (useGame, useSettings, useInventory)
- ✅ useMemo/useCallback (performance)
- ✅ React.memo (component optimization)

**Next.js Patterns**:
- ✅ Server Components (dashboard, leaderboard)
- ✅ Server Actions (save game, unlock achievement)
- ✅ API Routes (scenarios, leaderboard)
- ✅ Middleware (auth checking)
- ✅ Streaming & Suspense (future)

**Full-Stack Skills**:
- ✅ Authentication flows (NextAuth)
- ✅ Database design (PostgreSQL + Prisma)
- ✅ API design (RESTful + Server Actions)
- ✅ Security (row-level, session management)
- ✅ Performance (optimization, caching)
- ✅ Deployment (Vercel + Supabase)

### Interview Talking Points

See `INTERVIEW_TALKING_POINTS.md` for comprehensive guide on:
- Why multiple state management tools (not over-engineering)
- Authentication architecture (NextAuth vs custom)
- Database schema design (normalization, indexing)
- Performance optimization (measured, targeted)
- Security considerations (XSS, CSRF, validation)
- Testing strategy (unit, integration, E2E)
- Deployment & DevOps (Vercel, Supabase, migrations)

### Documentation Standards

Each phase includes:
1. Design doc explaining architecture and decisions
2. Learning notes (what worked, what didn't)
3. Interview talking points (why this approach)
4. Code examples with comments
5. Updates to CLAUDE.md tracking progress

**Files Created**:
- `PORTFOLIO_ENHANCEMENT_PLAN.md` - Complete implementation roadmap
- `INTERVIEW_TALKING_POINTS.md` - Curated answers for interviews
- Per-phase docs in `architecture/`, `technical/`, `game-design/`

---

## Next Steps

1. **Review Plan**: Read `PORTFOLIO_ENHANCEMENT_PLAN.md` thoroughly
2. **Ask Questions**: Clarify anything unclear before starting
3. **Begin Phase 1**: Authentication system (Week 1)
4. **Document Progress**: Update CLAUDE.md after each phase
5. **Iterate**: Learn, implement, document, repeat

**Current Status**: Planning complete, ready to begin implementation
**Next Action**: Start Phase 1 (Authentication) when ready