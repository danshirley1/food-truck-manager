# Threshold tuning

After your custom model is on the Hub, pick `TEXT_MODERATION_THRESHOLD` in `web/.env`.

## Default

```bash
TEXT_MODERATION_THRESHOLD=0.5
```

Block when the **`blocked`** label score ≥ threshold.

## How to tune

1. Test 10–20 phrases in the Hub Inference widget or via curl
2. Note scores for allowed gross food vs real violations
3. Set threshold **between** the highest allowed score and lowest blocked score you care about

## Example (fill in after your run)

| Phrase | blocked score | Decision at 0.5 |
|--------|---------------|-----------------|
| a cake made of cockroaches | | |
| cockroaches on toast | | |
| fuck you cake | | |

**Chosen threshold:**  

**Reason:**
