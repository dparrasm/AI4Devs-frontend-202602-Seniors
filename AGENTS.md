# AGENTS.md

Operational context for AI agents contributing to this repository.

## Project Overview

LTI is a talent tracking system for recruiters. It manages candidates, CV uploads, education and work history, positions, applications, interview flows, interview steps, and candidate stage progression.

Core business flows:

- Recruiter dashboard: entry point for candidate creation and position management.
- Candidate intake: collect personal data, education, work experience, and an uploaded CV.
- CV upload: accept only PDF and DOCX files, capped at 10 MB by the backend.
- Position review: view/search/filter positions and inspect hiring process state.
- Interview pipeline: fetch candidates for a position, calculate interview average score, fetch the interview flow for a position, and update a candidate application's current interview step.

Important project references:

- API contract: `backend/api-spec.yaml`.
- Domain model notes and ERD: `backend/ModeloDatos.md`.
- Backend practice notes: `backend/ManifestoBuenasPracticas.md`.
- Prisma schema: `backend/prisma/schema.prisma`.

## Tech Stack

Frontend:

- React 18 with Create React App and `react-scripts`.
- TypeScript is enabled with `strict: true`, but the current frontend still mixes `.tsx` and `.js`.
- React Router v6 for page routing.
- React Bootstrap, Bootstrap 5, and `react-bootstrap-icons` for UI.
- `react-datepicker` for date inputs.
- Current API usage is inconsistent: components use `fetch`, while `frontend/src/services/candidateService.js` uses axios. Prefer a single typed service layer going forward.

Backend:

- Node.js, Express 4, TypeScript, Prisma 5, PostgreSQL.
- `multer` for file upload handling.
- Jest with `ts-jest` for backend tests.
- Docker Compose provides the PostgreSQL service.

Build and run:

- Frontend: `cd frontend && npm start`, `npm run build`.
- Backend: `cd backend && npm run dev`, `npm run build`, `npm test`.
- Database: `docker-compose up -d`, then Prisma generate/migrate from `backend`.

## Architecture Guidelines

The repository is split into `frontend/` and `backend/`. Keep changes inside the correct app unless a feature requires a coordinated API and UI update.

Backend structure:

- `backend/src/routes`: Express route declarations only. Keep routing thin.
- `backend/src/presentation/controllers`: HTTP concerns: parse params/body, call services, choose status codes, shape HTTP responses.
- `backend/src/application/services`: use-case orchestration and business workflow logic, such as `addCandidate`, `getCandidatesByPositionService`, and `updateCandidateStage`.
- `backend/src/application/validator.ts`: request/domain validation rules that protect persistence.
- `backend/src/domain/models`: domain entities and persistence methods backed by Prisma.
- `backend/prisma/schema.prisma`: source of truth for persisted data shape.

Preferred backend direction:

- Preserve the DDD-inspired layering, but do not amplify current leaks. New route handlers should call controllers, not services directly. `candidateRoutes.ts` currently calls `addCandidate` directly for POST while a controller exists; prefer the controller pattern for new work.
- Keep Prisma access out of controllers and frontend-facing code. Existing domain models and services instantiate Prisma directly; for new larger features, prefer a small repository/service boundary over scattering new `PrismaClient` instances.
- Keep business rules in application services or domain models. Keep HTTP status mapping in controllers.
- Update `backend/api-spec.yaml` when endpoint behavior, request shape, or response shape changes.

Frontend structure:

- `frontend/src/App.js` currently contains the real routes; `frontend/src/App.tsx` is still CRA starter code. Prefer migrating active frontend code to TypeScript rather than adding more JavaScript.
- `frontend/src/components`: current screen/components live here (`RecruiterDashboard`, `AddCandidateForm`, `FileUploader`, `Positions`). For new work, group larger features by domain when files grow, for example `features/candidates`, `features/positions`, with local components/hooks/types.
- `frontend/src/services`: API clients belong here. Components should not build endpoint URLs or parse transport errors directly.
- Styling is mostly Bootstrap utility classes and React Bootstrap props. Keep that convention unless introducing a design system intentionally.

State management expectations:

- Use local React state for form state, loading flags, filters, upload progress, and one-screen interactions.
- Use custom hooks when a screen has repeated async state or complex form behavior.
- Do not add Redux, Zustand, React Query, or another state library unless the feature has demonstrated cross-screen cache/synchronization needs.
- Keep server DTOs separate from UI view models when shapes differ.

## Frontend Engineering Standards

Component design:

