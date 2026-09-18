# VASA — Three homepage directions

Three independent, responsive homepage concepts. All three differentiate around concentration, longevity, strength and family expertise. No original website screenshot or vasa-original.webp is used.

## Open locally

Run `npm install`, then `npm run dev`. Open the address printed by Vite. The direction selector is at `/`.

- `/01-maison/`: Maison — warm ivory/olive, local Cormorant Garamond + Manrope, full-frame atelier photography, staggered editorial collection and family narrative.
- `/02-nocturne/`: Nocturne — dark full-bleed campaign, oversized sans, full-frame fragrance crossfades, pinned immersive collection and restrained copper details.
- `/03-journal/`: Journal — champagne/aubergine editorial, Manrope and Bodoni Moda, full-frame fragrance portraits, scroll-directed scene changes, SVG scent story and mood index.

Run `npm run build` for the static production output in `dist`. Serve that directory with a web server; opening source HTML directly from disk will not resolve module imports.

## Motion and reference interpretation

| Reference family | Interpretation in the prototypes |
| --- | --- |
| Ormaie organic framing and chapter composition | Maison architectural reveal, image masks, staggered still lifes and parallax |
| Sandhill circular scene changes | Nocturne's four-fragrance full-frame crossfade synchronized with text and controls |
| Idôle large type and product journey | Journal's typographic hero and desktop scroll-directed fragrance portraits |
| Tom Ford editorial framing and image rhythm | Maison's paper tone and editorial pacing; Journal's framed imagery |
| GSAP Core / Scroll / SVG / UI / Text | Timelines, ScrollTrigger scenes, SVG path drawing, selection/dialog transitions and staggered typography |

References are interpreted, not replicated pixel-for-pixel. No brand campaign footage, fabricated loading sequence or persistent liquid distortion is included. Supplied still photography remains clear and identifiable. Native mobile scrolling, normal document flow for reduced motion, keyboard-accessible controls and dismissible dialogs are prioritized. All three use Lenis integrated with the GSAP ticker. Journal changes between complete fragrance portraits rather than cutting off images in a horizontal strip.

## Locally installed and archived

- GSAP 3.15.0, including the package's plugins (only used modules bundled).
- Lenis 1.3.26, Vite 6.4.3; exact dependency resolution in package-lock.json.
- Official GSAP source cloned to `reference-library/gsap-source`.
- All six supplied GSAP web pages saved as source HTML; URL/byte manifest in `reference-library/manifest.json`. These are research snapshots, not complete offline mirrors of remote interactive demos.
- Official Lenis README and homepage archived alongside them.
- Relevant pre-existing design skills copied project-locally to `.agents/skills` and readable reference copies to `reference-library/skills`. The GSAP URLs themselves are documentation/software, not installable skills.
- Local fonts and their OFL licenses in `public/fonts`; no runtime font CDN.
- All page imagery served locally from `public/media` (15 new optimized editorial photographs generated from the supplied bottle references).

The complete earlier 16-link analysis and Pinterest animation evidence remain in `../07-research-and-docs/research/reference-study-2026-09-18/`, including `VASA-Visual-Research.html` and `VASA-Reference-Study-and-Experience-Plan.md`.

## Content boundaries

Homepage discovery only: buttons explore scents, choose moods, open product stories or navigate to sections. No checkout, fake purchase, fabricated testimonials or mailing-list submission. Mood language is editorial; it does not assert an ingredient formula. Concentration percentages, wear-hour guarantees, prices, founder names, dates and number of generations await verified brand details. Existing imagery is generated product photography, not a historical family archive. The lowercase text wordmark is provisional typography, not the excluded original screenshot.

Potential future imagery: actual family/craft photographs would make the heritage story more specific. They are not required for these current concepts and no substitute archival claim is made.

## Second edition — September 18, 2026

One Terra image agent generated 15 photographs using the built-in image tool. Originals and prompts are preserved in ../09-new-photography. Delivery copies are public/media/editorial/*.webp. No image is creatively cropped or zoomed: object-fit:contain and full-frame stages preserve the source composition. Parallax moves the stage within reserved margins. All three pages have removed the previous honey/leaf ritual image.

Maison adds an illustrated composition/presence/time sequence, natural atelier photography, warm evolving colour washes, a photographic scent finder, SplitText word/character entrances, DrawSVG line reveals and Flip layout transitions. Nocturne adds restrained multi-layer parallax, crossfading complete fragrance portraits with matching ambient colour, a two-image evening composition and a new contemporary scent-blotter ritual photograph. Journal moves to champagne/plum, local Bodoni Moda typography, full-frame scroll-controlled scent portraits with keyboard controls, MotionPath/DrawSVG scent progression and a shifting mood backdrop.

The images are generated editorial campaign concepts, not documentary photographs of actual founders or a historical family archive. Photorealism was the visual target, not a claim of camera provenance.
