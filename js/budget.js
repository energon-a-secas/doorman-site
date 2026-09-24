// Explicit user assumptions. Empty means unknown, not zero or a hidden model forecast.
export const BUDGET_DEFAULTS = {
  aiBuild: '',
  hours: '',
  hourlyRate: '',
  otherSetup: '',
  maintenanceMonthly: '',
};
export const BUDGET_FIELDS = [
  ['aiBuild', 'AI tools / API allowance for this build (USD)'],
  ['hours', 'Implementation hours'],
  ['hourlyRate', 'Value or rate per hour (USD)'],
  ['otherSetup', 'Other one-time costs (USD)'],
  ['maintenanceMonthly', 'Monthly maintenance allowance (USD)'],
];
export function normalizeBudget(raw) {
  return Object.fromEntries(
    Object.keys(BUDGET_DEFAULTS).map((k) => {
      const v = raw?.[k];
      return [
        k,
        v !== '' && v !== undefined && v !== null && Number.isFinite(Number(v)) && Number(v) >= 0
          ? String(Number(v))
          : '',
      ];
    }),
  );
}
export function budgetEstimate(cfg) {
  const b = normalizeBudget(cfg.budget);
  const labor = b.hours !== '' && b.hourlyRate !== '' ? Number(b.hours) * Number(b.hourlyRate) : null;
  const setup = Number(b.aiBuild) + Number(b.otherSetup) + (labor || 0);
  return {
    ...b,
    labor,
    setup,
    complete: b.aiBuild !== '' && b.otherSetup !== '' && labor !== null,
    maintenance: b.maintenanceMonthly === '' ? null : Number(b.maintenanceMonthly),
  };
}
export function budgetText(cfg) {
  const b = budgetEstimate(cfg);
  if (Object.keys(BUDGET_DEFAULTS).every((k) => b[k] === ''))
    return 'Build and maintenance budget not specified. Enter your own AI allowance, hours and rate; no token forecast is inferred.';
  return `Build ${b.complete ? 'estimate' : 'known subtotal'}: $${b.setup.toFixed(2)}. AI allowance: ${b.aiBuild === '' ? 'unknown' : '$' + b.aiBuild}; labor: ${b.labor === null ? 'unknown' : '$' + b.labor.toFixed(2)}; other setup: ${b.otherSetup === '' ? 'unknown' : '$' + b.otherSetup}. Maintenance: ${b.maintenance === null ? 'unknown' : '$' + b.maintenance + '/month'}. User assumptions, excluding infrastructure, taxes and variable fees.`;
}
