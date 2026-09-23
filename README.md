# VASA production website

The live VASA site is in this folder. Run `npm install` and `npm run dev` to work locally, or `npm run build` for the production output in `dist/`.

The homepage is `index.html`, with its active styles and scripts in `05-campaign/`. The other live pages are `collection/`, `gifting/`, `our-story/`, `services/`, `contact/`, `products/`, `bag/`, `checkout/`, and `legal/`. Shared code is in `shared/`; web-ready images, video and fonts are in `public/`. `vite.config.js` builds only these live pages.

Older site variations, research snapshots, QA captures, and the unfinished Discover draft are preserved in [`dump/`](dump/README.md). The wider brand source files and inspiration references are preserved in [`../dump/`](../dump/README.md). Do not use those archives as production routes without deliberately restoring them.
