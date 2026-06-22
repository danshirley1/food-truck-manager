#!/usr/bin/env python3
"""Persistent inference daemon — loads model once, reads one line per request on stdin."""

from __future__ import annotations

import json
import sys
from pathlib import Path

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer

ROOT = Path(__file__).resolve().parent
DEFAULT_MODEL = ROOT / "output" / "model"
ID2LABEL = {0: "allowed", 1: "blocked"}


def main() -> None:
    model_dir = Path(sys.argv[1]) if len(sys.argv) > 1 else DEFAULT_MODEL
    if not model_dir.exists():
        print(json.dumps({"error": f"model not found: {model_dir}"}), flush=True)
        sys.exit(1)

    tokenizer = AutoTokenizer.from_pretrained(model_dir)
    model = AutoModelForSequenceClassification.from_pretrained(model_dir)
    model.eval()

    # Ready signal for parent process
    print(json.dumps({"ready": True, "model": str(model_dir)}), flush=True)

    for line in sys.stdin:
        text = line.strip()
        if not text:
            continue
        if text == "__shutdown__":
            break

        encoded = tokenizer(text, truncation=True, max_length=128, return_tensors="pt")
        with torch.no_grad():
            logits = model(**encoded).logits[0]
        probs = torch.softmax(logits, dim=-1).cpu().tolist()
        items = [{"label": ID2LABEL[i], "score": float(probs[i])} for i in range(len(probs))]
        print(json.dumps(items), flush=True)


if __name__ == "__main__":
    main()
