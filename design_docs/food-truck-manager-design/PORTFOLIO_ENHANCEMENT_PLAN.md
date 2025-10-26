# Food Truck Manager - Portfolio Enhancement Plan

## Project Vision
Transform the Food Truck Manager from a simple turn-based game into a comprehensive full-stack portfolio piece demonstrating senior-level React/Next.js expertise.

**Timeline**: 4-6 weeks
**Deployment Strategy**: Feature branches with incremental merges
**Target Platform**: Vercel (free tier)

---

## 🎯 Learning Objectives

This enhancement plan is designed to demonstrate proficiency in:

### React/Next.js Patterns
- **State Management Architecture**: Context API, Redux Toolkit, React Query
- **Advanced React Patterns**: Custom hooks, useReducer, compound components
- **React Portals**: Modals, notifications, overlays
- **Performance Optimization**: Memoization, code splitting, lazy loading
- **Server Components**: Mixing server and client rendering strategies

### Full-Stack Capabilities
- **Authentication**: NextAuth.js v5 with PostgreSQL
- **Database Design**: PostgreSQL schema design, migrations, relationships
- **API Design**: RESTful endpoints, Server Actions, error handling
- **Real-time Features**: Optimistic updates, data synchronization
- **Security**: Row-level security, session management, CSRF protection

### DevOps & Architecture
- **Deployment**: Vercel deployment with environment management
- **Database Hosting**: Supabase PostgreSQL (50k MAU free tier)
- **TypeScript**: Advanced types, generics, discriminated unions
- **Testing Strategy**: Unit tests, integration tests, E2E tests (future)

---

## 📚 Technical Stack

### Current Stack (Maintained)
- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS v4, shadcn/ui components
- **Validation**: Zod schemas
- **Icons**: Lucide React

### New Additions
- **Authentication**: NextAuth.js v5 (beta)
- **Database**: PostgreSQL (Supabase) + Prisma ORM
- **State Management**:
  - Redux Toolkit (RTK) - Game state, inventory, tech tree
  - React Query (TanStack Query) - Server state, leaderboards
  - Context API - User preferences, theme, settings
- **API Layer**: Next.js Server Actions + API Routes
- **Notifications**: React Portals for toasts and modals

---

## 🏗️ System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Browser (Client)                         │
├─────────────────────────────────────────────────────────────┤
│  React Client Components ('use client')                     │
│  ├── Redux Store (Game State)                               │
│  │   ├── Inventory Slice                                    │
│  │   ├── Tech Tree Slice                                    │
│  │   ├── Upgrades Slice                                     │
│  │   └── Game History Slice (time-travel)                   │
│  ├── React Query (Server State)                             │
│  │   ├── User Profile Cache                                 │
│  │   ├── Leaderboard Cache                                  │
│  │   └── Achievements Cache                                 │
│  └── Context Providers                                       │
│      ├── Settings Context (theme, audio, difficulty)        │
│      └── Notifications Context (toast system)               │
└─────────────────────────────────────────────────────────────┘
                           ↕ (fetch, Server Actions)
