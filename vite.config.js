import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const page = (path) => resolve(import.meta.dirname, path, 'index.html');

// Feel Your Fragrance is a small client-routed app: its sub-routes serve its index.html
const feelRoutes = {
  name: 'feel-your-fragrance-routes',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      if (/^\/feel-your-fragrance\/(quiz(\/1)?|layering)\/?(\?.*)?$/.test(req.url)) req.url = '/feel-your-fragrance/index.html';
      next();
    });
  }
};

export default defineConfig({
  plugins: [feelRoutes],
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        collection: page('collection'),
        gifting: page('gifting'),
        ourStory: page('our-story'),
        // services: page('services'), // Services page retired; files kept in /services
        contact: page('contact'),
        feelYourFragrance: page('feel-your-fragrance'),
        buildYourFragrance: page('build-your-fragrance'),
        silentStorm: page('products/silent-storm'),
        sweetestStranger: page('products/sweetest-stranger'),
        rebelInVelvet: page('products/rebel-in-velvet'),
        theNightLingers: page('products/the-night-lingers'),
        bag: page('bag'),
        checkout: page('checkout'),
        legal: page('legal'),
      },
    },
  },
});
