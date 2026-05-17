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
| `GameStateManager.applyChoice` | Max cumulative delta 30 per turn |

## Environment

`OPENAI_API_KEY` is required. See `web/.env.example`.
