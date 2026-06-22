#!/usr/bin/env python3
"""
Fine-tune a binary text classifier (allowed vs blocked) for Signature Dish moderation.

Usage (from ml/text-moderation/):
  pip install -r requirements.txt
  HF_TOKEN=hf_... python train.py --push-to-hub your-username/food-truck-moderation-v1

Works on: local CPU/MPS, Google Colab, Kaggle notebook.
Uses pandas + PyTorch only (no `datasets` / pyarrow dependency).
"""

from __future__ import annotations

import argparse
import os
from pathlib import Path

import numpy as np
import pandas as pd
import torch
from sklearn.metrics import accuracy_score, f1_score, precision_recall_fscore_support
from sklearn.model_selection import train_test_split
from torch.utils.data import Dataset as TorchDataset
from transformers import (
    AutoModelForSequenceClassification,
    AutoTokenizer,
    Trainer,
    TrainingArguments,
)

ROOT = Path(__file__).resolve().parent
DEFAULT_CSV = ROOT / "datasets" / "signature-dish-samples.csv"
BASE_MODEL = "distilbert-base-uncased"
ID2LABEL = {0: "allowed", 1: "blocked"}
LABEL2ID = {v: k for k, v in ID2LABEL.items()}


class TextLabelDataset(TorchDataset):
    def __init__(self, texts: list[str], labels: list[int], tokenizer, max_length: int):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self) -> int:
        return len(self.texts)

    def __getitem__(self, idx: int):
        encoded = self.tokenizer(
            self.texts[idx],
            truncation=True,
            max_length=self.max_length,
            padding="max_length",
        )
        item = {k: torch.tensor(v) for k, v in encoded.items()}
        item["labels"] = torch.tensor(self.labels[idx], dtype=torch.long)
        return item


def load_game_csv(path: Path) -> tuple[list[str], list[int]]:
    df = pd.read_csv(path)
    df = df[["text", "label"]].dropna()
    df["label_id"] = df["label"].map(LABEL2ID)
    df = df[df["label_id"].notna()]
    texts = df["text"].astype(str).tolist()
    labels = df["label_id"].astype(int).tolist()
    return texts, labels


def compute_metrics(eval_pred):
    logits, labels = eval_pred
    preds = np.argmax(logits, axis=-1)
    precision, recall, f1, _ = precision_recall_fscore_support(
        labels, preds, average="binary", pos_label=1, zero_division=0
    )
    return {
        "accuracy": accuracy_score(labels, preds),
        "precision_blocked": precision,
        "recall_blocked": recall,
        "f1_blocked": f1,
    }


def predict_samples(model, tokenizer, texts: list[str], max_length: int) -> None:
    model.eval()
    device = next(model.parameters()).device
    print("\nSample predictions:")
    for text in texts:
        encoded = tokenizer(
            text,
            truncation=True,
            max_length=max_length,
            padding=True,
            return_tensors="pt",
        )
        encoded = {k: v.to(device) for k, v in encoded.items()}
        with torch.no_grad():
            logits = model(**encoded).logits[0]
        probs = torch.softmax(logits, dim=-1).cpu().tolist()
        pred_id = int(np.argmax(probs))
        print(f"  [{ID2LABEL[pred_id]} {probs[pred_id]:.2f}] {text!r}")


def main() -> None:
    parser = argparse.ArgumentParser(description="Fine-tune Signature Dish moderation model")
    parser.add_argument("--csv", type=Path, default=DEFAULT_CSV, help="Game-specific CSV")
    parser.add_argument("--base-model", default=BASE_MODEL)
    parser.add_argument("--output-dir", type=Path, default=ROOT / "output" / "model")
    parser.add_argument("--push-to-hub", default=None, help="HF repo id, e.g. user/food-truck-moderation-v1")
    parser.add_argument("--epochs", type=int, default=8)
    parser.add_argument("--batch-size", type=int, default=8)
    parser.add_argument("--max-length", type=int, default=128)
    args = parser.parse_args()

    if not args.csv.exists():
        raise SystemExit(f"CSV not found: {args.csv}")

    print(f"Loading game data from {args.csv}")
    texts, labels = load_game_csv(args.csv)
    print(f"  rows: {len(texts)}")

    train_texts, test_texts, train_labels, test_labels = train_test_split(
        texts, labels, test_size=0.15, random_state=42, stratify=labels
    )
    print(f"  train: {len(train_texts)}, test: {len(test_texts)}")

    tokenizer = AutoTokenizer.from_pretrained(args.base_model)
    model = AutoModelForSequenceClassification.from_pretrained(
        args.base_model,
        num_labels=2,
        id2label=ID2LABEL,
        label2id=LABEL2ID,
    )

    train_ds = TextLabelDataset(train_texts, train_labels, tokenizer, args.max_length)
    test_ds = TextLabelDataset(test_texts, test_labels, tokenizer, args.max_length)

    args.output_dir.mkdir(parents=True, exist_ok=True)
    use_mps = torch.backends.mps.is_available()
    use_cuda = torch.cuda.is_available()

    training_args = TrainingArguments(
        output_dir=str(args.output_dir),
        num_train_epochs=args.epochs,
        per_device_train_batch_size=args.batch_size,
        per_device_eval_batch_size=args.batch_size,
        eval_strategy="epoch",
        save_strategy="epoch",
        load_best_model_at_end=True,
        metric_for_best_model="f1_blocked",
        greater_is_better=True,
        logging_steps=5,
        report_to="none",
        fp16=use_cuda,
        use_mps_device=use_mps,
    )

    trainer = Trainer(
        model=model,
        args=training_args,
        train_dataset=train_ds,
        eval_dataset=test_ds,
        tokenizer=tokenizer,
        compute_metrics=compute_metrics,
    )

    print("Training…")
    trainer.train()
    metrics = trainer.evaluate()
    print("Test metrics:", metrics)

    predict_samples(
        trainer.model,
        tokenizer,
        [
            "cockroach salad",
            "a cake made of cockroaches",
            "fuck you cake",
            "spicy kimchi grilled cheese",
            "kill yourself taco",
        ],
        args.max_length,
    )

    trainer.save_model(str(args.output_dir))
    tokenizer.save_pretrained(str(args.output_dir))

    if args.push_to_hub:
        token = os.environ.get("HF_TOKEN") or os.environ.get("HUGGINGFACE_API_KEY")
        if not token:
            print("[warn] Set HF_TOKEN to push. Skipping hub upload.")
        else:
            print(f"Pushing to Hub: {args.push_to_hub}")
            trainer.push_to_hub(args.push_to_hub)
            tokenizer.push_to_hub(args.push_to_hub)
            print(f"Done. Set in web/.env:")
            print(f"  HUGGINGFACE_MODERATION_MODEL={args.push_to_hub}")


if __name__ == "__main__":
    main()
