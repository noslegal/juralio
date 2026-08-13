# Juralio Claude Code Guide

## Project Overview

Juralio is a matter management platform. The stack is:

- **Frontend**: React (with Redux, MUI, React Router v6)
- **Backend**: Grails (Groovy), GSON views for JSON responses
- **Branch convention**: `feature/JUR-XXXXX`

## Key Architectural Notes

### Domain Model

- **Matter** → has many **Projects** (workstreams) → has many **Tasks** (levels 1–6, hierarchical subtasks)

### User Roles

Defined in `server/src/main/groovy/com/juralio/auth/Roles.groovy`:

- `ROLE_SYSADMIN`, `ROLE_ORG_ADMIN`, `ROLE_ORG_OWNER`, `ROLE_MATTER_CREATOR`, `ROLE_USER`, `ROLE_KNOWLEDGE_MANAGER`
- `ROLE_MATTER_ADMIN` is frontend-only (not a DB role — derived from matter membership)
- Frontend role checks via `frontend/src/services/user/helper/user-role-service.js` (`hasRole()`, `isOrgAdmin()`, etc.)
- Backend access control via `@Secured` annotations on controllers (Spring Security)

### Frontend Structure

- Features organised under `frontend/src/app/` by domain (e.g. `improved-taskmap/`, `matterdetail/`, `home/`)
- Shared components in `frontend/src/components/`
- Redux store at `frontend/src/store/configure-store.js`; root reducer at `frontend/src/redux/reducers/root-reducer.js`
- Feature state uses **ducks pattern** under `frontend/src/redux/ducks/` (e.g. `improved-taskmap.js`, `matter-team.js`)
- **Redux vs local state**: use Redux for server data, cross-component state, and anything that needs to survive navigation (e.g. selected task, edit mode flags, loaded lists). Use `useState` for ephemeral UI state scoped to a single component (e.g. open/closed menus, hover state, in-progress form input before save).
- **Container pattern**: complex features split into `*Container.js` (state, selectors, logic) + presentational component (pure render)
- **HOCs**:
  - `WithRouter` (`frontend/src/services/navigation/WithRouter.js`) — injects `router: { location, navigate, params }`; used for tab-switching via `location.state.tabItem`
  - `WithUser` (`frontend/src/services/with-user/WithUser.js`) — maps Redux auth state to `userData` prop
  - `WithRole` (`frontend/src/services/with-role/WithRole.js`) — role-based conditional rendering
  - `WithLoader` — loading state wrapper

### Key Shared Components

- **Dialogs**: use `JuralioDialog` (`frontend/src/components/dialog/juralio-dialog/JuralioDialog.js`) — wraps MUI Dialog with standard title/subtitle/action/cancel/loading-bar props; handles Enter to submit and Escape to cancel
- **Global overlays** (Redux-backed — dispatch from anywhere):
  - Confirmation dialog: `displayConfirmationDialog(options, action)` from `frontend/src/app/global-confirmation-dialog/global-confirmation-dialog-actions.js`
  - Snackbar: `displaySnackbar(message, action, options)` from `frontend/src/app/global-snackbar/global-snackbar-actions.js`
- **Avatars**: `UserAvatar`, `PlaceholderAvatar`, `InactiveAvatar` (size variants: `compact`, `small`, `medium`, `large`, `extraLarge`); `GroupAvatar` for org groups with logo support and `logoCache` (exported `Map`)
- **Tables**: use `JuralioTable` (`frontend/src/components/table/JuralioTable.js`) with `juralioTableOptions` base config from `frontend/src/services/helpers/table/juralio-table-helper.js`; sorting helpers in `juralio-table-sorting-helper.js`
- **Chips**: `JuralioChip`, `SimpleChip`, `LabelChip`, `TaskChip` in `frontend/src/components/data-display/`

### API Layer

- All HTTP calls go through `api()` (default export) from `frontend/src/services/helpers/fetch/fetch-helper.js`; also exports `imageApi()`, `svgApi()`, `downloadXlsx()`
- Auth headers and session tracking are handled by `fetch-wrapper.js` — do not build headers manually
- API base URL resolved by `frontend/src/services/helpers/api-helper.js` (dev vs. prod)
- Domain services (e.g. `organisationService`, `matterService`) wrap `api()` calls — prefer using these over calling `api()` directly

