// ── Events ───────────────────────────────────────────────────
// Single delegated listener on #app. Every state mutation is
// followed by save + hash-sync + full re-render.

import { state, applyRecipe, applyPreset, applyStrategy, applyFreeTier, setPick, pinCurrent, unpin as unpinStack, pinFromShare, save, writeHash } from './state.js';
import { PRESETS } from './data-presets.js';
import { renderApp } from './render.js';
import { buildPrompt, buildFitPrompt } from './prompt.js';
import { copyToClipboard, downloadFile, showToast, $ } from './utils.js';

function update() {
  save();
  writeHash();
  renderApp();
}

const actions = {
  'dismiss-error'() { state.ui.error=''; renderApp(); },
  strategy(el) {
    const s = el.dataset.strategy;
    if (s === 'free') applyFreeTier();
    else applyStrategy(s);
    update();
    showToast(s === 'free' ? 'Swapped to free tiers: the Hobby column is your bill'
      : s === 'oss' ? 'Swapped to the open-source stack' : 'Swapped to the managed stack');
  },
  'toggle-cat'(el) {
    const cat = el.dataset.cat;
    state.ui.openCat = state.ui.openCat === cat ? null : cat;
    renderApp(); // panel toggle only — no persist
  },
  pick(el) {
    setPick(el.dataset.cat, el.dataset.opt);
    update();
  },
  frontend(el) {
    state.frontend = el.dataset.frontend;
    update();
  },
  tier(el) {
    state.tier = el.dataset.tier;
    update();
  },
  async 'copy-prompt'() {
    const ok = await copyToClipboard(buildPrompt());
    showToast(ok ? 'Prompt copied: go cook' : 'Copy failed: select the text manually');
  },
  'download-prompt'() {
    downloadFile(`doorman-${state.recipe}-recipe.md`, buildPrompt());
    showToast('Recipe downloaded');
  },
  async 'copy-fit'() {
    const ok = await copyToClipboard(buildFitPrompt());
    showToast(ok ? 'Fit check copied: hand it to a research agent' : 'Copy failed: select the text manually');
  },
  'download-fit'() {
    downloadFile(`doorman-${state.recipe}-fitcheck.md`, buildFitPrompt());
    showToast('Fit check downloaded');
  },
  async 'share-link'() {
    writeHash();
    const ok = await copyToClipboard(location.href);
    showToast(ok ? 'Share link copied' : 'Copy failed: grab the URL from the address bar');
  },
  preset(el) {
    const tier=state.tier;
    applyPreset(el.dataset.preset);
    state.tier=tier;
    state.ui.openCat = null;
    update();
    const p = PRESETS[el.dataset.preset];
    if (p) showToast(`Copying ${p.label}: the ${p.recipe} recipe, tuned`);
  },
  'pin-stack'() {
    pinCurrent();
    update();
    showToast('Stack pinned: keep tweaking and watch the delta');
  },
  unpin() {
    unpinStack();
    update();
  },
  'compare-load'() {
    const input = document.getElementById('compare-input');
    if (pinFromShare(input && input.value)) {
      update();
      showToast('Baseline loaded from the share link');
    } else {
      showToast('That does not look like a Doorman share link');
    }
  },
};

export function bindEvents() {
  document.querySelector('.section-nav').addEventListener('click',event=>{
    const button=event.target.closest('[data-jump]');if(!button) return;
    const section=document.getElementById(button.dataset.jump);
    section.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',block:'start'});
    const heading=section.querySelector('h2');heading.tabIndex=-1;heading.focus({preventScroll:true});
  });
  $('app').addEventListener('click', async (e) => {
    const el = e.target.closest('button[data-action]');
    if (!el) return;
    const fn = actions[el.dataset.action];
    if (fn) try { await fn(el); } catch(error) { state.ui.error=error.message;renderApp(); }
  });
  // Keep inputs in place: a blur-triggered rerender must not swallow the copy click.
  $('app').addEventListener('input',event=>{
    const el=event.target;
    if(el.dataset.action==='compare-draft') {state.ui.compareDraft=el.value;return;}
    if(el.dataset.action!=='usage') return;
    state.usage[el.dataset.field]=el.value;
    save();writeHash();
    document.getElementById('fit-preview').textContent=buildFitPrompt();
    document.getElementById('prompt-preview').textContent=buildPrompt();
  });
  $('app').addEventListener('change',event=>{
    const el=event.target.closest('select[data-action="recipe-select"]');if(!el) return;
    const tier=state.tier;
    applyRecipe(el.value);state.tier=tier;
    state.ui.openCat=null;state.ui.preset=null;
    update();
  });
}
