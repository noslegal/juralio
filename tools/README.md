# Tools

Assorted developer tooling. None of it is needed to build or run Juralio.

| Tool | What it does |
| --- | --- |
| [api-documentation/](api-documentation/) | Generates an HTML page listing every endpoint and the request methods it accepts. Descriptions for new endpoints are written by hand, so re-running it needs a pass to fill those in. |
| [dependency-updates/](dependency-updates/) | Scans the repo's `package.json` files for available updates. Run weekly by [.github/workflows/weekly-dependency-updates.yml](../.github/workflows/weekly-dependency-updates.yml); can post results to Slack if `SLACK_WEBHOOK_URL` is set. |
| [dev-seed/](dev-seed/) | `seed-dev-db.sh` — populates a running local instance with example users, a sample matter and a task tree. See §6 of [docs/RUNBOOK-LOCAL-SETUP.md](../docs/RUNBOOK-LOCAL-SETUP.md). |
| [juralio-component-tool/](juralio-component-tool/) | Scaffolds a new frontend component from a template. Requires a global install. |
| [license-inventory-tool/](license-inventory-tool/) | Walks the installed npm packages and emits the declared licence for each — the source of the frontend tables in [LICENSING.md](../LICENSING.md). |

## `server/tools/deploy`

Deployment helpers left over from Juralio's own CircleCI pipeline and AWS account, neither
of which is part of this repository. All three scripts — `deploy.js`, `deploy-cci.js` and
`upload-notices.js` — **fail standalone**. See the CI/CD section of
[docs/RUNBOOK-DEPLOYMENT.md](../docs/RUNBOOK-DEPLOYMENT.md) for what they do and what to
use instead.
