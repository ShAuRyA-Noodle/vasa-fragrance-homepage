const BAG_KEY = 'vasa:campaign:bag:v1';
const THEME_KEY = 'vasa-theme';

const fragrances = {
  'silent-storm': {
    name: 'Silent Storm', family: 'Fresh · Spicy · Woody', accent: '#8faab5', line: 'A memory that stayed.',
    description: 'Bright bergamot and pepper. Aromatic lavender. A composed trail of cedar and labdanum.',
    notes: [['Opening', 'Bergamot, pepper'], ['Heart', 'Sichuan pepper, lavender, pink pepper, vetiver, patchouli, geranium, elemi'], ['Base', 'Cedar, labdanum']],
    chapter: ['Clear', 'Charged', 'Grounded'],
    mood: 'A study in quiet tension: brightness above, warmth below.',
    ritual: 'Wear it when the day needs clarity. Mist onto pulse points and let each layer arrive in its own time.',
  },
  'sweetest-stranger': {
    name: 'Sweetest Stranger', family: 'Fruity · Floral · Soft', accent: '#c99593', line: 'Some encounters stay.',
    description: 'Pear blossom and mandarin open into white gardenia and jasmine, softened by brown sugar and patchouli.',
    notes: [['Opening', 'Pear blossom, Italian mandarin, red berries'], ['Heart', 'White gardenia, jasmine, frangipani'], ['Base', 'Patchouli, brown sugar']],
    chapter: ['Bright', 'Blooming', 'Softened'],
    mood: 'An unexpected encounter, tender at first and warmer with time.',
    ritual: 'Wear it close to the skin, alone or beneath a jacket. Allow the florals and soft sweetness to unfold naturally.',
  },
  'rebel-in-velvet': {
    name: 'Rebel in Velvet', family: 'Amber · Floral · Creamy', accent: '#77556e', line: 'Softness has a bold side.',
    description: 'Creamy almond meets tuberose and Bulgarian rose. Tonka bean and cocoa bring a warm, velvety finish.',
    notes: [['Opening', 'Almond'], ['Heart', 'Tuberose, jasmine sambac, Bulgarian rose'], ['Base', 'Tonka bean, cocoa']],
    chapter: ['Creamy', 'Floral', 'Velvety'],
    mood: 'Plush florals and warmth, held together by an assured softness.',
    ritual: 'Wear it where warmth gathers: wrists, neck and the inside of the elbow. Leave space for its floral heart to open.',
  },
  'the-night-lingers': {
    name: 'The Night Lingers', family: 'Amber · Woody · Smoky', accent: '#9f7044', line: 'The warmth that stays.',
    description: 'Oud and rose, softened by benzoin. Saffron, raspberry and incense leave a dark, intimate impression.',
    notes: [['Opening', 'Oud wood'], ['Heart', 'Benzoin, rose'], ['Base', 'Saffron, raspberry, incense']],
    chapter: ['Dark', 'Resinous', 'Lingering'],
    mood: 'A darker composition shaped by woods, rose and a trace of smoke.',
    ritual: 'Wear it after dusk or whenever you want a more intimate presence. Apply lightly to pulse points and let the base emerge.',
  },
};

const productId = document.body.dataset.product;
const product = fragrances[productId];
if (!product) throw new Error(`Unknown VASA fragrance: ${productId}`);

const icon = (name) => `<svg aria-hidden="true" viewBox="0 0 24 24"><use href="#${name}"></use></svg>`;
const productPath = (id) => `/products/${id}/`;
const media = (kind, id = productId) => `/media/${kind}-${id === 'sweetest-stranger' ? 'the-sweetest-stranger' : id}.webp`;
const safeRead = (key, fallback) => { try { return localStorage.getItem(key) ?? fallback; } catch { return fallback; } };
const safeWrite = (key, value) => { try { localStorage.setItem(key, value); } catch {} };

function readBag() {
  try {
    const parsed = JSON.parse(safeRead(BAG_KEY, '[]'));
    if (!Array.isArray(parsed)) return [];
    const found = new Map();
    parsed.forEach((item) => {
      if (!item || !fragrances[item.id] || !Number.isInteger(item.quantity) || item.quantity < 1) return;
      found.set(item.id, { id: item.id, quantity: Math.min(9, (found.get(item.id)?.quantity || 0) + item.quantity) });
    });
    return [...found.values()];
  } catch { return []; }
}

let bag = readBag();
const writeBag = () => safeWrite(BAG_KEY, JSON.stringify(bag));

