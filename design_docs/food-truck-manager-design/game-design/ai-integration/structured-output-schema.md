# AI Structured Output Schema

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
  "tone": "standard"
}
```

## LLM output (before server enrichment)

```json
{
  "title": "Rush Hour Queue",
  "text": "A long line forms at your truck during lunch. You are running low on prep space and one grill is acting up.",
  "tags": ["customer-service", "equipment"],
  "difficulty": "early",
  "dayContext": {
    "location": "City centre office park, weekday lunch rush",
    "crowdProfile": "Office workers with 30 minutes — want fast, portable meals"
  },
  "menuPrompt": "What special goes on the board for this crowd?",
  "menuOptions": [
    { "label": "Loaded burrito bowl special", "effects": { "money": 8, "reputation": 5, "energy": -4 } },
    { "label": "Truffle risotto cup", "effects": { "money": -5, "reputation": -3, "energy": -6 } },
    { "label": "Classic burger combo", "effects": { "money": 5, "reputation": 2, "energy": -5 } }
  ],
  "choices": [
    {
      "label": "Offer samples while people wait to keep them happy",
      "effects": { "money": -5, "reputation": 6, "energy": -4 },
      "riskLevel": "safe"
    },
    {
      "label": "Limit the menu to your fastest items only",
      "effects": { "money": 3, "reputation": -2, "energy": -6 }
    }
  ]
}
```

## Response (after validation)

```json
{
  "success": true,
  "scenario": {
    "id": "ai-1-abc123",
    "title": "Rush Hour Queue",
    "text": "...",
    "tags": ["customer-service", "equipment"],
    "difficulty": "early",
    "createdBy": "ai",
    "createdAt": "2026-05-17T12:00:00.000Z",
    "choices": [
      {
        "id": "offer-samples-while-people-1",
        "label": "Offer samples while people wait to keep them happy",
        "effects": { "money": -5, "reputation": 6, "energy": -4 },
        "riskLevel": "safe"
      }
    ]
  },
  "source": "ai"
}
```

## Server-assigned fields

The LLM does not set `id`, `createdBy`, or `createdAt`. The server assigns those after Zod validation and effect normalization.

## Effect enforcement

| Layer | Rule |
|-------|------|
| Zod | Per-field ±20 |
| Normalizer | Difficulty caps (early ±10, mid ±15, late ±20); max impact 35 per choice |
| `GameStateManager.applyTurn` | Max cumulative delta 30 per turn (business + menu combined) |

## Environment

`OPENAI_API_KEY` is required. See `web/.env.example`.
