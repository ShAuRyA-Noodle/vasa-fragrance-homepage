// Scroll reveals for inner pages, same easing/duration language as the homepage.
import {gsap,reduced} from '/05-campaign/motion.js';

// Homepage-only tweens in experience.js have no targets here; silence their warnings.
gsap.config({nullTargetWarn:false});

if(!reduced.matches){
 gsap.utils.toArray('[data-reveal]').forEach(group=>{
  const items=group.dataset.reveal==='self'?[group]:[...group.children];
  gsap.from(items,{y:40,opacity:0,duration:1,stagger:.1,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:group,start:'top 85%',once:true}});
 });
 gsap.utils.toArray('[data-parallax]').forEach(img=>{
  gsap.fromTo(img,{yPercent:-6,scale:1.08},{yPercent:6,scale:1.08,ease:'none',scrollTrigger:{trigger:img.parentElement,start:'top bottom',end:'bottom top',scrub:1}});
 });
}
