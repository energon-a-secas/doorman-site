# CLAUDE.md: Doorman

Doorman is a single-page stack cookbook. The user explicitly rejected the expanded planner and requested UI enhancements over the original design, especially tables and brands. Read PRODUCT.md and DESIGN.md before making interface changes.

**Live:** doorman.neorgon.com · **Port:** 8849

## Run

`make serve` starts the local site. `make test` runs the Node checks. `python3 tests/browser_smoke.py` validates the cookbook with Playwright; `AXE_SCRIPT` enables axe checks.

## Structure

- `render.js`: original six numbered sections, branded ingredient rows, cost/model tables, pinned-stack comparison, hard parts and prompt previews.
- `events.js`: delegated controls, in-page navigation and immediate preview updates.
- `icons.js`: inline category icons and provider favicons.
- `config.js`, `state.js`: validated configuration, bundling, strategy resolution, persistence and share compatibility.
- `costmodel.js`: infrastructure scenarios. `build-estimates.js`: explicitly illustrative recipe/frontend token assumptions.
- `data-recipes.js`, `data-presets.js`, `services-*.js`, `data-models.js`: recipe, provider and model references.
- `prompt.js`, `plan.js`, `insights.js`, `access.js`: copyable briefs and setup references. Older planning helpers remain for saved-configuration compatibility, not as UI sections.

## Constraints

- Zero build step; plain browser ES modules. Keep JS modules under roughly 500 lines.
- Preserve the original one-page design and brand presentation. Do not reintroduce the rejected planner screens or sidebar.
- Preserve the storage key `doorman-cookbook-v1` and `#c=` shares. Validate external configurations before mutation.
- Preserve deliberate unbundled recipe defaults. Explicit omissions must survive provider swaps.
- Provider strategy previews and application use the same resolver. Keep a provider when no matching alternative exists.
- A bundled capability must name its owning service without duplicating the charge.
- Prices are reference scenarios, not workload quotes. The AI build table uses assumptions, not calibrated effort forecasts. Keep prices and source/review labels visible.
- Preserve keyboard focus and current table scroll positions across rerenders. Text input must not swallow a subsequent copy click.
- The page itself must not be an aria-live region. Keep mobile service prices visible.
- Do not read private sibling credential inventory files during testing.

## Shared kits

Do not edit `js/neorgon-*.js` or `css/neorgon-*.css`, or add local `.neo-footer` / `.header-bar` overrides.
