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
  kill "$KONG_PID" "$BADGE_PID" "$WEATHER_PID" "$TREND_PID" 2>/dev/null || true
}
trap cleanup EXIT

# 1. Port-forward Supabase Kong API gateway
#log_step "Port-forwarding Supabase Kong (localhost:8000)..."
#kubectl port-forward svc/supabase-supabase-kong 8000:8000 -n supabase &
#KONG_PID=$!
#log_success "Kong port-forward running (pid: $KONG_PID)"

## 3. Serve edge functions in the background
#echo ""
#log_step "Starting badge-worker..."
#supabase functions serve badge-worker &
#BADGE_PID=$!
#log_success "badge-worker running (pid: $BADGE_PID)"

#log_step "Starting weather-worker..."
#supabase functions serve weather-worker &
#WEATHER_PID=$!
#log_success "weather-worker running (pid: $WEATHER_PID)"

#log_step "Starting trend-worker..."
#supabase functions serve trend-worker &
#TREND_PID=$!
#log_success "trend-worker running (pid: $TREND_PID)"

# 4. Start dev server
echo ""
log_step "Starting dev server..."
cd "$PROJECT_DIR"
# Work around intermittent Turbopack cache corruption ("Next.js package not found").
rm -rf "$PROJECT_DIR/.next/dev/cache/turbopack"
pnpm run dev
