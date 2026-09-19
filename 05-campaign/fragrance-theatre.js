import {gsap,ScrollTrigger,reduced} from './motion.js';

const finePointer=matchMedia('(hover:hover) and (pointer:fine)');
const mobileViewport=matchMedia('(max-width:820px)');

function prepareLinework(linework){
 const paths=linework?[...linework.querySelectorAll('path')]:[];
 paths.forEach(path=>{
  let length=1200;
  try{length=Math.max(1,path.getTotalLength())}catch{}
  gsap.set(path,{strokeDasharray:length,strokeDashoffset:length});
 });
 return paths;
}

export function initFragranceTheatre(){
 const root=document.querySelector('#scent-theatre.product-theatre');
 if(!root||root.dataset.theatreReady==='true')return null;

 const pin=root.querySelector('.theatre-pin');
 const stormWorld=root.querySelector('.theatre-world--storm');
 const velvetWorld=root.querySelector('.theatre-world--velvet');
 const stormAtmosphere=root.querySelector('.theatre-atmosphere--storm');
 const velvetAtmosphere=root.querySelector('.theatre-atmosphere--velvet');
 const linework=root.querySelector('.theatre-linework');
 const aperture=root.querySelector('.theatre-aperture');
 const stormBottle=root.querySelector('.theatre-bottle--storm');
 const velvetBottle=root.querySelector('.theatre-bottle--velvet');
 const introCopy=root.querySelector('.theatre-copy--intro');
 const stormCopy=root.querySelector('.theatre-copy--storm');
 const velvetCopy=root.querySelector('.theatre-copy--velvet');
 const chapter=root.querySelector('.theatre-chapter');
 const stormNotes=root.querySelector('.theatre-notes--storm');
 const velvetNotes=root.querySelector('.theatre-notes--velvet');
 if(!pin||!stormWorld||!velvetWorld||!aperture)return null;

 root.dataset.theatreReady='true';
 if(reduced.matches){
  root.classList.add('is-static');
  return()=>{
   root.classList.remove('is-static');
   delete root.dataset.theatreReady;
  };
 }

 const paths=prepareLinework(linework);
 const stormPaths=paths.filter(path=>path.matches('.theatre-line--storm,.theatre-line--storm path,.theatre-lines--storm path'));
 const velvetPaths=paths.filter(path=>path.matches('.theatre-line--velvet,.theatre-line--velvet path,.theatre-lines--velvet path'));
 const sharedPaths=paths.filter(path=>!stormPaths.includes(path)&&!velvetPaths.includes(path));
 const stormTargets=stormPaths.length?stormPaths:paths;
 const velvetTargets=velvetPaths.length?velvetPaths:paths;
 const sharedTargets=sharedPaths.length?sharedPaths:paths;
 const scope=gsap.context(()=>{
  gsap.set(stormWorld,{autoAlpha:1,scale:.91,x:0,y:0});
  gsap.set(velvetWorld,{autoAlpha:0,scale:.9,x:0,y:0,clipPath:'inset(0 0 0 100%)'});
  gsap.set(stormAtmosphere,{autoAlpha:.82,scale:1.05,xPercent:0});
  gsap.set(velvetAtmosphere,{autoAlpha:0,scale:1.08,xPercent:4});
  gsap.set(aperture,{scaleX:.82,scaleY:.9,transformOrigin:'50% 50%'});
  gsap.set(stormBottle,{autoAlpha:1,scale:1.035});
  gsap.set(velvetBottle,{autoAlpha:0,scale:1.055});
  gsap.set(introCopy,{autoAlpha:1,y:18});
  gsap.set([stormCopy,velvetCopy].filter(Boolean),{autoAlpha:0,y:18});
  gsap.set(velvetTargets,{autoAlpha:0});
  gsap.set(stormNotes,{autoAlpha:0,xPercent:-12});
  gsap.set(velvetNotes,{autoAlpha:0,xPercent:12});
  gsap.set(root.querySelectorAll('.theatre-notes--storm .scent-note'),{xPercent:-35,rotation:-3});
  gsap.set(root.querySelectorAll('.theatre-notes--velvet .scent-note'),{xPercent:35,rotation:3});

  const timeline=gsap.timeline({defaults:{ease:'none'}});
  timeline
   .to(aperture,{scaleX:1,scaleY:1,duration:.12,ease:'power3.out'},0)
   .to(paths,{strokeDashoffset:0,duration:.2,stagger:.008,ease:'power2.out'},0)
   .to(introCopy,{autoAlpha:1,y:0,duration:.1,ease:'power2.out'},0)
   .to(introCopy,{autoAlpha:0,y:-12,duration:.08},.12)
   .to(stormCopy,{autoAlpha:1,y:0,duration:.1,ease:'power2.out'},.14)
   .to(stormWorld,{scale:.96,y:-4,duration:.28},.12)
   .to(stormNotes,{autoAlpha:1,xPercent:0,duration:.16,ease:'power2.out'},.16)
   .to(root.querySelectorAll('.theatre-notes--storm .scent-note'),{xPercent:0,rotation:0,duration:.22,stagger:.025,ease:'power2.out'},.17)
   .to(stormBottle,{scale:1,duration:.25},.12)
   .to(aperture,{scaleX:.94,scaleY:1.025,duration:.12,ease:'sine.inOut'},.4)
   .to(stormCopy,{autoAlpha:0,y:-14,duration:.09},.4)
   .to(stormNotes,{autoAlpha:0,xPercent:24,duration:.15,ease:'sine.inOut'},.38)
   .to(stormAtmosphere,{autoAlpha:0,xPercent:-3,scale:1.1,duration:.22,ease:'sine.inOut'},.39)
   .to(stormWorld,{autoAlpha:0,scale:.89,xPercent:-5,y:-6,duration:.22,ease:'sine.inOut'},.4)
   .to(stormBottle,{autoAlpha:0,scale:.98,duration:.16,ease:'sine.inOut'},.42)
   .to(pin,{backgroundColor:'#26070e',duration:.2,ease:'sine.inOut'},.4)
   .to(sharedTargets,{stroke:'#9a594f',opacity:.34,duration:.2,ease:'sine.inOut'},.4)
   .to(stormTargets,{autoAlpha:0,duration:.12},.42)
   .to(velvetTargets,{autoAlpha:.54,strokeDashoffset:0,duration:.18,stagger:.008},.46)
   .to(velvetWorld,{autoAlpha:1,scale:.94,xPercent:0,y:0,clipPath:'inset(0 0 0 0%)',duration:.24,ease:'sine.inOut'},.43)
   .to(velvetAtmosphere,{autoAlpha:.82,xPercent:0,scale:1.05,duration:.24,ease:'sine.inOut'},.43)
   .to(velvetNotes,{autoAlpha:1,xPercent:0,duration:.18,ease:'power2.out'},.5)
   .to(root.querySelectorAll('.theatre-notes--velvet .scent-note'),{xPercent:0,rotation:0,duration:.23,stagger:.025,ease:'power2.out'},.5)
   .to(velvetBottle,{autoAlpha:1,scale:1,duration:.18,ease:'power2.out'},.49)
   .to(aperture,{scaleX:1,scaleY:1,duration:.12,ease:'sine.out'},.52)
   .to(velvetCopy,{autoAlpha:1,y:0,duration:.1,ease:'power2.out'},.58)
   .to(velvetWorld,{scale:.98,y:-3,duration:.25},.58)
   .to(linework,{opacity:.68,duration:.18},.65)
   .to(linework,{opacity:.28,duration:.1},.88)
   .to(velvetCopy,{opacity:.9,duration:.1},.88)
   .to(pin,{backgroundColor:'#0b0809',duration:.12},.88);

  ScrollTrigger.create({
   trigger:root,
   animation:timeline,
   pin,
   start:()=>`top top+=${mobileViewport.matches?76:93}`,
   end:()=>`+=${Math.max(innerHeight*(mobileViewport.matches?1.95:2.6),mobileViewport.matches?1250:1800)}`,
   scrub:.6,
   anticipatePin:1,
   invalidateOnRefresh:true,
   onUpdate:self=>{
    root.classList.toggle('shows-velvet',self.progress>=.5);
   }
  });
 },root);

 let removeDepth=()=>{};
 if(finePointer.matches){
  const stormX=gsap.quickTo(stormWorld,'xPercent',{duration:.8,ease:'power3.out'});
  const stormY=gsap.quickTo(stormWorld,'yPercent',{duration:.8,ease:'power3.out'});
  const velvetX=gsap.quickTo(velvetWorld,'xPercent',{duration:1,ease:'power3.out'});
  const velvetY=gsap.quickTo(velvetWorld,'yPercent',{duration:1,ease:'power3.out'});
  const move=event=>{
   const box=pin.getBoundingClientRect();
   const x=Math.max(-1,Math.min(1,(event.clientX-box.left)/box.width*2-1));
   const y=Math.max(-1,Math.min(1,(event.clientY-box.top)/box.height*2-1));
   stormX(x*-.7);stormY(y*-.45);velvetX(x*-.45);velvetY(y*-.3);
  };
  const reset=()=>{stormX(0);stormY(0);velvetX(0);velvetY(0)};
  pin.addEventListener('pointermove',move,{passive:true});
  pin.addEventListener('pointerleave',reset,{passive:true});
  removeDepth=()=>{
   pin.removeEventListener('pointermove',move);
   pin.removeEventListener('pointerleave',reset);
  };
 }

 requestAnimationFrame(()=>ScrollTrigger.refresh());
 return()=>{
  removeDepth();
  scope.revert();
  root.classList.remove('shows-velvet');
  delete root.dataset.theatreReady;
 };
}
