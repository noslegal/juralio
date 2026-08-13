# Third-Party Licensing

The Juralio software is licensed on Apache 2.0 (permissive open source) terms.
All third-party components in it are listed below together with their applicable
licence. The great majority are Apache 2.0 or other compatible open source
permissive licences (MIT, BSD-2-Clause, BSD-3-Clause, ISC, CC0-1.0).

A small number of server-side Java libraries are distributed under weak-copyleft
or dual licences (LGPL-2.1, MPL-2.0 / EPL-1.0, and EPL-2.0 / GPL-2.0 with a
"classpath exception"). These are used unmodified as standard third-party
libraries — they are not modified and are not statically linked into a
derivative work — and each is identified individually below and in the
[Notes](#notes-on-non-permissive--dual-licences) section.

> This document lists **direct declared dependencies**. Each of these may in turn
> pull in transitive dependencies; those inherit the same permissive ecosystems
> and can be enumerated with `npm ls` (Node) or `./gradlew dependencies` (server).
> Dual-licensed components are used under their permissive option where one exists
> (e.g. `jszip` under MIT, `passay` under Apache-2.0).

## Licence summary

| Licence | Type | Notes |
| --- | --- | --- |
| Apache-2.0 | Permissive | Same licence as Juralio itself |
| MIT | Permissive | |
| BSD-2-Clause / BSD-3-Clause | Permissive | |
| ISC | Permissive | Functionally equivalent to MIT |
| CC0-1.0 | Public domain dedication | `element-closest` |
| SIL OFL 1.1 | Permissive (font-specific) | Montserrat webfonts bundled in `frontend/src/fonts/` |
| LGPL-2.1 | Weak copyleft | `hibernate-core` (pulled transitively via `grails-data-hibernate5`, unmodified) |
| MPL-2.0 / EPL-1.0 | Weak copyleft (file-level) | `h2` (declared at `implementation` scope, so it ships in the WAR) |
| EPL-2.0 / GPL-2.0-with-classpath-exception / EDL-1.0 | Dual, weak copyleft + classpath exception | Jakarta Mail API & Eclipse Angus Mail |
| EDL-1.0 (= BSD-3-Clause) | Permissive | `jakarta.xml.bind-api` |

---

## Server — Java / Groovy (Grails, Gradle)

The application runs on the Grails framework (Apache-2.0, now under the
`org.apache.grails` coordinates as of the Grails 7 migration), the Groovy
language (Apache-2.0) and the Spring Framework (Apache-2.0). Versions marked
`(managed)` are resolved by the Grails BOM (`org.apache.grails:grails-bom:7.2.1`)
or the Spring Boot BOM.

### Build plugins (Gradle buildscript)

| Component | Version | Licence |
| --- | --- | --- |
| `org.apache.grails:grails-bom` | 7.2.1 | Apache-2.0 |
| `org.apache.grails:grails-gradle-plugins` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-data-hibernate5` | (managed) | Apache-2.0 |
| `cloud.wondrify:asset-pipeline-gradle` | 5.0.19 | Apache-2.0 |

### Runtime & compile dependencies

| Component | Version | Licence |
| --- | --- | --- |
| `org.apache.grails:grails-core` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-url-mappings` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-interceptors` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-services` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-datasource` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-databinding` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-web-boot` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-logging` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-converters` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-cache` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-async` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-events` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-rest-transforms` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-data-hibernate5` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-data-hibernate5-dbmigration` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-views-gson` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-console` | (managed) | Apache-2.0 |
| `org.apache.grails.profiles:rest-api` | 7.2.1 | Apache-2.0 |
| `org.apache.grails:grails-spring-security` | 7.2.1 | Apache-2.0 |
| `org.apache.grails:grails-spring-security-rest` | 7.2.1 | Apache-2.0 |
| `org.apache.grails:grails-spring-security-rest-datamapping` | 7.0.2 | Apache-2.0 |
| `org.grails.plugins:audit-logging` | 6.0.0 | Apache-2.0 |
| `org.springframework.boot:spring-boot-autoconfigure` | (managed) | Apache-2.0 |
| `org.springframework.boot:spring-boot-starter-tomcat` | (managed) | Apache-2.0 |
| `org.springframework.boot:spring-boot-starter-logging` | (managed) | Apache-2.0 |
| `org.springframework.boot:spring-boot-devtools` | (managed) | Apache-2.0 |
| `org.springframework.retry:spring-retry` | 2.0.6 | Apache-2.0 |
| `org.apache.tomcat:tomcat-jdbc` | (managed) | Apache-2.0 |
| `org.apache.groovy:groovy-dateutil` | (managed) | Apache-2.0 |
| `org.apache.groovy:groovy-datetime` | (managed) | Apache-2.0 |
| `cloud.wondrify:asset-pipeline-grails` | (managed) | Apache-2.0 |
| `cloud.wondrify:asset-pipeline-core` | (managed) | Apache-2.0 |
| `commons-lang:commons-lang` | 2.6 | Apache-2.0 |
| `org.liquibase:liquibase-core` | 4.27.0 | Apache-2.0 |
| `builders.dsl:spreadsheet-builder-poi` | 3.0.1 | Apache-2.0 |
| `builders.dsl:spreadsheet-builder-groovy` | 3.0.1 | Apache-2.0 |
| `com.okta.jwt:okta-jwt-verifier` | 0.5.9 | Apache-2.0 |
| `com.okta.jwt:okta-jwt-verifier-impl` | 0.5.9 | Apache-2.0 |
| `com.google.api-client:google-api-client` | 2.6.0 | Apache-2.0 |
| `software.amazon.awssdk:bom` | 2.31.0 | Apache-2.0 |
| `software.amazon.awssdk:s3` | (managed) | Apache-2.0 |
| `software.amazon.awssdk:ses` | (managed) | Apache-2.0 |
| `software.amazon.awssdk:secretsmanager` | (managed) | Apache-2.0 |
| `com.warrenstrange:googleauth` | 1.5.0 | BSD-3-Clause |
| `org.postgresql:postgresql` | 42.7.3 | BSD-2-Clause |
| `com.onelogin:java-saml` | 2.9.0 | MIT |
| `org.jsoup:jsoup` | 1.18.1 | MIT |
| `org.passay:passay` | 1.6.4 | Apache-2.0 OR LGPL-3.0 (used under Apache-2.0) |
| `com.h2database:h2` | (managed) | MPL-2.0 OR EPL-1.0 |
| `jakarta.mail:jakarta.mail-api` | 2.1.3 | EPL-2.0 OR GPL-2.0-with-classpath-exception OR EDL-1.0 |
| `org.eclipse.angus:angus-mail` | 2.0.3 | EPL-2.0 OR GPL-2.0-with-classpath-exception OR EDL-1.0 |
| `jakarta.xml.bind:jakarta.xml.bind-api` | (managed) | EDL-1.0 (= BSD-3-Clause) |

### Server test dependencies

| Component | Version | Licence |
| --- | --- | --- |
| `org.spockframework:spock-core` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-testing-support-datamapping` | (managed) | Apache-2.0 |
| `org.apache.grails:grails-testing-support-web` | (managed) | Apache-2.0 |
| `org.mockito:mockito-core` | (managed) | MIT |

> "(managed)" means the version is resolved by the Grails/Spring Boot BOM rather
> than pinned directly in `build.gradle`.

---

## Frontend — React / Node.js (npm)

_The following tables are generated from the installed packages' declared `license`
fields._

#### frontend

| Package | Version | Licence |
| --- | --- | --- |
| `@babel/preset-env` | 7.29.7 | MIT |
| `@babel/preset-react` | 7.29.7 | MIT |
| `@emotion/react` | 11.14.0 | MIT |
| `@emotion/styled` | 11.14.1 | MIT |
| `@glideapps/glide-data-grid` | 6.0.3 | MIT |
| `@glideapps/glide-data-grid-cells` | 6.0.3 | MIT |
| `@hello-pangea/dnd` | 18.0.1 | Apache-2.0 |
| `@mdi/js` | 7.4.47 | Apache-2.0 |
| `@mdi/react` | 1.6.1 | MIT |
| `@mui/icons-material` | 9.2.0 | MIT |
| `@mui/lab` | 9.0.0-beta.6 | MIT |
| `@mui/material` | 9.2.0 | MIT |
| `@mui/system` | 9.2.0 | MIT |
| `@mui/x-charts` | 9.10.1 | MIT |
| `@mui/x-data-grid` | 9.10.1 | MIT |
| `@mui/x-date-pickers` | 9.10.1 | MIT |
| `@okta/okta-react` | 6.11.0 | Apache-2.0 |
| `@peculiar/x509` | 2.0.0 | MIT |
| `@tiptap/core` | 3.29.2 | MIT |
| `@tiptap/extension-character-count` | 3.29.2 | MIT |
| `@tiptap/extension-link` | 3.29.2 | MIT |
| `@tiptap/extension-placeholder` | 3.29.2 | MIT |
| `@tiptap/extension-table` | 3.29.2 | MIT |
| `@tiptap/extension-table-cell` | 3.29.2 | MIT |
| `@tiptap/extension-table-header` | 3.29.2 | MIT |
| `@tiptap/extension-table-row` | 3.29.2 | MIT |
| `@tiptap/extension-underline` | 3.29.2 | MIT |
| `@tiptap/react` | 3.29.2 | MIT |
| `@tiptap/starter-kit` | 3.29.2 | MIT |
| `@vitejs/plugin-react` | 5.2.0 | MIT |
| `babel-jest` | 30.4.1 | MIT |
| `buffer` | 6.0.3 | MIT |
| `classnames` | 2.5.1 | MIT |
| `cross-env` | 10.1.0 | MIT |
| `css-mediaquery` | 0.1.2 | BSD-3-Clause |
| `d3-axis` | 3.0.0 | ISC |
| `d3-drag` | 3.0.0 | ISC |
| `d3-hierarchy` | 3.1.2 | ISC |
| `d3-scale` | 4.0.2 | ISC |
| `d3-selection` | 3.0.0 | ISC |
| `d3-shape` | 3.2.0 | ISC |
| `d3-time-format` | 4.1.0 | ISC |
| `d3-transition` | 3.0.1 | ISC |
| `d3-zoom` | 3.0.0 | ISC |
| `date-fns` | 2.30.0 | MIT |
| `dayjs` | 1.11.21 | MIT |
| `docx` | 9.7.1 | MIT |
| `downshift` | 9.3.6 | MIT |
| `element-closest` | 3.0.2 | CC0-1.0 |
| `eslint` | 9.39.5 | MIT |
| `eslint-plugin-react` | 7.37.5 | MIT |
| `eslint-plugin-react-hooks` | 5.2.0 | MIT |
| `eslint-plugin-tss-unused-classes` | 1.0.4 | MIT |
| `eslint-plugin-unused-imports` | 4.4.1 | MIT |
| `exceljs` | 4.4.0 | MIT |
| `file-saver` | 2.0.5 | MIT |
| `http-status-codes` | 2.3.0 | MIT |
| `i18next` | 22.4.15 | MIT |
| `i18next-browser-languagedetector` | 8.2.1 | MIT |
| `i18next-xhr-backend` | 3.2.2 | MIT |
| `jest` | 30.4.2 | MIT |
| `jest-each` | 30.4.1 | MIT |
| `jest-environment-jsdom` | 30.4.1 | MIT |
| `jest-junit-reporter` | 1.1.0 | MIT |
| `js-base64` | 3.9.2 | BSD-3-Clause |
| `json-diff` | 1.0.6 | MIT |
| `json-stringify-safe` | 5.0.1 | ISC |
| `jszip` | 3.10.1 | MIT OR GPL-3.0-or-later (used under MIT) |
| `lint-staged` | 16.4.0 | MIT |
| `mockdate` | 3.0.5 | MIT |
| `node-notifier` | 10.0.1 | MIT |
| `prettier` | 3.8.4 | MIT |
| `prop-types` | 15.8.1 | MIT |
| `qrcode.react` | 4.2.0 | ISC |
| `query-string` | 8.2.0 | MIT |
| `querystring-browser` | 1.0.4 | MIT |
| `ramda` | 0.32.0 | MIT |
| `react` | 18.3.1 | MIT |
| `react-dom` | 18.3.1 | MIT |
| `react-draggable` | 4.7.1 | MIT |
| `react-i18next` | 12.2.0 | MIT |
| `react-redux` | 8.0.5 | MIT |
| `react-resize-detector` | 12.3.0 | MIT |
| `react-router` | 6.30.4 | MIT |
| `react-router-dom` | 6.30.4 | MIT |
| `react-transition-group` | 4.4.5 | BSD-3-Clause |
| `reactour` | 1.19.4 | MIT |
| `redux` | 4.2.1 | MIT |
| `redux-devtools-extension` | 2.13.9 | MIT |
| `redux-mock-store` | 1.5.5 | MIT |
| `redux-thunk` | 2.4.2 | MIT |
| `reflect-metadata` | 0.2.2 | Apache-2.0 |
| `regenerator-runtime` | 0.14.1 | MIT |
| `rollup-plugin-visualizer` | 5.14.0 | MIT |
| `sanitize-html` | 2.17.5 | MIT |
| `shx` | 0.4.0 | MIT |
| `sort-json` | 2.0.1 | MIT |
| `styled-components` | 5.3.11 | MIT |
| `tss-react` | 4.9.21 | MIT |
| `unsplash-js` | 7.0.20 | MIT |
| `use-error-boundary` | 2.0.6 | MIT |
| `vite` | 7.3.6 | MIT |
| `vite-plugin-node-polyfills` | 0.28.0 | MIT |
| `vite-plugin-svgr` | 4.5.0 | MIT |

---

## Build & tooling — Node.js (npm)

#### server (npm helper scripts)

| Package | Version | Licence |
| --- | --- | --- |
| `lodash` | 4.18.1 | MIT |
| `node-fetch` | 2.7.0 | MIT |
| `shelljs` | 0.8.5 | BSD-3-Clause |
| `yargs` | 17.7.3 | MIT |

#### root (repo tooling)

| Package | Version | Licence |
| --- | --- | --- |
| `husky` | 9.1.7 | MIT |
| `npm-run-all` | 4.1.5 | MIT |
| `prettier` | 3.8.3 | MIT |
| `shelljs` | 0.8.5 | BSD-3-Clause |
| `yargs` | 15.4.1 | MIT |

#### e2e (Cypress test suite)

| Package | Version | Licence |
| --- | --- | --- |
| `@nuintun/qrcode` | 3.1.1 | MIT |
| `chai-colors` | 1.0.1 | MIT |
| `cross-env` | 7.0.3 | MIT |
| `crypto-js` | 4.2.0 | MIT |
| `cypress` | 11.2.0 | MIT |
| `cypress-esbuild-preprocessor` | 1.0.2 | ISC |
| `cypress-file-upload` | 5.0.8 | MIT |
| `dayjs` | 1.11.21 | MIT |
| `esbuild` | 0.28.0 | MIT |
| `faker` | 5.5.3 | MIT |
| `http-status-codes` | 2.3.0 | MIT |
| `node-xlsx` | 0.17.2 | Apache-2.0 |
| `otpauth` | 7.1.1 | MIT |
| `project-name-generator` | 2.1.9 | ISC |
| `ramda` | 0.32.0 | MIT |
| `wait-on` | 9.0.10 | MIT |

> `tools/dev-seed` is a shell script with no npm dependencies, so it has no entry here.

#### tools/juralio-component-tool

| Package | Version | Licence |
| --- | --- | --- |
| `yargs` | 15.4.1 | MIT |

#### e2e/tools/check-e2es and e2e/tools/cookie-cutter

Both declare the same set.

| Package | Version | Licence |
| --- | --- | --- |
| `babel-cli` | 6.26.0 | MIT |
| `babel-plugin-transform-imports` | 2.0.0 | ISC |
| `babel-preset-env` | 1.7.0 | MIT |
| `babel-preset-react` | 6.24.1 | MIT |
| `babel-preset-stage-2` | 6.24.1 | MIT |
| `glob` | 7.2.3 | ISC |

> `tools/dependency-updates` and `tools/api-documentation` have no declared npm
> dependencies, so they have no entry here.

---

## Bundled assets

Some third-party material is committed directly into the repository rather than
pulled in as a package dependency. It is not covered by the npm or Gradle tables
above, so it is listed here.

### Fonts — `frontend/src/fonts/`

| Asset | Files | Copyright | Licence | Licence text |
| --- | --- | --- | --- | --- |
| Montserrat (v21, latin, weights 300/400/500) | 15 (`.eot`, `.svg`, `.ttf`, `.woff`, `.woff2`) | Copyright 2011 The Montserrat Project Authors (<https://github.com/JulietaUla/Montserrat>) | SIL OFL 1.1 | [`frontend/src/fonts/OFL.txt`](frontend/src/fonts/OFL.txt) |
| Material Icons | `MaterialIcons-Regular.ttf` | Copyright 2018 Google, Inc. | Apache-2.0 | [`frontend/src/fonts/LICENSE-MaterialIcons.txt`](frontend/src/fonts/LICENSE-MaterialIcons.txt) |

Both are loaded via `@font-face` in `frontend/src/index.css`. SIL OFL 1.1 permits
bundling and redistribution with software, including commercially, provided the
fonts are not sold on their own and the copyright notice and licence travel with
them — which is what `OFL.txt` is for. If you fork Juralio, keep that file next to
the font binaries.

### Icon artwork — `frontend/src/assets/images/`

A small number of Material Design Icons have been copied into the repository as
standalone SVGs rather than rendered from the `@mdi/js` package: `account-minus.svg`,
`account-minus-black.svg`, `bookmark-check.svg`, `bookmark-minus.svg`,
`clipboard-flow.svg`, `clipboard-plus.svg`, `note-multiple-outline.svg`,
`rabbit.svg`, `ic-content-copy.svg`. These are Apache-2.0, the same licence as the
`@mdi/js` package listed in the frontend table.

### Third-party brand assets — not covered by the Apache-2.0 grant

The repository also contains logos, icons and official sign-in buttons belonging to
Google, Microsoft, Okta, Atlassian, Figma and Miro (under `frontend/public/` and
`frontend/src/assets/images/`). These are trademarks of their respective owners and
are included solely to identify those services within Juralio's single sign-on and
document-linking interfaces.

**They are not licensed to you under Apache-2.0.** The Apache licence covers
Juralio's own code; it cannot and does not sublicense anyone else's brand. If you
fork or redistribute Juralio, you are responsible for obtaining these assets from
each vendor's own brand kit and for complying with their brand guidelines — Google's
sign-in button terms in particular are strict. The simplest safe route is to replace
them with unbranded buttons. See also the trademark section of [`NOTICE`](NOTICE).

---

## Notes on non-permissive / dual licences

A handful of components are not under a bare permissive (MIT / BSD / Apache)
licence. In every case they are used as **unmodified, dynamically linked
libraries**, which is compatible with distributing Juralio under Apache-2.0:

- **`hibernate-core` (Hibernate ORM 5.x) — LGPL-2.1.** No longer declared
  directly since the Grails 7 migration; it is pulled transitively by
  `grails-data-hibernate5`. The Hibernate ORM 5.x series is LGPL-2.1 and is
  consumed as an unmodified library dependency; no Hibernate source is modified
  or copied into Juralio. (Hibernate ORM 6.x relicensed to Apache-2.0, so a
  future upgrade removes this entirely.)
- **`h2` — MPL-2.0 / EPL-1.0.** Used as the in-memory database for local
  development and tests. Note that it is declared at `implementation` scope
  (`server/build.gradle`), not `testImplementation`, so the jar is on the runtime
  classpath and **is bundled into the deployable WAR** even though PostgreSQL is
  the supported production database. MPL/EPL are file-level weak copyleft; the
  unmodified jar is redistributable without affecting Juralio's own licence, but
  MPL-2.0 §3.2 expects recipients to be told where to obtain its source — it is at
  <https://github.com/h2database/h2database>.
- **`jakarta.mail-api` 2.1.3, `angus-mail` 2.0.3 — EPL-2.0 / GPL-2.0-with-classpath-exception / EDL-1.0.**
  The Jakarta Mail API and its Eclipse Angus reference implementation, replacing
  the old `javax.mail-api` since the Jakarta EE 9 namespace move. Triple-licensed;
  the GPL "classpath exception" explicitly permits linking from independently
  licensed software, and the EDL-1.0 option is a bare BSD-3-Clause permissive
  licence. Used as unmodified library jars.
- **`jakarta.xml.bind-api` — EDL-1.0.** The Jakarta XML Binding API, replacing
  the old `javax.xml.bind:jaxb-api`. EDL-1.0 is the Eclipse Distribution License,
  which is a bare BSD-3-Clause permissive licence — no copyleft obligation. (The
  previous `javax.xml.bind:jaxb-api` and `org.glassfish.web:el-impl` CDDL jars
  are no longer dependencies.)
- **`passay` 1.6.4 — Apache-2.0 OR LGPL-3.0.** Dual-licensed; used under the
  Apache-2.0 option.
- **`jszip` 3.10.1 — MIT OR GPL-3.0-or-later.** Dual-licensed; used under the MIT
  option.
- **`element-closest` 3.0.2 — CC0-1.0.** A public-domain dedication (no
  conditions).

---

_Last reviewed: 2026-08-03. Regenerate the npm tables after dependency changes; the
declared `license` field of each installed package is the source of truth._
