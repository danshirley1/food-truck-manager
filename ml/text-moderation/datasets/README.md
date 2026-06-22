# Signature Dish moderation dataset

## Columns

| Column | Values | Purpose |
|--------|--------|---------|
| `text` | free text, max ~200 chars | What the player types in Signature Dish |
| `label` | `allowed` or `blocked` | Your training target |
| `notes` | optional | Why you labeled it this way (not used in training) |

## Rules of thumb

**Label `allowed`** when the dish is gross, weird, or immature but still family-friendly game humour:

- insects / mud / slime as food jokes
- "mystery meat", burnt, rotten-sounding names
- fantasy / Halloween gag foods

**Label `blocked`** when it contains:

- profanity, slurs, hate toward groups
- sexual content
- threats or self-harm phrases
- real-world hate ideologies

## Size

- **POC:** 50–200 rows in this CSV is enough to prove the pipeline
- **Better model:** add 1k–10k rows from public sets (Jigsaw toxicity) plus 100+ game-specific rows
- **Watch false positives:** every `allowed` row that looks edgy (cockroaches, worms) is valuable

## Upload to Hugging Face (optional)

```bash
huggingface-cli login
huggingface-cli upload your-username/food-truck-moderation-data ./signature-dish-samples.csv
```

Or create a Dataset repo in the Hub UI and upload the CSV.
