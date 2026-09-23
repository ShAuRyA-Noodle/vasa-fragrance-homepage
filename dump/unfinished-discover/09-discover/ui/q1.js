import { Q1_STOPS, Q1_INFO } from '../data.js';

// Q1 — Temperament slider: drag / keyboard / click-notch, elastic snap,
// continuous t drives live mood blend while dragging.

export function initQ1({ el, onChange, onFirstInteract }) {
  const track = el.querySelector('#q1-track');
  const orb = el.querySelector('#q1-orb');
  const poleC = el.querySelector('#q1-pole-c');
  const hint = el.querySelector('#q1-hint');
  const infoBtn = el.querySelector('#q1-info');
  const tooltip = el.querySelector('#q1-tooltip');

  tooltip.textContent = Q1_INFO;

  let value = 0.5;
  let dragging = false;
  let interacted = false;
  let trackRect = { left: 0, width: 1 };

  function measureTrack() {
    const r = track.getBoundingClientRect();
    trackRect = { left: r.left, width: r.width || 1 };
  }

  function nearestStop(t) {
    return Q1_STOPS.reduce((best, s) => (Math.abs(s.t - t) < Math.abs(best.t - t) ? s : best), Q1_STOPS[0]);
  }

  function paint(t, { snapping } = {}) {
    // Position via transform, not `left` — dragging must never trigger
    // layout (perf pass). Orb is 20px wide, so offset by half to center.
    const px = t * trackRect.width - 10;
    orb.style.transform = `translate3d(${px}px, -50%, 0)`;
    const distToCenter = Math.abs(t - 0.5);
    poleC.classList.toggle('is-visible', distToCenter < 0.22);
    track.setAttribute('aria-valuenow', String(Math.round(t * 100)));
    track.setAttribute('aria-valuetext', nearestStop(t).label[0] + nearestStop(t).label.slice(1).toLowerCase());
    orb.classList.toggle('is-dragging', !!dragging && !snapping);
  }

  function markInteracted() {
    if (interacted) return;
    interacted = true;
    hint.classList.add('is-hidden');
    onFirstInteract?.();
  }

  function commit(t, { snap = true } = {}) {
    const stop = snap ? nearestStop(t) : { t };
    value = stop.t;
    paint(value, { snapping: true });
    onChange(value, { committed: true });
  }

  function setFromClientX(clientX) {
    const t = Math.max(0, Math.min(1, (clientX - trackRect.left) / trackRect.width));
    value = t;
    paint(t);
    onChange(t, { committed: false });
  }

  track.addEventListener('pointerdown', (e) => {
    dragging = true;
    markInteracted();
    measureTrack();
    track.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);
  });
  track.addEventListener('pointermove', (e) => {
    if (!dragging) return;
    setFromClientX(e.clientX);
  });
  function endDrag(e) {
    if (!dragging) return;
    dragging = false;
    commit(value);
  }
  track.addEventListener('pointerup', endDrag);
  track.addEventListener('pointercancel', endDrag);

  el.querySelectorAll('.q1-notch').forEach((notch, i) => {
    notch.style.cursor = 'pointer';
    notch.addEventListener('click', () => {
      markInteracted();
      commit(Q1_STOPS[i].t);
    });
  });

  track.addEventListener('keydown', (e) => {
    const idx = Q1_STOPS.findIndex((s) => s.t === nearestStop(value).t);
    if (e.key === 'ArrowLeft') { e.preventDefault(); markInteracted(); commit(Q1_STOPS[Math.max(0, idx - 1)].t); }
    if (e.key === 'ArrowRight') { e.preventDefault(); markInteracted(); commit(Q1_STOPS[Math.min(Q1_STOPS.length - 1, idx + 1)].t); }
    if (e.key === 'Home') { e.preventDefault(); markInteracted(); commit(0); }
    if (e.key === 'End') { e.preventDefault(); markInteracted(); commit(1); }
  });

  infoBtn.addEventListener('click', () => {
    const open = tooltip.hidden;
    tooltip.hidden = !open;
    infoBtn.setAttribute('aria-expanded', String(open));
  });

  measureTrack();
  paint(value, { snapping: true });
  window.addEventListener('resize', () => { measureTrack(); paint(value, { snapping: true }); });

  return {
    activate() { el.hidden = false; measureTrack(); paint(value, { snapping: true }); },
    deactivate() { el.hidden = true; tooltip.hidden = true; },
    get value() { return value; },
    get hasInteracted() { return interacted; },
  };
}
