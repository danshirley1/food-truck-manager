# Signature Dish

Optional side-panel feature: each day the player describes a wild custom dish (free text, max 200 chars). On submit, the description is **text-moderated**, then an **OpenAI Images API** request runs in the background — the main game is not blocked.

## UI

- Two-column layout on `lg+` screens: main game left, **Signature Dish** panel right (sticky)
- Mobile: panel stacks below the game
- One submission per day; history of previous days scrolls in the panel
- While generating: spinner in panel; image appears when ready even if the player has already moved on
- **Blocked** (amber): moderation message + **labels with scores** (e.g. toxicity 99.7%)
- **Edit description** button when blocked — puts text back in the textarea to revise and resubmit
- **Cancel / Create new** — clear and start fresh

## API

`POST /api/signature-dish/generate`

```json
{ "description": "galaxy glitter ramen", "turn": 2 }
```

Returns:

- `{ "success": true, "imageUrl": "..." }` — moderation passed, image generated
- `422` `{ "errorCode": "content_moderation", "error": "...", "moderation": { "labels", "scores" } }` — blocked

## Text moderation

Runs **before** image generation via `moderateText()` in `web/src/lib/moderation/`.

- **Now:** pre-trained `unitary/unbiased-toxic-roberta` on HF Inference Providers
- **Next:** custom `allowed` / `blocked` model — [`HF_TRAINING_GUIDE.md`](./HF_TRAINING_GUIDE.md)

See [`TEXT_MODERATION.md`](./TEXT_MODERATION.md) for integration details.

## Config

```bash
# Image generation
OPENAI_IMAGE_MODEL=gpt-image-1-mini   # default
SIGNATURE_DISH_IMAGES_ENABLED=false   # disable

# Text moderation (Signature Dish gate)
TEXT_MODERATION_ENABLED=true
TEXT_MODERATION_PROVIDER=huggingface
HUGGINGFACE_API_KEY=                  # Inference Providers permission
HUGGINGFACE_MODERATION_MODEL=unitary/unbiased-toxic-roberta
# HUGGINGFACE_INFERENCE_BASE_URL=https://router.huggingface.co/hf-inference
TEXT_MODERATION_THRESHOLD=0.5
```

## Files

- `web/src/components/SignatureDishPanel.tsx`
- `web/src/hooks/useSignatureDish.ts`
- `web/src/lib/moderation/`
- `web/src/lib/ai/generate-signature-dish-image.ts`
- `web/src/app/api/signature-dish/generate/route.ts`

## ML training

- Dataset: `ml/text-moderation/datasets/signature-dish-samples.csv`
- Script: `ml/text-moderation/train.py`
- Guide: [`HF_TRAINING_GUIDE.md`](./HF_TRAINING_GUIDE.md)
