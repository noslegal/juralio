# Runbook: Deployment

How to get Juralio from source code to a running deployed instance.

Juralio has a deliberately small deployment contract. There is **one artifact** — a WAR
containing the backend with the compiled frontend bundled inside it — and it needs three
things around it: a Java servlet container, a PostgreSQL database, and an S3-compatible
bucket for file uploads. Anything that can run a WAR will do.

```
   npm run build
        │  builds the frontend, folds it into the backend, produces the WAR
        ▼
  server/build/libs/juralio.war
        │
        ▼
   Tomcat 10.1+ / Java 17   ◀── environment variables (DB, bucket, region, …)
      │           │
      ▼           ▼
  PostgreSQL   S3 bucket
```

**The hard requirements, in full:**

| Requirement | Detail |
| --- | --- |
| Servlet container | **Tomcat 10.1 or newer**, on **Java 17** |
| Database | PostgreSQL — developed and tested against **14** |
| Object storage | An S3-compatible bucket |
| Configuration | The environment variables in [§4](#4-configuration) |

> ### ⚠️ Tomcat 10.1 / Java 17 is not negotiable
>
> Grails 7 is Spring Boot 3, which is **Jakarta Servlet 6**. The WAR will fail at
> application start on Tomcat 9 or Java 11 with a `javax.servlet` vs `jakarta.servlet`
> error. If you are adapting an older deployment, this is the first thing to change.
> The container image already targets the right generation
> (`tomcat:10.1-jdk17-temurin` in [server/Dockerfile](../server/Dockerfile)).

---

## 1. Before you deploy anything: change the seeded credentials

On a database with **no organisation in it**, the backend seeds two accounts at startup
([BootstrapService.groovy](../server/grails-app/services/com/juralio/bootstrap/BootstrapService.groovy)):

| Login | Password | Role |
| --- | --- | --- |
| `sysadmin@juralio.com` | `Password1Password1$` | System administrator |
| `matter.creator@juralio.com` | `Password2Password2$` | Matter creator |

**This runs in every environment, production included** — it is gated on the database
being empty, not on the environment being development. These credentials are published in
this repository, so a fresh instance that is reachable from the internet has a known
superuser login until you change it.

Change both passwords (and ideally the sysadmin username) **before the instance is
publicly reachable**. Either bring the instance up on a private network, log in and change
them through the UI, or seed your own administrator and remove these two.

---

## 2. Build the artifact

There are two routes. Both produce the same **`server/build/libs/juralio.war`**.

### Option A — `npm run build` (requires Docker)

> ⚠️ **This route needs a running Docker daemon.** Despite appearances it does not build
> anything with your local toolchain: [produce_war.js](../produce_war.js) shells out to
> `frontend/docker-run.sh` and `server/docker-run.sh`, which run `docker build` /
> `docker run` / `docker cp`. Without Docker it fails partway through, after `npm install`
> has already run. If you do not have Docker, use Option B.

From the repo root:

```bash
npm install     # once
npm run build
```

What it does (see [produce_war.js](../produce_war.js)):

1. Builds the frontend inside a container and copies the output back out.
2. Copies the frontend build output into the backend's web-app directory.
3. Builds the backend artifact in a container and copies the WAR back out.

Note that `server/docker-run.sh build` also builds a local PostgreSQL image (`local/db`)
as a side effect; it is used by the containerised test targets, not by the WAR.

### Option B — toolchain only (no Docker)

Requires Node 20 and JDK 17, as per [RUNBOOK-LOCAL-SETUP.md](RUNBOOK-LOCAL-SETUP.md).

```bash
# 1. Build the frontend
cd frontend && npm install && npm run build && cd ..

# 2. Stage it inside the backend's web-app directory
mkdir -p server/src/main/webapp
cp -r frontend/build/* server/src/main/webapp/
cp -r frontend/maintain_bookmarks server/src/main/webapp/frontend

# 3. Build the WAR
cd server && ./gradlew bootWar
```

> `produce_war.js` has a fourth line here that moves
> `src/main/webapp/frontend/locales` up to `src/main/webapp/`. It is a no-op:
> `frontend/maintain_bookmarks` contains only `index.jsp`, so that path never exists, and
> the `locales/` directory is already emitted at the web-app root by the Vite build. The
> move fails silently because `produce_war.js` does not error-check it.

> **Use `bootWar`, not `war`.** `./gradlew war` produces a plain, non-deployable WAR — see
> the note below.

Afterwards, remove the staged frontend files (`server/src/main/webapp/index.html`,
`assets/`, `frontend/`) so they do not linger in your working tree; Option A does this for
you.

> **Two WARs land in `build/libs` — only one is deployable.** `juralio.war` is the Spring
> Boot `bootWar` output and the **only** one to deploy; it is the sole artifact given an
> explicit `archiveFileName` in [server/build.gradle](../server/build.gradle#L197). The
> plain `war` task also emits `server-<version>-plain.war` (the Boot plugin's `-plain`
> classifier), which has no Boot loader and must never be deployed. Both appear because
> `./gradlew build` runs `assemble`, which runs both tasks.

If you are building the frontend separately (for pipeline parallelism),
`produce_war.js --continuousIntegration=true` skips the frontend build and reuses the
existing assets.

### Or: build a container image

[server/Dockerfile](../server/Dockerfile) builds a production image on
`tomcat:10.1-jdk17-temurin`. This is the quicker route if your target is ECS, Kubernetes,
or any container host — it removes the "is my Tomcat new enough?" question entirely.

---

## 3. Provision the surrounding infrastructure

Three pieces, however you normally provision things:

- **PostgreSQL database.** Create an empty database and a user that owns it. The schema is
  built on first boot — Liquibase migrations run automatically at startup
  ([server/grails-app/migrations/](../server/grails-app/migrations/)), then the bootstrap
  routine seeds roles and the two accounts from §1. You do not load a schema by hand.
- **S3-compatible bucket** for file uploads and downloads. Whatever runs the app needs
  read/write credentials to it — an instance role, or the standard AWS credential chain.
- **Network access** from the application host to the database.

The app authenticates to S3 (and SES, if you use it for email) through the **AWS SDK's
default credential chain** — an instance/task role in a deployed environment, or
`AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` locally. Credentials are never read from
bespoke environment variables in code.

---

## 4. Configuration

Most configuration comes from the `${...}` placeholders in
[server/grails-app/conf/application.yml](../server/grails-app/conf/application.yml).
**Four values are read straight from the environment in code**, so grepping
`application.yml` alone will not find them: `JURALIO_S3_BUCKET` and `AWS_SDK_REGION`
([S3Service](../server/grails-app/services/com/juralio/aws/S3Service.groovy)),
`JURALIO_VERSION` ([VersionService](../server/grails-app/services/com/juralio/version/VersionService.groovy))
and `DOMAIN`.

[ENVIRONMENT-VARIABLES.md](ENVIRONMENT-VARIABLES.md) is the full reference. The required
minimum:

| Required | Name | Description | Example |
| --- | --- | --- | --- |
| ✅ | `DS_HOST` | Database hostname | `juralio.db.example.com` |
| ✅ | `DS_PORT` | Database port | `5432` |
| ✅ | `DS_USERNAME` | Database user | `juralio_user` |
| ✅ | `DS_PASSWORD` | Database password | — |
| ✅ | `DS_DB_NAME` | Database name | `juralio` |
| ✅ | `AWS_SDK_REGION` | Region for the AWS SDK | `eu-west-2` |
| ✅ | `JURALIO_S3_BUCKET` | Object-storage bucket | `jur-s3-production-a` |
| ✅ | `DOMAIN` | Public base URL. Gates outbound email and enforces single active session | `https://juralio.example.com` |
| ✅ | `MAGIC_LINK_PASSPHRASE` | Encrypts magic links. **Without it no user can be created** — see below | — |
| ➖ | `JURALIO_VERSION` | Version string shown in the UI | `1.14.104` |
| ➖ | `MAX_LOGIN_ATTEMPTS` / `ACCOUNT_LOCK_DURATION_IN_MINUTES` / `TOKEN_EXPIRY_IN_MINUTES` | Auth tuning | `10` |

> **⚠️ Always set `JURALIO_S3_BUCKET` explicitly.** Unset, it falls back to a development
> bucket name — never ship an environment without it.

> **⚠️ `MAGIC_LINK_PASSPHRASE` must be set, despite sounding optional.** Creating a user
> always issues a welcome magic link, and `MagicLinkService` fails closed when the
> passphrase is missing — so **every** `POST /api/users` throws and rolls back. The
> client sees a bare **403 with an empty body**, which looks like a permissions problem;
> the real cause (`IllegalStateException: MAGIC_LINK_PASSPHRASE is not configured`)
> appears only in the server log. Use a long random value, and keep it stable: rotating
> it invalidates every magic link already in the wild.

> **Email.** There are no SMTP settings: outbound mail goes through AWS SES using the SDK
> default chain, from `no-reply@<DOMAIN>`. **If `DOMAIN` is unset, no mail is sent** — the
> message body is printed to stdout instead
> ([SESService.groovy:52-53](../server/grails-app/services/com/juralio/aws/SESService.groovy#L52-L53)).
> If you are not on AWS, expect to replace this service.

SSO (Microsoft, Google, Okta, SAML), the Google Drive picker, rate limiting and error
reporting are all optional and off unless their variables are set. Error reporting in
particular makes **no outbound call at all** unless you configure your own collector — see
the "Error reporting" section of [ENVIRONMENT-VARIABLES.md](ENVIRONMENT-VARIABLES.md).

---

## 5. Deploy

Put the WAR on a Tomcat 10.1+ / Java 17 host, with the environment variables from §4 set,
and start it. That is the whole contract — Elastic Beanstalk, ECS, Kubernetes, a plain
Tomcat box, or `docker run` against the image from §2 all work.

### If you are using AWS Elastic Beanstalk

Two sanitised example configs ship in the repo as a starting point. Both are templates
with `<placeholders>`, not working configs:

- [server/.elasticbeanstalk/example-eb-app.config.yml](../server/.elasticbeanstalk/example-eb-app.config.yml)
  — EB CLI config. Copy to `.elasticbeanstalk/<your-app>.config.yml` and set your
  environment name, application name, keypair, region, and a current Tomcat 10 / Corretto
  17 solution stack. Find the exact current stack name with
  `aws elasticbeanstalk list-available-solution-stacks` — the version suffix moves.
- [server/.ebextensions/environment.config](../server/.ebextensions/environment.config)
  — EB environment options: TLS certificate mapping (keyed by region + account id),
  autoscaling, health-check path, the SSH source restriction, and the environment
  variables from §4.

With those two files filled in, deploy with the EB CLI directly:

```bash
cd server
eb init <your-application> --region <your-region>
eb use <your-environment>
eb deploy -l <release-label>
```

`deploy.artifact` in the EB CLI config points at `build/libs/juralio.war`, so build first
(§2) and run `eb` from `server/`.

### If you want a CI/CD pipeline

There is no pipeline configuration in this repository — bring your own. The build is a
single `npm run build`, so the shape is straightforward: build → run the test suites →
deploy the WAR.

[server/tools/deploy/](../server/tools/deploy/) holds the three scripts Juralio used
alongside CircleCI and AWS. **None works standalone** — each is coupled to infrastructure
that is not part of this repository:

- `deploy.js` (`npm --prefix server run deploy`) triggers a CircleCI pipeline via the
  CircleCI API and needs `CIRCLECI_TOKEN`; it does not itself deploy anything.
- `deploy-cci.js` runs *inside* CircleCI: it resolves the last successful `develop` build,
  downloads that artifact, and drives `eb init` / `eb use` / `eb deploy`.
- `upload-notices.js` (`npm --prefix server run upload-notices`) pushes the images in
  `frontend/src/assets/images/upload-notices` to every S3 bucket matching `jur-s3-` in the
  configured AWS account. It assumes Juralio's own bucket naming and AWS CLI profiles.

Treat them as a worked reference for the `eb` sequence above, not as tooling you can run.

---

## 6. Verify the deployment

- **Health:** `GET https://<your-host>/health` returns 200. This is also what the
  container healthcheck uses, and what `./test.sh` waits on before running e2e suites.
- **Root URL — check this specifically.** Under Grails 7 the dispatcher consumes `/`, so
  Tomcat's welcome-file handling no longer serves the bundled `index.html`. It is served by
  [SpaIndexController](../server/grails-app/controllers/com/juralio/frontend/SpaIndexController.groovy)
  instead, mapped at `/` in [UrlMappings](../server/grails-app/controllers/server/UrlMappings.groovy).
  **`/health` returning 200 while `/` returns 404** means that mapping or the bundled
  `index.html` is missing. Covered by
  [spa_index_spec.cy.js](../e2e/security/cypress/e2e/spa/spa_index_spec.cy.js).
- **Log in**, using the §1 credentials if this is a fresh database — then change them.
- **Check the startup log** for migration failures. On a first boot the schema is built
  from scratch, which takes noticeably longer than subsequent starts.

---

## Troubleshooting

| Symptom | Likely cause |
| --- | --- |
| App fails at startup with `javax.servlet` / `jakarta.servlet` errors | Tomcat 9 or Java 11. Needs Tomcat 10.1+ / Java 17 — see the top of this document. |
| `/health` is 200 but `/` returns 404 | The SPA index mapping or the bundled `index.html` is missing — see §6. |
| Deployed WAR has no frontend | The `-plain` WAR was deployed instead of `juralio.war` — see §2. |
| Uploads fail, or files land in an unexpected bucket | `JURALIO_S3_BUCKET` unset (falls back to a development name), or the host's role lacks bucket permissions. |
| No emails arrive | `DOMAIN` unset — mail is written to stdout rather than sent. See §4. |
| Migration errors on first boot | The database user does not own the database, or the schema is not empty. |
