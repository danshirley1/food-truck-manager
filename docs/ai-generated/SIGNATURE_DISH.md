# Signature Dish

Optional side-panel feature: each day the player describes a wild custom dish (free text, max 200 chars). On submit, the description is **text-moderated**, then an **OpenAI Images API** request runs in the background — the main game is not blocked.

## UI

- Two-column layout on `lg+` screens: main game left, **Signature Dish** panel right (sticky)
- Mobile: panel stacks below the game
- One submission per day; history of previous days scrolls in the panel
- While generating: spinner in panel; image appears when ready even if the player has already moved on
- **Blocked** state (amber): moderation rejected the description — user can clear and try again

## API

`POST /api/signature-dish/generate`

```json
{ "description": "galaxy glitter ramen", "turn": 2 }
```

Returns:

- `{ "success": true, "imageUrl": "..." }` — moderation passed, image generated
- `422` `{ "errorCode": "content_moderation", "error": "..." }` — blocked before image generation

## Text moderation

Runs **before** image generation via `moderateText()` in `web/src/lib/moderation/`.

See [`TEXT_MODERATION.md`](./TEXT_MODERATION.md) for full platform + provider details.

## Config

```bash
# Image generation
OPENAI_IMAGE_MODEL=gpt-image-1-mini   # default
SIGNATURE_DISH_IMAGES_ENABLED=false   # disable

# Text moderation (Signature Dish gate)
TEXT_MODERATION_ENABLED=true
TEXT_MODERATION_PROVIDER=huggingface
HUGGINGFACE_API_KEY=
HUGGINGFACE_MODERATION_MODEL=unitary/unbiased-toxic-roberta
TEXT_MODERATION_THRESHOLD=0.5
```

## Files

- `web/src/components/SignatureDishPanel.tsx`
- `web/src/hooks/useSignatureDish.ts`
- `web/src/lib/moderation/` — text moderation module
- `web/src/lib/ai/generate-signature-dish-image.ts`
- `web/src/app/api/signature-dish/generate/route.ts`

## ML training lane

Kaggle notebook plan and sample dataset: `ml/text-moderation/`
