# Text Moderation — ML Learning Lane

Python/Kaggle workspace for training and evaluating the Signature Dish text moderation model.

**Start here:** [`docs/ai-generated/HF_TRAINING_GUIDE.md`](../../docs/ai-generated/HF_TRAINING_GUIDE.md) — step-by-step POC walkthrough.

App integration: [`docs/ai-generated/TEXT_MODERATION.md`](../../docs/ai-generated/TEXT_MODERATION.md)

## Quick start

```bash
cd ml/text-moderation
pip install -r requirements.txt
huggingface-cli login
python train.py --no-jigsaw --epochs 5 --push-to-hub YOUR_USERNAME/food-truck-moderation-v1
```

Then in `web/.env`:

```bash
HUGGINGFACE_MODERATION_MODEL=YOUR_USERNAME/food-truck-moderation-v1
```

## Directory layout

```
ml/text-moderation/
  train.py              # fine-tune distilbert (allowed vs blocked)
  requirements.txt
  datasets/
    signature-dish-samples.csv   # expand this before training
    README.md
  eval/
    run-notes.md        # paste metrics after each run
    threshold.md        # document chosen threshold
  notebooks/            # export Kaggle .ipynb here when stable
  output/               # local checkpoints (gitignored)
```

## How the pieces fit together

| Platform | Role |
|----------|------|
| **Kaggle / Colab** | GPU training (recommended for first POC) |
| **Hugging Face Hub** | Store model; Inference API for the app |
| **Food Truck Manager** | `moderateText()` — no code change after Hub push |
