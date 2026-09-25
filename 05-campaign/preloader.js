const preloader = document.querySelector('.vasa-preloader');

if (preloader) {
  try { history.scrollRestoration = 'manual'; } catch {}
  scrollTo(0, 0);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const heroPoster = document.querySelector('.hero-poster-desktop');
  const ready = heroPoster?.decode?.().catch(() => {}) ?? Promise.resolve();
  const timeout = ms => new Promise(resolve => setTimeout(resolve, ms));

  Promise.all([reduced ? Promise.resolve() : Promise.race([ready, timeout(1800)]), timeout(reduced ? 50 : 2350)]).then(() => {
    if (!preloader.isConnected) return;
    scrollTo(0, 0);
    preloader.classList.add('is-revealing');
    setTimeout(() => document.dispatchEvent(new Event('vasa:preloader-exit')), reduced ? 0 : 450);
    setTimeout(() => { preloader.remove();try { history.scrollRestoration = 'auto'; } catch {} }, reduced ? 0 : 900);
  });
}
