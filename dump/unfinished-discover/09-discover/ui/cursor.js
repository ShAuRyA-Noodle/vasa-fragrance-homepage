// Custom cursor: gold dot (snappy) + lerped ring with contextual label.
// Magnetic pull on buttons/doors. Hidden entirely on touch input.
// Driven by gsap.ticker (one shared RAF for the whole page, per perf pass)
// and translate3d only, so it never touches layout-affecting properties.
import gsap from 'gsap';

const MAGNETIC_SELECTOR = '.door, .btn-primary, .btn-ghost, .chrome-btn, .q2-arrow, .result-other, .info-pill';
const LABEL_SELECTOR = '[data-cursor-label], a, button';

export function initCursor() {
  const root = document.getElementById('cursor');
  if (!root) return { destroy() {} };
  const dot = root.querySelector('.cursor-dot');
  const ring = root.querySelector('.cursor-ring');
  const label = root.querySelector('.cursor-label');

  let running = false;
  let touchMode = false;
  const mouse = { x: innerWidth / 2, y: innerHeight / 2 };
  const dotPos = { x: mouse.x, y: mouse.y };
  const ringPos = { x: mouse.x, y: mouse.y };
  let magnet = null;
  let magnetCenter = null; // cached on hover-enter, not read every frame
  let ringScale = 0.405; // matches CSS resting scale; lerped toward 1 when active

  function onPointerMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  function onTouchStart() {
    touchMode = true;
    document.body.classList.add('touch-input');
    stop();
  }

  function guessLabel(el) {
    if (el.dataset.cursorLabel) return el.dataset.cursorLabel;
    if (el.classList.contains('q1-orb') || el.id === 'q1-track') return 'DRAG';
    if (el.closest && el.closest('.q3-ribbon-wrap')) return 'DRAG';
    if (el.tagName === 'A') return 'ENTER';
    return 'SELECT';
  }

  function onOver(e) {
    const target = e.target.closest(LABEL_SELECTOR);
    if (target && !target.disabled) {
      ring.classList.add('is-active');
      label.textContent = guessLabel(target);
    } else {
      ring.classList.remove('is-active');
      label.textContent = '';
    }
    const mag = e.target.closest(MAGNETIC_SELECTOR);
    const nextMagnet = mag && !mag.disabled ? mag : null;
    if (nextMagnet !== magnet) {
      magnet = nextMagnet;
      // Cache the rect once on hover-enter instead of reading layout every
      // tick — these targets are static-position buttons/doors.
      magnetCenter = magnet ? (() => {
        const r = magnet.getBoundingClientRect();
        return { x: r.left + r.width / 2, y: r.top + r.height / 2 };
      })() : null;
    }
  }

  function onOut(e) {
    const still = e.relatedTarget && e.relatedTarget.closest;
    if (!still || !e.relatedTarget.closest(LABEL_SELECTOR)) {
      ring.classList.remove('is-active');
      label.textContent = '';
    }
    if (!still || !e.relatedTarget.closest(MAGNETIC_SELECTOR)) {
      magnet = null;
      magnetCenter = null;
    }
  }

  function tick() {
    dotPos.x += (mouse.x - dotPos.x) * 0.5;
    dotPos.y += (mouse.y - dotPos.y) * 0.5;
    ringPos.x += (mouse.x - ringPos.x) * 0.18;
    ringPos.y += (mouse.y - ringPos.y) * 0.18;
    dot.style.transform = `translate3d(${dotPos.x}px, ${dotPos.y}px, 0) translate(-50%,-50%)`;

    let rx = ringPos.x, ry = ringPos.y;
    if (magnetCenter) {
      rx += (magnetCenter.x - rx) * 0.35;
      ry += (magnetCenter.y - ry) * 0.35;
    }
    const isActive = ring.classList.contains('is-active');
    ringScale += ((isActive ? 1 : 0.405) - ringScale) * 0.22;
    ring.style.transform = `translate3d(${rx}px, ${ry}px, 0) translate(-50%,-50%) scale(${ringScale.toFixed(3)})`;
  }

  function stop() {
    if (running) gsap.ticker.remove(tick);
    running = false;
  }

  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('touchstart', onTouchStart, { passive: true, once: true });
  document.addEventListener('pointerover', onOver);
  document.addEventListener('pointerout', onOut);
  if (!touchMode) { gsap.ticker.add(tick); running = true; }

  return {
    destroy() {
      stop();
      window.removeEventListener('pointermove', onPointerMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
    },
  };
}
