import { GENERAL_STAGES } from './data-stages-general.js';
import { BUDGET_DEFAULTS } from './budget.js';
// Curated scopes describe outcomes first. A stage owns exactly its active services.
export const DESIGNS = {
  dashboard: {
    label: 'Task dashboard',
    pattern: 'Task list with filters and a focused detail panel',
    details:
      'Lead with the next action. Provide a table or list alternative to visual boards; preserve filters and selection on mobile.',
  },
  editorial: {
    label: 'Reading & discovery',
    pattern: 'Searchable index with a focused article view',
    details:
      'Use clear headings, readable line lengths and explicit navigation back to the index. Keep reading controls separate from authoring.',
  },
  directory: {
    label: 'Searchable directory',
    pattern: 'Filterable results with individual detail pages',
    details:
      'Expose active filters, result counts and clear empty states. Stack filters on narrow screens without losing the search.',
  },

  workbench: {
    label: 'Canvas workbench',
    pattern: 'Canvas with a node palette and collapsible inspector',
    details:
      'Readable typed nodes, labeled connectors, visible selection and keyboard editing. On narrow screens use a focused inspector view without hiding canvas actions.',
  },
  outline: {
    label: 'Outline + diagram',
    pattern: 'Editable outline beside a linked diagram',
    details:
      'Outline is the keyboard-first entry point; selecting an item highlights its diagram node. Stack the views on mobile and preserve the current selection.',
  },
  focused: {
    label: 'Focus canvas',
    pattern: 'Full canvas with a compact toolbar and on-demand inspector',
    details:
      'Keep the document central. Label toolbar actions, expose an accessible node list and open properties in a collapsible panel. Avoid hover-only controls.',
  },
};
export const STAGES = {
  ...GENERAL_STAGES,
  pathfinder: [
    {
      key: 'local',
      label: 'Local working tool',
      short: 'Start here',
      size: 'S',
      frontend: 'vanilla',
      design: 'workbench',
      outcome: 'Map a project and export a brief an AI can build from.',
      picks: {},
      included: [
        'Typed nodes and labeled connectors',
        'Node inspector and keyboard editing',
        'Browser-local save',
        'JSON import/export',
        'Markdown build brief',
      ],
      deferred: ['Share links and review feedback', 'Accounts and cloud sync', 'Simultaneous editing'],
      notNeeded: ['Payments', 'Transactional email', 'Analytics service'],
      acceptance: [
        'Create, connect and edit three nodes using a keyboard.',
        'Reload without losing the document.',
        'Export and re-import JSON without losing content or connections.',
        'Export a Markdown brief containing the nodes and their relationships.',
      ],
      limitation: 'The working copy belongs to one browser. Download JSON for backup and portability.',
      nextTrigger: 'Another person needs to open or review a plan.',
      setup: 'No external access',
      effort: 'Canvas interactions and round-trip exports',
      steps: [
        'Inspect the repository and define the document format.',
        'Implement editable nodes, connections and the inspector.',
        'Add local persistence and lossless JSON import/export.',
        'Generate the brief and check keyboard operation.',
      ],
    },
    {
      key: 'share',
      label: 'Shareable static tool',
      short: 'Invite a reviewer',
      size: 'M',
      frontend: 'vanilla',
      design: 'workbench',
      outcome: 'Exchange plans and collect asynchronous feedback without accounts.',
      picks: { hosting: 'cfstatic' },
      included: [
        'Typed nodes and labeled connectors',
        'Node inspector and keyboard editing',
        'Browser-local save',
        'JSON import/export',
        'Markdown build brief',
        'Read-only share links',
        'Exportable review feedback',
      ],
      deferred: ['Private account-based sharing', 'Cross-device cloud sync', 'Simultaneous editing'],
      notNeeded: ['Payments', 'Transactional email', 'Hosted database'],
      acceptance: [
        'All local-stage acceptance checks pass.',
        'A share link reconstructs the same plan in a fresh browser.',
        'Read-only review does not overwrite the reviewer’s local document.',
        'Import review feedback as one reversible change.',
      ],
      limitation:
        'Anyone with a share link can read its contents. Feedback is asynchronous; this is not private cloud collaboration.',
      nextTrigger: 'Users require private shared ownership or cloud persistence.',
      setup: 'One hosting account and deploy login',
      effort: 'Sharing, read-only behavior and feedback merging',
      steps: [
        'Keep the existing document format and local editing flow.',
        'Add validated share import and read-only mode.',
        'Add feedback export and a reversible import preview.',
        'Prepare static deployment; verify provider limits before publishing.',
      ],
    },
    {
      key: 'team',
      label: 'Team product',
      short: 'When ownership matters',
      size: 'L',
      frontend: 'vanilla',
      design: 'workbench',
      outcome: 'Give a team private documents, membership and cross-device persistence.',
      picks: { hosting: 'cfstatic', database: 'supabase', auth: 'bundled' },
      included: [
        'Typed nodes and labeled connectors',
        'Node inspector and keyboard editing',
        'JSON import/export',
        'Markdown build brief',
        'Private accounts and team membership',
        'Hosted document persistence',
        'Backups and restore workflow',
      ],
      deferred: ['Simultaneous editing', 'Paid subscriptions', 'Enterprise SSO'],
      notNeeded: ['Separate auth vendor', 'Dedicated queue service'],
      acceptance: [
        'A non-member cannot read or modify another team’s document.',
        'A member can save and reopen a document on another device.',
        'Conflicting saves are detected instead of silently overwriting data.',
        'A backup can be restored and exported in the portable document format.',
      ],
      limitation:
        'Authentication, authorization, backup and conflict handling become part of the product. Live co-editing is a separate scope.',
      nextTrigger: 'Simultaneous edits or paid access are demonstrated requirements.',
      setup: 'Hosting and Supabase accounts; auth configuration',
      effort: 'Membership, authorization, persistence and restore testing',
      steps: [
        'Preserve the document format and existing editing workflow.',
        'Add account authentication, team membership and database authorization policies.',
        'Implement versioned saves and a visible conflict state.',
        'Test unauthorized access, backup restoration and portable exports.',
      ],
    },
  ],
};
export const stagesFor = (recipe) => STAGES[recipe] || [];
export const stageFor = (cfg) => stagesFor(cfg.recipe).find((s) => s.key === cfg.stage) || null;
export function stageConfig(recipe, key) {
  const s = stagesFor(recipe).find((stage) => stage.key === key);
  if (!s) throw new Error('This implementation stage is not available.');
  return {
    recipe,
    stage: key,
    picks: { ...s.picks },
    frontend: s.frontend,
    design: s.design,
    tier: 'hobby',
    preset: null,
    name: s.label,
    objective: '',
    context: '',
    budget: { ...BUDGET_DEFAULTS },
    usage: { visitors: '', users: '', storageGb: '' },
  };
}

export function defaultDesign(recipe) {
  return (
    stagesFor(recipe)[0]?.design ||
    (['content'].includes(recipe)
      ? 'editorial'
      : ['ecommerce', 'marketplace', 'community'].includes(recipe)
        ? 'directory'
        : 'dashboard')
  );
}
export function designOptions(recipe, selected) {
  const keys =
    recipe === 'pathfinder' ? ['workbench', 'outline', 'focused'] : ['dashboard', 'editorial', 'directory'];
  if (selected && !keys.includes(selected)) keys.push(selected);
  return keys.map((key) => [key, DESIGNS[key]]);
}
