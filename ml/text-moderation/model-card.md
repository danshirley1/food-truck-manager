---
license: mit
language: en
tags:
  - text-classification
  - food-truck-manager
pipeline_tag: text-classification
library_name: transformers
---

# Food Truck Manager — Signature Dish moderation

Binary text classifier for a food-truck game: **allowed** vs **blocked** user dish descriptions.

Fine-tuned from `distilbert-base-uncased` on game-specific examples (gross food humour allowed; slurs/threats blocked).

## Labels

| Label | Meaning |
|-------|---------|
| `allowed` | Silly/gross food humour (e.g. cockroach salad) |
| `blocked` | Profanity, hate, threats, sexual content |

## Usage

**Local / app (recommended for custom model):**

```bash
TEXT_MODERATION_PROVIDER=local-model   # uses ml/text-moderation/output/model
```

**Dedicated Inference Endpoint** (for Heroku / cloud):

1. [Model page](https://huggingface.co/dshirls/food-truck-moderation-v1) → **Deploy** → **Inference Endpoints**
2. CPU instance is enough for DistilBERT
3. Set `HUGGINGFACE_INFERENCE_ENDPOINT` to the endpoint URL in `web/.env`

> The shared `hf-inference` router does **not** host custom Hub models — only a curated catalog.

## Example

```python
from transformers import pipeline
clf = pipeline("text-classification", model="dshirls/food-truck-moderation-v1")
clf("cockroach salad")   # allowed
clf("fuck you cake")     # blocked
```
