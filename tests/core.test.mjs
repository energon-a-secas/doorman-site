import { test } from 'node:test';
import assert from 'node:assert/strict';
import { RECIPES } from '../js/data-recipes.js';
import { recipeConfig, normalizeConfig, resolveStrategy } from '../js/config.js';
import { state, applyRecipe, applyPreset, applyStrategy, applyFreeTier } from '../js/state.js';
import { infraTotals, strategyTotals, yearOneTotal } from '../js/costmodel.js';
import { buildPrompt } from '../js/prompt.js';

test('every strategy estimate equals its applied configuration', () => {
  for (const recipe of Object.keys(RECIPES))
    for (const strategy of ['free', 'oss', 'managed']) {
      applyRecipe(recipe);
      const preview = strategyTotals(strategy);
      applyStrategy(strategy);
      assert.deepEqual(infraTotals(), preview, `${recipe}: ${strategy}`);
    }
});
test('free strategy preserves absent capabilities and already-free static hosting', () => {
  applyRecipe('staticspa');
  applyFreeTier();
  assert.equal(state.picks.database, 'none');
  assert.equal(state.picks.storage, 'none');
  assert.equal(state.picks.hosting, 'ghPages');
  assert.deepEqual(infraTotals(), { hobby: 0, launched: 0, scaling: 0 });
});
test('normalization accepts real recipes and rejects invalid shares without state mutation', () => {
  for (const recipe of Object.keys(RECIPES))
    assert.equal(normalizeConfig(recipeConfig(recipe)).recipe, recipe);
  const before = structuredClone(state);
  for (const payload of [
    { recipe: 'saas', frontend: 'invalid' },
    { recipe: 'saas', tier: 'invalid' },
    { recipe: 'saas', picks: null },
    { recipe: 'constructor' },
    { recipe: 'saas', picks: { auth: 'bundled' } },
  ]) {
    assert.throws(() => normalizeConfig(payload));
  }
  assert.deepEqual(state, before);
});
test('preset identity survives configuration roundtrip and build export', () => {
  applyPreset('notion');
  assert.equal(normalizeConfig(JSON.parse(JSON.stringify(state))).preset, 'notion');
  assert.match(buildPrompt(), /Reference: Notion/);
});
test('annual infra uses the selected scenario and excludes AI build', () => {
  applyRecipe('saas');
  state.tier = 'hobby';
  assert.equal(yearOneTotal(), 0);
  state.tier = 'launched';
  assert.equal(yearOneTotal(), 12 * infraTotals().launched);
});
test('a managed dependency without an OSS alternative is still charged', () => {
  const cfg = resolveStrategy(recipeConfig('saas'), 'oss');
  assert.equal(cfg.picks.email, 'resend');
  const withoutEmail = { ...cfg, picks: { ...cfg.picks, email: 'none' } };
  assert.equal(totalsForConfig(cfg).launched - totalsForConfig(withoutEmail).launched, 20);
});

import { STAGES, stageConfig } from '../js/data-stages.js';
import { CATEGORIES } from '../js/data-services.js';
import { totalsForConfig } from '../js/costmodel.js';
import { pickConfig } from '../js/config.js';
import {
  applyStage,
  applyCustomRecipe,
  snapshot,
  saveCandidate,
  restoreCandidate,
  importPlan,
  checkpoint,
  undo,
} from '../js/state.js';
import { buildArtifact } from '../js/export.js';
import { buildNextPrompt } from '../js/prompt.js';
import { budgetEstimate } from '../js/budget.js';
import { costEvidence } from '../js/data-evidence.js';
import { accessFor } from '../js/access.js';
import { readFileSync, existsSync } from 'node:fs';

