// Concrete workflows make recipes useful even before the user supplies a custom brief.
export const RECIPE_EXAMPLES = {
  pathfinder: {
    example: 'A project-planning canvas that turns connected decisions into an AI build brief.',
    included: [
      'Typed planning nodes and connections',
      'Document editing and portable export',
      'A generated implementation brief',
    ],
    acceptance: [
      'Create a three-node plan and export its relationships.',
      'Import the exported plan without losing content.',
    ],
  },
  saas: {
    example: 'A client-project dashboard with accounts, project records and a subscription.',
    included: [
      'A dashboard of client projects',
      'Create, update and archive project records',
      'Per-user accounts and data isolation',
      'One subscription plan when payments are included',
    ],
    acceptance: [
      'A user can create and reopen a project.',
      'Another user cannot read that project.',
      'Paid features follow the server-side subscription state.',
    ],
  },
  social: {
    example: 'A small interest community with posts, profiles and a moderated feed.',
    included: [
      'Member profiles and a chronological feed',
      'Posts and comments',
      'Report and moderation actions',
    ],
    acceptance: [
      'Publish a post and reply from a second member account.',
      'A moderator can remove a reported post.',
    ],
  },
  ecommerce: {
    example: 'A small digital-download store with product pages, checkout and order delivery.',
    included: [
      'Product catalogue and detail pages',
      'Hosted checkout',
      'Order history and download delivery',
    ],
    acceptance: [
      'A test checkout creates one order even if its webhook is repeated.',
      'Only an entitled customer can access a purchased download.',
    ],
  },
  content: {
    example: 'A practical knowledge journal with articles, categories and an editorial workflow.',
    included: [
      'Article index and detail pages',
      'Categories and content search',
      'Draft and publish workflow',
    ],
    acceptance: [
      'Publish an article and open it directly by URL.',
      'A draft is absent from public views.',
    ],
  },
  chat: {
    example: 'A private study-group chat with named channels and searchable message history.',
    included: ['Channels and membership', 'Message history and live updates', 'Basic moderation'],
    acceptance: [
      'Two members see a new message in the same channel.',
      'A non-member cannot fetch channel history.',
    ],
  },
  marketplace: {
    example: 'A local equipment-rental marketplace with listings and booking requests.',
    included: [
      'Owner listings and searchable availability',
      'Booking requests and status changes',
      'Buyer/seller roles and payment flow',
    ],
    acceptance: [
      'Request an available item and confirm it as its owner.',
      'Conflicting bookings are rejected.',
    ],
  },
  mobile: {
    example:
      'An activity-tracking backend for a mobile client that occasionally loses connectivity.',
    included: [
      'Account and activity APIs',
      'Activity history and attachment storage',
      'Sync behavior for old client versions',
    ],
    acceptance: [
      'Retrying an activity upload does not duplicate it.',
      'An older client receives a compatible API response.',
    ],
  },
  aiwrapper: {
    example: 'A document-to-summary tool with saved results and explicit usage limits.',
    included: [
      'Document input and generated summaries',
      'Saved generation history',
      'Per-user usage and spending limits',
    ],
    acceptance: [
      'A user can generate and reopen a summary.',
      'A repeated or excessive request is handled without unbounded spending.',
    ],
  },
  internal: {
    example: 'A staff-only purchase-request queue with review and approval states.',
    included: [
      'Filtered request list',
      'Request creation and approval',
      'Staff roles and an audit trail',
    ],
    acceptance: [
      'A requester can submit a purchase request.',
      'Only an authorized reviewer can approve it.',
    ],
  },
  docsbot: {
    example: 'A support assistant that answers from your documentation and links its sources.',
    included: [
      'Documentation ingestion and retrieval',
      'Answers with source references',
      'A visible no-answer state',
    ],
    acceptance: [
      'An answer cites a document that supports it.',
      'An unsupported question produces a no-answer response.',
    ],
  },
  airtable: {
    example: 'An Airtable inventory base with staff forms and an operations interface.',
    included: [
      'Inventory records and views',
      'Staff data-entry forms',
      'An Airtable Interface over the same base',
    ],
    acceptance: [
      'A staff member can update inventory from the interface.',
      'Viewer access cannot alter records.',
    ],
  },
  glue: {
    example: 'An Airtable-managed event directory synced into a Convex-backed public app.',
    included: [
      'Editor-owned Airtable data',
      'Controlled synchronization into the app backend',
      'A public browsing interface',
    ],
    acceptance: [
      'An editor change reaches the public app through the sync.',
      'A repeated sync does not duplicate records.',
    ],
  },
  staticspa: {
    example: 'A local-first checklist or calculator published as static files.',
    included: [
      'One focused browser workflow',
      'Local save and portable JSON files',
      'A static deployment',
    ],
    acceptance: [
      'The core workflow works without a backend request.',
      'Local data survives reload and can be exported.',
    ],
  },
  freestack: {
    example: 'A small shared reading list with a static frontend and reactive backend.',
    included: ['Shared saved items', 'Backend queries and updates', 'Static frontend deployment'],
    acceptance: [
      'One user adds an item and another sees the update.',
      'Access to private lists is checked by the backend.',
    ],
  },
  community: {
    example: 'A club website with an event calendar, resources and lightweight updates.',
    included: [
      'Public event and resource pages',
      'A small editorial workflow',
      'Links to the existing community channels',
    ],
    acceptance: [
      'A visitor can find the next event and its details.',
      'An editor can publish an update without changing unrelated pages.',
    ],
  },
  airtablestatic: {
    example: 'An Airtable-edited resource directory published as a static JSON snapshot.',
    included: [
      'Airtable editorial base',
      'Validated export to committed JSON',
      'Static directory browsing and filters',
    ],
    acceptance: [
      'The published site works without an Airtable API call.',
      'A failed snapshot leaves the last valid public data intact.',
    ],
  },
  blank: {
    example:
      'Your own combination: define one real workflow, then justify each selected capability.',
    included: ['The specific workflow you describe', 'Only explicitly selected capabilities'],
    acceptance: [
      'Define an observable end-to-end success condition before building.',
      'Verify the agreed workflow with representative data.',
    ],
  },
};
export const PRESET_EXAMPLES = {
  pathfinder: RECIPE_EXAMPLES.pathfinder,
  airbnb: {
    example: 'An Airbnb-inspired room-booking site for a small set of hosts.',
    included: ['Room listings with availability', 'Booking requests', 'Guest and host views'],
    acceptance: [
      'A guest requests an available room.',
      'The host confirms it without allowing overlapping bookings.',
    ],
  },
  substack: {
    example: 'A Substack-inspired article publication, starting with reading and publishing.',
    included: ['Publication home and article pages', 'Authoring and publication states'],
    acceptance: ['Readers open an article by its URL.', 'Only published articles appear publicly.'],
  },
  discord: {
    example: 'A Discord-inspired text space for a small study group.',
    included: ['Named text channels', 'Membership and message history', 'Moderation actions'],
    acceptance: [
      'Members exchange messages in an authorized channel.',
      'A removed member loses channel access.',
    ],
  },
  notion: {
    example: 'A Notion-inspired notes workspace with folders, simple text documents and search.',
    included: [
      'Create and edit text notes',
      'Organize notes into folders',
      'Search notes and export them',
    ],
    acceptance: [
      'Create, move and reopen a note.',
      'Search finds the saved text.',
      'Export preserves note content and organization.',
    ],
  },
  linktree: {
    example: 'A Linktree-inspired profile with a curated list of links.',
    included: ['Profile details and ordered links', 'Responsive layout', 'Static publication'],
    acceptance: [
      'Every published link has an accessible name and correct target.',
      'The profile works at a narrow viewport.',
    ],
  },
  producthunt: {
    example: 'A Product Hunt-inspired launch directory for a small community.',
    included: [
      'Product submissions and detail pages',
      'A browseable launch feed',
      'Comments and moderation',
    ],
    acceptance: [
      'A submission appears in the feed and opens by URL.',
      'Moderators can remove a reported submission.',
    ],
  },
  gumroad: {
    example: 'A Gumroad-inspired storefront for a few downloadable products.',
    included: ['Product pages and checkout', 'Purchase records', 'Entitled downloads'],
    acceptance: [
      'A successful test purchase unlocks its download.',
      'A visitor without an order cannot download the file.',
    ],
  },
  strava: {
    example: 'A Strava-inspired personal activity log connected to a mobile client.',
    included: [
      'Activity upload and history',
      'Activity detail and basic totals',
      'Account-bound records',
    ],
    acceptance: [
      'Uploading the same activity twice does not duplicate it.',
      'A user can retrieve their history without seeing another user’s private records.',
    ],
  },
};

