# Daily Turn Flow

Each day has these UI blocks (see `web/src/components/TurnDecisionCard.tsx`):

1. **Today** (read-only) — `dayContext.location`, `dayContext.crowdDetail`, `dayContext.crowdVibe`
2. **Step 1 — Business decision** — Scenario title + 2–4 choices with **resource effect badges only** (no risk labels shown to the player)
3. **Step 2 — Today's special** — Three options **A / B / C**: description on the left, AI image on the right (loads asynchronously; “Plating…” while pending). Menu stat effects are hidden until after submit.
4. **Submit** — “Send it!” when both steps are selected

## After submit

- **Chef's Kudos: The Verdict** (`MenuFeedbackBanner`) — Stars (1–3), short message, revealed menu effects, `verdictReason`, and the served dish image. If the player submitted before the card image loaded, the verdict **refetches** the image.
- Verdict stays on screen while the next day's scenario loads (~1s delay, then `POST /api/scenarios/generate`).
- Verdict is replaced when the player submits the next day.

## Constants

- **5 playable days** — `TOTAL_TURNS` in `web/src/lib/types/core.ts`
- Days are **1-based** in the UI (`Day 1/5`, `Today (day 1/5)`)

See `docs/ai-generated/CURRENT_IMPLEMENTATION.md` and `ai-integration/structured-output-schema.md` for API shapes.
