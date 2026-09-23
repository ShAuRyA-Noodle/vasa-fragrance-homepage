# VASA — "Find Your Stranger" (Discover the Collection) — build spec

Folder: `08-homepage-variations/09-discover/`. Vite project root = `08-homepage-variations` (deps already: three ^0.186, gsap ^3.13, lenis). Run `npm run dev` there → `http://127.0.0.1:<port>/09-discover/`.

**Originality rule (hard):** reference was a competitor's quiz experience; we build the *genre* (immersive WebGL fragrance finder), never its code, assets, copy, names or exact layouts. All copy, poles, scene and compositions below are VASA-original. Do not fetch or reuse anything from dolcegabbana.com.

Quality bar: award-site level (Awwwards SOTD). 60fps desktop, graceful on mobile (390×844), `prefers-reduced-motion` honoured, no console errors.

## Brand
- Palette tokens: `--ink #0c0a09`, `--umber #1a1410`, `--velvet #2a1620` (plum-oxblood), `--gold #c8a86a`, `--gold-hi #ecd9a8`, `--cream #efe6d6`, `--mist #8a8f8c`.
- Product colours: silent-storm `#8faab5`, sweetest-stranger `#c99593`, rebel-in-velvet `#77556e`, the-night-lingers `#9f7044`.
- Fonts (already self-hosted, link `/fonts/fonts.css`): display `Cormorant Garamond` (300/400 italic for drama, wide caps tracking .18em for labels), UI `Manrope` (11–13px caps, tracking .22em).
- Logo: `/media/campaign/logo-gold.svg`, mark `/media/campaign/mark-gold.svg`.
- Feel: dark wood, velvet, smoke, amber light through a high window, dust motes. Tactile — grain, warm sheen, slow inertia. Gold is hairline-thin, never flat blocks.

## Products (source: 05-campaign/catalog.js)
| id | name | family | line | notes (open / heart / base) |
|---|---|---|---|---|
| silent-storm | Silent Storm | Fresh · Spicy · Woody | A memory that stayed. | Bergamot, pepper / Sichuan pepper, lavender, pink pepper, vetiver, patchouli, geranium, elemi / Cedar, labdanum |
| sweetest-stranger | Sweetest Stranger | Fruity · Floral · Soft | Some encounters stay. | Pear blossom, Italian mandarin, red berries / White gardenia, jasmine, frangipani / Patchouli, brown sugar |
| rebel-in-velvet | Rebel in Velvet | Amber · Floral · Creamy | Softness has a bold side. | Almond / Tuberose, jasmine sambac, Bulgarian rose / Tonka bean, cocoa |
| the-night-lingers | The Night Lingers | Amber · Woody · Smoky | The warmth that stays. | Oud wood / Benzoin, rose / Saffron, raspberry, incense |
Product page links: `/products/<id>/` (note: sweetest → `/products/sweetest-stranger/`).
Imagery: `/media/detail-<id>.webp`, `/media/hero-<id>.webp`, `/media/guide-<id>.webp` (file ids use `the-sweetest-stranger` for image names; page id `sweetest-stranger`).

