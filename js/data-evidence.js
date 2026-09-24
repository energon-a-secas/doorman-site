// Sources reviewed 2026-09-20. Review of a plan does not validate an arbitrary workload.
import { CATEGORIES } from './data-services.js';
import { categoryKeys, ownerOf } from './config.js';
const checkedAt = '2026-09-20';
export const EVIDENCE = {
  'hosting.cfstatic': {
    source: 'https://developers.cloudflare.com/pages/functions/pricing/',
    unit: 'Static requests; build and file limits apply',
    note: '$0 static requests in all scenarios; no Functions. Build/file limits: https://developers.cloudflare.com/pages/platform/limits/',
  },
  'hosting.cfpages': {
    source: 'https://developers.cloudflare.com/workers/platform/pricing/',
    unit: 'Subscription + requests + CPU time',
    note: 'Workers Paid starts at $5/month. Scaling $25 is an editorial allowance, not a provider plan.',
  },
  'hosting.netlify': {
    source: 'https://www.netlify.com/pricing/',
    unit: 'Monthly usage credits across the account',
    note: 'Hobby uses Free; Launched uses Personal; Scaling uses entry Pro. Credit use and optional recharge are additional assumptions.',
  },
  'hosting.ghPages': {
    source: 'https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits',
    unit: 'Static site with usage and eligibility limits',
    note: 'Free public-repository hosting is not a general commercial SaaS or ecommerce hosting option.',
  },
  'hosting.vercel': {
    source: 'https://vercel.com/pricing',
    unit: 'Developer seats + metered usage',
    note: 'Hobby is personal/non-commercial. Launched assumes one $20 Pro seat; Scaling $100 is an editorial allowance.',
  },
  'database.supabase': {
    source: 'https://supabase.com/pricing',
    unit: 'Organization plan + project compute + usage',
    note: 'Launched assumes $25 Pro with one Micro project. Scaling $125 is an editorial allowance. Free excludes automatic backups.',
  },
  'database.convex': {
    source: 'https://www.convex.dev/pricing',
    unit: 'Developer seats + resource usage',
    note: 'Launched assumes one $25 Professional developer; Scaling assumes five seats, before usage beyond allowances. Starter is a separate usage-based option.',
  },
  'email.resend': {
    source: 'https://resend.com/pricing',
    unit: 'Emails per month and per day',
    note: 'Free: 3,000/month, 100/day. Launched: $20 Pro/50,000. Scaling: $90 Scale/100,000, before optional overage.',
  },
  'payments.stripe': {
    source: 'https://stripe.com/pricing',
    unit: 'Transactions and optional billing products',
    note: 'Only the fixed monthly charge for standard payments is modeled as $0. Country, payment method, Billing and other product fees must be estimated separately.',
  },
};
export function evidenceFor(category, option) {
  const service = CATEGORIES[category]?.options[option];
  if (service?.type === 'none')
    return {
      status: 'not-applicable',
      checkedAt: null,
      source: null,
      unit: 'No service',
      note: 'No recurring provider charge for an omitted capability.',
    };
  const entry = EVIDENCE[`${category}.${option}`];
  return entry
    ? { status: 'docs-reviewed', checkedAt, ...entry }
    : {
        status: 'needs-review',
        checkedAt: null,
        source: service?.url || null,
        unit: 'Unverified catalogue estimate',
        note: 'Legacy price and allowance have not been reverified. Treat this row as a research starting point.',
      };
}
export function costEvidence(cfg) {
  return categoryKeys(cfg).map((category) => {
    const owner = cfg.picks[category] === 'bundled' ? ownerOf(cfg, category) : null;
    return {
      category,
      option: cfg.picks[category],
      bundledWith: owner?.name || null,
      ...evidenceFor(owner?.catKey || category, owner?.optKey || cfg.picks[category]),
    };
  });
}
export function evidenceSummary(cfg) {
  const rows = costEvidence(cfg).filter((r) => !r.bundledWith && r.status !== 'not-applicable');
  const unverified = rows.filter((r) => r.status === 'needs-review').length;
  return !rows.length
    ? 'No external provider prices.'
    : unverified
      ? `${unverified} of ${rows.length} provider prices need review.`
      : `Provider plan details reviewed ${checkedAt}; workload estimates remain assumptions.`;
}
