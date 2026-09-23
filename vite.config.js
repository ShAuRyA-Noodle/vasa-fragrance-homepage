import { defineConfig } from 'vite';
import { resolve } from 'node:path';

const page = (path) => resolve(import.meta.dirname, path, 'index.html');

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        home: resolve(import.meta.dirname, 'index.html'),
        collection: page('collection'),
        gifting: page('gifting'),
        ourStory: page('our-story'),
        // services: page('services'), // Services page retired; files kept in /services
        contact: page('contact'),
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