## Journey (one page, state machine, hash routes `#intro #hub #q1 #q2 #q3 #result`)
0. **Loader** — black; VASA mark draws in gold (SVG stroke), two hairlines grow outward, counter 00→100 tied to real asset loading (textures). Exit: hairlines collapse, mark dissolves into light.
1. **Intro** — scene: single amber light shaft through smoke, motes. Copy (Cormorant, centered, word-by-word mask reveal): "Four strangers.<br>One of them already knows you." Sub (Manrope caps): "A scent is a memory you haven't met yet." Hint: "SCROLL OR HOLD TO ENTER" with a growing gold line; wheel/touch-drag/hold-press progresses a 0→1 value that drives the camera push-in (scrubbed, reversible until 1).
2. **Hub** — camera settles on the four VASA bottles standing on a dark-oak plinth, floor has soft wet reflection, smoke curls, shafts. Logo top-centre + "THE FOUR STRANGERS" caption. Two side doors (hairline frames, numbers): left `01 FIND YOUR STRANGER` (sub: Discover the collection) → q1; right `02 COMPOSE YOUR OWN` with a "COMING SOON" seal; clicking shows a whisper-modal ("The atelier opens soon. Leave your name at the door." + email field (local only, no network) + close). Hovering a bottle: it lifts slightly, rim-light brightens, name label follows cursor.
3. **Q1 — Temperament** "01 · I WANT MY SCENT TO FEEL". Horizontal gold track with 3 notches, draggable glass-gold orb (also keyboard ←/→, click notch). Poles left `HUSHED`, centre `POISED` (small, appears above centre notch), right `UNTAMED`. Orb snaps with elastic ease. Continuous drag value t∈[0,1] live-drives the scene mood: hushed = cool slate/blue-grey mist, pale shafts; untamed = ember/oxblood, warm dense smoke. Info "+" pill opens a 2-line tooltip explaining the choice. Hint under track: hand icon + "DRAG TO CHOOSE" (fades after first drag). NEXT enabled after first interaction.
4. **Q2 — Moment** "02 · IT BELONGS TO". Full-screen carousel, one moment at a time, big Cormorant caps title, prev/next round gold buttons + swipe/drag/arrow keys. Moments: `FIRST LIGHT`, `THE LONG AFTERNOON`, `GOLDEN HOUR`, `AFTER MIDNIGHT`. Each moment = scene mood + a cloud of 3D floating ingredient sprites drifting in depth with parallax and cursor repulsion (mapping below). Transition: sprites blow away sideways with velocity, new ones drift in; title letters stagger-swap.
5. **Q3 — Notes** "03 · CHOOSE UP TO THREE THAT DRAW YOU IN". A horizontal inertial ribbon of 12 tall cards (drag/wheel/touch; cards skew/tilt with velocity, image parallax inside card, slow auto-drift when idle). Card = ingredient image on dark, name in Manrope caps at top. Selecting: gold hairline frame draws around, number badge (1/2/3), tiny particle burst from card (DOM or scene). 4th click on a new card → shake + "Three is enough" toast. Selected chips list above NEXT. NEXT needs ≥1.
6. **Result** — "YOUR STRANGER IS". Scene: other bottles recede into dark, chosen bottle rises into the light shaft and slowly turns; mood = product colour. Big name (Cormorant light, letter mask reveal), family, line in italic, match % count-up, notes pyramid (Opening / Heart / Base) staggered, CTA `DISCOVER <NAME>` (→ product page) + ghost `START AGAIN`. Below: "THE OTHERS" — 3 small cards with their match %, clicking one swaps the focus bottle (scene.focusProduct).
Global UI: top-left hamburger (opens minimal overlay: Home `/`, Collection `/collection/`, Restart), top-centre logo (small after hub), top-right sound toggle (procedural WebAudio ambient pad: low drone + filtered noise "room tone", fades, off by default). Bottom centre on quiz: double-hairline bar with `BACK | NEXT` and step dots `01 02 03`. Page transitions between steps: 0.9–1.2s, text out (mask down) → scene mood tween → text in.

## Scoring (data.js)
Each product has weights. Score = Σ q1 + q2 + notes. Match% = round(60 + 39 * score/maxScore) for winner, others scaled same formula (so winner 90s, others 60–85).
- Q1 (value 0 hushed, .5 poised, 1 untamed; use snapped stop): hushed → silent-storm 3, sweetest 2; poised → sweetest 2, silent 1, rebel 2; untamed → night 3, rebel 2.
- Q2: first-light → silent 3, sweetest 1 · long-afternoon → sweetest 3, rebel 1 · golden-hour → rebel 3, night 1 · after-midnight → night 3, rebel 1.
- Notes (each selected note +2 to its product, +1 to secondary): bergamot→silent · lavender→silent · cedar→silent (night +1) · vetiver→silent · pear-blossom→sweetest · gardenia→sweetest · brown-sugar→sweetest (rebel +1) · almond→rebel · tuberose→rebel (sweetest +1) · tonka→rebel · oud→night · incense→night (silent +1). Tie-break order: q2 winner, then night, rebel, silent, sweetest.

## Note cards / ingredient sprites (assets)
Existing transparent PNG/WebP 2048² in `/media/campaign/scent-elements/`: `bergamot-peel`, `cedar-shavings-branch`, `vetiver-roots`, `almonds-open-shell`, `tuberose-flowers`, `tonka-beans-split-pod` (use `.webp`).
Missing (user will generate; same folder, same naming, `.webp`): `lavender-sprigs`, `pear-blossom-branch`, `gardenia-bloom`, `brown-sugar-crystals`, `oud-wood-chip`, `incense-resin-smoke`. Until they exist: code must check availability (HEAD/`Image.onerror`) and fall back gracefully (card: rich radial gradient in product colour + large italic initial; sprite: skip). So drop-in later = zero code change.
Moment → sprites: first-light: bergamot, vetiver, lavender · long-afternoon: pear-blossom, gardenia, tuberose · golden-hour: almond, tonka, brown-sugar · after-midnight: oud, incense, cedar.

