#!/usr/bin/env python3
"""Run one classification — stdout JSON for the Next.js local-model provider."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import numpy as np
import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

ROOT = Path(__file__).resolve().parent
DEFAULT_MODEL = ROOT / "output" / "model"
ID2LABEL = {0: "allowed", 1: "blocked"}


def classify(text: str, model_dir: Path) -> list[dict[str, float | str]]:
    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForSequenceClassification.from_pretrained(model_dir)
    model.eval()

    encoded = tokenizer(text, truncation=True, max_length=128, return_tensors="pt")
    with torch.no_grad():
        logits = model(**encoded).logits[0]
    probs = torch.softmax(logits, dim=-1).cpu().tolist()

    return [
        {"label": ID2LABEL[i], "score": float(probs[i])}
        for i in range(len(probs))
    ]


def main() -> None:
    if len(sys.argv) < 2:
        print(json.dumps({"error": "usage: infer.py <text> [model_dir]"}))
        sys.exit(1)

    text = sys.argv[1]
    model_dir = Path(sys.argv[2]) if len(sys.argv) > 2 else DEFAULT_MODEL

    if not model_dir.exists():
        print(json.dumps({"error": f"model not found: {model_dir}"}))
        sys.exit(1)

    items = classify(text, model_dir)
    print(json.dumps(items))


if __name__ == "__main__":
    main()
