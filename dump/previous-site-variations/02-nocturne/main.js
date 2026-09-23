import { gsap, ScrollTrigger, reduced } from '../shared/motion.js';
import { initAtelier } from '../shared/atelier-ui.js';

initAtelier({ theme: 'dark', collection: '#collection', house: '#house' });

const fragrances = [
  { title: 'Silent<br>Storm', line: 'A considered presence, chosen on your own terms.', tone: '#27302d' },
  { title: 'The Night<br>Lingers', line: 'An evening expression, held close and made your own.', tone: '#39241e' },
  { title: 'The Sweetest<br>Stranger', line: 'A new encounter, without an expected direction.', tone: '#4a2638' },
  { title: 'Rebel in<br>Velvet', line: 'A distinct presence with room for contradiction.', tone: '#30243d' }
];
const stage = document.querySelector('.fragrance-stage');
const controls = [...document.querySelectorAll('[data-fragrance]')];
const scenes = [...document.querySelectorAll('[data-scene]')];
const selectedNumber = document.querySelector('.selected-number');
const selectedTitle = document.querySelector('.fragrance-stage__selected h3');
const selectedLine = document.querySelector('.selected-line');
const productLink = document.querySelector('.product-link');
let current = 0;
let sceneTimeline;

function selectFragrance(next) {
  if (next === current) return;
  const incoming = scenes[next]; const outgoing = scenes[current]; const fragrance = fragrances[next];
  sceneTimeline?.kill();
  gsap.killTweensOf([stage, incoming, outgoing, document.querySelector('.fragrance-stage__selected')]);
  scenes.forEach(scene => { if (scene !== incoming && scene !== outgoing) gsap.set(scene, { autoAlpha: 0, y: 18 }); });
  controls.forEach((control, index) => { const active = index === next; control.classList.toggle('is-active', active); control.setAttribute('aria-pressed', String(active)); });
  productLink.dataset.product = String(next); selectedNumber.textContent = String(next + 1).padStart(2, '0');
  if (reduced.matches) { scenes.forEach(scene=>{scene.classList.toggle('is-active',scene===incoming);gsap.set(scene,{autoAlpha:scene===incoming?1:0,y:0});}); selectedTitle.innerHTML = fragrance.title; selectedLine.textContent = fragrance.line; stage.style.setProperty('--scene', fragrance.tone); current = next; return; }
  const text = document.querySelector('.fragrance-stage__selected');
  sceneTimeline = gsap.timeline({ defaults: { ease: 'power3.inOut' } }).to(text, { y: 10, autoAlpha: 0, duration: .24 }, 0).to(outgoing, { autoAlpha: 0, y: -16, duration: .55 }, 0).set(incoming, { autoAlpha: 0, y: 18, visibility: 'visible' }, .12).to(incoming, { autoAlpha: 1, y: 0, duration: .78 }, .15).to(stage, { '--scene': fragrance.tone, duration: .95, ease: 'sine.inOut' }, 0).add(() => { scenes.forEach(scene=>scene.classList.toggle('is-active',scene===incoming)); selectedTitle.innerHTML = fragrance.title; selectedLine.textContent = fragrance.line; }, .26).to(text, { y: 0, autoAlpha: 1, duration: .42, ease: 'power2.out' }, .3);
  current = next;
}
controls.forEach(control => control.addEventListener('click', () => selectFragrance(Number(control.dataset.fragrance))));
controls.forEach((control, index) => control.addEventListener('keydown', event => {
  if (!['ArrowRight', 'ArrowDown', 'ArrowLeft', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
  event.preventDefault();
  const next = event.key === 'Home' ? 0 : event.key === 'End' ? controls.length - 1 : (index + (event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : -1) + controls.length) % controls.length;
  controls[next].focus();
  selectFragrance(next);
}));

if (!reduced.matches) {
  gsap.registerPlugin(ScrollTrigger);
  const media = gsap.matchMedia();
  media.add('(min-width: 761px)', () => {
    gsap.from('.campaign__portrait', { scale: .96, autoAlpha: .35, duration: 1.8, ease: 'power2.out' });
    gsap.from('.campaign .kicker, .campaign h1, .campaign__footer, .campaign__index', { y: 26, autoAlpha: 0, duration: 1, stagger: .12, delay: .28, ease: 'power3.out' });
    gsap.from('.invitation h2, .invitation__copy', { y: 35, autoAlpha: 0, stagger: .16, duration: 1, scrollTrigger: { trigger: '.invitation', start: 'top 77%' } });
    gsap.from('.fragrance-stage__label, .fragrance-stage__selected', { y: 28, autoAlpha: 0, stagger: .13, duration: .9, scrollTrigger: { trigger: '.fragrance-stage', start: 'top 72%' } });
    gsap.from('.editorial-pair__words, .editorial-pair__image', { y: 35, autoAlpha: 0, duration: 1, stagger: .12, scrollTrigger: { trigger: '.editorial-pair', start: 'top 75%' } });
    gsap.from('.wear-guide article', { y: 25, autoAlpha: 0, duration: .75, stagger: .14, scrollTrigger: { trigger: '.wear-guide__chapters', start: 'top 82%' } });
    gsap.from('.house__image, .house__content', { y: 35, autoAlpha: 0, duration: 1, stagger: .18, scrollTrigger: { trigger: '.house', start: 'top 75%' } });
  });
  media.add('(max-width: 760px)', () => gsap.from('.campaign h1, .campaign__footer', { y: 20, autoAlpha: 0, duration: .9, stagger: .15, delay: .15 }));
}
