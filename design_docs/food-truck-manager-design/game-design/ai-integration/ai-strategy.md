# AI integration

**Last updated:** 2026-06-22

## Division of labour

| AI does | Server does |
|---------|-------------|
| Scenario narrative, choices, menu copy | Zod validation, retries |
| Crowd/location flavour text | Effect normalization + caps |
| `imageSearchTerm` per menu item | Web-search image URLs |
| — | Win/loss, turn progression |

No static scenario fallback — `OPENAI_API_KEY` required.

## Endpoints

| Route | Purpose |
|-------|---------|
| `POST /api/scenarios/generate` | Full day scenario + menu image URLs |
| `POST /api/signature-dish/generate` | User dish → HF moderation → OpenAI image |

Default model: `gpt-4o-mini`.

## Validation pipeline

1. OpenAI structured JSON
2. Zod parse (`ai-schemas.ts`)
3. Mixed effects on every choice + menu option
4. Three distinct menu fit tiers
5. Difficulty must match turn band
6. OpenAI moderation on scenario text (separate from Signature Dish HF model)

Up to **4 retries** with validation errors in the prompt.

## User text moderation

Custom fine-tuned model — not generic toxicity. See `docs/ai-generated/TEXT_MODERATION.md`.

## Schema detail

`game-design/ai-integration/structured-output-schema.md`

## Prompts

`web/src/lib/ai/prompts.ts` — system rules, day variety (`recentLocations`, `venueThemeHint`), difficulty context.