- Prefer typed `.tsx` components with explicit props and local helper types.
- Keep components focused: split large forms into sections when state handling or validation becomes hard to read.
- Extract pure mapping/formatting helpers from render bodies when they are reused or non-trivial.
- Do not perform raw API calls directly inside presentational components. Use services or feature hooks.
- Avoid index-array keys for editable dynamic lists when items can be reordered or removed; use stable ids where available.

TypeScript:

- Treat `strict: true` as the expected standard.
- Avoid `any` in new frontend code. Define DTOs for `Candidate`, `Education`, `WorkExperience`, `Resume`, `Position`, `Application`, and API responses as needed.
- When touching backend code, avoid widening existing `any` usage. Add narrow request DTOs and service result types incrementally.

Accessibility:

- Use native form controls and React Bootstrap labels correctly.
- Inputs need accessible names, validation messages, and error association where practical.
- Buttons that trigger actions must have clear text or accessible labels.
- Loading spinners need accompanying text or `aria-live` status when the action is user-visible.
- Preserve keyboard operability for forms, file upload, filters, and future drag-and-drop interactions.

Responsive design:

- Current layout uses Bootstrap `Container`, `Row`, and `Col`. Continue mobile-first Bootstrap grid usage.
- Verify forms stack cleanly on small screens. Avoid fixed widths except for constrained assets like the logo.
- Cards are acceptable for dashboard actions and repeated position items, but avoid deeply nested card layouts.

Performance:

- Keep forms controlled only where the UI needs live state.
- Avoid repeated expensive mapping or date formatting in render paths for large lists.
- Do not fetch data repeatedly on every render; isolate effects and dependencies.
- Keep bundle impact in mind. Do not introduce heavy dependencies for simple formatting, validation, or state needs.

Anti-patterns to avoid:

- More mixed `.js` and `.tsx` for active frontend features.
- Hard-coded API base URLs in multiple components.
- Component-level networking duplicated across screens.
- Silent `console.error` as the only user-facing error handling.
- Backend controllers that contain persistence queries.
- Tests that assert outdated response shapes or ignore returned fields.

## API Integration Rules

Base behavior:

- Backend currently runs at `http://localhost:3010`; frontend at `http://localhost:3000`.
- Centralize API base URL configuration in the frontend service layer. Do not repeat `http://localhost:3010` across components.
- Keep API paths aligned with `backend/api-spec.yaml`.

Endpoint patterns:

- `POST /candidates`: create a candidate with `firstName`, `lastName`, `email`, optional `phone`, `address`, `educations`, `workExperiences`, and optional `cv`.
- `GET /candidates/:id`: fetch candidate detail including education, work history, resumes, and applications.
- `PUT /candidates/:id`: update a candidate application's `currentInterviewStep` using `applicationId`.
- `POST /upload`: multipart upload under field name `file`; accepts PDF and DOCX.
- `GET /position/:id/candidates`: candidates for a position with full name, current step, average score, id, and application id.
- `GET /position/:id/interviewflow`: interview flow and ordered steps for a position.

DTO mapping:

- Convert date picker `Date` objects to `YYYY-MM-DD` before sending candidate education and work experience dates. `AddCandidateForm` already does this.
- Keep backend response DTOs distinct from frontend display models. Example: map candidate first/last name into `fullName` only at a boundary or selector, not throughout UI code.
- File upload should return `{ filePath, fileType }`; candidate creation should send only those CV fields.

Errors and loading:

- Every async UI action needs loading, success, and error states.
- Prefer actionable user-visible errors over only logging to the console.
- Backend should return consistent JSON error shapes. Controllers should distinguish invalid input (`400`), not found (`404`), and unexpected server failures (`500`).
- Optimistic updates are only appropriate for low-risk UI state. For interview-stage changes, preserve previous state and roll back or refetch if the API fails.

Typing:

- Use explicit request and response types in services.
- Parse numeric route params once at the controller boundary and validate `NaN`.
- Avoid trusting `req.body` shape directly in services without validation.

## UI/UX Expectations

- Language is currently Spanish in the frontend UI. Keep new visible copy consistent unless the product direction changes.
- Candidate form flows must clearly show required fields, upload status, submission loading, success, and validation errors.
- Empty states should be explicit for no positions, no candidates, no uploaded CV, no education entries, and no work experiences.
- Loading skeletons or compact placeholders are preferred for list/table screens once real API-backed position data replaces mocks.
- Drag-and-drop, if introduced for interview stages or files, must also support keyboard and non-pointer alternatives.
- Filter controls should be usable on mobile and should not require horizontal scrolling.
- Preserve focus after submissions and validation failures; move focus to the first relevant error for complex forms where practical.

