# Core types

**Last updated:** 2026-06-22  
**Source:** `web/src/lib/types/`

## Resources

```typescript
interface Resources {
  money: number;      // -999 … 999
  reputation: number; // 0 … 100
  energy: number;     // 0 … 100
}
```

## Game state (simplified)

Client-side via `useGame` — not persisted to DB in demo.

- `turn` — 0 = lobby; 1–5 = current day
- `resources` — current levels
- `gameOver`, `endReason` — win/loss
- Scenario + choice history in hook state

## Scenario

```typescript
interface Scenario {
  id: string;
  title: string;
  text: string;
  dayContext: { location; crowdDetail; crowdVibe };
  menuPrompt: string;
  menuOptions: MenuOption[];  // exactly 3
  choices: Choice[];          // 2–4
  difficulty: 'early' | 'mid' | 'late';
  createdBy: 'ai';
}
```

## Menu option

```typescript
interface MenuOption {
  id: string;
  label: string;
  description: string;
  imageSearchTerm?: string;
  imageUrl?: string;       // server-filled via web search
  effects: ResourceEffects;
  verdictReason: string;
}
```

## Enums

- `EndReason`: `victory` | `burnout` | `reputation-death` | `bankruptcy`
- `DifficultyLevel`: `early` | `mid` | `late`
- `RiskLevel`: `safe` | `moderate` | `risky` (schema only)

Full Zod schemas: `web/src/lib/types/ai-schemas.ts`, `validation.ts`.
