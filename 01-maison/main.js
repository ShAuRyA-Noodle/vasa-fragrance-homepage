import {gsap,ScrollTrigger,SplitText,reduced} from '../shared/motion.js';
import {initAtelier,fragrances} from '../shared/atelier-ui.js';
initAtelier({theme:'light'});
const scenes=['maison-detail','maison-craft','maison-stranger','maison-velvet'];
const washes=['#dbdac7','#c9b18d','#d9bbad','#beb3b5'];
let request=0;const portrait=document.querySelector('#scent-image');
scenes.forEach(s=>{const i=new Image();i.src=`/media/editorial/${s}.webp`});
document.querySelectorAll('[data-scent]').forEach(button=>button.addEventListener('click',async()=>{
 const n=Number(button.dataset.scent),version=++request;document.querySelectorAll('[data-scent]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
 document.querySelector('#selected-discover').dataset.product=n;document.querySelector('#scent-status').textContent=`Showing ${fragrances[n].name}`;
 const preload=new Image();preload.src=`/media/editorial/${scenes[n]}.webp`;try{await preload.decode()}catch{return}if(version!==request)return;
 gsap.killTweensOf(portrait);const update=()=>{if(version!==request)return;portrait.src=preload.src;portrait.alt=`${fragrances[n].name}, complete VASA perfume bottle`;document.querySelector('#scent-mood').textContent=fragrances[n].mood.toUpperCase();document.querySelector('.scent-portrait').style.background=washes[n];if(!reduced.matches)gsap.fromTo(portrait,{opacity:0,y:12},{opacity:1,y:0,duration:.95,ease:'power2.out'});};
 if(reduced.matches)update();else gsap.to(portrait,{opacity:0,y:-10,duration:.3,onComplete:update});
}));
if(!reduced.matches){
 document.fonts.ready.then(()=>{
 const title=SplitText.create('.campaign h1',{type:'words',aria:'auto',wordsClass:'motion-word'});
 gsap.from(title.words,{opacity:0,y:35,filter:'blur(10px)',duration:1.6,stagger:.16,ease:'power3.out',delay:.15});
 gsap.from('.campaign-copy>.kicker,.campaign-copy>p:not(.kicker),.campaign-copy>.line-link',{opacity:0,y:12,duration:1.25,stagger:.12,delay:.4});
 gsap.utils.toArray('.collection-intro h2,.wear-intro h2,.house-title h2,.last-word h2').forEach(el=>{const s=SplitText.create(el,{type:'words',aria:'auto',wordsClass:'motion-word'});gsap.from(s.words,{y:30,opacity:0,filter:'blur(4px)',duration:1.2,stagger:.055,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 89%',once:true}})});ScrollTrigger.refresh();
 });
 const mm=gsap.matchMedia();mm.add('(min-width: 701px)',()=>{gsap.to('.campaign-copy',{y:90,opacity:.15,ease:'none',scrollTrigger:{trigger:'.campaign',start:'top top',end:'bottom 20%',scrub:1.4}});gsap.from('.collection-intro',{y:55,ease:'none',scrollTrigger:{trigger:'.collection',start:'top bottom',end:'top 25%',scrub:1.5}})});
 document.querySelectorAll('.wear-essays article').forEach((article,n)=>{ScrollTrigger.create({trigger:article,start:'top 58%',end:'bottom 58%',onEnter:()=>tone(article,n),onEnterBack:()=>tone(article,n)});gsap.from(article.children,{opacity:.2,y:30,duration:1.25,stagger:.1,scrollTrigger:{trigger:article,start:'top 82%',once:true}})});
 function tone(article,n){gsap.to('.wear',{backgroundColor:article.dataset.tone,color:article.dataset.ink,duration:1.45,ease:'power2.inOut',overwrite:true});gsap.to('.wear-gauge i',{left:`${n*50}%`,duration:1.25,ease:'power3.inOut'});document.querySelector('.wear-number').textContent=`0${n+1} / 03`;}
 gsap.from('.house-copy',{y:35,opacity:0,duration:1.35,scrollTrigger:{trigger:'.house-copy',start:'top 85%',once:true}});
}
