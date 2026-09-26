// Site-wide shopping extras: quick look, the sticky product buy bar, the first-visit
// offer and the scripted VASA Concierge chat. Runs on campaign pages (05-campaign/main.js)
// and store pages (shared/store-shell.js); each host passes its own bag handler.
import './vasa-extras.css';

const TESTER_LINE = 'Complimentary tester with every 50 ml bottle.';
const VARIANCE_LINE = 'Perfume color may slightly vary due to the use of natural ingredients.';
const OFFERS = ['Diwali with VASA: free delivery on orders above ₹999', TESTER_LINE, 'Not sure which scent is you? Take the 20-second quiz'];
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const esc = s => String(s).replace(/[&<>"']/g, c => ({'&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'}[c]));
const plate = p => `/plates/${p.id}.png`;
const closeIcon = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m6 6 12 12M6 18 18 6"/></svg>';
const arrow = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
const store = (area, key) => ({
  get() { try { return JSON.parse(window[area].getItem(key)); } catch { return null; } },
  set(value) { try { window[area].setItem(key, JSON.stringify(value)); } catch {} },
});

export function initVasaExtras({catalog, addToBag, lenis = null, isBusy = () => false}) {
  if (document.documentElement.dataset.vxReady) return;
  document.documentElement.dataset.vxReady = '1';
  const byId = id => catalog.find(p => p.id === id);
  const anyModalOpen = () => [...document.querySelectorAll('dialog')].some(d => d.open);
  const lock = () => lenis?.stop();
  const unlock = () => { if (!anyModalOpen()) lenis?.start(); };
  const openModal = dialog => { dialog.showModal(); lock(); requestAnimationFrame(() => dialog.classList.add('is-in')); };
  const closeModal = dialog => {
    if (!dialog.open) return;
    if (reduced.matches) { dialog.close(); return; }
    dialog.classList.remove('is-in');
    setTimeout(() => dialog.close(), 260);
  };
  const wireModal = dialog => {
    dialog.addEventListener('click', e => { if (e.target === dialog || e.target.closest('[data-vx-close]')) closeModal(dialog); });
    dialog.addEventListener('cancel', e => { e.preventDefault(); closeModal(dialog); });
    dialog.addEventListener('close', () => { dialog.classList.remove('is-in'); unlock(); });
  };
  const add = (id, {buy = false} = {}) => {
    if (!byId(id)) return;
    addToBag(id);
    if (buy) location.href = '/checkout/';
  };

  /* ---------- Quick look ---------- */
  const ql = document.createElement('dialog');
  ql.className = 'vx-modal vx-ql';
  ql.setAttribute('aria-labelledby', 'vx-ql-title');
  document.body.append(ql);
  wireModal(ql);
  let qlIndex = 0;
  function renderQuickLook(p) {
    qlIndex = catalog.indexOf(p);
    ql.style.setProperty('--scent', p.color);
    ql.innerHTML = `<div class="vx-ql__card">
      <button class="vx-icon-btn vx-ql__close" type="button" data-vx-close aria-label="Close quick look">${closeIcon}</button>
      <div class="vx-ql__media"><img src="${plate(p)}" alt="${esc(p.name)} 50 ml bottle" width="1122" height="1402"><div class="vx-ql__nav"><button class="vx-icon-btn" type="button" data-vx-ql-step="-1" aria-label="Previous fragrance">←</button><span>${String(qlIndex + 1).padStart(2, '0')} / ${String(catalog.length).padStart(2, '0')}</span><button class="vx-icon-btn" type="button" data-vx-ql-step="1" aria-label="Next fragrance">→</button></div></div>
      <div class="vx-ql__body">
        <p class="vx-eyebrow">${esc(p.family)} · 50 ML</p>
        <h2 id="vx-ql-title">${esc(p.name)}</h2>
        <p class="vx-ql__line">${esc(p.line)}</p>
        <p class="vx-ql__desc">${esc(p.description)}</p>
        <dl class="vx-ql__notes">${p.notes.map(([n, d]) => `<div><dt>${n === 'Opening' ? 'Top' : esc(n)}</dt><dd>${esc(d)}</dd></div>`).join('')}</dl>
        <div class="vx-ql__meta"><span>50 ml</span><span>Price announced at launch</span></div>
        <div class="vx-ql__actions"><button class="vx-btn vx-btn--solid" type="button" data-vx-add="${p.id}">ADD TO BAG <span aria-hidden="true">+</span></button><a class="vx-btn vx-btn--ghost" href="/products/${p.id}/">FULL DETAILS ${arrow}</a></div>
        <p class="vx-ql__foot">${TESTER_LINE}</p><p class="vx-variance">${VARIANCE_LINE}</p>
      </div></div>`;
  }
  function openQuickLook(id) {
    const p = byId(id);
    if (!p) return;
    renderQuickLook(p);
    if (!ql.open) openModal(ql);
    ql.querySelector('.vx-ql__close').focus({preventScroll: true});
  }
  // Related-fragrance links on product pages get the same quick look as the product cards.
  document.querySelectorAll('.ss-related-grid > a[href^="/products/"]').forEach(link => {
    const id = link.getAttribute('href').split('/')[2];
    if (!byId(id)) return;
    const host = document.createElement('div');
    host.className = 'vx-ql-host';
    link.replaceWith(host);
    host.append(link);
    host.insertAdjacentHTML('beforeend', `<button class="vx-quicklook" type="button" data-quicklook="${id}" aria-label="Quick look: ${esc(byId(id).name)}">QUICK LOOK</button>`);
  });

  /* ---------- Sticky buy bar (product pages) ---------- */
  const productRoot = document.querySelector('main[data-product]');
  const product = productRoot && byId(productRoot.dataset.product);
  if (product) {
    const bar = document.createElement('div');
    bar.className = 'vx-buybar';
    bar.setAttribute('role', 'region');
    bar.setAttribute('aria-label', `Buy ${product.name}`);
    bar.style.setProperty('--scent', product.color);
    bar.innerHTML = `<img class="vx-buybar__thumb" src="${plate(product)}" alt="" width="1122" height="1402"><div class="vx-buybar__copy"><strong>${esc(product.name)}</strong><span>50 ml · Price announced at launch</span></div><div class="vx-buybar__actions"><button class="vx-btn vx-btn--ghost" type="button" data-vx-add="${product.id}">ADD TO BAG</button><button class="vx-btn vx-btn--solid" type="button" data-vx-buy="${product.id}">BUY NOW</button></div>`;
    document.body.append(bar);
    const sync = () => {
      const on = scrollY > innerHeight * .35;
      bar.classList.toggle('is-on', on);
      document.body.classList.toggle('vx-buybar-on', on);
    };
    addEventListener('scroll', sync, {passive: true});
    addEventListener('resize', sync, {passive: true});
    sync();
  }

  /* ---------- First-visit offer ---------- */
  // Once per visit (browser session); `?offer` in the URL forces it for review.
  const offerSeen = store('sessionStorage', 'vasa-offer-seen:v2');
  const offerForced = new URLSearchParams(location.search).has('offer');
  const offerAllowed = offerForced || !/^\/(checkout|bag)\//.test(location.pathname);
  const offer = document.createElement('dialog');
  offer.className = 'vx-modal vx-offer';
  offer.setAttribute('aria-labelledby', 'vx-offer-title');
  offer.innerHTML = `<div class="vx-offer__card">
    <button class="vx-icon-btn vx-offer__close" type="button" data-vx-close aria-label="Close offer">${closeIcon}</button>
    <div class="vx-offer__media"><img src="/media/campaign/festival/diwali-signature.webp" alt="VASA fragrance in a Diwali setting" width="2000" height="1200"><span class="vx-offer__stamp">DIWALI<br>2026</span></div>
    <div class="vx-offer__body">
      <p class="vx-eyebrow">THE DIWALI EDIT · A SEASON FOR GIVING</p>
      <h2 id="vx-offer-title">Light, held <em>close.</em></h2>
      <p class="vx-offer__intro">This festive season, every VASA order arrives with a little more.</p>
      <ul class="vx-offer__perks"><li><b>Free delivery</b><span>on orders above ₹999</span></li><li><b>Complimentary tester</b><span>with every 50 ml bottle</span></li></ul>
      <a class="vx-btn vx-btn--solid vx-offer__cta" href="/collection/">SHOP THE DIWALI EDIT ${arrow}</a>
      <button class="vx-offer__later" type="button" data-vx-close>Maybe later</button>
    </div></div>`;
  document.body.append(offer);
  wireModal(offer);
  offer.addEventListener('close', () => scheduleNudge(6000));
  if ((offerForced || !offerSeen.get()) && offerAllowed) {
    const tryOpen = () => {
      if (isBusy() || anyModalOpen() || chatIsOpen()) { setTimeout(tryOpen, 1200); return; }
      offerSeen.set(Date.now());
      openModal(offer);
      offer.querySelector('.vx-offer__cta').focus({preventScroll: true});
    };
    setTimeout(tryOpen, 4000);
  }

  /* ---------- VASA Concierge (scripted chat) ---------- */
  const chatState = store('sessionStorage', 'vasa-concierge:v1');
  const saved = chatState.get() || {log: [], nudged: false};
  const chat = document.createElement('div');
  chat.className = 'vx-chat';
  chat.innerHTML = `
    <div class="vx-nudge" hidden><button class="vx-nudge__text" type="button"></button><button class="vx-nudge__x" type="button" aria-label="Dismiss message">${closeIcon}</button></div>
    <button class="vx-chat__launcher" type="button" aria-expanded="false" aria-controls="vx-chat-panel" aria-label="Chat with the VASA Concierge"><img src="/media/campaign/mark-gold.svg" alt="" width="40" height="40"><span class="vx-chat__ring" aria-hidden="true"></span></button>
    <section class="vx-chat__panel" id="vx-chat-panel" role="dialog" aria-label="VASA Concierge" data-lenis-prevent hidden>
      <header class="vx-chat__head"><span class="vx-chat__avatar"><img src="/media/campaign/mark-gold.svg" alt="" width="30" height="30"></span><div><strong>VASA Concierge</strong><span><i aria-hidden="true"></i>Here to help, anytime</span></div><button class="vx-icon-btn" type="button" data-vx-restart aria-label="Start over" title="Start over">↺</button><button class="vx-icon-btn" type="button" data-vx-chat-close aria-label="Close chat">${closeIcon}</button></header>
      <div class="vx-chat__ticker" aria-hidden="true"><span></span></div>
      <div class="vx-chat__log" role="log" aria-live="polite"></div>
      <form class="vx-chat__form"><label class="vx-sr" for="vx-chat-input">Ask the VASA Concierge</label><input id="vx-chat-input" type="text" autocomplete="off" maxlength="200" placeholder="Ask about scents, offers, delivery…"><button type="submit" aria-label="Send">${arrow}</button></form>
    </section>`;
  document.body.append(chat);
  const launcher = chat.querySelector('.vx-chat__launcher');
  const panel = chat.querySelector('.vx-chat__panel');
  const log = chat.querySelector('.vx-chat__log');
  const input = chat.querySelector('#vx-chat-input');
  const nudge = chat.querySelector('.vx-nudge');
  const ticker = chat.querySelector('.vx-chat__ticker span');
  function chatIsOpen() { return !panel.hidden; }

  const LABELS = {find: '✦ Find my fragrance', offers: 'Current offers', buy: 'How to order', gift: 'Gifting ideas', discovery: 'Discovery Kit', ship: 'Delivery & returns', compare: 'Compare all four', explore: 'Explore the site', human: 'Talk to a person', menu: 'Main menu'};
  const productCardHtml = p => `<div class="vx-pcard" style="--scent:${p.color}"><img src="${plate(p)}" alt="" width="1122" height="1402"><div><small>${esc(p.family)}</small><strong>${esc(p.name)}</strong><em>${esc(p.line)}</em><div class="vx-pcard__actions"><button type="button" data-quicklook="${p.id}">Quick look</button><button type="button" data-vx-add="${p.id}">Add to bag</button><a href="/products/${p.id}/">View ${arrow}</a></div></div></div>`;
  const links = items => `<div class="vx-links">${items.map(([label, href]) => `<a href="${href}">${label} ${arrow}</a>`).join('')}</div>`;

  // Quiz: each answer weights the four fragrances; the highest total is recommended.
  const QUIZ = [
    {q: 'Lovely. When will you wear it most?', options: [
      ['Days & the office', {'silent-storm': 3, 'sweetest-stranger': 2}],
      ['Evenings out', {'rebel-in-velvet': 3, 'the-night-lingers': 2}],
      ['Celebrations & festivals', {'the-night-lingers': 3, 'rebel-in-velvet': 2}],
      ['Every day, close to skin', {'sweetest-stranger': 3, 'silent-storm': 1}]]},
    {q: 'And the feeling you want to leave behind?', options: [
      ['Fresh & composed', {'silent-storm': 4}],
      ['Soft & sweet', {'sweetest-stranger': 4}],
      ['Creamy & bold', {'rebel-in-velvet': 4}],
      ['Warm & smoky', {'the-night-lingers': 4}]]},
  ];
  let quiz = null;

  const FLOWS = {
    welcome: () => ({say: ['Namaste ✦ I’m the VASA Concierge.', 'I can help you find a fragrance that feels like you, walk you through ordering, or share this season’s offers. Where shall we begin?'], chips: ['find', 'offers', 'buy', 'gift', 'ship', 'explore']}),
    menu: () => ({say: ['Of course. What would you like to do next?'], chips: ['find', 'offers', 'buy', 'gift', 'compare', 'human']}),
    offers: () => ({say: ['Here’s what’s on right now:', `<ul class="vx-list"><li><b>Free delivery</b> on orders above ₹999</li><li><b>Complimentary tester</b> with every 50 ml bottle</li><li><b>The Diwali Edit</b>: four fragrances for every lamp lit after dusk</li></ul>`, links([['Shop the Diwali Edit', '/collection/'], ['Explore gifts & sets', '/gifting/']])], chips: ['find', 'buy', 'gift']}),
    buy: () => ({say: ['Ordering takes four small steps:', `<ol class="vx-steps"><li><b>Choose</b> a fragrance from the collection, or let me suggest one.</li><li><b>Add to bag</b> from the product card, quick look or product page.</li><li><b>Review</b> your bag (top-right icon) and adjust quantities.</li><li><b>Checkout</b>: confirm delivery details and you’re done.</li></ol>`, 'Prices are announced at launch; until then your bag is saved on this device and no payment is taken.', links([['View your bag', '/bag/'], ['Browse the collection', '/collection/']])], chips: ['find', 'ship', 'offers']}),
    ship: () => ({say: ['Delivery is free on orders above ₹999, and every 50 ml bottle comes with a complimentary tester.', 'For timelines, returns and exchanges, our policies have every detail:', links([['Shipping & delivery', '/legal/#shipping'], ['Returns & exchanges', '/legal/#returns']])], chips: ['buy', 'human', 'menu']}),
    gift: () => ({say: ['A fragrance is one of the most personal gifts there is. A few ways to choose:', `<ul class="vx-list"><li><b>For celebrations</b>: The Night Lingers, warm oud and rose</li><li><b>For someone close</b>: Sweetest Stranger, soft and familiar</li><li><b>For the undecided</b>: the Discovery Kit, all four to try</li></ul>`, links([['Explore gifts & sets', '/gifting/'], ['See Gift Sets', '/collection/#group-gift-sets']])], chips: ['discovery', 'find', 'offers']}),
    discovery: () => ({say: ['The Discovery Kit lets you live with all four VASA fragrances before choosing your signature: fresh, soft, creamy and smoky.', links([['See the Discovery Kit', '/collection/#group-discovery-kit']])], chips: ['compare', 'find', 'menu']}),
    compare: () => ({say: ['The four, at a glance:', `<ul class="vx-list vx-list--compare">${catalog.map(p => `<li style="--scent:${p.color}"><b>${esc(p.name)}</b><span>${esc(p.family)}</span></li>`).join('')}</ul>`, 'Tap any fragrance below for a quick look.'], chips: ['find', 'menu'], cards: catalog}),
    explore: () => ({say: ['Here’s where everything lives:', links([['The collection', '/collection/'], ['Gifts & sets', '/gifting/'], ['Our story', '/our-story/'], ['Feel your fragrance', '/feel-your-fragrance/'], ['Contact us', '/contact/']])], chips: ['find', 'offers', 'menu']}),
    human: () => ({say: ['We’d love to hear from you. Write to us through the contact page, or say hello on Instagram.', links([['Contact us', '/contact/'], ['Instagram', 'https://www.instagram.com/vasafragrances/']])], chips: ['menu']}),
    price: () => ({say: ['Prices are announced at launch. You can save your favourites to your bag now; it stays on this device, ready for when ordering opens.'], chips: ['offers', 'buy', 'find']}),
    longevity: () => ({say: ['Concentration details are published at launch. For the longest wear: spray onto moisturised pulse points (wrists, neck, behind the ears) and let it settle without rubbing.'], chips: ['find', 'compare', 'menu']}),
    story: () => ({say: ['Vāsa means dwelling, presence and fragrance. Our family’s roots in perfumery shape every composition: its concentration, its presence, the way it unfolds.', links([['Read our story', '/our-story/']])], chips: ['find', 'menu']}),
    find: () => { quiz = {step: 0, scores: {}}; return quizStep(); },
  };
  function quizStep() {
    const step = QUIZ[quiz.step];
    return {say: [step.q], options: step.options.map(([label], i) => ({label, value: i}))};
  }
  function answerQuiz(i) {
    const [label, weights] = QUIZ[quiz.step].options[i];
    Object.entries(weights).forEach(([id, w]) => { quiz.scores[id] = (quiz.scores[id] || 0) + w; });
    quiz.step += 1;
    userSay(label);
    if (quiz.step < QUIZ.length) return reply(quizStep());
    const best = byId(Object.entries(quiz.scores).sort((a, b) => b[1] - a[1])[0][0]);
    quiz = null;
    reply({say: ['I think you’ll feel at home in…'], cards: [best], after: [`${esc(best.description)}`], chips: ['find', 'compare', 'buy']});
  }

  const INTENTS = [
    [/\b(hi+|hello|hey|namaste|good (morning|evening|afternoon))\b/, 'welcome'],
    [/price|cost|how much|₹|rupee|\binr\b|expensive|cheap/, 'price'],
    [/offer|discount|sale|deal|coupon|promo|diwali|free/, 'offers'],
    [/ship|deliver|dispatch|track|return|exchange|refund/, 'ship'],
    [/discovery|sample|\bkit\b|try (them|all)|tester/, 'discovery'],
    [/gift|present|wedding|anniversary|birthday|for (him|her|my)/, 'gift'],
    [/buy|order|checkout|check out|cart|\bbag\b|pay|purchase/, 'buy'],
    [/compare|difference|all four|which one/, 'compare'],
    [/recommend|suggest|choose|help me|quiz|best|find/, 'find'],
    [/contact|human|person|call|email|whatsapp|support|talk/, 'human'],
    [/story|brand|about|who are|family/, 'story'],
    [/long|last|longevity|projection|concentration|\bedp\b|strength/, 'longevity'],
    [/navigate|menu|page|where|site|explore/, 'explore'],
  ];
  const MOODS = {fresh: 'silent-storm', citrus: 'silent-storm', woody: 'silent-storm', spicy: 'silent-storm', office: 'silent-storm', sweet: 'sweetest-stranger', fruity: 'sweetest-stranger', soft: 'sweetest-stranger', creamy: 'rebel-in-velvet', floral: 'rebel-in-velvet', bold: 'rebel-in-velvet', smoky: 'the-night-lingers', warm: 'the-night-lingers', night: 'the-night-lingers', festive: 'the-night-lingers'};
  function matchProducts(text) {
    const words = text.split(/[^a-z]+/).filter(w => w.length > 2);
    const hits = catalog.filter(p => text.includes(p.name.toLowerCase()) || words.some(w => [p.family, ...p.notes.map(n => n[1])].join(' ').toLowerCase().includes(w)));
    Object.entries(MOODS).forEach(([word, id]) => { if (words.includes(word) && !hits.includes(byId(id))) hits.push(byId(id)); });
    return hits.slice(0, 2);
  }
  function understand(raw) {
    const text = raw.toLowerCase();
    const intent = INTENTS.find(([re]) => re.test(text));
    if (intent && intent[1] !== 'find') return FLOWS[intent[1]]();
    const hits = matchProducts(text);
    if (hits.length) return {say: [hits.length > 1 ? 'These two carry what you’re looking for:' : 'You’ll love this one:'], cards: hits, chips: ['find', 'compare', 'buy']};
    if (intent) return FLOWS.find();
    return {say: ['I’m a guided concierge, so I’m best with fragrances, notes, offers, delivery and ordering. Try a note like “rose” or “cedar”, or pick a topic below.'], chips: ['find', 'offers', 'buy', 'human']};
  }

  function persist() { chatState.set({log: saved.log.slice(-40), nudged: saved.nudged}); }
  function append(who, html, {remember = true} = {}) {
    const row = document.createElement('div');
    row.className = `vx-msg vx-msg--${who}`;
    row.innerHTML = who === 'bot' ? `<span class="vx-msg__avatar" aria-hidden="true"><img src="/media/campaign/mark-gold.svg" alt=""></span><div class="vx-msg__bubble">${html}</div>` : `<div class="vx-msg__bubble">${html}</div>`;
    log.append(row);
    scrollToEnd(remember);
    if (remember) { saved.log.push({who, html}); persist(); }
  }
  const userSay = text => append('user', esc(text));
  // Reply options render inside the conversation as a stacked list, newest set only.
  function setChips(keys = [], options = null) {
    log.querySelector('.vx-options')?.remove();
    const items = options
      ? options.map(o => `<button type="button" class="vx-option" data-vx-answer="${o.value}"><span>${esc(o.label)}</span>${arrow}</button>`)
      : keys.map(k => `<button type="button" class="vx-option" data-vx-flow="${k}"><span>${LABELS[k]}</span>${arrow}</button>`);
    if (!items.length) return;
    log.insertAdjacentHTML('beforeend', `<div class="vx-options" role="group" aria-label="${options ? 'Choose an answer' : 'Suggested questions'}"><p class="vx-options__label">${options ? 'Choose one' : 'Or pick a topic'}</p>${items.join('')}</div>`);
    scrollToEnd();
  }
  function scrollToEnd(smooth = true) {
    requestAnimationFrame(() => log.scrollTo({top: log.scrollHeight, behavior: smooth && !reduced.matches ? 'smooth' : 'auto'}));
  }
  let replying = Promise.resolve();
  function reply(script) {
    setChips([]);
    const parts = [...script.say, ...(script.cards || []).map(productCardHtml), ...(script.after || [])];
    replying = replying.then(async () => {
      for (const html of parts) {
        const typing = document.createElement('div');
        typing.className = 'vx-msg vx-msg--bot vx-msg--typing';
        typing.innerHTML = '<span class="vx-msg__avatar" aria-hidden="true"><img src="/media/campaign/mark-gold.svg" alt=""></span><div class="vx-msg__bubble"><i></i><i></i><i></i></div>';
        log.append(typing);
        scrollToEnd();
        await new Promise(r => setTimeout(r, reduced.matches ? 60 : Math.min(950, 380 + html.replace(/<[^>]+>/g, '').length * 6)));
        typing.remove();
        append('bot', html);
      }
      setChips(script.chips || [], script.options || null);
    });
  }
  function openChat() {
    panel.hidden = false;
    chat.classList.add('is-open');
    launcher.setAttribute('aria-expanded', 'true');
    hideNudge(true);
    if (!log.childElementCount) reply(FLOWS.welcome());
    scrollToEnd(false);
    requestAnimationFrame(() => input.focus({preventScroll: true}));
  }
  function closeChat() {
    chat.classList.remove('is-open');
    launcher.setAttribute('aria-expanded', 'false');
    setTimeout(() => { if (!chat.classList.contains('is-open')) panel.hidden = true; }, reduced.matches ? 0 : 240);
    launcher.focus({preventScroll: true});
  }
  saved.log.forEach(m => append(m.who, m.html, {remember: false}));
  if (saved.log.length) setChips(['menu', 'find', 'offers']);

  launcher.addEventListener('click', () => (chatIsOpen() ? closeChat() : openChat()));
  panel.addEventListener('keydown', e => { if (e.key === 'Escape') closeChat(); });
  chat.querySelector('[data-vx-chat-close]').addEventListener('click', closeChat);
  chat.querySelector('[data-vx-restart]').addEventListener('click', () => { quiz = null; saved.log = []; persist(); log.innerHTML = ''; reply(FLOWS.welcome()); });
  chat.querySelector('.vx-chat__form').addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    input.value = '';
    userSay(text);
    quiz = null;
    reply(understand(text));
  });
  log.addEventListener('click', e => {
    const flow = e.target.closest('[data-vx-flow]');
    const answer = e.target.closest('[data-vx-answer]');
    if (flow) { userSay(LABELS[flow.dataset.vxFlow].replace('✦ ', '')); reply(FLOWS[flow.dataset.vxFlow]()); }
    else if (answer && quiz) answerQuiz(Number(answer.dataset.vxAnswer));
  });

  // Rotating offer line inside the chat header.
  let tick = 0;
  const rotateTicker = () => { ticker.classList.remove('is-in'); setTimeout(() => { ticker.textContent = OFFERS[tick++ % OFFERS.length]; ticker.classList.add('is-in'); }, 200); };
  rotateTicker();
  setInterval(() => { if (chatIsOpen() && !document.hidden) rotateTicker(); }, 4200);

  // A small nudge beside the launcher surfaces offers and the quiz a few times per session.
  let nudgeTimer, nudgeCount = 0;
  function hideNudge(forever = false) {
    nudge.classList.remove('is-in');
    setTimeout(() => { nudge.hidden = true; }, 250);
    if (forever) { saved.nudged = true; persist(); clearTimeout(nudgeTimer); }
  }
  function showNudge() {
    if (saved.nudged || chatIsOpen()) return;
    if (anyModalOpen()) { scheduleNudge(3000); return; }
    const text = OFFERS[nudgeCount % OFFERS.length];
    nudge.querySelector('.vx-nudge__text').textContent = text;
    nudge.dataset.flow = nudgeCount % OFFERS.length === 2 ? 'find' : 'offers';
    nudge.hidden = false;
    requestAnimationFrame(() => nudge.classList.add('is-in'));
    nudgeCount += 1;
    setTimeout(() => { if (!saved.nudged) hideNudge(); }, 7000);
    if (nudgeCount < 3) scheduleNudge(16000);
  }
  function scheduleNudge(ms) { clearTimeout(nudgeTimer); nudgeTimer = setTimeout(showNudge, ms); }
  nudge.querySelector('.vx-nudge__x').addEventListener('click', () => hideNudge(true));
  nudge.querySelector('.vx-nudge__text').addEventListener('click', () => {
    const flow = nudge.dataset.flow;
    openChat();
    userSay(LABELS[flow].replace('✦ ', ''));
    reply(FLOWS[flow]());
  });
  if (!saved.nudged) scheduleNudge(offerSeen.get() ? 9000 : 12000);

  /* ---------- Shared delegation ---------- */
  document.addEventListener('click', e => {
    const quick = e.target.closest('[data-quicklook]');
    const addBtn = e.target.closest('[data-vx-add]');
    const buyBtn = e.target.closest('[data-vx-buy]');
    const step = e.target.closest('[data-vx-ql-step]');
    if (quick) { e.preventDefault(); openQuickLook(quick.dataset.quicklook); }
    else if (step) renderQuickLook(catalog[(qlIndex + Number(step.dataset.vxQlStep) + catalog.length) % catalog.length]);
    else if (buyBtn) add(buyBtn.dataset.vxBuy, {buy: true});
    else if (addBtn) {
      if (ql.contains(addBtn)) closeModal(ql);
      add(addBtn.dataset.vxAdd);
      const label = addBtn.innerHTML;
      addBtn.classList.add('is-added');
      addBtn.textContent = 'ADDED ✓';
      setTimeout(() => { addBtn.classList.remove('is-added'); addBtn.innerHTML = label; }, 1600);
    }
  });
}
