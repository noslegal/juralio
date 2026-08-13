# Juralio

Juralio is an open-source **matter management platform** for legal teams. It
organises work as **Matters**, each made up of **Projects** (workstreams) that
in turn contain hierarchical **Tasks**, giving teams a structured way to plan,
track and collaborate on legal work.

The stack is a **React** frontend (Redux, MUI, React Router) and a **Grails**
(Groovy) backend serving JSON, backed by **PostgreSQL**.

## Licence

Juralio is released under the **Apache License 2.0**. See:

- [LICENSE](LICENSE) — the full licence text
- [NOTICE](NOTICE) — attribution and third-party trademark notice
- [LICENSING.md](LICENSING.md) — third-party dependency licences and notes on
  the small number of weak-copyleft / dual-licensed components

You are free to use, modify and distribute this software under the terms of the
licence.

## Documentation

- [docs/RUNBOOK-LOCAL-SETUP.md](docs/RUNBOOK-LOCAL-SETUP.md) — getting a local
  environment running, both the containerised and native paths
- [docs/RUNBOOK-DEPLOYMENT.md](docs/RUNBOOK-DEPLOYMENT.md) — deployment
- [docs/ENVIRONMENT-VARIABLES.md](docs/ENVIRONMENT-VARIABLES.md) — configuration
- [docs/DATA-MODEL.md](docs/DATA-MODEL.md) — the domain model
- [DESIGN.md](DESIGN.md) — the visual design language: colour tokens, typography,
  spacing, motion and component vocabulary
- [CLAUDE.md](CLAUDE.md) - a file for Claude Code to read about Juralio  
- [server/README.md](server/README.md) — backend notes: database migrations,
  starting from an empty database, and running CodeNarc
- [SECURITY.md](SECURITY.md) — reporting a vulnerability, and the hardening
  checklist for anyone running Juralio

## Running it locally

Two ways, both documented in [docs/RUNBOOK-LOCAL-SETUP.md](docs/RUNBOOK-LOCAL-SETUP.md):

- **Just run the app** — install Docker Desktop, then `./start.sh`. No Java, Node or PostgreSQL needed; works on macOS, Windows and Linux. Add `dev` (`./start.sh dev`) if you want live code editing instead of the quicker prebuilt frontend. See §9 of the runbook.
- **Work on the code** — the native setup: `./setup.sh` (macOS) to install the toolchain, then run the backend from your IDE and `npm start` for the frontend. See §1–§8.

## Development

To clone the repository

```bash
git clone https://github.com/noslegal/juralio.git
```

To install all node dependencies run

```bash
cd juralio-mm
npm install
```

## First login

On a **brand-new database** the backend seeds two accounts so you can get in:

| Login | Password |
| --- | --- |
| `sysadmin@juralio.com` | `Password1Password1$` |
| `matter.creator@juralio.com` | `Password2Password2$` |

> ⚠️ **These are public, and they are created in every environment — not just locally.**
> The seeding runs on any database with no organisation in it, including a production
> one. If you deploy Juralio, change both passwords (and the sysadmin username) as your
> first action on a new instance, before it is reachable from the internet. See
> [BootstrapService.groovy](server/grails-app/services/com/juralio/bootstrap/BootstrapService.groovy).

To get past two bare logins to something worth clicking around in, run the seed script —
`bash tools/dev-seed/seed-dev-db.sh` — which adds example users, a sample matter with a
task tree, and enables costs. See §6 of the local-setup runbook.

## Tests

| Suite | Command |
| --- | --- |
| Frontend unit tests | `cd frontend && npm test` |
| Frontend lint | `cd frontend && npm run lint` (add `:fix` to autofix) |
| Backend static analysis | `cd server && ./gradlew check` |
| End-to-end, UI (interactive) | `cd e2e && npm run e2e:rapid-desktop` |
| End-to-end, API/security (interactive) | `cd e2e && npm run e2e:rapid-security` |
| End-to-end, headless | `cd e2e && ./test.sh dev localhost desktop` |

The e2e suites are [Cypress](https://www.cypress.io/) and need the app already running
(frontend on `:3000`, backend on `:8080`) — start it first with either of the routes
above. `./test.sh` waits on `/health` before it begins. Suites live under
[e2e/desktop/](e2e/desktop/), [e2e/security/](e2e/security/) and [e2e/mobile/](e2e/mobile/).

## Deployment

Juralio is packaged as a **single deployable artifact** — the Grails backend with the
compiled frontend bundled inside it. `npm run build` produces
`server/build/libs/juralio.war`, which runs on any **Tomcat 10.1+ / Java 17** host; a
container image ([server/Dockerfile](server/Dockerfile)) is the other supported route.
The only other requirements are a PostgreSQL database and an S3-compatible bucket.

See [docs/RUNBOOK-DEPLOYMENT.md](docs/RUNBOOK-DEPLOYMENT.md) for the full process and
[docs/ENVIRONMENT-VARIABLES.md](docs/ENVIRONMENT-VARIABLES.md) for configuration.
