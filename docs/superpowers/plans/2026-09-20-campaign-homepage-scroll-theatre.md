# Campaign Homepage Scroll Theatre Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine the deployed VASA root campaign homepage, remove the hero overlay and fragrance carousel from the live page, add four integrated product reveals, and insert an accessible two-fragrance scroll theatre before “Four moods. One house.”

**Architecture:** Preserve the duplicated root and `/05-campaign/` campaign entry points while keeping their markup synchronized. Isolate the long scroll animation in `05-campaign/fragrance-theatre.js`, reuse the existing GSAP/ScrollTrigger registration, and make `main.js` defensive when preserved sections are commented out. Use CSS/SVG composition and approved local imagery; reduced-motion users receive two static editorial panels.

**Tech Stack:** Semantic HTML, CSS, inline SVG, JavaScript modules, GSAP ScrollTrigger, Lenis, Vite, Playwright QA.

---

### Task 1: Preserve Removed Sections and Rename Our Story

**Files:**
- Modify: `index.html`
- Modify: `05-campaign/index.html`
- Modify: `05-campaign/main.js`
- Modify: `qa/campaign-motion-v2.cjs`

- [ ] **Step 1: Add failing structural assertions**

Assert that `.hero-copy`, `.hero-foot`, and `.stories` do not render; `#our-story` exists; and no visible “Art Story” text remains.

- [ ] **Step 2: Run the campaign test and confirm it fails**

Run `node qa/campaign-motion-v2.cjs`; expect the old hero title/story requirements or new structure assertions to fail.

- [ ] **Step 3: Comment preserved markup in both entry files**

Wrap the full `.hero-copy`/`.hero-foot` markup and full `.stories` section in named HTML comments. Remove the hero `aria-labelledby` reference. Rename the story anchor and visible labels atomically to `#our-story` and “Our Story.”

- [ ] **Step 4: Guard optional carousel and hero animation code**

Create `initStoryCarousel()` that returns immediately when `#story-slides` or `.story-stage` is missing. Check `#hero-title` before SplitText while always calling `initExperience()` and `ScrollTrigger.refresh()`.

- [ ] **Step 5: Run syntax and structural tests**

Run `node --check 05-campaign/main.js` and `node qa/campaign-motion-v2.cjs`; expect no missing-element page error.

### Task 2: Build the Transparent Glass Navigation and Enlarged Gift Seal

**Files:**
- Modify: `05-campaign/style.css`
- Modify: `index.html`
- Modify: `05-campaign/index.html`
- Modify: `05-campaign/bits-effects.js`

- [ ] **Step 1: Add computed-style assertions**

Check that the header is nearly transparent at the top, has a visible blur and stronger surface after scrolling, and remains sticky. Check the gift seal diameter and curved text size at desktop and mobile widths.

- [ ] **Step 2: Consolidate final navigation rules**

Set the base header to a very low-opacity black surface with a fine white border and minimal blur. Set `.scrolled` to a readable glass surface using `backdrop-filter: blur(24px) saturate(1.25)`, a subtle internal highlight, and a restrained shadow.

- [ ] **Step 3: Enlarge and simplify the gift seal**

Increase the seal to about 230px desktop, 190px tablet, and 150px mobile. Replace the curve phrase with `VASA · GIVEN WITH INTENTION · REMEMBERED WITH FEELING ·`, enlarge its SVG type, and keep its animation disabled under reduced motion.

- [ ] **Step 4: Verify responsive containment**

Run the campaign visual test at 1440, 768, and 390 pixels and confirm the seal remains inside `.gift-art` without covering its caption.

### Task 3: Create Four Integrated Product-Reveal Frames

**Files:**
- Create: `public/media/campaign/hover-silent-storm.webp`
- Create: `public/media/campaign/hover-sweetest-stranger.webp`
- Create: `public/media/campaign/hover-rebel-in-velvet.webp`
- Create: `public/media/campaign/hover-the-night-lingers.webp`
- Modify: `05-campaign/catalog.js`
- Modify: `05-campaign/main.js`
- Modify: `05-campaign/style.css`

- [ ] **Step 1: Produce four complete environmental composites**

Generate 1600×1840 opaque frames matching each existing world’s lighting and material palette. Keep full bottle geometry and label safe within the central 60% of each frame; avoid white backgrounds, isolated cutouts, or ingredient collages.

