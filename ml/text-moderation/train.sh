#!/usr/bin/env bash
# Train using the project venv (avoids "No module named numpy" from system Python).
set -euo pipefail
cd "$(dirname "$0")"

if [[ ! -d .venv ]]; then
  echo "Creating .venv and installing requirements…"
  python3 -m venv .venv
  .venv/bin/pip install -q -r requirements.txt
fi

if [[ "${1:-}" == "--augment" ]]; then
  shift
  echo "Building LDNOOBW food-context augment…"
  .venv/bin/python scripts/augment_from_ldnoobw.py
fi

exec .venv/bin/python train.py "$@"
