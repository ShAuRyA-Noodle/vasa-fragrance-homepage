import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
gsap.registerPlugin(ScrollTrigger);
const products = {
  'silent-storm': {name:'Silent Storm',copy:'Still waters. A restless spirit. For the kind of confidence that never needs to announce itself.'},
  'the-night-lingers': {name:'The Night Lingers',copy:'One more conversation. One more song. An intimate companion for evenings you wish would last a little longer.'},
  'the-sweetest-stranger': {name:'The Sweetest Stranger',copy:'A chance encounter. An unexpected connection. For the days you leave a little room for possibility.'},
  'rebel-in-velvet': {name:'Rebel in Velvet',copy:'A soft touch. A strong point of view. For those who know that tenderness and defiance can belong together.'}
};
const dialog=document.querySelector('#product-dialog');
let previousFocus;
document.addEventListener('click',e=>{const button=e.target.closest('[data-product]');if(!button)return;const key=button.dataset.product,p=products[key];if(!p)return;previousFocus=button;document.querySelector('#dialog-title').textContent=p.name;document.querySelector('#dialog-description').textContent=p.copy;const im=document.querySelector('#dialog-image');im.src=`/media/detail-${key}.webp`;im.alt=`${p.name} perfume bottle`;dialog.showModal()});
for(const button of document.querySelectorAll('.dialog-close,.dialog-back'))button.addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>previousFocus?.focus({preventScroll:true}));
dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
document.querySelectorAll('[data-mood]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.mood,p=products[key];document.querySelectorAll('[data-mood]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button))});const image=document.querySelector('#mood-image');image.src=`/media/hero-${key}.webp`;image.alt=`${p.name} perfume`;document.querySelector('#mood-title').textContent=p.name;document.querySelector('#mood-copy').textContent=p.copy;document.querySelector('#mood-open').dataset.product=key;if(!matchMedia('(prefers-reduced-motion: reduce)').matches)gsap.fromTo('.result-image img',{opacity:.3,scale:1.025},{opacity:1,scale:1,duration:.55,ease:'power2.out'})}));
const mm=gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)',()=>{
 gsap.from('.hero h1>span',{y:38,opacity:.1,duration:1,stagger:.12,ease:'power3.out',clearProps:'all'});
 gsap.from('.hero-picture',{y:30,duration:1.1,ease:'power3.out',clearProps:'all'});
 gsap.utils.toArray('.manifesto h2,.anatomy-title h2,.principles h2,.closing h2').forEach(el=>gsap.from(el,{y:35,opacity:.25,duration:.9,ease:'power2.out',scrollTrigger:{trigger:el,start:'top 90%',once:true},clearProps:'all'}));
 const trace=document.querySelector('.trace'),length=trace.getTotalLength();gsap.set(trace,{strokeDasharray:length,strokeDashoffset:length});gsap.to(trace,{strokeDashoffset:0,ease:'none',scrollTrigger:{trigger:'.scent-map',start:'top 85%',end:'bottom 45%',scrub:1}});
});
mm.add('(min-width: 901px) and (prefers-reduced-motion: no-preference)',()=>{const strip=document.querySelector('.filmstrip');strip.classList.add('is-pinned');const distance=()=>Math.max(0,strip.scrollWidth-document.querySelector('.collection').clientWidth+innerWidth*.07);gsap.to(strip,{x:()=>-distance(),ease:'none',scrollTrigger:{trigger:'.collection',start:'top top',end:()=>`+=${distance()}`,pin:true,scrub:1,invalidateOnRefresh:true}});return()=>strip.classList.remove('is-pinned')});
mm.add('(min-width: 601px) and (max-width: 900px)',()=>{const strip=document.querySelector('.filmstrip');strip.style.width='100%';strip.style.overflowX='auto';strip.style.paddingBottom='15px';return()=>strip.removeAttribute('style')});
mm.add('(min-width: 901px) and (prefers-reduced-motion: reduce)',()=>{const strip=document.querySelector('.filmstrip');strip.style.width='100%';strip.style.overflowX='auto';return()=>strip.removeAttribute('style')});
window.addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});
