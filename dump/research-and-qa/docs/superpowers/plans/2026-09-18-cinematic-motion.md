# VASA Cinematic Motion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [x]`) syntax for tracking.

**Goal:** Add an unmistakable, premium motion system and four interactive fragrance worlds to the current VASA homepage.

**Architecture:** Extend the existing vanilla HTML/CSS modules rather than replacing the page. Keep catalog data authoritative, isolate motion setup in a new module, and let CSS own visual states while GSAP and ScrollTrigger orchestrate timelines.

**Tech Stack:** Vite, vanilla JavaScript, CSS, GSAP, ScrollTrigger, SplitText, Lenis.

---

### Task 1: Identity and type system

**Files:**
- Modify: `05-campaign/index.html`
- Modify: `05-campaign/style.css`

- [x] Replace the dual full-logo hover with a mark-to-wordmark reveal.
- [x] Define brand color tokens and one laptop typography scale.
- [x] Add focus-visible parity and reduced-motion behavior.
- [x] Build and inspect the navbar at 1440, 768, and 390 px.

### Task 2: Four fragrance hover worlds

**Files:**
- Modify: `05-campaign/catalog.js`
- Modify: `05-campaign/main.js`
- Modify: `05-campaign/style.css`
- Create: `public/media/campaign/world-silent-storm.webp`
- Create: `public/media/campaign/world-sweetest-stranger.webp`
- Create: `public/media/campaign/world-rebel-in-velvet.webp`
- Create: `public/media/campaign/world-the-night-lingers.webp`

- [x] Add an explicit world-image field to each catalog entry.
- [x] Render the atmosphere, index, and interaction label inside every product card.
- [x] Implement diagonal reveal, bottle depth, label movement, and keyboard states.
- [x] Provide a stable, partially revealed mobile composition.

### Task 3: Scroll choreography

**Files:**
- Create: `05-campaign/experience.js`
- Modify: `05-campaign/main.js`
- Modify: `05-campaign/style.css`

- [x] Build idempotent heading, product, campaign, craft, and gifting timelines.
- [x] Add pointer-only scent cursor behavior over story and product imagery.
- [x] Connect ScrollTrigger refresh to fonts and media readiness.
- [x] Kill timelines and reset visibility under reduced motion.

### Task 4: Interaction polish

**Files:**
- Modify: `05-campaign/style.css`
- Modify: `05-campaign/main.js`

- [x] Add sliding button fills, traveling arrows, and directional underlines.
- [x] Add carousel image drift and staged text transitions.
- [x] Pause ambient motion when a dialog is open or the page is hidden.

### Task 5: Verification

**Files:**
- Modify: `qa/verify-production.cjs`
- Create: `qa/campaign/motion-v2-1440.png`
- Create: `qa/campaign/motion-v2-390.png`

- [x] Run `npm run build` and require a successful exit.
- [x] Verify no horizontal overflow or console errors at 1440, 768, 390, and 320 px.
- [x] Verify logo reveal, all four fragrance hover states, scroll movement, carousel controls, and mobile video suppression.
- [x] Capture desktop and phone review images and reopen the updated localhost preview.

