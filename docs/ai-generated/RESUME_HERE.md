# Resume here

**Last updated:** 2026-06-11

Quick handoff when returning to Food Truck Manager.

## Current status

| Area | Status |
|------|--------|
| Core game (5 days, AI scenarios) | Working |
| Menu image web search | Working |
| Signature Dish + image gen | Working |
| Text moderation (HF Inference) | **Custom model trained** — local via `local-model` provider |
| Custom trained model on Hub | **Pending** — need HF Write token to push `dshirls/food-truck-moderation-v1` |
| Heroku demo | Stale (needs deploy from `main` + env vars) |
| Unit tests | 40 passing — `cd web && npm test` |

## What works locally

`web/.env` needs at minimum:

```bash
OPENAI_API_KEY=...
TEXT_MODERATION_ENABLED=true
TEXT_MODERATION_PROVIDER=local-model    # uses ml/text-moderation/output/model
TEXT_MODERATION_THRESHOLD=0.5
```

For Heroku / shared URL (after Hub push):

```bash
TEXT_MODERATION_PROVIDER=huggingface
HUGGINGFACE_API_KEY=hf_...
HUGGINGFACE_MODERATION_MODEL=dshirls/food-truck-moderation-v1
```

Run: `yarn dev` → http://localhost:3000

Signature Dish: optional panel per day → moderation → image generation.

## Known behaviour (pre-trained model)

- HF endpoint: `router.huggingface.co/hf-inference` (legacy `api-inference.huggingface.co` is dead)
- Model scores **toxicity / obscene / insult** etc. — not game-specific
- Gross food humour (e.g. cockroaches cake) may score ~30% toxicity; may still block due to evaluator logic when toxicity is the top label
- **Fix:** train your own `allowed` / `blocked` model (next task)

## Next task: train your own model

**Follow:** [`HF_TRAINING_GUIDE.md`](./HF_TRAINING_GUIDE.md)

Checklist:

1. [ ] HF Write token + Inference Providers
2. [ ] Expand `ml/text-moderation/datasets/signature-dish-samples.csv` (50+ rows)
3. [ ] Kaggle GPU notebook → run `train.py --no-jigsaw --push-to-hub USER/food-truck-moderation-v1`
4. [ ] Test on Hub Inference widget
5. [ ] Set `HUGGINGFACE_MODERATION_MODEL=USER/food-truck-moderation-v1` in `web/.env`
6. [ ] Log metrics in `ml/text-moderation/eval/run-notes.md`
7. [ ] Tune `TEXT_MODERATION_THRESHOLD` — worksheet in `ml/text-moderation/eval/threshold.md`

After custom model: UI shows **`allowed` / `blocked`** scores instead of toxicity labels.

## Doc index

| Doc | Purpose |
|-----|---------|
| [`CURRENT_IMPLEMENTATION.md`](./CURRENT_IMPLEMENTATION.md) | Full app behaviour |
| [`TEXT_MODERATION.md`](./TEXT_MODERATION.md) | Moderation integration |
| [`SIGNATURE_DISH.md`](./SIGNATURE_DISH.md) | Signature Dish feature |
| [`HF_TRAINING_GUIDE.md`](./HF_TRAINING_GUIDE.md) | Train + push to Hub |
| [`MENU_IMAGES.md`](./MENU_IMAGES.md) | Menu special photos |
| [`ml/text-moderation/README.md`](../ml/text-moderation/README.md) | Training script + CSV |

## Parked / later

- Auth branch (`feature/auth-system`) — not merged
- Heroku redeploy from `main`
- Optional: fix HF evaluator to only block when score ≥ threshold (sub-threshold top-label block)
