// Product-page review clips — port of the SPYLT TestimonialSection choreography.
// Desktop: pinned; cards burst in as a scattered pile, then deal out one by one
// into a row with a small landing bounce while three words drift. Hover plays a
// clip (never autoplay), lifts it and dims the rest. Tablet/mobile: tap to play.
import {gsap, ScrollTrigger} from '/05-campaign/motion.js';

const MAX_W = 200;
const RATIO = 290 / 200;
const CARD_GAP = 16;
const SIDE_PAD = 48; // keeps the dealt row off the viewport edges
const PILE = [
  {x: -18, y: 10, r: -14}, {x: 22, y: -12, r: 9}, {x: -8, y: 18, r: -22}, {x: 30, y: 8, r: 16},
  {x: -25, y: -8, r: -8}, {x: 14, y: 22, r: 20}, {x: -5, y: -16, r: -11},
];

const section = document.querySelector('[data-vasa-reviews]');
if (section) {
  const cards = [...section.querySelectorAll('.vasa-review')];
  const words = [...section.querySelectorAll('.vasa-reviews__words span')];
  const videoOf = c => c.querySelector('video');
  const pauseAll = except => cards.forEach(c => { if (c !== except) videoOf(c).pause(); });
  let desktop = false;

  gsap.matchMedia().add('(min-width: 1025px)', () => {
    desktop = true;
    section.classList.add('is-pinned');
    const total = cards.length;
    let ctx;

    const init = () => {
      const W = section.clientWidth, H = innerHeight;
      const CARD_W = Math.min(MAX_W, (W - 2 * SIDE_PAD - (total - 1) * CARD_GAP) / total);
      const CARD_H = CARD_W * RATIO;
      gsap.set(cards, {width: CARD_W, height: CARD_H});
      const rowW = total * CARD_W + (total - 1) * CARD_GAP;
      const rowX = (W - rowW) / 2, rowY = (H - CARD_H) / 2 + H * .06;
      cards.forEach((c, i) => {
        const p = PILE[i] ?? {x: 0, y: 0, r: 0};
        gsap.set(c, {x: W / 2 - CARD_W / 2 + p.x * 4, y: H / 2 - CARD_H / 2 + p.y * 4, rotate: p.r, opacity: 0, scale: .88, zIndex: i});
      });
      ctx = gsap.context(() => {
        const tl = gsap.timeline({
          scrollTrigger: {trigger: section, start: 'top top', end: `+=${total * 340 + 800}`, pin: true, pinSpacing: true, scrub: 1.6, anticipatePin: 1, invalidateOnRefresh: true},
        });
        tl.to(words[0], {x: () => innerWidth * .35, ease: 'none'}, 0)
          .to(words[1], {x: () => -innerWidth * .12, ease: 'none'}, 0)
          .to(words[2], {x: () => innerWidth * .25, ease: 'none'}, 0)
          .to(cards, {opacity: 1, scale: 1, stagger: .02, ease: 'expo.out', duration: .12}, 0);
        cards.forEach((c, i) => {
          const fx = rowX + i * (CARD_W + CARD_GAP), at = .14 + i * .11;
          tl.to(c, {x: fx, y: rowY, rotate: 0, scale: 1, opacity: .88, zIndex: 20 + i, ease: 'expo.out', duration: .2}, at)
            .to(c, {y: rowY - 12, duration: .04, ease: 'power2.out'}, at + .2)
            .to(c, {y: rowY, duration: .05, ease: 'power3.in'}, at + .24);
        });
      }, section);
    };

    init();
    const onResize = () => { ctx?.revert(); init(); ScrollTrigger.refresh(); };
    addEventListener('resize', onResize);
    requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => { removeEventListener('resize', onResize); ctx?.revert(); section.classList.remove('is-pinned'); desktop = false; };
  });

  const canHover = matchMedia('(hover: hover) and (pointer: fine)');
  cards.forEach((card, i) => {
    card.addEventListener('mouseenter', () => {
      if (!desktop || !canHover.matches) return;
      card.classList.add('is-hovered');
      videoOf(card).play().catch(() => {});
      gsap.to(card, {scale: 1.15, opacity: 1, rotate: 0, zIndex: 200, duration: .45, ease: 'expo.out'});
      cards.forEach(o => { if (o !== card) gsap.to(o, {opacity: .35, scale: .97, duration: .35, ease: 'power2.out'}); });
    });
    card.addEventListener('mouseleave', () => {
      if (!desktop || !canHover.matches) return;
      card.classList.remove('is-hovered');
      videoOf(card).pause();
      gsap.to(card, {scale: 1, opacity: .88, zIndex: 20 + i, duration: .6, ease: 'elastic.out(1, 0.55)'});
      cards.forEach(o => { if (o !== card) gsap.to(o, {opacity: .88, scale: 1, duration: .4, ease: 'power2.out'}); });
    });
    // Tap / button: toggle this clip, pause the others.
    card.querySelector('button').addEventListener('click', e => {
      e.stopPropagation();
      const v = videoOf(card);
      if (v.paused) { pauseAll(card); v.muted = false; v.play().catch(() => {}); card.classList.add('is-playing'); }
      else { v.pause(); card.classList.remove('is-playing'); }
    });
  });

  new IntersectionObserver(([e]) => { if (!e.isIntersecting) pauseAll(); }, {threshold: 0}).observe(section);
  document.addEventListener('visibilitychange', () => { if (document.hidden) pauseAll(); });
}
