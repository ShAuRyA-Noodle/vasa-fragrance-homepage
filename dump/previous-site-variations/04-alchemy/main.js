import {gsap,ScrollTrigger,SplitText,reduced} from '../shared/motion.js';
import {initAtelier,fragrances} from '../shared/atelier-ui.js';
const atelier=initAtelier({theme:'light',collection:'#collection',house:'#house'});
document.querySelector('#footer-edit').onclick=atelier.edit;
if(reduced.matches)document.body.classList.add('hero-static');
let heroTimeline;
const fallback=()=>{document.querySelector('.hero-stage').dataset.renderer='fallback';heroTimeline?.kill();document.body.classList.add('hero-static');gsap.set('.hero-first',{clearProps:'all'});gsap.set('.hero-second',{autoAlpha:0});ScrollTrigger.refresh();};
document.addEventListener('vasa:hero-fallback',fallback);
// Load the 3D renderer separately so the readable homepage and controls appear first.
import('./hero-scene.js').then(async({createGlassHero})=>{
 const hero=await createGlassHero(document.querySelector('#glass-canvas'));
 if(reduced.matches||document.body.classList.contains('hero-static'))return;
 heroTimeline=gsap.timeline({scrollTrigger:{trigger:'.hero-journey',start:'top top',end:'bottom bottom',scrub:1.35,invalidateOnRefresh:true}});
 heroTimeline.to(hero.state,{progress:1,duration:1,ease:'none'},0)
 .to('.hero-first',{autoAlpha:0,y:-45,duration:.28,ease:'power1.inOut'},0)
 .fromTo('.hero-second',{autoAlpha:0,y:40},{autoAlpha:1,y:0,duration:.4,ease:'power2.out'},.28)
 .to('.hero-topline',{opacity:.35,duration:.5},.2)
 .to('.hero-progress i',{scaleX:1,duration:1,ease:'none'},0);
 ScrollTrigger.refresh();
}).catch(()=>fallback());

const photos=['maison-detail','nocturne-ritual','journal-stranger','journal-velvet'];
const tones=['#d8d3bf','#b8a184','#d8beb1','#c3aebd'];
const descriptions=[
 'Some things do not need to announce themselves. A quiet moment, made entirely your own.',
 'One more conversation. One more song. For the moments you are not quite ready to leave.',
 'A chance encounter. An unexpected connection. A little room for possibility.',
 'A soft touch. A strong point of view. Follow an instinct that is entirely your own.'
];
let request=0,selectionTimeline;
const photo=document.querySelector('#collection-photo');
const photoLoads=photos.map(name=>{const img=new Image();img.src=`/media/editorial/${name}.webp`;return img.decode().catch(()=>{});});
const choices=[...document.querySelectorAll('[data-scent]')];
async function choose(index){
 const token=++request;
 selectionTimeline?.kill();
 choices.forEach((b,n)=>b.setAttribute('aria-pressed',String(n===index)));
 const action=document.querySelector('#explore-selected');
 action.dataset.product=index;
 action.innerHTML=`Discover ${fragrances[index].name} <span>↗</span>`;
 document.querySelector('#scent-status').textContent=`Showing ${fragrances[index].name}`;
 photo.closest('.collection-visual').setAttribute('aria-busy','true');
 await photoLoads[index];if(token!==request)return;
 const update=()=>{
  if(token!==request)return;
  photo.src=`/media/editorial/${photos[index]}.webp`;photo.alt=`${fragrances[index].name}, complete VASA perfume bottle`;
  document.querySelector('#photo-mood').textContent=fragrances[index].mood.toUpperCase();
  document.querySelector('#photo-index').textContent=`0${index+1} / 04`;
  document.querySelector('#scent-description').textContent=descriptions[index];
  document.querySelector('.collection-visual').style.background=tones[index];
  photo.closest('.collection-visual').setAttribute('aria-busy','false');
 };
 if(reduced.matches){update();return;}
 selectionTimeline=gsap.timeline().to(photo,{opacity:0,y:-10,duration:.25}).add(update).fromTo(photo,{opacity:0,y:14},{opacity:1,y:0,duration:1.05,ease:'power3.out'});
}
choices.forEach((b,n)=>{b.onclick=()=>choose(n);b.onkeydown=e=>{if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key))return;e.preventDefault();const next=e.key==='Home'?0:e.key==='End'?3:(n+(e.key==='ArrowDown'?1:-1)+4)%4;choices[next].focus();choose(next);};});

if(!reduced.matches){
 document.fonts.ready.then(()=>{
  const heroWords=SplitText.create('#hero-title',{type:'words',aria:'auto',wordsClass:'motion-word'});
  gsap.from(heroWords.words,{opacity:0,y:20,filter:'blur(5px)',duration:1.5,stagger:.10,delay:.15,ease:'power3.out'});
  gsap.from('.hero-topline,.hero-invitation,.hero-bottom',{opacity:0,y:10,duration:1.35,stagger:.1,delay:.2});
  document.querySelectorAll('.section-heading h2,.wear-opening h2,.house>h2,.ritual-heading h2,.closing h2').forEach(el=>{
   const split=SplitText.create(el,{type:'words',wordsClass:'motion-word',aria:'auto'});
   gsap.from(split.words,{y:25,opacity:0,filter:'blur(4px)',duration:1.25,stagger:.065,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 88%',once:true}});
  });
  ScrollTrigger.refresh();
 });
 document.querySelectorAll('.wear-chapters article').forEach((article,n)=>{
  const tone=()=>{gsap.to('.wear',{backgroundColor:article.dataset.tone,color:article.dataset.ink,duration:1.4,ease:'power2.inOut',overwrite:true});gsap.to('.wear-dot',{attr:{cx:3+n*117},duration:1.3,ease:'power3.inOut'});};
  ScrollTrigger.create({trigger:article,start:'top 58%',end:'bottom 58%',onEnter:tone,onEnterBack:tone});
  gsap.from(article.children,{y:25,opacity:.1,duration:1.2,stagger:.13,scrollTrigger:{trigger:article,start:'top 82%',once:true}});
 });
 gsap.from('.house-copy',{y:35,opacity:0,duration:1.3,scrollTrigger:{trigger:'.house-copy',start:'top 84%',once:true}});
 gsap.from('.ritual-steps article',{y:25,opacity:0,duration:1.1,stagger:.13,scrollTrigger:{trigger:'.ritual-steps',start:'top 85%',once:true}});
 const media=gsap.matchMedia();
 media.add('(min-width:701px)',()=>gsap.fromTo('.night-copy',{y:30},{y:-30,ease:'none',scrollTrigger:{trigger:'.night',start:'top bottom',end:'bottom top',scrub:1.5}}));
}
