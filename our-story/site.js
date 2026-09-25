const root = document.documentElement;
const themeKey = 'vasa-theme';
const themeButton = document.querySelector('[data-theme-toggle]');
const media = matchMedia('(prefers-color-scheme: dark)');

function storedTheme() {
  try { return localStorage.getItem(themeKey); } catch { return null; }
}

function applyTheme(theme, persist = false) {
  root.dataset.theme = theme;
  root.style.colorScheme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#11100f' : '#f7f3ed');
  if (themeButton) {
    const dark = theme === 'dark';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
  }
  if (persist) try { localStorage.setItem(themeKey, theme); } catch {}
}

applyTheme(root.dataset.theme || storedTheme() || (media.matches ? 'dark' : 'light'));
themeButton?.addEventListener('click', () => applyTheme(root.dataset.theme === 'dark' ? 'light' : 'dark', true));
media.addEventListener?.('change', event => { if (!storedTheme()) applyTheme(event.matches ? 'dark' : 'light'); });

const menuButton = document.querySelector('[data-menu-toggle]');
const menuPanel = document.querySelector('[data-mobile-panel]');
function setMenu(open) {
  document.body.classList.toggle('menu-open', open);
  menuButton?.setAttribute('aria-expanded', String(open));
  menuPanel?.setAttribute('aria-hidden', String(!open));
  if (menuPanel) menuPanel.inert = !open;
}
menuButton?.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
menuPanel?.addEventListener('click', event => { if (event.target.closest('a')) setMenu(false); });
addEventListener('keydown', event => { if (event.key === 'Escape') setMenu(false); });

const offer = document.querySelector('.offer-strip');
let ticking = false;
addEventListener('scroll', () => {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    offer?.classList.toggle('is-hidden', scrollY > 28);
    ticking = false;
  });
}, { passive: true });

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
const reveals = document.querySelectorAll('.reveal');
if (reducedMotion || !('IntersectionObserver' in window)) reveals.forEach(element => element.classList.add('is-visible'));
else {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    }
  }), { rootMargin: '0px 0px 100px 0px', threshold: .01 });
  reveals.forEach(element => observer.observe(element));
}

document.querySelectorAll('[data-year]').forEach(element => { element.textContent = new Date().getFullYear(); });
