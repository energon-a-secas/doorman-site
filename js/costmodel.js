// Infrastructure arithmetic. Published plan facts live separately from scenario assumptions.
import { categoryKeys, resolveStrategy, ownerOf } from './config.js';
import { CATEGORIES } from './data-services.js';
import { state } from './state.js';

export function infraRows(cfg = state) {
  return categoryKeys(cfg).map((catKey) => {
    const option = CATEGORIES[catKey].options[cfg.picks[catKey]];
    const owner = cfg.picks[catKey] === 'bundled' ? ownerOf(cfg, catKey) : null;
    return {
      catKey,
      label: CATEGORIES[catKey].label,
      name: owner?.name || option?.name || 'Unknown',
      bundled: !!owner,
      type: option?.type,
      cost: owner
        ? { hobby: 0, launched: 0, scaling: 0 }
        : option?.cost || { hobby: NaN, launched: NaN, scaling: NaN },
    };
  });
}
export function totalsForConfig(cfg) {
  const totals = { hobby: 0, launched: 0, scaling: 0 };
  for (const row of infraRows(cfg)) for (const tier of Object.keys(totals)) totals[tier] += row.cost[tier];
  return totals;
}
export function infraTotals() {
  return totalsForConfig(state);
}
export function strategyTotals(strategy) {
  return totalsForConfig(resolveStrategy(state, strategy));
}
export function freeTotals() {
  return strategyTotals('free');
}
export function yearOneTotal() {
  return 12 * infraTotals()[state.tier];
}

export function activeGotchas() {
  return categoryKeys(state).flatMap(c=>{
    const pick=CATEGORIES[c].options[state.picks[c]];
    return pick?.type !== 'none' && pick?.gotcha ? [{from:pick.name,text:pick.gotcha}] : [];
  });
}
