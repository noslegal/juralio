# Security Policy

## Reporting a vulnerability

**Please do not open a public issue for a security vulnerability.**

Report it privately through **GitHub Security Advisories** — use the "Report a
vulnerability" button on the repository's Security tab. This gives us a private thread
with you and a path to coordinated disclosure.

If that option isn't available to you, open a regular issue asking a maintainer to get in
touch — **without any detail of the vulnerability itself** — and we will find a private
channel from there.

Please include enough for us to reproduce the issue: affected version or commit, the
component (frontend, backend API, deployment configuration), the steps or request
sequence involved, and the impact you believe it has. A proof of concept is welcome but
not required.

We will acknowledge your report and keep you updated as we investigate. Please give us a
reasonable opportunity to fix the issue before disclosing it publicly, and we will credit
you in the release notes unless you would rather we didn't.

## Supported versions

Juralio is developed on the `develop` branch, and fixes land there. There is no long-term
support branch for older releases — if you are running Juralio, track `develop` or a
recent tag.

## ⚠️ Known issue: default credentials on a fresh install

**Every new Juralio instance seeds two accounts with published passwords.**

On a database with no organisation in it, the backend creates these at startup
([BootstrapService.groovy](server/grails-app/services/com/juralio/bootstrap/BootstrapService.groovy)):

| Login | Password |
| --- | --- |
| `sysadmin@juralio.com` | `Password1Password1$` |
| `matter.creator@juralio.com` | `Password2Password2$` |

This is gated on the database being empty, **not** on the environment being development,
so it happens in production too. Because these credentials are published in this
repository, a fresh instance reachable from the internet has a known superuser login until
you change it.

**If you deploy Juralio, change both passwords — and preferably the sysadmin username —
before the instance is publicly reachable.** Bring it up on a private network first, or
create your own administrator and remove these two accounts.

We treat this as a documented deployment step rather than a vulnerability in the software,
but it is the single most likely way a Juralio instance gets compromised, so it is worth
stating plainly.

## Hardening checklist for operators

Beyond the default credentials above:

- **Set `DOMAIN`.** It gates outbound email and enforces a single active session per user.
- **Set `JURALIO_S3_BUCKET` explicitly.** Unset, it falls back to a development bucket name.
- **Terminate TLS in front of the app.** Juralio expects to be served over HTTPS.
- **Keep rate limiting on.** It defaults to enabled; see the `RATE_LIMIT_*` variables in
  [docs/ENVIRONMENT-VARIABLES.md](docs/ENVIRONMENT-VARIABLES.md).
- **Consider enabling MFA**, which is supported per-organisation and per-user.
- **Error reporting is opt-in and off by default.** If you set `ERROR_REPORTING_URL`, be
  aware the payload includes request paths, headers (the bearer token redacted to a user
  id), parameters and stack traces — point it only at a collector you control.
- **Restrict database network access** to the application hosts.

## Scope

In scope: the Juralio frontend and backend in this repository, and the example deployment
configuration under `server/.ebextensions/` and `server/.elasticbeanstalk/`.

Out of scope: vulnerabilities in third-party dependencies that are already public and have
an upstream fix available (please do report them if there is no upstream fix, or if
Juralio's usage makes an otherwise low-severity issue serious), and any instance of
Juralio operated by someone else — report those to whoever runs it.
