# VASA Luxury-House Homepage — Brand Asset Production Brief

## 1. Creative thesis

VASA should feel like a fragrance house with a point of view, not a product catalogue decorated with luxury effects. The visual system is built around one idea from the brand source material: scent is a **dwelling, presence and memory**. Images therefore show atmosphere first, product second, and ingredients only when they clarify the composition.

The work borrows the structural discipline shared by leading luxury houses—dominant campaign media, restrained copy, large negative space, regular-weight typography, quiet motion and dedicated mobile crops—without reproducing any house's imagery, symbols, layouts, monograms or signature motifs.

## 2. What the reference houses have in common

| Principle | Observed pattern | VASA production rule |
|---|---|---|
| Media leads | A campaign image or film establishes each chapter before explanatory copy | One dominant visual per section; no collage unless the story specifically needs sequence |
| Low copy density | Headlines are short and supporting text is secondary | Reserve copy zones in the photography; do not bake marketing copy into pixels |
| Restrained type | Regular/light weights, generous line-height, controlled display moments | Forma DJR Display for navigation, body and most headings; Begum Devanagari only as a scarce editorial accent |
| Composed whitespace | Objects are given space and UI avoids decorative clutter | Keep product edges clear; use one prop family and one material story per scene |
| Campaign/product cadence | Emotional campaign chapters alternate with precise product views | Alternate cinematic environment, clean packshot, craft detail and purchase-oriented product grid |
| Paired art direction | Desktop and mobile use different crops rather than an automatic center crop | Generate both aspect ratios from the same scene, with a separately defined subject position and safe zone |
| Quiet transitions | Fades, restrained scale and short movement support the imagery | Prepare layered, uncluttered frames for 0.45–0.8 second fades and subtle 1.02–1.05 scale moves |

## 3. VASA identity locks

### Palette

- MUSK `#EFE9E1` — primary luminous ground
- BIRCH `#CDBCAC` — warm stone and skin neutral
- SILK `#4A1A2A` — burgundy signature
- SAFFRON `#A67D45` — metal, warmth and controlled highlight
- PINE `#412E27` — wood, shadow and earth
- LEATHER `#11100F` — near-black cinematic ground

Use one dominant ground, one supporting material color and one accent per image. Avoid uncontrolled rainbow grading, teal-orange cinema grading and generic purple/blue AI glow.

### Typography in images

Campaign images contain no superimposed typography. The only visible text may be physically printed or engraved on the actual VASA bottle, carton, ribbon or card. Website copy remains live HTML for accessibility and responsive control.

### Logo

The supplied VASA wordmark and fluid-whisp logomark must be composited from the official artwork after generation whenever possible. The mark represents scent as memory in motion and draws from Indian ornamental line work. Do not ask an image model to redraw it from memory. No invented monogram, seal, crest or altered spelling.

## 4. Bottle and label fidelity lock

Every product image must use a supplied VASA bottle photograph as the primary visual reference. The generated bottle must retain:

- clear heavy rectangular glass with softly bevelled shoulders and lower corners;
- bottle body about **44.9 mm wide × 35.15 mm deep × 57.65 mm high**, approximately **61.6 mm including the neck**;
- rounded cup-shaped natural wood cap, approximately **40.8 mm diameter × 25.65 mm high**;
- short cylindrical neck and polished warm-gold collar;
- centered ivory paper label, straight and flat to the front face;
- exact official lowercase `vāsā` wordmark, correct fragrance name, scent icon and `50 ml / 1.7 fl oz` line as shown in the supplied reference;
- the actual liquid hue and label keyline of the named fragrance;
- physically plausible refraction, glass thickness, liquid meniscus, cap grain and contact shadow.

Never replace the wooden cap with metal, plastic, stone or an oversized sculptural object. Never elongate the bottle, round it into a generic cylinder, add shoulders, change the gold collar, duplicate the label, invent tiny copy, mirror the lettering or place a white cutout halo behind the product.

## 5. Four-fragrance art direction

