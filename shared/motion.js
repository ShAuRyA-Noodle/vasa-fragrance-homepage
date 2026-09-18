import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Flip } from 'gsap/Flip';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
gsap.registerPlugin(ScrollTrigger, SplitText, DrawSVGPlugin, Flip);
export {gsap, ScrollTrigger, SplitText, DrawSVGPlugin, Flip};
export const reduced=matchMedia('(prefers-reduced-motion: reduce)');
export function smoothScroll(){
 if(reduced.matches)return null;
 const lenis=new Lenis({duration:1.2,smoothWheel:true,anchors:{offset:-45},prevent:node=>!!node.closest('dialog')});
 lenis.on('scroll',ScrollTrigger.update);
 const tick=time=>lenis.raf(time*1000);gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
 addEventListener('pagehide',()=>{gsap.ticker.remove(tick);lenis.destroy()},{once:true});
 return lenis;
}
export function revealType(selector,{hero=false,words=false}={}){
 const splits=[];
 document.querySelectorAll(selector).forEach(el=>{
 const split=SplitText.create(el,{type:words?'words':'words,chars',wordsClass:'motion-word',charsClass:'motion-char',aria:'auto'});splits.push(split);
 gsap.from(words?split.words:split.chars,{yPercent:hero?65:32,opacity:0,rotationX:hero?-35:0,stagger:words?.06:.012,duration:hero?1.1:.8,ease:'power3.out',...(hero?{delay:.1}:{scrollTrigger:{trigger:el,start:'top 88%',once:true}})});
 });return()=>splits.forEach(s=>s.revert());
}
export function progressLine(){
 const line=document.createElement('div');line.className='reading-progress';line.setAttribute('aria-hidden','true');document.body.append(line);
 gsap.fromTo(line,{scaleX:0},{scaleX:1,ease:'none',scrollTrigger:{start:0,end:()=>ScrollTrigger.maxScroll(window),scrub:.2,invalidateOnRefresh:true}});
}
export function openMotion(dialog){if(!reduced.matches)gsap.fromTo(dialog,{opacity:0,y:22,scale:.97},{opacity:1,y:0,scale:1,duration:.5,ease:'power3.out',clearProps:'transform,opacity'});}
export function drawPaths(selector){gsap.utils.toArray(selector).forEach(path=>gsap.from(path,{drawSVG:'0%',duration:1.8,ease:'power2.inOut',scrollTrigger:{trigger:path.closest('svg'),start:'top 85%'}}));}
