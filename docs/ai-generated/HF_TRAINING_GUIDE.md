# Hugging Face — moderation model

**Last updated:** 2026-06-22  
**Live model:** [dshirls/food-truck-moderation-v1](https://huggingface.co/dshirls/food-truck-moderation-v1)

Fine-tuned binary classifier: **allowed** vs **blocked** for Signature Dish text.

## Quick push (weights already trained)

```bash
cd ml/text-moderation
# HF token with Write + Inference in web/.env or HF_TOKEN=...
./push-to-hub.sh
```

## Train from scratch

```bash
cd ml/text-moderation
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

HF_TOKEN=hf_... python train.py \
  --epochs 8 \
  --push-to-hub dshirls/food-truck-moderation-v1
```

Dataset: `datasets/signature-dish-samples.csv` (76 rows). Label rules: `datasets/README.md`.

## Wire into app

```bash
HUGGINGFACE_MODERATION_MODEL=dshirls/food-truck-moderation-v1
TEXT_MODERATION_PROVIDER=huggingface
```

No TypeScript changes needed.

## Token permissions

Create at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens):

- Classic **Write** token, or fine-grained with **Write repos** + **Inference Providers**

## Verify

**Local (works for custom model):**

```bash
cd ml/text-moderation && source .venv/bin/activate
python infer.py "cockroach salad"
```

**Cloud:** deploy [Inference Endpoints](https://huggingface.co/dshirls/food-truck-moderation-v1) — the shared `hf-inference` router does **not** host custom models.

```bash
curl -s -X POST "$HUGGINGFACE_INFERENCE_ENDPOINT" \
  -H "Authorization: Bearer $HF_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"inputs": "cockroach salad"}'
```

## Metrics (2026-06-22 run)

| Metric | Value |
|--------|-------|
| accuracy | 0.92 |
| f1_blocked | 0.86 |
| cockroach salad | allowed ~0.92 |
| fuck you cake | blocked ~0.61 |

Full notes: `ml/text-moderation/eval/run-notes.md`

## Iterate

Add rows to CSV → retrain → push `food-truck-moderation-v2` → update env var.

False positive on gross food → add `allowed` examples. Slur slips through → add `blocked` examples.
