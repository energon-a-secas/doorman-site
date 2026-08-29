# CLAUDE.md: Doorman

Doorman: stack cookbook for copying any site. 17 app archetypes ("recipes"), each declaring which of the 15 service categories it needs and a default pick per category; tap an ingredient to swap it among 88 options split open-source/self-host vs managed, each carrying its real free-tier limits, entry price, pricing link and the gotcha that bites people. Three quick-swaps flip the whole stack (Free tier / All open-source / All managed); the recipe picker groups five `budget: true` recipes under an "Almost free" optgroup, and a Domain & DNS category (the only unavoidable bill in a free stack) exists only in those recipes plus Blank Canvas. **Bundling is the load-bearing idea**: an option's `bundles` list absorbs whole categories into one bill (Supabase→auth+storage+realtime, Airtable→storage+cms+auth, since a seat *is* the login), `setPick` stomps claimed categories, while recipe defaults bypass it and so may deliberately unbundle. Costs are two independent numbers: monthly infra at Hobby/Launched/Scaling, and the one-time AI build (`SIZE_TOKENS[size] × frontend.tokenFactor × blendedRate`) across 11 coding models plus the flat-subscription path. The no-payments cases are covered on purpose, internal back office (where the MAU meter runs backwards and SSO is the real cost), docs chatbot, Airtable-as-both-ends, an Airtable+Convex+Worker+Netlify glue stack, a $0 GitHub Pages SPA, a Pages+Convex free-stack app, a hobby community site, and an Airtable-to-committed-JSON snapshot stack. Exports the session as a markdown build order that tells the agent *not* to add a second service for a job a bundled pick already does, plus a free-tier fit check: usage inputs (visitors/MAU/GB) become a research prompt asking an agent to verify live limits and name the first one to break. Data lives in `services-*.js` + `data-recipes.js` / `data-models.js`; insertion order inside a category is load-bearing (`applyStrategy('oss')` takes the first oss option). Zero-build ES modules, localStorage `doorman-cookbook-v1` + `#c=` hash share, no backend (doorman.neorgon.com)

**Live:** doorman.neorgon.com · **Port:** 8849

## Run

```bash
make serve
```

Then open http://localhost:8849. It must be served over HTTP. The app is ES modules, and `file://` blocks them.

## Architecture

| Module | Lines | Owns |
|---|---:|---|
| `js/render.js` | 338 | `renderApp` |
| `js/data-recipes.js` | 284 | `TIERS`, `FRONTENDS`, `RECIPES` |
| `js/services-ops.js` | 233 | `email`, `search`, `analytics`, `monitoring`, `cms` |
| `js/state.js` | 207 | `state`, `activeCategories`, `applyRecipe`, `applyStrategy`, `freeTierPicks`, `applyFreeTier`, `currentPick` |
| `js/services-data.js` | 194 | `database`, `realtime`, `aiApi` |
| `js/prompt.js` | 158 | `buildPrompt`, `buildFitPrompt` |
| `js/services-edge.js` | 133 | `storage`, `cdn`, `domains` |
| `js/costmodel.js` | 121 | `infraRows`, `infraTotals`, `strategyTotals`, `freeTotals`, `buildTokens`, `modelCosts` |
| `js/services-hosting.js` | 111 | `hosting`, `queue` |
| `js/services-identity.js` | 107 | `auth`, `payments` |
| `js/events.js` | 85 | `bindEvents` |
| `js/utils.js` | 83 | `$`, `escHtml`, `showToast`, `fmtTokens`, `fmtUsd` |
| `js/data-models.js` | 66 | `AI_MODELS`, `SIZE_TOKENS`, `SIZE_LABELS`, `blendedRate`, `buildCostUsd` |
| `js/icons.js` | 55 | `icon`, `favicon` |
| `js/data-services.js` | 24 | `CATEGORIES`, `TYPE_META`, `BUNDLED` |
| `js/app.js` | 12 | none |

Vendored from `packages/neorgon-ui/`: never edit in place, run the sync script instead: `js/neorgon-footer.js`, `js/neorgon-header.js`.

## Data

- `localStorage['doorman-cookbook-v1']` (recipe, picks, frontend, tier, and the
  fit-check `usage` inputs; old saves without `usage` are normalized on load)

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
- Cost is two independent numbers, not one: monthly infra at Hobby/Launched/Scaling,
  and the one-time AI build (`SIZE_TOKENS[size] × frontend.tokenFactor × blendedRate`).
- The no-payments recipes (internal back office, docs chatbot, $0 Pages SPA) exist
  on purpose. They are the cases where the MAU meter runs backwards and SSO is the
  real cost: not gaps to be filled in with a payments provider.

## Do not touch

- `js/neorgon-*.js` and `css/neorgon-*.css`: vendored kits, regenerated by `packages/neorgon-ui/sync-*.sh`.
