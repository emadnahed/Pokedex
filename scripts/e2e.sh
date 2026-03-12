#!/usr/bin/env bash
# ──────────────────────────────────────────────────────────────────────────────
# e2e.sh — Sequential Detox test runner
#
# Usage:
#   ./scripts/e2e.sh                     # run all suites one by one
#   ./scripts/e2e.sh app-launch          # run a single suite by name
#   ./scripts/e2e.sh pokedex-list        # partial name match works too
#
# Configuration is picked up from .detoxrc.js (ios.sim.debug by default).
# Override with:  DETOX_CONFIGURATION=ios.sim.release ./scripts/e2e.sh
# ──────────────────────────────────────────────────────────────────────────────

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CONFIGURATION="${DETOX_CONFIGURATION:-ios.sim.debug}"

# All test suites in the order they should run
ALL_SUITES=(
  "app-launch"
  "pokedex-list"
  "pokemon-detail"
  "evolution"
)

# ── helpers ───────────────────────────────────────────────────────────────────

log()  { echo ""; echo "▶  $*"; }
pass() { echo "✔  $*"; }
fail() { echo "✘  $*" >&2; }

kill_detox() {
  # Kill any stray detox / jest worker processes left from a previous run
  pkill -f "detox test" 2>/dev/null || true
  pkill -f "jest.*e2e"  2>/dev/null || true
  sleep 1
}

run_suite() {
  local name="$1"
  log "Running suite: $name  (config: $CONFIGURATION)"

  if npx detox test \
      --configuration "$CONFIGURATION" \
      --testPathPattern "$name" \
      --forceExit \
      2>&1; then
    pass "Suite PASSED: $name"
    return 0
  else
    fail "Suite FAILED: $name"
    return 1
  fi
}

# ── main ──────────────────────────────────────────────────────────────────────

kill_detox

FAILED=()

if [[ $# -eq 0 ]]; then
  # Run every suite sequentially
  for suite in "${ALL_SUITES[@]}"; do
    if ! run_suite "$suite"; then
      FAILED+=("$suite")
    fi
  done
else
  # Run the single suite whose name matches the first argument
  MATCH=""
  for suite in "${ALL_SUITES[@]}"; do
    if [[ "$suite" == *"$1"* ]]; then
      MATCH="$suite"
      break
    fi
  done

  if [[ -z "$MATCH" ]]; then
    echo "Unknown suite: '$1'"
    echo "Available suites: ${ALL_SUITES[*]}"
    exit 1
  fi

  if ! run_suite "$MATCH"; then
    FAILED+=("$MATCH")
  fi
fi

echo ""
if [[ ${#FAILED[@]} -eq 0 ]]; then
  echo "All suites passed."
  exit 0
else
  echo "Failed suites: ${FAILED[*]}"
  exit 1
fi
