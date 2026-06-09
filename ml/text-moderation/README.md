# Text Moderation — ML Learning Lane

Python/Kaggle workspace for training and evaluating the Signature Dish text moderation model. The Next.js app consumes the trained artifact via Hugging Face Inference API — see [`docs/ai-generated/TEXT_MODERATION.md`](../../docs/ai-generated/TEXT_MODERATION.md).

## How the pieces fit together

| Platform | Role |
|----------|------|
| **Kaggle** | Notebooks, free GPU, dataset exploration, fine-tuning experiments |
| **Hugging Face Hub** | Versioned model + dataset storage; Inference API for the app |
| **Food Truck Manager (`web/`)** | TypeScript `moderateText()` called on Signature Dish submit |

```
Kaggle notebook  →  train / evaluate  →  push_to_hub()
                                              ↓
                         HUGGINGFACE_MODERATION_MODEL env var
                                              ↓
                         web/src/lib/moderation/ (Inference API)
```

## Directory layout

```
ml/text-moderation/
  README.md           # this file
  notebooks/          # export .ipynb from Kaggle when ready
  datasets/           # small curated CSV samples (gitignore large downloads)
  eval/               # metrics notes, threshold tuning results
```

Add large dataset files to `.gitignore` — keep only small sample CSVs in git.

## Kaggle notebook plan

### 1. Dataset

Combine:

- Public toxicity sets (e.g. Jigsaw, Davidson hate-speech on Kaggle/HF Datasets)
- Game-specific rows in `datasets/signature-dish-samples.csv`:

| text | label | notes |
|------|-------|-------|
| burnt toast taco with extra chaos | allowed | silly food humor |
| galaxy glitter ramen | allowed | creative |
| … | blocked | slurs, hate, sexual content |

Label schema: `allowed` / `blocked` (binary classifier). Optional multi-label later.

### 2. Baseline evaluation

```python
from transformers import pipeline
clf = pipeline("text-classification", model="unitary/unbiased-toxic-roberta")
# Run on holdout set — record precision, recall, F1
# Pay attention to false positives (blocking fun food names)
```

Save metrics in `eval/baseline-notes.md`.

### 3. Fine-tune

On Kaggle GPU (Settings → Accelerator → GPU):

```python
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments
# Load dataset, tokenize, train 2-3 epochs
# Evaluate on holdout
```

### 4. Export to Hugging Face Hub

```python
model.push_to_hub("your-username/food-truck-moderation-v1")
tokenizer.push_to_hub("your-username/food-truck-moderation-v1")
```

Then in `web/.env`:

```bash
HUGGINGFACE_MODERATION_MODEL=your-username/food-truck-moderation-v1
```

No app code changes required — same TypeScript interface.

### 5. Threshold tuning

The app uses `TEXT_MODERATION_THRESHOLD` (default `0.5`). After fine-tuning:

1. Plot score distribution on validation set
2. Pick threshold that minimises false positives on allowed food creativity
3. Document chosen value in `eval/threshold.md`

## Getting started on Kaggle

1. Create a new notebook at [kaggle.com/code](https://www.kaggle.com/code)
2. Add HF secret: **Add-ons → Secrets → `HF_TOKEN`**
3. Copy notebook steps from section above
4. Export to `notebooks/` when stable

## Related app files

- `web/src/lib/moderation/` — inference integration
- `web/src/app/api/signature-dish/generate/route.ts` — moderation gate
- `docs/ai-generated/TEXT_MODERATION.md` — full implementation doc
