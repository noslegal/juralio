#!/usr/bin/env bash
#
# setup.sh — one-shot developer setup for the Juralio app (macOS).
#
# This installs *everything* needed to run the app locally, even if you have
# never written a line of code. Just open the Terminal app, drag this file
# into the window, and press Enter (or run `./setup.sh` from this folder).
#
# It is safe to run more than once — it skips anything that is already done.
#
# What it installs / sets up:
#   • Homebrew            (the macOS software installer)
#   • Node.js + npm       (runs the frontend)
#   • Java 17 (OpenJDK)   (runs the backend)
#   • PostgreSQL 14       (the database)
#   • jq                  (small helper used by our scripts)
#   • The `juralio` database + login the app expects
#   • All the app's own dependencies (npm install)
#
# It does NOT start the app — see the "You're done!" message at the end for how.

set -euo pipefail

# ── Pretty output helpers ───────────────────────────────────────────────────
BOLD=$'\033[1m'; GREEN=$'\033[32m'; YELLOW=$'\033[33m'; RED=$'\033[31m'; RESET=$'\033[0m'
step()  { printf "\n${BOLD}▶ %s${RESET}\n" "$1"; }
ok()    { printf "  ${GREEN}✓ %s${RESET}\n" "$1"; }
info()  { printf "  ${YELLOW}• %s${RESET}\n" "$1"; }
fail()  { printf "\n${RED}✗ %s${RESET}\n" "$1" >&2; exit 1; }

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$REPO_DIR"

printf "${BOLD}Juralio local setup${RESET}\n"
printf "This will take 10–20 minutes the first time. You may be asked for your\n"
printf "Mac password (for installing software) — that is normal and expected.\n"

# ── 0. Sanity checks ────────────────────────────────────────────────────────
[ "$(uname -s)" = "Darwin" ] || fail "This script is for macOS only."

# ── 1. Apple command line tools (needed for git and Homebrew) ───────────────
step "Checking Apple developer tools"
if ! xcode-select -p >/dev/null 2>&1; then
  info "Opening the Apple installer — click 'Install' and wait for it to finish,"
  info "then run this script again."
  xcode-select --install || true
  fail "Waiting on Apple command line tools. Re-run ./setup.sh once they finish installing."
fi
ok "Apple developer tools present"

# ── 2. Homebrew ─────────────────────────────────────────────────────────────
step "Checking Homebrew (software installer)"
if ! command -v brew >/dev/null 2>&1; then
  info "Installing Homebrew…"
  /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi
# Make sure brew is on PATH for this session (Apple Silicon vs Intel).
if [ -x /opt/homebrew/bin/brew ]; then eval "$(/opt/homebrew/bin/brew shellenv)"
elif [ -x /usr/local/bin/brew ]; then eval "$(/usr/local/bin/brew shellenv)"
fi
command -v brew >/dev/null 2>&1 || fail "Homebrew did not install correctly."
ok "Homebrew ready"

# ── 3. Install the tools ────────────────────────────────────────────────────
step "Installing tools (Node, Java 17, PostgreSQL 14, jq)"
brew_install() {
  if brew list --versions "$1" >/dev/null 2>&1; then ok "$1 already installed"
  else info "Installing $1…"; brew install "$1"; ok "$1 installed"; fi
}
brew_install node
brew_install openjdk@17
brew_install postgresql@14
brew_install jq

# ── 4. Wire Java + Postgres into your shell so they're always found ─────────
step "Configuring your shell"
# macOS default shell is zsh.
PROFILE="$HOME/.zshrc"
[ -n "${ZSH_VERSION:-}" ] || [ "$(basename "${SHELL:-}")" = "zsh" ] || PROFILE="$HOME/.bash_profile"
touch "$PROFILE"

