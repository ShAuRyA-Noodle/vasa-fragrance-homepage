// VASA — Find Your Stranger. All copy + composition VASA-original.
// Product data mirrors 05-campaign/catalog.js (kept local + static so this
// module has zero build-time coupling to other variation folders).

export const PRODUCTS = [
  {
    id: 'silent-storm',
    name: 'Silent Storm',
    family: 'Fresh · Spicy · Woody',
    line: 'A memory that stayed.',
    color: '#8faab5',
    notes: {
      opening: 'Bergamot, pepper',
      heart: 'Sichuan pepper, lavender, pink pepper, vetiver, patchouli, geranium, elemi',
      base: 'Cedar, labdanum',
    },
  },
  {
    id: 'sweetest-stranger',
    name: 'Sweetest Stranger',
    family: 'Fruity · Floral · Soft',
    line: 'Some encounters stay.',
    color: '#c99593',
    notes: {
      opening: 'Pear blossom, Italian mandarin, red berries',
      heart: 'White gardenia, jasmine, frangipani',
      base: 'Patchouli, brown sugar',
    },
  },
  {
    id: 'rebel-in-velvet',
    name: 'Rebel in Velvet',
    family: 'Amber · Floral · Creamy',
    line: 'Softness has a bold side.',
    color: '#77556e',
    notes: {
      opening: 'Almond',
      heart: 'Tuberose, jasmine sambac, Bulgarian rose',
      base: 'Tonka bean, cocoa',
    },
  },
  {
    id: 'the-night-lingers',
    name: 'The Night Lingers',
    family: 'Amber · Woody · Smoky',
    line: 'The warmth that stays.',
    color: '#9f7044',
    notes: {
      opening: 'Oud wood',
      heart: 'Benzoin, rose',
      base: 'Saffron, raspberry, incense',
    },
  },
];

export const productById = (id) => PRODUCTS.find((p) => p.id === id);

// image ids differ from page ids for one product (spec: file ids use
// "the-sweetest-stranger", the page/route id stays "sweetest-stranger").
const IMAGE_ID = {
  'silent-storm': 'silent-storm',
  'sweetest-stranger': 'the-sweetest-stranger',
  'rebel-in-velvet': 'rebel-in-velvet',
  'the-night-lingers': 'the-night-lingers',
};
export const productImage = (id, kind = 'detail') => `/media/${kind}-${IMAGE_ID[id]}.webp`;
export const productHref = (id) => `/products/${id}/`;

// ---------------------------------------------------------------------------
// Q1 — Temperament
export const Q1_STOPS = [
  { t: 0, label: 'HUSHED' },
  { t: 0.5, label: 'POISED' },
  { t: 1, label: 'UNTAMED' },
];
export const Q1_INFO = 'A quiet answer, or a loud one — there is no wrong stranger, only an honest one.';

// ---------------------------------------------------------------------------
// Q2 — Moment
export const MOMENTS = [
  { id: 'first-light', title: 'FIRST LIGHT', sub: 'The hour before the day has an opinion.' },
  { id: 'long-afternoon', title: 'THE LONG AFTERNOON', sub: 'Time loosens. Nothing is urgent.' },
  { id: 'golden-hour', title: 'GOLDEN HOUR', sub: 'Everything looks like it means something.' },
  { id: 'after-midnight', title: 'AFTER MIDNIGHT', sub: 'The room is smaller. The truth is louder.' },
];

export const MOMENT_SPRITES = {
  'first-light': ['bergamot-peel', 'vetiver-roots', 'lavender-sprigs'],
  'long-afternoon': ['pear-blossom-branch', 'gardenia-bloom', 'tuberose-flowers'],
  'golden-hour': ['almonds-open-shell', 'tonka-beans-split-pod', 'brown-sugar-crystals'],
  'after-midnight': ['oud-wood-chip', 'incense-resin-smoke', 'cedar-shavings-branch'],
};

// ---------------------------------------------------------------------------
// Q3 — Notes (12 cards). Each maps to a product per scoring table + a sprite.
export const NOTES = [
  { id: 'bergamot', label: 'Bergamot', sprite: 'bergamot-peel', product: 'silent-storm' },
  { id: 'lavender', label: 'Lavender', sprite: 'lavender-sprigs', product: 'silent-storm' },
  { id: 'cedar', label: 'Cedar', sprite: 'cedar-shavings-branch', product: 'silent-storm' },
  { id: 'vetiver', label: 'Vetiver', sprite: 'vetiver-roots', product: 'silent-storm' },
  { id: 'pear-blossom', label: 'Pear Blossom', sprite: 'pear-blossom-branch', product: 'sweetest-stranger' },
  { id: 'gardenia', label: 'Gardenia', sprite: 'gardenia-bloom', product: 'sweetest-stranger' },
  { id: 'brown-sugar', label: 'Brown Sugar', sprite: 'brown-sugar-crystals', product: 'sweetest-stranger' },
  { id: 'almond', label: 'Almond', sprite: 'almonds-open-shell', product: 'rebel-in-velvet' },
  { id: 'tuberose', label: 'Tuberose', sprite: 'tuberose-flowers', product: 'rebel-in-velvet' },
  { id: 'tonka', label: 'Tonka Bean', sprite: 'tonka-beans-split-pod', product: 'rebel-in-velvet' },
  { id: 'oud', label: 'Oud', sprite: 'oud-wood-chip', product: 'the-night-lingers' },
  { id: 'incense', label: 'Incense', sprite: 'incense-resin-smoke', product: 'the-night-lingers' },
];
export const MAX_NOTE_SELECTION = 3;

