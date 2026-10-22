# MiniLedger --- Implementation Plan

> **Purpose:** This document is the source of truth for building
> MiniLedger with an AI coding agent such as Antigravity. Implement the
> project incrementally, verify each phase, and keep the code
> understandable enough to explain in an internship interview.

## 1. Project overview

**MiniLedger** is a mobile app for tracking money lent to friends. A
user signs in with a phone number and a mock OTP, records loans, marks
loans as repaid, and sees a summary of their lending activity.

### Assignment requirements

-   Phone-number login with a mock six-digit OTP printed **only in the
    backend terminal**.
-   Backend built with Node.js, TypeScript, and Express.
-   PostgreSQL hosted by Supabase.
-   Prisma ORM for database access and migrations.
-   APIs to create a loan, list loans, mark a loan as repaid, and return
    a summary.
-   React Native app with login, OTP verification, loan list, overdue
    highlighting, add-loan form, and summary card.
-   GitHub repository with a useful README.
-   A 2--3 minute screen recording showing the app working.

### Optional bonus

-   Upload a receipt photo to a loan.
-   Input validation and automated tests.

### Scope decisions

-   Use **Supabase as the hosted PostgreSQL provider**, not Supabase
    Auth.
-   Use **Prisma ORM** in the Express backend. Do not use
    `@supabase/supabase-js` for normal database operations in this MVP.
-   Do **not** use Nodemailer or SMS delivery. The mock OTP is printed
    in the backend terminal, as specified in the assignment.
-   The mobile app talks to the Express API only. It must never connect
    directly to PostgreSQL.
-   Complete all required flows before attempting receipt uploads or
    decorative animations.
-   Use all-or-nothing repayment for the MVP. Partial repayments,
    editing loans, deleting loans, contacts integration, and push
    notifications are out of scope unless all required work is complete.

## 2. Product and design direction

Create a polished, premium fintech-style app rather than a generic CRUD
demo.

### Visual direction

-   **Theme:** modern light theme.
-   **Background:** warm off-white / very light neutral.
-   **Primary text:** deep navy / charcoal.
-   **Accent:** emerald green for positive financial states and primary
    actions.
-   **Warning:** amber for due-soon states.
-   **Overdue:** restrained red/coral with an explicit `OVERDUE` label;
    do not rely on color alone.
-   **Cards:** white surfaces, subtle borders, restrained shadows,
    consistent rounded corners.
-   **Typography:** clear hierarchy, large financial totals, readable
    labels, consistent weights.
-   **Spacing:** use a consistent spacing scale; avoid crowded screens.
-   **Icons:** use a consistent icon set such as Lucide where compatible
    with Expo.
-   **Motion:** subtle transitions only. Do not sacrifice responsiveness
    or accessibility for animation.
-   **Currency:** display Indian Rupees (`₹`) with Indian number
    grouping.
-   **Dates:** human-readable dates in the UI; ISO `YYYY-MM-DD` in API
    payloads.

The UI should feel calm, trustworthy, and easy to scan. Avoid excessive
gradients, too many colors, tiny grey text, and unnecessary decoration.

### Design system

Create shared tokens instead of hard-coding styling in every screen.

Suggested tokens:

-   `colors.background`
-   `colors.surface`
-   `colors.text`
-   `colors.textSecondary`
-   `colors.primary`
-   `colors.success`
-   `colors.warning`
-   `colors.danger`
-   `colors.border`
-   `spacing.xs/sm/md/lg/xl`
-   `radius.sm/md/lg/xl`
-   typography styles for `screenTitle`, `sectionTitle`, `body`,
    `caption`, and `money`

Build reusable components such as `Button`, `TextField`, `SummaryCard`,
`LoanCard`, `StatusBadge`, `ScreenContainer`, `LoadingState`,
`ErrorState`, and `EmptyState`.

### Required screens

1.  **Phone Login**
    -   MiniLedger brand mark/name and a short value proposition.
    -   Phone input with country code support (default India, `+91`).
    -   Primary "Send OTP" button.
    -   Helpful validation and loading states.
    -   Small note: "Demo login: your OTP appears in the backend
        terminal."
