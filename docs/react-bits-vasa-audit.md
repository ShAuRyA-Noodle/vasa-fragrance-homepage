# React Bits × VASA motion audit

Reference library: [React Bits](https://reactbits.dev/) and [DavidHDev/react-bits](https://github.com/DavidHDev/react-bits). The source repository was reviewed locally. Its patterns were translated into the existing VASA system instead of importing its full visual language or runtime.

| Pattern studied | Decision | VASA implementation | Why it belongs here |
|---|---|---|---|
| Text Loop | Applied | `SCENT / PRESENCE / MEMORY` cycles quietly at the foot of the hero | Adds a changing brand thought without competing with the film or headline |
| Masked Heading | Applied | The hero title opens through a horizontal mask while its lines rise into place | Gives the first frame a cinematic reveal and protects the headline from clipping |
| Particle Text | Applied | A responsive particle-built `VASA` wordmark closes the page | Creates one memorable digital signature at the footer, where visual intensity can peak |
| Curved Loop | Applied | Brand language travels around the gifting mark | Adds crafted motion to an otherwise static identity frame |
| Scroll Expand | Applied | The campaign photograph expands from an inset crop as it enters the viewport | Makes the editorial image feel revealed by scrolling without changing the page structure |
| Click Spark | Applied | Restrained antique-gold rays respond to button and link presses | Gives interaction feedback while remaining brief and lightweight |
| Accordion Gallery | Applied | Four fragrance worlds expand on hover or keyboard focus in the Olfactive Atlas | Turns the collection’s scenery into an exploratory moment before the product grid |
| Staggered Menu | Applied | Mobile menu entries arrive sequentially and carry ordered indices | Makes the utility drawer feel composed instead of appearing as a plain list |
| Gooey Nav | Adapted | Section-aware gold active states and animated underlines replace the full goo effect | Preserves wayfinding and polish without a playful liquid treatment that conflicts with luxury retail |
| Border Glow | Adapted | CTAs receive an antique-gold fill edge and a controlled light sweep | Adds depth to actions without neon or rainbow borders |
| Glass Icons | Adapted | Header utility icons gain a small blurred glass surface on hover/focus | Gives search, bag and profile controls an Apple-like tactile response |
| Spotlight Card | Applied | Product and gallery surfaces use a cursor-positioned warm light | Makes pointer movement visible while keeping the imagery intact |
| Blur Text / Fade Content | Adapted | Existing headings, gallery panels and panel results use separate reveal rhythms | Retains one motion system and avoids stacking several text libraries on the same words |
| Topography | Applied | Low-contrast moving contour lines sit behind the footer | Adds atmosphere only where the dark palette can carry it cleanly |
| Fluid Glass, Molten Metal, Tilted Card, Scroll Stack | Rejected | No implementation | Fluid and molten surfaces fight the white/black/antique-gold brand kit; tilted cards break the symmetric grid; scroll stacking adds excessive empty travel |

## Motion rules used

- One principal effect per section; supporting hover feedback stays short.
- Motion uses transforms, opacity, clipping or canvas drawing to avoid layout thrashing.
- Desktop hover interactions have keyboard equivalents.
- Mobile keeps the gallery symmetric and avoids hover-dependent bottle reveals.
- `prefers-reduced-motion` removes loops, spark effects and animated transitions while preserving all content.
- The palette stays within white, warm ivory, neutral black and antique gold.
