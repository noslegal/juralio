#!/usr/bin/env bash
#
# seed-dev-db.sh — local dev seeding via the REST API (curl).
#
# Assumes the server is already running (e.g. via ./start.sh) with a fresh DB,
# so the default "Juralio" organisation, sysadmin@juralio.com and
# matter.creator@juralio.com already exist (created by BootstrapService).
#
# It then:
#   1. Enables costs at the INSTANCE level (and Microsoft SSO if ENABLE_SSO=1).
#   2. Enables costs on the default organisation (and Microsoft SSO if ENABLE_SSO=1).
#   3. Creates three regular (password) users (user.one, user.two, user.three)
#      with a known password, ROLE_USER + ROLE_MATTER_CREATOR + ROLE_ORG_ADMIN +
#      ROLE_KNOWLEDGE_MANAGER, in the default org.
#   4. Creates a matter with a basic task tree (3 phases, each with 2 subtasks,
#      each subtask with 1 child); all three users are matter admin + editor.
#   5. Creates a project template from that workstream, so the template carries
#      the same task tree as the seeded workstream.
#
# The matter + tasks are created as matter.creator@juralio.com (the matter
# owner) and the three users are added as matter admins so the matter appears
# in their lists.
#
# This is idempotent-friendly: re-running on an already-seeded DB will report
# things that already exist rather than hard-failing. Set SEED_MATTER=0 to skip
# the matter/task tree (which also skips the template, since it is built from
# the workstream) or SEED_TEMPLATE=0 to skip just the template. Microsoft SSO is
# OFF by default — set ENABLE_SSO=1 to turn it on (costs are always enabled).
#
# Requirements: curl, jq.
# Override the server with: BASE_URL=http://localhost:8080/api ./seed-dev-db.sh

set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:8080/api}"
SYSADMIN_USER="${SYSADMIN_USER:-sysadmin@juralio.com}"
SYSADMIN_PASS="${SYSADMIN_PASS:-Password1Password1\$}"
MATTER_CREATOR_USER="${MATTER_CREATOR_USER:-matter.creator@juralio.com}"
MATTER_CREATOR_PASS="${MATTER_CREATOR_PASS:-Password2Password2\$}"

DEFAULT_ORG_NAME="${DEFAULT_ORG_NAME:-Juralio}"

SEED_MATTER="${SEED_MATTER:-1}"
# The template is built from the seeded workstream, so it needs SEED_MATTER=1.
SEED_TEMPLATE="${SEED_TEMPLATE:-1}"
# Microsoft SSO is off by default; set ENABLE_SSO=1 to enable it (instance + org).
ENABLE_SSO="${ENABLE_SSO:-0}"
[ "$ENABLE_SSO" = "1" ] && SSO_FLAG="true" || SSO_FLAG="false"
MATTER_NAME="${MATTER_NAME:-Dev Seed Matter}"
MATTER_CLIENT="${MATTER_CLIENT:-Dev Seed Client}"
MATTER_REF="${MATTER_REF:-1234567890}"
PROJECT_NAME="${PROJECT_NAME:-Workstream 1}"
# Template names are capped at 70 characters by the backend.
TEMPLATE_NAME="${TEMPLATE_NAME:-Dev Seed Template}"

# Regular (password) users — all get EXTRA_USER_PASSWORD and are added to the
# default org, plus the seeded matter as matter admin + editor. Format "username:First:Last".
# NB: ROLE_SYSADMIN cannot be combined with org-scoped roles — the user-create
# endpoint forces sysadmins to exactly [USER, SYSADMIN] and bars org membership.
EXTRA_USER_PASSWORD="${EXTRA_USER_PASSWORD:-Password1Password1\$}"
EXTRA_USER_ROLES='["ROLE_USER","ROLE_MATTER_CREATOR","ROLE_ORG_ADMIN","ROLE_KNOWLEDGE_MANAGER"]'
EXTRA_USERS=(
  "user.one@juralio.com:User:One"
  "user.two@juralio.com:User:Two"
  "user.three@juralio.com:User:Three"
)

