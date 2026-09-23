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
 gsap.utils.toArray('.product-grid').forEach(grid=>gsap.from(grid.querySelectorAll('.product-card'),{y:68,duration:1.05,stagger:.08,ease:'power4.out',scrollTrigger:{trigger:grid,start:'top 84%',once:true}}));
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
 gsap.fromTo('.campaign-photo',{clipPath:'inset(6% 6% 6% 6%)',scale:.97},{clipPath:'inset(0% 0% 0% 0%)',scale:1,ease:'none',scrollTrigger:{trigger:'.campaign',start:'top bottom',end:'center center',scrub:.85}});
 gsap.fromTo('.campaign-photo img',{scale:1.03,yPercent:-2},{scale:1.075,yPercent:2,ease:'none',scrollTrigger:{trigger:'.campaign',start:'top bottom',end:'bottom top',scrub:1.2}});
 gsap.from('.campaign-copy>*',{y:34,opacity:0,duration:1,stagger:.09,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:'.campaign-copy',start:'top 82%',once:true}});
 gsap.from('.gift-copy>*',{y:28,opacity:0,duration:.95,stagger:.08,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:'.gift-copy',start:'top 84%',once:true}});
 gsap.fromTo('.gift-art>img',{scale:.82,rotate:-2,opacity:.2},{scale:1,rotate:0,opacity:1,ease:'none',scrollTrigger:{trigger:'.gifting',start:'top bottom',end:'center center',scrub:1}});
}

function pinnedPrinciples(){
 const intro=document.querySelector('.craft-intro');
 // The cards themselves are owned by initCraftCards (bits-effects.js); a second
 // tween here fought the 720° spin and cleared its transform mid-rotation.
 gsap.from(intro,{y:28,opacity:0,duration:.9,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:'.craft-strip',start:'top 82%',once:true}});
}

export function initExperience(){
 if(reduced.matches){gsap.set('.product-card,.motion-heading,.campaign-copy>*,.gift-copy>*',{clearProps:'all'});return;}
 headingReveals();cardEntrances();mediaDepth();pinnedPrinciples();
 requestAnimationFrame(()=>ScrollTrigger.refresh());
}
