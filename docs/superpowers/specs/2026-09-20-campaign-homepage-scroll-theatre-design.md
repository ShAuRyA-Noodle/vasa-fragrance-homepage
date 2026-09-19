# VASA Campaign Homepage Scroll Theatre Design

## Objective

Refine the deployed root campaign homepage into a quieter, more distinctive luxury fragrance experience. Remove the two weakest content layers from the live composition, improve the header and gifting details, replace generic product-reveal packshots, and introduce a new scroll-controlled fragrance installation immediately before “Four moods. One house.”

The Pinterest reference informs only the principle of layered motion around an anchored product. The implementation must not copy its fruit, soda, color-wipe, or scene-swap styling.

## Homepage Structure

The revised order is:

1. Transparent campaign film with no live overlay copy
2. “Your scent. Your signature.” collection grid
3. New two-fragrance scroll theatre
4. “Four moods. One house.” accordion gallery
5. Our Story campaign feature
6. VASA standard
7. Gifting
8. Footer

The existing hero copy and “Find what feels like you” carousel remain preserved as commented HTML blocks. Their supporting JavaScript must tolerate the sections being absent.

## Navigation

The navigation begins almost transparent over the hero, with a fine luminous border and restrained backdrop blur. After scrolling it becomes a slightly more opaque black glass surface with stronger blur, subtle saturation, and a soft internal highlight. Text and icons retain sufficient contrast against every hero frame.

“Art Story” becomes “Our Story” in desktop navigation, mobile navigation, footer navigation, buttons, panel titles, and labels. The existing `#art-story` anchor may remain to avoid breaking links.

## Collection Product Reveals

Each product card shows its current atmospheric landscape at rest. On hover or keyboard focus, the landscape dissolves completely and a contextual product composition appears. No white rectangle, visible cutout boundary, or isolated catalogue packshot may remain.

The four replacement images should be photographed or rendered as complete frames with the bottle integrated into a matching material world:

- Silent Storm: cold slate, blue-grey mist, cedar and wet mineral reflections
- Sweetest Stranger: muted blush plaster, pear skin, pale florals and soft side light
- Rebel in Velvet: oxblood velvet, almond shell, tuberose and restrained antique gold
- The Night Lingers: smoked amber glass, dark resin, saffron and warm black stone

The reveal uses opacity, shallow scale, and a restrained light pass. It does not use a bottom-up clip or a sticker-like foreground bottle.

## Scroll Theatre

The new section is a pinned, scroll-controlled fragrance installation using Silent Storm and Rebel in Velvet.

### Composition

A central product bottle sits inside an abstract bottle-shaped aperture built with CSS and SVG. The aperture is architectural rather than literal: a narrow neck, broad shoulders, and softened lower chamber. Large cropped ingredient and material layers extend beyond the viewport edges. Fine SVG contour lines respond to scroll progress and describe elevation, diffusion, and the path of scent.

The copy remains minimal:

- Silent Storm: “Still air. Electric ground.”
- Rebel in Velvet: “Softness, with a pulse.”
- Shared line: “Two expressions. One instinct.”

Verified supporting details may include fragrance family, 50 ml, and ingredient notes from the catalogue. No customer counts, satisfaction percentages, unverified concentration claims, or invented awards appear.

### Motion

The section occupies approximately 220–260vh with a 100svh sticky stage. Scroll progress controls one continuous transformation:

1. Silent Storm begins in a deep Himalayan blue-black environment.
2. The aperture draws itself and cool contour lines expand outward.
3. Mineral, cedar, mist and typographic layers move at different depths.
4. Around the midpoint, the bottle rotates only a few degrees while its glass tone and label cross-dissolve.
5. The palette warms through charcoal and aubergine into oxblood.
6. Velvet, almond and tuberose layers replace the cool materials through masked erosion and depth fades, without a flat screen wipe.
7. Rebel in Velvet resolves fully before the section releases into the existing mood gallery.

Desktop pointer movement may add a maximum 6–10px parallax response. Scroll remains the primary controller. Mobile uses the same sequence with fewer decorative layers and no pointer effect.

### Reduced Motion

With reduced motion enabled, the section becomes two static editorial panels with complete copy and product imagery. No pinning, continuous transforms, or animated SVG strokes run.

## Gifting Seal

The circular seal grows enough for its phrase to be readable on laptop and mobile. The curved copy uses a shorter phrase with wider tracking: “VASA · GIVEN WITH INTENTION · REMEMBERED WITH FEELING ·”. The central VASA mark remains optically centered. Its rotation is slow and stops under reduced motion.

## Visual System

The campaign keeps the existing black, Himalayan blue, oxblood, ivory, and antique-gold palette. SVG decoration uses one-pixel contours, interrupted arcs, scent-coordinate marks, and quiet botanical silhouettes. Effects remain sparse enough that the perfume and photography lead the composition.

Typography uses the existing display serif and restrained sans family. Large statements remain limited to one or two lines and must be checked for clipping at desktop, tablet, and mobile widths.

## Architecture

The new theatre receives its own focused module and styles rather than expanding the already crowded homepage script:

- `05-campaign/fragrance-theatre.js`: creates scroll choreography, pointer response, and reduced-motion fallback
- `05-campaign/style.css`: layout, palette, aperture, SVG, card-reveal, navigation, and gifting refinements
- `index.html` and `05-campaign/index.html`: synchronized markup changes
- `05-campaign/main.js`: safely skip the removed story carousel and initialize the theatre
- `public/media/campaign/`: new product reveal frames and any transparent decorative assets

Both root and `/05-campaign/` routes must remain equivalent because the root page currently duplicates the campaign markup.

## Validation

Validation covers:

- No JavaScript errors when hero copy and story carousel are absent
- No horizontal overflow from oversized art layers
- Product scenery is fully replaced on hover and keyboard focus
- Theatre reaches both completed scent states by scroll and releases correctly
- Reduced-motion mode avoids pinning and continuous motion
- Navigation contrast remains readable over the complete hero film
- “Our Story” appears everywhere the old label appeared
- Gifting seal text is readable at desktop and mobile sizes
- Desktop, tablet, and mobile layouts contain no clipped or overlapping text
- Production build succeeds before deployment
