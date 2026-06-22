# Text Moderation

**Last updated:** 2026-06-22

Gates **Signature Dish** free-text before OpenAI image generation. AI scenario text uses a separate OpenAI moderation path (`lib/ai/moderation.ts`).

## Model

| | |
|---|---|
| **Hub repo** | [`dshirls/food-truck-moderation-v1`](https://huggingface.co/dshirls/food-truck-moderation-v1) |
| **Labels** | `allowed`, `blocked` |
| **Base** | Fine-tuned `distilbert-base-uncased` on 125-row game CSV |

## How to run inference

Custom models are **not** on the shared `hf-inference` catalog (`Model not supported by provider hf-inference` is expected).

| Environment | Setup |
|-------------|--------|
| **Local demo** | `TEXT_MODERATION_PROVIDER=local-model` (Python daemon + `output/model`) |
| **Heroku / cloud** | Deploy **Inference Endpoints** from model page → set `HUGGINGFACE_INFERENCE_ENDPOINT` |
| **Curated HF models only** | `TEXT_MODERATION_PROVIDER=huggingface` without endpoint (e.g. `unitary/unbiased-toxic-roberta`) |

### Local (recommended for demo today)

```bash
TEXT_MODERATION_PROVIDER=local-model
HUGGINGFACE_MODERATION_MODEL=dshirls/food-truck-moderation-v1
```

### Cloud — Inference Endpoints

1. Open [model page](https://huggingface.co/dshirls/food-truck-moderation-v1) → **Deploy** → **Inference Endpoints**
2. Pick a **CPU** instance (DistilBERT is small)
3. Copy endpoint URL into `web/.env`:

```bash
TEXT_MODERATION_PROVIDER=huggingface
HUGGINGFACE_INFERENCE_ENDPOINT=https://xxxx.aws.endpoints.huggingface.cloud
HUGGINGFACE_MODERATION_MODEL=dshirls/food-truck-moderation-v1
```

With `local-model` primary and `huggingface` configured, the app **falls back to local** if the router rejects the model.

## Flow (two-pass)

1. Rules — reject empty text
2. **Game model** (custom fine-tune) — gross/weird food **allowed**, hate/threats blocked
3. **Profanity model** (pre-trained `unbiased-toxic-roberta` on HF catalog) — if game model allows, block on **obscene** or **insult** only (not overall `toxic`, so cockroach salad still passes)
4. Fallback — local model / OpenAI if primary unreachable
5. Fail-open only if all providers down (logged)

You should **not** need every `fuck + {dish}` combo in training — the profanity pass generalises. The custom model’s job is game-specific allowance (gross food) and hate/threats in dish names.

Block → HTTP 422 `content_moderation`. UI shows the family-friendly message + **Edit description**.

## Providers

| Provider | When | How |
|----------|------|-----|
| `huggingface` | Production, Heroku | `router.huggingface.co/hf-inference/models/{model}` |
| `local-model` | Local dev without Hub | Python daemon → `ml/text-moderation/output/model` |
| `rules-only` | Testing | Empty-text check only |
| `openai` | Optional fallback | OpenAI moderation API |

Binary model evaluation: block only when `blocked` score ≥ `TEXT_MODERATION_THRESHOLD` (default 0.5).

## Env

```bash
TEXT_MODERATION_ENABLED=true
TEXT_MODERATION_PROVIDER=huggingface
HUGGINGFACE_API_KEY=...                         # Write + Inference Providers
HUGGINGFACE_MODERATION_MODEL=dshirls/food-truck-moderation-v1
TEXT_MODERATION_THRESHOLD=0.5
TEXT_MODERATION_PROFANITY_CHECK=true
TEXT_MODERATION_PROFANITY_MODEL=unitary/unbiased-toxic-roberta
TEXT_MODERATION_PROFANITY_THRESHOLD=0.45
```

## Module layout

```
web/src/lib/moderation/
  moderate-text.ts          # entry
  config.ts
  providers/
    rules.ts
    huggingface.ts          # Hub Inference + evaluateClassification
    local-model.ts          # Python daemon
    openai.ts
```

## ML lane

```
ml/text-moderation/
  datasets/signature-dish-samples.csv
  train.py
  push-to-hub.sh
  infer.py / infer_daemon.py
```

See [`HF_TRAINING_GUIDE.md`](./HF_TRAINING_GUIDE.md).

## Tests

`cd web && npm test` — `moderate-text.test.ts`, `huggingface.test.ts`, `signature-dish/generate/route.test.ts`