add_line() {  # add_line <marker> <line>
  if ! grep -qF "$1" "$PROFILE"; then printf '\n%s\n' "$2" >>"$PROFILE"; info "added to $PROFILE"; fi
}
JAVA_HOME_PATH="$(brew --prefix openjdk@17)/libexec/openjdk.jdk/Contents/Home"
PG_BIN="$(brew --prefix postgresql@14)/bin"
add_line 'JAVA_HOME=.*openjdk@17' "export JAVA_HOME=\"$JAVA_HOME_PATH\""
add_line 'postgresql@14/bin'      "export PATH=\"$PG_BIN:\$PATH\""
# Also export for the rest of THIS script run.
export JAVA_HOME="$JAVA_HOME_PATH"
export PATH="$PG_BIN:$PATH"
ok "Java 17 + PostgreSQL on your PATH"

# ── 5. Start PostgreSQL and create the app database ─────────────────────────
step "Setting up the database"
brew services start postgresql@14 >/dev/null 2>&1 || true
# Wait for the server to accept connections.
for i in $(seq 1 30); do
  if pg_isready -q 2>/dev/null; then break; fi
  [ "$i" -eq 30 ] && fail "PostgreSQL did not start. Try: brew services restart postgresql@14"
  sleep 1
done
ok "PostgreSQL is running"

# Create the login role and database the app expects (juralio / juralio).
# All psql calls use -w (never prompt for a password) so the script can't hang
# on a machine whose Postgres is configured for password auth.
DB_OK=""

# Case 1: the app database is already there and reachable — nothing to do.
if PGPASSWORD=juralio psql -w -h localhost -U juralio -d juralio -tAc "SELECT 1" >/dev/null 2>&1; then
  ok "database 'juralio' is already set up"
  DB_OK="yes"
# Case 2: we can connect as a local superuser (the default on a fresh install,
# where local connections use 'trust' auth) — create the role and database.
elif psql -w -d postgres -tAc "SELECT 1" >/dev/null 2>&1; then
  if ! psql -w -d postgres -tAc "SELECT 1 FROM pg_roles WHERE rolname='juralio'" | grep -q 1; then
    psql -w -d postgres -c "CREATE USER juralio WITH LOGIN INHERIT CREATEDB CREATEROLE NOREPLICATION PASSWORD 'juralio';" >/dev/null
    ok "created database login 'juralio'"
  else ok "database login 'juralio' already exists"; fi
  if ! psql -w -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='juralio'" | grep -q 1; then
    psql -w -d postgres -c "CREATE DATABASE juralio OWNER juralio;" >/dev/null
    ok "created database 'juralio'"
  else ok "database 'juralio' already exists"; fi
  DB_OK="yes"
# Case 3: Postgres is running but wants a password we don't have. Don't hang —
# explain how to finish this one step by hand, and carry on with the rest.
else
  info "${YELLOW}Couldn't set up the database automatically.${RESET}"
  info "Your PostgreSQL needs a password to make changes. Run these two lines by"
  info "hand (you may be asked for your Mac/Postgres password), then re-run setup:"
  printf "      psql -d postgres -c \"CREATE USER juralio WITH LOGIN CREATEDB CREATEROLE PASSWORD 'juralio';\"\n"
  printf "      psql -d postgres -c \"CREATE DATABASE juralio OWNER juralio;\"\n"
fi

# ── 6. Install the app's own dependencies ───────────────────────────────────
step "Installing app dependencies (this is the slow part)"
info "Installing root + server + e2e packages…"
npm install
info "Installing frontend packages…"
( cd frontend && npm install )
ok "All dependencies installed"

# ── 7. Optional: load demo data (a ready-to-use login + sample matter) ──────
step "Demo data (optional)"
SEED_SCRIPT="$REPO_DIR/tools/dev-seed/seed-dev-db.sh"
API_URL="http://localhost:8080/api"

if [ "${DB_OK:-}" != "yes" ]; then
  info "Skipping demo data — the database isn't set up yet (see the message above)."
elif [ ! -f "$SEED_SCRIPT" ]; then
  info "Seed script not found — skipping. (You can seed later once it exists.)"
