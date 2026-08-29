# CLAUDE.md: Doorman

Doorman: stack cookbook for copying any site. 17 app archetypes ("recipes"), each declaring which of the 15 service categories it needs and a default pick per category; tap an ingredient to swap it among 88 options split open-source/self-host vs managed, each carrying its real free-tier limits, entry price, pricing link, the gotcha that bites people, and an exit rating (easy/sticky/rewrite) with a note on what leaving costs. Three quick-swaps flip the whole stack (Free tier / All open-source / All managed); the recipe picker groups five `budget: true` recipes under an "Almost free" optgroup, adds 8 copy-a-real-site preset chips (Airbnb, Substack, ... in `data-presets.js`), and a Domain & DNS category (the only unavoidable bill in a free stack) exists only in the budget recipes plus Blank Canvas. Six page steps: recipes, stack, costs (with a pin-and-compare diff card fed by the current stack or a pasted share link), the builder (12-model AI cost table verified Aug 2026 + agent tools), hard parts, prompts. **Bundling is the load-bearing idea**: an option's `bundles` list absorbs whole categories into one bill (Supabase→auth+storage+realtime, Airtable→storage+cms+auth, since a seat *is* the login), `setPick` stomps claimed categories, while recipe defaults bypass it and so may deliberately unbundle. Costs are two independent numbers: monthly infra at Hobby/Launched/Scaling, and the one-time AI build (`SIZE_TOKENS[size] × frontend.tokenFactor × blendedRate`) across 11 coding models plus the flat-subscription path. The no-payments cases are covered on purpose, internal back office (where the MAU meter runs backwards and SSO is the real cost), docs chatbot, Airtable-as-both-ends, an Airtable+Convex+Worker+Netlify glue stack, a $0 GitHub Pages SPA, a Pages+Convex free-stack app, a hobby community site, and an Airtable-to-committed-JSON snapshot stack. Exports the session as a markdown build order that tells the agent *not* to add a second service for a job a bundled pick already does, plus a free-tier fit check: usage inputs (visitors/MAU/GB) become a research prompt asking an agent to verify live limits and name the first one to break. Data lives in `services-*.js` + `data-recipes.js` / `data-models.js`; insertion order inside a category is load-bearing (`applyStrategy('oss')` takes the first oss option). Zero-build ES modules, localStorage `doorman-cookbook-v1` + `#c=` hash share, no backend (doorman.neorgon.com)

**Live:** doorman.neorgon.com · **Port:** 8849

## Run

```bash
make serve
```

Then open http://localhost:8849. It must be served over HTTP. The app is ES modules, and `file://` blocks them.

## Architecture

| Module | Lines | Owns |
|---|---:|---|
| `js/render.js` | 454 | `renderApp` (six steps incl. compare card + builder) |
| `js/data-recipes.js` | 284 | `TIERS`, `FRONTENDS`, `RECIPES` |
| `js/services-ops.js` | 264 | `email`, `search`, `analytics`, `monitoring`, `cms` |
| `js/state.js` | 253 | `state`, `applyRecipe`, `applyPreset`, `applyStrategy`, `freeTierPicks`, `applyFreeTier`, `pinCurrent`, `pinFromShare` |
| `js/services-data.js` | 232 | `database`, `realtime`, `aiApi` |
| `js/costmodel.js` | 182 | `infraRows`, `strategyTotals`, `freeTotals`, `yearOneTotal`, `totalsForConfig`, `modelCosts`, `activeRules`, `activeExits` |
| `js/prompt.js` | 175 | `buildPrompt`, `buildFitPrompt` |
| `js/services-edge.js` | 149 | `storage`, `cdn`, `domains` |
| `js/services-hosting.js` | 132 | `hosting`, `queue` |
| `js/services-identity.js` | 121 | `auth`, `payments` |
| `js/events.js` | 112 | `bindEvents` |
| `js/data-models.js` | 89 | `AI_MODELS`, `SIZE_TOKENS`, `AGENT_TOOLS`, `blendedRate`, `buildCostUsd` |
| `js/utils.js` | 83 | `$`, `escHtml`, `showToast`, `fmtTokens`, `fmtUsd` |
| `js/icons.js` | 55 | `icon`, `favicon` |
| `js/data-presets.js` | 50 | `PRESETS` |
| `js/data-services.js` | 24 | `CATEGORIES`, `TYPE_META`, `BUNDLED` |
| `js/app.js` | 12 | none |

