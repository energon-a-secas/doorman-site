<div align="center">

# Doorman

See the value before you fire it. Scope what it really costs to duplicate a vendor deliverable in-house — and price the invisible work a naive estimate skips.

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

Doorman is a build-vs-buy scoper. You describe a vendor deliverable, pick the scope axes, and it estimates what duplicating it in-house actually costs — in **tokens/context** (the primary axis), **engineers**, and **people-time** — rolled into a single T-shirt cost band with an ordered duplication plan.

The name is the thesis. The **doorman fallacy** (Rory Sutherland): firing the doorman looks efficient because you only price what you see — the salary, the open door. You don't see the packages he signed for, the taxis he hailed, the trouble he kept out. Duplicating a vendor deliverable is the same trade. Doorman makes you tick the **invisible value** before you decide — and anything you leave unticked is shown back as an unpriced cost.

**Everything stays on your device. No backend, no accounts, no network calls.**

---

## What it does

- **Example gallery** — 12 real cases grouped by verdict (usually-buy: Lucidchart, Notion, an auth service, Zapier; toss-ups: Calendly, Linear, an internal SPA, a docs chatbot; often-own: a status page, a single-use form, a landing page, an analytics dashboard). Click one to draft the whole scenario and see an expectation, then tweak from there.
- **Simple ⇄ Advanced modes** — Simple asks only the headline scope and assumes a sensible recommended stack. Advanced exposes every axis plus the full stack-decision comparison, so you can start from an assumed pattern and adjust in between.
- **Stack decisions with pros/cons** — for each relevant piece (backend, auth, hosting, domain, AI provider) pick from real options — Convex vs Supabase vs Firebase vs serverless vs custom; Convex-local vs Clerk vs Auth0 vs roll-your-own; GitHub Pages vs Cloudflare vs Vercel vs a VPS; an internal/owned subdomain vs Cloudflare/Namecheap/GoDaddy; Anthropic vs OpenAI vs OpenRouter vs a local model. Each shows trade-offs and a recurring monthly cost, and feeds the estimate.
- **Own vs. buy** — enter what the vendor charges today and Doorman amortizes a one-time build plus the chosen stack's recurring cost against the subscription: a breakeven point, a total-cost comparison, and a plain-language verdict.
- **Honest estimates (p50 → p90)** — build cost and time are shown as a range, not a false-precision point. A planning-contingency uplift produces a realistic p50; an uncertainty band projects the p90. Every dollar figure has a **"how this is calculated"** trail.
- **Editable assumptions** — the blended weekly rate, TCO horizon, planning contingency, and uncertainty band are all exposed and adjustable (Advanced mode). Nothing that drives a number is hidden.
- **Market anchor** — a per-artifact reference price range sits beside the vendor-cost input so entries aren't free-floating.
- **What drives the cost** — a sensitivity (tornado) view ranks which levers move the build cost most, so you attack the biggest ones first.
- **Save, compare & share** — save named scenarios, tick 2–3 to compare side by side (build-on-Convex vs build-custom vs keep-buying) under one cost model, and copy a share link that encodes the whole scenario in the URL.

---

## Usage

No install or build step required.

```bash
make serve
# open http://localhost:8849
```

Or `python3 -m http.server 8849` from this directory. ES modules require an HTTP server, not `file://`.

---

## The model

**Token/context is the primary axis**, because baseline reuse is the dominant lever on cost:

| Baseline reuse | Token factor | Meaning |
|---|---|---|
| From scratch | ×1.0 | Everything regenerated |
| Partial | ×0.6 | Some shared logic; AI starts from a known context |
| Full | ×0.35 | Most is a known baseline; only the delta is net-new |

Scope axes (backend, integrations, data sensitivity, compliance, maintenance, AI component, UI complexity) each add token weight, engineer demand, and people-time. Stack decisions add further build deltas (relative to the recommended zero-delta path) and a recurring monthly cost. The cost model is deterministic — no LLM, pure arithmetic — and produces a band (XS → XL, describing **build effort**), an engineer range, a people-time band, a monthly stack cost, and a baseline-aware duplication plan with reused steps marked. The buy-vs-build *recommendation* comes from the own-vs-buy card, which weighs that effort against the vendor's actual price — not from the effort band alone.

## The Doorman check

Six invisible considerations a duplication estimate routinely skips — tacit method, accumulated edge cases, ongoing maintenance, relationships & institutional memory, what breaks when it's gone, and keeping pace with change. Tick what you've genuinely accounted for; the result pane shows the rest as unpriced risk. When a "cheap to duplicate" estimate is hiding three unticked doorman costs, that gap *is* the vendor's intrinsic value made visible.

---

## Architecture

```
doorman-site/
├── index.html          # App shell, SEO head, JSON-LD, the doorman framing
├── css/style.css        # Neorgon dark theme + brass accent (#c2904a)
├── js/
│   ├── app.js          # Entry point
│   ├── state.js        # Scenario state + localStorage (doorman-v2), preset apply
│   ├── data.js         # Modes, artifacts, reuse, axes, stack decisions, presets, hidden considerations, bands
│   ├── costmodel.js    # Deterministic estimate + own-vs-buy + duplication plan + suggestions
│   ├── render.js       # Mode toggle, preset gallery, scoping form, stack decisions, live result + markdown export
│   ├── events.js       # Mode, presets, pickers, multiselect axes, stack options, range, money input, checkboxes
│   └── utils.js        # Helpers: token formatting, toast, download
├── Makefile            # make serve (port 8849)
├── robots.txt
├── sitemap.xml
└── CNAME               # doorman.neorgon.com
```

State autosaves to `localStorage` under `doorman-v2`. No backend.

<div align="center">

Part of [Neorgon](https://neorgon.com/)

</div>
