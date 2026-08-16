<div align="center">

# Doorman

Every site you use is a recipe. Pick one, see its probable stack, swap the ingredients for open-source or managed alternatives, price the copy across scale tiers — then take the prompt and cook.

[![Live][badge-site]][url-site]
[![HTML5][badge-html]][url-html]
[![CSS3][badge-css]][url-css]
[![JavaScript][badge-js]][url-js]
[![Claude Code][badge-claude]][url-claude]
[![License][badge-license]](LICENSE)

[badge-site]:    https://img.shields.io/badge/live_site-c2904a?style=for-the-badge&logo=googlechrome&logoColor=white
[badge-html]:    https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white
[badge-css]:     https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white
[badge-js]:      https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black
[badge-claude]:  https://img.shields.io/badge/Claude_Code-CC785C?style=for-the-badge&logo=anthropic&logoColor=white
[badge-license]: https://img.shields.io/badge/license-MIT-404040?style=for-the-badge

[url-site]:   https://doorman.neorgon.com/
[url-html]:   #
[url-css]:    #
[url-js]:     #
[url-claude]: https://claude.ai/code

</div>

---

Doorman is a **stack cookbook**. You pick an app archetype — SaaS dashboard, marketplace, docs chatbot, an Airtable base with Interfaces on top — and it shows the stack that archetype probably runs on: which of the 14 service categories it actually needs, a concrete default pick for each, the free tier and the gotcha of every alternative, what the whole thing costs per month at three scale tiers, what it would cost to have an AI build it once, and the four hard parts the landing page never mentions.

