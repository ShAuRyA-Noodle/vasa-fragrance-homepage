import gsap from 'gsap';
import { NOTES, MAX_NOTE_SELECTION, cardSpriteUrl, loadDecoded, productById } from '../data.js';

// Q3 — Notes ribbon: 12 cards, drag/wheel inertia with velocity skew,
// slow auto-drift when idle, select up to 3 with hairline frame + badge.
// Runs on the shared gsap.ticker (no private rAF loop) and only ever
// writes `transform`, so a full drag never triggers layout/paint.

export function initQ3({ el, scene, onSelectionChange, onLimitHit, reducedMotion }) {
  const ribbon = el.querySelector('#q3-ribbon');
  const wrap = el.querySelector('.q3-ribbon-wrap');
  const chipsEl = el.querySelector('#q3-chips');

  const selected = []; // note ids, in pick order
  let offset = 0;
  let velocity = 0;
  let dragging = false;
  let startX = 0;
  let startOffset = 0;
  let lastX = 0;
  let lastT = 0;
  let ticking = false;
  let idleSince = performance.now();
  let autoDir = 1;
  let bounds = { min: 0, max: 0 };

  NOTES.forEach((note) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'q3-card';
    card.dataset.id = note.id;
    card.setAttribute('aria-pressed', 'false');
    card.setAttribute('aria-label', note.label);
    card.innerHTML = `
      <span class="q3-card-name">${note.label}</span>
      <span class="q3-card-art" aria-hidden="true"></span>
      <span class="q3-card-badge" aria-hidden="true"></span>
    `;
    ribbon.appendChild(card);

    // Preload + decode off the main thread before the art ever paints, so
    // dragging the ribbon never stalls on image decode work (perf pass).
    const url = cardSpriteUrl(note.sprite);
    loadDecoded(url).then((decodedImg) => {
      const art = card.querySelector('.q3-card-art');
      if (decodedImg) {
        decodedImg.alt = '';
        art.appendChild(decodedImg);
      } else {
        const product = productById(note.product);
        const fb = document.createElement('span');
        fb.className = 'q3-card-fallback';
        fb.style.background = `radial-gradient(circle at 50% 40%, ${product?.color || '#c8a86a'}55, transparent 70%)`;
        fb.textContent = note.label[0];
        art.appendChild(fb);
      }
    });
  });

  const cards = [...ribbon.querySelectorAll('.q3-card')];

  function computeBounds() {
    const wrapW = wrap.clientWidth;
    const ribbonW = ribbon.scrollWidth;
    bounds = { min: Math.min(0, wrapW - ribbonW - 8), max: 0 };
  }

  function render(skew = 0) {
    ribbon.style.transform = `translate3d(${offset}px, 0, 0) skewX(${skew}deg)`;
  }

  function clampRubber(o) {
    if (o > bounds.max) return bounds.max + (o - bounds.max) * 0.4;
    if (o < bounds.min) return bounds.min + (o - bounds.min) * 0.4;
    return o;
  }

  function settle() {
    if (offset > bounds.max) offset += (bounds.max - offset) * 0.18;
    else if (offset < bounds.min) offset += (bounds.min - offset) * 0.18;
  }

  function loop() {
    const now = performance.now();
    if (!dragging) {
      if (Math.abs(velocity) > 0.02) {
        offset += velocity;
        velocity *= 0.94;
        render(Math.max(-10, Math.min(10, velocity * 0.4)));
      } else {
        settle();
        const idleFor = now - idleSince;
        if (!reducedMotion && idleFor > 2400 && offset >= bounds.min + 4 && offset <= bounds.max - 4) {
          offset += 0.16 * autoDir;
          if (offset < bounds.min + 20) autoDir = 1;
          if (offset > bounds.max - 20) autoDir = -1;
        }
        render(0);
      }
    }
  }

  // Pointer capture retargets pointerup to `wrap`, so the tapped card is
  // remembered at pointerdown.
  let downCard = null;
  function onDown(e) {
    downCard = e.target.closest('.q3-card');
    dragging = true;
    idleSince = performance.now();
    startX = e.clientX;
    startOffset = offset;
    lastX = e.clientX;
    lastT = performance.now();
    velocity = 0;
    ribbon.classList.add('is-dragging');
    wrap.setPointerCapture?.(e.pointerId);
  }
  function onMove(e) {
    if (!dragging) return;
    const now = performance.now();
    const dx = e.clientX - startX;
    offset = clampRubber(startOffset + dx);
    const dt = Math.max(1, now - lastT);
    velocity = ((e.clientX - lastX) / dt) * 16;
    lastX = e.clientX;
    lastT = now;
    render(Math.max(-12, Math.min(12, velocity * 0.6)));
  }
  function onUp(e) {
    if (!dragging) return;
    dragging = false;
    ribbon.classList.remove('is-dragging');
    idleSince = performance.now();
    const moved = Math.abs(e.clientX - startX);
    wrap.releasePointerCapture?.(e.pointerId);
    if (moved < 6) {
      if (downCard) toggleSelect(downCard);
    }
  }

  wrap.addEventListener('pointerdown', onDown);
  window.addEventListener('pointermove', onMove);
  window.addEventListener('pointerup', onUp);
  wrap.addEventListener('wheel', (e) => {
    e.preventDefault();
    idleSince = performance.now();
    offset = clampRubber(offset - e.deltaY - e.deltaX);
    velocity = (-e.deltaY - e.deltaX) * 0.12;
  }, { passive: false });

  function toggleSelect(card) {
    const id = card.dataset.id;
    const i = selected.indexOf(id);
    if (i >= 0) {
      selected.splice(i, 1);
    } else {
      if (selected.length >= MAX_NOTE_SELECTION) {
        card.classList.add('is-shaking');
        setTimeout(() => card.classList.remove('is-shaking'), 400);
        onLimitHit?.();
        return;
      }
      selected.push(id);
      const r = card.getBoundingClientRect();
      const note = NOTES.find((n) => n.id === id);
      const product = productById(note?.product);
      scene?.burst?.(r.left + r.width / 2, r.top + r.height / 2, product?.color || '#c8a86a');
    }
    paintSelection();
    onSelectionChange([...selected]);
  }

  function paintSelection() {
    cards.forEach((card) => {
      const id = card.dataset.id;
      const i = selected.indexOf(id);
      const isSel = i >= 0;
      card.classList.toggle('is-selected', isSel);
      card.setAttribute('aria-pressed', String(isSel));
      card.querySelector('.q3-card-badge').textContent = isSel ? String(i + 1) : '';
    });
    chipsEl.innerHTML = selected
      .map((id) => `<span class="q3-chip">${NOTES.find((n) => n.id === id)?.label}</span>`)
      .join('');
  }

  window.addEventListener('resize', computeBounds);

  return {
    activate() {
      el.hidden = false;
      requestAnimationFrame(() => {
        computeBounds();
        if (!ticking) { gsap.ticker.add(loop); ticking = true; }
      });
    },
    deactivate() { el.hidden = true; if (ticking) gsap.ticker.remove(loop); ticking = false; },
    get selected() { return [...selected]; },
  };
}
