// Shared mask-reveal helper for simple fade/rise elements (kickers, captions)
// that don't need the bespoke per-line choreography intro/result use.

export function revealMasks(container, { delay = 0.15, stagger = 0.08 } = {}) {
  if (!container) return;
  const fades = [...container.querySelectorAll('.mask-fade')];
  fades.forEach((el, i) => {
    el.style.transition = 'none';
    el.style.opacity = '0';
    el.style.transform = 'translateY(10px)';
  });
  requestAnimationFrame(() => {
    fades.forEach((el, i) => {
      el.style.transition = `opacity .7s ease ${delay + i * stagger}s, transform .7s ease ${delay + i * stagger}s`;
      el.style.opacity = '1';
      el.style.transform = 'translateY(0)';
    });
  });
}
