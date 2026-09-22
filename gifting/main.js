const root = document.documentElement;
const themeButton = document.querySelector('.theme-toggle');
const themeLabel = document.querySelector('.theme-label');
const themeMeta = document.querySelector('meta[name="theme-color"]');
function setTheme(theme) {
  root.dataset.theme = theme;
  const dark = theme === 'dark';
  themeButton.setAttribute('aria-pressed', String(dark));
  themeButton.setAttribute('aria-label', `Use ${dark ? 'light' : 'dark'} theme`);
  themeLabel.textContent = dark ? 'Light' : 'Dark';
  themeMeta.content = dark ? '#171310' : '#f4f0e8';
  try { localStorage.setItem('vasa-theme', theme); } catch (error) { /* storage is optional */ }
}
setTheme(root.dataset.theme === 'light' ? 'light' : 'dark');
themeButton.addEventListener('click', () => setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark'));

const menuButton = document.querySelector('.menu-toggle');
const mobileMenu = document.querySelector('#mobile-menu');
menuButton.addEventListener('click', () => { const open = menuButton.getAttribute('aria-expanded') === 'true'; menuButton.setAttribute('aria-expanded', String(!open)); mobileMenu.hidden = open; });
mobileMenu.addEventListener('click', event => { if (event.target.closest('a')) { mobileMenu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); } });

document.querySelectorAll('.faq-item button').forEach(button => button.addEventListener('click', () => {
  const open = button.getAttribute('aria-expanded') === 'true';
  document.querySelectorAll('.faq-item button').forEach(item => { item.setAttribute('aria-expanded', 'false'); document.getElementById(item.getAttribute('aria-controls')).hidden = true; });
  if (!open) { button.setAttribute('aria-expanded', 'true'); document.getElementById(button.getAttribute('aria-controls')).hidden = false; }
}));

if ('IntersectionObserver' in window && !matchMedia('(prefers-reduced-motion: reduce)').matches) {
  const observer = new IntersectionObserver(entries => entries.forEach(entry => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: .12 });
  document.querySelectorAll('.reveal').forEach(item => observer.observe(item));
} else document.querySelectorAll('.reveal').forEach(item => item.classList.add('is-visible'));
