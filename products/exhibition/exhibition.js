// THE EXHIBITION · a fragrance presented as a museum masterpiece.
// Shared by all four product pages; each page's markup and palette come from
// scripts/build-exhibition.mjs. Smooth scrolling (Lenis), the bag and the toast
// belong to the site shell (/05-campaign/main.js); this file only drives the story.
import { gsap, ScrollTrigger, SplitText, reduced as reducedQuery } from '/05-campaign/motion.js';

const reduced = reducedQuery.matches;
const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
const isMobile = () => matchMedia('(max-width: 760px)').matches;
const root = document.documentElement;
const $ = (s, c = document) => c.querySelector(s);
const $$ = (s, c = document) => [...c.querySelectorAll(s)];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const decoded = (images) => Promise.all(images.map((img) => (img.decode ? img.decode().catch(() => {}) : null)));

const data = JSON.parse($('#exh-data')?.textContent || '{}');
// Bottle cut-out geometry: foot row and top row as fractions of the image height.
const BOTTLE = { foot: data.bottle?.foot ?? 0.9667, top: data.bottle?.top ?? 0.0333 };

// Frame rasters (rendered carved gilt frame): natural size, sight opening, visible bbox.
const FR = {
  salon: { w: 2130, h: 1948, open: [370, 440, 1360, 1088], bbox: [67, 32, 1966, 1799] },
  portrait: { w: 1155, h: 1342, open: [240, 248, 660, 825], bbox: [49, 57, 1042, 1207] },
};
const portraitMQ = matchMedia('(max-width: 760px), (max-aspect-ratio: 1/1)');

const el = {
  root: $('.exh-root'),
  stage: $('[data-stage]'),
  salon: $('#salon'),
  wall: $('[data-wall]'),
  hang: $('[data-hang]'),
  painting: $('[data-painting]'),
  inner: $('[data-inner]'),
  world: $('[data-world]'),
  bottle: $('[data-bottle]'),
  bottleImg: $('[data-bottle-img]'),
  frame: $('[data-frame]'),
  caption: $('[data-caption]'),
  lines: $$('.caption__l'),
  ui: $('[data-ui]'),
  flare: $('[data-flare]'),
  plaque: $('[data-plaque]'),
  cue: $('[data-cue]'),
  pool: $('[data-pool]'),
  lights: $('[data-lights]'),
  spot: $('[data-spot]'),
  veil: $('[data-veil]'),
  tints: $$('[data-tint]'),
  scents: $$('[data-scent]'),
  inside: $('[data-inside]'),
  notes: $$('[data-note]'),
  rooms: $('[data-rooms]'),
  chip: $('[data-room-chip]'),
  roomNum: $('[data-room-num]'),
  roomName: $('[data-room-name]'),
};

/* ------------------------------------------------------------ small things */
function barcode(node) {
  let x = (+node.dataset.barcode || 7) * 7919 + 104729;
  const rnd = () => ((x = (x * 9301 + 49297) % 233280) / 233280);
  let pos = 0;
  const bars = [];
  const push = (w, g) => { bars.push([pos, w]); pos += w + g; };
  push(1, 1); push(1, 2);
  const len = node.hasAttribute('data-long') ? 170 : 94;
  while (pos < len) push([1, 1, 1, 2, 2, 3, 4][Math.floor(rnd() * 7)], [1, 1, 2, 2, 3][Math.floor(rnd() * 5)]);
  push(1, 1); push(1, 0);
  const svg = (vertical, cls = '') => `<svg class="${cls}" viewBox="${vertical ? `0 0 40 ${pos}` : `0 0 ${pos} 40`}" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">${bars.map(([p, w]) => (vertical ? `<rect x="0" y="${p}" width="40" height="${w}"/>` : `<rect x="${p}" y="0" width="${w}" height="40"/>`)).join('')}</svg>`;
  node.innerHTML = node.hasAttribute('data-vertical') ? svg(true, 'bar-v') + svg(false, 'bar-h') : svg(false);
}
$$('[data-barcode]').forEach(barcode);