function pageMarkup() {
  const related = Object.entries(fragrances).filter(([id]) => id !== productId).slice(0, 3);
  return `
    <a class="skip-link" href="#product-main">Skip to product details</a>
    <div class="announcement">THE VASA COLLECTION · FOUR FRAGRANCES · 50 ML</div>
    <header class="site-header">
      <nav aria-label="Primary navigation">
        <button class="nav-menu" type="button" aria-label="Open menu" aria-expanded="false" aria-controls="mobile-nav">${icon('menu')}<span>Menu</span></button>
        <div class="nav-links nav-links--left"><a href="/our-story/">Our story</a><a href="/collection/">Collection</a></div>
        <a class="brand" href="/" aria-label="VASA Fragrance home"><img src="/media/campaign/logo-dark.svg" alt="VASA Fragrance" width="220" height="70"></a>
        <div class="nav-links nav-links--right"><a href="/gifting/">Gifting</a><button class="theme-toggle" type="button" aria-label="Switch colour theme" aria-pressed="false"><span aria-hidden="true">◐</span></button><button class="bag-button" type="button" aria-haspopup="dialog">Bag <span class="bag-count" hidden>0</span></button></div>
      </nav>
      <div class="mobile-nav" id="mobile-nav" hidden><a href="/collection/">Collection</a><a href="/gifting/">Gifting</a><a href="/our-story/">Our story</a></div>
    </header>

    <main id="product-main">
      <section class="product-hero" style="--accent:${product.accent}">
        <div class="hero-visual">
          <img src="${media('hero')}" alt="${product.name} 50 ml fragrance bottle" width="1122" height="1402" fetchpriority="high">
          <span class="hero-index" aria-hidden="true">0${Object.keys(fragrances).indexOf(productId) + 1}</span>
        </div>
        <div class="hero-copy reveal is-visible">
          <a class="breadcrumb" href="/collection/">Collection <span>/</span> ${product.name}</a>
          <p class="eyebrow">${product.family}</p>
          <h1>${product.name}</h1>
          <p class="hero-line">${product.line}</p>
          <p class="description">${product.description}</p>
          <div class="product-meta"><span>50 ml</span><span>Price announced at launch</span></div>
          <button class="add-to-bag" type="button" data-add="${productId}"><span>Add to bag</span>${icon('arrow')}</button>
          <p class="commerce-note">Your selection is saved on this device. Ordering opens when pricing and availability are confirmed.</p>
        </div>
      </section>

      <section class="olfactive-section section-dark" aria-labelledby="olfactive-title" style="--accent:${product.accent}">
        <div class="section-intro reveal"><p class="eyebrow">The olfactive structure</p><h2 id="olfactive-title">Three moments.<br><em>One impression.</em></h2><p>${product.mood}</p></div>
        <div class="notes" role="list">${product.notes.map(([stage, notes], index) => `<article class="note reveal" role="listitem"><span>0${index + 1}</span><p>${product.chapter[index]}</p><h3>${stage}</h3><p>${notes}</p></article>`).join('')}</div>
      </section>

      <section class="material-story section-light">
        <div class="material-image reveal"><img src="${media('detail')}" alt="An atmospheric detail from the world of ${product.name}" width="1254" height="1254" loading="lazy"></div>
        <div class="material-copy reveal"><p class="eyebrow">How it unfolds</p><h2>Presence,<br><em>in layers.</em></h2><dl><div><dt>Concentration</dt><dd>Composition details will be announced at launch.</dd></div><div><dt>Presence</dt><dd>A distinct character shaped by its opening, heart and base.</dd></div><div><dt>Longevity</dt><dd>The opening, the evolution, the memory that remains.</dd></div></dl></div>
      </section>

      <section class="ritual section-ivory" aria-labelledby="ritual-title">
        <div class="ritual-copy reveal"><p class="eyebrow">The ritual</p><h2 id="ritual-title">Wear it<br><em>your way.</em></h2><p>${product.ritual}</p><ol><li><span>01</span>Apply to clean, dry pulse points.</li><li><span>02</span>Let the fragrance settle without rubbing.</li><li><span>03</span>Return to it only when you want to renew its presence.</li></ol></div>
        <div class="ritual-image reveal"><img src="${media('guide')}" alt="${product.name} fragrance wearing ritual" width="1122" height="1402" loading="lazy"></div>
      </section>

      <section class="complements section-light" aria-labelledby="complements-title">
        <div class="section-heading reveal"><p class="eyebrow">Continue the collection</p><h2 id="complements-title">Other expressions.</h2></div>
        <div class="related-grid">${related.map(([id, item]) => `<a class="related-card reveal" href="${productPath(id)}" style="--card-accent:${item.accent}"><div class="related-image"><img src="${media('collection', id)}" alt="${item.name} 50 ml fragrance bottle" width="1122" height="1402" loading="lazy"></div><span>${item.family}</span><h3>${item.name}</h3><p>Discover the fragrance ${icon('arrow')}</p></a>`).join('')}</div>
      </section>
    </main>

    <footer class="site-footer">
      <div class="footer-mark"><img src="/media/campaign/logo-light.svg" alt="VASA Fragrance" width="260" height="84"></div>
      <div class="footer-grid"><div><p class="eyebrow">Fragrance that resides in you.</p><p>Four personal compositions, rooted in a family’s knowledge of perfumery.</p></div><nav aria-label="Footer navigation"><a href="/">Home</a><a href="/collection/">Collection</a><a href="/gifting/">Gifting</a><a href="/our-story/">Our story</a></nav><div><p class="eyebrow">The collection</p>${Object.entries(fragrances).map(([id, item]) => `<a href="${productPath(id)}">${item.name}</a>`).join('')}</div></div>
      <div class="footer-bottom"><span>Shop in: India</span><span>© ${new Date().getFullYear()} VASA Fragrance</span></div>
    </footer>

    <dialog class="bag-dialog" aria-labelledby="bag-title"><div class="bag-head"><h2 id="bag-title">Your bag</h2><button type="button" class="bag-close" aria-label="Close bag">${icon('close')}</button></div><div class="bag-content"></div></dialog>
    <div class="toast" role="status" aria-live="polite"></div>`;
}

