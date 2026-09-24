import { recipeInsights, serviceBenefits } from './insights.js';
import { state, exportPlan } from './state.js';
import { describePlan, stackItems, planWarnings } from './plan.js';
import { accessFor } from './access.js';
import { costEvidence } from './data-evidence.js';
import { totalsForConfig } from './costmodel.js';
import { budgetEstimate } from './budget.js';
export function contractFor(cfg) {
  return {
    ...describePlan(cfg),
    repositoryContext: cfg.context,
    insights: recipeInsights(cfg),
    stack: stackItems(cfg).map((r) => ({
      capability: r.label,
      provider: r.name,
      omitted: r.option?.type === 'none',
      bundledWith: r.owner?.name || null,
      benefit: r.option ? serviceBenefits(r.key, cfg.picks[r.key]) : `Included in ${r.owner?.name}`,
      downside: r.option?.gotcha || null,
      pricing: r.option
        ? {
            free: r.option.free,
            entry: r.option.entry,
            scenarios: r.option.cost,
            fees: r.option.revshare || null,
          }
        : null,
      exitNote: r.option?.exitNote || null,
      implementation: r.option?.rule || null,
    })),
    access: accessFor(cfg),
    acceptanceWarnings: planWarnings(cfg),
    costs: {
      currency: 'USD',
      scenario: cfg.tier,
      monthlyInfrastructure: totalsForConfig(cfg)[cfg.tier],
      annualInfrastructure: 12 * totalsForConfig(cfg)[cfg.tier],
      basis: 'Editorial scenarios, not a workload forecast',
      usageAssumptions: cfg.usage,
      buildBudget: budgetEstimate(cfg),
      evidence: costEvidence(cfg),
      exclusions: [
        'Taxes',
        'Variable payment and billing fees',
        'Unspecified labor, AI usage and maintenance',
      ],
    },
  };
}
// Derived contracts travel with JSON so another tool does not need Doorman's catalogue.
// Import uses configuration fields only, recalculating derived contracts from current data.
export function buildArtifact() {
  return {
    ...exportPlan(),
    contract: contractFor(state),
    savedContracts: state.candidates.map(contractFor),
  };
}
