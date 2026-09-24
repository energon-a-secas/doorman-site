import { serviceBenefits } from './insights.js';
// Discovery is independent of the selected recipe or implementation stage.
import { CATEGORIES } from './data-services.js';
import { evidenceFor } from './data-evidence.js';
export const CATALOGUE_PAGE_SIZE = 10;
export function serviceCatalogue({ query = '', category = '', strategy = '' } = {}) {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  return Object.entries(CATEGORIES)
    .flatMap(([catKey, cat]) =>
      Object.entries(cat.options)
        .filter(([, option]) => option.type !== 'none')
        .map(([key, option]) => ({
          category: catKey,
          categoryLabel: cat.label,
          categoryBlurb: cat.blurb,
          key,
          option,
          evidence: evidenceFor(catKey, key),
        })),
    )
    .filter(
      (row) =>
        (!category || row.category === category) &&
        (!strategy || row.option.strategy === strategy) &&
        terms.every((term) =>
          [
            row.categoryLabel,
            row.categoryBlurb,
            row.option.name,
            row.option.free,
            row.option.entry,
            row.option.gotcha,
            row.option.exitNote,
            ...(row.option.bundles || []),
          ]
            .join(' ')
            .toLowerCase()
            .includes(term),
        ),
    );
}
export function serviceBrief(category, key) {
  const cat = CATEGORIES[category],
    option = cat?.options[key];
  if (!option) throw new Error('This service is not in the catalogue.');
  const evidence = evidenceFor(category, key);
  return [
    `# ${option.name}`,
    `Capability: ${cat.label}`,
    `Benefit: ${serviceBenefits(category, key)}`,
    `Approach: ${option.strategy || 'omitted'}`,
    `Free allowance: ${option.free || 'Not recorded'}`,
    `Paid entry: ${option.entry}`,
    `Monthly scenarios: Hobby $${option.cost.hobby}; Launched $${option.cost.launched}; Scaling $${option.cost.scaling}. Editorial assumptions, not a workload forecast.`,
    ...(option.revshare ? [`Variable fees: ${option.revshare}`] : []),
    `Tradeoff: ${option.gotcha}`,
    `Bundles: ${(option.bundles || []).map((c) => CATEGORIES[c].label).join(', ') || 'No bundled capabilities recorded'}`,
    `Exit: ${option.exit || 'Not rated'}. ${option.exitNote || ''}`,
    ...(option.rule ? [`Implementation insight: ${option.rule}`] : []),
    `Evidence: ${evidence.status}; checked ${evidence.checkedAt || 'not recorded'}. ${evidence.note}`,
    `Source: ${evidence.source || option.url}`,
    '',
    'Assess this service against the actual workflow. Browsing or copying it does not add it to the build plan.',
  ].join('\n');
}
