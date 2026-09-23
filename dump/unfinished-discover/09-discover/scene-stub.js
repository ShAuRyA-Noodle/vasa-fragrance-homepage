// Local no-op stub implementing the full scene/index.js contract (see
// SPEC.md "Module ownership & contract"), so the DOM/UI layer is fully
// testable before/without Agent A's WebGL scene. Drives a CSS gradient
// backdrop (#scene-fallback) instead of a canvas render.
import { productById } from './data.js';

const HEX = {
  hushed: { bg: '#141b21', fog: '#1c262c', light: '#cfd8de', smoke: 0.4, shaft: 0.5, warmth: 0.1 },
  poised: { bg: '#1a1410', fog: '#241c16', light: '#c8a86a', smoke: 0.5, shaft: 0.6, warmth: 0.4 },
  untamed: { bg: '#2a1620', fog: '#3a1c1a', light: '#e0a86a', smoke: 0.75, shaft: 0.7, warmth: 0.85 },
  hub: { bg: '#14100d', fog: '#1a1410', light: '#c8a86a', smoke: 0.35, shaft: 0.55, warmth: 0.35 },
  intro: { bg: '#0c0a09', fog: '#1a1410', light: '#ecd9a8', smoke: 0.3, shaft: 0.8, warmth: 0.3 },
  firstLight: { bg: '#1c2420', fog: '#26302a', light: '#e8dcb8', smoke: 0.3, shaft: 0.8, warmth: 0.25 },
  longAfternoon: { bg: '#241c14', fog: '#2c2318', light: '#e0b878', smoke: 0.4, shaft: 0.6, warmth: 0.5 },
  goldenHour: { bg: '#2a1a12', fog: '#33200f', light: '#e0973f', smoke: 0.5, shaft: 0.65, warmth: 0.75 },
  afterMidnight: { bg: '#0e0b12', fog: '#1a1420', light: '#8a7bb0', smoke: 0.6, shaft: 0.3, warmth: 0.15 },
};
['silent-storm', 'sweetest-stranger', 'rebel-in-velvet', 'the-night-lingers'].forEach((id) => {
  const p = productById(id);
  if (p) HEX[id] = { bg: p.color, fog: p.color, light: p.color, smoke: 0.5, shaft: 0.7, warmth: 0.5 };
});

const STAGE_MOOD = {
  intro: 'intro', hub: 'hub', q1: 'poised', q2: 'firstLight', q3: 'poised', result: null,
};

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = parseInt(h.length === 3 ? h.split('').map((c) => c + c).join('') : h, 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}
function lerp(a, b, t) { return a + (b - a) * t; }
function lerpHex(a, b, t) {
  const [ar, ag, ab] = hexToRgb(a);
  const [br, bg, bb] = hexToRgb(b);
  return `rgb(${lerp(ar, br, t) | 0}, ${lerp(ag, bg, t) | 0}, ${lerp(ab, bb, t) | 0})`;
}

export async function createScene(canvas, { onProgress } = {}) {
  const fallback = document.getElementById('scene-fallback');
  if (canvas) canvas.style.display = 'none';
  if (fallback) fallback.style.display = 'block';

  for (let i = 0; i <= 10; i++) {
    onProgress?.(i / 10);
    // eslint-disable-next-line no-await-in-loop
    await new Promise((r) => setTimeout(r, 16));
  }

  let hoverCb = null;
  let clickCb = null;

  function applyMood(m) {
    if (!m) return;
    fallback.style.background = `
      radial-gradient(60% 50% at 50% ${8 + m.shaft * 10}%, ${m.light}${Math.round(m.smoke * 40 + 10).toString(16).padStart(2, '0')}, transparent 60%),
      radial-gradient(120% 90% at 50% 110%, ${m.fog}, ${m.bg} 65%)`;
  }

  const api = {
    moods: HEX,
    async setStage(stage, opts = {}) {
      document.body.dataset.sceneStage = stage;
      if (stage === 'result' && opts.productId) {
        applyMood(HEX[opts.productId]);
      } else {
        applyMood(HEX[STAGE_MOOD[stage]] || HEX.hub);
      }
    },
    setIntroProgress(t) {
      fallback.style.filter = `brightness(${1 + t * 0.25}) saturate(${1 + t * 0.15})`;
    },
    setMood(mood) { applyMood(mood); },
    blendMood(a, b, t) {
      const ma = HEX[a] || HEX.poised;
      const mb = HEX[b] || HEX.poised;
      applyMood({
        bg: lerpHex(ma.bg, mb.bg, t),
        fog: lerpHex(ma.fog, mb.fog, t),
        light: lerpHex(ma.light, mb.light, t),
        smoke: lerp(ma.smoke, mb.smoke, t),
        shaft: lerp(ma.shaft, mb.shaft, t),
        warmth: lerp(ma.warmth, mb.warmth, t),
      });
    },
    showSprites() {},
    clearSprites() {},
    burst(x, y, colorHex) {
      const n = document.createElement('span');
      n.style.cssText = `position:fixed;left:${x}px;top:${y}px;width:6px;height:6px;border-radius:50%;
        background:${colorHex || '#c8a86a'};pointer-events:none;z-index:500;transform:translate(-50%,-50%);
        transition:transform .6s ease-out, opacity .6s ease-out;opacity:1;`;
      document.body.appendChild(n);
      requestAnimationFrame(() => {
        n.style.transform = `translate(-50%,-50%) scale(9)`;
        n.style.opacity = '0';
      });
      setTimeout(() => n.remove(), 650);
    },
    focusProduct(id) {
      document.body.dataset.focusProduct = id;
      applyMood(HEX[id]);
    },
    hoverProduct() {},
    onProductHover(cb) { hoverCb = cb; },
    onProductClick(cb) { clickCb = cb; },
    setQuality() {},
    destroy() {
      hoverCb = null;
      clickCb = null;
    },
  };

  applyMood(HEX.intro);
  return api;
}