// The site header's height drives the salon layout and the room chip position.
function measureHeader() {
  const hdr = document.querySelector('.site-header');
  const bottom = hdr ? Math.max(0, hdr.getBoundingClientRect().bottom) : 76;
  el.root.style.setProperty('--hdr', `${Math.round(bottom)}px`);
  return bottom;
}

// wayfinding: the room we are standing in
let roomKey = '';
function setRoom(num, name) {
  const key = num + name;
  if (key === roomKey || !el.roomNum) return;
  roomKey = key;
  const targets = [el.roomNum, el.roomName];
  if (reduced) { el.roomNum.textContent = num; el.roomName.textContent = name; return; }
  gsap.to(targets, {
    yPercent: -110, opacity: 0, duration: 0.22, ease: 'power2.in', overwrite: true,
    onComplete: () => {
      el.roomNum.textContent = num; el.roomName.textContent = name;
      gsap.fromTo(targets, { yPercent: 110, opacity: 0 }, { yPercent: 0, opacity: 1, duration: 0.5, ease: 'expo.out', overwrite: true });
    },
  });
}

/* ------------------------------------------------------------ salon layout */
const G = { vw: innerWidth, vh: innerHeight };
function layoutSalon() {
  const vw = el.stage.clientWidth;
  const vh = el.stage.clientHeight;
  const portrait = portraitMQ.matches;
  const F = portrait ? FR.portrait : FR.salon;
  const hdr = measureHeader();
  const top = hdr + (portrait ? 14 : 18);
  const bottom = portrait ? Math.max(176, vh * 0.25) : Math.max(54, vh * 0.06);
  const availH = vh - top - bottom;
  const availW = portrait ? vw * 0.99 : Math.min(vw * 0.62, 1180);
  const s = Math.min(availW / F.bbox[2], availH / F.bbox[3]);
  const bw = F.bbox[2] * s;
  const bh = F.bbox[3] * s;
  const bx = (vw - bw) / 2;
  const by = top + (availH - bh) / 2;
  const fx = bx - F.bbox[0] * s;
  const fy = by - F.bbox[1] * s;
  const ow0 = F.open[2] * s;
  const oh0 = F.open[3] * s;
  const e = ow0 * 0.014; // the canvas runs under the rabbet
  const ow = ow0 + e * 2;
  const oh = oh0 + e * 2;
  const ox = fx + (F.open[0] + F.open[2] / 2) * s;
  const oy = fy + (F.open[1] + F.open[3] / 2) * s;
  const iw = Math.max(vw, vh * 1.2487);
  const ih = Math.max(vw / 1.2487, vh);
  const k0 = Math.max(ow / iw, oh / ih);
  const fEnd = Math.max(vw / ow, vh / oh) * 1.025;
  Object.assign(G, { vw, vh, portrait, s, ox, oy, ow, oh, ow0, oh0, fx, fy, k0, fEnd });

  const st = el.stage.style;
  const px = (v) => `${v.toFixed(2)}px`;
  st.setProperty('--ox', px(ox));
  st.setProperty('--oy', px(oy));
  st.setProperty('--ow', px(ow0));
  st.setProperty('--oh', px(oh0));
  st.setProperty('--fx', px(fx));
  st.setProperty('--fy', px(fy));
  st.setProperty('--fw', px(F.w * s));
  st.setProperty('--fox', px(ox - fx));
  st.setProperty('--foy', px(oy - fy));
  st.setProperty('--fbr', px(bx + bw));
  st.setProperty('--fbb', px(by + bh));
  st.setProperty('--fy-top', px(by));
  st.setProperty('--cl', px(ox - ow0 / 2));
  st.setProperty('--ct', px(oy - oh0 / 2));
  st.setProperty('--cw', px(ow0));
  st.setProperty('--ch', px(oh0));

  // bottle: laid out for the full-screen scene; derive where it stands inside the framed painting
  const b = el.bottle;
  const bL = b.offsetLeft, bT = b.offsetTop, bW = b.offsetWidth, bH = b.offsetHeight;
  const baseX = bL + bW / 2;
  const baseY = bT + bH * BOTTLE.foot;
  const heroX = ox - ow0 / 2 + ow0 * (portrait ? 0.5 : 0.675);
  const heroY = oy - oh0 / 2 + oh0 * (portrait ? 0.95 : 0.93);
  G.bdx = vw / 2 + (heroX - ox) / k0 - baseX;
  G.bdy = vh / 2 + (heroY - oy) / k0 - baseY;
  const heroH = oh0 * (portrait ? 0.5 : 0.62);
  G.b0 = heroH / (bH * (BOTTLE.foot - BOTTLE.top) * k0);
  fitCaption();
}

