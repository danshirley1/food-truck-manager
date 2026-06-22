#!/usr/bin/env bash
# Push the locally trained model to Hugging Face Hub.
# Requires HF_TOKEN with Write permission (not read-only Inference token).
#
# Usage:
#   HF_TOKEN=hf_xxx ./push-to-hub.sh
#   # or set HUGGINGFACE_API_KEY in web/.env with a Write token

set -euo pipefail
cd "$(dirname "$0")"

REPO="${HF_REPO:-dshirls/food-truck-moderation-v1}"
MODEL_DIR="output/model"

if [[ -z "${HF_TOKEN:-}" ]]; then
  if [[ -f ../../web/.env ]]; then
    HF_TOKEN=$(grep -E '^HUGGINGFACE_API_KEY=' ../../web/.env | cut -d= -f2- | tr -d '"' | tr -d "'")
  fi
fi

if [[ -z "${HF_TOKEN:-}" ]]; then
  echo "Error: Set HF_TOKEN or HUGGINGFACE_API_KEY in web/.env"
  exit 1
fi

if [[ ! -f "$MODEL_DIR/model.safetensors" ]]; then
  echo "Error: No trained model at $MODEL_DIR — run: python train.py --epochs 8"
  exit 1
fi

source .venv/bin/activate 2>/dev/null || {
  echo "Creating venv…"
  python3 -m venv .venv && source .venv/bin/activate
  pip install -q -r requirements.txt transformers torch
}

export HF_TOKEN
python <<PY
import os
from huggingface_hub import HfApi, whoami
from transformers import AutoModelForSequenceClassification, AutoTokenizer

repo = os.environ.get("HF_REPO", "$REPO")
token = os.environ["HF_TOKEN"]
user = whoami(token=token)["name"]
print(f"Logged in as: {user}")

api = HfApi(token=token)
api.create_repo(repo, exist_ok=True, repo_type="model")
print(f"Repo: https://huggingface.co/{repo}")

model = AutoModelForSequenceClassification.from_pretrained("$MODEL_DIR")
tokenizer = AutoTokenizer.from_pretrained("$MODEL_DIR")
model.push_to_hub(repo, token=token)
tokenizer.push_to_hub(repo, token=token)

# Model card with pipeline_tag
card_path = "model-card.md"
if os.path.isfile(card_path):
    api.upload_file(
        path_or_fileobj=card_path,
        path_in_repo="README.md",
        repo_id=repo,
        repo_type="model",
        token=token,
    )
    print("Uploaded model card (README.md)")

print("Upload complete.")
print(f"Set in web/.env:")
print(f"  HUGGINGFACE_MODERATION_MODEL={repo}")
print(f"  TEXT_MODERATION_PROVIDER=local-model   # local demo (recommended)")
print(f"  # OR deploy Inference Endpoint → HUGGINGFACE_INFERENCE_ENDPOINT=<url>")
PY

echo ""
echo "Testing local inference (custom models are NOT on hf-inference catalog)…"
python infer.py "cockroach salad" || true
echo ""
echo "Note: router.huggingface.co/hf-inference only hosts a curated model list."
echo "For cloud deploy: https://huggingface.co/${REPO} → Deploy → Inference Endpoints"