The name is the thesis. The **doorman fallacy** (Rory Sutherland): firing the doorman looks efficient because you only price what you see. Doorman applies that to a stack — the ingredient list is the part everyone copies, and the gotchas underneath each one (Firebase's uncapped Blaze bill, Ably's 1-publish-to-100-subscribers fan-out, Airtable's 5 requests/sec) are the part that decides whether the copy survives. The doorman knows what's in the building.

**Everything stays on your device. No backend, no accounts, no network calls** — the only outbound requests are favicons for the service logos.

---

## What it does

Five steps, one page:

1. **Pick a recipe** — 13 archetypes plus a blank canvas. Each declares its own ingredient list (a mobile backend has no hosting row; the Airtable recipe has no hosting row either, because Interfaces *are* the hosting), a build size that drives the AI estimate, and four challenges written for that archetype specifically.
2. **The stack** — tap any ingredient to open its alternatives, split into **open source / self-host** and **managed / pay-to-win**, each with its real free-tier limits, entry price, a link to the live pricing page, and the one thing that bites people. Two quick-swaps flip the whole stack: **All open-source** and **All managed**. **BaaS picks absorb categories** — choose Supabase and auth, storage and realtime fold into it as one bill; choose Airtable and storage, CMS and auth fold in, because a seat *is* the login.
3. **What it costs** — a per-ingredient table at **Hobby / Launched / Scaling**, with the all-OSS and all-managed totals for the same recipe shown side by side. Plus the one-time **AI build cost** across 11 coding models (cheapest first, "best value" flagged) and the flat-subscription alternative, since most builders never touch the API.
4. **The hard parts** — the recipe's four challenges, next to the gotcha of every ingredient you actually picked.
5. **Take the prompt** — the whole session exported as a markdown build order: the frontend decision with its trade-offs, every ingredient with its free tier and its trap, the cost expectations, the challenges to plan for, and constraints that tell the AI *not* to add a second service for a job a bundled pick already does. Copy, download, or share the URL.

**Frontend — pick your compromise** sits inside step 2 as four cards, because it is the axis that moves the build estimate most: pure HTML/CSS/JS (×0.7), Vanilla + Tailwind (×1.0), a framework (×1.5), or a **no-code UI** (×0.25) where the tool holding your data draws the screens and there is nothing to generate at all.

---

## The recipes

| Recipe | Size | The point of it |
|---|---|---|
| SaaS Dashboard | M | Login, a data model, a bill. Auth is a subscription with a meter on your user table. |
| Social / Community App | L | Cheap to start, brutal to scale — the feed is a data pipeline and moderation arrives uninvited. |
| E-commerce Store | L | Money touches everything; compliance picks your processor. |
| Blog / Content Site | S | The CMS decision is forever. |
| Realtime Chat | M | Fan-out billing is the trap. |
| Marketplace | XL | The boss fight: you are a payments company with a cold-start problem. |
| Mobile App Backend | M | No frontend. Users run old app versions for months. |
| AI Wrapper App | M | Your COGS is someone else's pricing page. |
| **Internal Tool / Back Office** | M | Staff-only, no payments. The MAU meter runs *backwards* — 40 employees are free, SSO is what costs. |
| **Support / Docs Chatbot** | M | Retrieval is the product; the model is a commodity. No paywall means no natural spend cap. |
| **Airtable Base + Interfaces** | S | The base is the backend *and* the frontend. Priced by headcount; no git means no staging and no revert. |
| **Airtable + App Backend (glue)** | M | Airtable for editors, Convex for the app, a Cloudflare Worker between, Netlify out front — three runtimes competing to hold one business rule. |
| **Static SPA on GitHub Pages** | S | $0 at every tier. "Privately shared" is not a Pages feature. |
| Blank Canvas | M | All 14 categories, no defaults. Justify each one. |

---

## Usage

No install, no build step.

```bash
make serve
# open http://localhost:8849
```

Or `python3 -m http.server 8849` from this directory. ES modules require an HTTP server, not `file://`.

---

## The model

Two independent numbers, both deterministic arithmetic — no LLM anywhere in the app.

**Run it.** Every option carries an editorial `{ hobby, launched, scaling }` monthly estimate; the tiers total them. A category absorbed by a BaaS pick reports `$0` with a pointer to its bundler, so bundling shows up as the saving it is instead of vanishing from the table.

**Build it once.**

```
buildTokens = SIZE_TOKENS[recipe.size] × FRONTENDS[frontend].tokenFactor
buildCost   = buildTokens × blendedRate(model)      // 3:1 input:output
```

| Recipe size | Tokens | | Frontend | Factor |
|---|---|---|---|---|
| S — a few pages, one data model | 1.5M | | No-code UI | ×0.25 |
| M — real CRUD + auth + one integration | 6M | | Pure HTML/CSS/JS | ×0.7 |
| L — multiple roles or a second hard subsystem | 15M | | Vanilla + Tailwind | ×1.0 |
| XL — marketplace-class | 35M | | Framework | ×1.5 |

That is why the same Airtable recipe reads 0.38M tokens as a no-code build and 2.25M as a framework build. Prices are a **snapshot researched July 2026** with every source linked — the app says so in its own footer, and so does the exported prompt.

---

## Architecture

Zero-build ES modules, ~2.6k lines. Data is separated from behaviour so a price change is a one-line edit in one file.

```
doorman-site/
├── index.html               # App shell, SEO head, JSON-LD, the cookbook framing
├── css/style.css            # Neorgon dark theme + brass accent (#c2904a)
├── js/
│   ├── app.js               # Entry point — initState, render, wire events
│   ├── state.js             # Recipe + picks + frontend + tier; bundle rules, localStorage, hash sharing
│   ├── data-services.js     # Aggregates the 14 categories; the BUNDLED sentinel
│   ├── services-hosting.js  # hosting, queue
│   ├── services-data.js     # database, realtime, aiApi
│   ├── services-edge.js     # storage, cdn
│   ├── services-identity.js # auth, payments
│   ├── services-ops.js      # email, search, analytics, monitoring, cms
│   ├── data-recipes.js      # 14 recipes, 4 frontend approaches, 3 scale tiers
│   ├── data-models.js       # 11 coding models, size→token table, subscription path
│   ├── costmodel.js         # Infra rows/totals, strategy totals, build tokens, model costs
│   ├── prompt.js            # The exportable markdown build order
│   ├── render.js            # Full re-render of all five steps
│   ├── events.js            # One delegated click + change listener on #app; every mutation re-renders
│   ├── icons.js             # Inline stroke SVGs — no emoji in the UI, ever
│   └── utils.js             # escHtml, fmtUsd, fmtTokens, toast, download
├── Makefile                 # make serve (port 8849)
├── robots.txt
├── sitemap.xml
└── CNAME                    # doorman.neorgon.com
```

**84 service options across 14 categories.** Adding one is a single object in the right `services-*.js`; two things about the file order are load-bearing, and both are documented at the top of `data-recipes.js`:

- `applyStrategy('oss')` takes the **first** option whose `strategy` is `'oss'` in a category, so insertion order decides what "All open-source" lands on.
- `setPick` stomps every category a `bundles` option claims. Recipe defaults bypass `setPick` and are assigned directly, which is how a recipe can deliberately keep R2 while Supabase would otherwise absorb storage.

State autosaves to `localStorage` under `doorman-cookbook-v1` and encodes into the URL hash as `#c=…`. Boot order: hash → localStorage → the SaaS recipe.

<div align="center">

Part of [Neorgon](https://neorgon.com/)

</div>
