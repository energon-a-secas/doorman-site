import { BUDGET_DEFAULTS, normalizeBudget } from './budget.js';
// Pure configuration rules shared by application, estimates and imports.
import { stageFor, stageConfig, stagesFor, DESIGNS, defaultDesign } from './data-stages.js';
import { CATEGORIES } from './data-services.js';
import { RECIPES, FRONTENDS, TIERS } from './data-recipes.js';
import { PRESETS } from './data-presets.js';

export const own = (object, key) => Object.prototype.hasOwnProperty.call(object, key);
export const USAGE_DEFAULTS = { visitors: '', users: '', storageGb: '' };
export function categoryKeys(cfg) {
  return stageFor(cfg) ? Object.keys(stageFor(cfg).picks) : RECIPES[cfg.recipe]?.categories || [];
}
export function defaultPick(key) {
  const options = CATEGORIES[key].options;
  return Object.keys(options).find((k) => options[k].recommended) || Object.keys(options)[0];
}
export function recipeConfig(recipe) {
  if (!own(RECIPES, recipe)) throw new Error('Choose a recipe from the list.');
  return {
    recipe,
    picks: Object.fromEntries(
      RECIPES[recipe].categories.map((c) => [c, RECIPES[recipe].defaults?.[c] || defaultPick(c)]),
    ),
    frontend: recipe === 'airtable' ? 'nocode' : 'vanilla',
    tier: 'hobby',
    preset: null,
    usage: { ...USAGE_DEFAULTS },
    budget: { ...BUDGET_DEFAULTS },
    stage: null,
    design: defaultDesign(recipe),
    name: RECIPES[recipe].label,
    objective: '',
    context: '',
  };
}
export function ownerOf(cfg, key) {
  for (const c of categoryKeys(cfg)) {
    const k = cfg.picks[c],
      option = CATEGORIES[c].options[k];
    if (c !== key && option?.bundles?.includes(key))
      return { catKey: c, optKey: k, name: option.name };
  }
  return null;
}
export function repairBundles(cfg) {
  for (const c of categoryKeys(cfg)) {
    if (cfg.picks[c] === 'bundled' && !ownerOf(cfg, c)) cfg.picks[c] = defaultPick(c);
  }
  return cfg;
}
export function pickConfig(cfg, catKey, optKey) {
  if (!categoryKeys(cfg).includes(catKey) || !own(CATEGORIES[catKey].options, optKey)) return cfg;
  const next = { ...cfg, picks: { ...cfg.picks, [catKey]: optKey } };
  for (const c of CATEGORIES[catKey].options[optKey].bundles || []) {
    // A consciously omitted capability stays omitted.
    if (categoryKeys(next).includes(c) && next.picks[c] !== 'none') next.picks[c] = 'bundled';
  }
  return repairBundles(next);
}
export function resolveStrategy(cfg, strategy) {
  if (!['oss', 'managed', 'free'].includes(strategy)) return cfg;
  const next = { ...cfg, picks: { ...cfg.picks } };
  for (const c of categoryKeys(cfg)) {
    const options = CATEGORIES[c].options;
    const current = options[cfg.picks[c]];
    if (current?.type === 'none') continue;
    if (strategy === 'free' && (current?.cost.hobby === 0 || cfg.picks[c] === 'bundled')) continue;
    const entries = Object.entries(options).filter(
      ([, o]) => o.type !== 'none' && (strategy === 'free' || o.strategy === strategy),
    );
    if (!entries.length) continue; // Keep the existing provider, and its cost.
    const hit =
      strategy === 'free'
        ? entries.find(([, o]) => o.freeTier) ||
          [...entries].sort((a, b) => a[1].cost.hobby - b[1].cost.hobby)[0]
        : (strategy === 'managed' && entries.find(([, o]) => o.recommended)) || entries[0];
    next.picks[c] = hit[0];
  }
  // Resolve from the complete candidate, independent of category iteration order.
  for (const c of categoryKeys(next)) {
    if (next.picks[c] !== 'none' && ownerOf(next, c)) next.picks[c] = 'bundled';
  }
  return repairBundles(next);
}
export function normalizeConfig(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw))
    throw new Error('The plan must be a JSON object.');
  if (!own(RECIPES, raw.recipe))
    throw new Error('This plan uses an unknown recipe. Choose a recipe to start again.');
  if (raw.frontend !== undefined && !own(FRONTENDS, raw.frontend))
    throw new Error('This plan uses an unknown frontend.');
  if (raw.tier !== undefined && !own(TIERS, raw.tier))
    throw new Error('This plan uses an unknown cost scenario.');
  if (
    raw.picks !== undefined &&
    (!raw.picks || typeof raw.picks !== 'object' || Array.isArray(raw.picks))
  )
    throw new Error('The service selections are invalid. Import a valid Doorman plan.');
  if (raw.schemaVersion !== undefined && raw.schemaVersion !== 2)
    throw new Error('This plan version is not supported.');
  if (raw.stage && !stagesFor(raw.recipe).some((s) => s.key === raw.stage))
    throw new Error('This implementation stage is not available.');
  const cfg = raw.stage ? stageConfig(raw.recipe, raw.stage) : recipeConfig(raw.recipe);
  if (raw.design && !own(DESIGNS, raw.design))
    throw new Error('This design pattern is not available.');
  cfg.design = raw.design || cfg.design;
  for (const key of ['name', 'objective', 'context']) {
    if (raw[key] !== undefined && typeof raw[key] !== 'string')
      throw new Error(`The ${key} must be text.`);
    if (raw[key] !== undefined) cfg[key] = raw[key].trim().slice(0, key === 'name' ? 80 : 4000);
  }
  cfg.frontend = raw.frontend || (raw.stage ? cfg.frontend : 'tailwind'); // Legacy exports used Tailwind by default.
  cfg.tier = raw.tier || 'hobby';
  cfg.preset =
    own(PRESETS, raw.preset) && PRESETS[raw.preset].recipe === cfg.recipe ? raw.preset : null;
  for (const c of categoryKeys(cfg)) {
    const key = raw.picks?.[c];
    if (key === undefined) continue;
    if (key !== 'bundled' && !own(CATEGORIES[c].options, key))
      throw new Error(`Unknown selection for ${CATEGORIES[c].label}.`);
    cfg.picks[c] = key;
  }
  for (const c of categoryKeys(cfg)) {
    if (cfg.picks[c] === 'bundled' && !ownerOf(cfg, c))
      throw new Error(`${CATEGORIES[c].label} has no provider for its bundle.`);
  }
  for (const key of Object.keys(USAGE_DEFAULTS)) {
    const v = raw.usage?.[key];
    cfg.usage[key] =
      v !== '' && v !== null && v !== undefined && Number.isFinite(Number(v)) && Number(v) >= 0
        ? String(Number(v))
        : '';
  }
  cfg.budget = normalizeBudget(raw.budget);
  return cfg;
}
export function parseShare(text) {
  const match = String(text).match(/#c=([^\s#]+)/);
  if (!match || match[1].length > 200000)
    throw new Error('Use a Doorman share link containing #c=.');
  try {
    return JSON.parse(decodeURIComponent(atob(match[1])));
  } catch {
    throw new Error(
      'This share link is incomplete or unreadable. Your saved plan is still available.',
    );
  }
}