// Caption words are sized from the frame width; a longer word ("stayed", "has a bold")
// would run past the painting's edge, so each line shrinks until it fits inside.
function fitCaption() {
  const box = el.caption;
  if (!box) return;
  const inner = box.offsetWidth * 0.96;
  el.lines.forEach((line) => {
    line.style.fontSize = '';
    const room = inner - line.offsetLeft;
    const w = line.offsetWidth;
    if (w > room && w > 0) {
      const em = parseFloat(getComputedStyle(line).fontSize) / parseFloat(getComputedStyle(box).fontSize);
      line.style.fontSize = `${(em * room / w).toFixed(3)}em`;
    }
  });
}

/* ------------------------------------------------------------ the camera */
const cam = { p: 0, b: 0 };
const ePush = gsap.parseEase('power2.inOut');
const eBottle = gsap.parseEase('power3.inOut');
let camHidden = false;
function renderCam() {
  const e = ePush(cam.p);
  const f = Math.pow(G.fEnd, e);
  const cx = G.ox + (G.vw / 2 - G.ox) * e;
  const cy = G.oy + (G.vh / 2 - G.oy) * e;
  const t = `translate3d(${(cx - G.ox).toFixed(2)}px,${(cy - G.oy).toFixed(2)}px,0) scale(${f.toFixed(5)})`;
  el.wall.style.transform = t;
  el.frame.style.transform = t;
  el.caption.style.transform = t;
  const sx = (G.ow * f) / G.vw;
  const sy = (G.oh * f) / G.vh;
  el.painting.style.transform = `translate3d(${(cx - G.vw / 2).toFixed(2)}px,${(cy - G.vh / 2).toFixed(2)}px,0) scale(${sx.toFixed(5)},${sy.toFixed(5)})`;
  const k = G.k0 * f;
  el.inner.style.transform = `scale(${(k / sx).toFixed(5)},${(k / sy).toFixed(5)})`;
  const eb = eBottle(cam.b);
  const bs = G.b0 + (1 - G.b0) * eb;
  el.bottle.style.transform = `translate3d(${(G.bdx * (1 - eb)).toFixed(2)}px,${(G.bdy * (1 - eb)).toFixed(2)}px,0) scale(${bs.toFixed(5)})`;
  const hide = e > 0.992;
  if (hide !== camHidden) {
    camHidden = hide;
    el.wall.style.visibility = el.frame.style.visibility = hide ? 'hidden' : '';
  }
}