## Module ownership & contract
Agent A owns `09-discover/scene/*` only. Agent B owns everything else in `09-discover/` + adds `discover` entry to `08-homepage-variations/vite.config.js` + a link in root `08-homepage-variations/index.html` variations list.

`scene/index.js` exports:
```js
export async function createScene(canvas, { onProgress, reducedMotion, isMobile }) // resolves when textures loaded; onProgress(0..1)
// returns api:
api.setStage(stage, opts)      // 'intro'|'hub'|'q1'|'q2'|'q3'|'result'; tweens camera+lights (~1.4s). opts.productId for 'result'
api.setIntroProgress(t)        // 0..1 scrubbed camera push-in during intro
api.setMood(mood, dur=1.2)     // mood = {bg:'#hex', fog:'#hex', light:'#hex', smoke:0..1, shaft:0..1, warmth:0..1}; tweened
api.moods                      // named presets: hushed, poised, untamed, firstLight, longAfternoon, goldenHour, afterMidnight, hub, intro, and per product id
api.blendMood(a, b, t)         // live lerp between two preset names (Q1 drag)
api.showSprites(names[], dir=1)// replace floating ingredient sprites (names = file stems); dir = blow-away direction
api.clearSprites()
api.burst(x, y, colorHex)      // screen-space particle burst (px coords)
api.focusProduct(id)           // result: raise chosen bottle, dim others
api.hoverProduct(id|null)
api.onProductHover(cb)         // cb(id|null, {x,y}) — scene raycasts bottles in hub
api.onProductClick(cb)
api.setQuality('high'|'low')
api.destroy()
```
Pointer: scene listens to window pointermove itself (parallax, smoke trail, sprite repulsion). DOM layer sits above canvas with `pointer-events:none` except interactive elements; scene raycast only active in `hub`/`result`.

## Scene art direction (Agent A)
- Renderer: WebGLRenderer, ACESFilmic, sRGB, DPR clamp 1.75 (1.25 mobile). Post: EffectComposer (three/addons) → UnrealBloom (subtle, threshold high) → custom final pass: film grain (animated), vignette, slight chromatic aberration at edges, warm lift. Low quality: skip bloom + CA.
- Background: fullscreen shader plane: fbm smoke (domain-warped), volumetric-looking god rays from a high window top-centre (radial blur of a light mask or analytic rays with noise), mood colours as uniforms. Cursor leaves a soft smoke-parting trail (ping-pong render target, decaying).
- Bottles (procedural, no external model): VASA 50ml flacon = rectangular thick-glass block, softly rounded edges (RoundedBoxGeometry), MeshPhysicalMaterial transmission ~1, thickness, ior 1.5, slight roughness; inner liquid box in product colour; cap = dark oak cylinder/block with wood-grain shader or procedural canvas texture + thin gold collar; front label = small gold-foil plate with "VASA" + name (CanvasTexture, Cormorant). Environment: PMREM from RoomEnvironment tinted warm for reflections.
- Plinth: dark oak slab with procedural grain (canvas-generated texture, anisotropic sheen), floor = MeshReflector-like (three/addons `Reflector`) blurred/dimmed or simple planar fake reflection.
- Particles: ~1500 dust motes (Points, custom shader, bokeh size by depth, drift + cursor swirl), gold glints occasional.
- Sprites: textured planes (alpha), depth 3 layers, slow rotation, bob, cursor repulsion, depth-of-field feel via per-layer blur (mipmap bias/opacity) — blow-away transitions.
- Camera: intro high & far in smoke → hub eye-level frontal (bottles fill ~45% width) → q steps drift up/away (bottles out of frame, abstract room) → result close on chosen bottle. Constant subtle mouse parallax (lerped).
- Performance: one draw loop, pause on `visibilitychange`, auto drop to low quality if avg frame > 22ms for 2s.
- Provide `scene/harness.html` to preview stages/moods standalone (buttons).

## Verify (both agents)
Playwright (MCP tools available) screenshots at 1440×900 and 390×844 per stage; zero console errors; `npm run build` passes.