document.querySelector('#app').innerHTML = pageMarkup();

const bagDialog = document.querySelector('.bag-dialog');
const bagContent = document.querySelector('.bag-content');
const toast = document.querySelector('.toast');
let toastTimer;

function updateBag() {
  const count = bag.reduce((sum, item) => sum + item.quantity, 0);
  const countElement = document.querySelector('.bag-count');
  countElement.textContent = count;
  countElement.hidden = count === 0;
  document.querySelector('.bag-button').setAttribute('aria-label', `Shopping bag, ${count} item${count === 1 ? '' : 's'}`);
  const current = bag.find((item) => item.id === productId);
  const add = document.querySelector('[data-add]');
  add.querySelector('span').textContent = current ? `In bag · ${current.quantity}` : 'Add to bag';
  bagContent.innerHTML = bag.length ? `${bag.map(({ id, quantity }) => { const item = fragrances[id]; return `<article class="bag-item"><img src="${media('collection', id)}" alt="" width="1122" height="1402"><div><h3>${item.name}</h3><p>50 ml · Price announced at launch</p><div class="quantity"><button type="button" data-quantity="${id}" data-value="${quantity - 1}" aria-label="Decrease ${item.name} quantity">−</button><span>${quantity}</span><button type="button" data-quantity="${id}" data-value="${quantity + 1}" aria-label="Increase ${item.name} quantity" ${quantity === 9 ? 'disabled' : ''}>+</button><button type="button" class="remove" data-remove="${id}">Remove</button></div></div></article>`; }).join('')}<p class="bag-message">Your selection is saved on this device. No payment is taken.</p><a class="bag-continue" href="/bag/">View your bag</a>` : '<p class="empty-bag">Your bag is waiting for a fragrance that feels like you.</p><a class="bag-continue" href="/collection/">Explore the collection</a>';
}

function showToast(message) {
  clearTimeout(toastTimer);
  toast.textContent = message;
  toast.classList.add('is-visible');
  toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2600);
}

document.addEventListener('click', (event) => {
  const target = event.target.closest('button');
  if (!target) return;
  if (target.matches('[data-add]')) {
    const found = bag.find((item) => item.id === productId);
    if (found) found.quantity = Math.min(9, found.quantity + 1); else bag.push({ id: productId, quantity: 1 });
    writeBag(); updateBag(); showToast(`${product.name} added to your bag`);
  } else if (target.matches('.bag-button')) {
    updateBag(); bagDialog.showModal(); document.body.classList.add('dialog-open');
  } else if (target.matches('.bag-close')) {
    bagDialog.close();
  } else if (target.matches('[data-quantity]')) {
    const item = bag.find((entry) => entry.id === target.dataset.quantity);
    if (item) item.quantity = Math.min(9, Number(target.dataset.value));
    bag = bag.filter((entry) => entry.quantity > 0); writeBag(); updateBag();
  } else if (target.matches('[data-remove]')) {
    bag = bag.filter((entry) => entry.id !== target.dataset.remove); writeBag(); updateBag();
  } else if (target.matches('.nav-menu')) {
    const menu = document.querySelector('#mobile-nav'); const open = menu.hidden;
    menu.hidden = !open; target.setAttribute('aria-expanded', String(open));
  } else if (target.matches('.theme-toggle')) {
    applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true);
  }
});

bagDialog.addEventListener('click', (event) => { if (event.target === bagDialog) bagDialog.close(); });
bagDialog.addEventListener('close', () => document.body.classList.remove('dialog-open'));

function applyTheme(theme, persist = false) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  const toggle = document.querySelector('.theme-toggle');
  if (toggle) { toggle.setAttribute('aria-pressed', String(theme === 'dark')); toggle.setAttribute('aria-label', `Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`); }
  document.querySelector('meta[name="theme-color"]').content = theme === 'dark' ? '#0b0b0b' : '#f5f1ea';
  if (persist) safeWrite(THEME_KEY, theme);
}

const preferredTheme = safeRead(THEME_KEY, matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
applyTheme(preferredTheme === 'dark' ? 'dark' : 'light');
updateBag();

const header = document.querySelector('.site-header');
const updateHeader = () => header.classList.toggle('is-scrolled', scrollY > 20);
addEventListener('scroll', updateHeader, { passive: true }); updateHeader();

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); } }), { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
  document.querySelectorAll('.reveal').forEach((element) => observer.observe(element));
} else document.querySelectorAll('.reveal').forEach((element) => element.classList.add('is-visible'));
