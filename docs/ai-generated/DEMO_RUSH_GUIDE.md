# Demo guide

**Last updated:** 2026-06-22

## 30-second pitch

> Five-day food truck sim. Every day is AI-generated — location, crowd, business dilemmas, three menu specials with web-searched photos. Optional Signature Dish: free text → **custom Hugging Face moderation** (fine-tuned for gross-but-funny food) → AI image.

## Before you demo

```bash
cd food-truck-manager
yarn dev
# http://localhost:3000
```

Env: `OPENAI_API_KEY`, `HUGGINGFACE_API_KEY`, `HUGGINGFACE_MODERATION_MODEL=dshirls/food-truck-moderation-v1`, `TEXT_MODERATION_PROVIDER=huggingface`.

## Walkthrough (5–7 min)

1. Start → explain money / reputation / energy
2. Day context (AI location + crowd)
3. Business choice (effect badges)
4. Menu A/B/C (web-search images)
5. Submit → Chef's Kudos (stars, revealed effects)
6. Signature Dish: **"cockroach salad"** → allowed + image; mention slurs would block
7. Mention 5-day win/lose arc

## Demo-safe Signature Dish inputs

- cockroach salad
- crispy Korean fried chicken taco
- smoked brisket mac and cheese bowl

## Backup plans

| Issue | Fix |
|-------|-----|
| OpenAI slow | Refresh; demo localhost |
| HF inference cold start | Wait ~10s; mention first call |
| CSS/test native error on Mac | `cd web && node scripts/ensure-native-deps.mjs` |
| No menu image | Placeholder OK — explain web search fallback |

## Heroku

```bash
heroku config:set OPENAI_API_KEY=... HUGGINGFACE_API_KEY=... \
  HUGGINGFACE_MODERATION_MODEL=dshirls/food-truck-moderation-v1 \
  TEXT_MODERATION_PROVIDER=huggingface --app food-truck-manager
git push food-truck main:main
```

## What to say about ML

> Pre-trained toxicity models blocked gross food jokes. I fine-tuned DistilBERT on a game-specific dataset — allowed vs blocked — and deployed it to Hugging Face Inference. Training script and CSV are in `ml/text-moderation/`.
