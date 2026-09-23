# VASA — third edition: what changed and why

## The main failure
The second edition treated photography as an exhibit: small framed images, a repeated sequence of statements, product tiles and accordions, and isolated entrance effects. It did not give the visitor a strong campaign followed by a useful path through the fragrances.

## Reference findings and implementation

| Reference | Useful finding | Applied here |
|---|---|---|
| Dior Sauvage | A campaign leads to a browsable fragrance family. Local navigation and product information remain clear. | Nocturne's campaign, direct fragrance selection and stable product action. |
| YSL Beauty | Campaign imagery, collection, house story and services share a consistent hierarchy. | Clear collection and house routes in the menu; product details across all directions. |
| Cartier | A recurring visual identity connects the campaign and house. | Journal's burgundy/champagne palette and contrasting editorial typography. |
| Billie Eilish store | Expressive campaign art sits above a dependable browsing structure. | Journal's expressive photography, with search and a stable saved selection. |
| Pinterest / Ormaie | Background, image and text move as a coordinated scene. | Maison's wear chapters change the entire scene from warm ivory to sage to deep green while the image remains intact. |
| Pinterest / Sandhill | Selecting a product changes the scene, not just a tiny thumbnail. | Fragrance selection changes image, title, active control and palette together. |
| React Bits Gradual Blur | Layered backdrop-filter masks soften the edge of a fixed header. | Original four-layer CSS blur, with a readable material and opaque fallback. |
| React Bits Staggered Menu | Panel and labels arrive on different beats. | Original GSAP fullscreen menu using native dialog semantics, focus return and Escape. |
| Smooth UI | Short materialising transitions help a panel feel connected to the triggering action. | Search and details enter with a short blur/translation; page choreography is slower. |
| Lenis | One scroll owner, integrated with the GSAP ticker. | Existing Lenis/ScrollTrigger bridge retained; dialogs stop scrolling. |
| Lusion | Bespoke 3D work depends on art direction and whole-scene choreography. | Directional reference, not a claim that these homepages reproduce Lusion's custom 3D production. |

No paid Skiper source, React Bits Pro source, or other brands' production photography has been copied. The new interactions are original vanilla JS/CSS implementations informed by documented public patterns. No React dependency was added solely to reproduce an effect.

## Three independent compositions
- **Maison:** daylight campaign; a fragrance index; a continuous story about concentration, strength and longevity; family knowledge; olive closing invitation.
- **Nocturne:** dark campaign; direct collection scenes; editorial portraits; wearing guide; family roots; a cinematic closing.
- **Journal:** burgundy editorial identity; mood-based discovery; collection studies; the house's four considerations; a typographic closing.

## Actual vs. proposed sitemap
`public/sitemap.xml` lists only the four implemented pages: direction selector and three homepage variations. Each homepage contains collection/house anchors; the menu, search, fragrance detail and saved edit are in-page interactions, not invented routes.

A future production sitemap should include: Home; All Fragrances; four product pages; Our House; Scent Guide; Journal; Search; Cart; Checkout; Shipping & Returns; Contact; Privacy; Terms. Gifting, refills, accounts and subscriptions should be included only if they are real offerings. This is proposed architecture, not a claim those pages have been built.

## Content that still needs the brand
Confirmed concentration percentages, wear-test results, sizes, prices, notes, delivery/returns, and real family archive material. The site does not invent these. The saved edit is a bookmark feature, not a simulated checkout. Existing generated photographs are campaign imagery, not documentary evidence of family history.

## Unresolved source names
“Offer flow”, “SKEU design” and “UI Unloven” were not identified confidently. “VSL/DOR” was provisionally interpreted as YSL/Dior; “Linux” as Lenis; “Lucian Co” as Lusion. These are stated assumptions, not verified equivalences. Exact links would let us incorporate the intended sources precisely.

## Research evidence
Detailed source observations and licenses are in:
- `../../07-research-and-docs/research/2026-09-18-redesign/motion-sources.md`
- `../../07-research-and-docs/research/2026-09-18-redesign/luxury-flows.md`
The Lusion browser capture remained on its loading screen; its official page/source information was inspected, but a completed interactive 3D session was not visually verified.