2.  **OTP Verification**
    -   Masked/partially displayed phone number.
    -   Six-digit OTP input.
    -   Verify button, edit-phone action, and clear error messages.
    -   Show a resend action only if its cooldown/rate-limit behavior is
        implemented.
3.  **Home / Dashboard**
    -   Greeting/header and a clear "Add loan" action.
    -   Summary area with **Total Lent**, **Total Repaid**, and
        **Overdue**.
    -   Overdue summary should be visually prominent without dominating
        the screen.
    -   Loan list with name, amount, due date, and status.
    -   Pending overdue loans must display an `OVERDUE` badge and an
        accessible visual distinction.
    -   Empty state with a clear first-loan action.
    -   Optional filter chips: All, Pending, Repaid, Overdue, if time
        permits.
4.  **Add Loan**
    -   Friend name.
    -   Amount in INR.
    -   Due-date picker.
    -   Save and Cancel actions.
    -   Inline validation and submission feedback.
    -   Optional receipt picker only after the core MVP works.
5.  **Optional Loan Detail**
    -   Only build if useful after the core screens are complete.
    -   Show loan details, receipt, and repayment action.

### UI interaction requirements

-   Every button must perform a real action.
-   Show loading states during API calls and prevent accidental
    duplicate submissions.
-   Display actionable error messages; do not silently fail.
-   Preserve form values after a failed network request.
-   Refresh loan entries and summary after adding or repaying a loan.
-   Support keyboard avoidance, safe areas, small devices, and long
    friend names.
-   Ensure adequate contrast and accessible touch targets.
-   Do not ship placeholder buttons or pretend-success states.

## 3. Technology stack

### Mobile

-   React Native with Expo.
-   TypeScript preferred for typed API contracts.
-   Expo Router **or** React Navigation; choose one routing approach and
    use it consistently.
-   Fetch API or a small HTTP client wrapper.
-   Expo SecureStore if persisting the JWT across launches; otherwise
    clearly document session behavior.
-   A date picker compatible with the chosen Expo SDK.
-   An icon library compatible with Expo.

### Backend

