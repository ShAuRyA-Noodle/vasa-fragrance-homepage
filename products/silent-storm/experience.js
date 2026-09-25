import { gsap, ScrollTrigger } from '/05-campaign/motion.js';
import { createStormAtmosphere } from './storm-atmosphere.js';

const page = document.querySelector('[data-silent-storm]');

if (page) {
  const journey = page.querySelector('.ss-journey');
  const stage = journey?.querySelector('.ss-stage');
  const host = journey?.querySelector('.ss-3d-host');
  const worldImage = journey?.querySelector('.ss-world-image');
  const fallback = journey?.querySelector('.ss-object');
  const beats = [...(journey?.querySelectorAll('.ss-beat') || [])];
  const currentLabel = journey?.querySelector('.ss-current');
  const progressBar = journey?.querySelector('.ss-progress');
  const cue = journey?.querySelector('.ss-scroll-cue');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const scene = !reducedMotion.matches && host ? createStormAtmosphere(host, { stage }) : null;
  const events = new AbortController();
  let trigger;
  let choreography;
  let intro;
  const secondaryTriggers = [];
  let destroyed = false;
  let active = -1;

  if (!reducedMotion.matches && journey && stage && beats.length === 5) {
    // CSS keeps the stage sticky. A single scrubbed timeline keeps the
    // atmosphere, headlines, scent elements and 3D bottle in one scroll space.
    const duration = 1 / beats.length;
    choreography = gsap.timeline({ paused: true, defaults: { ease: 'power2.inOut' } });
    gsap.set(beats.slice(1), { autoAlpha: 0 });
    gsap.set(beats[0], { autoAlpha: 1 });

    // A first impression plays without scrolling. Keep the heading unmasked:
    // serif descenders and italic swashes need their full painted bounds.
    const opening = beats[0];
    intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
    intro.fromTo(opening.querySelector('.ss-kicker'),
      { autoAlpha: 0, y: 18 }, { autoAlpha: 1, y: 0, duration: 0.65 }, 0.08);
    intro.fromTo(opening.querySelector('h1'),
      { autoAlpha: 0, y: 58, rotateX: 9, transformPerspective: 900, transformOrigin: '50% 100%' },
      { autoAlpha: 1, y: 0, rotateX: 0, duration: 1.12 }, 0.16);
    intro.fromTo(opening.querySelector('.ss-beat-description'),
      { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.8 }, 0.54);
    intro.fromTo(opening.querySelector('.ss-inline-link'),
      { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7 }, 0.72);

    beats.forEach((beat, index) => {
      const at = index * duration;
      const kicker = beat.querySelector('.ss-kicker');
      const heading = beat.querySelector('h1, h2');
      const description = beat.querySelector('.ss-beat-description');
      const link = beat.querySelector('.ss-inline-link');
      const ingredient = beat.querySelector('.ss-ingredient');

      if (index > 0) {
        // The mask opens entirely before the beat settles; final text cannot
        // remain clipped and no animation affects the stage-bottom controls.
        choreography.fromTo(beat,
          { autoAlpha: 0, y: 46, x: 12, scale: 0.975 },
          { autoAlpha: 1, y: 0, x: 0, scale: 1, duration: 0.077, immediateRender: false },
          at - 0.027);
        if (kicker) choreography.fromTo(kicker,
          { autoAlpha: 0, x: -36 },
          { autoAlpha: 1, x: 0, duration: 0.073, immediateRender: false },
          at - 0.014);
        if (heading) choreography.fromTo(heading,
          { autoAlpha: 0, y: 66, rotateX: 13, clipPath: 'inset(100% 0% 0% 0%)', transformPerspective: 900, transformOrigin: '50% 100%' },
          { autoAlpha: 1, y: 0, rotateX: 0, clipPath: 'inset(0% 0% 0% 0%)', duration: 0.095, immediateRender: false },
          at - 0.016);
        if (heading) choreography.set(heading, { clearProps: 'clipPath' }, at + 0.08);
        if (description) choreography.fromTo(description,
          { autoAlpha: 0, y: 34 },
          { autoAlpha: 1, y: 0, duration: 0.074, immediateRender: false },
          at + 0.023);
        if (ingredient) choreography.fromTo(ingredient,
          { autoAlpha: 0, x: 155, y: 45, rotation: 18, scale: 0.48 },
          { autoAlpha: 1, x: 0, y: 0, rotation: 0, scale: 1, duration: 0.125, immediateRender: false },
          at - 0.026);
        if (link) choreography.fromTo(link,
          { autoAlpha: 0, y: 16 },
          { autoAlpha: 1, y: 0, duration: 0.055, immediateRender: false },
          at + 0.045);
      }

      if (index < beats.length - 1) {
        const leaving = (index + 1) * duration;
        // Adjacent chapters overlap gently, leaving no empty transition frame.
        choreography.to(beat,
          { autoAlpha: 0, y: -55, x: -18, scale: 1.035, duration: 0.068 },
          leaving - 0.028);
        if (ingredient) choreography.to(ingredient,
          { autoAlpha: 0, x: -150, y: -42, rotation: -13, scale: 1.18, duration: 0.075 },
          leaving - 0.026);
      }
    });

    if (worldImage) {
      choreography.fromTo(worldImage,
        { scale: 1.08, xPercent: -1, yPercent: 0, opacity: 0.44 },
        { scale: 1.19, xPercent: 3.8, yPercent: -2.5, opacity: 0.67, duration: 0.42, ease: 'none', immediateRender: false }, 0);
      choreography.to(worldImage,
        { scale: 1.09, xPercent: -3.2, yPercent: 0.4, opacity: 0.45, duration: 0.38, ease: 'none' }, 0.42);
      choreography.to(worldImage,
        { scale: 1.06, xPercent: 0, yPercent: 0, opacity: 0.39, duration: 0.2, ease: 'none' }, 0.8);
    }
    if (cue) choreography.to(cue, { autoAlpha: 0, duration: 0.08 }, 0.025);

    const update = (value) => {
      const progress = gsap.utils.clamp(0, 1, value);
      scene?.setProgress(progress);
      if (progressBar) progressBar.style.transform = `scaleX(${progress})`;
      const next = Math.min(beats.length - 1, Math.floor(progress * beats.length));
      if (next !== active) {
        active = next;
        beats.forEach((beat, index) => beat.classList.toggle('is-active', index === next));
        if (currentLabel) currentLabel.textContent = String(next + 1).padStart(2, '0');
      }
      if (fallback && !stage.classList.contains('is-3d-ready')) {
        const breathe = Math.sin(progress * Math.PI * 4) * 0.027;
        const drift = Math.sin(progress * Math.PI * 2) * 2.5;
        fallback.style.transform = `translate(calc(-50% + ${drift}%),-50%) scale(${1 + breathe})`;
      }
    };

    trigger = ScrollTrigger.create({
      animation: choreography,
      trigger: journey,
      start: 'top top',
      end: 'bottom bottom',
      scrub: 0.48,
      invalidateOnRefresh: true,
      onUpdate: (self) => update(self.progress),
      onRefresh: (self) => update(self.progress),
    });
    update(trigger.progress);

    // The story does not stop abruptly when the sticky 3D chapter ends.
    const purchasePhoto = page.querySelector('.ss-purchase-photo img');
    const purchaseCopy = page.querySelector('.ss-purchase-copy');
    const relatedCards = [...page.querySelectorAll('.ss-related-grid a')];
    if (purchasePhoto) secondaryTriggers.push(ScrollTrigger.create({
      trigger: '.ss-purchase', start: 'top bottom', end: 'top 28%', scrub: 0.65,
      animation: gsap.fromTo(purchasePhoto,
        { y: 95, scale: 0.88, rotateY: -9 },
        { y: 0, scale: 1, rotateY: 0, ease: 'none', paused: true }),
    }));
    if (purchaseCopy) secondaryTriggers.push(ScrollTrigger.create({
      trigger: '.ss-purchase', start: 'top 84%', end: 'top 42%', scrub: 0.5,
      animation: gsap.fromTo(purchaseCopy,
        { autoAlpha: 0.55, x: 65 },
        { autoAlpha: 1, x: 0, ease: 'none', paused: true }),
    }));
    relatedCards.forEach((card, index) => secondaryTriggers.push(ScrollTrigger.create({
      trigger: card, start: 'top 95%', end: 'top 65%', scrub: 0.35,
      animation: gsap.fromTo(card,
        { autoAlpha: 0.45, y: 55 + index * 12 },
        { autoAlpha: 1, y: 0, ease: 'none', paused: true }),
    })));
    addEventListener('pageshow', () => ScrollTrigger.refresh(), { signal: events.signal });
  }

  const teardown = () => {
    if (destroyed) return;
    destroyed = true;
    events.abort();
    trigger?.kill();
    secondaryTriggers.forEach((item) => item.kill());
    choreography?.kill();
    intro?.kill();
    scene?.destroy();
  };
  addEventListener('pagehide', teardown, { once: true });
}
