# Resource system

**Last updated:** 2026-06-22

Three resources — money, reputation, energy. Every choice trades between them.

## Resources

| | Range | Start | Lose at |
|---|-------|-------|---------|
| Money | −999 … 999 | 100 | ≤ 0 |
| Reputation | 0 … 100 | 50 | ≤ 0 |
| Energy | 0 … 100 | 80 | ≤ 0 |

## Effect limits

- Per-field: ±20 max (AI schema)
- Difficulty-normalized: early ±10, mid ±15, late ±20
- Per turn: combined business + menu delta capped in `GameStateManager.applyTurn`

## Design intent

- **Simple** — three numbers, visible on every choice
- **Trade-offs** — mixed effects force meaningful decisions
- **AI-safe** — numeric bounds easy to validate

Implementation: `web/src/lib/engine/game-state.ts`
