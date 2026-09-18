import {gsap,ScrollTrigger,Flip,reduced,smoothScroll,revealType,progressLine,openMotion} from '../shared/motion.js';
import {MotionPathPlugin} from 'gsap/MotionPathPlugin';
gsap.registerPlugin(MotionPathPlugin);
const lenis=smoothScroll();
const products={
'silent-storm':{name:'Silent Storm',copy:'Still waters. A restless spirit. For the kind of confidence that never needs to announce itself.'},
 'the-night-lingers':{name:'The Night Lingers',copy:'One more conversation. One more song. An intimate companion for evenings you wish would last a little longer.'},
 'the-sweetest-stranger':{name:'The Sweetest Stranger',copy:'A chance encounter. An unexpected connection. For the days you leave a little room for possibility.'},
 'rebel-in-velvet':{name:'Rebel in Velvet',copy:'A soft touch. A strong point of view. For those who know that tenderness and defiance can belong together.'}};
const images={'silent-storm':'/media/editorial/journal-storm.webp','the-night-lingers':'/media/editorial/nocturne-hero.webp','the-sweetest-stranger':'/media/editorial/journal-stranger.webp','rebel-in-velvet':'/media/editorial/journal-velvet.webp'};
const dialog=document.querySelector('#product-dialog');let previousFocus;
document.addEventListener('click',e=>{const button=e.target.closest('[data-product]');if(!button)return;const key=button.dataset.product,p=products[key];if(!p)return;previousFocus=button;document.querySelector('#dialog-title').textContent=p.name;document.querySelector('#dialog-description').textContent=p.copy;const im=document.querySelector('#dialog-image');im.src=images[key];im.alt=`${p.name} perfume bottle`;dialog.showModal();lenis?.stop();openMotion(dialog);});
document.querySelectorAll('.dialog-close,.dialog-back').forEach(b=>b.addEventListener('click',()=>dialog.close()));dialog.addEventListener('close',()=>{lenis?.start();previousFocus?.focus({preventScroll:true});});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.querySelectorAll('[data-mood]').forEach(button=>button.addEventListener('click',()=>{const key=button.dataset.mood,p=products[key];const state=Flip.getState('.result-info');document.querySelectorAll('[data-mood]').forEach(b=>{b.classList.toggle('active',b===button);b.setAttribute('aria-pressed',String(b===button));});const image=document.querySelector('#mood-image');image.src=images[key];image.alt=`${p.name} perfume`;document.querySelector('#mood-title').textContent=p.name;document.querySelector('#mood-copy').textContent=p.copy;document.querySelector('#mood-open').dataset.product=key;if(!reduced.matches){gsap.fromTo(image,{opacity:.2,y:15},{opacity:1,y:0,duration:.65,ease:'power2.out'});Flip.from(state,{duration:.6,ease:'power2.out'});}}));
const cards=[...document.querySelectorAll('.filmstrip .product')],tones=['#283b37','#423025','#55404b','#3e2b49'];let current=0,galleryTrigger;
cards.forEach((c,i)=>{c.inert=i!==0;c.setAttribute('aria-hidden',String(i!==0));});
function showSlide(index){if(index===current)return;const old=cards[current],next=cards[index];current=index;cards.forEach((c,i)=>{c.inert=i!==index;c.setAttribute('aria-hidden',String(i!==index));});document.querySelector('#gallery-index').textContent=String(index+1).padStart(2,'0');gsap.killTweensOf(cards);if(reduced.matches){gsap.set(cards,{autoAlpha:0,pointerEvents:'none'});gsap.set(next,{autoAlpha:1,pointerEvents:'auto'});}else{gsap.to(old,{autoAlpha:0,y:-12,duration:.35,pointerEvents:'none'});gsap.fromTo(next,{autoAlpha:0,y:18},{autoAlpha:1,y:0,pointerEvents:'auto',duration:.7,ease:'power3.out',delay:.1});gsap.to('.collection',{'--gallery-tone':tones[index],duration:1});}gsap.to('.gallery-track span',{xPercent:index*100,duration:reduced.matches?0:.7,ease:'power3.out'});}
function navigate(delta){const next=(current+delta+cards.length)%cards.length;if(galleryTrigger){const target=galleryTrigger.start+(galleryTrigger.end-galleryTrigger.start)*((next+.5)/4);if(lenis)lenis.scrollTo(target,{duration:1.05});else scrollTo(0,target);}else showSlide(next);}
document.querySelector('#gallery-next').addEventListener('click',()=>navigate(1));document.querySelector('#gallery-prev').addEventListener('click',()=>navigate(-1));document.querySelector('.gallery-navigation').addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();navigate(e.key==='ArrowRight'?1:-1);}});
document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>ScrollTrigger.refresh()));
document.fonts.ready.then(()=>{
const mm=gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)',()=>{
 progressLine();revealType('.hero h1',{hero:true});revealType('.manifesto h2,.anatomy-title h2,.principles h2,.closing h2',{words:true});
 gsap.from('.hero-picture',{y:20,opacity:0,duration:1.25,ease:'power3.out'});
 gsap.fromTo('.hero-picture img',{y:-10},{y:10,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.2}});
 gsap.from('.journal-edition',{rotation:-4,y:20,opacity:.2,duration:1,scrollTrigger:{trigger:'.manifesto',start:'top 85%'}});
 const trace=document.querySelector('.trace');gsap.from(trace,{drawSVG:'0%',ease:'none',scrollTrigger:{trigger:'.scent-map',start:'top 85%',end:'bottom 35%',scrub:1}});
 const dot=document.querySelector('.scent-dot');gsap.set(dot,{autoAlpha:1});gsap.to(dot,{motionPath:{path:trace,align:trace,alignOrigin:[.5,.5]},ease:'none',scrollTrigger:{trigger:'.scent-map',start:'top 85%',end:'bottom 35%',scrub:1}});
 gsap.from('.scent-stages>div',{y:20,opacity:.3,stagger:.15,duration:.8,scrollTrigger:{trigger:'.scent-stages',start:'top 88%'}});
 gsap.to('.explorer',{'--editorial-tone':'#c3aabf',ease:'none',scrollTrigger:{trigger:'.explorer',start:'top 85%',end:'bottom 15%',scrub:1.3}});
 gsap.fromTo('.principle-intro img',{y:-15},{y:15,ease:'none',scrollTrigger:{trigger:'.principles',start:'top bottom',end:'bottom top',scrub:1.1}});
});
mm.add('(min-width:1000px) and (min-height:760px) and (prefers-reduced-motion:no-preference)',()=>{galleryTrigger=ScrollTrigger.create({trigger:'.collection',start:'top top',end:'+=1700',pin:true,anticipatePin:1,onUpdate:self=>showSlide(Math.min(3,Math.floor(self.progress*4))),invalidateOnRefresh:true});return()=>{galleryTrigger=null;};});
addEventListener('load',()=>ScrollTrigger.refresh(),{once:true});

});
