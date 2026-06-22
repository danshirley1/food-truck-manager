# Daily turn flow

**Last updated:** 2026-06-22

Each day (`TurnDecisionCard.tsx`):

1. **Today** — location, crowd detail, crowd vibe (`dayContext`)
2. **Step 1 — Business** — 2–4 choices, effect badges only (no risk labels in UI)
3. **Step 2 — Menu** — specials **A / B / C**, description + web-search image; effects hidden until submit
4. **Submit** — "Send it!" when both steps selected

**Signature Dish** (optional, side panel) — free-text dish → moderation → AI image; runs in parallel, doesn't block the main flow.

## After submit

**Chef's Kudos** (`MenuFeedbackBanner`) — stars, message, revealed menu effects, verdict reason, dish image. Stays visible while next day loads (~1s), replaced on next submit.

## Constants

- **5 days** — `TOTAL_TURNS` in `web/src/lib/types/core.ts`
- UI is 1-based (`Day 1/5`)

Details: `docs/ai-generated/CURRENT_IMPLEMENTATION.md`