┌─────────────────────────────────────────────────────────────┐
│                Next.js Server (Vercel)                       │
├─────────────────────────────────────────────────────────────┤
│  Server Components (React Server Components)                │
│  ├── Dashboard (pre-rendered with user stats)               │
│  └── Leaderboard (server-side filtering/pagination)         │
│                                                              │
│  API Routes (/app/api/*)                                    │
│  ├── /api/auth/[...nextauth] (NextAuth endpoints)          │
│  ├── /api/scenarios (GET scenarios by difficulty)           │
│  ├── /api/game/save (POST save game state)                  │
│  ├── /api/game/load (GET load game state)                   │
│  └── /api/leaderboard (GET top scores)                      │
│                                                              │
│  Server Actions (app/actions/*)                             │
│  ├── saveGameAction (save game progress)                    │
│  ├── unlockAchievementAction (award achievement)            │
│  └── updateProfileAction (update user settings)             │
└─────────────────────────────────────────────────────────────┘
                           ↕ (Prisma ORM)
┌─────────────────────────────────────────────────────────────┐
│              PostgreSQL Database (Supabase)                  │
├─────────────────────────────────────────────────────────────┤
│  Tables:                                                     │
│  ├── users (NextAuth managed)                               │
│  ├── accounts (OAuth providers)                             │
│  ├── sessions (active sessions)                             │
│  ├── game_saves (serialized game state)                     │
│  ├── achievements (unlocked achievements per user)          │
│  ├── leaderboard_entries (high scores)                      │
│  ├── tech_tree_progress (unlocked upgrades)                 │
│  └── user_settings (preferences, theme)                     │
└─────────────────────────────────────────────────────────────┘
```

### State Management Strategy

**When to use what:**

| State Type | Tool | Examples | Why |
|------------|------|----------|-----|
| **Game-specific state** | Redux Toolkit | Inventory, tech tree, upgrades, turn history | Complex state logic, time-travel debugging, undo/redo |
| **Server data** | React Query | Leaderboards, user profiles, achievements list | Caching, automatic refetching, optimistic updates |
| **User preferences** | Context API | Theme, audio settings, difficulty preference | Global settings, low update frequency |
| **Transient UI state** | useState/useReducer | Form inputs, modal open/closed, tooltips | Component-scoped, doesn't need persistence |
| **Server mutations** | Server Actions | Save game, unlock achievement, update profile | Type-safe server communication, progressive enhancement |

### Authentication Flow

```
┌──────────┐
│  Login   │
│  Screen  │
└────┬─────┘
     │
     ├─> Email/Password (Credentials Provider)
     │   └─> NextAuth validates → Create session → Set cookie
     │
     └─> OAuth (Google/GitHub)
         └─> Redirect to provider → Callback → Create session
                                                        │
                                                        ↓
                                              ┌──────────────────┐
                                              │ Protected Routes │
                                              │ - Dashboard      │
                                              │ - Game (save)    │
                                              │ - Leaderboard    │
                                              └──────────────────┘
```

**Security Model:**
- HttpOnly cookies for session tokens (XSS protection)
- CSRF protection via NextAuth
- Row-level security for user data
- Server-side session validation in Server Actions

---

## 📋 Implementation Phases

### Phase 1: Authentication & User Management (Week 1)
**Branch**: `feature/auth-system`

**Goals:**
- User registration and login
- Session management
- Protected routes
- User profile page

**Learning Objectives:**
- NextAuth.js v5 setup and configuration
- PostgreSQL schema design with Prisma
- Server Components for user dashboard
- Middleware for route protection

**Database Schema:**
```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]
  gameSaves     GameSave[]
  achievements  UserAchievement[]
  settings      UserSettings?
}

model Account {
  // NextAuth OAuth accounts
  userId            String
  type              String
  provider          String
  providerAccountId String
  // ... OAuth fields

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Deliverables:**
- [ ] NextAuth.js v5 configured with email/password
- [ ] Prisma schema with User, Account, Session tables
- [ ] Login/Register pages with form validation
- [ ] Protected `/dashboard` route
- [ ] User profile display (Server Component)
- [ ] Middleware for auth checking
- [ ] Design doc: `authentication/auth-architecture.md`

**Interview Talking Points:**
- Why NextAuth over custom JWT: Industry standard, OAuth support, security best practices
- Server Components for dashboard: SEO, faster initial load, reduced client bundle
- Prisma benefits: Type safety, migrations, database-agnostic

---

### Phase 2: Settings & Preferences (Context API) (Week 1-2)
**Branch**: `feature/settings-context`

**Goals:**
- User settings system
- Theme preferences
- Audio controls
- Difficulty settings
- Persisted preferences

**Learning Objectives:**
- Context API for global state
- Custom hooks for context consumption
- LocalStorage sync for non-auth users
- Database persistence for authenticated users
- TypeScript with Context

**Database Schema:**
```prisma
model UserSettings {
  id           String  @id @default(cuid())
  userId       String  @unique
  theme        String  @default("light") // "light" | "dark" | "system"
  soundEnabled Boolean @default(true)
  musicVolume  Int     @default(50) // 0-100
  sfxVolume    Int     @default(70) // 0-100
  difficulty   String  @default("normal") // "easy" | "normal" | "hard"

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

**Implementation Pattern:**
```typescript
// Context with TypeScript
interface SettingsContextType {
  theme: 'light' | 'dark' | 'system';
  soundEnabled: boolean;
  musicVolume: number;
  sfxVolume: number;
  difficulty: 'easy' | 'normal' | 'hard';
  updateSettings: (settings: Partial<Settings>) => Promise<void>;
}

// Custom hook
function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within SettingsProvider');
  return context;
}
```

**Deliverables:**
- [ ] Settings Context with TypeScript types
- [ ] Settings page UI (sliders, toggles, dropdowns)
- [ ] Persist to localStorage for guests
- [ ] Persist to database for authenticated users
- [ ] Server Action for updating settings
- [ ] Theme switcher component (using CSS variables)
- [ ] Design doc: `ui-ux/settings-system.md`

**Interview Talking Points:**
- When to use Context vs Redux: Context for low-frequency updates (settings), Redux for complex state
- Performance: Context re-renders only consuming components
- Hybrid persistence: localStorage + database for best UX

---

### Phase 3: Save/Load Game State (Server Actions) (Week 2)
**Branch**: `feature/game-persistence`

**Goals:**
- Save game progress to database
- Load saved games
- Auto-save functionality
- Multiple save slots (optional)

**Learning Objectives:**
- Server Actions for mutations
- Serializing complex game state
- Optimistic updates with React Query
- Error handling and rollback

**Database Schema:**
```prisma
model GameSave {
  id          String   @id @default(cuid())
  userId      String
  slotNumber  Int      @default(1) // Support multiple saves

  // Serialized game state
  gameState   Json     // Entire GameState object

  // Metadata for display
  turn        Int
  money       Int
  reputation  Int
  energy      Int
  lastPlayed  DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, slotNumber])
  @@index([userId])
}
```

**Server Action Pattern:**
```typescript
'use server'

export async function saveGameAction(gameState: GameState) {
  const session = await auth();
  if (!session?.user?.id) {
    return { success: false, error: 'Not authenticated' };
  }

  // Save to database
  await prisma.gameSave.upsert({
    where: { userId_slotNumber: { userId: session.user.id, slotNumber: 1 } },
    update: { gameState, turn: gameState.turn, ... },
    create: { userId: session.user.id, gameState, ... }
  });

  return { success: true };
}
```

**Deliverables:**
- [ ] GameSave table in database
- [ ] Server Action: `saveGameAction()`
- [ ] Server Action: `loadGameAction()`
- [ ] Auto-save after each turn
- [ ] Save/Load UI in dashboard
- [ ] Loading states and error handling
- [ ] Optimistic updates (show "Saving..." immediately)
- [ ] Design doc: `technical/game-persistence.md`

**Interview Talking Points:**
- Server Actions vs API Routes: Type safety, form integration, progressive enhancement
- JSON serialization: Storing complex state, Date handling
- Optimistic updates: Better UX, handle failures gracefully

---

### Phase 4: Achievement System (Portals) (Week 2-3)
**Branch**: `feature/achievements`

**Goals:**
- Define achievements (survive 15 days, balanced resources, etc.)
- Track achievement progress
- Unlock notifications using Portals
- Achievement gallery

**Learning Objectives:**
- React Portals for notifications
- Notification queue system
- Achievement detection logic
- Database relations (many-to-many)

**Database Schema:**
```prisma
model Achievement {
  id          String   @id @default(cuid())
  key         String   @unique // "first_win", "balanced_manager", etc.
  name        String
  description String
  icon        String   // Icon name from lucide-react
  category    String   // "survival", "excellence", "strategy"

  users UserAchievement[]
}

model UserAchievement {
  id            String   @id @default(cuid())
  userId        String
  achievementId String
  unlockedAt    DateTime @default(now())

  user        User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  achievement Achievement @relation(fields: [achievementId], references: [id])

  @@unique([userId, achievementId])
  @@index([userId])
}
```

**Portal Implementation:**
```typescript
// NotificationPortal.tsx
'use client';

export function NotificationPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  return createPortal(
    children,
    document.getElementById('notification-root')!
  );
}

// Toast notification component
function AchievementToast({ achievement }: { achievement: Achievement }) {
  return (
    <NotificationPortal>
      <div className="achievement-toast">
        🏆 Achievement Unlocked: {achievement.name}
      </div>
    </NotificationPortal>
  );
}
```

**Achievement Definitions:**
```typescript
const ACHIEVEMENTS = [
  { key: 'first_win', name: 'First Victory', description: 'Complete 15 days' },
  { key: 'balanced_manager', name: 'Balanced Manager', description: 'All resources > 30' },
  { key: 'customer_champion', name: 'Customer Champion', description: 'Reputation > 70 for 5 turns' },
  { key: 'profitable', name: 'Profitable', description: 'End with $200+' },
  { key: 'energetic', name: 'Energetic', description: 'End with 70+ energy' },
  // ... more achievements
];
```

**Deliverables:**
- [ ] Achievement and UserAchievement tables
- [ ] Seed database with achievement definitions
- [ ] Achievement detection logic (in GameStateManager)
- [ ] Server Action: `unlockAchievementAction()`
- [ ] Toast notification component (using Portals)
- [ ] Notification queue system (show one at a time)
- [ ] Achievement gallery page
- [ ] Design doc: `game-design/achievements-system.md`

**Interview Talking Points:**
- React Portals: Rendering outside component hierarchy, z-index control
- Notification queue: Managing sequential animations, state management
- Achievement design: Balancing challenge and attainability

---

### Phase 5: Leaderboard (React Query) (Week 3)
**Branch**: `feature/leaderboard`

**Goals:**
- Global leaderboard
- Friend leaderboards (optional)
- Filtering by time period (all-time, weekly, daily)
- Pagination
- Optimistic updates on score submission

**Learning Objectives:**
- React Query (TanStack Query) setup
- Query caching and invalidation
- Optimistic updates
- Server-side pagination
- Performance optimization

**Database Schema:**
```prisma
model LeaderboardEntry {
  id          String   @id @default(cuid())
  userId      String
  score       Int
  turn        Int      // How many turns completed
  money       Int
  reputation  Int
  energy      Int
  gameMode    String   @default("normal") // "easy", "normal", "hard"
  createdAt   DateTime @default(now())

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([score])
  @@index([createdAt])
  @@index([gameMode, score])
}
```

**React Query Setup:**
```typescript
// app/providers.tsx
'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60 * 1000, // 1 minute
        refetchOnWindowFocus: false,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

// hooks/useLeaderboard.ts
export function useLeaderboard(filter: LeaderboardFilter) {
  return useQuery({
    queryKey: ['leaderboard', filter],
    queryFn: () => fetchLeaderboard(filter),
    staleTime: 30 * 1000, // 30 seconds
  });
}

// Optimistic update on score submission
export function useSubmitScore() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitScore,
    onMutate: async (newScore) => {
      // Cancel outgoing queries
      await queryClient.cancelQueries({ queryKey: ['leaderboard'] });

      // Snapshot previous value
      const previous = queryClient.getQueryData(['leaderboard']);

      // Optimistically update
      queryClient.setQueryData(['leaderboard'], (old) => {
        return [...old, newScore].sort((a, b) => b.score - a.score);
      });

      return { previous };
    },
    onError: (err, newScore, context) => {
      // Rollback on error
      queryClient.setQueryData(['leaderboard'], context.previous);
    },
    onSettled: () => {
      // Refetch after mutation
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}
```

**Deliverables:**
- [ ] LeaderboardEntry table
- [ ] React Query setup in app
- [ ] API route: `GET /api/leaderboard`
- [ ] Server Action: `submitScoreAction()`
- [ ] Leaderboard page with filters (all-time, weekly, daily)
- [ ] Pagination (infinite scroll or numbered pages)
- [ ] useLeaderboard hook with React Query
- [ ] Optimistic updates on score submission
- [ ] Loading skeletons
- [ ] Design doc: `technical/leaderboard-architecture.md`

**Interview Talking Points:**
- React Query benefits: Automatic caching, background refetching, deduplication
- Optimistic updates: Immediate feedback, rollback on error
- Pagination strategies: Cursor-based vs offset-based

---

### Phase 6: Redux - Game History & Time-Travel (Week 3-4)
**Branch**: `feature/redux-time-travel`

**Goals:**
- Undo/Redo functionality
- Turn-by-turn replay
- Game state history
- Redux DevTools integration

**Learning Objectives:**
- Redux Toolkit setup
- Redux DevTools time-travel debugging
- Slice pattern
- Redux middleware
- Integration with existing useState

**Redux Store Architecture:**
```typescript
// store/index.ts
import { configureStore } from '@reduxjs/toolkit';
import gameHistoryReducer from './slices/gameHistorySlice';
import inventoryReducer from './slices/inventorySlice'; // Phase 7
import techTreeReducer from './slices/techTreeSlice';   // Phase 8

export const store = configureStore({
  reducer: {
    gameHistory: gameHistoryReducer,
    inventory: inventoryReducer,
    techTree: techTreeReducer,
  },
  devTools: process.env.NODE_ENV !== 'production', // Enable Redux DevTools
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

// store/slices/gameHistorySlice.ts
interface GameHistoryState {
  past: GameState[];    // Previous states for undo
  present: GameState;   // Current state
  future: GameState[];  // Future states for redo
}

const gameHistorySlice = createSlice({
  name: 'gameHistory',
  initialState: {
    past: [],
    present: GameStateManager.createNew(),
    future: [],
  } as GameHistoryState,
  reducers: {
    makeChoice: (state, action: PayloadAction<{ scenario: Scenario; choice: Choice }>) => {
      const newState = GameStateManager.applyChoice(
        state.present,
        action.payload.scenario,
        action.payload.choice
      );

      state.past.push(state.present);
      state.present = newState;
      state.future = []; // Clear future on new action
    },
    undo: (state) => {
      if (state.past.length === 0) return;

      const previous = state.past.pop()!;
      state.future.unshift(state.present);
      state.present = previous;
    },
    redo: (state) => {
      if (state.future.length === 0) return;

      const next = state.future.shift()!;
      state.past.push(state.present);
      state.present = next;
    },
    jumpToState: (state, action: PayloadAction<number>) => {
      // Jump to specific turn in history
      const targetIndex = action.payload;
      if (targetIndex < 0 || targetIndex >= state.past.length) return;

      // Reconstruct past/present/future
      state.present = state.past[targetIndex];
      state.past = state.past.slice(0, targetIndex);
      state.future = state.past.slice(targetIndex + 1);
    },
  },
});
```

**Integration Pattern:**
```typescript
// hooks/useGame.ts - Updated to use Redux
'use client';

import { useDispatch, useSelector } from 'react-redux';
import { makeChoice, undo, redo } from '@/store/slices/gameHistorySlice';

export function useGame() {
  const dispatch = useDispatch();
  const gameState = useSelector((state: RootState) => state.gameHistory.present);
  const canUndo = useSelector((state: RootState) => state.gameHistory.past.length > 0);
  const canRedo = useSelector((state: RootState) => state.gameHistory.future.length > 0);

  const handleChoice = (choice: Choice) => {
    dispatch(makeChoice({ scenario: currentScenario, choice }));
  };

  const handleUndo = () => {
    dispatch(undo());
  };

  const handleRedo = () => {
    dispatch(redo());
  };

  return {
    gameState,
    canUndo,
    canRedo,
    makeChoice: handleChoice,
    undo: handleUndo,
    redo: handleRedo,
  };
}
```

**Deliverables:**
- [ ] Redux Toolkit setup with TypeScript
- [ ] Game history slice with undo/redo
- [ ] Redux Provider in app layout
- [ ] Undo/Redo buttons in UI
- [ ] Turn history timeline component
- [ ] Jump to specific turn functionality
- [ ] Redux DevTools integration
- [ ] Design doc: `technical/redux-architecture.md`

**Interview Talking Points:**
- Redux vs Context: Redux for complex state logic, time-travel, middleware
- Redux Toolkit benefits: Less boilerplate, Immer for immutability, DevTools
- Time-travel debugging: Invaluable for debugging complex state changes

---

### Phase 7: Inventory System (useReducer) (Week 4)
**Branch**: `feature/inventory-system`

**Goals:**
- Inventory for ingredients, equipment
- Add/remove items
- Item effects on game
- Inventory UI with drag-and-drop (optional)

**Learning Objectives:**
- useReducer for complex state logic
- Discriminated unions for actions
- Item system design
- Integration with game mechanics

**Inventory Reducer:**
```typescript
// types/inventory.ts
interface InventoryItem {
  id: string;
  name: string;
  type: 'ingredient' | 'equipment' | 'consumable';
  quantity: number;
  effects?: ResourceEffects; // Apply when used
  durability?: number; // For equipment
}

interface InventoryState {
  items: InventoryItem[];
  maxSlots: number;
  usedSlots: number;
}

type InventoryAction =
  | { type: 'ADD_ITEM'; item: InventoryItem }
  | { type: 'REMOVE_ITEM'; itemId: string }
  | { type: 'USE_ITEM'; itemId: string }
  | { type: 'UPDATE_QUANTITY'; itemId: string; quantity: number }
  | { type: 'INCREASE_CAPACITY'; slots: number };

// hooks/useInventory.ts
function inventoryReducer(state: InventoryState, action: InventoryAction): InventoryState {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existingItem = state.items.find(i => i.id === action.item.id);

      if (existingItem) {
        // Stack existing item
        return {
          ...state,
          items: state.items.map(i =>
            i.id === action.item.id
              ? { ...i, quantity: i.quantity + action.item.quantity }
              : i
          ),
        };
      }

      // Check capacity
      if (state.usedSlots >= state.maxSlots) {
        throw new Error('Inventory full');
      }

      // Add new item
      return {
        ...state,
        items: [...state.items, action.item],
        usedSlots: state.usedSlots + 1,
      };
    }

    case 'REMOVE_ITEM': {
      return {
        ...state,
        items: state.items.filter(i => i.id !== action.itemId),
        usedSlots: state.usedSlots - 1,
      };
    }

    case 'USE_ITEM': {
      return {
        ...state,
        items: state.items.map(i =>
          i.id === action.itemId
            ? { ...i, quantity: i.quantity - 1 }
            : i
        ).filter(i => i.quantity > 0),
      };
    }

    // ... other cases

    default:
      return state;
  }
}

export function useInventory() {
  const [state, dispatch] = useReducer(inventoryReducer, {
    items: [],
    maxSlots: 10,
    usedSlots: 0,
  });

  return {
    inventory: state,
    addItem: (item: InventoryItem) => dispatch({ type: 'ADD_ITEM', item }),
    removeItem: (itemId: string) => dispatch({ type: 'REMOVE_ITEM', itemId }),
    useItem: (itemId: string) => dispatch({ type: 'USE_ITEM', itemId }),
  };
}
```

**Integration with Redux (Optional):**
```typescript
// If inventory should persist across game sessions, move to Redux
// store/slices/inventorySlice.ts
const inventorySlice = createSlice({
  name: 'inventory',
  initialState: {
    items: [],
    maxSlots: 10,
    usedSlots: 0,
  },
  reducers: {
    addItem: (state, action: PayloadAction<InventoryItem>) => {
      // Same logic as useReducer, but with Immer
    },
    // ... other reducers
  },
});
```

**Deliverables:**
- [ ] Inventory types and interfaces
- [ ] inventoryReducer with full logic
- [ ] useInventory custom hook
- [ ] Inventory UI component
- [ ] Item cards with icons
- [ ] Add/remove/use item buttons
- [ ] Integrate items with game scenarios
- [ ] Design doc: `game-design/inventory-system.md`

**Interview Talking Points:**
- useReducer vs useState: Complex state logic, multiple sub-values, next state depends on previous
- Discriminated unions: Type-safe actions, exhaustive checking
- When to use useReducer vs Redux: useReducer for component-scoped, Redux for app-wide

---

### Phase 8: Tech Tree & Upgrades (Redux) (Week 5)
**Branch**: `feature/tech-tree`

**Goals:**
- Simple upgrade tree (5-8 upgrades)
- Prerequisites and dependencies
- Permanent buffs to resources
- Tech tree visualization

**Learning Objectives:**
- Graph data structures
- Dependency resolution
- Redux for persistent upgrades
- SVG for tech tree visualization (optional)

**Upgrade Definitions:**
```typescript
interface Upgrade {
  id: string;
  name: string;
  description: string;
  cost: { money?: number; reputation?: number };
  effects: {
    // Permanent buffs
    moneyMultiplier?: number;    // 1.1 = 10% more money from choices
    reputationBonus?: number;    // +5 reputation per turn
    energyRegeneration?: number; // +2 energy per turn
    maxInventorySlots?: number;  // Increase inventory
  };
  prerequisites: string[]; // IDs of required upgrades
  category: 'efficiency' | 'capacity' | 'reputation' | 'income';
}

const UPGRADES: Upgrade[] = [
  {
    id: 'better_grill',
    name: 'Professional Grill',
    description: 'Upgrade to a high-quality grill for faster cooking',
    cost: { money: 100 },
    effects: { moneyMultiplier: 1.1 },
    prerequisites: [],
    category: 'efficiency',
  },
  {
    id: 'hire_assistant',
    name: 'Hire Assistant',
    description: 'Hire help to reduce workload',
    cost: { money: 150, reputation: 10 },
    effects: { energyRegeneration: 2 },
    prerequisites: ['better_grill'],
    category: 'capacity',
  },
  {
    id: 'premium_ingredients',
    name: 'Premium Ingredients',
    description: 'Source higher quality ingredients',
    cost: { money: 200 },
    effects: { reputationBonus: 5, moneyMultiplier: 1.15 },
    prerequisites: ['better_grill'],
    category: 'reputation',
  },
  // ... more upgrades
];
```

**Redux Slice:**
```typescript
// store/slices/techTreeSlice.ts
interface TechTreeState {
  unlockedUpgrades: string[]; // IDs of unlocked upgrades
  activeEffects: {
    moneyMultiplier: number;
    reputationBonus: number;
    energyRegeneration: number;
    maxInventorySlots: number;
  };
}

const techTreeSlice = createSlice({
  name: 'techTree',
  initialState: {
    unlockedUpgrades: [],
    activeEffects: {
      moneyMultiplier: 1.0,
      reputationBonus: 0,
      energyRegeneration: 0,
      maxInventorySlots: 10,
    },
  } as TechTreeState,
  reducers: {
    unlockUpgrade: (state, action: PayloadAction<string>) => {
      const upgradeId = action.payload;
      const upgrade = UPGRADES.find(u => u.id === upgradeId);

      if (!upgrade) return;

      // Check prerequisites
      const hasPrereqs = upgrade.prerequisites.every(prereq =>
        state.unlockedUpgrades.includes(prereq)
      );

      if (!hasPrereqs) {
        console.error('Prerequisites not met');
        return;
      }

      // Add to unlocked
      state.unlockedUpgrades.push(upgradeId);

      // Apply effects
      if (upgrade.effects.moneyMultiplier) {
        state.activeEffects.moneyMultiplier *= upgrade.effects.moneyMultiplier;
      }
      if (upgrade.effects.reputationBonus) {
        state.activeEffects.reputationBonus += upgrade.effects.reputationBonus;
      }
      // ... other effects
    },

    resetTechTree: (state) => {
      state.unlockedUpgrades = [];
      state.activeEffects = {
        moneyMultiplier: 1.0,
        reputationBonus: 0,
        energyRegeneration: 0,
        maxInventorySlots: 10,
      };
    },
  },
});
```

**Integration with Game State:**
```typescript
// Update GameStateManager to apply tech tree effects
static applyChoice(gameState: GameState, scenario: Scenario, choice: Choice): GameState {
  const techTreeEffects = selectActiveEffects(store.getState()); // From Redux

  // Apply base effects
  let moneyChange = choice.effects.money || 0;
  let reputationChange = choice.effects.reputation || 0;

  // Apply tech tree multipliers
  moneyChange *= techTreeEffects.moneyMultiplier;
  reputationChange += techTreeEffects.reputationBonus;

  // ... rest of logic
}
```

**Deliverables:**
- [ ] Upgrade definitions (5-8 upgrades)
- [ ] Tech tree Redux slice
- [ ] Prerequisite checking logic
- [ ] Tech tree UI (grid or tree visualization)
- [ ] Purchase upgrade button
- [ ] Visual indicators for locked/unlocked
- [ ] Integration with game state (apply buffs)
- [ ] Persist tech tree to database (with game save)
- [ ] Design doc: `game-design/tech-tree-system.md`

**Interview Talking Points:**
- Tech tree as graph: Dependency resolution, topological sorting
- Redux for persistent upgrades: Survives across game sessions
- Multiplicative vs additive effects: Balance considerations

---

### Phase 9: Polish & Documentation (Week 5-6)
**Branch**: `feature/polish`

**Goals:**
- Code cleanup and refactoring
- Comprehensive documentation
- Performance optimization
- Accessibility improvements
- Design docs completion

**Tasks:**
- [ ] Performance audit (React DevTools Profiler)
- [ ] Memoization for expensive components (React.memo, useMemo)
- [ ] Code splitting and lazy loading
- [ ] Accessibility audit (ARIA labels, keyboard navigation)
- [ ] SEO optimization (metadata, OG tags)
- [ ] Error boundaries
- [ ] Loading states and skeletons
- [ ] Responsive design refinements
- [ ] Browser testing (Chrome, Firefox, Safari)
- [ ] Update all design docs with final architecture
- [ ] Create portfolio presentation doc

**Documentation Deliverables:**
- [ ] Complete architecture diagram
- [ ] API documentation
- [ ] Component documentation (Storybook optional)
- [ ] Database schema diagram
- [ ] Deployment guide
- [ ] README with screenshots
- [ ] Interview talking points document

---

## 📁 Design Documentation Structure

### Updated Folder Structure
```
design_docs/food-truck-manager-design/
├── CLAUDE.md (updated with Phase 1-9 progress)
├── PORTFOLIO_ENHANCEMENT_PLAN.md (this file)
├── INTERVIEW_TALKING_POINTS.md (new)
│
├── architecture/
│   ├── system-overview/
│   │   ├── high-level-architecture.md (updated)
│   │   └── state-management-strategy.md (new)
│   ├── authentication/
│   │   └── auth-architecture.md (new - Phase 1)
│   └── database/
│       └── schema-design.md (new - Phase 1)
│
├── game-design/
│   ├── core-mechanics/
│   │   ├── game-rules.md
│   │   └── resource-system.md
│   ├── achievements-system.md (new - Phase 4)
│   ├── inventory-system.md (new - Phase 7)
│   └── tech-tree-system.md (new - Phase 8)
│
├── technical/
│   ├── data-models/
│   │   └── core-types.md
│   ├── redux-architecture.md (new - Phase 6)
│   ├── game-persistence.md (new - Phase 3)
│   ├── leaderboard-architecture.md (new - Phase 5)
│   └── performance-optimization.md (new - Phase 9)
│
├── ui-ux/
│   ├── settings-system.md (new - Phase 2)
│   └── component-library.md (new - Phase 9)
│
└── learning/
    ├── nextjs-server-components-plan.md (existing)
    ├── redux-learning-notes.md (new - Phase 6)
    ├── react-query-patterns.md (new - Phase 5)
    └── lessons-learned.md (new - ongoing)
```

### Documentation Standards
Each design doc should include:
1. **Overview** - What is this feature?
2. **Learning Objectives** - What skills does this demonstrate?
3. **Technical Decisions** - Why did we choose this approach?
4. **Implementation Details** - Code patterns, architecture
5. **Interview Talking Points** - What to highlight in interviews
6. **Lessons Learned** - What worked, what didn't
7. **Future Enhancements** - What could be improved

---

## 🎤 Key Interview Talking Points

### State Management
**Question**: "How did you decide between Context, Redux, and React Query?"

**Answer**:
- Context API for user preferences (theme, settings) - low-frequency updates, global access
- Redux Toolkit for complex game state (inventory, tech tree) - time-travel debugging, complex state logic
- React Query for server state (leaderboards, user profile) - automatic caching, background refetching, optimistic updates
- useReducer for component-scoped complex state (inventory within a game session)

**Why this demonstrates senior skills**: Understanding when to use each tool, not using Redux for everything

### Authentication
**Question**: "Why NextAuth over building custom JWT?"

**Answer**:
- Industry standard with 50+ OAuth providers
- Security best practices built-in (CSRF protection, HttpOnly cookies)
- Faster development (focus on features, not reinventing auth)
- Easy to extend with custom providers
- However, I understand the underlying JWT flow and could implement custom auth if needed

**Why this demonstrates senior skills**: Pragmatic decision-making, knowing when to leverage libraries vs build custom

### Performance
**Question**: "How did you optimize this application?"

**Answer**:
- React.memo for expensive components (tech tree visualization)
- useMemo/useCallback for expensive calculations
- Code splitting with dynamic imports (lazy load dashboard)
- React Query caching reduces API calls
- Server Components for SEO and faster initial load
- Optimistic updates for better perceived performance

**Why this demonstrates senior skills**: Measured optimization, not premature optimization

### Database Design
**Question**: "How did you design your database schema?"

**Answer**:
- Normalized schema to avoid data duplication
- Proper indexing on frequently queried fields (userId, score, createdAt)
- JSON column for complex game state (flexibility)
- Foreign keys for referential integrity
- Considered future needs (multiple save slots, game modes)

**Why this demonstrates senior skills**: Data modeling, scalability considerations

---

## 🚀 Deployment Strategy

### Vercel Deployment
1. **Database**: Supabase PostgreSQL (free tier: 50k MAU, 500MB)
2. **Hosting**: Vercel (free tier: unlimited hobby projects)
3. **Environment Variables**:
   - `DATABASE_URL` - Supabase connection string
   - `NEXTAUTH_SECRET` - Auth secret
   - `NEXTAUTH_URL` - Production URL
   - `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` (if OAuth)

### Deployment Checklist
- [ ] Set up Supabase project
- [ ] Run Prisma migrations on production database
- [ ] Configure Vercel environment variables
- [ ] Test authentication flow in production
- [ ] Test database persistence
- [ ] Configure custom domain (optional)
- [ ] Set up analytics (Vercel Analytics free)

---

## 📊 Success Metrics

### Portfolio Impact
- **Demonstrates**: 8+ different React patterns
- **Tech Stack**: Modern (Next.js 15, React 19, Prisma, Redux Toolkit)
- **Complexity**: Full-stack application with auth, database, state management
- **Polish**: Production-ready with error handling, loading states, accessibility

### Interview Readiness
- Clear talking points for each technical decision
- Can explain trade-offs (why NextAuth over custom, why Redux for X)
- Demonstrates understanding of performance, security, UX
- Shows progression from simple to complex (git history)

---

## 🔄 Ongoing Maintenance

### After Initial 6 Weeks
**Nice-to-Have Enhancements** (future):
- [ ] Multiplayer mode with WebSockets
- [ ] AI-generated scenarios with OpenAI
- [ ] Daily challenges
- [ ] Social features (friends, sharing)
- [ ] Mobile app with React Native (code sharing)
- [ ] E2E tests with Playwright
- [ ] CI/CD pipeline with GitHub Actions
- [ ] Monitoring with Sentry
- [ ] Analytics dashboard with Vercel Analytics

**Portfolio Presentation**:
- [ ] Record demo video (2-3 minutes)
- [ ] Create presentation slides
- [ ] Write blog post about technical challenges
- [ ] Add to portfolio website
- [ ] GitHub README with badges, screenshots
- [ ] Deploy to custom domain

---

## 📝 Notes for Implementation

### Development Workflow
1. **Branch naming**: `feature/[phase-name]` (e.g., `feature/auth-system`)
2. **Commits**: Descriptive messages following conventional commits
3. **PR template**: Include what you learned, design decisions, testing notes
4. **Documentation**: Update design docs BEFORE merging each branch
5. **Testing**: Manual testing checklist for each phase

### Learning Strategy
- Complete one phase fully before starting next
- Document learning in real-time (not after the fact)
- Ask questions when stuck (better to understand than rush)
- Experiment in separate branches if unsure

### Time Management
- **Week 1**: Phases 1-2 (Auth + Settings)
- **Week 2**: Phases 3-4 (Save/Load + Achievements)
- **Week 3**: Phases 5-6 (Leaderboard + Redux)
- **Week 4**: Phases 7-8 (Inventory + Tech Tree)
- **Week 5-6**: Phase 9 (Polish + Documentation)

Adjust timeline as needed - learning is more important than speed!

---

**Last Updated**: 2025-01-26
**Status**: Planning Complete, Ready for Implementation
**Next Step**: Review plan, ask clarifying questions, begin Phase 1
