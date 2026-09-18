import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const scents = [
  { name: 'Silent Storm', title: 'Silent<br>Storm', slug: 'silent-storm', mood: 'Quiet. Composed. Unexpected.', description: 'Stillness with something stirring beneath. For a presence that doesn’t need to raise its voice.' },
  { name: 'The Night Lingers', title: 'The Night<br>Lingers', slug: 'the-night-lingers', mood: 'Warm. Magnetic. After dark.', description: 'For evenings you don’t want to end. A mood that stays with you, even as the world slips away.' },
  { name: 'The Sweetest Stranger', title: 'The Sweetest<br>Stranger', slug: 'the-sweetest-stranger', mood: 'Tender. Intriguing. Unfamiliar.', description: 'A passing encounter, an unexpected connection. For the part of you that still believes in possibility.' },
  { name: 'Rebel in Velvet', title: 'Rebel in<br>Velvet', slug: 'rebel-in-velvet', mood: 'Soft edges. Strong instincts.', description: 'A little contradiction is a beautiful thing. For softness with conviction, and a spirit that follows its own lead.' }
];
let current = 1;
let changing = false;
const photo = document.querySelector('#scent-photo');
const wipe = document.querySelector('#scent-wipe');
const controls = [...document.querySelectorAll('[data-scent]')];
function selectScent(index) {
  if (index === current || changing) return;
  const scent = scents[index];
  changing = true;
  current = index;
  controls.forEach((button, i) => { button.classList.toggle('active', i === index); button.setAttribute('aria-pressed', String(i === index)); });
  document.querySelector('#scent-title').innerHTML = scent.title;
  document.querySelector('#scent-mood').textContent = scent.mood;
  document.querySelector('#scent-description').textContent = scent.description;
  const source = `/media/hero-${scent.slug}.webp`;
  wipe.src = source;
  const finish = () => { photo.src = source; photo.alt = `${scent.name} VASA fragrance`; gsap.set(wipe, { clipPath: 'circle(0% at 70% 50%)' }); changing = false; };
  if (reduced) { finish(); return; }
  gsap.fromTo(wipe, { clipPath: 'circle(0% at 70% 50%)' }, { clipPath: 'circle(130% at 70% 50%)', duration: 1.05, ease: 'power3.inOut', onComplete: finish });
  gsap.fromTo('.scent-copy', { y: 15, opacity: .25 }, { y: 0, opacity: 1, duration: .65, ease: 'power2.out' });
}
controls.forEach(button => button.addEventListener('click', () => selectScent(Number(button.dataset.scent))));
const dialog = document.querySelector('#scent-dialog');
let lenis;
document.querySelector('#scent-detail').addEventListener('click', () => {
  const scent = scents[current];
  document.querySelector('#dialog-title').textContent = scent.name;
  document.querySelector('#dialog-description').textContent = scent.description;
  document.querySelector('#dialog-image').src = `/media/detail-${scent.slug}.webp`;
  document.querySelector('#dialog-image').alt = `${scent.name} bottle close-up`;
  dialog.showModal();
  lenis?.stop();
});
const closeDialog = () => dialog.close();
document.querySelector('.dialog-close').addEventListener('click', closeDialog);
document.querySelector('.dialog-back').addEventListener('click', closeDialog);
dialog.addEventListener('close', () => lenis?.start());
dialog.addEventListener('click', event => { if (event.target === dialog) { const rect = dialog.getBoundingClientRect(); if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) closeDialog(); } });
if (!reduced) {
  lenis = new Lenis({ duration: 1.1, smoothWheel: true, anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add(time => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  gsap.from('.hero-copy > *, .hero-top', { y: 30, opacity: 0, duration: 1, stagger: .13, delay: .12, ease: 'power3.out' });
  gsap.to('.hero-image img', { yPercent: 12, scale: 1.07, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 } });
  gsap.utils.toArray('.reveal').forEach(element => gsap.from(element, { y: 50, opacity: .7, duration: 1, ease: 'power2.out', scrollTrigger: { trigger: element, start: 'top 90%', once: true } }));
  gsap.from('.pillars details', { y: 28, opacity: .7, stagger: .12, duration: .8, scrollTrigger: { trigger: '.pillars', start: 'top 85%', once: true } });
  gsap.fromTo('.ritual-photo img', { scale: 1.14 }, { scale: 1, ease: 'none', scrollTrigger: { trigger: '.ritual', start: 'top bottom', end: 'bottom top', scrub: 1 } });
  const media = gsap.matchMedia();
  media.add('(min-width: 1024px)', () => {
    gsap.timeline({ scrollTrigger: { trigger: '.collection', start: 'top top', end: '+=45%', pin: true, scrub: 1, anticipatePin: 1 } }).fromTo('.collection-photo', { scale: 1 }, { scale: 1.07, ease: 'none' });
  });
}