### Constants

- `frontend/src/app/constants.js` — centralised business logic: `TASK_STATUS`, `MATTER_STATUS`, `MATTER_TYPE`, `CONFIG` limits (`SUBTASK_LIMIT: 8`, `LEVEL_A_TASK_LIMIT: 16`), `API_ERROR_CODE`, `SSO` providers, `DATE_TYPES`
- Reference numbers are stored with a `JUR` prefix internally; use `formatReferenceNumber()` from `frontend/src/services/task/task-text-format-service.js` to strip it for display

### Code Formatting

All frontend JS files use Prettier with these settings (from `.prettierrc`):

- Single quotes
- No semicolons
- Trailing commas (ES5)
- No arrow function parens for single args

Always write JS to match this style natively — do not rely on external formatting tools.

### Styling

- Use `makeStyles()` from `tss-react/mui` for functional components; `withStyles()` for class components
- Theme defined in `frontend/src/theme/juralio-theme.js` (MUI `createTheme`)
- Colour system is layered: `raw-colours.js` → `juralio-named-colours.js` (exports `JuralioNamedColours`, `JuralioAvatarColours`) → `juralio-colours.js` (domain-specific, e.g. `taskStatus`, `darkText`, `navigation`)
- Use `JuralioNamedColours` for brand colours (e.g. `JuralioNamedColours.black[200]`); use `juralioColours` for semantic domain colours
- Do not use inline styles — always extract to `makeStyles`

### i18n

- All user-facing strings go in `frontend/public/locales/en.json` (nested by feature)
- Access via `const { t } = useTranslation()` → `t('FeatureName.key')`
- Config at `frontend/src/i18n.js` (i18next + react-i18next)

### Backend Structure

- Controllers: `server/grails-app/controllers/com/juralio/` — REST, secured with `@Secured`
- Services: `server/grails-app/services/com/juralio/`
- Domain: `server/grails-app/domain/com/juralio/`
- GSON views: `server/grails-app/views/` — use `g.render()` with `includes`/`excludes`; transient fields must be explicitly included
- URL mappings: `server/grails-app/controllers/server/UrlMappings.groovy`
- Current user: `springSecurityService.getCurrentUser()`

### E2E Tests

- Desktop UI tests: `e2e/desktop/cypress/e2e/<feature-area>/`
- Security/API tests: `e2e/security/cypress/e2e/<feature-area>/`
- Key helpers: `fixture_helper.js` (seed-based fixture builder), `matter_api_helper.js`, `user_api_helper.js`, `visit_helpers.js`
- Fixture seed shape: `{ matter: { prefix, teamMembers, matterAdmins, projects: [{ name, tasks }] } }`
- Run (interactive): `cd e2e && npm run e2e:rapid-desktop`, `npm run e2e:rapid-security`
- Run (headless): `cd e2e && ./test.sh dev localhost desktop`
- The app must already be running (frontend `:3000`, backend `:8080`)

## Dev Workflow

- Frontend: `cd frontend && npm start`
- Backend: `cd server && ./gradlew bootRun` (or run it from the IDE)
- Everything in containers: `./start.sh` — see §9 of `docs/RUNBOOK-LOCAL-SETUP.md`
- E2E: see `e2e/` directory

## General Guidelines

- Before implementing any task that has ambiguous requirements or UI/UX decisions, ask targeted follow-up questions first. Do not assume — clarify, then implement.

## Custom Commands

- `/jur-feature` — scaffold a new feature branch from the ticket number
- `/lazy-refactor` - run a command to pull text into enjson and pull styles into make styles
- `/jur-e2e` — scaffold a new **desktop** Cypress E2E test file for a ticket and feature area
- `/jur-e2e-security` — scaffold a new **security** Cypress E2E test file for a new endpoint (GET / POST-with-ownership / POST-with-role-matrix scaffolds)
- `/jur-figma` — implement a UI feature from a Figma mockup image, following Juralio conventions
- `/reset-dev-db` — wipe, rebuild and reseed the local dev database

## Hooks

<!-- Hooks are configured in .claude/settings.json -->
