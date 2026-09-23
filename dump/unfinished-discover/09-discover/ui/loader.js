// Loader: counter tied to real asset loading progress. Resolves when scene
// (or its stub) is ready AND the minimum reveal time has elapsed.

export function runLoader({ el, scenePromise, minDuration = 1400 }) {
  const countEl = el.querySelector('#loader-count');
  let progress = 0;
  let raf = null;

  function render() {
    countEl.textContent = String(Math.round(progress * 100)).padStart(2, '0');
  }

  function setProgress(p) {
    progress = Math.max(progress, Math.min(1, p));
    render();
  }

  const started = performance.now();

  return new Promise((resolve) => {
    let sceneApi = null;
    let sceneDone = false;

    scenePromise
      .then((api) => { sceneApi = api; })
      .catch(() => {})
      .finally(() => { sceneDone = true; finishIfReady(); });

    function tick() {
      // simulate steady progress so the counter never stalls even if the
      // real loader reports coarse/late progress events.
      if (progress < 0.92) setProgress(progress + (0.92 - progress) * 0.045 + 0.002);
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);

    function finishIfReady() {
      const elapsed = performance.now() - started;
      const wait = Math.max(0, minDuration - elapsed);
      setTimeout(() => {
        setProgress(1);
        cancelAnimationFrame(raf);
        el.classList.add('is-leaving');
        setTimeout(() => {
          el.hidden = true;
          resolve(sceneApi);
        }, 650);
      }, wait);
    }
  });
}

export function makeOnProgress(el) {
  const countEl = el.querySelector('#loader-count');
  return (t) => {
    countEl.textContent = String(Math.round(Math.max(0, Math.min(1, t)) * 100)).padStart(2, '0');
  };
}