| Fragrance | Core palette | Note cues | Emotional register |
|---|---|---|---|
| The Sweetest Stranger | blush, MUSK, soft SILK | pear blossom, mandarin, red berries, gardenia, jasmine, frangipani, patchouli, brown sugar | graceful, intimate, quietly unforgettable |
| Rebel in Velvet | lavender, cocoa, deep SILK | almond, tuberose, jasmine sambac, Bulgarian rose, tonka bean, cocoa | creamy, confident, sensual |
| Silent Storm | mineral blue, fog, PINE | bergamot, pepper, lavender, vetiver, patchouli, geranium, elemi, cedar, labdanum | composed, magnetic, enduring |
| The Night Lingers | whiskey amber, SAFFRON, LEATHER | oud, benzoin, rose, saffron, raspberry, incense | dark, warm, intimate, memorable |

Ingredients must appear as real botanical/material details, never as a literal ingredient explosion. Use two or three cues maximum in a frame.

## 6. Website allocation

| Homepage chapter | Primary assets | Purpose |
|---|---|---|
| Hero | `A01` plus NF4 video | Editorial fallback/poster and first-frame continuity |
| Collection introduction | `A02`–`A05` | Four individual fragrance portraits with coherent framing |
| The VASA Standard | `A06`, `A07`, `A08` | Concentration, longevity and family-rooted expertise |
| Discovery ritual | `A09` | Four-fragrance discovery presentation |
| Our Story | `A10` | Heritage and modern Indian material culture |
| Gifting | `A11` | Considered wrapping ritual and product desirability |
| Closing campaign / newsletter | `A12` | Emotional final image with copy-safe negative space |

## 7. Safe-zone system

Safe zones are measured from the final canvas edge.

- **Desktop 16:9 hero:** keep the product and essential action inside the central 60% width and 76% height; reserve one outer 28% column for live copy; keep 8% clear at the top for navigation and 7% at the bottom for controls.
- **Mobile 9:16 hero:** keep face, bottle and hands inside the central 74% width; keep 12% clear at the top and 16% clear at the bottom; never place the bottle across the device notch or CTA zone.
- **Desktop editorial 3:2 or 16:10:** protect 10% on every edge and leave at least 32% continuous low-detail space on the designated copy side.
- **Mobile editorial 4:5:** protect 9% on every edge; keep the full cap and bottle base visible with at least 6% air above and below.
- **Product tiles 4:5:** bottle occupies 56–66% of frame height, fully visible, centered within the middle 70% width; no live-copy dependency within the image.

## 8. Capture and generation workflow

1. Attach the most accurate front-facing bottle photo for the named fragrance and the official logo/label artwork.
2. Generate `A01` first as the identity anchor. Once accepted, use it as a secondary style reference for the remaining set.
3. Produce the desktop and mobile compositions separately from the same scene brief. Do not crop the desktop master into mobile.
4. Treat generated label lettering as a placement proxy. Replace the label face in post with the official artwork using perspective matching, subtle paper texture and preserved glass reflections.
5. Match bottle height, cap diameter, liquid hue, gold collar and label position across all twelve assets before color finishing.
6. Grade the complete set together: warm neutral highlights, deep but open blacks, natural skin, controlled saturation and visible texture.
7. Export web masters in AVIF/WebP plus a high-quality archival TIFF/PNG. Preserve an ungraded master and a clean plate without overlaid UI.

## 9. Quality gate

Reject an output if any of the following is present:

- wrong bottle or cap geometry;
- unreadable, invented or mirrored VASA label;
- bottle, cap, hand or face clipped by the frame;
- a product floating without credible contact or shadow;
- obvious synthetic skin, plastic botanicals, duplicated fingers or melted packaging;
- fake watermarks, copied luxury-house symbols, recognizable competitor packaging or fashion-house styling;
- generic palace, mansion, excessive marble, gold dust, floating petals, random smoke or decorative CGI without narrative purpose;
- excessive blur, black crush, blown glass highlights, white cutout halo or sticker-like compositing;
- mobile crop produced by simply centering the desktop image.

## 10. Prompt files

The complete structured set is in `asset-prompts.json`. Each entry includes its homepage role, required references, desktop/mobile ratio pair, crop-specific safe zones, production prompt and negatives.
