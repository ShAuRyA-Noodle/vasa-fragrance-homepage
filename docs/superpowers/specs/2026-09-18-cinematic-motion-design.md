# VASA Cinematic Motion Design

## Goal

Transform the current VASA homepage from a static luxury layout into an expressive fragrance experience while preserving the existing commerce structure, campaign film, four products, and accessible controls.

## Brand system

The interface uses warm porcelain, carbon brown, antique gold, dried rose, mineral blue, and smoked plum. Large editorial headlines use the existing display face; navigation, labels, and commerce copy use the existing neutral sans. Navigation and labels gain a consistent 13–14 px laptop scale with restrained tracking. Small metadata remains subordinate but must not fall below 10 px on laptop.

## Logo interaction

The resting navbar shows the VASA mark alone. Hover or keyboard focus lifts the mark, reveals a thin gold line, and brings in the words “VASA Fragrance.” The interaction is contained within the existing navbar height and reverses smoothly. Reduced-motion users receive an immediate crossfade.

## Fragrance worlds

Each product card contains a product bottle and a full-bleed atmospheric image layer. On pointer hover or keyboard focus the atmosphere reveals through a diagonal clip, the bottle moves forward with subtle perspective, product metadata changes tone, and a large product index appears. Each fragrance has its own color grade and visual setting. On touch devices the scene remains partially visible so the design does not depend on hover.

## Scroll choreography

Section headings reveal by line. The story carousel gains slow image drift and depth. Product cards enter with alternating vertical offsets, then settle as the collection crosses the viewport. The campaign image and copy travel at different rates to create a restrained parallax composition. The fragrance-principles strip pins briefly on wide screens while each principle takes visual focus. Gifting uses a horizontal logo sweep and a soft tonal transition.

## Interaction language

Buttons use a sliding fill, arrows travel through the control, links receive a directional underline, and pointer-capable desktops get a small scent cursor label over fragrance imagery. All animation uses transforms, opacity, and clip paths. Motion stops in dialogs and honors `prefers-reduced-motion`.

## Responsive behavior

Desktop receives the full hover and pinned-scroll experience. Tablet keeps reveals and parallax with shorter distances. Mobile uses tap-safe cards, reduced movement, no custom cursor, no pinned section, and the existing still image instead of loading the hero video.

## Acceptance criteria

- Motion is immediately visible when entering and scrolling the page.
- The logo rest and hover states match the requested identity behavior.
- Laptop typography is readable and consistent.
- All four fragrance cards have distinct atmospheric reveals.
- There is no horizontal overflow at 1440, 768, 390, or 320 px.
- Carousel, bag, search, navigation, and dialogs remain usable with keyboard and touch.
- Reduced-motion mode removes nonessential movement while keeping content visible.

