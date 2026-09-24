import { recipeInsights, insightsBrief } from './insights.js';
import { budgetText } from './budget.js';
import { costEvidence, evidenceSummary } from './data-evidence.js';
// Human-readable contracts, generated from the same complete candidates as the UI.
import { accessLines } from './access.js';
export { accessLines } from './access.js';
import { TIERS } from './data-recipes.js';
import { PRESETS } from './data-presets.js';
import { state } from './state.js';
import { totalsForConfig } from './costmodel.js';
import { describePlan, stackItems, planWarnings } from './plan.js';
import { fmtUsd } from './utils.js';

const list = (items) => items.map((x) => `- ${x}`);
export function buildPrompt(cfg = state, full = false) {
  const p = describePlan(cfg),
    totals = totalsForConfig(cfg);
  const rows = stackItems(cfg);
  return [
    `# Build this iteration: ${p.name}`,
    '',
    `Objective: ${p.outcome}`,
    `Concrete example: ${p.example}`,
    `Reference: ${p.reference}. Recreate the agreed workflow, not every feature of the reference product.`,
    ...(cfg.preset ? [`Scope caveat: ${PRESETS[cfg.preset].wontGet}`] : []),
    `Implementation stage: ${p.stage}`,
    '',
    '## Included now',
    ...list(p.included),
    '',
    '## Deferred',
    ...list(p.deferred),
    '',
    '## Not needed for this scope',
    ...list(p.notNeeded),
    '',
    '## Design',
    `${p.design.label}: ${p.design.pattern}.`,
    p.design.details,
    'Preserve visible keyboard focus, readable contrast, reduced-motion preferences and usable narrow-screen controls.',
    '',
    '## Exact stack and capability ownership',
    `Frontend: ${p.frontend.label}.`,
    ...(rows.length
      ? rows.map(
          (r) =>
            `- ${r.label}: ${r.name}.${r.option?.type === 'none' ? ' Do not provision a service for this capability.' : ''}`,
        )
      : ['- No external services. Browser-local state plus portable JSON exports.']),
    '',
    '## Benefits and downsides of this combination',
    ...recipeInsights(cfg).providers.flatMap((r) => [
      `- ${r.name}: ${r.benefit}`,
      `  Downside: ${r.tradeoff}`,
    ]),
    '',
    '## Repository context',
    cfg.context ||
      'Inspect the existing repository and its instructions first. Repository-specific details are not yet supplied.',
    '',
    '## Acceptance criteria',
    ...list(p.acceptance),
    '',
    '## Implementation order',
    ...p.steps.map((s, i) => `${i + 1}. ${s}`),
    '',
    '## Costs and assumptions',
    `Recurring infrastructure scenario: ${fmtUsd(totals[cfg.tier])}/month (${TIERS[cfg.tier].label}).`,
    `Annual infrastructure at the same scenario: ${fmtUsd(12 * totals[cfg.tier])}.`,
    'These are editorial scenarios, not a usage forecast or a complete project quote. Excludes AI usage/subscriptions, human work, maintenance, taxes and payment processing fees. A custom domain is optional.',
    'Verify provider limits and eligibility on the linked official pages before provisioning. Usage inputs below are research assumptions; they do not drive these totals.',
    `Usage assumptions: ${usageSummary(cfg)}.`,
    '',
    '## Build and maintenance allowance',
    budgetText(cfg),
    '',
    '## Price evidence',
    evidenceSummary(cfg),
    ...costEvidence(cfg)
      .filter((r) => !r.bundledWith && r.status !== 'not-applicable')
      .map(
        (r) =>
          `- ${r.category}: ${r.status}; checked ${r.checkedAt || 'not recorded'}. ${r.note} Source: ${r.source || 'missing'}`,
      ),
    '',
    '## Access prerequisites',
    ...accessLines(cfg),
    '',
    '## Constraints',
    '- Implement this iteration only. Do not provision services for deferred capabilities.',
    '- Keep agreed choices. If a verified incompatibility blocks them, report evidence and the smallest viable adjustment.',
    '- Use a bundled provider for its assigned capability; do not introduce another vendor for the same job.',
    '- Keep secret values out of browser code, prompts and share links. Refer to environment variables by name.',
    '- Keep the app data exportable and verify the core flow with a keyboard.',
    ...rows
      .filter((r) => r.option?.type !== 'none' && r.option?.rule)
      .map((r) => `- ${r.name}: ${r.option.rule}`),
    ...planWarnings(cfg).map((w) => `- UNRESOLVED: ${w}`),
    '',
    '## Limitations and next iteration',
    p.limitation,
    `Advance only when: ${p.nextTrigger}`,
    'Report implemented behavior, validation, unresolved assumptions and the next small change.',
    ...(full
      ? [
          '',
          insightsBrief(cfg),
          '',
          '## Provider details',
          ...rows
            .filter((r) => r.option?.type !== 'none' && r.option)
            .flatMap((r) => [
              `### ${r.name}`,
              `Source: ${r.option.url || 'Not supplied'}`,
              `Recorded limits: ${r.option.free || 'No free tier recorded'}`,
              `Watch out: ${r.option.gotcha}`,
              `Exit: ${r.option.exit || 'Unrated'}. ${r.option.exitNote || ''}`,
              '',
            ]),
        ]
      : []),
    '',
    '_Generated by Doorman: https://doorman.neorgon.com/_',
  ].join('\n');
}
export function usageSummary(cfg) {
  const u = cfg.usage;
  return `visitors/month ${u.visitors || 'unspecified'}, active users ${u.users || 'unspecified'}, stored GB ${u.storageGb || 'unspecified'}`;
}
export function buildFitPrompt(cfg = state) {
  return [
    `# Verify the infrastructure scenario: ${describePlan(cfg).name}`,
    '',
    `Expected usage: ${usageSummary(cfg)}. Ask for missing workload, seat and transaction assumptions rather than inventing them.`,
    '',
    ...stackItems(cfg)
      .filter((r) => r.option?.type !== 'none' && r.option)
      .map(
        (r) =>
          `- ${r.name}: ${r.option.free || 'No free tier recorded'}. Source: ${r.option.url || 'unspecified'}`,
      ),
    '',
    'Verify the current plan limits, commercial eligibility, seats, requests, egress, storage, transactions and overage behavior from official sources.',
    'Do not assume visitor count equals requests, or that a budget alert is a spending cap. Include account-wide limits and existing projects.',
    'Translate the stated workload into each provider’s units. State assumptions and identify the first limit to break.',
    'For a local-only configuration, confirm that no external infrastructure is required.',
    '',
    '| Service | Source and checked date | Meter | Limit | Expected usage | Verdict |',
    '|---|---|---|---|---|---|',
    '',
    'Report fits / needs information / will bill, then the smallest adjustment. Distinguish fixed charges, variable fees and optional domain cost.',
  ].join('\n');
}
export function buildComparison(configs = [...state.candidates, state]) {
  const escape = (s) => String(s).replaceAll('|', '\\|').replaceAll('\n', ' ');
  const descriptions = configs.map(describePlan);
  const row = (title, values) => `| ${title} | ${values.map(escape).join(' | ')} |`;
  return [
    '# Build option comparison',
    '',
    row(
      'Option',
      descriptions.map((p) => p.name),
    ),
    `|---|${configs.map(() => '---|').join('')}`,
    row(
      'Outcome',
      descriptions.map((p) => p.outcome),
    ),
    row(
      'Stage',
      descriptions.map((p) => p.stage),
    ),
    row(
      'Included',
      descriptions.map((p) => p.included.join('; ')),
    ),
    row(
      'Deferred',
      descriptions.map((p) => p.deferred.join('; ')),
    ),
    row(
      'Design',
      descriptions.map((p) => p.design.label),
    ),
    row(
      'Stack',
      configs.map((c, i) =>
        [descriptions[i].frontend.label, ...stackItems(c).map((r) => `${r.label}: ${r.name}`)].join(
          '; ',
        ),
      ),
    ),
    row(
      `Infrastructure / month (${TIERS[state.tier].label} for every option)`,
      configs.map((c) => fmtUsd(totalsForConfig(c)[state.tier])),
    ),
    row(
      'Example',
      descriptions.map((p) => p.example),
    ),
    row(
      'Benefits',
      configs.map(
        (c) =>
          recipeInsights(c)
            .providers.map((r) => `${r.name}: ${r.benefit}`)
            .join('; ') || 'No external services',
      ),
    ),
    row(
      'Service downsides',
      configs.map(
        (c) =>
          recipeInsights(c)
            .providers.map((r) => `${r.name}: ${r.tradeoff}`)
            .join('; ') || 'Local persistence and file backups',
      ),
    ),
    row('Price confidence', configs.map(evidenceSummary)),
    row('Build allowance', configs.map(budgetText)),
    row(
      'Work',
      descriptions.map((p) => p.effort),
    ),
    row(
      'Access',
      configs.map((c) => accessLines(c).join('; ')),
    ),
    row(
      'Limitations',
      descriptions.map((p) => p.limitation),
    ),
    row(
      'Upgrade trigger',
      descriptions.map((p) => p.nextTrigger),
    ),
    '',
    'All costs use the same scenario and current catalogue data. They exclude AI usage, labor, maintenance and transaction fees.',
  ].join('\n');
}
export function buildNextPrompt(baseline, current = state) {
  const before = describePlan(baseline),
    after = describePlan(current);
  const oldRows = stackItems(baseline),
    newRows = stackItems(current);
  return [
    `# Next iteration: ${before.name} → ${after.name}`,
    '',
    'Treat the baseline as implemented only after checking the repository. Preserve its working behavior.',
    `Baseline outcome: ${before.outcome}`,
    `Target outcome: ${after.outcome}`,
    '',
    '## Scope changes',
    ...list(after.included.filter((x) => !before.included.includes(x)).map((x) => `Add: ${x}`)),
    ...list(
      before.included
        .filter((x) => !after.included.includes(x))
        .map((x) => `Review removal or replacement: ${x}`),
    ),
    '',
    '## Stack changes',
    ...newRows
      .filter((r) => !oldRows.some((o) => o.key === r.key && o.name === r.name))
      .map((r) => `- ${r.label}: ${r.name}`),
    ...oldRows
      .filter((r) => !newRows.some((n) => n.key === r.key))
      .map((r) => `- Retire ${r.label}: ${r.name}; preserve/export its data before removal.`),
    `- Frontend: ${before.frontend.label} → ${after.frontend.label}`,
    `- Design: ${before.design.label} → ${after.design.label}`,
    '',
    '## Target design and repository',
    `${after.design.pattern}. ${after.design.details}`,
    current.context || 'Inspect repository instructions first.',
    '',
    '## Target acceptance criteria',
    ...list(after.acceptance),
    '',
    '## Access for the target',
    ...accessLines(current),
    '',
    '## Target costs and assumptions',
    `${fmtUsd(totalsForConfig(current)[current.tier])}/month infrastructure (${TIERS[current.tier].label}); usage: ${usageSummary(current)}.`,
    evidenceSummary(current),
    budgetText(current),
    '',
    '## Still deferred',
    ...list(after.deferred),
    '',
    ...planWarnings(current).map((w) => `UNRESOLVED: ${w}`),
    'Keep secret values out of prompts and client code; follow the access guide for variable placement.',
    'Implement only this delta. Report migrations, regression checks and unresolved assumptions. Never discard existing data to fit the target.',
    `Next trigger: ${after.nextTrigger}`,
  ].join('\n');
}
