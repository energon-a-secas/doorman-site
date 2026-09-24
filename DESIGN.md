# Doorman UI

## Baseline

The original Git design: one page with six numbered cookbook sections, branded expandable service rows, paired cost/comparison panels, the model-price table beside coding tools, recipe challenges, and two prompt panels. Retain this arrangement.

## Setting and visual language

A builder compares the page beside their editor on a laptop, often in a dim room. Keep the established dark Neorgon surfaces, restrained brass accent, system typography and real service favicons. Do not introduce a new palette or visual identity.

## UI refinements

- Align table prices with tabular numerals and clear column headers.
- Improve muted-text contrast and primary-button contrast.
- Keep service prices visible on mobile; scroll wide tables inside their own named, keyboard-accessible regions.
- Preserve focus and open disclosures after a provider change.
- Use a simple in-page section navigation that leaves share URLs intact.
- Keep brief hover, focus and disclosure transitions; respect reduced motion.
- Use consistent touch targets, explicit selected states and a focused status message instead of making the entire app a live region.

## Boundaries

No multi-view planner, summary sidebar, staged wizard or separate discovery application. Brand marks and tables are core to the requested design. Vendored `neorgon-*` styles/scripts remain untouched; never add local header/footer overrides.
