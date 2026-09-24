# Doorman

A stack cookbook for copying useful product workflows. Pick a recipe, inspect the services and their brands, swap ingredients, compare prices, and copy the build prompt.

[Live site](https://doorman.neorgon.com/) · [UI notes](DESIGN.md)

## The cookbook

The original single-page design is the baseline. Six sections stay together:

1. **Pick a recipe:** eighteen combinations and nine familiar-product references, with a compact summary.
2. **The stack:** branded service rows expand into open-source and managed alternatives, with free limits, paid entry, benefits, gotchas and exit notes. Choose a frontend and its tradeoffs.
3. **What it costs:** Hobby, Launched and Scaling prices in one table. Pin a stack and compare subsequent changes, or load a shared baseline.
4. **The builder:** twelve model-price rows alongside five coding tools and their payment details.
5. **The hard parts:** recipe challenges and selected-provider caveats.
6. **Take the prompts:** copy or download a build brief and a usage-fit research prompt. Credential setup links to [Échéance](https://echeance.neorgon.com/#tutorials).

The section navigation scrolls within this page. There is no separate planner, catalogue tab or persistent summary sidebar. Mobile layouts keep provider prices visible and place wide tables in keyboard-accessible scroll regions.

## Prices and assumptions

Infrastructure amounts are editorial scenarios, not workload quotes. Prices exclude labor, AI use, taxes and variable payment fees. Annual infrastructure uses twelve months of the selected scenario. Provider sources and review labels remain available in the alternatives.

The original AI cost comparison uses recipe-size and frontend token assumptions, explicitly labeled **illustrative**. It does not promise a complete build for that price. Model rows show input/output rates, scenario cost, sources and review notes. Subscriptions have separate usage limits.

## Run and check

```sh
make serve  # http://localhost:8849
make test
python3 tests/browser_smoke.py
```

The app uses browser ES modules with no build step. Serve it over HTTP. Browser checks need Python Playwright and Chromium; set `AXE_SCRIPT` to a local axe-core file for accessibility checks. Output defaults to `/tmp/doorman-ui-reset`.

## Implementation

- `render.js`, `events.js`, `icons.js`, `css/style.css`: the original cookbook layout, brand icons and interactions.
- `data-recipes.js`, `data-presets.js`, `services-*.js`, `data-models.js`: recipes, tools and prices.
- `config.js`, `state.js`, `costmodel.js`: validated selections, bundling, persistence and consistent strategy arithmetic.
- `build-estimates.js`: explicitly illustrative token scenarios used by the original-style builder table.
- `prompt.js`, `plan.js`, `insights.js`, `access.js`: concrete examples, tradeoffs and copyable references.

Configuration compatibility helpers retain earlier saved plans; they do not add planner screens. Deliberate omissions survive provider strategies, and recipe defaults may intentionally use separate services even when a backend offers bundles.

Plans use `localStorage['doorman-cookbook-v1']` and `#c=` share URLs. Share URLs include configuration and user-authored context; never include credentials. Shared UI assets and brand favicons may load remotely. The app does not send plans to an AI service.

Vendored `neorgon-*` files are maintained by the shared Neorgon kit.