-   Node.js + TypeScript.
-   Express.
-   Prisma ORM (use a current, mutually compatible Prisma version and
    follow that version's setup instructions).
-   Supabase PostgreSQL.
-   Zod for request validation.
-   JWT for the app's custom mock-OTP session.
-   `dotenv` for local environment configuration.
-   `express-rate-limit` or equivalent lightweight rate limiting for OTP
    requests and verification attempts.
-   Vitest or Jest with Supertest for automated API tests; choose one
    test stack.

### Prisma/PostgreSQL connection

Use Prisma as the only normal application database layer. With current
Prisma versions that require a PostgreSQL driver adapter, configure the
PostgreSQL adapter (for example, `@prisma/adapter-pg` with `pg`) and
follow the official documentation for the selected version.

Supabase connection guidance:

-   Store the Supabase PostgreSQL connection URL in the backend
    environment only.
-   Use a pooled connection URL for the running app where appropriate.
-   Use the connection mode recommended by Supabase/Prisma for schema
    migrations and your runtime.
-   Keep connection strings, JWT secrets, and any service credentials
    out of source control and out of the mobile bundle.
-   Do not use a Supabase service-role key in the mobile app.

## 4. Repository structure

Use a clear monorepo structure:

``` text
miniledger/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma
│   │   └── migrations/
│   ├── src/
│   │   ├── config/
│   │   ├── lib/
│   │   │   └── prisma.ts
│   │   ├── middleware/
│   │   │   ├── auth.middleware.ts
│   │   │   ├── error.middleware.ts
│   │   │   └── validate.middleware.ts
│   │   ├── modules/
│   │   │   ├── auth/
│   │   │   │   ├── auth.routes.ts
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.schemas.ts
│   │   │   ├── loans/
│   │   │   │   ├── loans.routes.ts
│   │   │   │   ├── loans.controller.ts
│   │   │   │   ├── loans.service.ts
│   │   │   │   └── loans.schemas.ts
│   │   │   └── summary/
│   │   │       ├── summary.routes.ts
│   │   │       └── summary.service.ts
│   │   ├── app.ts
│   │   └── server.ts
│   ├── tests/
│   ├── .env.example
│   ├── prisma.config.ts
│   ├── package.json
│   └── tsconfig.json
├── mobile/
│   ├── app/ or src/
│   │   ├── screens/
│   │   ├── components/
│   │   ├── navigation/
│   │   ├── api/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── theme/
│   │   ├── types/
│   │   └── utils/
│   ├── assets/
│   ├── app.json
│   └── package.json
├── docs/
│   └── screenshots/
├── IMPLEMENTATION_PLAN.md
├── README.md
└── .gitignore
```

Keep controllers thin. Controllers handle HTTP input/output; services
contain business logic; Prisma access stays in service/repository
functions. Do not put all backend code in one file.

## 5. Database design

Create three core models: `User`, `OtpChallenge`, and `Loan`.

### User

-   `id`: UUID primary key.
-   `phone`: unique normalized phone number.
-   `createdAt`: timestamp.
-   Relation to loans.

### OtpChallenge

-   `id`: UUID primary key.
-   `phone`: normalized phone number.
-   `otpHash`: hashed OTP, never the plaintext OTP.
-   `expiresAt`: short expiry, approximately five minutes.
-   `consumedAt`: nullable timestamp set after successful verification.
-   `createdAt`: timestamp.
-   Index by phone and creation time.
-   Keep OTP challenges associated with phone numbers rather than
    requiring a user record first, because a new user may not exist
    until verification succeeds.

### Loan

-   `id`: UUID primary key.
-   `userId`: foreign key to `User`.
-   `friendName`: required string, maximum 100 characters.
-   `amount`: PostgreSQL `NUMERIC(12,2)` / Prisma `Decimal`.
-   `dueDate`: PostgreSQL `DATE`.
-   `status`: `PENDING` or `REPAID`; default `PENDING`.
-   `repaidAt`: nullable timestamp.
-   `createdAt` and `updatedAt`.
-   Optional `receiptPath` only if receipt uploads are implemented.
-   Indexes on `(userId, dueDate)` and `(userId, status)`.

### Database constraints and invariants

-   Phone number must be unique after normalization.
-   Amount must be greater than zero.
-   Loan status must be one of the defined statuses.
-   A repaid loan has `repaidAt`; a pending loan has `repaidAt = null`.
-   Every loan belongs to exactly one user.
-   All loan reads and writes must be scoped to the authenticated user's
    ID.
-   OTP challenges must expire and must not be reusable.
-   Add database-level constraints through supported SQL migrations
    where Prisma schema syntax does not express the full invariant.
-   Do not manually edit production data to make the demo appear
    correct.

### Prisma migrations

-   Define the models in `backend/prisma/schema.prisma`.
-   Use the configuration format required by the chosen Prisma version.
-   Generate migrations in development and commit the migration files.
-   Apply committed migrations to deployment environments using the
    documented deployment migration command.
-   If the Supabase database already contains tables, inspect and
    reconcile its schema before running an initial migration. Do not
    blindly create duplicate tables.

## 6. Authentication flow: phone + terminal-only mock OTP

No email or SMS delivery is part of the project.

### `POST /api/auth/request-otp`

Request:

``` json
{
  "phone": "+919876543210"
}
```

Backend behavior:

1.  Validate and normalize the phone number.
2.  Apply request rate limiting/cooldown.
3.  Generate a cryptographically random six-digit OTP.
4.  Hash the OTP before storing it in `OtpChallenge`.
5.  Set expiry to approximately five minutes.
6.  Print the plaintext OTP in the backend terminal only,
    e.g. `Mock OTP for +919876543210: 123456`.
7.  Never include the OTP in the HTTP response.

Example response:

``` json
{
  "message": "OTP generated. Check the backend terminal for this demo."
}
```

### `POST /api/auth/verify-otp`

Request:

``` json
{
  "phone": "+919876543210",
  "otp": "123456"
}
```

Backend behavior:

1.  Validate phone and OTP format.
2.  Find the latest eligible, unexpired, unconsumed challenge.
3.  Compare the submitted OTP with the stored hash using an appropriate
    verification method.
4.  Reject invalid, expired, or consumed challenges.
5.  Mark the challenge consumed. Use a transaction or conditional update
    so concurrent verification requests cannot reuse it.
6.  Find or create the user.
7.  Issue a signed JWT with the user ID as the subject and a configured
    expiry.
8.  Return the token and minimal user information.

Response:

``` json
{
  "token": "<jwt>",
  "user": {
    "id": "<uuid>",
    "phone": "+919876543210"
  }
}
```

### Authentication rules

-   Protected routes require `Authorization: Bearer <token>`.
-   Verify token signature and expiry on every protected request.
-   Derive `userId` from the verified token; never trust a `userId` sent
    by the client.
-   Store the JWT secret in the backend environment.
-   Do not log JWTs, OTP hashes, secrets, or authorization headers.
-   Rate-limit OTP requests and verification attempts.
-   In the README, clearly state that terminal-only OTP is a
    development/demo mechanism, not production phone authentication.

## 7. REST API contract

Prefix all API routes with `/api`. Return JSON consistently. Use
centralized error middleware.

### Authentication routes

  Method   Route                     Auth   Purpose
  -------- ------------------------- ------ ---------------------------
  POST     `/api/auth/request-otp`   No     Generate and log mock OTP
  POST     `/api/auth/verify-otp`    No     Verify OTP and return JWT

### Loan routes

All routes below require a valid bearer token.

#### `POST /api/loans`

Request:

``` json
{
  "friendName": "Aman",
  "amount": "1500.00",
  "dueDate": "2026-11-15"
}
```

-   Validate trimmed friend name, positive decimal amount, and valid ISO
    date.
-   Create the loan for the authenticated user.
-   Return `201 Created`.

#### `GET /api/loans`

-   Return only the authenticated user's entries.
-   Use a deterministic ordering, such as newest first.
-   Return the fields needed for each loan card.
-   Consider server-side filtering only if it remains simple.

#### `PATCH /api/loans/:id/repay`

-   Find a pending loan by both loan ID and authenticated user ID.
-   Mark it `REPAID` and set `repaidAt`.
-   Reject repeated repayment with a documented conflict response.
-   Never allow a user to update another user's loan.

### Summary route

#### `GET /api/summary`

Example response:

``` json
{
  "totalLent": "8500.00",
  "totalRepaid": "2500.00",
  "overdueAmount": "1000.00",
  "currency": "INR"
}
```

Business rules:

-   **Total lent:** sum of the original amounts of all the user's loans,
    regardless of status.
-   **Total repaid:** sum of amounts for loans with status `REPAID`.
-   **Overdue amount:** sum of loans with status `PENDING` and `dueDate`
    strictly earlier than today's date.
-   A loan due today is not overdue.
-   Repaid loans are never overdue.
-   Return `"0.00"` for empty aggregates.
-   Use Prisma `aggregate` / `Decimal` values or a parameterized raw SQL
    aggregate. Do not use JavaScript floating-point arithmetic for
    money.
-   Keep one consistent date/time policy between the backend, database,
    and app.

### Error response format

``` json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Amount must be greater than zero."
  }
}
```

Use appropriate status codes:

-   `400` --- malformed or invalid input.
-   `401` --- missing/invalid JWT or invalid OTP.
-   `404` --- resource not found within the user's scope.
-   `409` --- invalid state transition, such as already repaid.
-   `429` --- rate limit exceeded.
-   `500` --- unexpected server error.

Do not expose stack traces or database connection details to clients.

## 8. Input validation

Validate data at the API boundary with Zod or a similar schema
validator. Client-side validation improves usability but does not
replace backend validation.

-   Phone: normalized, plausible international format; avoid overly
    restrictive assumptions about all country formats.
-   OTP: exactly six digits.
-   Friend name: required, trimmed, 1--100 characters.
-   Amount: positive decimal, maximum two fractional digits, within the
    database range.
-   Due date: real calendar date in `YYYY-MM-DD` format.
-   Loan ID: valid UUID.
-   Reject unexpected payload shapes where practical.
-   Avoid parsing monetary amounts into floating-point values for
    calculations.

## 9. Mobile app behavior and data flow

### API client

Create one reusable API module that:

-   Reads the base URL from app configuration.
-   Attaches the bearer token for protected endpoints.
-   Handles JSON and non-2xx responses consistently.
-   Handles network failures and timeouts.
-   Exposes typed request/response shapes.
-   Never contains database credentials.
-   Does not claim success until the API responds successfully.

For a physical device, use the development machine's reachable LAN IP or
a deployed API URL; `localhost` on a phone refers to the phone itself.
Configure Android emulator and physical-device URLs appropriately.

### Authentication state

-   Before login: show phone-login flow.
-   After successful OTP verification: store the token in app state and,
    if implementing persistent sessions, Expo SecureStore.
-   On sign out: clear the stored token and reset navigation.
-   If a protected API returns `401`, clear the invalid session and send
    the user back to login.
-   Do not log tokens in the mobile console.

### Dashboard data

-   Fetch summary and loans when the dashboard becomes active.
-   Refresh both after a successful create or repayment action.
-   Display loading, error, retry, and empty states.
-   Prevent repeated submission while an operation is in progress.
-   Sort and filter predictably.
-   For overdue display, compare calendar dates consistently and use the
    same definition as the backend.

## 10. Optional receipt upload

Only implement after all required features are stable.

-   Add an authenticated endpoint such as `POST /api/loans/:id/receipt`.
-   Confirm the loan belongs to the authenticated user.
-   Accept only supported image formats and enforce a file-size limit.
-   Generate a safe server-side filename; never trust the client's path
    or original filename.
-   Store the image in appropriate object storage for a deployed app;
    local file storage is acceptable only for a local demo with that
    limitation documented.
-   Store a storage key/path in the loan record.
-   Display a thumbnail or "View receipt" action.
-   Do not store image bytes in a text field.

## 11. Implementation phases for Antigravity

**Important instructions for the coding agent:** do not attempt to
generate the entire project in one uncontrolled step. Inspect existing
files first, preserve useful work, implement one phase at a time, run
checks, and report exactly what passed and what remains. Do not silently
skip failed commands. Do not invent environment variables, API success,
or credentials. Ask the developer to configure secrets locally.

### Phase 0 --- Inspect and plan

-   Inspect the current repository and available tools.
-   Identify whether the backend/mobile directories already exist.
-   Avoid overwriting existing configuration without checking it.
-   Create or update this plan and a concise task checklist.
-   Confirm the chosen Expo SDK and Prisma version compatibility before
    installing packages.

**Exit criteria:** repository structure and implementation steps are
understood; no secrets are added.

### Phase 1 --- Scaffold backend and mobile

-   Initialize or verify backend TypeScript + Express.
-   Initialize or verify Expo React Native app with TypeScript.
-   Add formatting/lint scripts if feasible.
-   Create `.gitignore` and `.env.example`.
-   Add a backend health endpoint.
-   Add app configuration for API base URL.

**Exit criteria:** backend starts, health endpoint responds, and the
mobile app opens on a simulator/device.

### Phase 2 --- Supabase + Prisma

-   Create/verify Supabase PostgreSQL project.
-   Configure `DATABASE_URL` and the migration connection setting
    required by the selected Prisma version.
-   Define `User`, `OtpChallenge`, `Loan`, and `LoanStatus`.
-   Configure the Prisma PostgreSQL adapter if required by the chosen
    version.
-   Generate and apply initial migrations in the intended development
    database.
-   Create one reusable Prisma client module.
-   Test a database connection and verify migrations are committed.

**Exit criteria:** Prisma can query the Supabase database, and the
schema is reproducible from committed migrations.

### Phase 3 --- Authentication backend

-   Implement request-OTP and verify-OTP services/routes.
-   Implement OTP hashing, expiry, single use, and rate limits.
-   Implement JWT signing and authentication middleware.
-   Add tests for valid, invalid, expired, and reused OTPs.
-   Verify the OTP appears only in backend logs.

**Exit criteria:** user can request a mock OTP, read it from the
terminal, verify it, and receive a JWT.

### Phase 4 --- Loans and summary backend

-   Implement create/list/repay routes.
-   Implement user-scoped queries.
-   Implement summary calculations with Prisma Decimal-safe aggregation.
-   Add centralized error handling.
-   Test validation, ownership, status transitions, and due-date edge
    cases.

**Exit criteria:** all required endpoints work in an API client and have
meaningful tests.

### Phase 5 --- Design system and UI foundation

-   Establish theme tokens and reusable components.
-   Set up navigation and authentication state.
-   Build the polished phone-login and OTP screens first.
-   Ensure responsive layout, safe areas, keyboard handling, and
    accessibility.
-   Avoid placeholder functionality.

**Exit criteria:** login screens look consistent and work with the
authentication API.

### Phase 6 --- Dashboard and loan flow

-   Build summary cards and loan list.
-   Add clear status badges and overdue highlighting.
-   Build the Add Loan form with validation and date picker.
-   Implement Mark Repaid.
-   Connect all screens to the backend.
-   Refresh the list and summary after mutations.
-   Add loading, error, retry, and empty states.

**Exit criteria:** the full required mobile flow works end-to-end
against Supabase.

### Phase 7 --- Quality and optional bonus

-   Run backend tests and lint/type checks.
-   Manually test the app on a device/emulator.
-   Fix edge cases and layout issues.
-   Implement receipt uploads only if time remains.
-   Confirm no secrets or personal data are committed.

**Exit criteria:** all core acceptance criteria pass; optional features
do not destabilize the MVP.

### Phase 8 --- Documentation and submission

-   Write a clean README with setup steps.
-   Verify instructions from a fresh clone where practical.
-   Add screenshots.
-   Record the 2--3 minute demo.
-   Push the final branch and verify GitHub access.
-   Include the recording link in the README or submission message.

**Exit criteria:** evaluator can understand, run, and demo the project.

## 12. Testing strategy

### Backend automated tests

-   OTP request validates phone and does not return the OTP.
-   OTP is logged in the backend demo flow.
-   Correct OTP succeeds; incorrect, expired, and consumed OTPs fail.
-   JWT middleware rejects missing, malformed, and expired tokens.
-   Creating a loan with valid values succeeds.
-   Missing name, invalid date, zero/negative amount, and excess decimal
    precision are rejected.
-   Loan list returns only the current user's records.
-   A user cannot repay another user's loan.
-   Pending loan can be marked repaid.
-   Repeated repayment has a defined response.
-   Empty summary returns zero values.
-   Pending overdue loans count toward overdue amount.
-   Loans due today are not overdue.
-   Repaid loans do not count as overdue.
-   Totals update correctly after repayment.
-   Errors do not leak secrets or stack traces.

Use an isolated test database or a safe test schema. Do not run
destructive tests against real personal or production data.

### Mobile manual test checklist

-   [ ] Phone validation works.
-   [ ] OTP verification success and failure states work.
-   [ ] Dashboard loads summary and entries.
-   [ ] Empty state is useful.
-   [ ] Add loan succeeds and refreshes dashboard.
-   [ ] Invalid amount/date/name show clear inline errors.
-   [ ] Overdue loan is highlighted and labelled.
-   [ ] Mark Repaid updates the entry and summary.
-   [ ] Network failure shows retry feedback.
-   [ ] Keyboard does not obscure form actions.
-   [ ] Small-screen layout remains usable.
-   [ ] App handles invalid/expired JWT.
-   [ ] No OTP/token/database secret appears in the app UI or logs.

## 13. README checklist

The README must include:

1.  Project description and feature list.
2.  Screenshots of login, dashboard, and add-loan form.
3.  Architecture diagram or concise request flow.
4.  Technology stack.
5.  Prerequisites (Node.js version, package manager, Supabase project,
    Expo).
6.  Installation instructions for backend and mobile.
7.  Supabase setup and migration commands.
8.  `.env.example` explanation and required variables.
9.  How to run the backend and mobile app.
10. How to test from an emulator or physical device.
11. API route summary and example requests.
12. Test and lint commands.
13. Demo OTP instructions (printed in backend terminal; never sent by
    SMS/email).
14. Known limitations: mock authentication, all-or-nothing repayment,
    and any unimplemented bonus.
15. 2--3 minute screen recording link.

Never commit real `.env` files, database passwords, JWT secrets,
service-role keys, real receipts, or personal loan data.

## 14. Demo recording plan (2--3 minutes)

Aim for approximately 2 minutes 30 seconds.

  -------------------------------------------------------------------------
  Time                    Demonstration             Talking points
  ----------------------- ------------------------- -----------------------
  0:00--0:15              Introduce MiniLedger and  React Native, Express,
                          stack                     Prisma, Supabase
                                                    PostgreSQL

  0:15--0:35              Request OTP and show      OTP is mocked and
                          backend terminal          printed server-side

  0:35--0:55              Verify OTP and open       Authenticated API
                          dashboard                 access and summary

  0:55--1:20              Add a loan                Form validation and
                                                    persistence

  1:20--1:45              Show overdue entry        Due-date rule and
                                                    overdue indicator

  1:45--2:05              Mark a loan repaid        Status update and
                                                    refreshed totals

  2:05--2:30              Show                      Setup reproducibility
                          README/tests/repository   and quality checks
  -------------------------------------------------------------------------

Prepare sample data before recording. Ensure an overdue entry exists.
Keep secrets and real personal information off-screen.

## 15. Git workflow

Make small, meaningful commits, for example:

1.  `chore: scaffold backend and expo app`
2.  `feat: configure prisma and supabase database`
3.  `feat: implement terminal mock otp authentication`
4.  `feat: add loan create list and repay APIs`
5.  `feat: calculate loan summary`
6.  `test: cover auth loans and summary`
7.  `feat: build mini-ledger design system and auth screens`
8.  `feat: build dashboard and loan entry form`
9.  `fix: handle overdue dates and api errors`
10. `docs: add setup guide and demo link`

## 16. Definition of done

-   [ ] Backend uses Express + TypeScript.
-   [ ] Supabase PostgreSQL is connected through Prisma.
-   [ ] Database schema and migrations are committed.
-   [ ] Phone-number mock OTP is printed only in backend terminal.
-   [ ] OTP expires, is single-use, and is never returned by the API.
-   [ ] JWT protects loan and summary endpoints.
-   [ ] User can create and list their own loans.
-   [ ] User can mark a pending loan as repaid.
-   [ ] Summary values match the defined business rules.
-   [ ] Mobile UI has a polished, consistent visual design.
-   [ ] Overdue loans are clearly highlighted and labelled.
-   [ ] Add-loan form validates inputs.
-   [ ] Loading, empty, error, and success states work.
-   [ ] Core automated tests pass.
-   [ ] README has setup instructions and demo link.
-   [ ] No secrets are committed.
-   [ ] 2--3 minute recording is ready.

## 17. Interview preparation

Be able to explain:

-   Why Supabase is the database host and Prisma is the ORM.
-   How Prisma schema and migrations map to PostgreSQL tables.
-   Why money uses `Decimal`/`NUMERIC` instead of floating-point.
-   How OTP hashing, expiry, and single use work.
-   How JWT middleware identifies the current user.
-   How user-scoped database queries prevent cross-user access.
-   How the summary is calculated and why a loan due today is not
    overdue.
-   How client validation differs from server validation.
-   How the UI refreshes after a loan is created or repaid.
-   What would change for real SMS OTP, partial repayments, production
    file storage, and deployment.

**Build priority:** required functionality → correctness and security →
attractive UI polish → tests/documentation → receipt-upload bonus. A
smaller, reliable app that you can explain is better than a visually
impressive app with incomplete backend behavior.
