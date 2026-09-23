import { productById, productImage, productHref } from '../data.js';

// Result stage: winning bottle rises into light; "the others" can be
// clicked to swap the focused bottle + refresh the copy panel.

export function initResult({ el, scene, onRestart }) {
  const nameEl = el.querySelector('#result-name');
  const familyEl = el.querySelector('#result-family');
  const lineEl = el.querySelector('#result-line');
  const matchNumEl = el.querySelector('#result-match-num');
  const notesEl = el.querySelector('#result-notes');
  const ctaEl = el.querySelector('#result-cta');
  const ctaNameEl = el.querySelector('#result-cta-name');
  const othersListEl = el.querySelector('#result-others-list');
  const restartBtn = el.querySelector('#result-restart');

  restartBtn.addEventListener('click', onRestart);

  let matches = [];
  let focusId = null;
  let countRaf = null;

  function countUp(target) {
    if (countRaf) cancelAnimationFrame(countRaf);
    const start = performance.now();
    const from = 0;
    function step(now) {
      const t = Math.min(1, (now - start) / 900);
      const eased = 1 - Math.pow(1 - t, 3);
      matchNumEl.textContent = Math.round(from + (target - from) * eased);
      if (t < 1) countRaf = requestAnimationFrame(step);
    }
    countRaf = requestAnimationFrame(step);
  }

  function focus(id) {
    focusId = id;
    const product = productById(id);
    const match = matches.find((m) => m.id === id);
    if (!product || !match) return;

    nameEl.innerHTML = `<span class="mask-line"><span class="mask-inner">${product.name}</span></span>`;
    familyEl.textContent = product.family;
    lineEl.textContent = product.line;
    ctaEl.href = productHref(id);
    ctaNameEl.textContent = product.name.toUpperCase();
    countUp(match.pct);

    notesEl.innerHTML = ['opening', 'heart', 'base']
      .map((k) => `<div class="result-note"><span class="result-note-label">${k.toUpperCase()}</span><span class="result-note-value">${product.notes[k]}</span></div>`)
      .join('');

    requestAnimationFrame(() => {
      const mi = nameEl.querySelector('.mask-inner');
      if (mi) { mi.style.transition = 'transform .9s cubic-bezier(.22,.68,.16,1)'; mi.style.transform = 'translateY(0)'; }
      notesEl.querySelectorAll('.result-note').forEach((n, i) => {
        n.style.transition = `opacity .6s ease ${0.2 + i * 0.12}s, transform .6s ease ${0.2 + i * 0.12}s`;
        n.style.opacity = '1';
        n.style.transform = 'translateY(0)';
      });
    });

    othersListEl.querySelectorAll('.result-other').forEach((btn) => {
      btn.classList.toggle('is-active', btn.dataset.id === id);
    });

    scene?.focusProduct?.(id);
  }

  function renderOthers() {
    othersListEl.innerHTML = '';
    matches
      .forEach((m) => {
        if (m.id === focusId) return;
        const product = productById(m.id);
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'result-other';
        btn.dataset.id = m.id;
        btn.dataset.cursorLabel = 'VIEW';
        btn.innerHTML = `<span class="result-other-name">${product.name}</span><span class="result-other-pct">${m.pct}% match</span>`;
        btn.addEventListener('click', () => { focus(m.id); renderOthers(); });
        othersListEl.appendChild(btn);
      });
  }

  return {
    activate(scoreResult) {
      matches = scoreResult.matches;
      el.hidden = false;
      focus(scoreResult.winner);
      renderOthers();
    },
    deactivate() { el.hidden = true; if (countRaf) cancelAnimationFrame(countRaf); },
  };
}
