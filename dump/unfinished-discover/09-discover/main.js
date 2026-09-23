import { scoreQuiz } from './data.js';
import { initCursor } from './ui/cursor.js';
import { initSound } from './ui/sound.js';
import { runLoader } from './ui/loader.js';
import { initIntro } from './ui/intro.js';
import { initHub } from './ui/hub.js';
import { initQ1 } from './ui/q1.js';
import { initQ2 } from './ui/q2.js';
import { initQ3 } from './ui/q3.js';
import { initResult } from './ui/result.js';
import { initMenu, initComposeSoon, initToast } from './ui/menu.js';
import { revealMasks } from './ui/reveal.js';

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const isMobile = matchMedia('(max-width: 760px)').matches;

const STEP_ORDER = ['q1', 'q2', 'q3'];
const STEP_LABEL = { q1: 'Temperament', q2: 'Moment', q3: 'Notes' };

function toCamel(kebab) {
  return kebab.replace(/-([a-z])/g, (_, c) => c.toUpperCase());
}

function withTimeout(promise, ms, label) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`${label} timed out after ${ms}ms`)), ms);
    promise.then((v) => { clearTimeout(t); resolve(v); }, (e) => { clearTimeout(t); reject(e); });
  });
}

async function loadScene(canvas, opts) {
  try {
    const mod = await import('./scene/index.js');
    if (typeof mod.createScene !== 'function') throw new Error('scene/index.js missing createScene export');
    // Guard against a real scene that never resolves (e.g. a stalled texture
    // fetch) so the UI layer always stays testable on its own.
    return await withTimeout(mod.createScene(canvas, opts), 8000, 'createScene');
  } catch (err) {
    console.warn('[discover] real scene unavailable, using stub backdrop.', err);
    const stub = await import('./scene-stub.js');
    return stub.createScene(canvas, opts);
  }
}

