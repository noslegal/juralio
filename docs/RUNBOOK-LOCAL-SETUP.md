# Runbook: Local Setup

How to go from a fresh machine (or a fresh clone) to a running Juralio app. Written to be picked up by anyone — no prior knowledge of the project assumed.

## What you're running

Juralio is a **web frontend** talking to a **backend API** backed by a **relational database**:

```
  Browser ──▶ Frontend (dev server, port 3000)
                  │  API calls
                  ▼
              Backend API (port 8080)
                  │
                  ▼
              PostgreSQL database (port 5432)
```

There are two ways to run it, and which one you want depends on what you're here for:

| | **Just run the app** (demos, QA, product, support) | **Work on the code** |
| --- | --- | --- |
| Install | Docker Desktop, nothing else | Homebrew, JDK 17, Node, PostgreSQL |
| Start | `./start.sh` | IDE / `./gradlew bootRun` + `npm start` |
| Platform | macOS, Windows, Linux | macOS (this runbook), Linux |
| Speed | slower to start, slower reload | fast reload, debugger attaches |
| Covered in | **§9 — Run the app via Docker (`./start.sh`)** | §1–§8 |

**If you only need a working app in a browser, skip to [§9 — Run the app via Docker (`./start.sh`)](#9-run-the-app-via-docker-startsh)** — one command, no toolchain. Everything before §9 is only needed if you are going to edit code.

### Everything here is typed into a terminal

Every grey box in this runbook is a **terminal command**. If you've not used a terminal before:

1. **Open one.** On macOS press <kbd>Cmd</kbd>+<kbd>Space</kbd>, type `Terminal`, press <kbd>Enter</kbd>. (In VS Code: **Terminal ▸ New Terminal**.) On Windows use **PowerShell** or **Windows Terminal**.
2. **Run a command.** Copy the line from this doc, paste it into the terminal window, press <kbd>Enter</kbd>. Run the lines one at a time, in order.
3. **Read the terminal.** It is where all progress, errors and the app's web address appear. When a step says "wait", it means watch the terminal until it stops printing new lines. Nothing pops up to tell you — **the terminal is the status display**.
4. **Some commands don't finish, and shouldn't.** The database, backend and frontend keep printing log lines and never return you to a prompt while they're running. That's success, not a hang. Leave that window open and open a **second** terminal window (<kbd>Cmd</kbd>+<kbd>N</kbd>) for the next command. Closing the window, or pressing <kbd>Ctrl</kbd>+<kbd>C</kbd> in it, stops the app.
5. **Start in the right folder.** Commands assume you are in the repo folder (`juralio-mm`) unless the command itself changes folder (`cd frontend`). `cd ~/path/to/juralio-mm` gets you back there; `pwd` prints where you are.

§1–§8 below are the native developer workflow: the backend runs directly from your IDE (or the command line) against a local PostgreSQL instance.

> **Fastest path (macOS): in a terminal, run `./setup.sh` from the repo root.** It installs the prerequisites (Homebrew, Node, JDK 17, PostgreSQL 14, jq), creates the `juralio` database, installs all dependencies, and optionally loads demo data — i.e. it automates §1–§3 and §6. Then start the app as in §4–§5 (or press <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> in VS Code and pick **Start the app**). The manual steps below stay the reference, and the path for non-macOS machines. `setup.sh` is safe to re-run.

### Current implementation

If you're new, this is what the generic pieces above actually are today. The steps below use these directly.

| Piece | Technology | Notes |
| --- | --- | --- |
| Frontend | React + Vite | Dev server on port **3000** |
| Backend | Grails **7.2.1** (Groovy 4) on the JVM | API on port **8080**, base path `/api`. Grails 7 = Spring Boot 3 / Jakarta EE, so **Java 17** and (in a container) **Tomcat 10.1+** |
| Database | PostgreSQL | Local instance on port **5432** |
| Package manager | npm (Node.js) | Frontend + tooling |
| Build tool (backend) | Gradle **8.14.4** (wrapper included) | `./gradlew` |

---

## 1. Prerequisites

Install these once per machine:

| Tool | Version | Why |
| --- | --- | --- |
| **Git** | any recent | Clone the repo |
| **JDK (Java)** | **17** (Amazon Corretto) | Compiles/runs the backend. Java 17 is the Grails 7 baseline and the build targets it (`compileJava.options.release = 17`) — **11 no longer works**. (`setup.sh` installs 17.) |
| **Node.js** | **20 LTS** (18+ required) | Frontend dev server + tooling. A version manager such as `nvm` is recommended. |
| **PostgreSQL** | 14+ | The local database, listening on `localhost:5432`. |
| **jq** + **curl** | any | Only for the optional data-seed script (§6). |
| An **IDE** | — | Optional but recommended for running/debugging the backend. Any JVM-capable IDE works. |
| **Container runtime** | — | Optional — only for the containerised workflow in §9. |

> **Tip:** with SDKMAN + nvm: `sdk install java 17.0.x-amzn` and `nvm install 20 && nvm use 20`.

> **Memory:** the backend build forks the Groovy compiler with a 4 GB heap and 1 GB metaspace (`org.gradle.jvmargs` in [server/gradle.properties](../server/gradle.properties), plus the `GroovyCompile` block in [server/build.gradle](../server/build.gradle)). Groovy 4 needs it — on a machine with little free RAM the compile dies with an OOM or metaspace error rather than a useful message.

---

## 2. Clone and install dependencies

In a terminal, one line at a time (each `npm install` prints a wall of progress and takes a few minutes — wait for the prompt to come back before running the next line):

```bash
git clone https://github.com/noslegal/juralio.git
cd juralio-mm

# Root install also pulls the e2e + backend tooling deps
npm install

# Frontend deps
cd frontend && npm install && cd ..
```

No extra frontend config is needed for a basic run. One optional file: `frontend/.env.local` holds the Google API credentials used by both the Google Drive file picker and the "Sign in with Google" button. It is **not** in the repository (it's gitignored) — if you want either feature, copy `frontend/.env.local.example` to `frontend/.env.local` and fill in credentials from your own [Google Cloud console](https://console.cloud.google.com/apis/credentials) project (an OAuth 2.0 client ID plus an API key with the Picker API enabled). Everything else works without it.

---

## 3. Set up the local database

The backend's local (development) profile expects a database named `juralio` owned by a role `juralio` (password `juralio`) on `localhost:5432`. See [server/grails-app/conf/application.yml](../server/grails-app/conf/application.yml) (the `development` datasource) and [server/database/init.sql](../server/database/init.sql).

Create the role and database once, in a terminal (on macOS, `setup.sh` does this for you). Paste the whole block — including the `SQL` lines — as one go:

```bash
psql -h localhost -p 5432 -U postgres <<'SQL'
CREATE USER juralio WITH LOGIN INHERIT CREATEDB CREATEROLE NOREPLICATION PASSWORD 'juralio';
CREATE DATABASE juralio OWNER juralio;
SQL
```

> On a fresh Homebrew PostgreSQL install there is no `postgres` superuser role — connect as your macOS user instead: drop `-U postgres` (i.e. `psql -h localhost -p 5432 -d postgres`).

> You do **not** create tables by hand. On boot the backend runs its database migrations and a bootstrap routine seeds a default organisation plus the built-in users.

---

## 4. Start the backend

The backend runs under its local (development) profile, pointing at `localhost:5432/juralio`.

**From your IDE:** import the `server/` directory as a Gradle project and run the app (the `bootRun` task, or the generated application entry point).

**From the command line (in a terminal):**

```bash
cd server
./gradlew bootRun
```

- **Watch the terminal.** The first run downloads dependencies and applies migrations — allow a few minutes. It prints a long stream of log lines; the backend is ready once the lines stop and you see a line saying the application has started (Grails prints `Grails application running at http://localhost:8080`).
- It will **not** return you to a prompt. That's correct — the backend runs in that terminal until you stop it. Leave the window open and open a new terminal for §5.
- The API listens on **http://localhost:8080** (base path `/api`).
- On a fresh database the bootstrap routine creates two logins:
  - `sysadmin@juralio.com` / `Password1Password1$`
  - `matter.creator@juralio.com` / `Password2Password2$`

> **Set `MAGIC_LINK_PASSPHRASE` before you create any user.** Creating a user always
> issues a welcome magic link, and `MagicLinkService` fails closed without the
> passphrase — so **every** `POST /api/users` throws and rolls back, including the seed
> script in §6. The symptom is a bare **403 with an empty body** (it looks like a
> permissions problem); the real cause is only in the backend terminal:
> `IllegalStateException: MAGIC_LINK_PASSPHRASE is not configured`.
>
> Any value works locally. Export it in the shell you run `./gradlew bootRun` from, or
> add it to your IDE run configuration's environment:
>
> ```bash
> export MAGIC_LINK_PASSPHRASE=local-dev-only-passphrase
> ```
>
> The Docker route (§9) needs no action — `docker-compose.local.yml` sets a default.

Verify it's up — in a **second** terminal window:

```bash
curl -sS -o /dev/null -w '%{http_code}\n' -X POST http://localhost:8080/api/login \
  -H 'Content-Type: application/json' \
  -d '{"username":"sysadmin@juralio.com","password":"Password1Password1$"}'
# expect: 200
```

---

## 5. Start the frontend

Leave the backend running and open a **separate terminal window** (<kbd>Cmd</kbd>+<kbd>N</kbd>), then:

```bash
cd frontend
npm start
```

- **Watch the terminal:** after a few seconds it prints the address the app is served on — **http://localhost:3000** — and usually opens your browser for you. If it doesn't, <kbd>Cmd</kbd>-click that address in the terminal, or paste it into a browser.
- This terminal also stays busy while the frontend runs, and reprints itself every time you save a file. Leave it open.
- API calls are routed to the backend on `:8080` automatically (dev app ports `3000/9090/3007` map to the backend on `8080` — see [api-helper.js](../frontend/src/services/helpers/api-helper.js)).
- Log in with one of the bootstrap users above — then see §6 for how to get users and a matter to work with.

That's a running local stack: **frontend :3000 → backend :8080 → database :5432**.

---

## 6. Getting users and data to work with

A brand-new database has **two logins and nothing else** — no matters, no other people. Pick one of these two routes:

**Option A — build it yourself.** Log in as `sysadmin@juralio.com` / `Password1Password1$` and create your own organisation, users and matters through the UI. Use this if you want to see the setup journey a real customer goes through, or you need a specific shape of data. Note that a user can only log in once they belong to an organisation, so add each new user to one.

**Option B — run the seed script and use the example data (quicker).** One terminal command gives you extra users, a sample matter with a task tree, and costs switched on. Use this if you just want something realistic to click around in.

### Option B: run the seed script

**Leave the backend running** (§4 — the seed talks to the running API), then in a **new terminal window** in the repo folder:

```bash
bash tools/dev-seed/seed-dev-db.sh   # requires jq + curl
```

Watch the terminal: it prints a line per thing it creates and finishes in a few seconds. It creates:

- **Three example users**, all added to the default organisation, all matter admin + editor on the sample matter:
  - `user.one@juralio.com` / `Password1Password1$`
  - `user.two@juralio.com` / `Password1Password1$`
  - `user.three@juralio.com` / `Password1Password1$`
- **A sample matter** with a 3×2×1 task tree (15 tasks) — log in as any of the three users above (or as sysadmin) to see it.
- **Costs** enabled at the instance and default-org level.

The original bootstrap logins still work alongside these:

- `sysadmin@juralio.com` / `Password1Password1$`
- `matter.creator@juralio.com` / `Password2Password2$`

Useful overrides:

| Variable | Default | Effect |
| --- | --- | --- |
| `SEED_MATTER=0` | `1` | Skip the sample matter/task tree. |
| `ENABLE_SSO=1` | `0` (off) | Also enable Microsoft SSO at instance + org level. Off by default. |
| `BASE_URL=…` | `http://localhost:8080/api` | Point at a different running API. |

---

## 7. Resetting the local database

When migrations conflict, data gets into a bad state, or a branch switch changes the schema, wipe and rebuild. In a terminal:

```bash
# 1. Stop the backend — press Ctrl+C in the terminal running it (frees port 8080)
# 2. Drop + recreate the schema
psql -h localhost -p 5432 -U juralio -d juralio -f server/database/clean_entire_schema.sql
# 3. Restart the backend — migrations + bootstrap rebuild the schema
```

(Set `PGPASSWORD=juralio` in front of the `psql` call if it prompts for a password.)

If you use [Claude Code](https://claude.com/claude-code), this repository also ships a `/reset-dev-db` slash command (`.claude/commands/reset-dev-db.md`) that automates the whole wipe → rebuild → seed → stop cycle. It is a convenience for that editor only — the `psql` steps above are the actual procedure.

> ⚠️ The clean script runs `DROP SCHEMA public CASCADE`. **Local-dev only** — never point it at a shared or remote database.

---

## 8. Everyday commands

| Task | Command |
| --- | --- |
| Everything in containers (no toolchain) | `./start.sh` — see §9, Run the app via Docker |
| Frontend + backend together (VS Code) | <kbd>Cmd</kbd>+<kbd>Shift</kbd>+<kbd>B</kbd> → **Start the app** (each in its own terminal panel) |
| Backend (dev) | `cd server && ./gradlew bootRun` |
| Frontend (dev) | `cd frontend && npm start` |
| Frontend over HTTPS | `cd frontend && npm run start-https` — expects `frontend/certs/localhost.pem` + `localhost-key.pem` (gitignored; generate with [mkcert](https://github.com/FiloSottile/mkcert): `mkcert -install && mkcert -cert-file certs/localhost.pem -key-file certs/localhost-key.pem localhost`). Only needed for SSO redirect flows that require an HTTPS origin. |
| Frontend unit tests | `cd frontend && npm test` |
| Frontend lint | `cd frontend && npm run lint` (add `:fix` to autofix) |
| Backend static analysis | `cd server && ./gradlew check` |
| New DB migration | `cd server && ./create-migration.sh add_my_table` |
| End-to-end tests (UI) | `cd e2e && npm run e2e:rapid-desktop` (or `./test.sh dev localhost desktop`) |
| End-to-end tests (API) | `cd e2e && npm run e2e:rapid-security` (or `./test.sh dev localhost security`) |
| Stop the backend build daemon | `cd server && ./gradlew --stop` |

---

## 9. Run the app via Docker (`./start.sh`)

**This is the quick setup — start here if you just want to use the app.** One command, no toolchain: nothing from §1–§8 is needed — no Java, no Node, no PostgreSQL, no `juralio` database role. Works on macOS, Windows and Linux.

### Setup the app, once

1. Install [Docker Desktop](https://www.docker.com/products/docker-desktop) and start it. Wait for its icon to stop animating.
2. **Check it has at least 8 GB of memory**, and raise it if not: Docker Desktop ▸ **Settings** ▸ **VM Resources** (called **Resources** in older versions). The backend compile needs it — with less it dies with an out-of-memory error rather than a useful message.
3. **Get a copy of the code.** Either route is fine:
   - **Download it.** Go to [github.com/noslegal/juralio](https://github.com/noslegal/juralio), click the green **Code** button ▸ **Download ZIP**, then unzip it.
   - **Or clone it,** if you have Git: `git clone https://github.com/noslegal/juralio.git`
4. **Open a terminal in that folder.** On macOS, either:
   - right-click the folder ▸ **New Terminal at Folder** — if that entry isn't there, switch it on in System Settings ▸ Keyboard ▸ Keyboard Shortcuts ▸ Services ▸ Files and Folders; or
   - <kbd>Cmd</kbd>+<kbd>Space</kbd> → `Terminal` → <kbd>Enter</kbd>, then `cd ~/path/to/juralio-mm`.

   Every command below is typed there — see [Everything here is typed into a terminal](#everything-here-is-typed-into-a-terminal) above if that's new to you.
5. **Type or paste `./start.sh`** and press <kbd>Enter</kbd>. The first run takes some minutes — see [Watch the terminal, then open the app](#watch-the-terminal-then-open-the-app) below for what to expect.

### Running the app

Type these in the terminal, from the repo folder:

```bash
./start.sh          # start everything
./start.sh dev      # start with live code editing (see below)
./start.sh stop     # stop it — your data is kept
./start.sh logs     # watch what it's doing
./start.sh reset    # erase the database and start fresh
./start.sh status   # is it up? which frontend mode?
./start.sh seed     # add demo users and a sample matter (asks first)
```

### Two frontend modes

The trade-off is start-up time against how the app feels once it's open. Switch freely — the database and backend containers are shared, so changing mode doesn't rebuild the backend or touch your data.

| | `./start.sh` (default) | `./start.sh dev` |
| --- | --- | --- |
| Frontend | Built once, served as static files by nginx | Vite dev server over your working copy |
| Start-up | Slower — it builds the app first (measured 56s for the build; skipped entirely when no frontend file has changed since the last build) | Faster — the dev server starts in a second or two |
| Using the app | Quicker than a native dev server: no file mount, no on-demand compiling | Noticeably slower pages |
| Code changes | Need `./start.sh` again to rebuild | Frontend edits appear as you save; backend changes still need a restart |
| Use it for | Demos, QA, support, anyone not editing code | Working on frontend code inside the container |

Why the dev server is slower in a container: your source files reach it through a bind mount, and on macOS and Windows containers run in a VM, so every file read crosses that boundary. Measured on an M-series Mac, reading the 1,779 frontend source files took **0.28s natively and 0.99s through the mount (3.5×)**, and Vite serving cold modules was **2.6× slower** than the same Vite running natively. The default mode sidesteps it entirely by building ahead of time.

> Developers editing frontend code all day should still prefer the **native** setup (§1–§8): hot reload is instant and the debugger attaches.

### Watch the terminal, then open the app

The first `./start.sh` downloads the images, builds the frontend and compiles the backend: **around 5 minutes** on a fast laptop, longer on a slow one or a slow connection. **All of the progress appears in the terminal** — nothing opens on its own, and it won't exit silently. Later starts take **under a minute** (measured: 28s), because the compiled backend output, the Gradle dependency cache and the built frontend image all survive restarts.

The script itself never asks you anything, but your operating system might while it runs — macOS and Windows may ask you to allow Docker to accept incoming network connections or to reach files in your folder, and Docker Desktop may offer to update itself or to download the images it needs. Accept these; the start-up waits on them.

When it's finished, the terminal prints `The app is running 🎉` followed by the web address and the logins:

```
  Open in your browser:  http://localhost:3000
```

**Open the app in your browser** by <kbd>Cmd</kbd>-clicking (macOS) or <kbd>Ctrl</kbd>-clicking (Windows/Linux) that `http://localhost:3000` link in the terminal, or by copying it into your browser's address bar. Then log in with either of the two logins the terminal lists:

| Login | Password | What it is |
| --- | --- | --- |
| `sysadmin@juralio.com` | `Password1Password1$` | **Administration only** — manages organisations, users and settings. It can't work on matters itself. |
| `matter.creator@juralio.com` | `Password2Password2$` | **A normal user** — this is the one to explore the app with. |

> **Change both passwords in the app once you're logged in.** They're published in this runbook and printed by the script, so they're public knowledge — fine on a laptop that nothing else can reach, not fine on anything shared or reachable from another machine.

Unlike the native setup, `./start.sh` returns you to a prompt when it's done, so **you can close the terminal** — the app keeps running in the background until you run `./start.sh stop`.

### Getting users and data to work with

A fresh database has only the two logins above — no matters, no other people. Two routes:

**Option A — build it yourself.** Log in as `sysadmin@juralio.com` / `Password1Password1$` and create your own organisation, users and matters through the UI. Best if you want to walk the real customer setup journey. (A user can only log in once they belong to an organisation, so add each one to one.)

**Option B — use the example data (quicker).** In the terminal:

```bash
./start.sh seed     # asks you to confirm first
```

Watch the terminal; after a few seconds you get a sample matter with a task tree (15 tasks), costs switched on, and three example users:

- `user.one@juralio.com` / `Password1Password1$`
- `user.two@juralio.com` / `Password1Password1$`
- `user.three@juralio.com` / `Password1Password1$`

All three are on the sample matter as matter admin + editor, so log in as any of them (or as sysadmin) to see it. The two original logins keep working.

### Looking inside the database in a browser (optional)

`./start.sh` also runs **Adminer**, a web database browser, at **http://localhost:8083**. You never need it to use the app — it's for inspecting data directly.

Its login form defaults to MySQL, so you must change the first field or it won't connect:

| Field | Value |
| --- | --- |
| **System** | **PostgreSQL** — change it from the default `MySQL` |
| **Server** | `db` (the database's name inside Docker — **not** `localhost`) |
| **Username** | `juralio` |
| **Password** | `juralio` |
| **Database** | `juralio` |

If you'd rather use a desktop database tool (DBeaver, TablePlus, `psql`), connect to `localhost` port **5433** with the same user/password/database.

### What it starts

| Service | Where | Notes |
| --- | --- | --- |
| Frontend | http://localhost:3000 | Static build, or the Vite dev server in `dev` mode — see above |
| Backend API | http://localhost:8080 | Source is mounted, but nothing recompiles while it runs: a code change needs `./start.sh stop && ./start.sh` |
| PostgreSQL | `localhost:**5433**` | Deliberately **not** 5432, so it can't collide with a native Postgres |
| Adminer (database browser) | http://localhost:8083 | Set **System** to **PostgreSQL**, server `db`, user `juralio` / password `juralio` / database `juralio` — see above |

Defined in [docker-compose.local.yml](../docker-compose.local.yml). The backend uses the `devlocal` stage of [server/Dockerfile](../server/Dockerfile), which — unlike the e2e and production stages — compiles nothing at image-build time: the sources are mounted and built on first boot, so backend changes never rebuild an image. The frontend is [frontend/Dockerfile.static](../frontend/Dockerfile.static) by default (built into the image, so frontend changes do mean a rebuild) or [frontend/Dockerfile.dev](../frontend/Dockerfile.dev) in `dev` mode (mounted, no rebuild).

Ports can be moved if something on your machine already holds them:

```bash
JURALIO_FRONTEND_PORT=9090 ./start.sh    # also JURALIO_API_PORT / JURALIO_DB_PORT / JURALIO_ADMINER_PORT
```

> The frontend port must be **3000, 9090 or 3007**. The app only knows to call the backend on `:8080` when it is served from one of those ports ([api-helper.js](../frontend/src/services/helpers/api-helper.js)) — on any other port every API call fails. `start.sh` refuses rather than letting you find out the hard way.

---

## Troubleshooting

| Symptom | Likely cause / fix |
| --- | --- |
| Backend fails to connect to the DB | Database not running, or the `juralio` role/db not created — see §3. |
| Port 8080 already in use | Another backend (native or containerised) is running: `lsof -ti tcp:8080 \| xargs kill`. |
| Frontend loads but all API calls fail | Backend not running on :8080, or you're on a non-dev port (dev ports are 3000/9090/3007). |
| Login returns 401 for a seeded user | A user can only log in once they belong to an organisation — the seed script handles this; re-run it. |
| Migration/schema errors after a branch switch | Reset the DB — see §7. |
| Compile errors on the backend | Wrong JDK — confirm `java -version` is **17**. Java 11 cannot build Grails 7. |
| Backend starts but uses an in-memory database (no data, migrations "already applied") | An **empty** `-Dspring.profiles.active=` was passed. Grails 7's YAML document matcher rejects *every* document in `application.yml` when the property is set but blank, so the app boots with no config and GORM falls back to in-memory H2. `bootRun` in [server/build.gradle](../server/build.gradle) only forwards the property when it is non-empty; if you invoke the JVM yourself, omit the flag entirely rather than passing it empty. |
| Backend compile fails after deleting a Groovy class | `compileGroovy` passes but boot fails: the config scripts are compiled at runtime, so `spring/resources.groovy`, `Bootstrap`, `UrlMappings` and `.gson` views can still reference the deleted class. Grep `grails-app/conf` and `grails-app/views` before deleting. |

### Containers (§9)

| Symptom | Likely cause / fix |
| --- | --- |
| `Docker isn't running` | Start Docker Desktop and wait for its icon to stop animating, then re-run `./start.sh`. |
| `Ports unavailable` | Something else holds a port — often your own native backend/frontend. Stop it, or move ours: `JURALIO_FRONTEND_PORT=9090 ./start.sh`. |
| Backend container dies during the first compile | Docker Desktop has too little memory. The Groovy compiler forks with a 4 GB heap; give Docker at least 8 GB (Settings ▸ VM Resources). |
| Frontend loads but every API call fails | The frontend is published on a port other than 3000/9090/3007, so the app calls its own origin instead of the backend. `start.sh` blocks this — you'll only see it if you run `docker compose` by hand. |
| Frontend edits don't appear | In the default mode they never will — it serves a build. Either re-run `./start.sh` or switch to `./start.sh dev`. |
| Frontend edits don't hot-reload in `dev` mode | The bind mount isn't delivering file events (older Docker file sharing, Windows/WSL2). Uncomment `VITE_USE_POLLING` in [docker-compose.local.yml](../docker-compose.local.yml). |
| Backend code changes have no effect | Nothing recompiles while the container runs. `./start.sh stop && ./start.sh`. |
| `relation "…" does not exist` in the log during the first boot | A request arrived while migrations were still running. Harmless; it resolves once boot finishes. |
| Adminer won't connect (`Unknown server` / driver error) | **System** is still `MySQL`, or **Server** says `localhost`. Set System to **PostgreSQL** and Server to `db` — see the Adminer table in §9. |
| Nothing seems to happen after `./start.sh` | It's working — all output goes to the terminal you ran it in. Watch that window; the app only announces itself there, with `The app is running 🎉` and the `http://localhost:3000` link. |
