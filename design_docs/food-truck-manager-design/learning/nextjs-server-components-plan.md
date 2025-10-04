# Next.js Learning Plan: Server Components & API Routes

## 🎯 Learning Objectives

By the end of this plan, you'll understand:
1. **Next.js App Router** - How routing works in modern Next.js
2. **Server Components vs Client Components** - When and why to use each
3. **API Routes** - Creating backend endpoints in Next.js
4. **Data Fetching Patterns** - How to fetch data server-side vs client-side
5. **Progressive Enhancement** - Adding server features without breaking client functionality

---

## 📚 Phase 1: Move Scenarios to API Routes

### What We're Doing
Moving the hardcoded scenario JSON data from the client to a server-side API endpoint.

### Why This Matters
- **Separation of Concerns**: Game data lives on the server, not bundled with client JavaScript
- **Bundle Size**: Reduces the amount of JavaScript sent to the browser
- **Security**: Server can validate requests and protect game data
- **Scalability**: Easy to swap static data for database or AI-generated content later

### Current State
```typescript
// web/src/lib/scenarios/web-scenario-loader.ts
const STATIC_SCENARIOS: Scenario[] = [
  { id: "customer-complaint-early-1", title: "...", ... },
  // ... 8 hardcoded scenarios
];
```

### Target State
```typescript
// web/src/app/api/scenarios/route.ts (NEW - Server-side API)
export async function GET(request: Request) {
  const scenarios = [...]; // Server-only data
  return Response.json(scenarios);
}

// web/src/lib/scenarios/api-scenario-loader.ts (NEW - Client fetches from API)
async function fetchScenarios() {
  const response = await fetch('/api/scenarios');
  return response.json();
}
```

---

## 🛠️ Implementation Steps

### Step 1: Create API Route for Scenarios
**What**: Create a server-side endpoint that returns scenario data
**File**: `/web/src/app/api/scenarios/route.ts`

**Next.js Concepts You'll Learn**:
- **Route Handlers**: Files named `route.ts` in `/app/api/` create API endpoints
- **File-based routing**: URL path matches folder structure (`/api/scenarios` → `/app/api/scenarios/route.ts`)
- **HTTP Methods**: Export functions named `GET`, `POST`, `PUT`, `DELETE`

**What the code does**:
```typescript
// This file automatically creates the endpoint: /api/scenarios
export async function GET(request: Request) {
  // This runs on the SERVER only - never in the browser
  const scenarios = [...]; // Your scenario data
  return Response.json(scenarios); // Send JSON response
}
```

---

### Step 2: Create API Client for Fetching Scenarios
**What**: Create a client-side loader that fetches from the API
**File**: `/web/src/lib/scenarios/api-scenario-loader.ts`

**Next.js Concepts You'll Learn**:
- **Fetch API**: Standard way to call APIs in Next.js
- **Client-side data fetching**: Using `fetch()` in React components
- **Error handling**: Graceful fallbacks when API fails

**What the code does**:
```typescript
// This replaces WebScenarioLoader, but fetches from API instead of hardcoded data
export class ApiScenarioLoader {
  static async fetchAllScenarios(): Promise<Scenario[]> {
    const response = await fetch('/api/scenarios');
    return response.json();
  }
}
```

---

### Step 3: Add Query Parameters for Filtering
**What**: Teach the API to filter scenarios by difficulty
**Files**: Update `/web/src/app/api/scenarios/route.ts`

**Next.js Concepts You'll Learn**:
- **URL Search Params**: Reading query strings (`?difficulty=early`)
- **Dynamic responses**: Server changes response based on request parameters

**What the code does**:
```typescript
// /api/scenarios?difficulty=early
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const difficulty = searchParams.get('difficulty'); // Read query param

  let scenarios = [...];
  if (difficulty) {
    scenarios = scenarios.filter(s => s.difficulty === difficulty);
  }

  return Response.json(scenarios);
}
```

---

### Step 4: Update useGame Hook to Use API
**What**: Replace `WebScenarioLoader` with `ApiScenarioLoader` in the game hook
**File**: `/web/src/hooks/useGame.ts`

**React Concepts You'll Learn**:
- **Async state management**: Handling loading states for API calls
- **Error boundaries**: What to show when API fails

**What the code does**:
```typescript
// Before: const scenario = WebScenarioLoader.getScenario(context);
// After:  const scenarios = await ApiScenarioLoader.fetchAllScenarios();
```

---

## 🎓 Key Next.js Concepts Explained

### App Router vs Pages Router
Next.js 14 uses the **App Router** (`/app` directory):
- **File-based routing**: Folder structure = URL structure
- **Server Components by default**: Components render on server unless marked `'use client'`
- **API routes**: `route.ts` files create backend endpoints

### Server Components vs Client Components

| Server Components | Client Components |
|-------------------|-------------------|
| Run on server only | Run in browser |
| Can access databases, APIs directly | Need to fetch from API routes |
| No JavaScript sent to client | Interactive, can use hooks |
| Default in Next.js 14 | Need `'use client'` directive |

**Example**:
```typescript
// Server Component (no 'use client')
async function ScenarioList() {
  const scenarios = await fetchFromDatabase(); // Direct DB access
  return <div>{scenarios.map(...)}</div>;
}

// Client Component (has 'use client')
'use client';
function GameBoard() {
  const [state, setState] = useState(); // Needs hooks = client component
  return <div>...</div>;
}
```

### Why Use API Routes?

**Without API Route** (Current):
```
Browser → Downloads scenario data in JavaScript bundle (200KB)
```

**With API Route** (Target):
```
Browser → Requests /api/scenarios → Server returns just the needed data (20KB)
```

Benefits:
- Smaller initial page load
- Server can connect to databases
- Server can protect sensitive logic
- Server can cache/optimize responses

---

## 📋 Testing Strategy

After each step, we'll verify:
1. **API works**: Test `/api/scenarios` in browser directly
2. **Client fetches correctly**: Game still loads scenarios
3. **Filtering works**: Can request specific difficulties
4. **Error handling**: Game shows error if API fails
5. **No regressions**: Game still playable end-to-end

---

## 🚀 What's Next After This?

Once you understand API routes and data fetching:
1. **Server-Side Rendering (SSR)**: Pre-render pages with data on server
2. **Server Actions**: Handle form submissions server-side
3. **Database Integration**: Connect to Postgres/MongoDB
4. **Authentication**: Add user accounts with NextAuth
5. **AI Integration**: Generate scenarios dynamically with OpenAI

---

## 📖 Resources

- [Next.js App Router Docs](https://nextjs.org/docs/app)
- [Route Handlers](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Server and Client Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Data Fetching Patterns](https://nextjs.org/docs/app/building-your-application/data-fetching)

---

## Current Progress: Not Started
- [ ] Step 1: Create API Route for Scenarios
- [ ] Step 2: Create API Client Loader
- [ ] Step 3: Add Query Parameters
- [ ] Step 4: Update useGame Hook
- [ ] Testing & Verification
