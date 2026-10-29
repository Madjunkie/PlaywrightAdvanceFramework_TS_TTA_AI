# AdvancePlaywrightFramework3x

A beginner-friendly Playwright + TypeScript automation framework built around the **TTACart** demo storefront (`https://app.thetestingacademy.com`).

It currently automates **Web UI (E2E) testing**. API automation is planned and will be added inside `src/api/` later — that folder is intentionally empty for now.

---

## 1. Tech Stack

| Layer | Tool |
|---|---|
| Test runner | Playwright Test |
| Language | TypeScript (strict mode) |
| Test data | Faker, JSON, YAML, CSV, Excel, MySQL |
| Logging | Winston |
| Reporting | Playwright HTML + a **custom TTA HTML report** |
| Config | dotenv (`.env`) |

---

## 2. Framework Architecture Hierarchy

Read it top to bottom — this is also the order things happen at runtime.

```
                    ┌─────────────────────────────┐
                    │   playwright.config.ts      │   ← global setup:
                    │   (browser, baseURL,        │     browsers, screenshots,
                    │    reporters, retries)      │     video, trace, reporters
                    └──────────────┬──────────────┘
                                   │
                    ┌──────────────▼──────────────┐
                    │     src/tests/*.spec.ts     │   ← WHAT to verify (test scripts)
                    │  (@P0 @Regression tags)     │
                    └──────────────┬──────────────┘
                                   │  asks for pages instead of building them
                    ┌──────────────▼──────────────┐
                    │  src/fixtures/test-base.ts  │   ← dependency injection layer:
                    │  loginPage, cartPage,       │     hands over ready-made page
                    │  validLogin, loginWithInventory │  objects + login states
                    └──────────────┬──────────────┘
                                   │  creates
                    ┌──────────────▼──────────────┐
                    │      src/pages/*Page.ts     │   ← HOW to interact with a page
                    │      (Page Object Model)    │     (locators + actions + asserts)
                    └──────────────┬──────────────┘
                                   │  extends
                    ┌──────────────▼──────────────┐
                    │      src/pages/BasePage.ts  │   ← shared scaffold for every page:
                    │  page │ el │ log │ goto()   │     Page, UtilElementLocator, Logger
                    └──────────────┬──────────────┘
                                   │  uses
                    ┌──────────────▼──────────────┐
                    │ src/utils/UtilElementLocator│   ← reusable action wrappers:
                    │  click / fill / getText /   │     timeouts, waits, logging
                    │  waitForVisible / ...       │
                    └──────────────┬──────────────┘
                                   │  drives
                    ┌──────────────▼──────────────┐
                    │      Playwright Page        │   ← real browser (Chromium)
                    └──────────────┬──────────────┘
                                   │  results flow into
                    ┌──────────────▼──────────────┐
                    │  src/utils/CustomReporter   │   ← tta-report/index.html
                    │  + screenshots, video, trace│     + reports/runs/*.json history
                    └─────────────────────────────┘
```

Supporting layers used by everything above:

```
src/config/    → .env values (env.ts) and shared credentials (credentials.ts)
src/testdata/  → static test data (logintestdata.json, ...)
src/utils/     → loggers, data readers (CSV/Excel/YAML/MySQL), Faker generators,
                 visualStep helpers, custom reporter
src/ai/        → optional AI helpers (RCA agent, flaky analyzer) used by the reporter
src/api/       → (empty) reserved for the upcoming API automation layer
```

---

## 3. Folder Structure