/* ------------------------------------------------------------ pinned story */
const ROOM_T = { inside: 2.3, notes: [4.0, 6.0, 8.0] };
function buildSalon() {
  const tl = gsap.timeline({ defaults: { ease: 'none' }, onUpdate: () => { renderCam(); roomsFromTime(tl.time()); } });
  tl.to(cam, { p: 1, duration: 2.4 }, 0)
    .to(cam, { b: 1, duration: 2.1 }, 0.4)
    .to(el.caption, { opacity: 0, duration: 0.42, ease: 'power1.in' }, 0)
    .to(el.ui, { opacity: 0, duration: 0.4, ease: 'power1.in' }, 0)
    .to(el.veil, { opacity: 1, duration: 0.6 }, 1.95);

  const lede = $('.inside__lede', el.inside);
  const label = $('.label', el.inside);
  tl.fromTo(lede, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 2.3)
    .fromTo(label, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.5, ease: 'power2.out' }, 2.42)
    .to([lede, label], { opacity: 0, y: -26, duration: 0.38, ease: 'power1.in', stagger: 0.05 }, 3.5)
    .to(el.rooms, { opacity: 1, duration: 0.4 }, 3.8);

  const mob = G.portrait;
  const scentFrom = [
    { opacity: 0, x: mob ? 50 : -70, y: -90, rotation: -22, scale: 0.9 },
    { opacity: 0, x: 90, y: 70, rotation: 24, scale: 0.84 },
    { opacity: 0, x: mob ? -40 : -30, y: 110, rotation: -8, scale: 0.9 },
  ];
  const scentTo = [
    { opacity: 1, x: 0, y: 0, rotation: mob ? 8 : -8, scale: 1 },
    { opacity: 1, x: 0, y: 0, rotation: 6, scale: 1 },
    { opacity: 1, x: 0, y: 0, rotation: 0, scale: 1 },
  ];
  const scentOut = [
    { opacity: 0, x: mob ? 40 : -50, y: -110, rotation: -14 },
    { opacity: 0, x: 70, y: 60, rotation: 16 },
  ];
  el.notes.forEach((note, i) => {
    const t0 = ROOM_T.notes[i];
    const kids = [...note.children];
    tl.fromTo(kids, { opacity: 0, y: 34 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.08, ease: 'power2.out' }, t0)
      .fromTo(el.scents[i], scentFrom[i], { ...scentTo[i], duration: 0.95, ease: 'power2.out' }, t0 - 0.25)
      .to(el.tints[i], { opacity: 1, duration: 0.8 }, t0 - 0.3);
    if (i < 2) {
      tl.to(kids, { opacity: 0, y: -26, duration: 0.38, stagger: 0.04, ease: 'power1.in' }, t0 + 1.5)
        .to(el.scents[i], { ...scentOut[i], duration: 0.7, ease: 'power1.in' }, t0 + 1.45)
        .to(el.tints[i], { opacity: 0, duration: 0.8 }, t0 + 1.55);
    }
  });
  tl.to({}, { duration: 1.1 }, 8.6);

  ScrollTrigger.create({
    trigger: el.salon,
    start: 'top top',
    end: () => `+=${Math.round(tl.duration() * G.vh * 0.4)}`,
    pin: true,
    scrub: true,
    animation: tl,
    invalidateOnRefresh: true,
    refreshPriority: 2,
    id: 'exh-salon',
  });
}

const roomItems = $$('li', el.rooms);
let activeNote = -2;
function roomsFromTime(t) {
  let n = -1;
  ROOM_T.notes.forEach((v, i) => { if (t >= v - 0.1) n = i; });
  if (n !== activeNote) {
    activeNote = n;
    roomItems.forEach((li, i) => li.classList.toggle('is-on', i === n));
  }
  if (t < ROOM_T.inside) setRoom('01', 'The Salon');
  else if (n < 0) setRoom('02', 'Inside the painting');
  else setRoom('02', ['The Opening', 'The Heart', 'The Base'][n]);
}

/* ------------------------------------------------------------ intro */
function writeIn() {
  const tl = gsap.timeline();
  el.lines.forEach((line, i) => {
    const split = new SplitText(line, { type: 'chars', charsClass: 'ch', aria: 'none' });
    tl.set(line, { opacity: 1, '--wipe': 0 }, 0)
      .fromTo(line, { '--wipe': 0 }, { '--wipe': 1, duration: 1.25, ease: 'power2.out' }, i * 0.26)
      .from(split.chars, { opacity: 0, yPercent: 14, rotation: 5, duration: 1.2, ease: 'expo.out', stagger: 0.045 }, i * 0.26);
  });
  tl.add(() => el.lines.forEach((l) => l.classList.add('is-done')));
  return tl;
}

