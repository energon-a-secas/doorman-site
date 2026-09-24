# Current UI refinement

The latest user direction supersedes the broader redesign: return to the original table-and-brand design and focus on UI improvements.

Restored the original `render.js`, event flow, index shell and stylesheet from Git as the baseline, then applied focused changes:

- One page with the original six cookbook sections. Removed the six-view planner renderer modules and summary sidebar.
- Brand favicons in ingredient rows, alternatives, model references and coding tools.
- Original cost tables, model-price comparison, pin-and-compare interaction, frontend options and prompt panels.
- Better text/button contrast, table alignment, row hover states and focus treatment.
- Visible service prices on narrow screens and contained, named table scroll regions.
- Simple section navigation without replacing configuration hashes.
- Focus, table scroll position and disclosure preservation; immediate input-to-copy updates.

Existing source reviews, configuration validation and corrected strategy arithmetic remain behind the original UI. The original recipe-size AI comparison is labeled an illustrative token scenario. Earlier planner saves are accepted without stranding the user on an empty view.

The rejected interface was backed up outside the repository before restoration. Earlier critique notes describe historical proposals, not current implementation requirements. Échéance changes from the earlier task were not touched in this UI pass.

Validation: run `make test` and `python3 tests/browser_smoke.py` against the local server. Browser checks cover the one-page overview, expanded alternatives and pinned comparison at desktop and mobile widths, all recipes/references, keyboard continuity, copy/downloads, sharing and saved-plan compatibility. Set `AXE_SCRIPT` to run axe alongside these checks.

Changes are local; no deployment was performed.