# Creating a template requires ROLE_KNOWLEDGE_MANAGER, which matter.creator does
# not have (it is bootstrapped with MATTER_CREATOR + USER only), so the template
# is created as the first EXTRA_USER — they hold KNOWLEDGE_MANAGER and are a
# matter admin by that point, which is also needed to read the source workstream.
TEMPLATE_OWNER="${TEMPLATE_OWNER:-${EXTRA_USERS[0]%%:*}}"
TEMPLATE_OWNER_PASS="${TEMPLATE_OWNER_PASS:-$EXTRA_USER_PASSWORD}"

log()  { printf '\033[1;34m[seed]\033[0m %s\n' "$*"; }
ok()   { printf '\033[1;32m[ ok ]\033[0m %s\n' "$*"; }
warn() { printf '\033[1;33m[warn]\033[0m %s\n' "$*"; }
die()  { printf '\033[1;31m[fail]\033[0m %s\n' "$*" >&2; exit 1; }

command -v jq >/dev/null   || die "jq is required but not installed"
command -v curl >/dev/null || die "curl is required but not installed"

# login USER PASS — authenticates and sets the global TOKEN.
TOKEN=""
login() {
  local user="$1" pass="$2" tmp status resp
  tmp="$(mktemp)"
  # Tolerate curl's own failure so an unreachable server produces a clear message
  # rather than set -e killing the script on a bare "curl: (7)". The status
  # distinguishes "nothing is listening" (000) from "server said no" (401 et al) —
  # an empty body alone means the latter, not that the app is down.
  status="$(curl -sS -o "$tmp" -w '%{http_code}' -X POST "${BASE_URL}/login" \
    -H 'Content-Type: application/json' \
    -d "{\"username\":\"${user}\",\"password\":\"${pass}\"}" 2>/dev/null)" || status="000"
  resp="$(cat "$tmp")"; rm -f "$tmp"
  [ "$status" != "000" ] \
    || die "Cannot reach ${BASE_URL} — is the app running? Try './start.sh status'."
  TOKEN="$(printf '%s' "$resp" | jq -r '.access_token // empty')"
  [ -n "$TOKEN" ] \
    || die "Login failed for ${user} (HTTP ${status}) — no access_token. Response: ${resp:-<empty>}"
}

# Nearly every auth_req call site captures the body with "$(...)", which runs the
# function in a subshell — so a plain global assignment inside it is discarded and
# the caller would read whatever the last *direct* call left behind. Persisting the
# status to a file is the only way it survives the subshell; st() reads it back.
STATUS_FILE="$(mktemp)"
trap 'rm -f "$STATUS_FILE"' EXIT
st() { cat "$STATUS_FILE" 2>/dev/null || printf '000'; }

# Authenticated request helper: auth_req METHOD PATH [JSON_BODY]
# Echoes the response body; records the status for st(). Uses the current TOKEN.
# A connection failure (server down) is recorded as 000 so callers' status checks
# fail loudly instead of reading a stale success.
auth_req() {
  local method="$1" path="$2" body="${3:-}"
  local tmp status rc
  tmp="$(mktemp)"
  if [ -n "$body" ]; then
    status="$(curl -sS -o "$tmp" -w '%{http_code}' -X "$method" "${BASE_URL}${path}" \
      -H "Authorization: Bearer ${TOKEN}" \
      -H 'Content-Type: application/json' \
      -d "$body" 2>/dev/null)" && rc=0 || rc=$?
  else
    status="$(curl -sS -o "$tmp" -w '%{http_code}' -X "$method" "${BASE_URL}${path}" \
      -H "Authorization: Bearer ${TOKEN}" 2>/dev/null)" && rc=0 || rc=$?
  fi
  case "$rc:$status" in
    0:[0-9][0-9][0-9]) ;;
    *) status="000" ;;
  esac
  printf '%s' "$status" > "$STATUS_FILE"
  cat "$tmp"
  rm -f "$tmp"
}