function intro() {
  window.__exReady = true;
  if (reduced || location.hash || scrollY > 40) {
    root.classList.remove('js-intro');
    return;
  }
  const tl = gsap.timeline({ delay: 0.1, onComplete: () => { root.classList.remove('js-intro'); gsap.set(el.lights, { clearProps: 'all' }); } });
  gsap.set(el.spot, { scale: 0.16 });
  tl.to(el.spot, { scale: 0.46, duration: 0.22, ease: 'power2.out' }, 0.12)
    .to(el.spot, { scale: 0.24, duration: 0.05, ease: 'none' }, 0.36)
    .to(el.spot, { scale: 0.5, duration: 0.08, ease: 'power1.out' }, 0.41)
    .to(el.spot, { scale: 0.95, duration: 1.3, ease: 'expo.out' }, 0.52)
    .fromTo(el.hang, { y: -22, rotation: 0.9 }, { y: 0, duration: 1.7, ease: 'power3.out' }, 0)
    .to(el.hang, { keyframes: [{ rotation: -0.5, duration: 0.6 }, { rotation: 0.22, duration: 0.55 }, { rotation: -0.08, duration: 0.5 }, { rotation: 0, duration: 0.5 }], ease: 'sine.inOut' }, 0)
    .fromTo(el.pool, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' }, 0.2)
    .to(el.lights, { opacity: 0, duration: 1.2, ease: 'power2.inOut' }, 1.15)
    .fromTo(el.flare, { opacity: 0, scale: 0.85 }, { opacity: 1, scale: 1, duration: 1.8, ease: 'power2.out' }, 1.0)
    .add(writeIn(), 0.95)
    .fromTo(el.plaque, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out' }, 1.75)
    .fromTo(el.chip, { opacity: 0 }, { opacity: 1, duration: 0.8, clearProps: 'opacity' }, 1.9)
    .fromTo(el.cue, { opacity: 0 }, { opacity: 1, duration: 0.8 }, 2.2);
}

/* ------------------------------------------------------------ admission tickets */
function buildTickets() {
  const tickets = $$('[data-ticket]');
  const section = $('#admission');
  if (reduced) return;

  if (finePointer) {
    tickets.forEach((t) => {
      const tilt = $('[data-tilt]', t);
      const sheen = $('[data-sheen]', t);
      const rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.6, ease: 'power3.out' });
      const ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.6, ease: 'power3.out' });
      const tz = gsap.quickTo(tilt, 'z', { duration: 0.6, ease: 'power3.out' });
      const shx = gsap.quickTo(sheen, 'xPercent', { duration: 0.7, ease: 'power3.out' });
      const shy = gsap.quickTo(sheen, 'yPercent', { duration: 0.7, ease: 'power3.out' });
      t.addEventListener('pointermove', (e) => {
        const r = t.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        ry(px * 18); rx(-py * 12); tz(36); shx(px * 40); shy(py * 22);
      });
      t.addEventListener('pointerenter', () => t.classList.add('is-hover'));
      t.addEventListener('pointerleave', () => { rx(0); ry(0); tz(0); t.classList.remove('is-hover'); });
    });
  }

  const mm = gsap.matchMedia();
  mm.add('(min-width: 761px)', () => {
    const tw = () => tickets[0].offsetWidth;
    const slots = [
      { x: () => -tw() * 1.2, y: 12, rz: -3.2 },
      { x: () => 0, y: -10, rz: 0.9 },
      { x: () => tw() * 1.2, y: 14, rz: 3.4 },
    ];
    const pile = [{ x: -5, y: 8, rz: -7 }, { x: 7, y: -2, rz: 5.5 }, { x: -2, y: 2, rz: -1.5 }];
    tickets.forEach((t, i) => gsap.set(t, { x: pile[i].x, y: pile[i].y, rotationZ: pile[i].rz, rotationY: 180, transformPerspective: 1700, zIndex: 3 - i }));
    const tl = gsap.timeline({ defaults: { ease: 'none' } });
    tickets.forEach((t, i) => {
      const t0 = 0.15 + i * 0.52;
      tl.to(t, { x: slots[i].x, duration: 1, ease: 'power2.inOut' }, t0)
        .to(t, { rotationY: 0, duration: 0.95, ease: 'power2.inOut' }, t0 + 0.02)
        .to(t, { rotationZ: slots[i].rz, duration: 1, ease: 'power2.inOut' }, t0)
        .to(t, { keyframes: [{ y: -26, z: 120, duration: 0.5, ease: 'power2.out' }, { y: slots[i].y, z: 0, duration: 0.5, ease: 'power2.in' }] }, t0);
    });
    tl.to({}, { duration: 0.35 });
    const st = ScrollTrigger.create({ trigger: section, start: 'top top', end: () => `+=${Math.round(innerHeight * 1.25)}`, pin: true, scrub: true, animation: tl, invalidateOnRefresh: true, refreshPriority: 1 });
    return () => { st.kill(); tl.kill(); gsap.set(tickets, { clearProps: 'all' }); };
  });
  mm.add('(max-width: 760px)', () => {
    gsap.set(tickets, { rotationY: 180, transformPerspective: 1200 });
    const tl = gsap.timeline({ paused: true }).to(tickets, { rotationY: 0, duration: 1.1, ease: 'power3.inOut', stagger: 0.16 });
    const st = ScrollTrigger.create({ trigger: $('[data-deck]'), start: 'top 72%', once: true, onEnter: () => tl.play() });
    return () => { st.kill(); tl.kill(); gsap.set(tickets, { clearProps: 'all' }); };
  });
}

