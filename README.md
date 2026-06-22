# Food Truck Manager

Portfolio demo: a **5-day food truck simulation** where each day’s scenario is AI-generated. Players balance money, reputation, and energy through business and menu choices. An optional **Signature Dish** feature lets players describe a custom special — moderated, then rendered as an AI image.

**Live demo:** https://food-truck-manager-8397e84e2f8b.herokuapp.com/

## What it demonstrates

- **AI integration** — structured OpenAI outputs (Zod validation, retries); server applies all game rules
- **Custom ML moderation** — fine-tuned DistilBERT on Hugging Face so gross game humour (e.g. cockroach salad) is allowed while profanity and hate are blocked; two-pass pipeline with a pre-trained safety model
- **Full-stack TypeScript** — Next.js 15 app with API routes, no separate backend in the shipped demo

## Quick start

### Prerequisites

- **Node.js 22.x** (`nvm use` reads `.nvmrc`)
- **Yarn** (or npm)

### Run locally

```bash
cp web/.env.example web/.env   # set OPENAI_API_KEY at minimum
yarn dev                         # http://localhost:3000
```

For Signature Dish moderation locally, either:

- `TEXT_MODERATION_PROVIDER=local-model` after training (`ml/text-moderation/`), or  
- `TEXT_MODERATION_PROVIDER=huggingface` with `HUGGINGFACE_API_KEY` and `HUGGINGFACE_INFERENCE_ENDPOINT`

See `web/.env.example` for all variables.

### Tests

```bash
npm test        # from repo root (runs web Vitest suite)
cd web && npm test
```

## How to play

1. Start a new game.
2. Each day: choose a **business decision**, then a **menu special (A/B/C)**, and submit.
3. Optionally describe a **Signature Dish** in the side panel (max 200 characters).

**Win:** complete day 5. **Lose:** money ≤ 0, reputation ≤ 0, or energy ≤ 0.

## Project structure

```
food-truck-manager/
├── web/                      # Next.js 15 app (UI + API routes)
│   └── src/
│       ├── app/              # pages, API routes
│       ├── components/       # React UI
│       ├── hooks/            # useGame, useSignatureDish
│       └── lib/
│           ├── engine/       # game state & rules
│           ├── ai/           # scenario generation, menu images, Signature Dish
│           └── moderation/   # Signature Dish text gate
├── ml/text-moderation/       # Python — dataset, train, push to Hugging Face Hub
├── docs/ai-generated/        # implementation & ops notes
└── design_docs/              # concise design & interview talking points
```

Single app, in-memory game state (no database or auth in the main demo).

## Scripts (repo root)

| Command | Description |
|---------|-------------|
| `yarn dev` | Start Next.js dev server |
| `yarn build` | Production build |
| `yarn start` | Run production server |
| `yarn lint` | ESLint |
| `npm test` | Unit tests |
| `npm run deploy` | Preflight + test + build + push to Heroku |

## Deployment (Heroku)

```bash
heroku git:remote -a food-truck-manager --remote food-truck   # once
npm run deploy                                              # requires clean git + committed main
```

Set config vars on the app (at minimum `OPENAI_API_KEY`; for Signature Dish add moderation vars from `web/.env.example`). Custom HF models need a dedicated **Inference Endpoint** URL — not the shared `hf-inference` catalog.

## Documentation

| Doc | Purpose |
|-----|---------|
| [`docs/ai-generated/CURRENT_IMPLEMENTATION.md`](docs/ai-generated/CURRENT_IMPLEMENTATION.md) | What is built today |
| [`docs/ai-generated/TEXT_MODERATION.md`](docs/ai-generated/TEXT_MODERATION.md) | Moderation pipeline |
| [`docs/ai-generated/HF_TRAINING_GUIDE.md`](docs/ai-generated/HF_TRAINING_GUIDE.md) | Train / push model |
| [`docs/ai-generated/DEMO_RUSH_GUIDE.md`](docs/ai-generated/DEMO_RUSH_GUIDE.md) | Demo checklist |
| [`design_docs/food-truck-manager-design/INTERVIEW_TALKING_POINTS.md`](design_docs/food-truck-manager-design/INTERVIEW_TALKING_POINTS.md) | Interview pitch |

## License

MIT
