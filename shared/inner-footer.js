export function initFooter() {
document.querySelectorAll('[data-footer-subscribe]:not([data-footer-ready])').forEach((form) => {
  form.dataset.footerReady = 'true';
  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const input = form.querySelector('input[type="email"]');
    const note = form.querySelector('.footer-newsletter-note');
    if (!input || !note) return;
    if (!input.validity.valid || !input.value.trim()) {
      note.textContent = 'Please enter a valid email address.';
      input.focus();
      return;
    }
    note.textContent = 'Newsletter delivery begins at launch. No address was submitted.';
  });
});
}

initFooter();
