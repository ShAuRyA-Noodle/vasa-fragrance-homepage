# VASA Alchemy — approved implementation

User approved the previously proposed Alche-inspired glass-V direction on 18 September 2026 and requested implementation with a complete homepage. All three earlier previews must be retained.

- Preserve a source ZIP, built ZIP, Git bundle and file hashes outside the app in `../10-preserved-previews/2026-09-18-before-alchemy/`.
- Add an independent Vite entry `04-alchemy/index.html`; keep previous page and shared source byte-for-byte unchanged.
- `hero-scene.js`: original beveled V geometry, Three.js physical transmission/refraction, local canvas lettering, studio environment, scroll-driven pose and colour, pointer response, pause and reduced-motion/WebGL fallbacks. Pause rendering out of view; clamp resolution on mobile.
- `index.html`, `style.css`, `main.js`: complete VASA homepage, shared search/menu/saved-edit interactions, an interactive four-fragrance collection, concentration/strength/longevity chapters, family expertise, ritual and footer. No invented performance figures, notes, prices or history.
- Use GSAP/ScrollTrigger and the existing single Lenis instance. Hero scroll scene hands off to the collection; all product photography remains fully contained.
- Verify real rendered WebGL, pointer/scroll changes, phone layout, reduced motion, disabled-WebGL fallback, search/menu/product selection and persistent edit. Check preservation hashes, build and deploy the exact source to the existing private site. Return only the new complete homepage preview link.

The complete new homepage is also the root entry. The previous root chooser is retained intact at `00-preserved/index.html`.
