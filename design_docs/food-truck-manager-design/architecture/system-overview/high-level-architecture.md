# Architecture

**Last updated:** 2026-06-22 — reflects **shipped** demo, not future AWS plans.

## Overview

Single **Next.js 15** app. Server components + API routes. No separate backend service, database, or auth in the current build.

```
Browser (React)
    │
    ├─► POST /api/scenarios/generate     OpenAI (scenario + menu web-search images)
    ├─► POST /api/signature-dish/generate OpenAI (image) + HF (moderation)
    │
    └─► Client state: useGame hook → GameStateManager (in-memory)
```

## Stack

| Layer | Tech |
|-------|------|
| UI | React 19, Tailwind v4, shadcn/ui |
| Server | Next.js App Router, API routes |
| Validation | Zod |
| AI | OpenAI (`gpt-4o-mini`, web search, image gen) |
| ML | Hugging Face Inference — `dshirls/food-truck-moderation-v1` |
| Tests | Vitest (43) |
| Deploy | Heroku (POC) |

## Design principles

- **AI proposes, server decides** — LLM outputs JSON; Zod + game engine enforce rules
- **Simple state** — in-memory session; no persistence in demo
- **Portfolio scope** — readable codebase over feature breadth

## Key paths

```
web/src/
  app/              pages + API routes
  components/       UI
  hooks/            useGame, useSignatureDish
  lib/engine/       game-state.ts
  lib/ai/           scenario generation, images
  lib/moderation/   Signature Dish gate
ml/text-moderation/ train + dataset
```

## Future (not built)

Auth, PostgreSQL, leaderboards, AWS Lambda/DynamoDB — see `PORTFOLIO_ENHANCEMENT_PLAN.md`.

**Implementation detail:** `docs/ai-generated/CURRENT_IMPLEMENTATION.md`
