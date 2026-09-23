// Hamburger overlay menu + "Compose Your Own" coming-soon modal.
// Modal stores email in localStorage only — no network call, per spec.

const STORAGE_KEY = 'vasa-discover-atelier-waitlist';

function trapFocus(container, onClose) {
  function onKeydown(e) {
    if (e.key === 'Escape') { onClose(); return; }
    if (e.key !== 'Tab') return;
    const focusables = container.querySelectorAll('a, button, input, [tabindex]:not([tabindex="-1"])');
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
  }
  container.addEventListener('keydown', onKeydown);
  return () => container.removeEventListener('keydown', onKeydown);
}

export function initMenu({ onRestart }) {
  const btn = document.getElementById('btn-menu');
  const overlay = document.getElementById('menu-overlay');
  const closeBtn = document.getElementById('menu-close');
  const restartBtn = document.getElementById('menu-restart');
  let untrap = null;
  let lastFocused = null;

  function open() {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    btn.setAttribute('aria-expanded', 'true');
    closeBtn.focus();
    untrap = trapFocus(overlay, close);
  }
  function close() {
    overlay.hidden = true;
    btn.setAttribute('aria-expanded', 'false');
    if (untrap) untrap();
    lastFocused?.focus();
  }

  btn.addEventListener('click', open);
  closeBtn.addEventListener('click', close);
  restartBtn.addEventListener('click', () => { close(); onRestart(); });

  return { open, close };
}

export function initComposeSoon() {
  const doorCompose = document.getElementById('door-compose');
  const overlay = document.getElementById('soon-modal');
  const closeBtn = document.getElementById('soon-close');
  const form = document.getElementById('soon-form');
  const emailInput = document.getElementById('soon-email');
  const note = document.getElementById('soon-note');
  let untrap = null;
  let lastFocused = null;

  function open() {
    lastFocused = document.activeElement;
    overlay.hidden = false;
    note.textContent = '';
    setTimeout(() => emailInput.focus(), 30);
    untrap = trapFocus(overlay, close);
  }
  function close() {
    overlay.hidden = true;
    if (untrap) untrap();
    lastFocused?.focus();
  }

  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) close(); });
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = emailInput.value.trim();
    if (!email) return;
    try {
      const list = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (!list.includes(email)) list.push(email);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
    } catch { /* storage unavailable — degrade silently */ }
    note.textContent = 'Thank you. We will find you when the atelier opens.';
    emailInput.value = '';
  });

  return { open, close };
}

export function initToast() {
  const el = document.getElementById('toast');
  let timer = null;
  return {
    show(message, duration = 2200) {
      el.textContent = message;
      el.classList.add('is-visible');
      clearTimeout(timer);
      timer = setTimeout(() => el.classList.remove('is-visible'), duration);
    },
  };
}
