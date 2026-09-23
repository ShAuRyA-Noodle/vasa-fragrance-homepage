// Intro stage: mask-reveal copy, scrubbed 0..1 progress via wheel / touch
// drag / hold-press, driving scene.setIntroProgress. Reversible until 1.

export function initIntro({ el, onProgress, onEnter, reducedMotion }) {
  const hint = el.querySelector('#intro-hint');
  const hintFill = el.querySelector('#intro-hint-fill');
  let progress = 0;
  let entered = false;
  let holdRaf = null;
  let active = false;

  function set(p) {
    if (entered) return;
    progress = Math.max(0, Math.min(1, p));
    hintFill.style.transform = `scaleY(${progress})`;
    el.classList.toggle('is-progressing', progress > 0.02);
    onProgress(progress);
    if (progress >= 1) commit();
  }

  function commit() {
    if (entered) return;
    entered = true;
    stopHold();
    onEnter();
  }

  function onWheel(e) {
    if (!active) return;
    e.preventDefault();
    set(progress + e.deltaY * 0.0011);
  }

  let dragStartY = null;
  let dragStartProgress = 0;
  function onPointerDown(e) {
    if (!active) return;
    dragStartY = e.clientY;
    dragStartProgress = progress;
    startHold();
    el.setPointerCapture?.(e.pointerId);
  }
  function onPointerMove(e) {
    if (!active || dragStartY === null) return;
    const dy = dragStartY - e.clientY;
    set(dragStartProgress + dy / 260);
  }
  function onPointerUp() {
    dragStartY = null;
    stopHold();
  }

  function startHold() {
    if (holdRaf || reducedMotion) return;
    const step = () => {
      set(progress + 0.011);
      if (!entered) holdRaf = requestAnimationFrame(step);
    };
    holdRaf = requestAnimationFrame(step);
  }
  function stopHold() {
    if (holdRaf) cancelAnimationFrame(holdRaf);
    holdRaf = null;
  }

  function onKeydown(e) {
    if (!active) return;
    if (['ArrowDown', 'Enter', ' ', 'PageDown'].includes(e.key)) {
      e.preventDefault();
      if (reducedMotion) { set(1); return; }
      set(progress + 0.16);
    }
  }

  el.addEventListener('wheel', onWheel, { passive: false });
  el.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);
  window.addEventListener('keydown', onKeydown);

  return {
    activate() {
      active = true;
      entered = false;
      progress = 0;
      el.hidden = false;
      requestAnimationFrame(() => {
        el.classList.add('is-ready');
        el.querySelectorAll('.mask-inner').forEach((m, i) => {
          m.style.transition = `transform 1s cubic-bezier(.22,.68,.16,1) ${0.15 + i * 0.12}s`;
          m.style.transform = 'translateY(0)';
        });
        el.querySelectorAll('.mask-fade').forEach((m, i) => {
          m.style.transition = `opacity .8s ease ${0.5 + i * 0.1}s, transform .8s ease ${0.5 + i * 0.1}s`;
          m.style.opacity = '1';
          m.style.transform = 'translateY(0)';
        });
      });
    },
    deactivate() {
      active = false;
      el.hidden = true;
      el.classList.remove('is-ready', 'is-progressing');
      hint.style.opacity = '';
      el.querySelectorAll('.mask-inner').forEach((m) => { m.style.transition = ''; m.style.transform = ''; });
      el.querySelectorAll('.mask-fade').forEach((m) => { m.style.transition = ''; m.style.opacity = ''; m.style.transform = ''; });
    },
  };
}
