# Signature Dish

Optional side-panel feature: each day the player describes a wild custom dish (free text, max 200 chars). On submit, an **OpenAI Images API** request runs in the background — the main game is not blocked.

## UI

- Two-column layout on `lg+` screens: main game left, **Signature Dish** panel right (sticky)
- Mobile: panel stacks below the game
- One submission per day; history of previous days scrolls in the panel
- While generating: spinner in panel; image appears when ready even if the player has already moved on

## API

`POST /api/signature-dish/generate`

```json
{ "description": "cockroaches on toast", "turn": 2 }
```

Returns `{ "success": true, "imageUrl": "..." }` or error.

## Config

```bash
OPENAI_IMAGE_MODEL=gpt-image-1-mini   # default
SIGNATURE_DISH_IMAGES_ENABLED=false   # disable
```

## Files

- `web/src/components/SignatureDishPanel.tsx`
- `web/src/hooks/useSignatureDish.ts`
- `web/src/lib/ai/generate-signature-dish-image.ts`
- `web/src/app/api/signature-dish/generate/route.ts`
