// Product page choreography: intro curtain, WebGL world, pinned notes journey,
// colour-wipe transitions between fragrances. Chrome/bag/search come from 05-campaign/main.js.
import {gsap, ScrollTrigger, SplitText, reduced} from '/05-campaign/motion.js';
import {worlds} from './worlds.js';

const root = document.querySelector('.pd');
const id = root?.dataset.product;
const cfg = worlds[id];
const wipe = document.querySelector('.pd-wipe');

if (root && cfg) {
  // 1. WebGL world (lazy: keeps first paint light)
  const stage = root.querySelector('.pd-stage');
  let world = null;
  import('./scene.js').then(({createWorld}) => {
    world = createWorld(stage, cfg, root.dataset.name, {watch: [root.querySelector('.pd-hero'), root.querySelector('.pd-notes')]});
    if (world) { stage.classList.add('is-live'); root.classList.add('is-live'); }
  }).catch(() => {});

  // 2. Intro: curtain lifts, title lines rise
  const title = root.querySelector('.pd-hero h1');
  if (!reduced.matches) {
    const split = SplitText.create(title, {type: 'lines', linesClass: 'pd-line', mask: 'lines', aria: 'auto'});
    const tl = gsap.timeline({defaults: {ease: 'power4.out'}});
    tl.to(wipe, {yPercent: -100, duration: 1.15, ease: 'expo.inOut'})
      .from(split.lines, {yPercent: 110, duration: 1.2, stagger: .1}, '-=.55')
      .from('.pd-hero [data-intro]', {y: 18, opacity: 0, duration: .9, stagger: .08, clearProps: 'transform,opacity'}, '-=.9');
  } else gsap.set(wipe, {yPercent: -100});

  // 3. Scroll drives the bottle; hero copy drifts away
  ScrollTrigger.create({trigger: '.pd-hero', start: 'top top', end: 'bottom top', scrub: true, onUpdate: s => world?.setProgress(s.progress)});
  if (!reduced.matches) gsap.to('.pd-hero-copy', {yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: {trigger: '.pd-hero', start: 'top top', end: '70% top', scrub: true}});

  // 4. Notes journey: pinned, one stage at a time
  const notes = root.querySelector('.pd-notes');
  const items = [...notes.querySelectorAll('.pd-note')];
  const bar = notes.querySelector('.pd-notes-progress i');
  if (!reduced.matches && matchMedia('(min-width: 761px)').matches) {
    gsap.set(items.slice(1), {autoAlpha: 0});
    const tl = gsap.timeline({scrollTrigger: {trigger: notes, start: 'top top', end: () => `+=${innerHeight * 2.2}`, pin: true, scrub: .8, anticipatePin: 1, onUpdate: s => { if (bar) bar.style.transform = `scaleX(${s.progress})`; world?.setJourney(s.progress); }}});
    items.forEach((item, i) => {
      const img = item.querySelector('img'), words = item.querySelectorAll('.pd-note-copy > *');
      if (i > 0) tl.fromTo(item, {autoAlpha: 0}, {autoAlpha: 1, duration: .25}, i)
        .fromTo(words, {y: 60, opacity: 0}, {y: 0, opacity: 1, stagger: .05, duration: .35}, i)
        .fromTo(img, {scale: .82, rotate: -8, yPercent: 12}, {scale: 1, rotate: 0, yPercent: 0, duration: .5, ease: 'power3.out'}, i);
      if (i < items.length - 1) tl.to(item, {autoAlpha: 0, duration: .25}, i + .75)
        .to(img, {scale: 1.1, rotate: 6, yPercent: -10, duration: .3}, i + .7);
    });
  } else {
    // Mobile / reduced motion: no pin, the camera journey follows the section scroll
    ScrollTrigger.create({trigger: notes, start: 'top bottom', end: 'bottom top', scrub: true, onUpdate: s => world?.setJourney(s.progress)});
  }
  // Reveals + parallax come from /shared/page-reveal.js
}

// 6. Colour-wipe transition into another fragrance
document.addEventListener('click', e => {
  const link = e.target.closest('a[href^="/products/"]');
  if (!link || !wipe || e.metaKey || e.ctrlKey || e.shiftKey || link.target) return;
  const next = worlds[link.getAttribute('href').split('/')[2]];
  if (reduced.matches) return;
  e.preventDefault();
  if (next) wipe.style.background = `linear-gradient(180deg, ${next.bg[0]}, ${next.bg[1]})`;
  gsap.fromTo(wipe, {yPercent: 100}, {yPercent: 0, duration: .8, ease: 'expo.inOut', onComplete: () => { location.href = link.href; }});
});
addEventListener('pageshow', e => { if (e.persisted && wipe) gsap.set(wipe, {yPercent: -100}); });
