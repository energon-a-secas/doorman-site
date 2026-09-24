// ── Entry point ──────────────────────────────────────────────
// Original single-page cookbook: recipes, stacks, costs, builders, tradeoffs and prompts.
// Keep this entry point under 50 lines.

import { initState } from './state.js';
import { renderApp } from './render.js';
import { bindEvents } from './events.js';

initState();   // URL hash → localStorage → default recipe
renderApp();
bindEvents();
