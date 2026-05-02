#!/usr/bin/env bash
# Verifies that lib/api.ts exists before generating components.
# Prevents the skill from generating components that import from a non-existent file.

set -e

API_FILE="lib/api.ts"
TYPES_FILE="lib/types.ts"

if [ ! -f "$API_FILE" ]; then
  echo "ERROR: $API_FILE not found. Create it before generating components."
  exit 1
fi

if [ ! -f "$TYPES_FILE" ]; then
  echo "ERROR: $TYPES_FILE not found. Create it before generating components."
  exit 1
fi

echo "OK: API layer is in place ($API_FILE, $TYPES_FILE)"
exit 0