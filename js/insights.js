import { CATEGORIES } from './data-services.js';
import { RECIPES, FRONTENDS } from './data-recipes.js';
import { stackItems, describePlan } from './plan.js';
const BENEFITS = {
  cfstatic: 'Portable static files on a CDN without adding a server runtime.',
  cfpages: 'Static deployment and small server-side operations under one hosting provider.',
  vercel: 'Managed application deployments, previews and framework integrations.',
  netlify: 'Managed static deployment with previews and optional functions.',
  ghPages: 'Repository-based publishing for eligible static sites.',
  vps: 'Control over a conventional server and the ability to consolidate compatible services.',
  convex: 'Database queries, backend functions and reactive updates in one programming model.',
  supabase: 'Postgres data with integrated auth, storage and realtime capabilities.',
  neon: 'Managed Postgres with familiar SQL and portable database exports.',
  firebase: 'An integrated client SDK and managed data services for application development.',
  airtable: 'A data editor that non-developers can use directly, with forms and interfaces.',
  clerk: 'Hosted account flows and identity components reduce custom authentication UI work.',
  resend: 'An email API and domain configuration suited to application-generated messages.',
  stripe: 'Hosted checkout and billing integration, with server-side payment events.',
  r2: 'Object storage for files independently of the application database.',
  posthog: 'Product events and analysis tools for understanding actual application usage.',
  render: 'Deploy a conventional web service without maintaining the underlying server yourself.',
  railway: 'Run application services and associated data services from one deployment workspace.',
  turso: 'Use a SQLite-style database model with a hosted service and portable SQL data.',
  mongo:
    'Document-oriented storage for records whose shape fits documents better than relational joins.',
  dynamodb: 'Managed key-based data access for workloads designed around known query patterns.',
  pocketbase: 'A compact backend combining data, auth and file APIs for small applications.',
  vpsPg: 'Conventional Postgres with control over extensions, backups and deployment choices.',
  nocodb: 'A spreadsheet-style editing interface over a database you operate.',
  auth0: 'Centralize identity flows instead of implementing a complete identity service.',
  firebaseAuth: 'Account authentication that fits applications already using Firebase SDKs.',
  cognito: 'Identity integration for an application already operated in AWS.',
  betterAuth: 'Keep authentication implementation in your codebase with a library-based approach.',
  keycloak: 'Operate your own identity provider and centralize login for multiple applications.',
  s3: 'Object storage integrated with the AWS permissions and service ecosystem.',
  b2: 'A separate object-storage provider for uploads, archives and backup copies.',
  cloudinary: 'Combine media storage with image transformations and delivery.',
  minio: 'An object-storage API on infrastructure you control.',
  cloudflare: 'Put delivery, DNS and edge controls under a shared provider.',
  bunny: 'A dedicated delivery layer that can stay separate from the application host.',
  cloudfront: 'Distribute content through a CDN integrated with AWS origins and permissions.',
  fastly: 'Configure delivery and caching behavior at the edge.',
  porkbun: 'Register a domain independently of application hosting.',
  cloudflareReg: 'Keep domain registration and DNS in the same Cloudflare account.',
  namecheap: 'Manage domain registration separately from your application provider.',
  partykit: 'A room-based server model for interactive realtime application state.',
  ably: 'Managed realtime messaging without operating persistent connection infrastructure.',
  pusher: 'Hosted channels and client libraries for application events.',
  socketio: 'Control the realtime server and its event model in your own deployment.',
  inngest: 'Define background workflows with execution and retry infrastructure.',
  triggerdev: 'Run application background tasks with a dedicated job execution service.',
  qstash: 'Deliver scheduled or queued work to HTTP endpoints.',
  sqs: 'Compose queues and worker execution within an existing AWS deployment.',
  bullmq: 'Keep queue processing in your own Node and Redis infrastructure.',
  postmark: 'A transactional-email service for application notifications and delivery operations.',
  ses: 'Email delivery integrated into an AWS-operated application.',
  brevo: 'Manage mailing contacts and campaigns alongside email delivery.',
  typesense: 'A search engine for fast application queries and faceted browsing.',
  algolia: 'Hosted search tooling without operating the search cluster yourself.',
  meilisearch: 'Control a dedicated search index with a self-hostable search engine.',
  pgfts: 'Search records inside Postgres without synchronizing a separate search service.',
  decap: 'Keep content as version-controlled files while offering editors a CMS interface.',
  sanity: 'A hosted content workspace for structured content shared across views.',
  strapi: 'Run a content API and editorial interface on infrastructure you choose.',
  payload: 'Define content types and editing behavior alongside application code.',
  contentful: 'A hosted content API and editorial workspace separate from the frontend.',
  paddle: 'Use a merchant-of-record checkout model for eligible digital products.',
  lemonsqueezy: 'Use a merchant-of-record storefront and checkout for eligible digital goods.',
  polar:
    'Integrate digital-product payments through a developer-oriented merchant-of-record service.',
  ga4: 'Use hosted traffic and acquisition reporting without maintaining an analytics server.',
  umami: 'A focused analytics interface with a self-hosting option.',
  plausible: 'A focused site-analytics workflow with fewer reporting controls to configure.',
  cfanalytics: 'Add basic site-traffic reporting alongside a Cloudflare workflow.',
  sentry: 'Investigate application errors with event context and diagnostic tooling.',
  betterstack: 'Combine operational visibility and incident response in one service.',
  uptimerobot: 'External availability checks without running a monitoring server.',
  grafana: 'Combine dashboards with telemetry from the application and infrastructure.',
  anthropic: 'Call Claude models from application code through a hosted API.',
  openai: 'Call OpenAI models and supported tools through a hosted API.',
  gemini: 'Call Gemini models from application code through a hosted API.',
  openweight: 'Compare hosted open-weight models without operating the inference infrastructure.',
};
export function serviceBenefits(category, option) {
  const o = CATEGORIES[category]?.options[option];
  if (!o || o.type === 'none')
    return 'Fewer integrations and no separate provider charge for this capability.';
  return (
    BENEFITS[option] ||
    `${CATEGORIES[category].label} through ${o.name}, using the ${o.strategy === 'oss' ? 'open-source / self-hosted' : 'managed'} approach.`
  );
}
export function recipeInsights(cfg) {
  return {
    challenges: RECIPES[cfg.recipe].challenges || [],
    frontend: FRONTENDS[cfg.frontend],
    providers: stackItems(cfg)
      .filter((r) => r.option && r.option.type !== 'none')
      .map((r) => ({
        name: r.name,
        benefit: serviceBenefits(r.key, cfg.picks[r.key]),
        tradeoff: r.option.gotcha,
        rule: r.option.rule || '',
        exit: r.option.exit || 'unrated',
        exitNote: r.option.exitNote || '',
      })),
    limitation: describePlan(cfg).limitation,
  };
}
export function insightsBrief(cfg) {
  const p = describePlan(cfg),
    data = recipeInsights(cfg);
  return [
    `# Tradeoffs: ${p.name}`,
    `Example: ${p.example}`,
    '',
    '## Recipe challenges',
    ...data.challenges.map((c) => `- ${c.title}: ${c.note}`),
    '',
    `## Frontend: ${data.frontend.label}`,
    ...data.frontend.pros.map((s) => `- Benefit: ${s}`),
    ...data.frontend.cons.map((s) => `- Downside: ${s}`),
    '',
    '## Selected services',
    ...data.providers.flatMap((r) => [
      `### ${r.name}`,
      `Benefit: ${r.benefit}`,
      `Downside: ${r.tradeoff}`,
      `Exit ${r.exit}: ${r.exitNote}`,
      r.rule ? `Implementation: ${r.rule}` : '',
      '',
    ]),
    `Scope limitation: ${p.limitation}`,
  ].join('\n');
}
