# Third-edition verification

- All three routes tested at 1440, 768, 390 and 320 px: 12 passing scenarios.
- Reduced-motion mode tested at 320 px.
- Menu opening, Escape closing and focus restoration.
- Search filtering, no-results state, correct fragrance detail, save/remove selection, persistence after reload.
- Rapid fragrance selection resolves to the latest requested fragrance.
- No horizontal overflow, broken section anchors or page JavaScript errors in those scenarios.
- All homepage image sources are the approved editorial set and use complete contain framing.
- Desktop/mobile hero and collection screenshots visually reviewed.
- Three distinct Maison chapter background colours observed in the browser. Four backdrop-blur layers confirmed. Menu/search screenshots reviewed.

Evidence is in `../qa/third-edition/validated-checks.json`, `motion-proof.json` and the accompanying screenshots. This validates the current homepage interactions, not real checkout or product performance claims. Alche-style 3D is a documented next direction and is not included in this revision.
