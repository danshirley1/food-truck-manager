# Text Moderation — ML

**Live model:** [dshirls/food-truck-moderation-v1](https://huggingface.co/dshirls/food-truck-moderation-v1)

## Quick commands

```bash
cd ml/text-moderation
source .venv/bin/activate   # or: python3 -m venv .venv && pip install -r requirements.txt

./train.sh --augment --epochs 10   # fetch LDNOOBW augment + train (recommended)
./train.sh --epochs 10             # uses existing ldnoobw-food-augmented.csv if present

./push-to-hub.sh                   # upload output/model
```

## Docs

| Doc | Purpose |
|-----|---------|
| [`docs/ai-generated/HF_TRAINING_GUIDE.md`](../../docs/ai-generated/HF_TRAINING_GUIDE.md) | Train + push |
| [`docs/ai-generated/TEXT_MODERATION.md`](../../docs/ai-generated/TEXT_MODERATION.md) | App integration |

## Layout

```
datasets/signature-dish-samples.csv   # 125 labeled rows
train.py                              # fine-tune distilbert
push-to-hub.sh                        # upload weights
infer_daemon.py                       # local dev inference
output/model/                         # checkpoints (gitignored)
eval/run-notes.md                     # metrics
```

## Labels

- **allowed** — gross/silly food humour (cockroach salad, worm garnish)
- **blocked** — profanity, hate, threats, sexual content

Rules: `datasets/README.md`
