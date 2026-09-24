// Reference price snapshots, with per-row verification below.
// API rates compare billing, not quality or guaranteed project effort.
export const AI_MODELS = {
  'sonnet-5': {
    name: 'Claude Sonnet 5',
    provider: 'Anthropic',
    in: 2.0,
    out: 10.0,
    note: 'Standard text rate; caching and tool fees are separate',
  },
  'opus-5': {
    name: 'Claude Opus 5',
    provider: 'Anthropic',
    in: 5.0,
    out: 25.0,
    note: 'Standard text rate; accelerated processing may have a different rate',
  },
  'fable-5': {
    name: 'Claude Fable 5',
    provider: 'Anthropic',
    in: 10.0,
    out: 50.0,
    note: 'Higher token price than the other Claude rows shown',
  },
  'haiku-45': {
    name: 'Claude Haiku 4.5',
    provider: 'Anthropic',
    in: 1.0,
    out: 5.0,
    note: 'Lower token price; evaluate quality on the actual task',
  },
  'gpt56-terra': {
    name: 'GPT-5.6 Terra',
    provider: 'OpenAI',
    in: 2.0,
    out: 12.0,
    note: 'Standard text rate; check long-context pricing',
  },
  'gpt53-codex': {
    name: 'GPT-5.3 Codex',
    provider: 'OpenAI',
    in: 1.75,
    out: 14.0,
    note: 'Coding-tuned',
  },
  'gpt5-mini': {
    name: 'GPT-5 mini',
    provider: 'OpenAI',
    in: 0.25,
    out: 2.0,
    note: 'Lower token price; evaluate quality on the actual task',
  },
  'gemini31-pro': {
    name: 'Gemini 3.1 Pro',
    provider: 'Google',
    in: 2.0,
    out: 12.0,
    note: '≤200K ctx; $4/$18 above',
  },
  'gemini37-flash': {
    name: 'Gemini 3.7 Flash',
    provider: 'Google',
    in: 0.75,
    out: 3.75,
    note: 'Promo price through Dec 2026, then 2×',
  },
  'kimi-k3': {
    name: 'Kimi K3',
    provider: 'Moonshot',
    in: 2.55,
    out: 12.75,
    note: '1M ctx, open weights; OpenRouter rate',
  },
  'qwen3-flash': {
    name: 'Qwen3 Coder Flash',
    provider: 'Alibaba',
    in: 0.2,
    out: 0.98,
    note: '1M ctx; OpenRouter rate, regional prices vary',
    cheapest: true,
  },
  'deepseek-v4': {
    name: 'DeepSeek V4 Flash',
    provider: 'DeepSeek',
    in: 0.44,
    out: 1.32,
    note: 'Peak rate; off-peak halves it, cache hits are pennies',
  },
};

// Official tool pages reviewed on 2026-09-20; no guaranteed build coverage.
export const AGENT_TOOLS = [
  {
    name: 'Claude Code',
    pay: 'Claude Pro $20/month; Max from $100/month; API billing is separate',
    url: 'https://claude.com/pricing',
    checkedAt: '2026-09-20',
    benefit: 'A coding agent for repository work, with a subscription route for Claude users.',
    note: 'Plan usage limits still apply; repeated long tasks can require extra capacity.',
  },
  {
    name: 'OpenAI Codex CLI',
    pay: 'Eligible ChatGPT plan or separately billed API key; check current plan allowances',
    url: 'https://learn.chatgpt.com/docs/pricing',
    checkedAt: '2026-09-20',
    benefit:
      'Repository work from the terminal and scriptable automation, with a choice of supported models.',
    note: 'Model, context and task size affect included usage. API billing and subscription credits follow different schedules.',
  },
  {
    name: 'Gemini CLI',
    pay: 'Free individual Google login: 1,000 requests/day; API-key free tier: 250/day',
    url: 'https://geminicli.com/docs/resources/quota-and-pricing/',
    checkedAt: '2026-09-20',
    benefit: 'A terminal agent with a free individual quota for trying repository workflows.',
    note: 'Authentication method changes the quota. Paid options, model eligibility and rate limits need checking.',
  },
  {
    name: 'Cursor',
    pay: 'Hobby free; Pro from $20/month; higher plans and usage billing available',
    url: 'https://cursor.com/pricing',
    checkedAt: '2026-09-20',
    benefit: 'Editor-based workflow keeps code, changes and agent interaction in one workspace.',
    note: 'Included usage is limited; inspect model and extra-usage settings before a long run.',
  },
  {
    name: 'aider',
    pay: 'Open-source tool plus your selected model provider’s charges',
    url: 'https://aider.chat/docs/usage.html',
    benefit: 'Terminal editing with Git-oriented review and a choice of model providers.',
    note: 'You manage provider keys, model compatibility and token spending; the tool itself supplies no usage allowance.',
  },
];
const sources = {
  Anthropic: 'https://platform.claude.com/docs/en/about-claude/pricing',
  OpenAI: 'https://developers.openai.com/api/docs/pricing',
  Google: 'https://ai.google.dev/gemini-api/docs/pricing',
  Moonshot: 'https://openrouter.ai/moonshotai/kimi-k3',
  Alibaba: 'https://openrouter.ai/qwen/qwen3-coder-flash',
  DeepSeek: 'https://api-docs.deepseek.com/quick_start/pricing',
};
for (const model of Object.values(AI_MODELS)) {
  model.url = sources[model.provider];
  model.checkedAt = ['Anthropic', 'OpenAI'].includes(model.provider) ? '2026-09-20' : null;
}
AI_MODELS['gemini37-flash'].checkedAt = '2026-09-20';
