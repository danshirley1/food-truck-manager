# Phase 1: Authentication System - Step-by-Step Implementation Guide

**Branch**: `feature/auth-system`
**Estimated Time**: Week 1 (5-7 days)
**Prerequisites**: Node.js, basic Next.js knowledge

---

## Overview

This phase implements a complete authentication system using NextAuth.js v5, PostgreSQL (Supabase), and Prisma ORM.

**What you'll build**:
- User registration with email/password
- Login/logout functionality
- Protected routes (dashboard)
- User profile page (Server Component)
- Session management with cookies

**What you'll learn**:
- NextAuth.js v5 configuration
- Prisma schema design and migrations
- Server Components vs Client Components
- Middleware for route protection
- Security best practices (password hashing, session management)

---

## Step 1: Setup Supabase Database (30 minutes)

### 1.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or login
3. Click "New Project"
4. Fill in:
   - **Name**: `food-truck-manager`
   - **Database Password**: Generate strong password (save it!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier
5. Wait 2-3 minutes for provisioning

### 1.2 Get Database Connection String

1. In Supabase dashboard, go to **Settings** → **Database**
2. Scroll to "Connection String" section
3. Copy the **Connection Pooling** URI (starts with `postgresql://`)
4. Replace `[YOUR-PASSWORD]` in the URI with your database password

Example:
```
postgresql://postgres.xyz:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres
```

### 1.3 Save to Environment Variables

Create `.env` file in `/web` directory:

```bash
cd /Users/danshirley/Documents/dev_workspaces/food-truck-manager/web
touch .env
```

Add to `.env`:
```env
# Database
DATABASE_URL="postgresql://postgres.xyz:your-password@aws-0-us-east-1.pooler.supabase.com:6543/postgres"

# NextAuth (we'll configure these next)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="generate-this-in-next-step"
```

**Generate `NEXTAUTH_SECRET`:**
```bash
openssl rand -base64 32
```

Copy the output and replace `"generate-this-in-next-step"` with it.

### 1.4 Update `.gitignore`

Make sure `.env` is ignored (should already be there):
```
.env
.env.local
```

---

## Step 2: Install Dependencies (10 minutes)

### 2.1 Install Packages

```bash
cd /Users/danshirley/Documents/dev_workspaces/food-truck-manager/web

# Authentication
npm install next-auth@beta  # NextAuth v5 is still in beta

# Database & ORM
npm install @prisma/client
npm install -D prisma

# Password hashing
npm install bcryptjs
npm install -D @types/bcryptjs

# Form validation
npm install react-hook-form @hookform/resolvers
```

**Why these packages?**
- `next-auth@beta`: NextAuth v5 with App Router support
- `@prisma/client`: Type-safe database client
- `prisma`: CLI for migrations and schema management
- `bcryptjs`: Secure password hashing (used in registration)
- `react-hook-form`: Form state management with validation

### 2.2 Initialize Prisma

```bash
npx prisma init
```

This creates:
- `prisma/schema.prisma` - Database schema definition
- Updates `.env` with `DATABASE_URL` (already added)

---

## Step 3: Create Database Schema (30 minutes)

### 3.1 Update `prisma/schema.prisma`

Replace the entire file with:

```prisma
// This is your Prisma schema file
// Learn more: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// NextAuth.js required models
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  image         String?
  password      String?   // For credentials provider
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  accounts      Account[]
  sessions      Session[]

  @@map("users")
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}
```

**Key points:**
- `@default(cuid())`: Generates collision-resistant unique IDs
- `@unique`: Ensures email uniqueness
- `onDelete: Cascade`: Deletes related records when user is deleted
- `@@map()`: Custom table names (lowercase plural convention)

### 3.2 Generate Prisma Client

```bash
npx prisma generate
```

This creates TypeScript types based on your schema.

### 3.3 Run Migration

```bash
npx prisma migrate dev --name init_auth_tables
```

This:
1. Creates tables in Supabase
2. Generates migration files in `prisma/migrations/`
3. Updates Prisma client

**Verify in Supabase:**
1. Go to Supabase dashboard → **Table Editor**
2. You should see: `users`, `accounts`, `sessions`, `verification_tokens`

### 3.4 Create Prisma Client Instance

Create `web/src/lib/prisma.ts`:

```typescript
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
```

**Why this pattern?**
- Prevents multiple Prisma instances in development (hot reload)
- Logs queries in dev, only errors in production
- Singleton pattern for database connection

---

## Step 4: Configure NextAuth.js (45 minutes)

### 4.1 Create Auth Configuration

Create `web/src/lib/auth.ts`:

```typescript
import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from './prisma';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),

  session: {
    strategy: 'jwt', // Use JWT instead of database sessions
  },

  pages: {
    signIn: '/login',
    signUp: '/register',
    error: '/error',
  },

  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },

      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials');
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user || !user.password) {
          throw new Error('Invalid credentials');
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          throw new Error('Invalid credentials');
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          image: user.image,
        };
      },
    }),
  ],

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },

  debug: process.env.NODE_ENV === 'development',
};
```

**What's happening here:**
- **PrismaAdapter**: Connects NextAuth to Prisma/PostgreSQL
- **JWT strategy**: Tokens stored in cookies (not database sessions)
- **CredentialsProvider**: Email/password authentication
- **authorize()**: Validates credentials, checks password hash
- **callbacks**: Add user ID to session for easy access

### 4.2 Install Prisma Adapter

```bash
npm install @auth/prisma-adapter
```

### 4.3 Create API Route Handler

Create `web/src/app/api/auth/[...nextauth]/route.ts`:

```typescript
import NextAuth from 'next-auth';
import { authOptions } from '@/lib/auth';

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
```

**Why this file structure?**
- `[...nextauth]` is a catch-all route
- Handles all NextAuth routes: `/api/auth/signin`, `/api/auth/signout`, etc.
- `GET` and `POST` exports handle both HTTP methods

### 4.4 Extend NextAuth Types

Create `web/src/types/next-auth.d.ts`:

```typescript
import 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name?: string | null;
      image?: string | null;
    };
  }

  interface User {
    id: string;
    email: string;
    name?: string | null;
    image?: string | null;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
  }
}
```

**Why?**
- Adds `id` to session.user (TypeScript support)
- Autocomplete in your IDE when accessing `session.user.id`

---

## Step 5: Create Registration System (1 hour)

### 5.1 Create Registration API Route

Create `web/src/app/api/register/route.ts`:

```typescript
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { z } from 'zod';

const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional(),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input
    const validatedData = registerSchema.parse(body);

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(validatedData.password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: validatedData.email,
        password: hashedPassword,
        name: validatedData.name,
      },
    });

    // Return user (without password)
    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }

    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
```

**Security notes:**
- Validates input with Zod
- Hashes password with bcrypt (cost factor: 12)
- Never returns password in response
- Checks for existing user first

### 5.2 Create Register Page

Create `web/src/app/register/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Register user
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Auto-login after registration
      const signInResult = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        throw new Error('Login failed after registration');
      }

      // Redirect to dashboard
      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Create Account</CardTitle>
          <CardDescription>
            Sign up to save your game progress and compete on the leaderboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="name">Name (optional)</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
              />
            </div>

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="At least 8 characters"
                required
                minLength={8}
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-blue-600 hover:underline">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

### 5.3 Create Missing UI Components

You'll need to add Input and Label components to shadcn/ui:

```bash
npx shadcn@latest add input label
```

This adds pre-styled form components.

---

## Step 6: Create Login Page (30 minutes)

Create `web/src/app/login/page.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function LoginPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (result?.error) {
        throw new Error('Invalid email or password');
      }

      router.push('/dashboard');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Sign in to your Food Truck Manager account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-800 rounded-md text-sm">
                {error}
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Your password"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-4 text-center text-sm">
            Don't have an account?{' '}
            <Link href="/register" className="text-blue-600 hover:underline">
              Sign up
            </Link>
          </div>

          <div className="mt-2 text-center text-sm">
            <Link href="/" className="text-gray-600 hover:underline">
              Continue as guest
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
```

---

## Step 7: Create Dashboard (Server Component) (45 minutes)

### 7.1 Create Auth Helper

Create `web/src/lib/auth-helpers.ts`:

```typescript
import { getServerSession } from 'next-auth';
import { authOptions } from './auth';
import { redirect } from 'next/navigation';

export async function getSession() {
  return await getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user;
}

export async function requireAuth() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  return session;
}
```

### 7.2 Create Dashboard Page (Server Component)

Create `web/src/app/dashboard/page.tsx`:

```typescript
import { requireAuth } from '@/lib/auth-helpers';
import { prisma } from '@/lib/prisma';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { UserIcon, TrophyIcon, PlayIcon } from 'lucide-react';
import { SignOutButton } from '@/components/SignOutButton';

