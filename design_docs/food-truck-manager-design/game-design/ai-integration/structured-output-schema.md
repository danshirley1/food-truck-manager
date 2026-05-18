# AI Structured Output Schema

> **Implementation:** `web/src/lib/types/ai-schemas.ts`, `web/src/lib/ai/prompts.ts`  
> **Game length:** 5 days (`TOTAL_TURNS` in `web/src/lib/types/core.ts`)

## Request

`POST /api/scenarios/generate` with a `ScenarioContext` body:

```json
{
  "currentResources": { "money": 100, "reputation": 50, "energy": 80 },
  "turn": 1,
  "difficultyLevel": "early",
  "recentChoices": [],
  "availableTags": ["customer-service", "supply-management"],
  "recentScenarioIds": [],
  "recentLocations": [],
  "recentCrowdVibes": [],
  "venueThemeHint": "weekday office lunch rush"
}
```

`turn` is the **current day** (1–5), not zero-based.

## LLM output (before server enrichment)

```json
{
  "title": "Rush Hour Queue",
  "text": "A long line forms at your truck during lunch.",
  "tags": ["customer-service", "equipment"],
  "difficulty": "early",
  "dayContext": {
    "location": "Greystone Office Park",
    "crowdDetail": "Office workers in their 30s want quick portable lunches.",
    "crowdVibe": "Hangry but polite — speed is everything."
  },
  "menuPrompt": "What special goes on the board for this crowd?",
  "menuOptions": [
    {
      "label": "Loaded burrito bowl special",
      "description": "Hearty bowl, easy to eat standing up.",
      "imagePrompt": "loaded burrito bowl on tray, medium wide shot, appetizing food photo",
      "effects": { "money": 8, "reputation": 5, "energy": -4 },
      "verdictReason": "Portable and filling — exactly what this crowd wanted."
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

Exactly **3** `menuOptions`. `riskLevel` is required in the JSON schema but **not shown in the UI**.

## Response (after validation)

```json
{
  "success": true,
  "scenario": {
    "id": "ai-1-abc123",
    "title": "Rush Hour Queue",
    "difficulty": "early",
    "createdBy": "ai",
    "dayContext": { "location": "...", "crowdDetail": "...", "crowdVibe": "..." },
    "menuPrompt": "...",
    "menuOptions": [
      {
        "id": "loaded-burrito-bowl-1",
        "label": "...",
        "description": "...",
        "imagePrompt": "...",
        "effects": { "money": 8, "reputation": 5, "energy": -4 },
        "verdictReason": "..."
      }
    ],
    "choices": [
      {
        "id": "offer-samples-1",
        "label": "...",
        "effects": { "money": -5, "reputation": 6, "energy": -4 },
        "riskLevel": "safe"
      }
    ]
  },
  "source": "ai"
}
```

`imageUrl` on menu options is filled **client-side** via `POST /api/scenarios/menu-image`, not in this response.

## Server-assigned fields

The LLM does not set `id`, `createdBy`, or `createdAt`. The server assigns those after Zod validation and effect normalization (`mapGeneratedToScenario`).

## Effect enforcement

| Layer | Rule |
|-------|------|
| Zod | Per-field ±20 on effects |
| `preprocessGeneratedScenario` | `enforceMixedEffects` — each choice and menu option must have ≥1 positive and ≥1 negative stat |
| Validation | `everyOptionHasMixedEffects`, `menuOptionsHaveDistinctTiers`, `hasReasonableChoice` |
| Normalizer | Difficulty caps: early ±10, mid ±15, late ±20 |
| `GameStateManager.applyTurn` | Max cumulative delta per turn (business + menu) |

## Menu images (separate endpoint)

`POST /api/scenarios/menu-image`

```json
{ "label": "Loaded burrito bowl", "imagePrompt": "...", "location": "Greystone Office Park" }
```

Returns `{ "success": true, "imageUrl": "..." }` or `null` if generation failed/disabled.

See `docs/ai-generated/MENU_IMAGES.md`.

## Environment

See `web/.env.example`: `OPENAI_API_KEY` (required), `OPENAI_MODEL`, `OPENAI_IMAGE_MODEL`, `MENU_IMAGES_ENABLED`.
