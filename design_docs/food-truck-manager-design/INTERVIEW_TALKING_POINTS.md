# Interview talking points

**Last updated:** 2026-06-22 — matches **what is built**, not roadmap items.

## 30-second pitch

> Food Truck Manager is a Next.js portfolio piece: a 5-day turn-based sim where every day is AI-generated. The player balances money, reputation, and energy through business decisions and menu specials. I added a Signature Dish feature with a **fine-tuned Hugging Face classifier** so gross food humour (cockroach salad) passes moderation while real toxicity is blocked — something off-the-shelf toxicity models couldn't do.

## Architecture

**Q: How is it structured?**

- Single Next.js 15 app — React UI, API routes, game logic in `/lib`
- No database in the demo; game state is in-memory via a custom hook + `GameStateManager`
- AI calls are server-side only (API keys never hit the browser)

**Q: Why not Redux / Postgres / auth?**

- Scoped intentionally for a focused demo: AI integration, validation, and ML moderation
- Auth branch exists but isn't merged — would add complexity without helping the core story

## AI integration

**Q: How do you trust LLM output?**

- Structured JSON schema + Zod validation
- Up to 4 retries with validation errors fed back to the prompt
- Server enforces mixed effects, difficulty caps, menu tiers — LLM never applies game state
- Separate moderation paths: OpenAI for AI scenarios, custom HF model for user free-text

**Q: Menu images?**

- Started with DALL·E — too slow. Replaced with one batched OpenAI **web search** call per day.

## ML moderation (differentiator)

**Q: Why train your own model?**

- `unitary/unbiased-toxic-roberta` blocked "cockroach salad" — wrong for a game that encourages silly food
- Fine-tuned DistilBERT on 76 labeled examples (`allowed` / `blocked`)
- Deployed to Hugging Face Inference; app swaps model via env var
- Python training lane (`ml/text-moderation/`) separate from TypeScript app — right tool per layer

## Testing

- 43 Vitest unit tests: game engine, Zod schemas, moderation evaluator, API route behaviour

## If asked "what's next?"

- Heroku redeploy with HF env vars
- Expand training dataset, iterate model v2
- Optional: auth + persistence (branch exists)
