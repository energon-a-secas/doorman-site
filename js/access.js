// Stable tutorial IDs; Échéance owns the detailed instructions and their review dates.
import { externalServices } from './plan.js';
const ROOT = 'https://echeance.neorgon.com/#tutorial/';
const GUIDES = {
  cfstatic: [
    'wrangler-oauth',
    'CLI OAuth or scoped API token',
    'Cloudflare account and Pages project',
    'CLOUDFLARE_API_TOKEN (automation secret); CLOUDFLARE_ACCOUNT_ID (identifier)',
    'npx wrangler whoami',
  ],
  cfpages: [
    'wrangler-oauth',
    'CLI OAuth or scoped API token',
    'Cloudflare account and project',
    'CLOUDFLARE_API_TOKEN (automation secret); CLOUDFLARE_ACCOUNT_ID (identifier)',
    'npx wrangler whoami',
  ],
  ghPages: [
    'gh-cli',
    'GitHub CLI login',
    'Repository and Pages settings',
    'GH_TOKEN (optional automation secret)',
    'gh auth status --active --hostname github.com',
  ],
  supabase: [
    'supabase-access',
    'CLI login + application API keys',
    'Supabase development project',
    'SUPABASE_ACCESS_TOKEN (management secret); SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY (client configuration)',
    'supabase projects list; separately test application authorization',
  ],
  convex: [
    'convex-cli',
    'CLI login or deployment key',
    'Convex team and development deployment',
    'CONVEX_DEPLOYMENT (identifier); CONVEX_DEPLOY_KEY (automation secret)',
    'npx convex data without a table argument',
  ],
  stripe: [
    'stripe-sandbox',
    'Restricted sandbox API key',
    'Stripe sandbox and webhook',
    'STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET (server secrets); STRIPE_PUBLISHABLE_KEY (client)',
    'Confirm sandbox; test webhook signature rejection locally',
  ],
  resend: [
    'resend-sending',
    'Sending API key + verified domain',
    'Resend account and sending domain',
    'RESEND_API_KEY (server secret)',
    'Confirm domain verification; test sending only to an agreed recipient',
  ],
  vercel: [
    'vercel-cli',
    'CLI login or automation token',
    'Vercel team, project and environment',
    'VERCEL_TOKEN (automation secret); VERCEL_ORG_ID / VERCEL_PROJECT_ID (identifiers)',
    'vercel whoami; inspect linked project',
  ],
  netlify: [
    'netlify-cli',
    'CLI login or automation token',
    'Netlify team and linked site',
    'NETLIFY_AUTH_TOKEN (automation secret); NETLIFY_SITE_ID (identifier)',
    'netlify status',
  ],
  airtable: [
    'airtable-pat',
    'Scoped personal access token',
    'Airtable workspace and base',
    'AIRTABLE_TOKEN (server secret)',
    'Follow the guide and verify base access',
  ],
  clerk: [
    'clerk-instance',
    'Dashboard application keys',
    'Clerk development instance',
    'CLERK_SECRET_KEY (server secret); client publishable key',
    'Verify development instance and redirect settings',
  ],
};
export function accessFor(cfg) {
  return externalServices(cfg).map((row) => {
    const key = cfg.picks[row.key],
      guide = GUIDES[key];
    return {
      name: row.name,
      category: row.label,
      method:
        guide?.[1] ||
        (row.option.strategy === 'oss' ? 'Local setup or server access' : 'Provider-specific setup'),
      human: guide?.[2] || 'Confirm the target account or server and the required permissions.',
      variables:
        guide?.[3] || 'Determine variable names from the official documentation; no values in this plan.',
      verify: guide?.[4] || 'Use a non-mutating identity or capability check before writes.',
      tutorialId: guide?.[0] || null,
      url: guide ? ROOT + guide[0] : row.option.url,
      guideStatus: guide
        ? 'Follow the guide’s review date and verification status.'
        : 'No mapped guide yet; official documentation is the fallback.',
    };
  });
}
export function accessLines(cfg) {
  const rows = accessFor(cfg);
  return rows.length
    ? rows.flatMap((r) => [
        `- ${r.name}: ${r.method}. Human setup: ${r.human}.`,
        `  Variables: ${r.variables}. Verify: ${r.verify}.`,
        `  Guide: ${r.url || 'Confirm current official setup documentation.'} ${r.guideStatus}`,
      ])
    : ['No external access is required for this iteration.'];
}
