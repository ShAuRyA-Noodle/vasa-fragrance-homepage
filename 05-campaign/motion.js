import {gsap} from 'gsap';
import {ScrollTrigger} from 'gsap/ScrollTrigger';
import {SplitText} from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
gsap.registerPlugin(ScrollTrigger,SplitText);
export {gsap,ScrollTrigger,SplitText};
gsap.config({nullTargetWarn:false}); // shared scripts run on pages without every homepage target
export const reduced=matchMedia('(prefers-reduced-motion:reduce)');
export function smoothScroll(){
 if(reduced.matches)return null;
 const lenis=new Lenis({duration:1.05,smoothWheel:true,anchors:{offset:matchMedia('(max-width:760px)').matches?-77:-104},prevent:node=>!!node.closest('dialog')});
 lenis.on('scroll',ScrollTrigger.update);
 const tick=time=>lenis.raf(time*1000);gsap.ticker.add(tick);gsap.ticker.lagSmoothing(0);
 addEventListener('pagehide',()=>{gsap.ticker.remove(tick);lenis.destroy()},{once:true});return lenis;
}
