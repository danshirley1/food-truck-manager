# AI structured output

**Last updated:** 2026-06-22  
**Code:** `web/src/lib/types/ai-schemas.ts`, `web/src/lib/ai/prompts.ts`

## Request

`POST /api/scenarios/generate` — body includes `currentResources`, `turn` (1–5), `difficultyLevel`, `recentLocations`, `recentCrowdVibes`, `venueThemeHint`, etc.

## LLM output (core fields)

```json
{
  "title": "Rush Hour Queue",
  "text": "A long line forms at your truck.",
  "difficulty": "early",
  "dayContext": {
    "location": "Greystone Office Park",
    "crowdDetail": "Office workers want quick lunches.",
    "crowdVibe": "Hangry but polite."
  },
  "menuPrompt": "What special goes on the board?",
  "menuOptions": [
    {
      "label": "Loaded burrito bowl",
      "description": "Hearty, easy to eat standing up.",
      "imageSearchTerm": "loaded burrito bowl",
      "effects": { "money": 8, "reputation": 5, "energy": -4 },
      "verdictReason": "Portable and filling."
    }
  ],
  "choices": [
    {
      "label": "Offer samples while people wait",
      "effects": { "money": -5, "reputation": 6, "energy": -4 },
      "riskLevel": "safe"
    }
  ]
}
```

Exactly **3** `menuOptions`. `riskLevel` required in JSON, **hidden in UI**.

## Server adds

After validation: `id`, `createdBy: "ai"`, normalized effects, `imageUrl` via web search (not from LLM).

## Enforcement

| Layer | Rule |
|-------|------|
| Zod | Per-field ±20 |
| Preprocess | Mixed effects on every choice + menu option |
| Validation | Distinct menu tiers, reasonable choice count |
| Normalizer | Difficulty caps: early ±10, mid ±15, late ±20 |
| `applyTurn` | Max cumulative delta per turn |

Menu images: `docs/ai-generated/MENU_IMAGES.md`