# create_task PROJECT_ID MATTER_ID NAME [PARENT_ID] — echoes the new task id.
create_task() {
  local project_id="$1" matter_id="$2" name="$3" parent_id="${4:-}"
  local body resp
  if [ -n "$parent_id" ]; then
    body="$(jq -n --arg n "$name" --argjson m "$matter_id" --argjson p "$project_id" --argjson ph "$parent_id" \
      '{matterId:$m, name:$n, project:$p, status:"not-started", isMilestone:false, phase:$ph}')"
  else
    body="$(jq -n --arg n "$name" --argjson m "$matter_id" --argjson p "$project_id" \
      '{matterId:$m, name:$n, project:$p, status:"not-started", isMilestone:false}')"
  fi
  resp="$(auth_req POST "/matter/${matter_id}/workstreams/${project_id}/tasks" "$body")"
  [ "$(st)" = "200" ] || [ "$(st)" = "201" ] \
    || die "Task '${name}' creation failed (HTTP $(st)): $resp"
  printf '%s' "$resp" | jq -r '.id'
}

# resolve_user_id USERNAME — echoes the user's id by looking them up in the
# default org's user list (needs sysadmin TOKEN + ORG_ID). Empty if not found.
resolve_user_id() {
  local username="$1" users
  users="$(auth_req GET "/organisations/${ORG_ID}/users")"
  [ "$(st)" = "200" ] || return 0
  printf '%s' "$users" | jq -r --arg u "$username" \
    '(.. | objects | select(.username? == $u) | .id) // empty' | head -1
}

# create_password_user USERNAME FIRST LAST — creates a regular (password) user,
# sets EXTRA_USER_PASSWORD via the temp password in the create response, and adds
# them to the default org. Echoes the new user id (status lines go to stderr so
# the id is the only stdout). Needs sysadmin TOKEN + ORG_ID.
create_password_user() {
  local username="$1" first="$2" last="$3" body resp uid temp pw_body create_status existing
  body="$(jq -n --arg u "$username" --arg f "$first" --arg l "$last" --argjson roles "$EXTRA_USER_ROLES" \
    '{username:$u, firstname:$f, lastname:$l, enabled:true, roles:$roles}')"
  resp="$(auth_req POST "/users" "$body")"
  create_status="$(st)"
  uid="$(printf '%s' "$resp" | jq -r '.id // empty')"
  if [ -z "$uid" ]; then
    # Only an already-present user is benign. Anything else is a real failure and
    # must say so — reporting "already exists" for a 403 hides a broken instance
    # (e.g. MAGIC_LINK_PASSPHRASE unset, which makes every create throw).
    existing="$(resolve_user_id "$username")"
    if [ -n "$existing" ]; then
      ok "User ${username} already exists (id ${existing})" >&2
    else
      warn "User ${username} NOT created (HTTP ${create_status}) and not found in org ${ORG_ID}." >&2
      warn "  Response: ${resp:-<empty>}" >&2
      [ "$create_status" = "403" ] && warn "  A 403 with an empty body usually means the server threw — check './start.sh logs server'." >&2
    fi
    printf '%s' "$existing"
    return 0
  fi
  ok "User created: ${username} (id ${uid})" >&2

  temp="$(printf '%s' "$resp" | jq -r '.temporaryPassword.password // empty')"
  if [ -n "$temp" ]; then
    pw_body="$(jq -n --arg np "$EXTRA_USER_PASSWORD" --arg op "$temp" --arg u "$username" \
      '{newPassword:$np, newPasswordRepeat:$np, oldPassword:$op, username:$u}')"
    auth_req POST "/settings/user/password" "$pw_body" >/dev/null
    [ "$(st)" = "200" ] && ok "Password set for ${username}" >&2 \
      || warn "Could not set password for ${username} (HTTP $(st))" >&2
  else
    warn "No temporaryPassword in create response for ${username}; password not set" >&2
  fi

  auth_req POST "/organisations/${ORG_ID}/users" "{\"username\":\"${username}\"}" >/dev/null
  case "$(st)" in
    200|201) ok "${username} added to organisation ${ORG_ID}" >&2 ;;
    *) warn "Org add for ${username} returned HTTP $(st)" >&2 ;;
  esac
  printf '%s' "$uid"
}

# ============================================================================
# 1. Authenticate as sysadmin
# ============================================================================
log "Logging in as ${SYSADMIN_USER} at ${BASE_URL}"
login "$SYSADMIN_USER" "$SYSADMIN_PASS"
ok "Authenticated as sysadmin"

# ============================================================================
# 2. Enable costs (and, if ENABLE_SSO=1, Microsoft SSO) at the instance level
# ============================================================================
log "Enabling costs at the instance level (Microsoft SSO: ${SSO_FLAG})"
auth_req PATCH "/admin/instance/settings" \
  "{\"microsoftSsoEnabled\":${SSO_FLAG},\"costsEnabled\":true}" >/dev/null
