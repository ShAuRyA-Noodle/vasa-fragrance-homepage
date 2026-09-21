# VASA 08 Media House — Acceptance Checklist

This pass succeeds only if the homepage feels like a luxury campaign edit whose interface happens to support shopping. The media must carry the story. Copy may identify a fragrance or offer the next action; it must not explain the image, narrate the brand, or recreate the text-led structure of the existing VASA homepage.

## Release blockers

Any unchecked item in this section blocks acceptance.

- [ ] The first viewport is one uninterrupted full-bleed film or campaign image. There is no headline, paragraph, eyebrow, chapter number, product metadata, scroll prompt, decorative type, or CTA over the media.
- [ ] The hero video itself contains no baked-in text, captions, logo animation, title card, or product claim. A persistent site header may sit above the hero, but it must read as global navigation rather than campaign copy.
- [ ] At least **75% of the homepage's pre-footer scroll area** is visibly occupied by image or video at desktop and mobile widths. Media area is measured from rendered section boxes, not asset file size.
- [ ] Before the footer, total editorial copy is no more than **90 words**, excluding navigation, fragrance names, prices, button labels, form labels, and accessible text that is not visually rendered.
- [ ] No pre-footer paragraph exceeds **18 words**. No section contains more than one short descriptive sentence.
- [ ] There is no standalone “Our story,” “VASA standard,” principles, benefits, craft, concentration, longevity, or family-expertise text section. If any of these ideas appear, they are expressed by a visual and a caption of at most six words.
- [ ] The four fragrances are each given a dominant campaign frame; they are not reduced to four conventional cards in a padded ecommerce grid.
- [ ] The page cannot be mistaken for `07-luxury-house` with different images. It must use a materially different sequence, spacing model, and text density.
- [ ] Every visible VASA logo, bottle, cap, label, fragrance name, and pack detail matches an approved source asset. Generated lettering or a distorted substitute is a release blocker.
- [ ] Desktop and mobile are visually checked at **1440 × 900** and **390 × 844**, including the full page, not only the hero.

## 1. Media-to-text ratio

- [ ] The page is understandable with all descriptive copy hidden: the order, collection, and mood remain clear from the media and fragrance names.
- [ ] At least three consecutive major sections are predominantly visual, without an explanatory text section inserted between each image.
- [ ] The largest text after the logo is a fragrance name or a restrained collection label; there is no manifesto-sized slogan.
- [ ] A media section uses no more than: one fragrance name, one short qualifier, and one action. Prefer the name and action only.
- [ ] Text never occupies more than **20% of a campaign frame's visible area**.
- [ ] Copy is not placed inside cards, tinted panels, translucent boxes, floating badges, feature rows, or numbered principle modules.
- [ ] Repeated housekeeping labels such as “01 / 04,” “The house,” “Presence,” and “Scroll to discover” are removed unless they perform a real navigation function.
- [ ] Footer and menu content may be practical and denser, but they do not visually compete with the campaign sequence.

## 2. Hero rules

- [ ] Hero height is at least **100svh** on desktop and mobile.
- [ ] The media reaches all four viewport edges. There is no frame, border radius, card, inset gutter, poster mat, or visible page background around it.
- [ ] The only elements permitted above the hero media are the global header controls and accessibility affordances.
- [ ] The header is visually quiet: VASA identity plus essential menu/search/bag controls. It does not include a promotional announcement or campaign tagline.
- [ ] Media uses an art-directed crop. The bottle, face, hand, or key subject is not clipped at 320, 390, 768, 1024, 1440, or 1920 px widths.
- [ ] A poster appears immediately and is compositionally consistent with the first video frame.
- [ ] If video playback fails or reduced motion is enabled, the poster still produces a complete, deliberate hero.
- [ ] The hero has no visible timeline, play chrome, sound prompt, decorative video control, or forced audio.
- [ ] Any transition out of the hero preserves the media-first feeling; it does not reveal a large block of prose in viewport two.

## 3. Campaign sequence and grid

- [ ] The desktop sequence alternates scale or rhythm using a small set of image-led compositions: full bleed, asymmetric two-up, and/or cinematic horizontal crop.
- [ ] At least two sections after the hero are full bleed or near full bleed; the page is not one centered max-width column.
- [ ] The four fragrance worlds share a coherent photographic system while retaining distinct palettes:
  - Silent Storm: mineral blue-grey, wet rock, cold air.
  - The Sweetest Stranger: warm blush, silk, soft daylight.
  - Rebel in Velvet: oxblood, velvet, dark floral richness.
  - The Night Lingers: smoked amber, saffron, resin, dusk.
- [ ] Each fragrance name is visually attached to its campaign image and remains scannable without a paragraph.
- [ ] Images are edge-aligned to a consistent grid. Arbitrary offsets, overlapping ornamental cards, and decorative empty columns are absent.
- [ ] Product purchase details, if shown, remain subordinate: name, size or concentration, price, and one action only.
- [ ] There are no conventional product-card treatments: no rounded cards, card shadows, bordered tiles, feature icons, ratings, sale badges, or dense note lists.
- [ ] Ingredient still life appears as photography within the campaign world, not as floating cutouts or labeled ingredient chips.
- [ ] The footer begins only after a final strong media frame; the page does not taper into multiple small text modules.