export default async function DashboardPage() {
  const session = await requireAuth();

  // Fetch user data from database
  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      id: true,
      email: true,
      name: true,
      createdAt: true,
    },
  });

  if (!user) {
    throw new Error('User not found');
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-gray-600">Welcome back, {user.name || 'Player'}!</p>
          </div>
          <SignOutButton />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <UserIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{user.name || 'Anonymous'}</div>
              <p className="text-xs text-muted-foreground">{user.email}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Games Played</CardTitle>
              <PlayIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Coming in Phase 3</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Best Score</CardTitle>
              <TrophyIcon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">-</div>
              <p className="text-xs text-muted-foreground">Coming in Phase 5</p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Start playing or manage your account
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-4">
            <Button asChild>
              <Link href="/">Play Game</Link>
            </Button>
            <Button variant="outline" disabled>
              View Saved Games (Phase 3)
            </Button>
            <Button variant="outline" disabled>
              Leaderboard (Phase 5)
            </Button>
          </CardContent>
        </Card>

        {/* Account Info */}
        <Card>
          <CardHeader>
            <CardTitle>Account Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-gray-600">Member since:</span>
              <span className="font-medium">
                {new Date(user.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Account ID:</span>
              <span className="font-mono text-sm">{user.id}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

**Why Server Component?**
- Fetches data on server (faster, no loading state needed)
- SEO-friendly (pre-rendered HTML)
- Smaller client bundle (no client-side React code)
- Direct database access (no API route needed)

### 7.3 Create Sign Out Button (Client Component)

Create `web/src/components/SignOutButton.tsx`:

```typescript
'use client';

import { signOut } from 'next-auth/react';
import { Button } from './ui/button';
import { LogOutIcon } from 'lucide-react';

export function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <Button onClick={handleSignOut} variant="outline">
      <LogOutIcon className="w-4 h-4 mr-2" />
      Sign Out
    </Button>
  );
}
```

**Why Client Component?**
- Needs `onClick` handler (interactivity)
- Uses `signOut()` from next-auth/react (client-side function)

---

## Step 8: Add Middleware for Route Protection (20 minutes)

Create `web/src/middleware.ts`:

```typescript
import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    // This runs for authenticated requests
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

// Protect these routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    // Add more protected routes here as you build them
    // '/profile/:path*',
    // '/settings/:path*',
  ],
};
```

**What this does:**
- Redirects unauthenticated users to `/login` when accessing `/dashboard`
- Runs before page renders (fast, server-side)
- Uses JWT token to check authentication

---

## Step 9: Update Home Page with Auth Status (15 minutes)

Update `web/src/app/page.tsx` to show login/dashboard links:

```typescript
'use client';

import { GameBoard } from '@/components/GameBoard';
import { ScenarioCard } from '@/components/ScenarioCard';
import { GameOverCard } from '@/components/GameOverCard';
import { LoadingCard } from '@/components/LoadingCard';
import { useGame } from '@/hooks/useGame';
import { Choice } from '@/lib/game';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Truck, Play, UserIcon, LogInIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Home() {
  const { data: session, status } = useSession();
  const {
    gameState,
    currentScenario,
    isLoading,
    makeChoice,
    startNewGame,
    restartGame,
  } = useGame();

  const handleStartGame = () => {
    startNewGame();
  };

  const handleChoice = (choice: Choice) => {
    makeChoice(choice);
  };

  // Show splash screen if we haven't started the game yet
  if (gameState.turn === 0 && !currentScenario && !isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center pb-4">
            <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center">
              <Truck className="w-8 h-8 text-orange-600" />
            </div>
            <CardTitle className="text-2xl">Food Truck Manager</CardTitle>
            <CardDescription className="text-base">
              Manage your food truck through 15 days of business! Balance your money, reputation, and energy to succeed.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button onClick={handleStartGame} className="w-full" size="lg">
              <Play className="w-4 h-4 mr-2" />
              Start Your Food Truck Adventure
            </Button>

            {/* Auth Status */}
            <div className="pt-4 border-t">
              {status === 'loading' ? (
                <div className="text-center text-sm text-gray-600">Loading...</div>
              ) : session ? (
                <div className="space-y-2">
                  <div className="text-center text-sm text-gray-600">
                    Signed in as {session.user.email}
                  </div>
                  <Button variant="outline" className="w-full" asChild>
                    <Link href="/dashboard">
                      <UserIcon className="w-4 h-4 mr-2" />
                      Go to Dashboard
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="text-center text-sm text-gray-600">
                    Sign in to save your progress
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button variant="outline" asChild>
                      <Link href="/login">
                        <LogInIcon className="w-4 h-4 mr-2" />
                        Sign In
                      </Link>
                    </Button>
                    <Button variant="outline" asChild>
                      <Link href="/register">Sign Up</Link>
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 p-4">
      <div className="max-w-4xl mx-auto">
        <GameBoard gameState={gameState} />

        {gameState.gameOver && (
          <GameOverCard gameState={gameState} onRestart={restartGame} />
        )}

        {!gameState.gameOver && currentScenario && (
          <ScenarioCard
            scenario={currentScenario}
            onChoice={handleChoice}
            disabled={isLoading}
          />
        )}

        {isLoading && !gameState.gameOver && (
          <LoadingCard />
        )}
      </div>
    </div>
  );
}
```

### 9.1 Wrap App with SessionProvider

Update `web/src/app/layout.tsx`:

```typescript
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { SessionProvider } from '@/components/SessionProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Food Truck Manager",
  description: "Manage your food truck business simulation game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  );
}
```

### 9.2 Create SessionProvider Component

Create `web/src/components/SessionProvider.tsx`:

```typescript
'use client';

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react';
import { ReactNode } from 'react';

export function SessionProvider({ children }: { children: ReactNode }) {
  return (
    <NextAuthSessionProvider>
      {children}
    </NextAuthSessionProvider>
  );
}
```

---

## Step 10: Test Everything (30 minutes)

### 10.1 Start Development Server

```bash
cd /Users/danshirley/Documents/dev_workspaces/food-truck-manager/web
npm run dev
```

### 10.2 Test Registration Flow

1. Go to [http://localhost:3000](http://localhost:3000)
2. Click "Sign Up"
3. Fill in registration form:
   - Name: "Test User"
   - Email: "test@example.com"
   - Password: "testpassword123"
4. Submit → Should redirect to dashboard
5. Verify in Supabase dashboard:
   - Go to Table Editor → users
   - See your new user

### 10.3 Test Login Flow

1. Sign out (click "Sign Out" button on dashboard)
2. Go to /login
3. Enter credentials
4. Should redirect to dashboard

### 10.4 Test Protected Routes

1. Sign out
2. Try to access [http://localhost:3000/dashboard](http://localhost:3000/dashboard)
3. Should redirect to /login

### 10.5 Test Session Persistence

1. Sign in
2. Refresh page → Should stay logged in
3. Close browser, reopen → Should stay logged in (JWT in cookie)

---

## Step 11: Document and Commit (30 minutes)

### 11.1 Create Architecture Documentation

Create `web/src/architecture/authentication/auth-architecture.md`:

```markdown
# Authentication Architecture

## Overview
NextAuth.js v5 with PostgreSQL (Supabase) for user authentication.

## Components

### Database Schema
- **users**: User accounts with email/password
- **accounts**: OAuth provider accounts (future)
- **sessions**: Active sessions (not used with JWT strategy)
- **verification_tokens**: Email verification (future)

### NextAuth Configuration
- **Strategy**: JWT (tokens in HttpOnly cookies)
- **Providers**: Credentials (email/password)
- **Adapter**: Prisma adapter for database integration

### Routes
- `/api/auth/[...nextauth]`: NextAuth API routes
- `/api/register`: User registration endpoint
- `/login`: Login page (client component)
- `/register`: Registration page (client component)
- `/dashboard`: Protected user dashboard (server component)

### Security
- Passwords hashed with bcrypt (cost factor: 12)
- Session tokens in HttpOnly cookies (XSS protection)
- CSRF protection via NextAuth
- Input validation with Zod
- Middleware for route protection

## Learning Objectives Achieved
✅ NextAuth.js v5 setup with App Router
✅ Prisma schema design and migrations
✅ Server Components for dashboard (SSR)
✅ Client Components for interactivity (forms, buttons)
✅ Middleware for route protection
✅ Password hashing with bcrypt
✅ Form validation with Zod

## Interview Talking Points
- **Why NextAuth**: Industry standard, OAuth ready, security best practices
- **Why JWT**: Stateless, scales better than database sessions
- **Why Server Components**: Faster initial load, SEO, smaller client bundle
- **Security**: HttpOnly cookies, bcrypt hashing, input validation
```

### 11.2 Create Branch and Commit

```bash
# Create feature branch
git checkout -b feature/auth-system

# Add all files
git add .

# Commit with descriptive message
git commit -m "feat: implement authentication system (Phase 1)

- Add NextAuth.js v5 with Prisma adapter
- Configure PostgreSQL database with Supabase
- Create user registration with bcrypt password hashing
- Implement login/logout functionality
- Add protected dashboard route (Server Component)
- Configure middleware for route protection
- Add session management with JWT strategy
- Implement form validation with Zod

Database:
- Create users, accounts, sessions tables
- Add Prisma migrations

Security:
- HttpOnly cookies for XSS protection
- CSRF protection via NextAuth
- Password hashing with bcrypt (cost: 12)
- Server-side session validation

Learning objectives achieved:
- NextAuth.js v5 configuration
- Prisma schema design
- Server vs Client Components
- Middleware for auth
- PostgreSQL with Supabase

🤖 Generated with Claude Code
Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 11.3 Update CLAUDE.md

Add to design_docs/food-truck-manager-design/CLAUDE.md:

```markdown
### 2025-01-26 - Phase 1 Complete: Authentication System
- **NextAuth.js v5**: Configured with Credentials provider
- **Database**: PostgreSQL (Supabase) with Prisma ORM
- **Tables**: users, accounts, sessions, verification_tokens
- **Features**: Registration, login, logout, protected routes
- **Dashboard**: Server Component with user data
- **Security**: bcrypt hashing, HttpOnly cookies, Zod validation
- **Middleware**: Route protection for /dashboard
- **Learning**: Server Components, JWT strategy, Prisma migrations
```

---

## Troubleshooting

### Issue: Prisma Client not generated
**Solution:**
```bash
npx prisma generate
```

### Issue: Database connection failed
**Solution:**
- Check DATABASE_URL in .env
- Verify Supabase database is running
- Check password is correct (no special characters breaking URI)

### Issue: NextAuth redirect loop
**Solution:**
- Check NEXTAUTH_URL matches your dev server
- Verify NEXTAUTH_SECRET is set
- Clear cookies and try again

### Issue: "Module not found: Can't resolve 'next-auth/react'"
**Solution:**
```bash
npm install next-auth@beta
```

### Issue: Middleware not protecting routes
**Solution:**
- Check middleware.ts is at root of /web/src
- Verify matcher paths in config
- Restart dev server

---

## Next Steps

✅ Phase 1 Complete!

**Next Phase**: Phase 2 - Settings & Preferences (Context API)

Before moving on:
- [ ] Test all flows thoroughly
- [ ] Push feature branch to GitHub
- [ ] Review code for any improvements
- [ ] Update documentation with any issues encountered
- [ ] Rest and let concepts sink in!

**Estimated time for Phase 1**: 5-7 days
**Actual time**: _____ (fill in when complete)
**Challenges faced**: _____ (document for learning)

---

**Created**: 2025-01-26
**Status**: Ready for implementation
**Branch**: `feature/auth-system`
