// Original cookbook token scenarios. These are illustrative assumptions, not measured effort.
import { AI_MODELS } from './data-models.js';
import { RECIPES } from './data-recipes.js';
import { state } from './state.js';
export const SIZE_LABELS = { S:'Small', M:'Medium', L:'Large', XL:'Very large' };
const TOKENS = { S:1_500_000, M:6_000_000, L:15_000_000, XL:35_000_000 };
const FRONTEND_FACTORS = { vanilla:.7, tailwind:1, framework:1.5, nocode:.25 };
export function buildTokensForConfig(cfg) {
  return Math.round(TOKENS[RECIPES[cfg.recipe].size] * FRONTEND_FACTORS[cfg.frontend]);
}
export const buildTokens = () => buildTokensForConfig(state);
export const buildCostUsd = (model,tokens) => tokens / 1_000_000 * (.75 * model.in + .25 * model.out);
export function modelCosts() {
  return Object.entries(AI_MODELS).map(([key,m])=>({...m,key,usd:buildCostUsd(m,buildTokens())})).sort((a,b)=>a.usd-b.usd);
}
export function qualityModel() {
  return modelCosts().find(m=>m.key==='sonnet-5');
}
