# Taste

## TypeScript / Tooling
- Configures TypeScript with `strict: true`, `target`/`module` of ES2022/ESNext, `moduleResolution: "bundler"`, and `noEmit: true`. Confidence: 0.6
- Prefers `@`-prefixed path aliases mapped per domain folder (e.g. `@api/*`, `@config/*`, `@fixtures/*`, `@pages/*`, `@testdata/*`, `@utils/*` pointing into `src/*`) instead of relative imports. Confidence: 0.7

## Configuration / Workflow
- Expects environment-driven configuration: base URL / environment values should be read from `.env` (e.g. via `process.env`) rather than hardcoded constants, so switching environments changes behavior. Confidence: 0.6

## Git / Version Control
- Uses a `master` + `develop` branching model (explicitly names both branches, "master" rather than "main") and does day-to-day work on `develop`, pushing code there. Confidence: 0.5

## Communication
- Asks mechanism/why questions about their own code ("why isn't X called", "explain how this works") and expects a step-by-step trace of the resolution chain (config → page object → framework API), not just a patch. Confidence: 0.5
