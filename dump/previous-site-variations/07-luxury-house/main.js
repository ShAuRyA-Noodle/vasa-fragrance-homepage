import Lenis from 'lenis';

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const header = document.querySelector('[data-header]');
const hero = document.querySelector('.hero');
const menu = document.querySelector('#mobile-menu');
const menuToggle = document.querySelector('.menu-toggle');
const menuClose = document.querySelector('.menu-close');
const panel = document.querySelector('.panel');
const panelTitle = document.querySelector('#panel-title');
const panelContent = document.querySelector('.panel-content');
const toast = document.querySelector('.toast');

if (!reduceMotion) {
  const lenis = new Lenis({ duration: 1.05, smoothWheel: true, wheelMultiplier: 0.85 });
  const frame = (time) => { lenis.raf(time); requestAnimationFrame(frame); };
  requestAnimationFrame(frame);
}

const headerObserver = new IntersectionObserver(([entry]) => {
  header.classList.toggle('is-solid', !entry.isIntersecting);
}, { threshold: 0.08 });
headerObserver.observe(hero);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });

document.querySelectorAll('.reveal, .reveal-image').forEach((element, index) => {
  element.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`;
  revealObserver.observe(element);
});

function setMenu(open) {
  menu.setAttribute('aria-hidden', String(!open));
  menuToggle.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
  if (open) menuClose.focus();
  else menuToggle.focus();
}

menuToggle.addEventListener('click', () => setMenu(true));
menuClose.addEventListener('click', () => setMenu(false));
menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-hidden') === 'false') setMenu(false);
  if (event.key === 'Escape' && panel.open) panel.close();
});

const panelCopy = {
  search: ['Search the house', '<p>Search will connect to the full catalogue in the commerce build.</p>'],
  bag: ['Your bag', '<p>Your bag is ready for a fragrance.</p>'],
  shipping: ['Shipping & returns', '<p>Complimentary delivery details and return support will appear here.</p>'],
  privacy: ['Privacy', '<p>Your preferences and personal information remain yours.</p>']
};

document.querySelectorAll('[data-open]').forEach((button) => button.addEventListener('click', () => {
  const [title, copy] = panelCopy[button.dataset.open] ?? ['VASA', '<p>More from the house, soon.</p>'];
  panelTitle.textContent = title;
  panelContent.innerHTML = copy;
  panel.showModal();
}));
document.querySelector('.panel-close').addEventListener('click', () => panel.close());
panel.addEventListener('click', (event) => { if (event.target === panel) panel.close(); });

let toastTimer;
function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2400);
}

document.querySelectorAll('[data-add]').forEach((button) => button.addEventListener('click', () => showToast(`${button.dataset.add} added to your bag`)));
document.querySelector('.newsletter form').addEventListener('submit', (event) => {
  event.preventDefault();
  showToast('Welcome to the house of VASA');
  event.currentTarget.reset();
});
document.querySelector('.back-top').addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));

document.querySelectorAll('.product-visual').forEach((link) => link.addEventListener('click', (event) => {
  event.preventDefault();
  showToast('The fragrance detail page is being composed');
}));
