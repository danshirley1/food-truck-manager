# Food Truck Manager — Current Implementation

**Last updated:** 2026-05-17  
**Source of truth:** `food-truck-manager/web/src/` (design docs may lag; prefer this file for behaviour)

## Overview

Single Next.js 15 app (`web/`) with AI-generated scenarios and optional menu images. No separate `shared` package — game logic lives under `web/src/lib/`.

## Game length and turns

| Constant | Value | Location |
|----------|-------|----------|
| `TOTAL_TURNS` | **5** | `web/src/lib/types/core.ts` |

- **Lobby:** `turn === 0` before the player taps Start.
- **In play:** `turn` is the **current day** (1–5), 1-based in the UI.
- **Victory:** Completing day 5 (`completedTurn >= TOTAL_TURNS`).
- **Difficulty bands** (derived from `TOTAL_TURNS`):
  - Early: days 1–2 (`EARLY_TURN_END = 2`)
  - Mid: days 3–4 (`MID_TURN_END = 4`)
  - Late: day 5

Change game length by editing `TOTAL_TURNS` only; validation, prompts, and UI read it via import.

## Resources and failure

| Resource | Range | Lose when |
|----------|-------|-----------|
| Money | -999 … 999 | ≤ **0** (bankruptcy) |
| Reputation | 0 … 100 | ≤ 0 |
| Energy | 0 … 100 | ≤ 0 (burnout) |

Per-turn cap: combined business + menu deltas capped in `GameStateManager.applyTurn` (`MAX_CUMULATIVE_TURN_DELTA`).

## Daily turn flow (UI)

1. **Header** — `GameBoard`: money, reputation, energy, Chef's Kudos; day badge `Day n/5`.
2. **Today** — Location, crowd detail, crowd vibe (`dayContext`).
3. **Step 1 — Business** — 2–4 choices with **effect badges only** (money / reputation / energy). **No risk badges** in UI (`riskLevel` still in schema for AI).
4. **Step 2 — Menu** — Three specials labelled **A / B / C**; description left, image right; effects hidden until after submit.
5. **Submit** — Green “Send it!” when both steps selected.
6. **Chef's Kudos (verdict)** — `MenuFeedbackBanner`: stars, message, revealed menu effects, verdict reason, dish image. Stays visible while the next day loads.
7. **Next day** — New scenario after ~1s; previous verdict remains until the next submit.

## AI scenario generation

- **Endpoint:** `POST /api/scenarios/generate`
- **Model:** `OPENAI_MODEL` (default `gpt-4o-mini`)
- **Validation:** Zod + `validateGeneratedScenario()` in `web/src/lib/types/ai-schemas.ts`
- **Retries:** Up to 4 attempts with validation errors fed back into the prompt

### Content rules (enforced server-side)

- **Mixed effects:** Every business choice and every menu option must have at least one positive and one negative stat among money, reputation, energy (`enforceMixedEffects` + validation).
- **Menu tiers:** Exactly 3 menu options with distinct best / okay / bad fit for the crowd (`menuOptionsHaveDistinctTiers`).
- **Day variety:** `recentLocations`, `recentCrowdVibes`, `venueThemeHint` in `ScenarioContext` / `prompts.ts`.
- **Difficulty:** Must match `GameStateManager.getCurrentDifficulty(turn)`.

### `dayContext` shape

```typescript
{
  location: string;
  crowdDetail: string;  // not crowdProfile
  crowdVibe: string;
}
```

### Menu option shape (LLM)

```typescript
{
  label: string;
  description: string;
  effects: { money, reputation, energy };
  verdictReason: string;
}
```

## Menu images

After scenario text, **one OpenAI web search call** (Responses API) finds a direct HTTPS image URL for each menu special. No third-party food APIs.

| Piece | Role |
|-------|------|
| `resolve-menu-image-url.ts` | Batched OpenAI `web_search` → `imageUrl` per dish |
| `generate-scenario.ts` | Calls `attachMenuImageUrls` after moderation |
| `MenuSpecialImage` | Placeholder if URL missing or fails to load |

Optional env: `OPENAI_SEARCH_MODEL` (default `gpt-4o-mini`).

### Env

```bash
OPENAI_API_KEY=          # required
OPENAI_MODEL=            # default gpt-4o-mini
```

## Key files

| Area | Files |
|------|--------|
| UI | `TurnDecisionCard.tsx`, `MenuFeedbackBanner.tsx`, `GameBoard.tsx`, `page.tsx` |
| State | `hooks/useGame.ts`, `lib/engine/game-state.ts` |
| AI | `lib/ai/prompts.ts`, `generate-scenario.ts`, `validate-scenario.ts`, `ai-schemas.ts` |
| Images | `resolve-menu-image-url.ts`, `MenuSpecialImage.tsx`, `MENU_IMAGES.md` |

## Git / deploy

- Do not commit `web/.env` (contains secrets).
- Heroku POC noted in root `README.md`; user deploys manually.

## Related design docs (updated for alignment)

- `design_docs/.../game-design/daily-turn-flow.md`
- `design_docs/.../game-design/ai-integration/structured-output-schema.md`
- `design_docs/.../game-design/core-mechanics/game-rules.md`
- Root `README.md`
