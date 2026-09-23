# VASA Luxury House — Reference Synthesis and Design System

Research date: 21 September 2026
Reference pages: [Louis Vuitton India](https://in.louisvuitton.com/eng-in/homepage), [Dior Sauvage](https://www.dior.com/en_int/beauty/fragrance/mens-fragrance/sauvage), [Cartier India](https://www.cartier.com/en-in/home)

This document separates **observed** behaviour from **inferred** design intent. “Observed” means visible on the live page or measurable in its rendered DOM on the research date. “Inferred” means a design conclusion drawn from those observations. The VASA specification is an original system; it does not reproduce any house’s identity, proprietary typeface, assets, code, or exact composition.

## Executive synthesis

These sites feel expensive because the interface does less and the art direction does more. Each uses a stable, low-noise commerce shell around a sequence of large campaign moments. Copy is brief at the top of the page, product information becomes denser only where a customer must compare or buy, and heritage content appears as proof of the house rather than filler.

The common formula is:

> one dominant image or film + one precise message + one restrained action + generous negative space

VASA should adopt that discipline. Its differentiators—concentration, strength/presence, longevity, and family expertise—should become four editorial proofs spread across the page, rather than four equal cards or a paragraph of claims.

## What the three houses have in common

### 1. Media carries the emotion; interface carries the transaction

**Observed:** Louis Vuitton opens with a full-width campaign film and overlays only a category, a campaign title, and one underlined action. Dior gives Sauvage a quiet white title field followed by a wide campaign image that places the bottle and talent inside one cinematic landscape. Cartier begins with a large campaign canvas and follows it with collection stories and product rows. All three place buying and service information later in the journey.

**Inferred:** The premium feeling comes from separating seduction from shopping without separating the two experiences. The hero earns attention; the product modules resolve it into choice.

**VASA rule:** The NF4 film owns the first viewport. Do not place a paragraph, feature badges, controls, or a decorative card over it. The only optional overlay is one short line and one CTA, both positioned in a deliberately empty area of the film. If the film has no reliable safe zone, move the copy below it.

### 2. Typography is controlled more than it is decorative

**Observed:** The current Louis Vuitton page uses a proprietary sans family across the interface; rendered body text is 16 px with modest tracking and the hero title is light in weight. Dior uses a sans body family (Hellix) and a separate display family (Atacama VF), with 32 px, light-weight headings and slightly negative tracking on the current Sauvage page. Cartier uses its “Brilliant Cut” family for interface text, a script wordmark, compact uppercase navigation, and editorial serif expression within campaign artwork.

**Inferred:** The houses do not achieve luxury by using many typefaces. They use one utilitarian voice for navigation and commerce, then introduce a controlled display voice where the story needs atmosphere. Hierarchy comes from scale, line length, weight, and space before it comes from ornament.

**VASA rule:** Use two families only:

- **Interface and modern display:** Instrument Sans Variable, with Manrope as a local fallback. Use 400 for most text and 500 only for controls.
- **Editorial display and italics:** Bodoni Moda Variable, already available in the project. Use it selectively for one phrase within a heading, testimonials, and chapter numerals.
- Keep the VASA logo as artwork. Never approximate it with a font.
- Desktop hero: `clamp(4.5rem, 9vw, 9rem)` with 0.90–0.96 line height. Mobile hero: `clamp(3.1rem, 15vw, 5.2rem)` with at least 0.96 line height.
- Section heading: `clamp(2.6rem, 5vw, 5.5rem)`. Body: 17–19 px desktop and 16–18 px mobile. Navigation: 13–14 px.
- Uppercase eyebrow: 11–12 px, 0.14–0.18 em tracking. Never use uppercase for sentences.
- Limit body copy to 45–62 characters per line and headline blocks to three lines.
- Give italic glyphs 0.08 em inline padding and never hide headline overflow; this prevents clipped swashes and descenders.

### 3. Their colour systems are quieter than their campaigns

**Observed:** The interface foundations are near-black, white, and warm neutral. Louis Vuitton’s current hero takes its colour from the film while navigation renders in white over it. Dior frames its imagery with a near-white `#f8f8f8` interface and dark grey text. Cartier uses a white shell, near-black typography, and a small red signature accent. Stronger colour appears inside photography and individual campaigns rather than across every component.

**Inferred:** Luxury colour is episodic. A single campaign hue can dominate a scene because buttons, navigation, cards, and dividers are not competing with it.

**VASA rule:** Use a neutral shell and permit one campaign colour per chapter.

| Token | Value | Use |
|---|---:|---|
| Leather | `#0B0A09` | Dark canvas, footer, high-contrast typography |
| Musk | `#F2EEE7` | Light canvas; warmer than retail white |
| Carbon | `#171615` | Raised dark surface |
| Birch | `#C9B9A7` | Muted text and natural material accent |
| Oxblood | `#5A1624` | Hero/campaign accent; sparingly |
| Himalayan | `#172634` | Film-supporting blue-black chapter |
| Pine | `#26332D` | Family/craft chapter |
| Saffron | `#C28B44` | Focus, active state, fine rule; never large backgrounds |

Maintain at least 4.5:1 contrast for reading text. Avoid translucent brown feature blocks. When a chapter changes colour, the entire chapter changes as one field; individual cards do not introduce unrelated palettes.

### 4. Composition is built around safe zones

**Observed:** Campaign copy sits over low-detail regions or outside the media. Product rows use consistent image ratios and repeated baselines. Logos remain centered or optically anchored while utilities sit at the edges. Dior’s Sauvage hero composes the bottle and talent as separate anchors inside one frame. Cartier’s desktop masthead uses two clear navigation tiers. Louis Vuitton uses a minimal single overlay row.

**Inferred:** Art direction begins before the asset is generated or photographed. Images are commissioned with text, navigation, crops, and responsive variants already in mind.

**VASA rule:** Use a 12-column desktop grid, 8-column tablet grid, and 4-column mobile grid. Desktop outer margin is 32–64 px; editorial sections cap at 1600 px, while campaign media may be full bleed. Use 24–32 px desktop gutters and 16 px mobile gutters.

Layer order is fixed:

1. page colour field;
2. image or film;
3. a local media-grade contrast wash only when required;
4. editorial copy;
5. global navigation;
6. drawers, search, and cart.

Do not place pale bottle cutouts on white polygons. Do not use a detached “sticker” bottle over an unrelated landscape. Product and scene must share perspective, colour temperature, grain, contact shadow, and reflected light.

### 5. Repetition creates confidence

**Observed:** All three sites repeat a small number of modules: campaign panel, product rail/grid, story panel, service strip, newsletter/footer. CTAs also repeat consistent language such as “Discover,” “Explore,” and collection names.

**Inferred:** Consistency reads as institutional confidence. Novelty belongs in the photography and campaign direction, not in a different animation or button for every section.

**VASA rule:** Build the homepage from six reusable modules: media hero, chapter intro, fragrance rail, proof story, gift panel, and service/footer. Allow only two CTA treatments: underlined text and solid rectangular action. Use sentence case except for navigation and micro labels.

## Meaningful differences

| House | Current emphasis | Structural character | What VASA should take | What VASA should leave |
|---|---|---|---|---|
| Louis Vuitton | Seasonal fashion campaign and breadth of the Maison | Film-first, sparse overlay, repeated full-width campaigns, clean product selections | Confidence of the opening, media scale, short copy, consistent modules | Fashion-category breadth and campaign turnover that VASA cannot sustain yet |
| Dior Sauvage | One product universe with multiple concentrations, rituals, and exceptional pieces | Editorial prelude followed by a deep, clearly named product taxonomy | Fragrance-family logic, concentration and intensity comparison, raw-material/craft story | Overlong catalogue density on the homepage and celebrity-dependent storytelling |
| Cartier | Heritage, symbolic codes, collections, service, and house authority | More persistent navigation, centered branding, story panels followed by product rails | Family-root authority, signature materials, measured uppercase labels, service confidence | Dense two-tier desktop navigation and jewellery-specific merchandising language |

The recommended VASA mixture is **45% Louis Vuitton’s campaign restraint, 35% Dior’s fragrance architecture, and 20% Cartier’s house authority**. This is a design weighting, not a claim about their design teams.

## Original VASA design proposition: “A Scent, Held in Memory”

The site presents VASA as a contemporary Indian fragrance house whose strength comes from concentration and inherited knowledge. The Himalayan film supplies scale and atmosphere; warm studio stills supply material credibility; the product system supplies commercial clarity.

### Voice

- Use short, declarative sentences.
- Prefer sensory evidence over adjectives: “20% perfume oil” only when the figure is verified; “built to unfold through the day” until wear testing is approved.
- Treat family roots as documented provenance. Use real names, dates, workshop objects, or archival material. If those assets are unavailable, say “knowledge passed through the family” and avoid invented chronology.
- Use one headline, one supporting sentence, and one action per section.

### Homepage sequence

1. **Hero — The VASA World**
   Full-width NF4 film, muted and looping. Transparent navigation. No decorative video controls. Optional copy: “Fragrance, held in memory.” Action: “Meet the four.” The film uses `object-fit: contain` against a Himalayan blue-black field if cropping would remove meaningful content; a dedicated 4:5 poster replaces video on small screens.

2. **Collection prelude — Four expressions**
   One large line of type and a single sentence. No cards yet. A horizontal index names Silent Storm, The Sweetest Stranger, Rebel in Velvet, and The Night Lingers.

3. **Fragrance gallery — Four distinct worlds**
   Four consistent product scenes in a rail. Each scene shows the bottle integrated into its material world. Hover/focus dissolves from environmental still to product-led still; touch uses a visible “View fragrance” action. Name, three verified notes, concentration class, size, price, and add-to-bag remain stable below the media.

4. **Proof I — Concentration / Presence**
   One dark chapter with a macro film or still of formulation, weighing, or maceration. The verified concentration appears as the dominant fact; “presence” explains projection without unsupported performance promises.

5. **Proof II — Longevity / Evolution**
   A three-beat horizontal scent timeline: opening, heart, memory. It demonstrates evolution rather than displaying “01 / 02 / 03” as empty feature cards.

6. **House story — Knowledge carried forward**
   Real family archive, hands, ledgers, ingredients, or workshop details. Keep this section warm Musk/Pine and editorial. One concise story plus “Our story.” Do not use a generic model photograph as evidence of heritage.

7. **Gifting — For someone known by heart**
   Full-width gift still with box, ribbon, bottle, and handwritten card. One gift CTA and a secondary discovery-set link.

8. **Services and footer**
   Delivery, samples, returns, and contact only when operationally true. Newsletter, social links, policies, and large VASA wordmark. Footer follows the active light/dark theme rather than remaining permanently black.

### Production sitemap

- `/` — Home
- `/collections` — All fragrances
- `/fragrance/silent-storm`
- `/fragrance/the-sweetest-stranger`
- `/fragrance/rebel-in-velvet`
- `/fragrance/the-night-lingers`
- `/discovery-set`
- `/gifting`
- `/our-story`
- `/journal` — optional at launch; omit if it has no real editorial content
- `/search`
- `/cart`
- `/checkout`
- `/account`
- `/contact`
- `/shipping-returns`
- `/privacy`
- `/terms`

## Brand asset system

### Minimum launch set

| Asset family | Quantity | Format and crop | Purpose |
|---|---:|---|---|
| Hero film | 1 | 16:9 master, 8–10 seconds, H.264/WebM, seamless loop | First viewport |
| Hero mobile poster | 1 | 4:5, 2160 × 2700 | Fast, uncropped mobile opening |
| Bottle packshots | 4 | Transparent PNG/WebP, minimum 2400 px tall | Commerce and compositing source |
| Environmental plates | 4 | 4:5 and 16:10, no bottle | Responsive scene backgrounds |
| Final product worlds | 4 | 4:5, bottle physically integrated | Collection rail |
| Ingredient/craft macros | 6 | 3:2 and 1:1 | Concentration, notes, family craft |
| House/heritage frames | 3–5 | 3:2 documentary stills | Provenance chapter |
| Gifting still | 1 | 16:10 plus 4:5 crop | Gift chapter |
| Discovery set still | 1 | 16:10 | Conversion module |

### Creation workflow

1. Photograph or render one **canonical bottle master** from the real dimensions. Lock cap shape, glass thickness, fill line, label ratio, logo, kerning, and colour for all four fragrances.
2. Generate or photograph **background plates separately**, with an explicit central bottle-safe zone and copy-safe zone. This gives control over crop and avoids malformed branding.
3. Composite the canonical bottle into the plate. Match contact shadow, reflected colour, focal plane, lens distortion, grain, and lighting direction.
4. Add the final VASA label and wordmark from vector artwork after image generation. Do not ask an image model to typeset the brand.
5. Produce desktop and mobile crops from the approved composite, not independent generations. Keep the bottle at a consistent perceived scale across the collection.
6. Export AVIF/WebP plus a high-quality source. Preserve a poster for every video. Record focal point metadata for responsive positioning.

### Four product worlds

- **Silent Storm:** mineral blue-grey, wet slate, bergamot peel, cedar and vetiver fibres; cool overcast light.
- **The Sweetest Stranger:** blush plaster, jasmine shadow, translucent fabric and warm skin-toned reflection; soft morning side light.
- **Rebel in Velvet:** oxblood velvet, almond shell, tuberose and tonka; narrow theatrical light with deep but readable blacks.
- **The Night Lingers:** smoked amber glass, saffron thread, benzoin resin and dark stone; low golden evening light.

Every world should feel physically buildable in a studio. Avoid floating ingredients, fantasy particles, glowing liquid, excessive fog, liquid splashes, impossible reflections, and generic palace or wilderness scenery.

## Navigation and interaction

- Desktop: Collection, Gifting | centered VASA logo | Our Story, Contact, Search, Bag, Profile.
- Hero state: completely transparent, 88–96 px tall, light or dark foreground chosen from the media luminance map. No blur sheet over the film.
- After hero: navigation keeps a transparent field and changes its foreground colour at section boundaries. A 1 px contrast rule may appear when necessary; no automatic active underline while scrolling.
- Logo: show the mark by default. Hover/focus reveals “VASA Fragrance” with a 450 ms width-and-opacity transition. Reserve the full width in layout so nothing overlaps.
- Mobile: mark centered, menu left, search and bag right. Menu opens as a full-height editorial sheet; 48 px minimum touch targets.
- Product cards: environmental image first, product reveal second. Crossfade; never stack two opaque images.
- Focus, hover, and touch receive equivalent states. Respect `prefers-reduced-motion`.

## Motion specification

Motion should make the sequence feel authored without calling attention to a library. Use a single scroll owner and no global click-spark, particle cursor, elastic text, or looping ornament.

| Moment | Behaviour | Timing |
|---|---|---:|
| Initial entry | Logo and navigation fade; hero film is already playing behind them | 700–900 ms |
| Hero copy | Line mask rises 0.7 em and resolves from 8 px blur | 900 ms, 120 ms line stagger |
| Section headings | Masked line reveal when 20% of section enters | 800–1000 ms |
| Campaign media | Scale settles from 1.035 to 1; no crop change | 1200 ms |
| Product rail | Horizontal translation follows vertical scroll only on desktop; native swipe/scroll snap on touch | scrub 0.8 |
| Product hover | Environment fades out as product-led frame fades in; metadata shifts 6 px | 450–650 ms |
| Scent timeline | One continuous rule draws left-to-right while labels resolve | 1000–1400 ms |
| House chapter | Image and copy move at a maximum 6% relative parallax | scroll-linked |
| Page transition | Solid Musk/Leather panel wipes upward, logo holds, new page resolves | 700–900 ms |

Easing: use `cubic-bezier(.22, 1, .36, 1)` for entrances and `cubic-bezier(.45, 0, .55, 1)` for crossfades. Hover movement stays within 2–8 px. Avoid repeated fade-up animations on every child.

Reduced-motion mode removes parallax, scrubbing, blur, and autoplay-dependent storytelling. It retains instant state changes and preserves all content.

## Quality gates

- No text, logo, bottle, cap, or italic glyph is clipped at 320, 375, 768, 1024, 1440, and 1920 px widths.
- Hero media never stretches. Any crop is an approved art-directed crop; otherwise use `contain` with the correct supporting field.
- Navigation remains legible across every section in both themes.
- All body text meets WCAG AA contrast; focus states are visible.
- All interactive targets are at least 44 × 44 px.
- The page loads a poster before hero video and remains meaningful if video fails.
- Image generation never supplies final label typography or the logo.
- Concentration, longevity, ingredients, prices, family history, and service promises are published only after brand verification.
- The page contains no fake statistics, invented awards, fabricated testimonials, or unsupported “all day” performance claims.

## Reference notes

- [Louis Vuitton India homepage](https://in.louisvuitton.com/eng-in/homepage): current campaign film, minimal overlaid copy, centered wordmark, product selections, and Maison stories were observed live.
- [Dior Sauvage](https://www.dior.com/en_int/beauty/fragrance/mens-fragrance/sauvage): current Sauvage campaign treatment, fragrance/skincare/grooming/gift taxonomy, product information, and exceptional-piece storytelling were observed live.
- [Cartier India homepage](https://www.cartier.com/en-in/home): current two-level navigation, centered wordmark, campaign-led storytelling, collection modules, product rails, services, and house navigation were observed live. The text-only web fetch returned a 403, so Cartier observations came from the rendered live page rather than a search snippet.

The conclusion that these choices communicate “confidence,” “authority,” or “institutional luxury” is interpretive. The layout, copy, product categories, visible controls, rendered typography, and media hierarchy described above are observations from the cited pages on the research date.
