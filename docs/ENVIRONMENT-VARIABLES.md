# Environment Variables

This guide documents every environment variable read by the Juralio frontend and
backend: what it does, whether it is required, and how to set it.

- [Frontend](#frontend)
- [Backend](#backend)

---

## Frontend

The frontend is a **Vite** app (not Create React App). This determines the env conventions:

- App code reads variables via **`import.meta.env.*`** (not `process.env.*`).
- Only variables prefixed **`VITE_`** are exposed to browser code — this is Vite's
  security default. Anything without the prefix is invisible to the app bundle.
- Env files are loaded automatically by Vite's built-in dotenv support. No `env-cmd`
  or manual dotenv wiring is used.

### How to set frontend variables

Create/edit `frontend/.env.local` (gitignored — values must be shared out-of-band):

```dotenv
VITE_GOOGLE_API_DEVELOPER_KEY=your-api-key
VITE_GOOGLE_API_CLIENT_ID=your-oauth-client-id.apps.googleusercontent.com
VITE_GOOGLE_API_SCOPE=https://www.googleapis.com/auth/drive.readonly
VITE_GOOGLE_API_APP_ID=your-google-cloud-project-number
```

> **Note:** [frontend/.env.local.example](../frontend/.env.local.example) is a committed
> template — `cp .env.local.example .env.local` and fill it in. The values themselves are
> not in the repository. The app runs fine without the file; the Google sign-in button
> and Drive picker simply do nothing.

### App variables (exposed to the browser)

These power the **Google Drive picker** dialog
([google_drive_dialog.js](../frontend/src/components/dialog/google-drive/google_drive_dialog.js#L1-L4)).
All four are required for the Google Drive integration to work.

`VITE_GOOGLE_API_CLIENT_ID` additionally drives the **"Sign in with Google" button** on
the login screen, so it is needed for Google SSO even if you never enable the Drive
picker. They are optional overall — if unset, the rest of the app is unaffected and both
features simply do nothing.

| Variable | What it does | Required |
|---|---|---|
| `VITE_GOOGLE_API_DEVELOPER_KEY` | Google API developer/API key for the Picker API | For Drive feature |
| `VITE_GOOGLE_API_CLIENT_ID` | OAuth 2.0 client ID used to authenticate the user against Google. Also backs the "Sign in with Google" login button | For Drive feature **and** Google SSO |
| `VITE_GOOGLE_API_SCOPE` | OAuth scope requested (governs Drive read/write permission level) | For Drive feature |
| `VITE_GOOGLE_API_APP_ID` | Google Cloud project/app ID used by the Picker API | For Drive feature |

> ⚠️ `VITE_`-prefixed values are **baked into the shipped JS bundle** and are therefore
> publicly visible. This is inherent to browser-side Google Picker usage — treat the
> developer key accordingly and restrict it in the Google Cloud console.

### Build/dev-time variables (Node only — not exposed to the browser)

Set through npm scripts in [frontend/package.json](../frontend/package.json) or the
container environment, not via `.env` files. Listed for completeness.

| Variable | What it does | How to set |
|---|---|---|
| `SSL_CRT_FILE` / `SSL_KEY_FILE` | Enable an HTTPS dev server if both point to a cert + key (see [vite.config.js](../frontend/vite.config.js#L15-L16)). Supports `~/` expansion. If unset, the dev server runs plain HTTP. | `npm run start-https` sets these automatically |
| `ANALYZE` | Set to `true` to emit a bundle-analysis report at `build/stats.html` ([vite.config.js](../frontend/vite.config.js#L65)) | `npm run build:analyze` |
| `NODE_OPTIONS` | Node runtime tuning (HTTP header size on start, heap size on build) | Set by npm scripts |
| `CI` | `true` for Jest CI reporting | `npm run test:ci` |
| `BROWSER` / `BROWSER_ARGS` | Which browser Vite auto-opens and with what args | `npm run debug` |
| `VITE_USE_POLLING` | Set to `true` to make the Vite dev server watch files by polling instead of native filesystem events ([vite.config.js](../frontend/vite.config.js#L80)). Needed when the source is on a bind-mounted volume, which is why the containerised dev path sets it | Set in [docker-compose.local.yml](../docker-compose.local.yml); see §9 of the local-setup runbook |
| `UPDATE_PARITY_SNAPSHOTS` | Set to `1` to regenerate the golden ExcelJS baselines used by the report-export parity tests instead of asserting against them ([parity.test.js](../frontend/src/services/export/reports/__parity__/parity.test.js#L45)). Only do this when an export change is intentional, and review the regenerated files | `UPDATE_PARITY_SNAPSHOTS=1 npx jest parity` |

### Vite built-ins (automatic — do not set)

- `import.meta.env.PROD` — `true` in production builds; gates service-worker registration.
- `import.meta.env.BASE_URL` — derived from the `base` option in `vite.config.js`.

### Note: the API base URL is *not* env-driven

The backend API base URL is resolved at runtime from `window.location` in
[api-helper.js](../frontend/src/services/helpers/api-helper.js) (dev ports route to
`localhost:8080`, otherwise same-origin `/api/`). There is no environment variable
and no runtime config injection for it.

---

## Backend

The Grails backend reads external config in three ways:

1. **Spring/Grails `${ENV_VAR:default}` placeholders** in
   [application.yml](../server/grails-app/conf/application.yml), surfaced to code via
   [ConfigService.groovy](../server/grails-app/services/com/juralio/config/ConfigService.groovy).
2. **Direct `System.getenv()` / `System.getProperty()`** reads in a few services.
3. **AWS SDK default credential/region chain** (S3, SES) — standard AWS mechanisms;
   credentials are never read from explicit env vars in code (IAM role in prod, or the
   standard `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` chain).

`ConfigService` supplies **code-level defaults** for many typed properties even where
the YAML placeholder has none. If an env var is unset and no default exists, the value
is null/blank.

### How to set backend variables

- **Local (Docker):** set them in [docker-compose.local.yml](../docker-compose.local.yml)
  under the server service's `environment` block. This is the file `./start.sh` uses.
- **Deployed (Elastic Beanstalk):** set them in
  [server/.ebextensions/environment.config](../server/.ebextensions/environment.config).
- Dev runs use a hardcoded local Postgres datasource and test uses in-memory H2, so the
  `DS_*` variables below only apply in the `production` environment.

### Database (PostgreSQL — production only)

Used only in the `production` datasource block
([application.yml:120-133](../server/grails-app/conf/application.yml#L120-L133)).

| Variable | What it does | Required |
|---|---|---|
| `DS_HOST` | Postgres host | Yes (prod) |
| `DS_PORT` | Postgres port (EB defaults to `5432`) | Yes (prod) |
| `DS_DB_NAME` | Database name | Yes (prod) |
| `DS_USERNAME` | DB username | Yes (prod) |
| `DS_PASSWORD` | DB password | Yes (prod) |

### Storage — AWS S3

Read in [S3Service.groovy](../server/grails-app/services/com/juralio/aws/S3Service.groovy)
(via `System.getenv` → `System.getProperty` fallback).

| Variable | What it does | Default | Required |
|---|---|---|---|
| `JURALIO_S3_BUCKET` | S3 bucket for file uploads/downloads | `jur-default-s3-local-dev` | Optional |
| `AWS_SDK_REGION` | AWS region for the S3 (and general SDK) client | `eu-west-2` | Optional |

### Email — AWS SES

No dedicated SMTP/SES variables. SES uses the AWS SDK with default region `eu-west-2`.
The "from" address is derived from `DOMAIN` (below) as `no-reply@<domain>`. **If `DOMAIN`
is unset, real emails are not sent** — the message body is printed to stdout instead
([SESService.groovy:34-66](../server/grails-app/services/com/juralio/aws/SESService.groovy#L34-L66)).

### Authentication / security core

Placeholders in [application.yml:134-138](../server/grails-app/conf/application.yml#L134-L138)
(plus `DOMAIN` at [application.yml:166](../server/grails-app/conf/application.yml#L166)); defaults in
[ConfigService.groovy](../server/grails-app/services/com/juralio/config/ConfigService.groovy).

| Variable | What it does | Default | Required |
|---|---|---|---|
| `MAX_LOGIN_ATTEMPTS` | Failed logins before lockout | `5` | Optional |
| `ACCOUNT_LOCK_DURATION_IN_MINUTES` | Account lock duration | `5` | Optional |
| `TOKEN_EXPIRY_IN_MINUTES` | Auth token expiry | `15` | Optional |
| `MAGIC_LINK_PASSPHRASE` | Passphrase used to encrypt magic links. **Also required to create any user** — see the warning below | none | Yes |
| `DOMAIN` | App base URL/domain. Gates email sending, and enforces single active session (inserting a new token deletes existing tokens for that user — [UserAuthToken.groovy:29](../server/grails-app/domain/com/juralio/auth/UserAuthToken.groovy#L29)) | none | Yes (prod) |

> **`MAGIC_LINK_PASSPHRASE` is not optional, despite the name.** Creating a user always
> issues a welcome magic link ([UserService.emailNewUserWelcome](../server/grails-app/services/com/juralio/auth/UserService.groovy#L783)),
> and [MagicLinkService](../server/grails-app/services/com/juralio/auth/password/MagicLinkService.groovy#L146)
> fails closed when the passphrase is unset. So with it missing, **every**
> `POST /api/users` throws and rolls back — including `./start.sh seed`.
>
> The symptom is deliberately unhelpful: the client gets a bare **403 with an empty
> body**, which reads like a permissions problem and sends you hunting through
> `@Secured` and `hasCreateUserAccess()` (both of which are fine). The real cause only
> appears in the server log:
>
> ```
> IllegalStateException: MAGIC_LINK_PASSPHRASE is not configured; cannot issue a magic link
> ```
>
> Check `./start.sh logs server` before suspecting auth. Any value works locally —
> `docker-compose.local.yml` sets a throwaway default, so the containers are fine
> out of the box. **A real deployment must set its own**, or user creation is broken
> there in exactly this silent way.

### SSO / OAuth

Unset = that provider is disabled. A SAML provider is also registered, but its config is
per-org (not env-driven).

**Microsoft** ([application.yml:155-159](../server/grails-app/conf/application.yml#L155-L159))

| Variable | What it does |
|---|---|
| `MICROSOFT_CLIENT_ID` | MS OAuth client ID |
| `MICROSOFT_TENANT_ID` | MS tenant ID |
| `MICROSOFT_REDIRECT_URL` | OAuth redirect URL |
| `MICROSOFT_CLIENT_SECRET` | MS OAuth client secret |

**Google** ([application.yml:154](../server/grails-app/conf/application.yml#L154)) — this is
the *backend* Google SSO client (separate from the frontend Drive picker keys).

| Variable | What it does | Default |
|---|---|---|
| `GOOGLE_CLIENT_ID` | Google SSO client ID | Hardcoded dev fallback in ConfigService |

**Okta** ([application.yml:160-165](../server/grails-app/conf/application.yml#L160-L165))

| Variable | What it does |
|---|---|
| `OKTA_CLIENT_ID` | Okta client ID |
| `OKTA_REDIRECT_ID` | Okta redirect URL |
| `OKTA_AUTH_URL` | Okta authorization URL |
| `OKTA_API_KEY` | Okta API key |
| `OKTA_OPTIONAL_USERNAME_APPENDAGE` | Optional username suffix appended for Okta logins |

### Rate limiting

[application.yml:139-144](../server/grails-app/conf/application.yml#L139-L144). All optional.

| Variable | What it does | Default |
|---|---|---|
| `RATE_LIMIT_ENABLED` | Toggle rate limiting | `true` |
| `RATE_LIMIT_REQUESTS_PER_WINDOW` | Max requests per window | `200` |
| `RATE_LIMIT_WINDOW_SECONDS` | Window length in seconds | `60` |
| `RATE_LIMIT_ALERT_EMAIL` | Address for rate-limit alert emails (sent via SES) | `developers@example.com` |
| `RATE_LIMIT_ALERT_COOLDOWN_SECONDS` | Minimum gap between alert emails | `300` |

### Error reporting

Reporting of unhandled server errors to an external endpoint. **Opt-in and off by
default**: with `ERROR_REPORTING_URL` unset the server makes no outbound call at
all — it logs the error locally and returns a 500. Only set these if you are
running your own collector; the reported payload includes the request path,
headers (the bearer token redacted to a user id), parameters and a stack trace.

| Variable | What it does | Default |
|---|---|---|
| `ERROR_REPORTING_URL` | Endpoint that unhandled errors are POSTed to. Unset = reporting disabled entirely | none |
| `ERROR_REPORTING_API_KEY_SECRET` | Name of the AWS Secrets Manager secret holding the value sent as the `x-api-key` header. Unset = no header sent | none |
| `ERROR_REPORTING_ALERT_EMAIL` | Address that also receives an error alert via SES. Unset = no email. Requires `ERROR_REPORTING_URL` | none |

### Integrations / external services

[application.yml:173-175](../server/grails-app/conf/application.yml#L173-L175). All default to none/null.

| Variable | What it does | Required |
|---|---|---|
| `FAVICON_SERVICE` | URL of the favicon microservice | Optional |
| `UNSPLASH_API_KEY` | Unsplash image API key. Used server-side only — it is never sent to the browser. Unset = the image picker returns `501` and no upstream call is made. You need your own key and must accept the [Unsplash API Terms](https://unsplash.com/api-terms) | Optional |
| `TEMPLATE_IMPORT_ACCESS_KEY` | Shared secret required in the `accessKey` header by `POST /api/projecttemplates/import`. **Unset = the endpoint rejects every request.** Set it only if you use machine-to-machine template import, and treat it as a credential | Optional |

### Licensing / seats

[application.yml:170-172](../server/grails-app/conf/application.yml#L170-L172). All optional.

| Variable | What it does |
|---|---|
| `FULL_SEATS` | Number of full seats licensed |
| `LIMITED_SEATS` | Number of limited seats licensed |

### Version / build

| Variable | What it does | Default |
|---|---|---|
| `JURALIO_VERSION` | App version string exposed by [VersionService.groovy](../server/grails-app/services/com/juralio/version/VersionService.groovy) (via `System.getenv` → `System.getProperty`) | none |

### Developer tooling

Used by scripts under `tools/` and `e2e/tools/` — never by the app itself.

| Variable | What it does | Required |
|---|---|---|
| `SLACK_WEBHOOK_URL` | Slack incoming-webhook URL. Optional output channel for the weekly dependency-update scan ([tools/dependency-updates/](../tools/dependency-updates/)) and the e2e spec-name checker ([e2e/tools/check-e2es/](../e2e/tools/check-e2es/)). Both work without it. | Optional |
| `CIRCLECI_TOKEN` | Read by the legacy deploy scripts in [server/tools/deploy/](../server/tools/deploy/). Those scripts are tied to a CircleCI project that is **not** part of this repository and do not work standalone — see the CI/CD section of [RUNBOOK-DEPLOYMENT.md](RUNBOOK-DEPLOYMENT.md). | No |

### Notes & gotchas

- Most sensitive placeholders (DB, SSO, secrets, seats) have **no YAML default**. If unset,
  Spring leaves the literal `${VAR}` string; typed properties fall back to the
  `ConfigService` code default where one exists, otherwise null/blank.
- **AWS credentials** are never read from explicit env vars in code — the SDK default
  chain is used (IAM role in Elastic Beanstalk).
- Only four values are read directly via `System.getenv`/`getProperty`: `JURALIO_S3_BUCKET`,
  `AWS_SDK_REGION`, `JURALIO_VERSION`, and `DOMAIN`. Everything else flows through
  `application.yml` placeholders and `ConfigService`.