// ---------------------------------------------------------------------------
// Scoring (spec §Scoring)
const Q1_WEIGHTS = {
  0: { 'silent-storm': 3, 'sweetest-stranger': 2 },
  0.5: { 'sweetest-stranger': 2, 'silent-storm': 1, 'rebel-in-velvet': 2 },
  1: { 'the-night-lingers': 3, 'rebel-in-velvet': 2 },
};

const Q2_WEIGHTS = {
  'first-light': { 'silent-storm': 3, 'sweetest-stranger': 1 },
  'long-afternoon': { 'sweetest-stranger': 3, 'rebel-in-velvet': 1 },
  'golden-hour': { 'rebel-in-velvet': 3, 'the-night-lingers': 1 },
  'after-midnight': { 'the-night-lingers': 3, 'rebel-in-velvet': 1 },
};

const NOTE_WEIGHTS = {
  bergamot: { 'silent-storm': 2 },
  lavender: { 'silent-storm': 2 },
  cedar: { 'silent-storm': 2, 'the-night-lingers': 1 },
  vetiver: { 'silent-storm': 2 },
  'pear-blossom': { 'sweetest-stranger': 2 },
  gardenia: { 'sweetest-stranger': 2 },
  'brown-sugar': { 'sweetest-stranger': 2, 'rebel-in-velvet': 1 },
  almond: { 'rebel-in-velvet': 2 },
  tuberose: { 'rebel-in-velvet': 2, 'sweetest-stranger': 1 },
  tonka: { 'rebel-in-velvet': 2 },
  oud: { 'the-night-lingers': 2 },
  incense: { 'the-night-lingers': 2, 'silent-storm': 1 },
};

const TIE_ORDER = ['the-night-lingers', 'rebel-in-velvet', 'silent-storm', 'sweetest-stranger'];

function nearestQ1Stop(t) {
  return Q1_STOPS.reduce((best, s) => (Math.abs(s.t - t) < Math.abs(best - t) ? s.t : best), 0);
}

export function scoreQuiz({ q1, q2, notes }) {
  const totals = Object.fromEntries(PRODUCTS.map((p) => [p.id, 0]));
  const stop = nearestQ1Stop(q1 ?? 0.5);
  const q1w = Q1_WEIGHTS[stop] || {};
  Object.entries(q1w).forEach(([id, v]) => (totals[id] += v));

  const q2w = Q2_WEIGHTS[q2] || {};
  Object.entries(q2w).forEach(([id, v]) => (totals[id] += v));

  (notes || []).forEach((noteId) => {
    const w = NOTE_WEIGHTS[noteId] || {};
    Object.entries(w).forEach(([id, v]) => (totals[id] += v));
  });

  // Winner: highest score. Tie-break: q2 winner's product, then fixed order.
  const q2WinnerId = q2w && Object.keys(q2w).length
    ? Object.entries(q2w).sort((a, b) => b[1] - a[1])[0][0]
    : null;

  let winner = PRODUCTS[0].id;
  let winnerScore = -Infinity;
  const order = [q2WinnerId, ...TIE_ORDER].filter(Boolean);
  const idsInTieOrder = [...new Set([...order, ...PRODUCTS.map((p) => p.id)])];
  idsInTieOrder.forEach((id) => {
    const s = totals[id] ?? 0;
    if (s > winnerScore) {
      winnerScore = s;
      winner = id;
    }
  });

  const maxScore = Math.max(1, ...Object.values(totals));
  const matches = PRODUCTS.map((p) => {
    const raw = totals[p.id] ?? 0;
    const pct = Math.round(60 + 39 * (raw / maxScore));
    return { id: p.id, score: raw, pct };
  }).sort((a, b) => b.score - a.score);

  // Guarantee winner sits in the "90s" band per spec intent; clamp others below it.
  const winnerMatch = matches.find((m) => m.id === winner);
  if (winnerMatch) winnerMatch.pct = Math.max(winnerMatch.pct, 91);
  matches.forEach((m) => {
    if (m.id !== winner) m.pct = Math.min(m.pct, winnerMatch ? winnerMatch.pct - 3 : m.pct);
  });
  matches.sort((a, b) => b.pct - a.pct);

  return { winner, matches };
}

// ---------------------------------------------------------------------------
// Asset availability cache (spec §Note cards — graceful fallback, zero code
// change when missing sprite/webp files are dropped in later).
const _availability = new Map();
export function checkImage(url) {
  if (_availability.has(url)) return _availability.get(url);
  const p = new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
  _availability.set(url, p);
  return p;
}
export const spriteUrl = (stem) => `/media/campaign/scent-elements/${stem}.webp`;
// Perf: Q3 cards use pre-downsized 768px copies (source art is 2048px,
// too heavy to decode at card size) — see public/media/campaign/scent-elements/card/.
export const cardSpriteUrl = (stem) => `/media/campaign/scent-elements/card/${stem}.webp`;

// Resolves once the image both loads AND is fully decoded off the main
// thread (img.decode()), so Q3 never paints a half-decoded frame mid-drag.
export async function loadDecoded(url) {
  const ok = await checkImage(url);
  if (!ok) return null;
  const img = new Image();
  img.src = url;
  img.decoding = 'async';
  try { await img.decode(); } catch { /* fall through, still usable */ }
  return img;
}
