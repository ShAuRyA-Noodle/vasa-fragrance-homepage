import {gsap,ScrollTrigger,reduced,smoothScroll,revealType,progressLine,openMotion} from '../shared/motion.js';
const lenis=smoothScroll();
const scents=[
{name:'Silent Storm',title:'Silent<br>Storm',slug:'silent-storm',mood:'Quiet. Composed. Unexpected.',description:'Stillness with something stirring beneath. For a presence that doesn’t need to raise its voice.',tone:'#182a29'},
{name:'The Night Lingers',title:'The Night<br>Lingers',slug:'the-night-lingers',mood:'Warm. Magnetic. After dark.',description:'For evenings you don’t want to end. A mood that stays with you, even as the world slips away.',tone:'#30231e'},
{name:'The Sweetest Stranger',title:'The Sweetest<br>Stranger',slug:'the-sweetest-stranger',mood:'Tender. Intriguing. Unfamiliar.',description:'A passing encounter, an unexpected connection. For the part of you that still believes in possibility.',tone:'#352027'},
{name:'Rebel in Velvet',title:'Rebel in<br>Velvet',slug:'rebel-in-velvet',mood:'Soft edges. Strong instincts.',description:'A little contradiction is a beautiful thing. For softness with conviction, and a spirit that follows its own lead.',tone:'#292034'}];
let current=1,request=0;
const photo=document.querySelector('#scent-photo'),wipe=document.querySelector('#scent-wipe'),controls=[...document.querySelectorAll('[data-scent]')];
const sceneSources={'silent-storm':'/media/editorial/nocturne-silent.webp','the-night-lingers':'/media/editorial/nocturne-hero.webp','the-sweetest-stranger':'/media/editorial/nocturne-stranger.webp','rebel-in-velvet':'/media/editorial/nocturne-velvet.webp'};
async function selectScent(index){
 const version=++request,scent=scents[index];current=index;
 controls.forEach((button,i)=>{button.classList.toggle('active',i===index);button.setAttribute('aria-pressed',String(i===index));});
 document.querySelector('#scent-title').innerHTML=scent.title;document.querySelector('#scent-mood').textContent=scent.mood;document.querySelector('#scent-description').textContent=scent.description;
 const source=sceneSources[scent.slug],preload=new Image();preload.src=source;await preload.decode().catch(()=>{});if(version!==request)return;
 gsap.killTweensOf(wipe);wipe.src=source;
 const finish=()=>{photo.src=source;photo.alt=`${scent.name} VASA fragrance`;gsap.set(wipe,{opacity:0,y:0});};
 if(reduced.matches){finish();return;}
 gsap.fromTo(wipe,{opacity:0,y:12},{opacity:1,y:0,duration:.9,ease:'power2.inOut',onComplete:finish});
 gsap.fromTo('.scent-copy',{y:14,opacity:.2},{y:0,opacity:1,duration:.7,ease:'power3.out'});
 gsap.to('.collection',{'--scene':scent.tone,duration:1.1,ease:'sine.inOut'});
}
controls.forEach(button=>button.addEventListener('click',()=>selectScent(Number(button.dataset.scent))));
const dialog=document.querySelector('#scent-dialog');
document.querySelector('#scent-detail').addEventListener('click',()=>{const scent=scents[current];document.querySelector('#dialog-title').textContent=scent.name;document.querySelector('#dialog-description').textContent=scent.description;document.querySelector('#dialog-image').src=sceneSources[scent.slug];document.querySelector('#dialog-image').alt=`${scent.name} bottle`;dialog.showModal();lenis?.stop();openMotion(dialog);});
document.querySelectorAll('.dialog-close,.dialog-back').forEach(b=>b.addEventListener('click',()=>dialog.close()));dialog.addEventListener('close',()=>lenis?.start());dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
document.querySelectorAll('details').forEach(d=>d.addEventListener('toggle',()=>{if(d.open&&!reduced.matches)gsap.fromTo(d.querySelector('p'),{opacity:0,y:10},{opacity:1,y:0,duration:.4});ScrollTrigger.refresh();}));
document.fonts.ready.then(()=>{
const mm=gsap.matchMedia();
mm.add('(prefers-reduced-motion: no-preference)',()=>{
 progressLine();revealType('.hero h1',{hero:true});revealType('.manifesto h2,.interlude h2,.expertise h2,.ritual h2',{words:true});
 gsap.from('.hero-top,.hero-copy>.eyebrow,.hero-bottom',{y:20,opacity:0,duration:1,stagger:.12,delay:.25});
 gsap.from('.hero-image',{opacity:.15,y:18,duration:1.7,ease:'power2.out'});
 gsap.fromTo('.hero-image img',{y:-18},{y:18,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1.6}});
 gsap.to('.hero-ambient',{opacity:.45,duration:6,repeat:-1,yoyo:true,ease:'sine.inOut'});
 gsap.fromTo('.night-diptych figure:first-child',{y:18},{y:-18,ease:'none',scrollTrigger:{trigger:'.night-diptych',start:'top bottom',end:'bottom top',scrub:1.4}});
 gsap.fromTo('.night-diptych figure:last-child',{y:-10},{y:25,ease:'none',scrollTrigger:{trigger:'.night-diptych',start:'top bottom',end:'bottom top',scrub:1.4}});
 gsap.to('.interlude',{'--night-tone':'#4e2937',ease:'none',scrollTrigger:{trigger:'.interlude',start:'top 90%',end:'bottom 20%',scrub:1}});
 gsap.from('.pillars details',{y:25,opacity:.3,stagger:.1,duration:.8,scrollTrigger:{trigger:'.pillars',start:'top 85%'}});
 gsap.fromTo('.ritual-photo img',{y:-15},{y:15,ease:'none',scrollTrigger:{trigger:'.ritual',start:'top bottom',end:'bottom top',scrub:1.4}});
 gsap.from('.closing-link',{y:35,opacity:.4,duration:1,scrollTrigger:{trigger:'.closing',start:'top 85%'}});
});
mm.add('(min-width:1024px) and (prefers-reduced-motion:no-preference)',()=>{
 const timeline=gsap.timeline({scrollTrigger:{trigger:'.collection',start:'top top',end:'+=35%',pin:true,scrub:1,invalidateOnRefresh:true}});
 timeline.fromTo('.collection-photo',{y:-20},{y:20,ease:'none'},0).fromTo('.collection-aura',{opacity:.4},{opacity:1,ease:'none'},0);
});
addEventListener('load',()=>ScrollTrigger.refresh());

});