/* ------------------------------------------------------------ excursion: tear the stub */
function buildExcursion() {
  // The site shell's click handler adds to the bag and shows the toast for [data-add];
  // here the ticket stub tears off and settles back.
  const btn = $('.xt__add');
  const stub = $('[data-stub]');
  const main = $('.xt__main');
  let busy = false;
  btn?.addEventListener('click', () => {
    if (reduced || busy) return;
    busy = true;
    const mob = isMobile();
    gsap.timeline({ onComplete: () => { busy = false; } })
      .to(main, { x: mob ? 0 : -3, y: mob ? -2 : 0, duration: 0.12, ease: 'power2.out' }, 0)
      .to(main, { x: 0, y: 0, duration: 0.5, ease: 'expo.out' }, 0.12)
      .to(stub, { rotation: mob ? 3 : 6, x: mob ? 4 : 8, y: mob ? 8 : 3, duration: 0.26, ease: 'power2.out' }, 0)
      .to(stub, { rotation: mob ? 6 : 12, x: mob ? 10 : 22, y: mob ? 40 : 52, duration: 0.55, ease: 'power3.in' }, 0.24)
      .to(stub, { rotation: 0, x: 0, y: 0, duration: 1.1, ease: 'expo.out' }, 2.0);
  });
  if (finePointer && !reduced && btn) {
    const x = gsap.quickTo(btn, 'x', { duration: 0.5, ease: 'power3.out' });
    const y = gsap.quickTo(btn, 'y', { duration: 0.5, ease: 'power3.out' });
    btn.addEventListener('pointermove', (e) => { const r = btn.getBoundingClientRect(); x((e.clientX - r.left - r.width / 2) * 0.12); y((e.clientY - r.top - r.height / 2) * 0.12); });
    btn.addEventListener('pointerleave', () => { x(0); y(0); });
  }

  if (reduced) return;
  const xt = $('.xt');
  const bottle = $('.xt-bottle');
  gsap.from(xt, { x: isMobile() ? 0 : 80, y: isMobile() ? 50 : 20, rotation: isMobile() ? 0 : 2.5, opacity: 0, duration: 1.4, ease: 'expo.out', scrollTrigger: { trigger: xt, start: 'top 82%', once: true } });
  gsap.from(bottle, { y: 60, opacity: 0, duration: 1.4, ease: 'expo.out', delay: 0.15, scrollTrigger: { trigger: xt, start: 'top 82%', once: true } });
  gsap.from('.excursion__head > *', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.excursion__head', start: 'top 85%', once: true } });
}

/* ------------------------------------------------------------ other exhibitions */
function buildExhibitions() {
  if (reduced) return;
  $$('.exh-others .ex').forEach((c, i) => {
    const hang = $('.ex__hang', c);
    const label = $('.ex__label', c);
    const tl = gsap.timeline({ scrollTrigger: { trigger: c, start: 'top 86%', once: true } });
    tl.fromTo(hang, { y: -40, rotation: i % 2 ? -2.2 : 2.2, opacity: 0, transformOrigin: '50% -10%' }, { y: 0, opacity: 1, duration: 1.1, ease: 'power3.out', delay: i * 0.08 })
      .to(hang, { keyframes: [{ rotation: i % 2 ? 1 : -1, duration: 0.5 }, { rotation: i % 2 ? -0.35 : 0.35, duration: 0.45 }, { rotation: 0, duration: 0.45 }], ease: 'sine.inOut' }, '<0.35')
      .fromTo(label, { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: 1, ease: 'expo.out' }, '<0.2');
  });
  gsap.from('.exh-others .exhibitions__head > *', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '.exh-others .exhibitions__head', start: 'top 85%', once: true } });
  gsap.from('.admission__head > *', { y: 30, opacity: 0, duration: 1.1, ease: 'expo.out', stagger: 0.08, scrollTrigger: { trigger: '#admission', start: 'top 70%', once: true } });
}

