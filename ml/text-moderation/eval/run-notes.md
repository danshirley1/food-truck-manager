# Training run notes

## Run 2 — 2026-06-22 (profanity-in-food context)

**Why:** v1 let mild food-context swears through (e.g. `fuck rice`, `fucking rice`) — blocked score stayed below threshold (~0.40).

**Dataset:** `signature-dish-samples.csv` — **125 rows** (61 allowed, 64 blocked)  
Added profanity-in-food examples for every term from the former rules word list + near-boundary allowed controls.

**Epochs:** 10  

### Test metrics (best checkpoint)

| Metric | Value |
|--------|-------|
| accuracy | 1.0 |
| precision_blocked | 1.0 |
| recall_blocked | 1.0 |
| f1_blocked | 1.0 |

### Sample predictions (post-train)

| Text | Prediction | Score |
|------|------------|-------|
| cockroach salad | allowed | 0.95 |
| fuck rice | blocked | 0.93 |
| fucking rice | blocked | 0.93 |
| spicy fucking hot wings | blocked | 0.92 |
| devil's food chocolate cake | allowed | 0.95 |

**Next:** push to Hub (`./push-to-hub.sh`), restart Inference Endpoint if weights don't auto-refresh.

---

## Run 1 — 2026-06-22 (local CPU/MPS)

**Dataset:** `signature-dish-samples.csv` — 76 rows (48 allowed, 28 blocked)  
**Base model:** `distilbert-base-uncased`  
**Epochs:** 8  
**Train/test split:** 85/15 stratified  

### Test metrics (best checkpoint, epoch 2)

| Metric | Value |
|--------|-------|
| accuracy | 0.917 |
| precision_blocked | 1.0 |
| recall_blocked | 0.75 |
| f1_blocked | 0.857 |

### Sample predictions (held-out inference)

| Text | Prediction | Score |
|------|------------|-------|
| cockroach salad | allowed | 0.92 |
| a cake made of cockroaches | allowed | 0.89 |
| spicy kimchi grilled cheese | allowed | 0.91 |
| fuck you cake | blocked | 0.61 |
| kill yourself taco | blocked | 0.65 |

### Hub push

**Blocked:** HF token lacks **Write** permission (403 on `dshirls/food-truck-moderation-v1`).  
**Workaround for local demo:** `TEXT_MODERATION_PROVIDER=local-model` (runs `ml/text-moderation/infer.py`).

To enable Hub inference (Heroku):

1. Create HF token with **Write** + **Inference Providers**
2. `HF_TOKEN=hf_... python train.py --epochs 8 --push-to-hub dshirls/food-truck-moderation-v1`
3. Set `TEXT_MODERATION_PROVIDER=huggingface` and `HUGGINGFACE_MODERATION_MODEL=dshirls/food-truck-moderation-v1`
