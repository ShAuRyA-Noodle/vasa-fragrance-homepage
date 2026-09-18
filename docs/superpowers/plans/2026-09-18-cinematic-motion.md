# VASA Cinematic Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an unmistakable, premium motion system and four interactive fragrance worlds to the current VASA homepage.

**Architecture:** Extend the existing vanilla HTML/CSS modules rather than replacing the page. Keep catalog data authoritative, isolate motion setup in a new module, and let CSS own visual states while GSAP and ScrollTrigger orchestrate timelines.

**Tech Stack:** Vite, vanilla JavaScript, CSS, GSAP, ScrollTrigger, SplitText, Lenis.

---

### Task 1: Identity and type system

**Files:**
- Modify: `05-campaign/index.html`
- Modify: `05-campaign/style.css`

- [ ] Replace the dual full-logo hover with a mark-to-wordmark reveal.
- [ ] Define brand color tokens and one laptop typography scale.
- [ ] Add focus-visible parity and reduced-motion behavior.
- [ ] Build and inspect the navbar at 1440, 768, and 390 px.

### Task 2: Four fragrance hover worlds

**Files:**
- Modify: `05-campaign/catalog.js`
- Modify: `05-campaign/main.js`
- Modify: `05-campaign/style.css`
- Create: `public/media/campaign/world-silent-storm.webp`
- Create: `public/media/campaign/world-sweetest-stranger.webp`
- Create: `public/media/campaign/world-rebel-in-velvet.webp`
- Create: `public/media/campaign/world-the-night-lingers.webp`

- [ ] Add an explicit world-image field to each catalog entry.
- [ ] Render the atmosphere, index, and interaction label inside every product card.
- [ ] Implement diagonal reveal, bottle depth, label movement, and keyboard states.
- [ ] Provide a stable, partially revealed mobile composition.

### Task 3: Scroll choreography

**Files:**
- Create: `05-campaign/experience.js`
- Modify: `05-campaign/main.js`
- Modify: `05-campaign/style.css`

- [ ] Build idempotent heading, product, campaign, craft, and gifting timelines.
- [ ] Add pointer-only scent cursor behavior over story and product imagery.
- [ ] Connect ScrollTrigger refresh to fonts and media readiness.
- [ ] Kill timelines and reset visibility under reduced motion.

### Task 4: Interaction polish

**Files:**
- Modify: `05-campaign/style.css`
- Modify: `05-campaign/main.js`

- [ ] Add sliding button fills, traveling arrows, and directional underlines.
- [ ] Add carousel image drift and staged text transitions.
- [ ] Pause ambient motion when a dialog is open or the page is hidden.

### Task 5: Verification

**Files:**
- Modify: `qa/verify-production.cjs`
- Create: `qa/campaign/motion-v2-1440.png`
- Create: `qa/campaign/motion-v2-390.png`

- [ ] Run `npm run build` and require a successful exit.
- [ ] Verify no horizontal overflow or console errors at 1440, 768, 390, and 320 px.
- [ ] Verify logo reveal, all four fragrance hover states, scroll movement, carousel controls, and mobile video suppression.
- [ ] Capture desktop and phone review images and reopen the updated localhost preview.

