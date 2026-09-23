// Per-fragrance art direction for the product experience.
// theme picks the particle system in scene.js; colours drive background, liquid and light.
const el = name => `/media/campaign/scent-elements/${name}.webp`;

export const worlds = {
  'silent-storm': {
    grade: {tint: '#8fb3c9', shadows: '#0b1a24', bloom: .45, grain: .035, vignette: .55, aberration: .0022},
    theme: 'storm',
    bg: ['#1b2a33', '#05090c'],
    liquid: '#9fc4d1',
    accent: '#bcd9e4',
    rim: '#6fa3c0',
    ingredients: [el('bergamot-peel'), el('lavender-sprigs'), el('vetiver-roots'), el('cedar-shavings-branch')],
    stages: [el('bergamot-peel'), el('lavender-sprigs'), el('cedar-shavings-branch')],
    tagline: 'Calm, before it breaks.'
  },
  'sweetest-stranger': {
    grade: {tint: '#ffd2c6', shadows: '#2a1012', bloom: .6, grain: .03, vignette: .45, aberration: .0012},
    theme: 'petals',
    bg: ['#3a2224', '#120a0b'],
    liquid: '#f0a7a0',
    accent: '#f5c6bd',
    rim: '#e59a8f',
    ingredients: [el('pear-blossom-branch'), el('gardenia-bloom'), el('brown-sugar-crystals')],
    stages: [el('pear-blossom-branch'), el('gardenia-bloom'), el('brown-sugar-crystals')],
    tagline: 'Sweet, then unforgettable.'
  },
  'rebel-in-velvet': {
    grade: {tint: '#e7b8dc', shadows: '#1e0718', bloom: .55, grain: .03, vignette: .6, aberration: .0016},
    theme: 'velvet',
    bg: ['#2b1626', '#0b0509'],
    liquid: '#b98ab0',
    accent: '#d9b3cf',
    rim: '#9b5c8c',
    ingredients: [el('almonds-open-shell'), el('tuberose-flowers'), el('tonka-beans-split-pod')],
    stages: [el('almonds-open-shell'), el('tuberose-flowers'), el('tonka-beans-split-pod')],
    tagline: 'Soft to the touch. Never quiet.'
  },
  'the-night-lingers': {
    grade: {tint: '#ffc98a', shadows: '#1f0c03', bloom: .75, grain: .04, vignette: .62, aberration: .0018},
    theme: 'embers',
    bg: ['#2e1a0c', '#0a0503'],
    liquid: '#e0a45c',
    accent: '#f1c486',
    rim: '#d9823a',
    ingredients: [el('oud-wood-chip'), el('incense-resin-smoke'), el('brown-sugar-crystals')],
    stages: [el('oud-wood-chip'), el('brown-sugar-crystals'), el('incense-resin-smoke')],
    tagline: 'Long after you leave.'
  }
};
