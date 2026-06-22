# Food Truck Manager — Current Implementation

**Last updated:** 2026-06-22  
**Source of truth:** `web/src/` (prefer this over design docs for behaviour)

## Stack

Single **Next.js 15** app (`web/`). React 19, TypeScript, Tailwind v4, Zod. Game logic in `web/src/lib/`. No separate backend, DB, or auth in the shipped demo.

## Game

| | |
|---|---|
| Length | **5 days** (`TOTAL_TURNS` in `web/src/lib/types/core.ts`) |
| Resources | Money −999…999, reputation 0–100, energy 0–100 |
| Win | Complete day 5 |
| Lose | Money ≤ 0, reputation ≤ 0, or energy ≤ 0 |

Each day: **business decision** → **menu special A/B/C** → submit → **Chef's Kudos** verdict. Optional **Signature Dish** side panel (free text → moderation → AI image).

## AI scenarios

- `POST /api/scenarios/generate` — OpenAI (`gpt-4o-mini` default)
- Zod validation + up to 4 retries with error feedback
- Mixed effects required on every choice and menu option
- Three menu tiers (best / okay / bad fit for crowd)
- `dayContext`: `location`, `crowdDetail`, `crowdVibe`

## Menu images

One batched **OpenAI web search** call per day attaches `imageUrl` to each menu special (`resolve-menu-image-url.ts`). Placeholder if search fails.

## Signature Dish + moderation

- `POST /api/signature-dish/generate` — moderate then OpenAI image
- **Custom model:** `dshirls/food-truck-moderation-v1` on [Hugging Face](https://huggingface.co/dshirls/food-truck-moderation-v1) — binary **allowed / blocked**
- **Providers:** `huggingface` (production/Heroku) or `local-model` (dev, runs `ml/text-moderation/infer_daemon.py`)
- Pre-trained toxicity models (e.g. `unitary/unbiased-toxic-roberta`) block gross food humour incorrectly — do not use

## Dev & deploy

```bash
yarn dev          # from repo root
cd web && npm test   # 43 tests
```

- Dev uses webpack (not Turbopack — Tailwind v4 incompatibility)
- `web/scripts/ensure-native-deps.mjs` installs darwin arm64+x64 natives on macOS (Tailwind, Rollup, esbuild)
- Heroku: `npm run deploy:heroku` (pushes `main` to `food-truck-manager` app)

## Key files

| Area | Path |
|------|------|
| UI | `components/TurnDecisionCard.tsx`, `MenuFeedbackBanner.tsx`, `SignatureDishPanel.tsx`, `GameBoard.tsx` |
| State | `hooks/useGame.ts`, `lib/engine/game-state.ts` |
| AI | `lib/ai/generate-scenario.ts`, `prompts.ts`, `ai-schemas.ts` |
| Moderation | `lib/moderation/moderate-text.ts`, `providers/huggingface.ts`, `providers/local-model.ts` |
| ML | `ml/text-moderation/train.py`, `push-to-hub.sh`, `datasets/signature-dish-samples.csv` |

## Env (minimum)

```bash
OPENAI_API_KEY=...
TEXT_MODERATION_ENABLED=true
TEXT_MODERATION_PROVIDER=huggingface
HUGGINGFACE_API_KEY=...                    # Write + Inference
HUGGINGFACE_MODERATION_MODEL=dshirls/food-truck-moderation-v1
TEXT_MODERATION_THRESHOLD=0.5
```

Local-only moderation: `TEXT_MODERATION_PROVIDER=local-model` (requires trained weights in `ml/text-moderation/output/model`).

## Doc index

| Doc | Purpose |
|-----|---------|
| [`TEXT_MODERATION.md`](./TEXT_MODERATION.md) | Moderation flow + providers |
| [`SIGNATURE_DISH.md`](./SIGNATURE_DISH.md) | Signature Dish feature |
| [`HF_TRAINING_GUIDE.md`](./HF_TRAINING_GUIDE.md) | Train / push model |
| [`MENU_IMAGES.md`](./MENU_IMAGES.md) | Menu photo web search |
| [`DEMO_RUSH_GUIDE.md`](./DEMO_RUSH_GUIDE.md) | Same-day demo checklist |
| [`RESUME_HERE.md`](./RESUME_HERE.md) | Handoff snapshot |
