# VASA Himalayan Edition — Design Specification

## Direction

The new standalone homepage turns the existing Himalayan campaign film into an editorial fragrance world. It uses Himalayan blue, oxblood, near-black and warm ivory, with oversized Manrope typography and Bodoni Moda italic accents. The design follows the supplied nine-page visual direction without copying its generated bottle or model imagery.

## Page structure

1. Cinematic contained hero film with quiet navigation and masked type.
2. Brand manifesto using large sans/italic contrast.
3. Four-fragrance editorial collection with controlled hover reveals.
4. Dark three-step wearing ritual.
5. Oxblood discovery-set chapter.
6. Interactive fragrance finder with one active atmosphere.
7. Family-expertise and longevity proof chapter.
8. Gifting chapter and restrained oversized footer.

## Motion

Motion is slow and deliberate: a short loader, masked headline reveals, image scale settling, one horizontal collection sequence, soft section color transitions and tactile button/row states. GSAP handles scroll choreography; CSS handles local hover states. Every experience has a reduced-motion fallback.

## Typography and safety

The implementation uses local OFL-licensed Manrope and Bodoni Moda font files. Fluid type scales, generous line boxes, safe italic padding and breakpoint-specific layouts prevent clipping. Product and campaign bottle images use `object-fit: contain`; the hero film is also contained against its own blue-black environment so no source frame is cut.

## Responsive behavior

Desktop uses a 12-column editorial grid. Tablet collapses to 8 columns. Mobile becomes a single readable flow with horizontal, scroll-snapped fragrance cards. No interaction depends on hover, and all controls remain keyboard accessible.