test('every curated stage is valid, priced from reviewed sources and exportable', () => {
  for (const [recipe, stages] of Object.entries(STAGES))
    for (const stage of stages) {
      const cfg = normalizeConfig(stageConfig(recipe, stage.key));
      assert.deepEqual(cfg.picks, stage.picks);
      assert.ok(stage.acceptance.length > 1);
      for (const row of costEvidence(cfg)) assert.equal(row.status, 'docs-reviewed');
      for (const strategy of ['free', 'oss', 'managed']) {
        Object.assign(state, cfg);
        const preview = strategyTotals(strategy);
        applyStrategy(strategy);
        assert.deepEqual(infraTotals(), preview, `${recipe}/${stage.key}/${strategy}`);
        assert.doesNotThrow(() => normalizeConfig(state));
      }
    }
});
test('every legacy recipe strategy resolves valid bundles', () => {
  for (const recipe of Object.keys(RECIPES))
    for (const strategy of ['free', 'oss', 'managed'])
      assert.doesNotThrow(
        () => normalizeConfig(resolveStrategy(recipeConfig(recipe), strategy)),
        `${recipe}/${strategy}`,
      );
});
test('service swaps preserve deliberate omissions and repair abandoned bundles', () => {
  let cfg = recipeConfig('saas');
  cfg.picks.auth = 'none';
  cfg = pickConfig(cfg, 'database', 'supabase');
  assert.equal(cfg.picks.auth, 'none');
  cfg.picks.auth = 'bundled';
  cfg = pickConfig(cfg, 'database', 'neon');
  assert.notEqual(cfg.picks.auth, 'bundled');
  assert.doesNotThrow(() => normalizeConfig(cfg));
});
test('scope changes preserve the independent cost scenario, workload and budget', () => {
  applyRecipe('pathfinder');
  state.tier = 'launched';
  state.usage.visitors = '4200';
  state.budget.aiBuild = '35';
  applyStage('team');
  assert.equal(state.tier, 'launched');
  assert.equal(state.usage.visitors, '4200');
  assert.equal(state.budget.aiBuild, '35');
  assert.equal(infraTotals().launched, 25);
});
test('local and static Pathfinder do not imply Workers or database charges', () => {
  for (const key of ['local', 'share'])
    assert.deepEqual(totalsForConfig(stageConfig('pathfinder', key)), {
      hobby: 0,
      launched: 0,
      scaling: 0,
    });
});
test('JSON is self-contained, round-trips candidates and rejects malformed imports atomically', () => {
  applyRecipe('pathfinder');
  state.candidates = [];
  state.name = 'Local baseline';
  state.context = 'Existing portable documents';
  saveCandidate();
  applyStage('team');
  state.name = 'Private team';
  state.budget.aiBuild = '100';
  const artifact = buildArtifact();
  assert.equal(artifact.schemaVersion, 2);
  assert.equal(artifact.contract.acceptance.length, 4);
  assert.equal(
    artifact.contract.stack.find((r) => r.capability === 'Auth').bundledWith,
    'Supabase',
  );
  assert.equal(artifact.savedContracts[0].name, 'Local baseline');
  const before = snapshot();
  importPlan(JSON.parse(JSON.stringify(artifact)));
  assert.deepEqual(snapshot(), before);
  for (const invalid of [
    { ...artifact, candidates: [{ recipe: 'invalid' }] },
    { ...artifact, picks: { database: 'nonsense' } },
    { ...artifact, candidates: {} },
    { ...artifact, schemaVersion: 99 },
  ]) {
    assert.throws(() => importPlan(invalid));
    assert.deepEqual(snapshot(), before);
  }
  checkpoint();
  restoreCandidate(0);
  assert.equal(state.name, 'Local baseline');
  undo();
  assert.equal(state.name, 'Private team');
});
test('next iteration export describes changes and preserves existing data', () => {
  const baseline = stageConfig('pathfinder', 'local'),
    target = stageConfig('pathfinder', 'team');
  const prompt = buildNextPrompt(baseline, target);
  assert.match(prompt, /Add: Private accounts/);
  assert.match(prompt, /Supabase/);
  assert.match(prompt, /Never discard existing data/);
  assert.match(prompt, /#tutorial\/supabase-access/);
  assert.match(prompt, /Target acceptance criteria/);
});
test('blank budget stays unknown; explicit zero and user inputs are calculated', () => {
  const cfg = stageConfig('pathfinder', 'local');
  assert.equal(budgetEstimate(cfg).complete, false);
  cfg.budget = {
    aiBuild: '25',
    hours: '10',
    hourlyRate: '20',
    otherSetup: '0',
    maintenanceMonthly: '0',
  };
  assert.equal(budgetEstimate(cfg).setup, 225);
  assert.equal(budgetEstimate(cfg).complete, true);
  assert.equal(budgetEstimate(cfg).maintenance, 0);
});
test('all mapped access links correspond to Échéance tutorial IDs', (t) => {
  const file = new URL('../../echeance-site/data/tutorial-index.json', import.meta.url);
  if (!existsSync(file)) {
    t.skip('Cross-repository check requires the sibling Échéance checkout.');
    return;
  }
  const index = JSON.parse(readFileSync(file));
  const ids = new Set(index.tutorials.map((t) => t.id));
  for (const [category, data] of Object.entries(CATEGORIES))
    for (const key of Object.keys(data.options)) {
      const cfg = recipeConfig('blank');
      cfg.picks[category] = key;
      for (const access of accessFor(cfg))
        if (access.tutorialId) assert.ok(ids.has(access.tutorialId), access.tutorialId);
    }
});

test('missing or invalid costs are unknown rather than free', () => {
  const cfg = recipeConfig('saas');
  cfg.picks.hosting = 'missing-provider';
  assert.ok(Number.isNaN(totalsForConfig(cfg).hobby));
});

test('custom recipes remain valid and support deliberate low-cost omissions', () => {
  for (const [recipe, stages] of Object.entries(STAGES)) {
    applyRecipe(recipe);
    applyStage(stages.at(-1).key);
    applyCustomRecipe();
    assert.equal(state.stage, null);
    assert.deepEqual(normalizeConfig(state).picks, state.picks);
  }
  const cfg = recipeConfig('blank');
  for (const [category, data] of Object.entries(CATEGORIES)) {
    const omitted = Object.entries(data.options).find(([, o]) => o.type === 'none');
    assert.ok(omitted, category);
    cfg.picks[category] = omitted[0];
  }
  for (const strategy of ['free', 'oss', 'managed']) {
    assert.deepEqual(resolveStrategy(cfg, strategy).picks, cfg.picks);
    assert.deepEqual(totalsForConfig(cfg), { hobby: 0, launched: 0, scaling: 0 });
  }
});

import { describePlan } from '../js/plan.js';
import { PRESETS } from '../js/data-presets.js';
import { serviceCatalogue, serviceBrief } from '../js/catalogue.js';
import { applyCompleteRecipe } from '../js/state.js';
import { buildComparison } from '../js/prompt.js';

test('ready recipes and familiar references have distinct concrete workflows', () => {
  const examples = Object.keys(RECIPES).map((key) => describePlan(recipeConfig(key)).example);
  assert.equal(new Set(examples).size, Object.keys(RECIPES).length);
  const references = Object.keys(PRESETS).map((key) => {
    applyPreset(key);
    return describePlan(state).example;
  });
  assert.equal(new Set(references).size, Object.keys(PRESETS).length);
  applyPreset('notion');
  applyStage('local');
  assert.match(buildPrompt(), /Create and edit text notes/);
  assert.doesNotMatch(describePlan(state).example, /subscription/);
  applyRecipe('saas');
  applyStage('local');
  assert.match(buildPrompt(), /client-project records/);
  assert.doesNotMatch(describePlan(state).example, /subscription/);
});
test('all services stay discoverable when the chosen iteration is local', () => {
  applyRecipe('pathfinder');
  applyStage('local');
  const before = snapshot();
  assert.equal(serviceCatalogue().length, 77);
  assert.equal(serviceCatalogue({ category: 'email' }).length, 4);
  assert.equal(serviceCatalogue({ query: 'Supabase' })[0].key, 'supabase');
  assert.equal(serviceCatalogue({ query: 'not-a-service' }).length, 0);
  const brief = serviceBrief('database', 'supabase');
  for (const label of ['Benefit:', 'Tradeoff:', 'Paid entry:', 'Exit:', 'Source:'])
    assert.ok(brief.includes(label));
  assert.deepEqual(snapshot(), before);
});
test('full recipe restoration keeps preset identity and independent assumptions', () => {
  applyPreset('substack');
  applyStage('local');
  state.budget.aiBuild = '42';
  state.tier = 'launched';
  state.context = 'Existing article URLs';
  applyCompleteRecipe();
  assert.equal(state.stage, null);
  assert.equal(state.preset, 'substack');
  assert.equal(state.picks.email, 'brevo');
  assert.equal(state.tier, 'launched');
  assert.equal(state.budget.aiBuild, '42');
  assert.equal(state.context, 'Existing article URLs');
});
test('provider combinations and machine exports carry usable tradeoffs', () => {
  applyRecipe('saas');
  state.ui.compareMode = 'providers';
  const options = [state,resolveStrategy(state,'oss'),resolveStrategy(state,'managed')];
  assert.equal(options.length, 3);
  assert.deepEqual(options[1].picks, resolveStrategy(state, 'oss').picks);
  const comparison = buildComparison(options);
  assert.match(comparison, /Service downsides/);
  assert.match(comparison, /Benefits/);
  const contract = buildArtifact().contract;
  assert.ok(contract.stack[0].benefit && contract.stack[0].downside && contract.stack[0].pricing);
  assert.ok(contract.insights.challenges.length);
});
