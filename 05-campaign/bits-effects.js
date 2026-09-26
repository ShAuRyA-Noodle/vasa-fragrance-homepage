import {gsap,ScrollTrigger,reduced} from './motion.js';
import {initFooterEffects} from '../shared/footer-effects.js';

const finePointer=matchMedia('(hover:hover) and (pointer:fine)');

function initWordLoop(){
 const root=document.querySelector('.word-loop');
 const words=root?[...root.children]:[];
 if(words.length<2)return;
 gsap.set(words,{yPercent:120,opacity:0});
 gsap.set(words[0],{yPercent:0,opacity:1});
 if(reduced.matches)return;
 const tl=gsap.timeline({repeat:-1,repeatDelay:.45});
 words.forEach((word,index)=>{
  const next=words[(index+1)%words.length];
  tl.to(word,{yPercent:-120,opacity:0,duration:.55,ease:'power3.inOut'},index*2.1)
    .fromTo(next,{yPercent:120,opacity:0},{yPercent:0,opacity:1,duration:.55,ease:'power3.inOut'},index*2.1+.12);
 });
}

function initCurvedLoop(){
 const path=document.querySelector('.gift-curve textPath');
 if(!path)return;
 const phrase=path.textContent.trim()+' ';
 path.textContent=phrase.repeat(4);
 if(reduced.matches)return;
 gsap.fromTo(path,{attr:{startOffset:'0%'}},{attr:{startOffset:'-25%'},duration:26,ease:'none',repeat:-1});
}

function initPointerLighting(){
 if(!finePointer.matches)return;
 document.querySelectorAll('.product-image,.mood-gallery-panel').forEach(element=>{
  element.addEventListener('pointermove',event=>{
   const box=element.getBoundingClientRect();
   element.style.setProperty('--mouse-x',`${event.clientX-box.left}px`);
   element.style.setProperty('--mouse-y',`${event.clientY-box.top}px`);
  });
 });
}

function initGallery(){
 const track=document.querySelector('.mood-gallery-track');
 if(!track)return;
 const panels=[...track.querySelectorAll('.mood-gallery-panel')];
 const activate=panel=>panels.forEach(item=>item.classList.toggle('is-active',item===panel));
 panels.forEach(panel=>{
  panel.addEventListener('pointerenter',()=>activate(panel));
  panel.addEventListener('focus',()=>activate(panel));
 });
 if(!reduced.matches){
  gsap.from(panels,{y:46,opacity:0,duration:1,stagger:.08,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:track,start:'top 82%',once:true}});
 }
}

function initCraftCards(){
 const cards=[...document.querySelectorAll('.craft-card')];
 if(!cards.length||reduced.matches)return;
 const grid=document.querySelector('.craft-principles');
 const images=cards.map(card=>card.querySelector('.craft-card-image'));
 const copy=cards.map(card=>[...card.querySelectorAll('span,h3,p')]);
 // Curtain reveal: each card unmasks bottom-up while its photo settles from a
 // slow zoom, then the copy lifts in. CSS transitions pause during the reveal.
 gsap.set(cards,{clipPath:'inset(100% 0% 0% 0%)'});
 gsap.set(images,{scale:1.22});
 gsap.set(copy.flat(),{y:18,opacity:0});
 const reveal=gsap.timeline({paused:true,onStart:()=>grid.classList.add('is-revealing'),onComplete:()=>{gsap.set([...cards,...images,...copy.flat()],{clearProps:'clipPath,transform,opacity'});grid.classList.remove('is-revealing')}});
 cards.forEach((card,index)=>{
  const at=index*.16;
  reveal
   .to(card,{clipPath:'inset(0% 0% 0% 0%)',duration:1.25,ease:'expo.inOut'},at)
   .to(images[index],{scale:1.045,duration:1.8,ease:'expo.out'},at+.15)
   .to(copy[index],{y:0,opacity:1,duration:.8,stagger:.07,ease:'power3.out'},at+.75);
 });
 ScrollTrigger.create({trigger:grid,start:'top 82%',once:true,onEnter:()=>reveal.play()});
}

export function animatePanelContent(kind){
 if(reduced.matches)return;
 const selector=kind==='menu'?'.menu-links>*':'.search-result';
 const items=[...document.querySelectorAll(selector)];
 if(!items.length)return;
 gsap.fromTo(items,{y:kind==='menu'?38:18,opacity:0,rotate:kind==='menu'?1.5:0},{y:0,opacity:1,rotate:0,duration:.7,stagger:.07,ease:'power4.out',clearProps:'transform,opacity'});
}

export function initBitsEffects(){
 initWordLoop();
 initCurvedLoop();
 initPointerLighting();
 initGallery();
 initCraftCards();
 // Click sparks were removed after review: the interaction competed with the
 // product photography and made ordinary controls feel noisy.
 initFooterEffects();
 requestAnimationFrame(()=>ScrollTrigger.refresh());
}