[ "$(st)" = "200" ] || die "Instance settings update failed (HTTP $(st))"
ok "Instance settings updated"

# ============================================================================
# 3. Discover the default organisation
# ============================================================================
log "Looking up the '${DEFAULT_ORG_NAME}' organisation"
ORGS="$(auth_req GET "/organisations")"
[ "$(st)" = "200" ] || die "Could not list organisations (HTTP $(st)): $ORGS"
ORG_ID="$(printf '%s' "$ORGS" | jq -r \
  --arg name "$DEFAULT_ORG_NAME" \
  '(map(select(.name == $name)) | .[0].id) // .[0].id // empty')"
[ -n "$ORG_ID" ] || die "No organisation found in response: $ORGS"
ok "Default organisation id = ${ORG_ID}"

# ============================================================================
# 4. Enable costs (and, if ENABLE_SSO=1, Microsoft SSO) on the default organisation
# ============================================================================
log "Enabling costs on organisation ${ORG_ID} (Microsoft SSO: ${SSO_FLAG})"
auth_req PATCH "/organisations/${ORG_ID}" \
  "{\"microsoftSsoEnabled\":${SSO_FLAG},\"costsEnabled\":true,\"mfaEnabled\":false,\"oktaSsoEnabled\":false,\"googleSsoEnabled\":false,\"samlSsoEnabled\":false}" >/dev/null
[ "$(st)" = "200" ] || die "Organisation settings update failed (HTTP $(st))"
ok "Organisation settings updated"

# ============================================================================
# 5. Create the regular (password) users, add them to the default org
# ============================================================================
EXTRA_DONE=()   # entries are "username:id" (id may be empty if unresolved)
for spec in "${EXTRA_USERS[@]}"; do
  IFS=':' read -r eu ef el <<< "$spec"
  log "Creating password user ${eu}"
  eid="$(create_password_user "$eu" "$ef" "$el")"
  EXTRA_DONE+=("${eu}:${eid}")
done

# ============================================================================
# 6. Create a matter with a basic task tree
#    (3 phases, each with 2 subtasks, each subtask with 1 child)
# ============================================================================
if [ "$SEED_MATTER" != "1" ]; then
  echo
  ok "Skipping matter/task tree (SEED_MATTER=$SEED_MATTER)."
