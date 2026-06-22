#!/usr/bin/env python3
"""
Build food-context blocked examples from the open LDNOOBW profanity word list.

Source (MIT): https://github.com/LDNOOBW/List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words

Generates rows like "cunt sandwich", "fucking taco" so the model generalises
profanity across dish names — not just phrases seen in the hand-written CSV.

Usage (from ml/text-moderation/):
  .venv/bin/python scripts/augment_from_ldnoobw.py
  .venv/bin/python scripts/augment_from_ldnoobw.py --fetch-jigsaw-sample  # optional extra rows
"""

from __future__ import annotations

import argparse
import csv
import re
import urllib.request
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
GAME_CSV = ROOT / "datasets" / "signature-dish-samples.csv"
OUT_CSV = ROOT / "datasets" / "ldnoobw-food-augmented.csv"

LDNOOBW_EN_URL = (
    "https://raw.githubusercontent.com/LDNOOBW/"
    "List-of-Dirty-Naughty-Obscene-and-Otherwise-Bad-Words/master/en"
)

# Skip obscure porn / spam phrases — keep profanity, slurs, insults for game moderation.
SKIP_SUBSTRINGS = (
    "bangbros",
    "bangbus",
    "babeland",
    "ball gag",
    "ball gravy",
    "ball kicking",
    "ball licking",
    "ball sack",
    "ball sucking",
    "beaver cleaver",
    "beaver lips",
    "baby batter",
    "baby juice",
    "2g1c",
    "2 girls 1 cup",
    "alabama hot pocket",
    "alaskan pipeline",
    "barely legal",
    "barenaked",
    "auto erotic",
    "autoerotic",
)

FOOD_SUFFIXES = (
    "sandwich",
    "taco",
    "burger",
    "bowl",
    "wrap",
    "platter",
    "special",
    "deluxe",
    "salad",   # was missing — model saw many allowed *salad rows
    "soup",
    "fries",
    "ramen",
    "wings",
    "burrito",
    "pasta",
    "pie",
    "cake",
    "noodles",
)

SINGLE_WORD_RE = re.compile(r"^[a-z][a-z'-]{2,24}$")


def fetch_ldnoobw_terms() -> list[str]:
    with urllib.request.urlopen(LDNOOBW_EN_URL, timeout=30) as resp:
        raw = resp.read().decode("utf-8")
    terms: list[str] = []
    seen: set[str] = set()
    for line in raw.splitlines():
        term = line.strip().lower()
        if not term or term in seen:
            continue
        seen.add(term)
        terms.append(term)
    return terms


def should_skip_term(term: str) -> bool:
    lowered = term.lower()
    if any(skip in lowered for skip in SKIP_SUBSTRINGS):
        return True
    if len(term) > 48:
        return True
    # Keep letters, spaces, hyphens, apostrophes only
    if not re.match(r"^[a-z0-9][a-z0-9\s'\-]*$", lowered):
        return True
    return False


def food_dish_variants(term: str) -> list[str]:
    """Turn a profanity term into Signature-Dish-style blocked examples."""
    if should_skip_term(term):
        return []

    variants: list[str] = []
    if " " in term:
        # Multi-word phrase → one or two dish names
        variants.append(f"{term} special")
        variants.append(f"{term} platter")
        return variants[:2]

    if SINGLE_WORD_RE.match(term):
        for suffix in FOOD_SUFFIXES:
            variants.append(f"{term} {suffix}")
        return variants

    return []


def load_existing_texts() -> set[str]:
    existing: set[str] = set()
    for path in (GAME_CSV, OUT_CSV):
        if not path.exists():
            continue
        with path.open(newline="", encoding="utf-8") as f:
            for row in csv.DictReader(f):
                text = (row.get("text") or "").strip().lower()
                if text:
                    existing.add(text)
    return existing


def fetch_jigsaw_sample(max_rows: int = 400) -> list[tuple[str, str, str]]:
    """
    Optional: short toxic lines from Jigsaw (via HF datasets). Requires `datasets` package.
    Returns (text, label, notes) tuples — not food-wrapped; use sparingly for tone diversity.
    """
    try:
        from datasets import load_dataset  # type: ignore
    except ImportError:
        print("[warn] pip install datasets to use --fetch-jigsaw-sample")
        return []

    ds = load_dataset("google/jigsaw_toxicity_pred", split="train")
    rows: list[tuple[str, str, str]] = []
    for row in ds:
        if len(rows) >= max_rows:
            break
        text = (row.get("comment_text") or "").strip()
        if not text or len(text) > 180:
            continue
        toxic = (
            row.get("toxic")
            or row.get("severe_toxic")
            or row.get("obscene")
            or row.get("insult")
            or row.get("identity_hate")
            or row.get("threat")
        )
        if toxic:
            rows.append((text, "blocked", "jigsaw toxic sample"))
    return rows


def main() -> None:
    parser = argparse.ArgumentParser(description="Augment training CSV from LDNOOBW")
    parser.add_argument(
        "--fetch-jigsaw-sample",
        action="store_true",
        help="Add up to 400 toxic Jigsaw comments (pip install datasets)",
    )
    parser.add_argument(
        "--output",
        type=Path,
        default=OUT_CSV,
        help="Output CSV path",
    )
    args = parser.parse_args()

    print(f"Fetching LDNOOBW list from {LDNOOBW_EN_URL}")
    terms = fetch_ldnoobw_terms()
    print(f"  {len(terms)} terms on list")

    existing = load_existing_texts()
    rows: list[dict[str, str]] = []
    seen_out: set[str] = set()

    for term in terms:
        for dish in food_dish_variants(term):
            key = dish.lower()
            if key in existing or key in seen_out:
                continue
            seen_out.add(key)
            rows.append(
                {
                    "text": dish,
                    "label": "blocked",
                    "notes": f"ldnoobw augment ({term})",
                }
            )

    if args.fetch_jigsaw_sample:
        print("Fetching Jigsaw toxic sample…")
        for text, label, notes in fetch_jigsaw_sample():
            key = text.lower()
            if key in existing or key in seen_out:
                continue
            seen_out.add(key)
            rows.append({"text": text, "label": label, "notes": notes})

    rows.sort(key=lambda r: r["text"].lower())
    args.output.parent.mkdir(parents=True, exist_ok=True)
    with args.output.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["text", "label", "notes"])
        writer.writeheader()
        writer.writerows(rows)

    print(f"Wrote {len(rows)} augmented blocked rows → {args.output}")
    print("Next: ./train.sh --epochs 10  (merges game CSV + augmented automatically)")


if __name__ == "__main__":
    main()
