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
    world = createWorld(stage, cfg, root.dataset.name, {watch: [root.querySelector('.pd-hero'), root.querySelector('.pd-reveal'), root.querySelector('.pd-notes')]});
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

  // 3. The second beat holds the bottle in place while the camera and light travel.
  // Keep the actual ScrollTrigger on a short, dedicated section so composition begins
  // only after the reveal has cleared the product.
  const reveal = root.querySelector('.pd-reveal');
  if (!reduced.matches && reveal && matchMedia('(min-width: 761px)').matches) {
    gsap.timeline({
      scrollTrigger: {
        trigger: reveal,
        start: 'top top',
        end: () => `+=${innerHeight * 1.5}`,
        pin: true,
        scrub: .8,
        anticipatePin: 1,
        onUpdate: s => world?.setProgress(s.progress)
      }
    }).fromTo(reveal.querySelector('.pd-reveal-copy'), {y: 34, autoAlpha: 0}, {y: 0, autoAlpha: 1, duration: .52}, .13)
      .to(reveal.querySelector('.pd-reveal-copy'), {y: -28, autoAlpha: 0, duration: .3}, .72);
  } else if (reveal) {
    ScrollTrigger.create({trigger: reveal, start: 'top bottom', end: 'bottom top', scrub: true, onUpdate: s => world?.setProgress(s.progress)});
  }
  if (!reduced.matches) gsap.to('.pd-hero-copy', {yPercent: -30, opacity: 0, ease: 'none', scrollTrigger: {trigger: '.pd-hero', start: 'top top', end: '70% top', scrub: true}});

  // 4. Composition: pinned, one stage at a time.
  const notes = root.querySelector('.pd-notes');
  const items = [...notes.querySelectorAll('.pd-note')];
  const bar = notes.querySelector('.pd-notes-progress i');
  if (!reduced.matches && matchMedia('(min-width: 761px)').matches) {
    // A composition stage is a single, legible frame.  Do not crossfade note
    // headlines: long names become unreadable when adjacent panels overlap.
    let activeStage = -1;
    const showStage = progress => {
      const next = Math.min(items.length - 1, Math.floor(progress * items.length));
      if (next === activeStage) return;
      activeStage = next;
      items.forEach((item, i) => gsap.set(item, {autoAlpha: i === next ? 1 : 0}));
    };
    gsap.set(items, {autoAlpha: 0});
    showStage(0);
    const tl = gsap.timeline({scrollTrigger: {trigger: notes, start: 'top top', end: () => `+=${innerHeight * 2.2}`, pin: true, scrub: .8, anticipatePin: 1, onUpdate: s => { showStage(s.progress); if (bar) bar.style.transform = `scaleX(${s.progress})`; world?.setJourney(s.progress); }}});
    items.forEach((item, i) => {
      const img = item.querySelector('img'), words = item.querySelectorAll('.pd-note-copy > *');
      const start = i;
      if (i > 0) tl.fromTo(words, {y: 60, opacity: 0}, {y: 0, opacity: 1, stagger: .05, duration: .35}, start)
        .fromTo(img, {scale: .82, rotate: -8, yPercent: 12}, {scale: 1, rotate: 0, yPercent: 0, duration: .5, ease: 'power3.out'}, start);
      if (i < items.length - 1) tl.to(img, {scale: 1.1, rotate: 6, yPercent: -10, duration: .3}, i + .7);
    });
  } else {
    // Mobile / reduced motion: no pin, the camera journey follows the section scroll
    ScrollTrigger.create({trigger: notes, start: 'top bottom', end: 'bottom top', scrub: true, onUpdate: s => world?.setJourney(s.progress)});
  }
  // Desktop commerce follows beat one, then gets out of the ritual section's way.
  const stickyBuy = root.querySelector('.pd-sticky-buy');
  if (stickyBuy && !reduced.matches && matchMedia('(min-width: 761px)').matches) {
    ScrollTrigger.create({
      trigger: reveal || root.querySelector('.pd-hero'),
      start: 'bottom top',
      endTrigger: root.querySelector('.pd-detail'),
      end: 'top bottom',
      onToggle: self => stickyBuy.classList.toggle('is-visible', self.isActive)
    });
  }

  // SPYLT reference clips: a seven-card pile that resolves into a full-width row.
  // Each video is opt-in and pauses immediately when the section leaves view.
  const spyltReviews = root.querySelector('[data-spylt-reviews]');
  if (spyltReviews) {
    const cards = [...spyltReviews.querySelectorAll('.pd-spylt-card')];
    let reviewsVisible = false;
    let activeCard = null;
    const pauseCard = card => {
      card._spyltPlaybackToken = (card._spyltPlaybackToken || 0) + 1;
      card.querySelector('[data-spylt-video]')?.pause();
      card.classList.remove('is-playing');
      card.querySelector('button')?.setAttribute('aria-pressed', 'false');
    };
    const pauseAll = () => cards.forEach(pauseCard);
    const playCard = card => {
      activeCard = card;
      if (!reviewsVisible || document.hidden || reduced.matches) return;
      cards.forEach(other => { if (other !== card) pauseCard(other); });
      const video = card.querySelector('[data-spylt-video]');
      const token = (card._spyltPlaybackToken || 0) + 1;
      card._spyltPlaybackToken = token;
      video?.play().then(() => {
        if (card._spyltPlaybackToken === token && activeCard === card && reviewsVisible && !document.hidden && !video.paused) {
          card.classList.add('is-playing');
          card.querySelector('button')?.setAttribute('aria-pressed', 'true');
        }
      }).catch(() => {
        if (card._spyltPlaybackToken === token) pauseCard(card);
      });
    };
    const focusCard = card => {
      cards.forEach(other => {
        other.classList.toggle('is-muted', other !== card);
        gsap.to(other, {scale: other === card ? 1.15 : 1, duration: .25, overwrite: 'auto'});
        if (other === card) other.style.zIndex = '200';
      });
    };
    const clearFocus = () => {
      cards.forEach(card => { card.classList.remove('is-muted'); gsap.to(card, {scale: 1, duration: .25, overwrite: 'auto'}); card.style.zIndex = ''; });
    };
    cards.forEach(card => {
      const button = card.querySelector('button');
      card.addEventListener('pointerenter', () => {
        if (!matchMedia('(min-width: 1025px) and (hover: hover) and (pointer: fine)').matches) return;
        focusCard(card);
        playCard(card);
      });
      card.addEventListener('pointerleave', () => { if (activeCard === card) pauseCard(card); clearFocus(); });
      card.addEventListener('focusin', () => { focusCard(card); });
      card.addEventListener('focusout', event => { if (!card.contains(event.relatedTarget)) { if (activeCard === card) pauseCard(card); clearFocus(); } });
      button?.addEventListener('click', () => {
        const video = card.querySelector('[data-spylt-video]');
        if (video?.paused) playCard(card);
        else pauseCard(card);
      });
    });
    const observer = new IntersectionObserver(entries => {
      reviewsVisible = entries.some(entry => entry.isIntersecting && entry.intersectionRatio >= .3);
      if (reviewsVisible && activeCard) playCard(activeCard);
      else if (!reviewsVisible) pauseAll();
    }, {threshold: [.3]});
    observer.observe(spyltReviews);
    document.addEventListener('visibilitychange', () => { if (document.hidden) pauseAll(); else if (reviewsVisible && activeCard) playCard(activeCard); });

    if (!reduced.matches && matchMedia('(min-width: 1025px)').matches) {
      const words = [...spyltReviews.querySelectorAll('.pd-spylt-words span')];
      const rowGap = 10;
      gsap.set(cards, {xPercent: -50, yPercent: -50, autoAlpha: i => i < 3 ? 1 : 0, y: i => 64 + i * 8, rotate: i => (i - 3) * 5});
      const timeline = gsap.timeline({
        scrollTrigger: {
          trigger: spyltReviews,
          start: 'top top',
          end: () => `+=${cards.length * 340 + 800}`,
          pin: true,
          scrub: 1.6,
          anticipatePin: 1,
          invalidateOnRefresh: true
        }
      });
      timeline.to(words[0], {xPercent: -24, duration: 1.2, ease: 'none'}, 0)
        .to(words[1], {xPercent: 20, duration: 1.2, ease: 'none'}, 0)
        .to(words[2], {xPercent: -15, duration: 1.2, ease: 'none'}, 0)
        .to(cards, {
          autoAlpha: 1,
          y: 0,
          rotate: 0,
          x: i => (i - (cards.length - 1) / 2) * (cards[i].offsetWidth + rowGap),
          duration: 1,
          stagger: .12,
          ease: 'power2.out'
        }, .08);
    }
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
