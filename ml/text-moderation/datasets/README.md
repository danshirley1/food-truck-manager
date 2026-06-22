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

- **POC:** 50–200 rows in `signature-dish-samples.csv` is enough to prove the pipeline
- **Better profanity coverage:** run LDNOOBW augment (open word list → food dish names):

```bash
.venv/bin/python scripts/augment_from_ldnoobw.py   # → datasets/ldnoobw-food-augmented.csv
./train.sh --epochs 10                             # merges game + augment automatically
# or one step:
./train.sh --augment --epochs 10
```

- **Optional:** `--fetch-jigsaw-sample` on the augment script (needs `pip install datasets`) adds toxic Jigsaw comments
- **Source:** [LDNOOBW](https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words) (MIT)
- **Watch false positives:** every `allowed` row that looks edgy (cockroaches, worms, shiitake) is valuable

## Upload to Hugging Face (optional)

```bash
huggingface-cli login
huggingface-cli upload your-username/food-truck-moderation-data ./signature-dish-samples.csv
```

Or create a Dataset repo in the Hub UI and upload the CSV.
