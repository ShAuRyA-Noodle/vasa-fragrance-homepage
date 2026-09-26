// The Exhibition: per-fragrance content and palette. One template, four museums.
// Copy is taken from each fragrance's original product page; notes match the
// VASA catalogue. `shade` is an "r g b" triplet used for every dark overlay so a
// page's shadows carry its own colour instead of the original burgundy.

export const exhibitions = [
  {
    id: 'silent-storm', num: '01', name: 'Silent Storm', family: 'Fresh · Spicy · Woody',
    lede: 'A memory that stayed.', tagline: 'The quiet before everything changes.',
    description: 'Bright bergamot and pepper. Aromatic lavender. A composed trail of cedar and labdanum.',
    caption: ['a memory', 'that', 'stayed'],
    world: 'world-silent-storm',
    palette: {
      damask: '#1d3338', damask2: '#29464b', deep: '#0d191c', salon: '#0a1416', admission: '#131a1b', excursion: '#0c1416',
      shade: '5 14 17', button: '#1d3338', buttonHover: '#274449', theme: '#1d3338',
      tints: ['rgba(236, 244, 214, .26)', 'rgba(150, 138, 205, .20)', 'rgba(118, 76, 44, .30)'],
      tickets: [['#d8d2a6', '#4d5838', '#667546'], ['#d7d2e3', '#3c3560', '#514878'], ['#b8875e', '#f0e2cf', '#f7ecdb']],
    },
    notes: [
      { room: 'The Opening', line: 'The first spark.', title: 'Bergamot', rows: ['Pepper'], em: 'Clear, vivid, impossible to miss.', ticket: ['Bergamot', 'Pepper'], art: 'Bergamot peel' },
      { room: 'The Heart', line: 'A quiet current.', title: 'Lavender', rows: ['Sichuan pepper, pink pepper, vetiver', 'Patchouli, geranium, elemi'], em: 'Warm spice beneath the surface.', ticket: ['Lavender', 'Pepper', 'Vetiver'], art: 'Lavender sprigs' },
      { room: 'The Base', line: 'What remains.', title: 'Cedar', rows: ['Labdanum'], em: 'A grounded signature that stays.', ticket: ['Cedar', 'Labdanum'], art: 'Cedar shavings' },
    ],
  },
  {
    id: 'sweetest-stranger', num: '02', name: 'Sweetest Stranger', family: 'Fruity · Floral · Soft',
    lede: 'Some encounters stay long after the moment.', tagline: 'Some encounters stay.',
    description: 'Pear blossom and mandarin open into white gardenia and jasmine, softened by brown sugar and patchouli.',
    caption: ['some', 'encounters', 'stay'],
    world: 'world-sweetest-stranger',
    palette: {
      damask: '#5b1117', damask2: '#7a1d22', deep: '#3a0a0e', salon: '#2b080c', admission: '#1e1917', excursion: '#1b0a0b',
      shade: '22 4 7', button: '#5b1117', buttonHover: '#6d151c', theme: '#5b1117',
      tints: ['rgba(255, 246, 226, .30)', 'rgba(255, 170, 170, .16)', 'rgba(120, 58, 18, .30)'],
      tickets: [['#b8a27a', '#5f5236', '#7b6c49'], ['#e7e3dc', '#5b1117', '#74202a'], ['#c46b5c', '#ecdcc4', '#f7ecdb']],
    },
    notes: [
      { room: 'The Opening', line: 'A bright hello.', title: 'Pear blossom', rows: ['Italian mandarin, red berries'], em: 'A sparkling first impression.', ticket: ['Pear blossom', 'Mandarin', 'Red berries'], art: 'Pear blossom branch' },
      { room: 'The Heart', line: 'A tender heart.', title: 'White gardenia', rows: ['Jasmine, frangipani'], em: 'Unfurl with an effortless warmth.', ticket: ['White gardenia', 'Jasmine', 'Frangipani'], art: 'White gardenia bloom' },
      { room: 'The Base', line: 'A sweetness that lasts.', title: 'Brown sugar', rows: ['Patchouli'], em: 'A soft, lasting trace.', ticket: ['Patchouli', 'Brown', 'Sugar'], art: 'Brown sugar crystals' },
    ],
  },
  {
    id: 'rebel-in-velvet', num: '03', name: 'Rebel in Velvet', family: 'Amber · Floral · Creamy',
    lede: 'Softness has a bold side.', tagline: 'Soft to the touch. Never quiet.',
    description: 'Creamy almond meets tuberose and Bulgarian rose. Tonka bean and cocoa bring a warm, velvety finish.',
    caption: ['softness', 'has a bold', 'side'],
    world: 'world-rebel-in-velvet',
    palette: {
      damask: '#3d0f2e', damask2: '#561a42', deep: '#24081b', salon: '#1b0614', admission: '#1c1519', excursion: '#170811',
      shade: '20 4 15', button: '#4a1238', buttonHover: '#5c1846', theme: '#3d0f2e',
      tints: ['rgba(255, 236, 212, .24)', 'rgba(225, 140, 175, .18)', 'rgba(92, 50, 30, .34)'],
      tickets: [['#e4d2b6', '#5a2340', '#6e2c50'], ['#efe8e1', '#3d0f2e', '#561a42'], ['#8c5c3e', '#f1e2cc', '#f7ecdb']],
    },
    notes: [
      { room: 'The Opening', line: 'A gentle provocation.', title: 'Almond', rows: ['A soft, irresistible warmth'], em: 'Tender, then daring.', ticket: ['Almond'], art: 'Almonds in the shell' },
      { room: 'The Heart', line: 'Flowers after dark.', title: 'Tuberose', rows: ['Jasmine sambac, Bulgarian rose'], em: 'Three flowers bloom together.', ticket: ['Tuberose', 'Jasmine', 'Rose'], art: 'Tuberose flowers' },
      { room: 'The Base', line: 'The velvet trace.', title: 'Tonka bean', rows: ['Cocoa'], em: 'An intimate signature.', ticket: ['Tonka', 'Bean', 'Cocoa'], art: 'Split tonka pods' },
    ],
  },
  {
    id: 'the-night-lingers', num: '04', name: 'The Night Lingers', family: 'Amber · Woody · Smoky',
    lede: 'The warmth that stays long after the moment.', tagline: 'The warmth that stays.',
    description: 'Oud and rose, softened by benzoin. Saffron, raspberry and incense leave a dark, intimate impression.',
    caption: ['the', 'warmth', 'stays'],
    world: 'world-the-night-lingers',
    palette: {
      damask: '#2e2014', damask2: '#3f2c1a', deep: '#170f08', salon: '#120b06', admission: '#18130f', excursion: '#120c07',
      shade: '14 8 4', button: '#3f2a16', buttonHover: '#4e351c', theme: '#2e2014',
      tints: ['rgba(120, 72, 30, .30)', 'rgba(255, 170, 90, .16)', 'rgba(200, 190, 175, .16)'],
      tickets: [['#8c6a45', '#f2e3c8', '#f8eedc'], ['#d6a45e', '#3a2412', '#4d3219'], ['#5d4c40', '#eadfce', '#f4ebdd']],
    },
    notes: [
      { room: 'The Opening', line: 'First, the spark.', title: 'Oud wood', rows: ['A dark, resinous warmth'], em: 'The night begins.', ticket: ['Oud', 'Wood'], art: 'Oud wood' },
      { room: 'The Heart', line: 'Then, the ember.', title: 'Benzoin', rows: ['Rose'], em: 'The glow deepens on skin.', ticket: ['Benzoin', 'Rose'], art: 'Benzoin resin' },
      { room: 'The Base', line: 'What lingers.', title: 'Incense', rows: ['Saffron, raspberry'], em: 'The final trail.', ticket: ['Saffron', 'Raspberry', 'Incense'], art: 'Incense resin' },
    ],
  },
];

export const byId = Object.fromEntries(exhibitions.map((e) => [e.id, e]));
