# Game rules

**Last updated:** 2026-06-22

## Loop

Start → generate scenario → business + menu choices → apply effects → check end → next day or game over.

## Win / lose

| Outcome | Condition |
|---------|-----------|
| **Win** | Complete day 5 |
| **Burnout** | Energy ≤ 0 |
| **Reputation death** | Reputation ≤ 0 |
| **Bankruptcy** | Money ≤ 0 |

## Resources

| Resource | Range | Start |
|----------|-------|-------|
| Money | −999 … 999 | 100 |
| Reputation | 0 … 100 | 50 |
| Energy | 0 … 100 | 80 |

Per-turn cap on combined business + menu deltas (`MAX_CUMULATIVE_TURN_DELTA` in `game-state.ts`).

## Choices

- Business: 2–4 options, each must mix positive and negative stat effects
- Menu: exactly 3 options (A/B/C), distinct fit tiers for the crowd
- `riskLevel` in AI schema — not shown to player

## Difficulty

| Phase | Days (5-day game) | Effect cap |
|-------|-------------------|------------|
| Early | 1–2 | ±10 |
| Mid | 3–4 | ±15 |
| Late | 5 | ±20 |

## Not in current build

Achievements, scoring leaderboard, save/load — design ideas only.
