// Session state. All external configurations are validated before mutation.
import { stagesFor, stageConfig } from './data-stages.js';
import { CATEGORIES } from './data-services.js';
import { PRESETS } from './data-presets.js';
import {
  recipeConfig,
  repairBundles,
  normalizeConfig,
  categoryKeys,
  ownerOf,
  pickConfig,
  resolveStrategy,
  parseShare,
} from './config.js';

const STORAGE_KEY = 'doorman-cookbook-v1';
const PERSIST_KEYS = [
  'recipe',
  'picks',
  'frontend',
  'tier',
  'usage',
  'budget',
  'preset',
  'pinned',
  'stage',
  'design',
  'name',
  'objective',
  'context',
  'candidates',
];
export const state = {
  ...recipeConfig('saas'),
  candidates: [],
  pinned: null,
  ui: { openCat: null, preset: null, error: '', undo: null },
};
export const activeCategories = () => categoryKeys(state);
export function snapshot() {
  return Object.fromEntries(PERSIST_KEYS.map((k) => [k, structuredClone(state[k])]));
}
export function checkpoint() {
  state.ui.undo = snapshot();
}
export function undo() {
  if (!state.ui.undo) return;
  const previous = state.ui.undo;
  Object.assign(state, previous);
  state.ui.undo = null;
  state.ui.preset = state.preset;
}
export function applyRecipe(key) {
  Object.assign(state, recipeConfig(key));
  state.ui.preset = null;
}
export function applyCompleteRecipe() {
  const saved = {
    tier: state.tier,
    usage: state.usage,
    budget: state.budget,
    objective: state.objective,
    context: state.context,
    design: state.design,
  };
  if (state.preset) applyPreset(state.preset);
  else applyRecipe(state.recipe);
  Object.assign(state, saved);
}
export function applyCustomRecipe() {
  const cfg = recipeConfig(state.recipe);
  cfg.picks = Object.fromEntries(
    Object.keys(cfg.picks).map((key) => [key, state.picks[key] ?? cfg.picks[key]]),
  );
  state.picks = repairBundles(cfg).picks;
  state.stage = null;
  state.name = `${cfg.name} · custom`;
}
export function applyPreset(key) {
  const preset = PRESETS[key];
  if (!preset) return;
  Object.assign(state, recipeConfig(preset.recipe));
  if (!state.stage) Object.assign(state.picks, preset.picks || {});
  if (preset.frontend) state.frontend = preset.frontend;
  state.preset = state.ui.preset = key;
  state.name = preset.label + ' · starter recipe';
}
export function applyStage(key) {
  const next = stageConfig(state.recipe, key);
  Object.assign(state, next, {
    preset: state.preset,
    objective: state.objective,
    context: state.context,
    design: state.design,
    tier: state.tier,
    usage: state.usage,
    budget: state.budget,
  });
}
export function pinCurrent() {
  state.pinned = normalizeConfig(state);
}
export function unpin() {
  state.pinned = null;
}
export function pinFromShare(text) {
  try {
    state.pinned = normalizeConfig(parseShare(text));
    state.ui.error = '';
    return true;
  } catch (error) {
    state.ui.error = error.message;
    return false;
  }
}
export function applyStrategy(strategy) {
  state.picks = resolveStrategy(state, strategy).picks;
}
export function freeTierPicks() {
  return resolveStrategy(state, 'free').picks;
}
export function applyFreeTier() {
  applyStrategy('free');
  state.tier = 'hobby';
}
export function currentPick(key) {
  const option = CATEGORIES[key]?.options[state.picks[key]];
  return option ? { key: state.picks[key], ...option } : null;
}
export const bundlerFor = (key) => ownerOf(state, key);
export function setPick(cat, key) {
  state.picks = pickConfig(state, cat, key).picks;
}
function applySaved(raw) {
  const cfg = normalizeConfig(raw);
  const pinned = raw.pinned ? normalizeConfig(raw.pinned) : null;
  if (raw.candidates !== undefined && (!Array.isArray(raw.candidates) || raw.candidates.length > 2))
    throw new Error('A plan can contain up to two saved options.');
  const candidates = Array.isArray(raw.candidates)
    ? raw.candidates.slice(0, 2).map(normalizeConfig)
    : pinned
      ? [pinned]
      : [];
  Object.assign(state, cfg, { pinned, candidates });
  state.ui.preset = state.preset;
}
export function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    applySaved(JSON.parse(raw));
    return true;
  } catch (error) {
    state.ui.error ||= `Saved plan could not be loaded. ${error.message}`;
    return false;
  }
}
export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot()));
  } catch {
    state.ui.error = 'Browser storage is unavailable. Download the plan to keep your work.';
  }
}
export function exportPlan() {
  return { schemaVersion: 2, kind: 'doorman-plan', ...snapshot() };
}
export function importPlan(raw) {
  applySaved(raw);
  state.ui.error = '';
}
export function encodeShare() {
  return btoa(encodeURIComponent(JSON.stringify(exportPlan())));
}
export function saveCandidate() {
  if (state.candidates.length >= 2)
    throw new Error('Two options are saved. Remove one before adding another.');
  state.candidates.push(normalizeConfig(state));
}
export function restoreCandidate(index) {
  if (!state.candidates[index]) return;
  Object.assign(state, normalizeConfig(state.candidates[index]));
  state.ui.preset = state.preset;
}
export function removeCandidate(index) {
  state.candidates.splice(index, 1);
}
export function writeHash() {
  history.replaceState(null, '', '#c=' + encodeShare());
}
export function loadHash() {
  if (!location.hash.startsWith('#c=')) return false;
  try {
    applySaved(parseShare(location.hash));
    return true;
  } catch (error) {
    state.ui.error = error.message;
    return false;
  }
}
export function initState() {
  if (loadHash() || loadSaved()) {
    // Retain the chosen providers when opening a saved planner iteration in the cookbook.
    if (state.stage) {
      const name=state.name;applyCustomRecipe();state.name=name;
    }
    return;
  }
  applyRecipe('saas');
  state.tier='launched';
  state.frontend='tailwind';
}
