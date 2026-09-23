const header = document.querySelector('[data-header]');
const hero = document.querySelector('.hero');
const menu = document.querySelector('#menu');
const menuButton = document.querySelector('.menu-button');
const menuClose = document.querySelector('.menu-close');
const film = document.querySelector('[data-hero-video]');
const filmControl = document.querySelector('[data-film-control]');

const headerObserver = new IntersectionObserver(([entry]) => {
  header.classList.toggle('is-solid', !entry.isIntersecting);
}, { threshold: 0.05 });

headerObserver.observe(hero);

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('is-visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.14 });

document.querySelectorAll('.media-reveal').forEach((item) => revealObserver.observe(item));

function setMenu(open) {
  menu.setAttribute('aria-hidden', String(!open));
  menuButton.setAttribute('aria-expanded', String(open));
  document.body.classList.toggle('menu-open', open);
  if (open) menuClose.focus();
  else menuButton.focus();
}

menuButton.addEventListener('click', () => setMenu(true));
menuClose.addEventListener('click', () => setMenu(false));
menu.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menu.getAttribute('aria-hidden') === 'false') setMenu(false);
});

filmControl.addEventListener('click', async () => {
  if (film.paused) {
    await film.play();
    filmControl.classList.remove('is-paused');
    filmControl.setAttribute('aria-label', 'Pause campaign film');
  } else {
    film.pause();
    filmControl.classList.add('is-paused');
    filmControl.setAttribute('aria-label', 'Play campaign film');
  }
});

if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
  film.pause();
  filmControl.classList.add('is-paused');
  filmControl.setAttribute('aria-label', 'Play campaign film');
}
