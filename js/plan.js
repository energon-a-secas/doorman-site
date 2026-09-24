import { workflowFor } from './data-examples.js';
// Describe a complete build option from the same normalized configuration used by costs.
import { RECIPES, FRONTENDS } from './data-recipes.js';
import { PRESETS } from './data-presets.js';
import { DESIGNS, stageFor } from './data-stages.js';
import { CATEGORIES } from './data-services.js';
import { categoryKeys, ownerOf } from './config.js';

export function describePlan(cfg) {
  const stage = stageFor(cfg),
    recipe = RECIPES[cfg.recipe],
    example = workflowFor(cfg, stage);
  return {
    name: cfg.name || stage?.label || recipe.label,
    example: example.example,
    reference: cfg.preset ? PRESETS[cfg.preset].label : recipe.label,
    outcome: cfg.objective || PRESETS[cfg.preset]?.objective || stage?.outcome || example.example,
    stage: stage?.label || 'Complete recipe',
    design: DESIGNS[cfg.design] || DESIGNS.workbench,
    frontend: FRONTENDS[cfg.frontend],
    included: example.included,
    deferred: stage?.deferred || ['Define secondary features before implementing them.'],
    notNeeded:
      stage?.notNeeded ||
      categoryKeys(cfg)
        .filter((c) => cfg.picks[c] === 'none')
        .map((c) => CATEGORIES[c].label),
    acceptance: example.acceptance,
    limitation:
      stage?.limitation ||
      'This is a starter combination, not a compatibility guarantee. Keep only the capabilities the workflow needs and verify provider limits before building.',
    nextTrigger: stage?.nextTrigger || 'A demonstrated user need exceeds the agreed core workflow.',
    effort: stage?.effort || 'Depends on the workflow and integrations; not calibrated.',
    steps: stage?.steps || [
      'Inspect the repository and agree the smallest working workflow.',
      'Implement the workflow with the selected capabilities.',
      'Verify the acceptance criteria and report remaining assumptions.',
    ],
  };
}
export function stackItems(cfg) {
  return categoryKeys(cfg).map((c) => {
    const option = CATEGORIES[c].options[cfg.picks[c]];
    const owner = cfg.picks[c] === 'bundled' ? ownerOf(cfg, c) : null;
    return {
      key: c,
      label: CATEGORIES[c].label,
      option,
      owner,
      name: owner ? `Included in ${owner.name}` : option?.name || 'Unknown',
    };
  });
}
export function externalServices(cfg) {
  return stackItems(cfg).filter((row) => row.option && row.option.type !== 'none');
}
export function planWarnings(cfg) {
  const warnings = [],
    stage = stageFor(cfg);
  if (cfg.frontend === 'nocode' && cfg.picks.database !== 'airtable')
    warnings.push(
      'Airtable Interfaces requires an Airtable base. Choose a code frontend or an Airtable recipe.',
    );
  if (stage && cfg.frontend === 'nocode')
    warnings.push(
      'This curated interaction scope needs a code frontend. Airtable Interfaces does not implement its specified UI.',
    );
  for (const c of Object.keys(stage?.picks || {})) {
    if (stage.picks[c] !== 'none' && cfg.picks[c] === 'none')
      warnings.push(
        `${CATEGORIES[c].label} supports this stage’s included features. Choose a smaller stage or restore a provider before building.`,
      );
  }
  if (stage?.key === 'team' && cfg.picks.database === 'airtable')
    warnings.push(
      'Airtable editor access is not the private customer/team authorization required by this stage. Choose a backend that supports the access model.',
    );
  if (cfg.picks.hosting === 'ghPages' && ['saas', 'ecommerce', 'marketplace'].includes(cfg.recipe))
    warnings.push(
      'GitHub Pages excludes commercial SaaS and ecommerce hosting. Verify eligibility or choose another host.',
    );
  if (cfg.picks.hosting === 'vercel' && cfg.tier === 'hobby')
    warnings.push(
      'Vercel Hobby is for personal, non-commercial use. Choose a paid scenario for commercial work.',
    );
  for (const [category, expected] of Object.entries(stage?.picks || {})) {
    if (
      !['bundled', 'none'].includes(cfg.picks[category]) &&
      cfg.picks[category] !== expected &&
      expected !== 'bundled'
    )
      warnings.push(
        `This stage was designed with ${CATEGORIES[category].options[expected]?.name || expected} for ${CATEGORIES[category].label}. Verify that the replacement supports the included workflow and update the implementation steps.`,
      );
  }
  if (['aiwrapper', 'docsbot'].includes(cfg.recipe) && cfg.picks.aiApi === 'none')
    warnings.push(
      'With no hosted AI API, define a local-model or deterministic alternative and its requirements before promising AI features.',
    );
  return warnings;
}
