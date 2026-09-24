export const clamp01 = value => Math.min(1, Math.max(0, Number.isFinite(value) ? value : 0));
export const lerp = (from, to, amount) => from + (to - from) * amount;
export const smoothstep = value => { const t = clamp01(value); return t * t * (3 - 2 * t); };
export const dampAmount = (delta, rate = 9) => 1 - Math.exp(-Math.max(0, delta) * rate);
