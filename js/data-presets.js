// ── Copy-a-real-site presets ─────────────────────────────────
// Familiar workflow references, not claims about the original companies' stacks.
//
// Preset shape:
//   label    the product name people recognise
//   recipe   RECIPES key applied first
//   picks    optional overrides applied after the recipe defaults
//            (same bypass-setPick semantics as recipe defaults)
//   frontend optional FRONTENDS override
//   wontGet  the honest line: what the copy does not buy you.
//            Shown in the glance panel until the next recipe change.

export const PRESETS = {
  pathfinder: {
    objective: 'Map a project as connected decisions and export a useful build brief.',
    label: 'Pathfinder',
    recipe: 'pathfinder',
    wontGet: 'A planning canvas first. Live co-editing and private cloud ownership are separate iterations.',
  },
  airbnb: {
    objective: 'Let guests find an available listing and request a booking from its owner.',
    label: 'Airbnb',
    recipe: 'marketplace',
    wontGet:
      'The software is the cheap half. Supply, trust and insurance are the moat, and they took a decade.',
  },
  substack: {
    objective: 'Publish and browse a focused collection of articles.',
    label: 'Substack',
    recipe: 'content',
    picks: { email: 'brevo', cms: 'decap' },
    wontGet:
      'Deliverability reputation and the recommendation network are the product, not the editor. Paid posts also mean adding the payments ingredient.',
  },
  discord: {
    objective: 'Let a small group exchange messages in named channels.',
    label: 'Discord',
    recipe: 'chat',
    wontGet: 'Voice infrastructure and moderation tooling at scale are each their own company.',
  },
  notion: {
    objective: 'Create, edit and organize simple text notes in a small workspace.',
    label: 'Notion',
    recipe: 'saas',
    frontend: 'framework',
    wontGet:
      'Start with simple notes. Block types, relational databases, permissions and live collaboration require separate scope.',
  },
  linktree: {
    objective: 'Publish a readable profile with a curated list of links.',
    label: 'Linktree',
    recipe: 'staticspa',
    wontGet:
      'A static profile is a small scope. Visitor analytics, account editing and custom domains are separate choices.',
  },
  producthunt: {
    objective: 'Submit, discover and discuss a small collection of new products.',
    label: 'Product Hunt',
    recipe: 'social',
    wontGet:
      'A submission feed does not supply an audience. Moderation and community operations need separate planning.',
  },
  gumroad: {
    objective: 'List a digital product, accept payment and provide its download.',
    label: 'Gumroad',
    recipe: 'ecommerce',
    picks: { payments: 'lemonsqueezy' },
    wontGet: 'The checkout is easy. Fraud ops, chargebacks and payout edge cases are the decade of work.',
  },
  strava: {
    objective: 'Record activities and browse a personal activity history.',
    label: 'Strava',
    recipe: 'mobile',
    wontGet: 'GPS processing, segments and the social graph outweigh the app: the backend is the product.',
  },
};