async function main() {
  const canvas = document.getElementById('scene-canvas');
  const chrome = document.querySelector('.dg-chrome');
  const announce = document.getElementById('step-announce');
  const quizNav = document.getElementById('quiz-nav');
  const backBtn = document.getElementById('quiz-back');
  const nextBtn = document.getElementById('quiz-next');
  const dotEls = [...quizNav.querySelectorAll('[data-dot]')];

  const cursor = initCursor();
  const sound = initSound(document.getElementById('btn-sound'));
  const toast = initToast();

  const scenePromise = loadScene(canvas, { onProgress: () => {}, reducedMotion, isMobile });
  const loaderEl = document.getElementById('stage-loader');
  const scene = await runLoader({ el: loaderEl, scenePromise, minDuration: reducedMotion ? 200 : 1400 });

  const stages = {
    intro: document.getElementById('stage-intro'),
    hub: document.getElementById('stage-hub'),
    q1: document.getElementById('stage-q1'),
    q2: document.getElementById('stage-q2'),
    q3: document.getElementById('stage-q3'),
    result: document.getElementById('stage-result'),
  };

  const state = { q1: 0.5, q2Moment: null, q3Notes: [] };
  let current = null;
  let suppressHash = false;

  const menu = initMenu({ onRestart: () => goto('intro') });
  const compose = initComposeSoon();

  const intro = initIntro({
    el: stages.intro,
    reducedMotion,
    onProgress: (t) => { try { scene.setIntroProgress(t); } catch { /* noop */ } },
    onEnter: () => goto('hub'),
  });

  const hub = initHub({
    el: stages.hub,
    scene,
    onQuiz: () => goto('q1'),
    onCompose: () => compose.open(),
  });

  const q1 = initQ1({
    el: stages.q1,
    onFirstInteract: () => setNextEnabled(true),
    onChange: (t, { committed }) => {
      state.q1 = t;
      try {
        if (t <= 0.5) scene.blendMood?.('hushed', 'poised', t / 0.5);
        else scene.blendMood?.('poised', 'untamed', (t - 0.5) / 0.5);
      } catch { /* noop */ }
      if (committed) setNextEnabled(true);
    },
  });

  const q2 = initQ2({
    el: stages.q2,
    scene,
    onChange: (momentId) => {
      state.q2Moment = momentId;
      try { scene.setMood?.(scene.moods[toCamel(momentId)], 1.1); } catch { /* noop */ }
      setNextEnabled(true);
    },
  });

  const q3 = initQ3({
    el: stages.q3,
    scene,
    reducedMotion,
    onSelectionChange: (selected) => {
      state.q3Notes = selected;
      setNextEnabled(selected.length >= 1);
    },
    onLimitHit: () => toast.show('Three is enough'),
  });

  const result = initResult({
    el: stages.result,
    scene,
    onRestart: () => goto('intro'),
  });

  const activators = { intro, hub, q1, q2, q3, result };

  function setNextEnabled(on) {
    nextBtn.disabled = !on;
  }

  function updateQuizChrome(stage) {
    const stepIndex = STEP_ORDER.indexOf(stage);
    const isQuiz = stepIndex >= 0;
    quizNav.hidden = !isQuiz;
    if (!isQuiz) return;
    backBtn.disabled = false;
    dotEls.forEach((d, i) => {
      d.classList.toggle('is-active', i === stepIndex);
      d.classList.toggle('is-done', i < stepIndex);
    });
    if (stage === 'q1') setNextEnabled(q1.hasInteracted);
    if (stage === 'q2') setNextEnabled(true);
    if (stage === 'q3') setNextEnabled(state.q3Notes.length >= 1);
  }

  function goto(stage, opts = {}) {
    if (!stages[stage]) return;
    if (current && activators[current]?.deactivate) activators[current].deactivate();

    Object.entries(stages).forEach(([name, el]) => { if (name !== stage) el.hidden = true; });

    chrome.dataset.visible = String(stage !== 'loader');
    document.body.dataset.stage = stage;

    try {
      if (stage === 'result') scene.setStage('result', { productId: opts.productId });
      else scene.setStage(stage);
    } catch { /* noop */ }

    if (stage === 'result') {
      const scoreResult = scoreQuiz({ q1: state.q1, q2: state.q2Moment, notes: state.q3Notes });
      result.activate(scoreResult);
    } else {
      activators[stage]?.activate();
    }
    if (stage !== 'intro') revealMasks(stages[stage]);

    updateQuizChrome(stage);
    current = stage;

    if (!suppressHash) {
      history.replaceState(null, '', `#${stage}`);
    }
    announce.textContent = STEP_ORDER.includes(stage)
      ? `Step ${STEP_ORDER.indexOf(stage) + 1} of 3: ${STEP_LABEL[stage]}`
      : stage.charAt(0).toUpperCase() + stage.slice(1);
  }

  backBtn.addEventListener('click', () => {
    const idx = STEP_ORDER.indexOf(current);
    if (idx <= 0) goto('hub'); else goto(STEP_ORDER[idx - 1]);
  });
  nextBtn.addEventListener('click', () => {
    const idx = STEP_ORDER.indexOf(current);
    if (idx === -1) return;
    if (idx === STEP_ORDER.length - 1) goto('result');
    else goto(STEP_ORDER[idx + 1]);
  });

  window.addEventListener('hashchange', () => {
    const target = location.hash.replace('#', '');
    if (stages[target] && target !== current) {
      suppressHash = true;
      goto(target);
      suppressHash = false;
    }
  });

  const initialHash = location.hash.replace('#', '');
  goto(stages[initialHash] ? initialHash : 'intro');

  window.addEventListener('beforeunload', () => {
    cursor.destroy();
    sound.destroy();
    try { scene.destroy?.(); } catch { /* noop */ }
  });
}

main().catch((err) => {
  console.error('[discover] fatal init error', err);
});