```
AdvancePlaywrightFramework3x/
│
├── playwright.config.ts        # Runner config: testDir, baseURL, projects, reporters, media
├── tsconfig.json               # TypeScript config + @-prefixed path aliases
├── .env / .env.example         # Environment values (never commit real secrets)
│
├── src/
│   ├── tests/                  # SPEC FILES — the actual test cases
│   │   ├── login.spec.ts               # simple POM usage example
│   │   └── e2e/
│   │       ├── e2e-checkout.spec.ts            # full checkout flow
│   │       └── e2e-with-visualstep.spec.ts     # same flow, screenshot per step
│   │
│   ├── fixtures/
│   │   ├── test-base.ts        # custom `test` — injects page objects + login states
│   │   └── practice-fixture.ts # scratchpad for fixture practice
│   │
│   ├── pages/                  # PAGE OBJECTS — one class per screen
│   │   ├── BasePage.ts         # shared: page, el, log, goto()
│   │   ├── LoginPage.ts
│   │   ├── InventoryPage.ts
│   │   ├── ItemDetailPage.ts
│   │   ├── CartPage.ts
│   │   ├── CheckoutStepOnePage.ts
│   │   ├── CheckoutStepTwoPage.ts
│   │   └── CheckoutCompletePage.ts
│   │
│   ├── config/
│   │   ├── env.ts              # requireEnv / envOr / assertEnv helpers over .env
│   │   └── credentials.ts      # standardUser + password (env override capable)
│   │
│   ├── testdata/
│   │   └── logintestdata.json  # users: standard_user, locked_out_user, problem_user, ...
│   │
│   ├── utils/
│   │   ├── UtilElementLocator.ts   # click / fill / hover / getText / waits / selects
│   │   ├── logger.ts               # Winston logger, scoped per class, logs/combined.log
│   │   ├── CustomReporter.ts       # TTA HTML report generator (see §5)
│   │   ├── visualSteps.ts          # visualStep() — test.step + screenshot
│   │   ├── stepScreenshot.ts       # shot() — manual screenshot for a specific step
│   │   ├── selfHeal.ts             # shape of the self-healing locator report
│   │   ├── DataGenerators.ts       # Faker-backed random data (users, checkout info)
│   │   ├── csvReader.ts            # readCSV()
│   │   ├── excelReader.ts          # readExcel()
│   │   ├── yamlReader.ts           # readYAML()
│   │   └── dbReader.ts             # MySQL query() / readLoginDataFromDB()
│   │
│   ├── ai/                     # optional — only active when an API key is set
│   │   ├── agents/rcaAgent.ts          # root-cause verdict for failures
│   │   ├── agents/flakyAnalyzer.ts     # compares runs to flag flaky tests
│   │   └── config/providers.ts         # anthropic / openai / google key detection
│   │
│   └── api/                    # (EMPTY) reserved for API automation
│
├── tta-report/                 # Custom report output
│   ├── index.html              # always the LATEST run
│   ├── report_<timestamp>.html # archived run
│   ├── history.html            # all runs side by side
│   ├── screenshots/ │ videos/ │ traces/
│
├── reports/runs/*.json         # per-run summary (fed to the Flaky tab)
├── logs/combined.log           # Winston log file
├── playwright-report/          # built-in Playwright HTML report
├── test-results/               # raw Playwright artifacts
└── docs/                       # extra diagrams / walkthroughs
```

---

## 4. Execution Guide (Web Automation)

### 4.1 One-time setup

```bash
npm install
npx playwright install          # download the Chromium browser
cp .env.example .env            # then edit .env
```

Key `.env` values:

```ini
TTA_ENV=qa                      # qa | stg | prod | dev | api
BASE_URL=                       # leave empty to switch via TTA_ENV
LOG_LEVEL=info
TEST_ENV=QA
ATTACH_SCREENSHOTS=true         # turn on per-step screenshots for visualStep
STANDARD_USER=standard_user
TTA_SECRET=tta_secret
```

> `playwright.config.ts` resolves `baseURL` in this order: `BASE_URL` → `TTA_ENV`-specific URL → QA default.

### 4.2 Run the tests

```bash
npx playwright test                          # everything, headed by default locally
npx playwright test src/tests/login.spec.ts  # one file
npx playwright test --grep "@P0"             # by tag
npx playwright test --grep "@Checkout"       # by feature tag
npx playwright test --headed                 # watch the browser
npx playwright test --ui                     # interactive UI mode (best for learning)
npx playwright test --debug                  # Playwright Inspector, step by step
npx playwright test --project=chromium       # only the Chromium project
```

Headless is forced automatically on CI (`process.env.CI`), and retries are enabled there too.

### 4.3 Where the results appear

| Output | Location |
|---|---|
| TTA custom report (latest) | `tta-report/index.html` |
| Archived TTA report | `tta-report/report_<runId>.html` |
| Run history | `tta-report/history.html` |
| Built-in Playwright report | `playwright-report/index.html` |
| Run summary JSON | `reports/runs/run-<runId>.json` |
| Logs | `logs/combined.log` |

---

## 5. Concepts Used

### 5.1 Page Object Model + BasePage inheritance

Each screen has one class (`LoginPage`, `CartPage`, ...). Locators are `private readonly` fields built in the constructor with `data-test` attributes, and behaviour is exposed as methods (`loginAs`, `addToCart`, `checkout`).

Every page extends `BasePage`, which provides:

- `page` — the Playwright `Page`
- `el` — a `UtilElementLocator` instance (action wrappers with timeouts + logging)
- `log` — a Winston logger scoped to the subclass name, e.g. `[LoginPage]`
- `goto(path)` — navigation that respects `baseURL`

### 5.2 Custom fixtures — `src/fixtures/test-base.ts`

Instead of `new LoginPage(page)` in every spec, the custom `test` injects what you ask for:

```ts
import { test, expect } from '@fixtures/test-base';

test('checkout', async ({ loginWithInventory, cartPage }) => { ... });
```

Two kinds of fixtures:

- **Page fixtures** — `loginPage`, `inventoryPage`, `cartPage`, `checkoutStepOnePage`, ... just constructed objects.
- **State fixtures** — reusable setup that only runs when requested:
  - `invalidLogin` — locked-out user stays on login, error visible
  - `validLogin` — logged in, back at the login page object
  - `loginWithInventory` — logged in **and** on the inventory page
  - `loginWithSelectedItem` — logged in **and** one item already in the cart