else
  printf "  Would you like to load demo data so you can log in straight away?\n"
  printf "  This creates a sample login and a demo matter with tasks.\n"
  printf "  (The script will briefly start the backend itself, load the data, then stop it.)\n"
  printf "  Load demo data now? [y/N] "
  read -r WANT_SEED || WANT_SEED=""

  if [[ "$WANT_SEED" =~ ^[Yy] ]]; then
    info "Starting the backend just long enough to load the data…"
    info "(The first start-up compiles the app and can take a few minutes — please be patient.)"

    # Start the backend in the background, logging to a temp file.
    BOOT_LOG="$(mktemp -t juralio-boot.XXXXXX)"
    ( cd "$REPO_DIR/server" && ./gradlew bootRun >"$BOOT_LOG" 2>&1 ) &
    BOOT_PID=$!
    # Make sure we always stop it, whatever happens next.
    stop_backend() {
      info "Stopping the temporary backend…"
      # Kill the gradlew launcher and its direct children…
      kill "$BOOT_PID" 2>/dev/null || true
      pkill -P "$BOOT_PID" 2>/dev/null || true
      # …but bootRun forks the app into a separate JVM, so also free port 8080.
      local pids; pids="$(lsof -ti tcp:8080 2>/dev/null || true)"
      [ -n "$pids" ] && kill $pids 2>/dev/null || true
      sleep 2
      pids="$(lsof -ti tcp:8080 2>/dev/null || true)"
      [ -n "$pids" ] && kill -9 $pids 2>/dev/null || true
      wait "$BOOT_PID" 2>/dev/null || true
    }
    trap stop_backend EXIT

    # Poll until the server answers (curl returns 000 only when nothing is listening).
    SEEDED=""; CODE="000"
    for i in $(seq 1 180); do  # up to ~15 min for a cold first boot
      if ! kill -0 "$BOOT_PID" 2>/dev/null; then
        info "The backend stopped unexpectedly. Last few log lines:"; tail -n 15 "$BOOT_LOG" || true; break
      fi
      # curl writes "000" itself when nothing answers, so the fallback has to be
      # an assignment: `curl … || echo 000` prints "000000", which is not equal
      # to "000" and would read as "the backend is up".
      CODE="$(curl -s -o /dev/null -w '%{http_code}' --max-time 3 -X POST "$API_URL/login" \
                -H 'Content-Type: application/json' -d '{}' 2>/dev/null)" || CODE=""
      case "${CODE:-000}" in
        [1-5][0-9][0-9]) ok "Backend is up (responded HTTP $CODE)"; break ;;
        *) CODE="000" ;;
      esac
      printf "  …still starting (%ss)\r" "$((i*5))"
      sleep 5
    done

    if [ "$CODE" = "000" ]; then
      info "Couldn't reach the backend to seed. No problem — you can seed later with:"
      info "  (start the app, then run)  ./tools/dev-seed/seed-dev-db.sh"
    else
      info "Loading demo data…"
      if bash "$SEED_SCRIPT"; then SEEDED="yes"; ok "Demo data loaded"; else
        info "Seeding hit a snag (it's safe to re-run ./tools/dev-seed/seed-dev-db.sh later)."; fi
    fi

    stop_backend
    trap - EXIT
    rm -f "$BOOT_LOG"
  else
    info "Skipping demo data. You can load it anytime with:"
    info "  ./tools/dev-seed/seed-dev-db.sh   (while the backend is running)"
  fi
fi

# ── 8. Done ─────────────────────────────────────────────────────────────────
printf "\n${GREEN}${BOLD}You're done! 🎉${RESET}\n\n"
cat <<'NEXT'
To run the app:

  In VS Code:
    Press  Cmd+Shift+B   (or: menu ▸ Terminal ▸ Run Build Task)
    and choose  "Start the app".

  Or in two Terminal windows:
    1)  cd frontend && npm start          (the website)
    2)  cd server   && ./gradlew bootRun  (the backend)

The backend takes a minute or two to start the first time. Once both are up,
open your browser to the address the frontend prints (usually http://localhost:3000).

Tip: if a new Terminal ever says "command not found", just close and reopen it.
NEXT

if [ "${SEEDED:-}" = "yes" ]; then
cat <<'LOGIN'

Demo logins you can use (password for all: Password1Password1$):
    user.one@juralio.com
    user.two@juralio.com
    user.three@juralio.com
LOGIN
fi
