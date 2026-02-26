#!/bin/bash
set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Color + symbol helpers for readable local dev output.
if [[ -t 1 ]]; then
  RESET=$'\033[0m'
  BOLD=$'\033[1m'
  BLUE=$'\033[34m'
  GREEN=$'\033[32m'
  YELLOW=$'\033[33m'
else
  RESET=""
  BOLD=""
  BLUE=""
  GREEN=""
  YELLOW=""
fi

log_step() {
  echo -e "${BLUE}${BOLD}➜${RESET} $1"
}

log_success() {
  echo -e "${GREEN}✓${RESET} $1"
}

log_warn() {
  echo -e "${YELLOW}⚠${RESET} $1"
}

# Cleanup background processes on exit
cleanup() {
  echo ""
  log_warn "Shutting down..."
  kill "$BADGE_PID" "$WEATHER_PID" "$TREND_PID" 2>/dev/null || true
}
trap cleanup EXIT

# 1. Ensure Docker is running
log_step "Checking Docker..."
if ! docker info &>/dev/null; then
  log_warn "Docker is not running. Starting Docker..."
  open -a Docker
  log_step "Waiting for Docker to start"
  until docker info &>/dev/null; do
    sleep 2
    printf "."
  done
  echo ""
  log_success "Docker is ready."
else
  log_success "Docker is already running."
fi

# 2. Serve edge functions in the background
echo ""
log_step "Starting badge-worker..."
supabase functions serve badge-worker &
BADGE_PID=$!
log_success "badge-worker running (pid: $BADGE_PID)"

log_step "Starting weather-worker..."
supabase functions serve weather-worker &
WEATHER_PID=$!
log_success "weather-worker running (pid: $WEATHER_PID)"

log_step "Starting trend-worker..."
supabase functions serve trend-worker &
TREND_PID=$!
log_success "trend-worker running (pid: $TREND_PID)"

# 3. Start dev server
echo ""
log_step "Starting dev server..."
cd "$PROJECT_DIR"
pnpm run dev
