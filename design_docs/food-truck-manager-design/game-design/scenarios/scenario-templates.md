# Scenario templates

**Last updated:** 2026-06-22

> **Note:** The live game uses **AI-only** scenarios (`POST /api/scenarios/generate`). Templates below informed prompt design and early static prototypes — not loaded at runtime.

## AI output shape (current)

Each day includes:

- `title`, `text`, `dayContext` (location, crowdDetail, crowdVibe)
- `choices[]` — business decisions (2–4)
- `menuOptions[]` — exactly 3 specials with `label`, `description`, `effects`, `verdictReason`

See `game-design/ai-integration/structured-output-schema.md`.

## Prompt themes (tags)

`customer-service`, `supply-management`, `equipment`, `permits`, `competition`, `weather`, `community-event`, `crisis`, `expansion`

Used in `ScenarioContext.availableTags` to steer variety.

## Example static template (reference)

```json
{
  "id": "indecisive-customer",
  "title": "The Indecisive Customer",
  "text": "A customer stares at your menu while the line grows.",
  "choices": [
    {
      "id": "offer-recommendation",
      "label": "Recommend today's special",
      "effects": { "money": 5, "reputation": 8, "energy": -3 }
    }
  ],
  "tags": ["customer-service"],
  "difficulty": "early",
  "createdBy": "static"
}
```

More examples: `scenarios/example-scenarios.json`