/* ------------------------------------------------------------ rooms in the chip */
function buildWayfinding() {
  const rooms = [
    ['#admission', '03', 'Admission'],
    ['#purchase', '04', 'The Excursion'],
  ];
  rooms.forEach(([sel, num, name], i) => {
    ScrollTrigger.create({
      trigger: sel, start: 'top 55%', end: 'bottom 55%',
      onEnter: () => setRoom(num, name),
      onEnterBack: () => setRoom(num, name),
      onLeaveBack: () => { if (i === 0) setRoom('02', 'The Base'); else setRoom(rooms[i - 1][1], rooms[i - 1][2]); },
    });
  });
  // On phones the chip only guides the salon; past it, it would sit on section titles.
  ScrollTrigger.create({
    trigger: '#admission', start: 'top 80%',
    onEnter: () => { if (isMobile()) el.chip?.classList.add('is-off'); },
    onLeaveBack: () => el.chip?.classList.remove('is-off'),
  });
  // The chip belongs to the exhibition; it leaves once the visitor reaches the shop details.
  ScrollTrigger.create({
    trigger: '#purchase', start: 'bottom 40%',
    onEnter: () => el.chip?.classList.add('is-off'),
    onLeaveBack: () => el.chip?.classList.remove('is-off'),
  });
}

/* ------------------------------------------------------------ pointer parallax on the salon wall */
function buildParallax() {
  if (!finePointer || reduced) return;
  const frames = $$('.sframe');
  const qs = frames.map((f, i) => ({ x: gsap.quickTo(f, 'x', { duration: 1.2, ease: 'power3.out' }), y: gsap.quickTo(f, 'y', { duration: 1.2, ease: 'power3.out' }), d: i ? -1 : 1 }));
  const fx = gsap.quickTo(el.flare, 'x', { duration: 1.6, ease: 'power3.out' });
  const fy = gsap.quickTo(el.flare, 'y', { duration: 1.6, ease: 'power3.out' });
  el.stage.addEventListener('pointermove', (e) => {
    if (cam.p > 0.2) return;
    const nx = e.clientX / innerWidth - 0.5;
    const ny = e.clientY / innerHeight - 0.5;
    qs.forEach((q) => { q.x(nx * -18); q.y(ny * -12); });
    fx(nx * 60); fy(ny * 40);
  });
}

/* ------------------------------------------------------------ boot */
async function boot() {
  if (!el.stage) return;
  if (!location.hash && 'scrollRestoration' in history) {
    history.scrollRestoration = 'manual';
    scrollTo(0, 0);
  }
  if (!reduced) root.classList.add('is-motion');
  layoutSalon();
  renderCam();

  const imgs = [el.bottleImg, el.world, el.frame].filter(Boolean);
  await Promise.race([decoded(imgs), wait(3000)]);
  await Promise.race([document.fonts.ready, wait(1500)]);
  layoutSalon();
  renderCam();

  intro();
  if (!reduced) buildSalon();
  buildTickets();
  buildExcursion();
  buildExhibitions();
  buildWayfinding();
  buildParallax();

  ScrollTrigger.addEventListener('refreshInit', () => { layoutSalon(); });
  ScrollTrigger.addEventListener('refresh', () => renderCam());
  // Our pins are created after the page's other scroll effects (reviews etc.), so put
  // every trigger back in page order before measuring; otherwise later sections are
  // measured without the salon's pin spacer and overlap it.
  ScrollTrigger.sort();
  ScrollTrigger.refresh();
  portraitMQ.addEventListener('change', () => ScrollTrigger.refresh());
}
boot();
