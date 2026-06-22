# Resume here

**Last updated:** 2026-06-22

## Status

| Area | Status |
|------|--------|
| Core game (5 days, AI scenarios) | ✅ |
| Menu image web search | ✅ |
| Signature Dish + image gen | ✅ |
| Custom moderation model | ✅ Trained + on Hub: `dshirls/food-truck-moderation-v1` |
| Unit tests | 43 passing — `cd web && npm test` |
| Heroku | Needs redeploy from `main` + env vars |

## Run locally

```bash
yarn dev   # http://localhost:3000
```

```bash
# web/.env
OPENAI_API_KEY=...
TEXT_MODERATION_PROVIDER=huggingface
HUGGINGFACE_API_KEY=...              # Write + Inference
HUGGINGFACE_MODERATION_MODEL=dshirls/food-truck-moderation-v1
```

Offline moderation (no Hub): `TEXT_MODERATION_PROVIDER=local-model`

## Demo highlights

1. AI-generated day (location, crowd, business + menu)
2. Menu photos via OpenAI web search
3. Signature Dish: **"cockroach salad"** → allowed; slurs/threats → blocked
4. Fine-tuned DistilBERT — game-specific labels, not generic toxicity

## Push / retrain model

```bash
cd ml/text-moderation
./push-to-hub.sh                    # upload existing weights
python train.py --epochs 8 --push-to-hub dshirls/food-truck-moderation-v2
```

Metrics: `ml/text-moderation/eval/run-notes.md`

## Parked

- Auth branch (`feature/auth-system`) — not merged
- Heroku redeploy
