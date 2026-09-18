import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
gsap.registerPlugin(ScrollTrigger);
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
let lenis;
if (!reduced.matches) { lenis = new Lenis({duration:1.15,anchors:true}); lenis.on('scroll',ScrollTrigger.update); gsap.ticker.add(time=>lenis.raf(time*1000)); gsap.ticker.lagSmoothing(0); }
const menu=document.querySelector('.menu-toggle'); const mobile=document.querySelector('#mobile-nav');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));mobile.hidden=!open;});
mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');mobile.hidden=true;}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){mobile.hidden=true;menu.setAttribute('aria-expanded','false');}});
const products=[['Silent Storm','silent-storm','A quiet presence. Stillness with a sense of depth; a world of cool colour and considered calm.'],['The Night Lingers','the-night-lingers','For the feeling of an evening you wish would last. Warm light, close company, and the beauty of staying a little longer.'],['The Sweetest Stranger','the-sweetest-stranger','An unexpected connection. An invitation to meet the unfamiliar with softness, curiosity, and an open heart.'],['Rebel in Velvet','rebel-in-velvet','Softness with an edge. A study in contrasts, for the days when you feel most like yourself.']];
const dialog=document.querySelector('dialog');
function openProduct(index){const p=products[index];document.querySelector('#dialog-title').textContent=p[0];document.querySelector('#dialog-description').textContent=p[2];const img=document.querySelector('#dialog-image');img.src=`/media/detail-${p[1]}.webp`;img.alt=`${p[0]} perfume bottle detail`;dialog.showModal();lenis?.stop();}
document.querySelectorAll('[data-product]').forEach(b=>b.addEventListener('click',()=>openProduct(Number(b.dataset.product))));
document.querySelectorAll('.close-dialog,.close-second').forEach(b=>b.addEventListener('click',()=>dialog.close()));
dialog.addEventListener('close',()=>lenis?.start());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.querySelectorAll('[data-mood]').forEach(b=>b.addEventListener('click',()=>{document.querySelectorAll('[data-mood]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));document.querySelector('#mood-name').textContent=products[Number(b.dataset.mood)][0];document.querySelector('#mood-discover').dataset.product=b.dataset.mood;if(!reduced.matches)gsap.fromTo('.mood-result',{opacity:0,y:8},{opacity:1,y:0,duration:.5});}));
document.querySelectorAll('.principles details').forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open)document.querySelectorAll('.principles details').forEach(other=>{if(other!==detail)other.open=false;});ScrollTrigger.refresh();}));
gsap.matchMedia().add('(prefers-reduced-motion: no-preference)',()=>{
 const hero=gsap.timeline({defaults:{ease:'power3.out'}});hero.from('.hero-copy .eyebrow,.hero h1,.hero-description,.hero-copy .text-link',{y:26,opacity:0,stagger:.13,duration:1.05}).from('.arched-image',{clipPath:'inset(20% 8% 0% 8% round 48% 48% 0 0)',opacity:0,duration:1.4},.12);

 gsap.from('.opening h2',{y:35,opacity:0,duration:1.2,scrollTrigger:{trigger:'.opening',start:'top 78%'}});
 const path=document.querySelector('.stem path');const length=path.getTotalLength();gsap.fromTo(path,{strokeDasharray:length,strokeDashoffset:length},{strokeDashoffset:0,duration:2,ease:'power2.inOut',scrollTrigger:{trigger:'.opening-bottom',start:'top 85%'}});
 gsap.utils.toArray('.product').forEach((card,i)=>{gsap.from(card.querySelector('.product-image'),{clipPath:'inset(12% 0% 12% 0%)',opacity:.4,duration:1.15,ease:'power2.out',scrollTrigger:{trigger:card,start:'top 87%'}});});
 gsap.from('.principles-title>*',{y:30,opacity:0,stagger:.12,duration:.85,scrollTrigger:{trigger:'.principles',start:'top 75%'}});
 gsap.from('.roots-copy>*',{y:25,opacity:0,stagger:.1,duration:.8,scrollTrigger:{trigger:'.roots-copy',start:'top 80%'}});
 gsap.fromTo('.roots-photo img',{scale:1.12,yPercent:-4},{scale:1,yPercent:0,ease:'none',scrollTrigger:{trigger:'.roots-photo',start:'top bottom',end:'bottom top',scrub:1}});
 gsap.from('.finder h2',{y:30,opacity:0,duration:1,scrollTrigger:{trigger:'.finder',start:'top 75%'}});
 gsap.from('.footer-wordmark',{yPercent:15,opacity:.35,ease:'none',scrollTrigger:{trigger:'footer',start:'top bottom',end:'bottom bottom',scrub:1}});
});
window.addEventListener('load',()=>ScrollTrigger.refresh());
