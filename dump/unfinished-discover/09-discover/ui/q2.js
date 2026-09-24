import { MOMENTS, MOMENT_SPRITES } from '../data.js';

// Q2 — Moment carousel: prev/next + swipe/drag + arrow keys.
// The title moves as one composited layer. The previous per-character DOM
// transition scheduled one animation per letter on every selection, which
// is needlessly expensive beside the WebGL scene.

export function initQ2({ el, scene, onChange }) {
  const titleEl = el.querySelector('#q2-title');
  const subEl = el.querySelector('#q2-sub');
  const stageEl = el.querySelector('#q2-stage');
  const dotsEl = el.querySelector('#q2-dots');
  const prevBtn = el.querySelector('#q2-prev');
  const nextBtn = el.querySelector('#q2-next');

  let index = 0;
  let entryFrame = null;

  MOMENTS.forEach((m, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.role = 'tab';
    b.setAttribute('aria-selected', String(i === 0));
    b.setAttribute('aria-label', m.title);
    b.addEventListener('click', () => go(i));
    dotsEl.appendChild(b);
  });

  function render(dir) {
    const m = MOMENTS[index];
    if (entryFrame) cancelAnimationFrame(entryFrame);
    titleEl.classList.remove('is-entering', 'is-from-left', 'is-from-right');
    titleEl.textContent = m.title;
    subEl.textContent = m.sub;
    titleEl.classList.add('is-entering', dir >= 0 ? 'is-from-right' : 'is-from-left');
    entryFrame = requestAnimationFrame(() => {
      titleEl.classList.remove('is-entering', 'is-from-left', 'is-from-right');
      entryFrame = null;
    });
    dotsEl.querySelectorAll('button').forEach((b, i) => b.setAttribute('aria-selected', String(i === index)));
    prevBtn.disabled = false;
    nextBtn.disabled = false;
    scene?.showSprites?.(MOMENT_SPRITES[m.id], dir);
    onChange(m.id, index);
  }

  function go(next, dir) {
    const clamped = (next + MOMENTS.length) % MOMENTS.length;
    const direction = dir ?? (clamped > index || (index === MOMENTS.length - 1 && clamped === 0) ? 1 : -1);
    index = clamped;
    render(direction);
  }

  prevBtn.addEventListener('click', () => go(index - 1, -1));
  nextBtn.addEventListener('click', () => go(index + 1, 1));

  let startX = null;
  stageEl.addEventListener('pointerdown', (e) => { startX = e.clientX; });
  stageEl.addEventListener('pointerup', (e) => {
    if (startX === null) return;
    const dx = e.clientX - startX;
    startX = null;
    if (Math.abs(dx) < 40) return;
    if (dx < 0) go(index + 1, 1); else go(index - 1, -1);
  });

  function onKeydown(e) {
    if (el.hidden) return;
    if (e.key === 'ArrowRight') go(index + 1, 1);
    if (e.key === 'ArrowLeft') go(index - 1, -1);
  }
  window.addEventListener('keydown', onKeydown);

  return {
    activate() { el.hidden = false; render(1); },
    deactivate() {
      if (entryFrame) cancelAnimationFrame(entryFrame);
      titleEl.classList.remove('is-entering', 'is-from-left', 'is-from-right');
      el.hidden = true;
      scene?.clearSprites?.();
    },
    get momentId() { return MOMENTS[index].id; },
  };
}