// Keep the domain-specific job when reducing infrastructure scope.
const STAGED_EXAMPLES = {
  saas: {
    local: {
      example: 'A browser-local client-project tracker with editable records and file export.',
      included: ['Create, update and archive client-project records'],
      acceptance: ['Create a client project, reload and reopen it with its saved fields.'],
    },
    shared: {
      example:
        'A private client-project dashboard for invited users, with records saved across devices.',
      included: ['Create, update and archive client-project records'],
      acceptance: ['Create a client project and reopen it on another device.'],
    },
    paid: {
      example:
        'A paid client-project dashboard with recoverable accounts and one subscription plan.',
      included: ['Create, update and archive client-project records'],
      acceptance: [
        'Create and reopen a project while its paid-feature access follows the subscription state.',
      ],
    },
  },
  internal: {
    local: {
      example:
        'A purchase-request organizer for one operator, saved locally and exported as files.',
      included: ['Create purchase requests, filter them and record review status'],
      acceptance: ['Create a purchase request, change its status and recover it after reload.'],
    },
    shared: {
      example: 'A shared purchase-request queue for a private team of operators.',
      included: ['Create purchase requests, filter them and record review status'],
      acceptance: ['A team member can find and review a submitted purchase request.'],
    },
    automated: {
      example:
        'A shared purchase-request queue with one recurring email reminder for pending reviews.',
      included: [
        'Purchase requests and review status',
        'A scheduled reminder for pending purchase requests',
      ],
      acceptance: ['A reminder includes only the pending requests for the agreed reviewer.'],
    },
  },
  content: {
    local: {
      example: 'A local knowledge journal with article files, categories and a searchable index.',
    },
    published: {
      example: 'A published knowledge journal with static article URLs and a searchable index.',
    },
    editorial: {
      example:
        'A knowledge journal with private drafts, editor review and approved public articles.',
    },
  },
  pathfinder: {
    local: {
      example:
        'A local planning canvas that turns connected decisions into a portable build brief.',
    },
    share: {
      example: 'A static planning canvas with shareable documents and exportable review feedback.',
    },
    team: {
      example:
        'A private team planning canvas with accounts, shared plans and protected cloud storage.',
    },
  },
};
export function workflowFor(cfg, stage) {
  const base = PRESET_EXAMPLES[cfg.preset] || RECIPE_EXAMPLES[cfg.recipe];
  if (!stage) return base;
  if (cfg.preset === 'notion')
    return {
      ...base,
      example: {
        local: 'A local notes workspace with folders, search and portable file export.',
        shared: 'A private notes workspace with folders, search and cross-device storage.',
        paid: 'A paid notes workspace with folders, search, account recovery and one subscription.',
      }[stage.key],
      included: [...base.included, ...stage.included],
      acceptance: [...base.acceptance, ...stage.acceptance],
    };
  if (cfg.preset === 'substack')
    return {
      ...base,
      example: {
        local:
          'A local prototype of a Substack-style publication, with article files and reading views.',
        published:
          'A static Substack-style publication with public article URLs and file-based publishing.',
        editorial: 'A Substack-style publication with private drafts and a shared review workflow.',
      }[stage.key],
      included: stage.included,
      acceptance: stage.acceptance,
    };
  const scoped = STAGED_EXAMPLES[cfg.recipe]?.[stage.key] || {};
  return {
    ...base,
    ...scoped,
    included: [...(scoped.included || []), ...stage.included],
    acceptance: [...(scoped.acceptance || []), ...stage.acceptance],
  };
}