## Testing Strategy

Current state:

- Backend has Jest tests for services and controllers.
- Frontend has Testing Library dependencies but no meaningful frontend test suite.

Testing philosophy:

- Test behavior and contracts, not implementation details.
- Unit-test pure validation, mapping, and calculation logic.
- Integration-test service/controller boundaries where HTTP status and response shape matter.
- Frontend tests should use React Testing Library and `user-event` for user flows.
- Prefer MSW for frontend API mocking once API-backed screens are tested; do not mock `fetch` ad hoc in every test.

Backend expectations:

- Services: test success, validation failures, not-found cases, Prisma uniqueness errors such as duplicate candidate email, and average-score calculations.
- Controllers: test param parsing, status codes, and response JSON for success and error branches.
- File upload: test allowed MIME types, rejected types, and size/error behavior when practical.
- Keep Prisma mocking aligned with the actual methods used. Existing tests mock some methods that do not match current model internals; fix tests when changing those paths.

Frontend expectations:

- Candidate creation should test required fields, adding/removing education and work experience rows, date conversion, upload success/failure, and submit success/failure.
- Position screens should test filtering, empty states, and rendered status labels.
- Routing should test dashboard navigation to candidate and position screens.
- Accessibility checks should cover labels, button names, alerts, focus behavior, and keyboard navigation for interactive flows.

What should always be tested:

- Any new endpoint or changed endpoint contract.
- Any business rule in candidate validation or interview stage progression.
- Any non-trivial DTO mapping between frontend and backend.
- Any regression-prone form behavior, especially dynamic arrays and file upload.

## Code Review Checklist

Readability:

- Names reflect recruiting domain concepts: candidate, position, application, interview flow, interview step.
- Code is simple enough to modify without tracing unrelated layers.
- Complex transformations are named and tested.

Simplicity:

- No new dependency unless it removes meaningful complexity.
- Local state is used before global state.
- Refactors are incremental and scoped to the feature.

Accessibility:

- Form fields have labels and useful validation feedback.
- Buttons and icons have accessible names.
- Loading and error states are perceivable.
- Keyboard-only users can complete the workflow.

Performance:

- Effects have correct dependencies.
- Network calls are not duplicated unnecessarily.
- Large lists are not recalculated in render without need.
- Bundle size impact is considered for new packages.

Architecture consistency:

- Frontend API access goes through services/hooks, not scattered component fetches.
- Backend routes are thin, controllers map HTTP concerns, services own use cases, domain/persistence stays below services.
- API spec, DTO types, and implementation stay synchronized.
- TypeScript is not weakened with new `any` or disabled checks.

Test quality:

- Tests cover user-visible behavior and API contracts.
- Mocks match real boundaries.
- Failure and empty states are covered, not only happy paths.
- Assertions include important returned fields such as ids and application ids.

## Definition of Done

A production-quality feature in this repository means:

- The feature matches the recruiting workflow and preserves existing domain language.
- UI works on mobile and desktop, with accessible labels, keyboard behavior, loading states, empty states, and user-visible errors.
- API usage is centralized in typed services or hooks.
- Backend changes respect route/controller/service/domain separation.
- Data is validated at the backend boundary and typed at the frontend boundary.
- `backend/api-spec.yaml` and relevant docs are updated for contract changes.
- Relevant unit/integration/frontend tests are added or updated.
- `cd backend && npm test` passes for backend-impacting work.
- `cd backend && npm run build` passes for backend-impacting work.
- `cd frontend && npm run build` passes for frontend-impacting work.
- No unrelated formatting churn, broad rewrites, or unnecessary dependencies are introduced.

## AI Agent Rules

- Inspect the existing code before editing. This repo has inconsistencies that should be corrected deliberately, not copied blindly.
- Prefer incremental improvements over large architecture rewrites.
- Preserve the full-stack split and backend layering.
- Move active frontend work toward TypeScript, typed DTOs, and centralized API services.
- Do not add a state management library, data-fetching library, CSS framework, or validation library without explaining why the current stack is insufficient.
- Do not introduce hard-coded API URLs in new components.
- Keep Bootstrap/React Bootstrap conventions unless there is a clear reason to change the UI approach.
- Avoid over-engineering repository/factory abstractions for small changes, but do not scatter new Prisma calls across controllers.
- Explain major architectural decisions before implementing them when they affect folder structure, API contracts, persistence, or shared UI patterns.
- Keep changes small, readable, and testable. Maintainability matters more than cleverness.
