#!/usr/bin/env bash
#
# start.sh — run the whole Juralio app on this machine with one command.
#
# You do not need Java, Node, PostgreSQL or any of the app's tooling: everything
# runs in containers. The only thing to install first is Docker Desktop
# (https://www.docker.com/products/docker-desktop) — start it, then run:
#
#     ./start.sh            start the app (first run takes ~5 minutes)
#     ./start.sh dev        start with live code editing (see below)
#     ./start.sh stop       stop it (your data is kept)
#     ./start.sh logs       watch what it's doing
#     ./start.sh status     is it up?
#     ./start.sh seed       add demo users and a sample matter
#     ./start.sh reset      erase the database and start over
#
# Two ways to run the frontend:
#
#   ./start.sh       builds the app first, then serves it. Slower to start,
#                    quicker to use. Use this unless you're editing code.
#   ./start.sh dev   runs the development server against your files. Starts
#                    faster and picks up edits as you save them, but every page
#                    is noticeably slower because the files live outside the
#                    container. Editing the backend needs a restart either way.
#
# Developers working on the code should usually use the faster native setup
# instead — see docs/RUNBOOK-LOCAL-SETUP.md.
#
# Ports can be moved if something else on your machine is using them:
#     JURALIO_FRONTEND_PORT=9090 ./start.sh

set -euo pipefail

BOLD=$'\033[1m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; RED=$'\033[31m'; RESET=$'\033[0m'
step() { printf "\n${BOLD}▶ %s${RESET}\n" "$1"; }
ok()   { printf "  ${GREEN}✓ %s${RESET}\n" "$1"; }
info() { printf "  ${YELLOW}• %s${RESET}\n" "$1"; }
fail() { printf "\n${RED}✗ %s${RESET}\n" "$1" >&2; exit 1; }

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

COMPOSE_FILE_LOCAL="docker-compose.local.yml"
FRONTEND_PORT="${JURALIO_FRONTEND_PORT:-3000}"
API_PORT="${JURALIO_API_PORT:-8080}"
DB_PORT="${JURALIO_DB_PORT:-5433}"
ADMINER_PORT="${JURALIO_ADMINER_PORT:-8083}"

# api-helper.js only routes API calls to the backend when the page is served
# from one of these ports; on anything else the app calls itself and every
# request fails.
DEV_APP_PORTS=("3000" "9090" "3007")

# The dev frontend is profile-gated so a bare `docker compose up` can't start it
# alongside the static one and fight over the port. Enabling the profile on
# every call keeps all services addressable by stop/logs/ps; which frontend
# actually runs is decided by the explicit service list passed to `up`.
compose() { docker compose -f "$COMPOSE_FILE_LOCAL" --profile dev "$@"; }

BASE_SERVICES="db server adminer"
STATIC_FRONTEND="frontend-static"
DEV_FRONTEND="frontend"

# ── Preflight ───────────────────────────────────────────────────────────────
require_docker() {
  command -v docker >/dev/null 2>&1 \
    || fail "Docker isn't installed. Install Docker Desktop: https://www.docker.com/products/docker-desktop"
  docker compose version >/dev/null 2>&1 \
    || fail "This needs Docker Compose v2 (bundled with current Docker Desktop). Update Docker Desktop and try again."
  docker info >/dev/null 2>&1 \
    || fail "Docker isn't running. Start Docker Desktop, wait for the whale icon to settle, then run ./start.sh again."
}

port_in_use() {  # port_in_use <port>
  if command -v lsof >/dev/null 2>&1; then
    [ -n "$(lsof -nP -iTCP:"$1" -sTCP:LISTEN -t 2>/dev/null || true)" ]
  else
    (exec 3<>"/dev/tcp/127.0.0.1/$1") >/dev/null 2>&1
  fi
}

# Ports held by our own containers are fine — that's a restart, not a clash.
port_held_by_us() {  # port_held_by_us <port>
  compose ps --format '{{.Ports}}' 2>/dev/null | grep -q ":$1->"
}

check_ports() {
  local clash=""
  for entry in "frontend:$FRONTEND_PORT" "backend:$API_PORT" "database:$DB_PORT" "adminer:$ADMINER_PORT"; do
    local name="${entry%%:*}" port="${entry##*:}"
    if port_in_use "$port" && ! port_held_by_us "$port"; then
      info "port $port ($name) is already in use"
      clash="yes"
    fi
  done
  if [ -n "$clash" ]; then
    printf "\n"
    info "Something else on this machine is using a port the app needs."
    info "If that's your own native backend or frontend, stop it first."
    info "Otherwise move ours, e.g.:  JURALIO_FRONTEND_PORT=9090 ./start.sh"
    fail "Ports unavailable."
  fi

  local valid=""
  for p in "${DEV_APP_PORTS[@]}"; do [ "$FRONTEND_PORT" = "$p" ] && valid="yes"; done
  [ -n "$valid" ] || fail "JURALIO_FRONTEND_PORT must be one of ${DEV_APP_PORTS[*]} — the app only knows to call the backend from those ports."
}

check_env_file() {
  if [ ! -f frontend/.env.local ]; then
    info "No frontend/.env.local — that's fine; only the Google Drive file picker needs it."
    info "See frontend/.env.local.example if you want it working."
  fi
}

# Prints the HTTP status of a URL, or 000 if nothing answered. Note that curl
# itself writes "000" on a connection failure, so the fallback must be an
# assignment — `curl … || echo 000` yields "000000", which then compares
# unequal to "000" and reads as success.
http_code() {  # http_code <url>
  local out
  out="$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 "$1" 2>/dev/null)" || out=""
  case "$out" in
    ''|*[!0-9]*) printf '000' ;;
    *) printf '%s' "$out" ;;
  esac
}

