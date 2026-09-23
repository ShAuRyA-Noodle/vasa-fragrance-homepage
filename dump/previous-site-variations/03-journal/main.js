import { gsap, ScrollTrigger, reduced, revealType } from '../shared/motion.js';
import { initAtelier } from '../shared/atelier-ui.js';

const products = [
  { name: 'Silent Storm', mood: 'COMPOSED / ENIGMATIC', text: 'Still waters. A restless spirit. A private confidence that never needs to announce itself.', image: '/media/editorial/journal-storm.webp', tone: '#6e5361', toneTwo: '#3d1524', accent: '#bb9e86' },
  { name: 'The Night Lingers', mood: 'AFTER DARK / INTIMATE', text: 'One more conversation. One more song. An intimate companion for evenings you wish would last a little longer.', image: '/media/editorial/nocturne-hero.webp', tone: '#49313b', toneTwo: '#27151e', accent: '#d3b28d' },
  { name: 'The Sweetest Stranger', mood: 'OPEN / UNEXPECTED', text: 'A chance encounter. An unexpected connection. A little room for possibility.', image: '/media/editorial/journal-stranger.webp', tone: '#786550', toneTwo: '#3d3025', accent: '#dcc49a' },
  { name: 'Rebel in Velvet', mood: 'SOFT / UNCOMPROMISING', text: 'A soft touch. A strong point of view. Tenderness and defiance in the same gesture.', image: '/media/editorial/journal-velvet.webp', tone: '#704052', toneTwo: '#351421', accent: '#d59a9f' }
];

initAtelier({ theme: 'light', collection: '#collection', house: '#house' });

const stage = document.querySelector('.portrait-stage');
const image = document.querySelector('#portrait-image');
const title = document.querySelector('#portrait-title');
const kicker = document.querySelector('#portrait-kicker');
const text = document.querySelector('#portrait-text');
const action = document.querySelector('.portrait-action');
const number = document.querySelector('.portrait-number');
const library = document.querySelector('.portrait-library');
const tabs = [...document.querySelectorAll('[data-mood]')];
let active = 0;
let changeId = 0;
let portraitTransition;
const portraitImages = products.map(product=>{const image=new Image();image.src=product.image;return image.decode().catch(()=>{});});

function selectPortrait(index, { focus = false } = {}) {
  if (!products[index] || index === active) return;
  const request = ++changeId;
  active = index;
  portraitTransition?.kill();
  const product = products[index];
  tabs.forEach((tab, tabIndex) => {
    const selected = tabIndex === index;
    tab.setAttribute('aria-selected', String(selected));
    tab.tabIndex = selected ? 0 : -1;
  });
  stage.setAttribute('aria-labelledby', `mood-${index}`);
  stage.setAttribute('aria-busy','true');
  action.dataset.product = String(index);
  if (focus) tabs[index].focus();
  portraitImages[index].finally(() => {
    if (request !== changeId) return;
    stage.setAttribute('aria-busy','false');
    const update = () => {
      if (request !== changeId) return;
      image.src = product.image;
      image.alt = `${product.name} fragrance bottle`;
      title.innerHTML = product.name.replace(' ', '<br>');
      kicker.textContent = product.mood;
      text.textContent = product.text;
      number.textContent = String(index + 1).padStart(2, '0');
      action.dataset.product = String(index);
      library.style.setProperty('--tone', product.tone);
      library.style.setProperty('--tone-two', product.toneTwo);
      library.style.setProperty('--accent', product.accent);
    };
    if (reduced.matches) update();
    else {
      const targets = [image, title, kicker, text, number, action];
      portraitTransition = gsap.timeline({ defaults: { overwrite: 'auto' } })
        .to(targets, { autoAlpha: 0, y: -10, duration: 0.18, stagger: 0.015, ease: 'power2.in' })
        .add(update)
        .fromTo(targets, { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.7, stagger: 0.045, ease: 'power3.out' });
    }
    if (focus) tabs[index].focus();
  });
}

tabs.forEach((tab, index) => {
  tab.addEventListener('click', () => selectPortrait(index));
  tab.addEventListener('keydown', event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? tabs.length - 1 : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    selectPortrait(next, { focus: true });
  });
});

document.fonts.ready.then(() => {
  if (reduced.matches) return;
  revealType('.opening h1', { hero: true });
  revealType('.foreword h2,.portrait-library h2,.scent-sheets h2,.house-notes h2,.closing-portrait h2', { words: true });
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .from('.opening-wordmark', { autoAlpha: 0, yPercent: 20, duration: 1.35 })
    .from('.opening-image', { autoAlpha: 0, scale: 0.94, duration: 1.25 }, 0.12)
    .from('.opening-kicker,.opening-caption', { autoAlpha: 0, duration: 0.6, stagger: 0.1 }, 0.25);
  gsap.from('.foreword-side,.foreword-copy', { y: 28, autoAlpha: 0, duration: 0.9, stagger: 0.12, scrollTrigger: { trigger: '.foreword', start: 'top 78%', once: true } });
  gsap.from('.mood-tabs button', { y: 16, autoAlpha: 0, duration: 0.65, stagger: 0.07, scrollTrigger: { trigger: '.portrait-library', start: 'top 76%', once: true } });
  gsap.from('.scent-sheet', { y: 36, autoAlpha: 0, duration: 0.85, stagger: 0.1, scrollTrigger: { trigger: '.sheets-grid', start: 'top 80%', once: true } });
  gsap.from('.note-list article', { y: 20, autoAlpha: 0, duration: 0.7, stagger: 0.08, scrollTrigger: { trigger: '.note-list', start: 'top 82%', once: true } });
  gsap.to('.opening-wordmark', { y: 32, ease: 'none', scrollTrigger: { trigger: '.opening', start: 'top top', end: 'bottom top', scrub: 1.4 } });

  ScrollTrigger.refresh();
});