else
  log "Creating matter '${MATTER_NAME}' as ${MATTER_CREATOR_USER}"
  login "$MATTER_CREATOR_USER" "$MATTER_CREATOR_PASS"

  MATTER_BODY="$(jq -n \
    --arg name "$MATTER_NAME" --arg client "$MATTER_CLIENT" --arg ref "$MATTER_REF" \
    '{clientName:$client, name:$name, isNeutralMatter:false, matterParties:{},
      userDefinedReferenceNumber:$ref, description:null}')"
  MATTER_RESP="$(auth_req POST "/matters" "$MATTER_BODY")"
  [ "$(st)" = "200" ] || [ "$(st)" = "201" ] \
    || die "Matter creation failed (HTTP $(st)): $MATTER_RESP"
  MATTER_ID="$(printf '%s' "$MATTER_RESP" | jq -r '.id')"
  ok "Matter created (id ${MATTER_ID})"

  log "Creating workstream '${PROJECT_NAME}'"
  PROJECT_RESP="$(auth_req POST "/matter/${MATTER_ID}/workstreams" \
    "$(jq -n --arg n "$PROJECT_NAME" --argjson m "$MATTER_ID" '{matterId:$m, name:$n}')")"
  [ "$(st)" = "200" ] || [ "$(st)" = "201" ] \
    || die "Workstream creation failed (HTTP $(st)): $PROJECT_RESP"
  PROJECT_ID="$(printf '%s' "$PROJECT_RESP" | jq -r '.id')"
  ok "Workstream created (id ${PROJECT_ID})"

  log "Building task tree: 3 phases x 2 subtasks x 1 child"
  task_count=0
  for p in 1 2 3; do
    PHASE_ID="$(create_task "$PROJECT_ID" "$MATTER_ID" "Phase ${p}")"
    task_count=$((task_count + 1))
    for s in 1 2; do
      SUB_ID="$(create_task "$PROJECT_ID" "$MATTER_ID" "Phase ${p} - Subtask ${s}" "$PHASE_ID")"
      task_count=$((task_count + 1))
      create_task "$PROJECT_ID" "$MATTER_ID" "Phase ${p} - Subtask ${s}.1" "$SUB_ID" >/dev/null
      task_count=$((task_count + 1))
    done
  done
  ok "Created ${task_count} tasks"

  # Add the users as matter admins + editors (team members).
  for entry in "${EXTRA_DONE[@]}"; do
    eu="${entry%:*}"; eid="${entry##*:}"
    if [ -n "$eid" ]; then
      EX_MEMBER_BODY="$(jq -n --argjson m "$MATTER_ID" --argjson u "$eid" '{matter:$m, user:$u}')"

      log "Adding ${eu} as matter admin"
      EXA_RESP="$(auth_req POST "/admin/matter/${MATTER_ID}/matters" "$EX_MEMBER_BODY")"
      case "$(st)" in
        200|201) ok "${eu} added as matter admin" ;;
        409|422|400) warn "Matter-admin add for ${eu} returned HTTP $(st) — likely already an admin." ;;
        *) warn "Could not add ${eu} as matter admin (HTTP $(st)): $EXA_RESP" ;;
      esac

      log "Adding ${eu} as editor (team member)"
      EX_RESP="$(auth_req POST "/admin/matter/${MATTER_ID}/teammembers" "$EX_MEMBER_BODY")"
      case "$(st)" in
        200|201) ok "${eu} added as editor" ;;
        409|422|400) warn "Editor add for ${eu} returned HTTP $(st) — likely already a member." ;;
        *) warn "Could not add ${eu} as editor (HTTP $(st)): $EX_RESP" ;;
      esac
    else
      warn "Skipping matter admin/editor for ${eu} — no user id resolved."
    fi
  done

  # ==========================================================================
  # 7. Create a project template from the seeded workstream
  #    The backend copies the workstream's task tree (names, levels, milestone
  #    and deliverable flags), so the template content matches the workstream.
  # ==========================================================================
  if [ "$SEED_TEMPLATE" != "1" ]; then
    echo
    ok "Skipping template (SEED_TEMPLATE=$SEED_TEMPLATE)."
  else
    echo
    log "Creating template '${TEMPLATE_NAME}' from workstream ${PROJECT_ID} as ${TEMPLATE_OWNER}"
    login "$TEMPLATE_OWNER" "$TEMPLATE_OWNER_PASS"
    TEMPLATE_RESP="$(auth_req POST "/projecttemplates" \
      "$(jq -n --arg n "$TEMPLATE_NAME" --argjson p "$PROJECT_ID" '{name:$n, projectId:$p}')")"
    case "$(st)" in
      200|201)
        TEMPLATE_ID="$(printf '%s' "$TEMPLATE_RESP" | jq -r '.id // empty')"
        ok "Template created (id ${TEMPLATE_ID}) with the same ${task_count} tasks as '${PROJECT_NAME}'"
        ;;
      *)
        TEMPLATE_ID=""
        warn "Template creation failed (HTTP $(st)): $TEMPLATE_RESP"
        ;;
    esac
  fi
fi

echo
ok "Dev DB seeding complete."
echo "    • Instance: costs enabled, Microsoft SSO ${SSO_FLAG}"
echo "    • Org ${ORG_ID} (${DEFAULT_ORG_NAME}): costs enabled, Microsoft SSO ${SSO_FLAG}"
for entry in "${EXTRA_DONE[@]}"; do
  echo "    • User: ${entry%:*} (password login, roles: ${EXTRA_USER_ROLES})"
done
if [ "$SEED_MATTER" = "1" ]; then
  echo "    • Matter '${MATTER_NAME}' (id ${MATTER_ID}) with 15 tasks; all users are matter admin + editor"
  if [ -n "${TEMPLATE_ID:-}" ]; then
    echo "    • Template '${TEMPLATE_NAME}' (id ${TEMPLATE_ID}), same task tree as '${PROJECT_NAME}', owned by ${TEMPLATE_OWNER}'s org"
  fi
fi