State fixtures depend on each other, so requesting the deepest one gives you the whole chain.

### 5.3 UtilElementLocator

A thin, reusable wrapper over Playwright actions: `click`, `doubleClick`, `rightClick`, `hover`, `fill`, `type`, `clear`, `getText`, `getAllTexts`, `count`, `isVisible`, `waitForVisible`, `waitForHidden`, `selectByText/Value/Index`, and more.

It accepts a **string selector or a ready Locator** (`Flex` type), applies a default 15s timeout, and logs each action at debug level. This keeps page objects short and consistent.

### 5.4 Custom report — `src/utils/CustomReporter.ts`

A Playwright reporter (`reporter: [['./src/utils/CustomReporter.ts']]`) that builds its own HTML report into `tta-report/`, in addition to the built-in one.

What it produces:

- A run file `report_<runId>.html` plus `index.html` that always points to the newest run
- `history.html` — every run side by side
- `reports/runs/run-<runId>.json` — machine-readable summary used for flaky comparison
- Copies of **screenshots, videos and traces** into `tta-report/`

Tab layout:

| Tab | What it shows |
|---|---|
| 📋 Test Results | Passed/failed tests grouped by file, with steps, durations, logs, media |
| 🤖 AI Data | JSON payloads attached from tests, e.g. generated test data |
| ⚖️ AI Verdict | Root-cause analysis per failure (needs an LLM API key) |
| 🔁 Flaky | Compares this run with the previous one to flag unstable tests |
| 🩹 Self-Heal | Dead locators with verified replacement candidates and rejection reasons |

The AI tabs are optional: with no API key the report still builds fully and simply skips them. Filters for tags (`P0`, `P1`, `Smoke`) and status are built into the header.

### 5.5 Visual steps — `src/utils/visualSteps.ts`

`visualStep()` is `test.step()` plus a screenshot:

```ts
await visualStep(page, 'Cart page: verify one item in cart', async () => {
    await cartPage.open();
    expect(await cartPage.rowCount()).toBe(1);
});
```

- **When**: a screenshot is taken at the **end** of the step body, when `ATTACH_SCREENSHOTS=true`
- **How it links up**: the screenshot is attached as `step-<index>-<slug>`, and `CustomReporter` matches that name to the step at the same index — so the image renders as a thumbnail **next to its step** in the report
- `stepScreenshot.ts` exposes `shot(page, index, name)` for the same behaviour inside a plain `test.step()`

This turns the report into a clickable storyboard of the test — ideal for demos, debugging and reviewing failures without re-running.

### 5.6 Logging — `src/utils/logger.ts`

Winston logger with two entry points:

- `logger` — framework-wide root logger
- `createLogger('LoginPage')` — scoped child logger; every line is tagged with its source

Output goes to the colourised console **and** `logs/combined.log`, so CI runs leave an artifact. Level is controlled by `LOG_LEVEL`.

### 5.7 Test data layer

- `DataGenerator` (Faker) — random users, credentials, checkout customer info, dates, etc.
- `readCSV`, `readExcel`, `readYAML` — data-driven tests from files
- `dbReader` — MySQL queries, enabled only when `MYSQL_*` vars are set
- `src/testdata/` — static fixtures such as `logintestdata.json`

### 5.8 Config & path aliases

`.env` drives the environment (`TTA_ENV`, `BASE_URL`, credentials, optional AI keys). `src/config/env.ts` gives typed helpers: `requireEnv()`, `envOr()`, `assertEnv()`.

Imports use `@`-prefixed aliases defined in `tsconfig.json` instead of relative paths:

```ts
import { LoginPage } from '@pages/LoginPage';
import { test, expect } from '@fixtures/test-base';
import { DataGenerator } from '@utils/DataGenerators';
```

Available aliases: `@api/*`, `@config/*`, `@fixtures/*`, `@pages/*`, `@testdata/*`, `@utils/*`.

---

## 6. Coming Later: API Automation

`src/api/` is reserved and currently empty. The plan is to add:

- API client / request wrappers (e.g. Playwright `request` context, `@api/*` alias)
- API specs alongside the web specs, reusing the same config, reporter and utils
- `TTA_ENV=api` already resolves to `API_BASE_URL` (`https://restful-booker.herokuapp.com`), so the ground work is in place

Nothing else in the framework needs to change — the reporters, loggers and data readers are transport-agnostic.

---

## 7. Conventions

- Locators use `data-test` attributes, declared as `private readonly` in page constructors
- Tests are tagged in `describe`/`test` titles: `@P0`, `@Regression`, `@Checkout`, `@E2E`
- One page class per screen, one spec file per feature
- No hardcoded URLs or credentials — read from `.env` / `config`
- New pages extend `BasePage`; new specs import `test` from `@fixtures/test-base`