- [ ] **Step 2: Add `hoverImage` to every catalogue record**

Map each fragrance to its new `/media/campaign/hover-*.webp` file.

- [ ] **Step 3: Render the hover composition as a complete layer**

Replace the separate white-background `.product-bottle` markup with `.product-reveal`. At rest `.product-world` is visible. On hover/focus it fades fully to opacity zero while `.product-reveal` resolves with opacity, a 1.025-to-1 scale, and a restrained light pass.

- [ ] **Step 4: Verify interaction states**

Assert both image layers load, only the scenery is visible initially, the reveal becomes fully opaque on hover/focus, and no white surface or rectangular edge remains.

### Task 4: Add the Two-Fragrance Scroll Theatre

**Files:**
- Create: `05-campaign/fragrance-theatre.js`
- Modify: `index.html`
- Modify: `05-campaign/index.html`
- Modify: `05-campaign/main.js`
- Modify: `05-campaign/style.css`

- [ ] **Step 1: Add semantic theatre markup in both entries**

Insert `section#scent-theatre.product-theatre` immediately after `#collection` and before `.mood-gallery`. Include an accessible `h2`, Silent Storm and Rebel in Velvet articles, a sticky visual stage, an inline bottle-aperture SVG, contour paths with `vector-effect="non-scaling-stroke"`, and local world/product imagery.

- [ ] **Step 2: Build the static responsive composition**

Use a black foundation, Himalayan blue and oxblood CSS layers, an architectural bottle aperture, oversized cropped material layers, antique-gold linework, and short copy: “From mountain air to velvet dusk,” “Where stillness gathers,” and “Softness, with a pulse.”

- [ ] **Step 3: Implement `initFragranceTheatre()`**

Import `gsap`, `ScrollTrigger`, and `reduced` from `motion.js`. For normal motion create one scrubbed timeline pinned for roughly 260vh desktop/210vh mobile. Animate only transform, opacity, colors, clip shapes, and SVG dash offsets. Do not animate blur or introduce autonomous loops.

- [ ] **Step 4: Implement reduced-motion and mobile paths**

For reduced motion, skip ScrollTrigger and show two normal-flow editorial panels with all semantic copy visible. On mobile reduce line groups and decorative layers, remove pointer parallax, and keep both fragrance states readable.

- [ ] **Step 5: Initialize without coupling to hero animation**

Call `initFragranceTheatre()` after base content creation and outside the optional hero SplitText block.

### Task 5: Add SVG Detail and Pointer Restraint

**Files:**
- Modify: `index.html`
- Modify: `05-campaign/index.html`
- Modify: `05-campaign/fragrance-theatre.js`
- Modify: `05-campaign/style.css`

- [ ] **Step 1: Add declarative scent linework**

Use separate SVG groups for mountain contours, diffusion rings, bottle outline, velvet folds, and the gold seam. Mark decorative SVGs `aria-hidden="true"` and `focusable="false"`.

- [ ] **Step 2: Add bounded pointer depth on capable desktops**

On fine-pointer devices move only decorative layers by at most 10px using GSAP quick setters. Reset on pointer leave. Do not move semantic copy or product controls.

- [ ] **Step 3: Verify reduced-motion final states**

Ensure no semantic element remains hidden when reduced motion is active and SVG paths render fully drawn.

### Task 6: Validate Both Routes and Deploy

**Files:**
- Modify: `qa/campaign-motion-v2.cjs`
- Modify: `qa/campaign/refinement-visual.cjs`
- Create: `qa/campaign/route-parity.cjs`

- [ ] **Step 1: Add route parity coverage**

Load `/` and `/05-campaign/`, compare section order and critical labels, and assert `#collection < #scent-theatre < .mood-gallery` on both routes.

- [ ] **Step 2: Run campaign interaction and visual checks**

Test 1440, 768, 390, and 320 reduced-motion layouts. Confirm no page errors, broken images, clipped text, horizontal overflow, or trapped pin spacers.

- [ ] **Step 3: Run production verification**

Run `node --check 05-campaign/main.js`, `node --check 05-campaign/fragrance-theatre.js`, `git diff --check`, and `npm run build`. All must pass.

- [ ] **Step 4: Deploy to the existing production project**

Run `npx vercel deploy --prod --yes`, then request the production root URL and confirm HTTP 200 plus the new theatre markup.
