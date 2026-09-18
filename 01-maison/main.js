import {gsap,ScrollTrigger,SplitText,Flip,reduced,smoothScroll,revealType,progressLine,openMotion,drawPaths} from '../shared/motion.js';
const lenis=smoothScroll();
const menu=document.querySelector('.menu-toggle'),mobile=document.querySelector('#mobile-nav');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));mobile.hidden=!open;if(open&&!reduced.matches)gsap.fromTo('#mobile-nav a',{y:12,opacity:0},{y:0,opacity:1,stagger:.06,duration:.4});});
mobile.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{menu.setAttribute('aria-expanded','false');mobile.hidden=true;}));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){mobile.hidden=true;menu.setAttribute('aria-expanded','false');}});
const products=[['Silent Storm','silent-storm','A quiet presence. Stillness with a sense of depth; a world of cool colour and considered calm.'],['The Night Lingers','the-night-lingers','For the feeling of an evening you wish would last. Warm light, close company, and the beauty of staying a little longer.'],['The Sweetest Stranger','the-sweetest-stranger','An unexpected connection. An invitation to meet the unfamiliar with softness, curiosity, and an open heart.'],['Rebel in Velvet','rebel-in-velvet','Softness with an edge. A study in contrasts, for the days when you feel most like yourself.']];
const images=['/media/editorial/maison-hero.webp','/media/editorial/maison-craft.webp','/media/editorial/maison-stranger.webp','/media/editorial/maison-velvet.webp'];
const dialog=document.querySelector('dialog');
function openProduct(index){const p=products[index];document.querySelector('#dialog-title').textContent=p[0];document.querySelector('#dialog-description').textContent=p[2];const img=document.querySelector('#dialog-image');img.src=images[index];img.alt=`${p[0]} perfume bottle detail`;dialog.showModal();lenis?.stop();openMotion(dialog);}
document.querySelectorAll('[data-product]').forEach(b=>b.addEventListener('click',()=>openProduct(Number(b.dataset.product))));
document.querySelectorAll('.close-dialog,.close-second').forEach(b=>b.addEventListener('click',()=>dialog.close()));
dialog.addEventListener('close',()=>lenis?.start());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
const tones=['#d3d9c6','#c8ae96','#e0c3b9','#c8b9c7'];
document.querySelectorAll('[data-mood]').forEach(b=>b.addEventListener('click',()=>{
 const index=Number(b.dataset.mood),p=products[index];document.querySelectorAll('[data-mood]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
 const state=Flip.getState('.mood-result');document.querySelector('#mood-name').textContent=p[0];document.querySelector('#mood-discover').dataset.product=b.dataset.mood;
 const image=document.querySelector('#finder-image');image.src=images[index];image.alt=`${p[0]} perfume`;
 if(!reduced.matches){Flip.from(state,{duration:.6,ease:'power3.out',absolute:false});gsap.fromTo(image,{opacity:.2,y:12},{opacity:1,y:0,duration:.65});gsap.to('.finder',{'--mood-tone':tones[index],duration:.8});}
}));
document.querySelectorAll('.principles details').forEach(detail=>detail.addEventListener('toggle',()=>{if(detail.open){document.querySelectorAll('.principles details').forEach(other=>{if(other!==detail)other.open=false;});if(!reduced.matches)gsap.fromTo(detail.querySelector('p'),{opacity:0,y:10},{opacity:1,y:0,duration:.4});}ScrollTrigger.refresh();}));
document.fonts.ready.then(()=>{
gsap.matchMedia().add('(prefers-reduced-motion: no-preference)',()=>{
 progressLine();revealType('.hero h1',{hero:true});revealType('.opening h2,.wear-heading h2,.section-heading h2,.roots h2,.finder h2',{words:true});
 gsap.from('.hero-copy .eyebrow,.hero-description,.hero-copy .text-link',{y:20,opacity:0,stagger:.15,duration:1,delay:.2});
 gsap.from('.arched-image',{opacity:0,y:25,duration:1.3,ease:'power3.out'});
 gsap.to('.hero-halo',{xPercent:-8,scale:1.07,opacity:.6,duration:7,repeat:-1,yoyo:true,ease:'sine.inOut'});
 gsap.fromTo('.hero-visual .arched-image',{y:-12},{y:12,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.5}});
 drawPaths('.stem path,.wear-orbit path,.wear-orbit ellipse');
 gsap.to('body',{'--wash':'#d5bcae',ease:'none',scrollTrigger:{trigger:'.opening',start:'top 80%',end:'bottom 10%',scrub:1.3}});
 gsap.to('.wear-story',{'--chapter-tone':'#c4ccbb',ease:'none',scrollTrigger:{trigger:'.wear-story',start:'top 50%',end:'bottom 50%',scrub:1}});
 gsap.utils.toArray('.wear-chapters article').forEach((el,i)=>{gsap.fromTo(el,{opacity:.35,y:15},{opacity:1,y:0,ease:'none',scrollTrigger:{trigger:el,start:'top 85%',end:'top 40%',scrub:.7}});});
 gsap.utils.toArray('.product').forEach((card,i)=>{gsap.from(card.querySelector('.product-image'),{y:35,opacity:.35,duration:1,ease:'power3.out',scrollTrigger:{trigger:card,start:'top 88%'}});});
 gsap.from('.principles-title>*',{y:25,opacity:0,stagger:.1,duration:.85,scrollTrigger:{trigger:'.principles',start:'top 80%'}});
 gsap.fromTo('.roots-photo img',{y:-15},{y:15,ease:'none',scrollTrigger:{trigger:'.roots-photo',start:'top bottom',end:'bottom top',scrub:1.2}});
 gsap.to('.finder',{backgroundPosition:'100% 70%',duration:8,repeat:-1,yoyo:true,ease:'sine.inOut'});
 gsap.from('.footer-wordmark',{yPercent:10,opacity:.4,ease:'none',scrollTrigger:{trigger:'footer',start:'top bottom',end:'bottom bottom',scrub:1}});
});
addEventListener('load',()=>ScrollTrigger.refresh());

});