## 4. Motion and interaction

- [ ] Motion supports looking at the images. Permitted effects are restrained crossfades, slow scale settles, clip reveals, and small image parallax.
- [ ] There is no animation on every line of text, word-by-word entrance, marquee copy, type scramble, cursor effect, particle system, scroll counter, or decorative loop.
- [ ] Image entrance duration is approximately **700–1200 ms** with smooth easing; hover transitions are **350–600 ms**.
- [ ] Scroll-linked movement never shifts media more than **6%** of its rendered dimension and never makes copy chase the viewport.
- [ ] Product hover/focus may reveal a second campaign frame or purchase action; it must not transform the section into an effects demo.
- [ ] Touch devices receive an explicit tap target and never depend on hover to expose a fragrance name or required action.
- [ ] `prefers-reduced-motion: reduce` disables autoplay-dependent storytelling, parallax, scrubbed motion, and animated transforms while keeping every image and action available.
- [ ] There is only one scroll system. Native touch scrolling remains stable, and no horizontal rail traps vertical scrolling.

## 5. Responsive behavior

- [ ] Mobile uses deliberate crops or mobile-specific sources; desktop 3:2 images are not blindly center-cropped to portrait when that removes the bottle or focal subject.
- [ ] The mobile homepage preserves the same image-first order and at least **75% media coverage**. It does not compensate for smaller screens with more text.
- [ ] On mobile, two-up media becomes either a deliberate stack or a swipeable rail with a visible next-frame cue. It never becomes tiny side-by-side thumbnails.
- [ ] Fragrance names and actions remain adjacent to the correct image after reflow.
- [ ] Navigation, logo, bottle labels, and actions maintain readable contrast across every crop without a large permanent gradient wash.
- [ ] No horizontal overflow appears at 320 px. No label, logo, bottle, face, or action is clipped at the listed review widths.
- [ ] Tap targets are at least **44 × 44 px** and keyboard focus is visible.
- [ ] Images declare dimensions or aspect ratios so the page does not jump as assets load.
- [ ] Below-the-fold media is lazy loaded; the hero poster is prioritized. The visual test must show the first frame without a blank flash.

## 6. VASA brand fidelity

- [ ] Approved VASA SVG/PNG artwork is used for the site logo. The wordmark is never recreated with a typeface.
- [ ] Campaign composites use the canonical VASA bottle geometry: rectangular glass body, correct shoulder and base proportions, wooden cap form, gold collar, label silhouette, fill line, and fragrance-specific liquid/label colour.
- [ ] The exact fragrance names are used everywhere: **Silent Storm**, **The Sweetest Stranger**, **Rebel in Velvet**, and **The Night Lingers**.
- [ ] Label text is readable and correctly oriented. Any generated label with malformed, vertical, misspelled, invented, or inconsistent typography is rejected or covered by an approved label composite.
- [ ] The bottle shares the scene's perspective, light direction, reflections, grain, contact shadow, and depth of field. It cannot look pasted onto a landscape or still life.
- [ ] All four campaign images feel like one house: comparable bottle scale, lens language, finish quality, and restraint.
- [ ] Brand colours come from the campaign media. Interface chrome stays neutral and does not add unrelated gradients or accent palettes.
- [ ] Claims about longevity, concentration, ingredients, family history, price, awards, or availability appear only when verified. The media-first pass does not invent proof points to fill space.
- [ ] The tone is sensory and assured. Generic luxury phrases, invented heritage, and explanatory brand prose are absent.

## 7. Accessibility and robustness

- [ ] Every meaningful image has concise alt text naming the fragrance and relevant visual context; decorative atmospheric layers use empty alt text.
- [ ] Video has an accessible label or equivalent nearby heading without placing visible campaign copy over it.
- [ ] Text and controls meet WCAG AA contrast in every media state.
- [ ] Header controls are usable with keyboard and screen reader; menu and overlays return focus correctly.
- [ ] The page still communicates the collection when JavaScript fails: images, fragrance names, and links remain visible.
- [ ] Missing media does not expose broken-image icons over the campaign surface.

## Review evidence required

- [ ] One full-page screenshot at 1440 × 900.
- [ ] One full-page screenshot at 390 × 844.
- [ ] Hero screenshots at both sizes showing zero campaign copy over the media.
- [ ] A short interaction capture or screenshots proving the primary media transition and its reduced-motion fallback.
- [ ] A rendered-area estimate confirming at least 75% pre-footer media coverage.
- [ ] A visible-word count confirming no more than 90 editorial words before the footer.
- [ ] A manual four-asset label review against approved VASA references.

## Fast rejection test

Reject the pass immediately if the first two viewports contain more words than images, if the hero contains a slogan, if the page presents a sequence of prose-led chapters, if the fragrances sit in generic ecommerce cards, or if any bottle/label is visibly inconsistent with VASA. A successful pass should still feel complete when read in this order: **film → image → image → image → image → footer**.
