import {gsap,ScrollTrigger,SplitText,reduced} from './motion.js';

const pointerFine=matchMedia('(hover:hover) and (pointer:fine)');

function headingReveals(){
 document.querySelectorAll('.motion-heading').forEach(heading=>{
  const split=SplitText.create(heading,{type:'lines',linesClass:'motion-line',aria:'auto'});
  gsap.from(split.lines,{yPercent:115,rotate:2,opacity:0,duration:1.05,stagger:.12,ease:'power4.out',scrollTrigger:{trigger:heading,start:'top 88%',once:true}});
 });
}

function cardEntrances(){
 const cards=gsap.utils.toArray('.product-card');
 gsap.from(cards,{y:68,duration:1.05,stagger:.08,ease:'power4.out',scrollTrigger:{trigger:'.product-grid',start:'top 84%',once:true}});
 cards.forEach(card=>{
  const world=card.querySelector('.product-world');
  gsap.fromTo(world,{scale:1.22},{scale:1.04,ease:'none',scrollTrigger:{trigger:card,start:'top bottom',end:'bottom top',scrub:1.2}});
  if(!pointerFine.matches)return;
  const worldX=gsap.quickTo(world,'x',{duration:.7,ease:'power3.out'});
  const worldY=gsap.quickTo(world,'y',{duration:.7,ease:'power3.out'});
  card.addEventListener('pointermove',event=>{
   const box=card.getBoundingClientRect(),x=(event.clientX-box.left)/box.width-.5,y=(event.clientY-box.top)/box.height-.5;
   worldX(x*-12);worldY(y*-12);
  });
  card.addEventListener('pointerleave',()=>{worldX(0);worldY(0)});
 });
}

function mediaDepth(){
 gsap.to('.hero-media>video,.hero-media>.hero-poster',{scale:1.07,yPercent:3,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:1}});
 gsap.fromTo('.story-photo img',{scale:.9,yPercent:7},{scale:1.04,yPercent:-4,ease:'none',scrollTrigger:{trigger:'.story-stage',start:'top bottom',end:'bottom top',scrub:1.1}});
 gsap.fromTo('.campaign-photo img',{scale:1.05,yPercent:-4},{scale:1.13,yPercent:4,ease:'none',scrollTrigger:{trigger:'.campaign',start:'top bottom',end:'bottom top',scrub:1.2}});
 gsap.from('.campaign-copy>*',{y:45,duration:1,stagger:.1,ease:'power3.out',scrollTrigger:{trigger:'.campaign-copy',start:'top 80%',once:true}});
 gsap.from('.gift-copy>*',{x:45,duration:1,stagger:.09,ease:'power3.out',scrollTrigger:{trigger:'.gift-copy',start:'top 82%',once:true}});
 gsap.fromTo('.gift-art>img',{xPercent:-24,rotate:-3,opacity:.35},{xPercent:0,rotate:0,opacity:1,ease:'none',scrollTrigger:{trigger:'.gifting',start:'top bottom',end:'center center',scrub:1}});
}

function pinnedPrinciples(){
 const mm=gsap.matchMedia();
 mm.add('(min-width: 901px)',()=>{
  const items=gsap.utils.toArray('.craft-strip>div');
  gsap.set(items,{opacity:.62,y:16});
  const tl=gsap.timeline({scrollTrigger:{trigger:'.craft-strip',start:'center center',end:'+=520',pin:true,scrub:1,anticipatePin:1}});
  items.forEach((item,index)=>tl.to(item,{opacity:1,y:0,duration:1,ease:'power2.out'},index*.7).to(item,{opacity:index===items.length-1?1:.62,y:index===items.length-1?0:-8,duration:.7,ease:'power2.inOut'},index*.7+.7));
  return()=>tl.scrollTrigger?.kill();
 });
}

function pointerLabel(){
 if(!pointerFine.matches)return;
 const cursor=document.querySelector('#scent-cursor');
 const x=gsap.quickTo(cursor,'x',{duration:.28,ease:'power3.out'}),y=gsap.quickTo(cursor,'y',{duration:.28,ease:'power3.out'});
 addEventListener('pointermove',event=>{x(event.clientX);y(event.clientY)});
 document.querySelectorAll('.scent-zone').forEach(zone=>{
  zone.addEventListener('pointerenter',()=>cursor.classList.add('visible'));
  zone.addEventListener('pointerleave',()=>cursor.classList.remove('visible'));
 });
}

function magneticControls(){
 if(!pointerFine.matches)return;
 document.querySelectorAll('.button,.add-button,.story-arrows .icon-button').forEach(control=>{
  control.addEventListener('pointermove',event=>{const box=control.getBoundingClientRect();gsap.to(control,{x:(event.clientX-box.left-box.width/2)*.12,y:(event.clientY-box.top-box.height/2)*.15,duration:.35,ease:'power3.out'})});
  control.addEventListener('pointerleave',()=>gsap.to(control,{x:0,y:0,duration:.55,ease:'elastic.out(1,.45)'}));
 });
}

export function initExperience(){
 if(reduced.matches){gsap.set('.product-card,.motion-heading,.campaign-copy>*,.gift-copy>*',{clearProps:'all'});return;}
 headingReveals();cardEntrances();mediaDepth();pinnedPrinciples();pointerLabel();magneticControls();
 requestAnimationFrame(()=>ScrollTrigger.refresh());
}