api_up() { [ "$(http_code "http://localhost:$API_PORT/health")" = "200" ]; }
frontend_up() { [ "$(http_code "http://localhost:$FRONTEND_PORT/")" = "200" ]; }

# ── Commands ────────────────────────────────────────────────────────────────
wait_until_up() {
  step "Waiting for the app to start"
  info "The first start compiles the backend — a few minutes is normal."
  info "Nothing is stuck; run './start.sh logs' in another window to watch."

  local elapsed=0
  for _ in $(seq 1 360); do  # up to ~30 minutes
    if [ -z "$(compose ps -q server)" ] || \
       [ "$(docker inspect -f '{{.State.Running}}' "$(compose ps -q server)" 2>/dev/null)" != "true" ]; then
      printf "\n"
      info "The backend stopped. Last 20 lines:"
      compose logs --tail 20 server || true
      fail "Backend failed to start. './start.sh logs server' has the full output."
    fi
    if api_up; then printf "\n"; ok "Backend is up"; return 0; fi
    printf "  …still starting (%s min)   \r" "$((elapsed / 60))"
    sleep 5
    elapsed=$((elapsed + 5))
  done
  printf "\n"
  fail "Backend didn't come up within 30 minutes. Check './start.sh logs server'."
}

# The dev server needs a second or two after its container starts, so don't
# announce a URL that would still refuse the connection.
wait_for_frontend() {
  for _ in $(seq 1 30); do
    frontend_up && return 0
    sleep 2
  done
  info "The frontend isn't answering on port $FRONTEND_PORT yet — './start.sh logs' will show why."
}

print_ready() {  # print_ready <mode>
  cat <<READY

${GREEN}${BOLD}The app is running 🎉${RESET}

  Open in your browser:  ${BOLD}http://localhost:$FRONTEND_PORT${RESET}

  Database browser:      http://localhost:$ADMINER_PORT
                         (System: PostgreSQL — server db, user juralio,
                          password juralio, database juralio)

Log in with:
  sysadmin@juralio.com        Password1Password1\$
  matter.creator@juralio.com  Password2Password2\$

READY
  if [ "$1" = "dev" ]; then
    cat <<'DEVNOTE'
  Frontend: development server — your edits appear as you save them, and pages
  load more slowly because the files are read from outside the container.
  Backend code changes still need './start.sh stop' then './start.sh dev'.
DEVNOTE
  else
    cat <<'FASTNOTE'
  Frontend: built and served as static files — the quicker option.
  Code changes need './start.sh' again to rebuild, or use './start.sh dev'.
FASTNOTE
  fi
  cat <<'TAIL'

  ./start.sh seed    add demo users and a sample matter
  ./start.sh logs    see what the app is doing
  ./start.sh stop    stop the app (your data is kept)
TAIL
}

cmd_up() {  # cmd_up <fast|dev>
  local mode="$1" frontend other
  if [ "$mode" = "dev" ]; then frontend="$DEV_FRONTEND"; other="$STATIC_FRONTEND"
  else frontend="$STATIC_FRONTEND"; other="$DEV_FRONTEND"; fi

  require_docker
  check_ports
  check_env_file

  # Only one frontend can hold the port, so retire the other mode's container
  # before claiming it.
  if [ -n "$(compose ps -aq "$other" 2>/dev/null)" ]; then
    info "Switching frontend mode — removing the previous one"
    compose rm -sf "$other" >/dev/null 2>&1 || true
  fi

  if [ "$mode" = "dev" ]; then
    step "Starting the app (database, backend, development frontend)"
  else
    step "Starting the app (database, backend, frontend)"
    info "Building the frontend — this is the slower start; browsing is quicker."
  fi
  # Explicit service list: the enabled 'dev' profile must not drag in the other
  # frontend.
  compose up -d --build $BASE_SERVICES "$frontend"
  wait_until_up
  wait_for_frontend
  print_ready "$mode"
}

cmd_stop() {
  require_docker
  step "Stopping the app"
  compose down
  ok "Stopped. Your data is kept — './start.sh' starts it again."
}

cmd_reset() {
  require_docker
  printf "${YELLOW}This erases the local database. Everything you created locally is lost.${RESET}\n"
  printf "Type 'yes' to continue: "
  read -r answer || answer=""
  [ "$answer" = "yes" ] || { info "Cancelled."; exit 0; }
  step "Erasing local data"
  compose down -v
  ok "Erased. Run './start.sh' to build a fresh database."
}

cmd_logs() {
  require_docker
  compose logs -f --tail 100 "$@"
}

cmd_status() {
  require_docker
  compose ps
  if [ -n "$(compose ps -q "$DEV_FRONTEND" 2>/dev/null)" ]; then
    info "Frontend mode: dev (live edits, slower pages)"
  elif [ -n "$(compose ps -q "$STATIC_FRONTEND" 2>/dev/null)" ]; then
    info "Frontend mode: built static files (quicker pages, rebuild to see changes)"
  fi
  if api_up; then ok "Backend is up on port $API_PORT — http://localhost:$FRONTEND_PORT"
  else info "Backend not answering on port $API_PORT yet (HTTP $(http_code "http://localhost:$API_PORT/health"))."; fi
}

cmd_seed() {
  require_docker
  command -v jq >/dev/null 2>&1 || fail "The seed script needs jq. On macOS: brew install jq"
  api_up || fail "The app isn't running (or is still starting). Run './start.sh' first, then try again."
  step "Loading demo data"
  BASE_URL="http://localhost:$API_PORT/api" bash tools/dev-seed/seed-dev-db.sh
  ok "Demo data loaded — a sample matter, costs enabled, and three users"
  cat <<SEEDED

Log in with any of these to see the sample matter:
  user.one@juralio.com        Password1Password1\$
  user.two@juralio.com        Password1Password1\$
  user.three@juralio.com      Password1Password1\$

The original logins still work:
  sysadmin@juralio.com        Password1Password1\$
  matter.creator@juralio.com  Password2Password2\$

SEEDED
}

case "${1:-up}" in
  ''|up|start)  cmd_up fast ;;
  dev)          cmd_up dev ;;
  stop|down)    cmd_stop ;;
  reset)        cmd_reset ;;
  logs)         shift; cmd_logs "$@" ;;
  status|ps)    cmd_status ;;
  seed)         cmd_seed ;;
  -h|--help|help)
    sed -n '3,31p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//' ;;
  *) fail "Unknown command '$1'. Try: ./start.sh --help" ;;
esac
