const cards = [...document.querySelectorAll('.os-story-card')];
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let frame = 0;

function updateStack() {
  frame = 0;
  if (reducedMotion.matches) {
    cards.forEach(card => {
      card.style.removeProperty('--story-arrival');
      card.style.removeProperty('--story-depth');
    });
    return;
  }

  const viewport = innerHeight;
  const positions = cards.map(card => card.getBoundingClientRect().top);
  positions.forEach((top, index) => {
    const arrival = Math.max(0, Math.min(1, (viewport * .94 - top) / (viewport * .62)));
    cards[index].style.setProperty('--story-arrival', arrival.toFixed(3));
    cards[index].style.setProperty('--story-depth', arrival.toFixed(3));
  });
}

function scheduleStackUpdate() {
  if (!frame) frame = requestAnimationFrame(updateStack);
}

if (cards.length) {
  updateStack();
  addEventListener('scroll', scheduleStackUpdate, { passive: true });
  addEventListener('resize', scheduleStackUpdate, { passive: true });
  reducedMotion.addEventListener?.('change', scheduleStackUpdate);
}
