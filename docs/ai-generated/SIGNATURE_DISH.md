# Signature Dish

**Last updated:** 2026-06-22

Optional side panel: one free-text dish per day (max 200 chars). Moderated, then AI image generated in the background — main game is not blocked.

## UX

- Desktop: game left, panel right (sticky). Mobile: stacks below.
- States: `generating` | `ready` | `blocked` | `error`
- **Blocked:** amber card, `allowed`/`blocked` scores, **Edit description** to revise
- History of previous days scrolls in panel

## API

`POST /api/signature-dish/generate`

```json
{ "description": "cockroach salad", "turn": 2 }
```

- **200** — `{ "success": true, "imageUrl": "..." }`
- **422** — `{ "errorCode": "content_moderation", "moderation": { "labels", "scores" } }`

## Pipeline

```
description → moderateText() → generateSignatureDishImage()
```

Moderation model: `dshirls/food-truck-moderation-v1`. See [`TEXT_MODERATION.md`](./TEXT_MODERATION.md).

## Config

```bash
OPENAI_IMAGE_MODEL=gpt-image-1-mini    # default
SIGNATURE_DISH_IMAGES_ENABLED=false    # disable images
TEXT_MODERATION_ENABLED=true
TEXT_MODERATION_PROVIDER=huggingface
HUGGINGFACE_MODERATION_MODEL=dshirls/food-truck-moderation-v1
```

## Files

- `web/src/components/SignatureDishPanel.tsx`
- `web/src/hooks/useSignatureDish.ts`
- `web/src/lib/ai/generate-signature-dish-image.ts`
- `web/src/app/api/signature-dish/generate/route.ts`