Vendored from `packages/neorgon-ui/`: never edit in place, run the sync script instead: `js/neorgon-footer.js`, `js/neorgon-header.js`.

## Data

- `localStorage['doorman-cookbook-v1']` (recipe, picks, frontend, tier, the
  fit-check `usage` inputs, and the compare `pinned` snapshot; old saves
  without `usage` are normalized on load)

## Conventions

- Zero build step. Plain ES modules loaded by `js/app.js`.
- Header and footer come from the shared kits. Do not add site-local `.neo-footer` or `.header-bar` CSS.
- No single JS file over ~500 lines. It currently holds.

## Gotchas

- **Bundling is the load-bearing idea.** An option's `bundles` list absorbs whole
  categories into one bill (Supabase → auth+storage+realtime; Airtable →
  storage+cms+auth, since a seat *is* the login). `setPick` stomps any category a
  bundle claims: but **recipe defaults bypass `setPick`**, so a recipe may
  deliberately unbundle. If you "fix" that inconsistency you break the recipes.
- **Insertion order inside a category is load-bearing.** `applyStrategy('oss')`
  takes the *first* oss option in the list. Reordering `services-*.js` for
  tidiness silently changes what every open-source quick-swap selects.
- **The Free tier quick-swap is flag-driven, not order-driven.** Exactly one
  option per category carries `freeTier: true`; `freeTierPicks()` falls back to
  the first $0-at-hobby option only when no flag exists. Unlike the OSS/managed
  swaps it keeps bundles bundled (fewest vendors is the point) and it sets the
  tier view to Hobby.
- **`domains` exists only in the five `budget: true` recipes plus Blank
  Canvas** by decision, not omission. Adding it to every recipe adds a
  near-constant $1/mo row to 12 cost tables; do not "complete" it fleet-wide
  without being asked.
- **Convex bundles `storage`** (its free tier ships 1 GB files) as well as
  realtime and queue. The `chat` and `glue` recipes still pin R2 via defaults,
  which bypass `setPick` on load; an interactive Convex pick absorbs storage.
- **Preset picks bypass `setPick` like recipe defaults do.** `applyPreset`
  assigns overrides directly, so a preset may deliberately combine picks a
  manual click sequence could not. The active preset chip lives in `state.ui`
  (ephemeral) and clears on a manual recipe change.
- **The prompt's constraints are partly generated.** Options may carry a
  `rule` field; `activeRules()` appends them to the static constraints list
  in the build order. Removing an option's rule silently weakens every
  exported prompt that picks it: treat rules as content, not decoration.
- **Model price rows are not all vendor-published.** Kimi K3 and Qwen3 Coder
  Flash are OpenRouter rates (no reachable vendor list price, noted in each
  row); Gemini 3.7 Flash is a promo price that doubles Jan 2027. The AI
  model table was verified Aug 2026; the services files remain July 2026.
- **Compare pins survive recipe changes on purpose.** `state.pinned` is a
  frozen snapshot, so tweaking or even switching recipes keeps the diff
  meaningful; rows outside a side's recipe render "not in recipe" at $0.
- Cost is two independent numbers, not one: monthly infra at Hobby/Launched/Scaling,
  and the one-time AI build (`SIZE_TOKENS[size] × frontend.tokenFactor × blendedRate`).
- The no-payments recipes (internal back office, docs chatbot, $0 Pages SPA) exist
  on purpose. They are the cases where the MAU meter runs backwards and SSO is the
  real cost: not gaps to be filled in with a payments provider.

## Do not touch

- `js/neorgon-*.js` and `css/neorgon-*.css`: vendored kits, regenerated by `packages/neorgon-ui/sync-*.sh`.
