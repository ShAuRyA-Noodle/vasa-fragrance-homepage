import { defineConfig } from 'vite';
import { resolve } from 'node:path';
export default defineConfig({build:{rollupOptions:{input:{
 index:resolve(import.meta.dirname,'index.html'),
 preserved:resolve(import.meta.dirname,'00-preserved/index.html'),maison:resolve(import.meta.dirname,'01-maison/index.html'),nocturne:resolve(import.meta.dirname,'02-nocturne/index.html'),journal:resolve(import.meta.dirname,'03-journal/index.html'),campaign:resolve(import.meta.dirname,'05-campaign/index.html'),alchemy:resolve(import.meta.dirname,'04-alchemy/index.html'),himalayan:resolve(import.meta.dirname,'06-himalayan/index.html'),luxuryHouse:resolve(import.meta.dirname,'07-luxury-house/index.html'),mediaHouse:resolve(import.meta.dirname,'08-media-house/index.html'),
 collection:resolve(import.meta.dirname,'collection/index.html'),gifting:resolve(import.meta.dirname,'gifting/index.html'),ourStory:resolve(import.meta.dirname,'our-story/index.html'),services:resolve(import.meta.dirname,'services/index.html'),contact:resolve(import.meta.dirname,'contact/index.html'),
 silentStorm:resolve(import.meta.dirname,'products/silent-storm/index.html'),sweetestStranger:resolve(import.meta.dirname,'products/sweetest-stranger/index.html'),rebelInVelvet:resolve(import.meta.dirname,'products/rebel-in-velvet/index.html'),theNightLingers:resolve(import.meta.dirname,'products/the-night-lingers/index.html'),
 bag:resolve(import.meta.dirname,'bag/index.html'),checkout:resolve(import.meta.dirname,'checkout/index.html'),legal:resolve(import.meta.dirname,'legal/index.html')
}}}});
