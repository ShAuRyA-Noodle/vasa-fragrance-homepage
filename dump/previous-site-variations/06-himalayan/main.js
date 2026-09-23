import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger);
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer=matchMedia('(pointer: fine)').matches;
let lenis=null,menuOpener=null;
const themeToggles=[...document.querySelectorAll('.theme-toggle')];
const systemTheme=matchMedia('(prefers-color-scheme: dark)');
let savedTheme=null;
try{savedTheme=localStorage.getItem('vasa-theme')}catch{}
function applyTheme(theme,persist=false){
 document.documentElement.dataset.theme=theme;
 const next=theme==='dark'?'light':'dark';
 themeToggles.forEach(toggle=>{toggle.setAttribute('aria-pressed',String(theme==='dark'));toggle.setAttribute('aria-label',`Switch to ${next} mode`);toggle.querySelector('.theme-label').textContent=next[0].toUpperCase()+next.slice(1)});
 if(persist){savedTheme=theme;try{localStorage.setItem('vasa-theme',theme)}catch{}}
}
applyTheme(document.documentElement.dataset.theme||'light');
themeToggles.forEach(toggle=>toggle.addEventListener('click',()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark',true)));
systemTheme.addEventListener?.('change',event=>{if(!savedTheme)applyTheme(event.matches?'dark':'light')});

const fragrances=[
 {name:'Silent Storm',family:'Bergamot · Vetiver · Cedar',mood:'Fresh & woody',price:'₹1,680',color:'#769296',scene:'world-silent-storm.webp',bottle:'silent-storm.webp'},
 {name:'The Sweetest Stranger',family:'Jasmine · Patchouli',mood:'Soft & floral',price:'₹1,455',color:'#d5aaa4',scene:'world-sweetest-stranger.webp',bottle:'sweetest-stranger.webp'},
 {name:'Rebel in Velvet',family:'Almond · Tuberose · Tonka',mood:'Deep & magnetic',price:'₹1,455',color:'#625467',scene:'world-rebel-in-velvet.webp',bottle:'rebel-in-velvet.webp'},
 {name:'The Night Lingers',family:'Oud · Benzoin · Saffron',mood:'Warm & smoky',price:'₹1,900',color:'#9a7045',scene:'world-the-night-lingers.webp',bottle:'the-night-lingers.webp'}
];
const media='/media/campaign/';
const rail=document.querySelector('#product-rail');
rail.innerHTML=fragrances.map((p,i)=>`<article class="product-card" style="--card-bg:${p.color}"><button class="product-visual" type="button" data-product="${i}" aria-label="Discover ${p.name}"><span class="product-number">0${i+1}</span><img class="product-scene" src="${media+p.scene}" alt="${p.name} atmosphere" width="1200" height="960" loading="lazy"><img class="product-bottle" src="${media+p.bottle}" alt="${p.name} perfume bottle" width="1122" height="1402" loading="lazy"></button><div class="product-copy"><h3>${p.name}</h3><p>${p.family}</p><div class="product-meta"><span>50 ml / ${p.price}</span><button class="add-product" type="button" data-add="${p.name}">Add to bag +</button></div></div></article>`).join('');

const options=document.querySelector('.finder-options');
const images=document.querySelector('.finder-images');
options.innerHTML=fragrances.map((p,i)=>`<button class="finder-option" type="button" role="radio" aria-checked="${i===0}" tabindex="${i===0?0:-1}" data-find="${i}"><span>0${i+1}</span><strong>${p.mood}</strong><i aria-hidden="true"></i></button>`).join('');
images.innerHTML=fragrances.map((p,i)=>`<img class="finder-image${i===0?' active':''}" src="${media+p.scene}" alt="${p.name} fragrance atmosphere" width="1200" height="960" loading="lazy">`).join('');
document.querySelector('.finder-caption strong').textContent=fragrances[0].name;

let currentFinder=0;
function setFinder(index){
 if(index===currentFinder)return;
 const old=images.children[currentFinder],next=images.children[index];
 options.children[currentFinder].setAttribute('aria-checked','false');
 options.children[currentFinder].tabIndex=-1;
 options.children[index].setAttribute('aria-checked','true');
 options.children[index].tabIndex=0;
 old.classList.remove('active');next.classList.add('active');
 currentFinder=index;
 document.querySelector('.finder-counter').textContent=`0${index+1} / 04`;
 document.querySelector('.finder-caption strong').textContent=fragrances[index].name;
 if(!reduce)gsap.fromTo('.finder-caption',{y:12,opacity:0},{y:0,opacity:1,duration:.55,ease:'power3.out'});
}
options.addEventListener('click',e=>{const button=e.target.closest('[data-find]');if(button)setFinder(Number(button.dataset.find))});
options.addEventListener('keydown',e=>{if(!['ArrowDown','ArrowUp'].includes(e.key))return;e.preventDefault();const next=(currentFinder+(e.key==='ArrowDown'?1:-1)+fragrances.length)%fragrances.length;setFinder(next);options.children[next].focus()});

const hero=document.querySelector('.hero');
const film=document.querySelector('.hero-film');
const filmControl=document.querySelector('.film-control');
film.addEventListener('playing',()=>hero.classList.add('video-ready'));
film.addEventListener('canplay',()=>hero.classList.add('video-playable'));
film.addEventListener('playing',()=>{filmControl.querySelector('span').textContent='Pause film';filmControl.querySelector('i').textContent='Ⅱ';filmControl.setAttribute('aria-label','Pause film')});
film.addEventListener('error',()=>hero.classList.remove('video-ready'));
if(reduce){filmControl.querySelector('span').textContent='Play film';filmControl.querySelector('i').textContent='▷';filmControl.setAttribute('aria-label','Play film')}
else film.play().catch(()=>{filmControl.querySelector('span').textContent='Play film';filmControl.querySelector('i').textContent='▷';filmControl.setAttribute('aria-label','Play film')});
filmControl.addEventListener('click',e=>{
 if(film.paused){film.play();e.currentTarget.querySelector('span').textContent='Pause film';e.currentTarget.querySelector('i').textContent='Ⅱ';e.currentTarget.setAttribute('aria-label','Pause film')}
 else{film.pause();e.currentTarget.querySelector('span').textContent='Play film';e.currentTarget.querySelector('i').textContent='▷';e.currentTarget.setAttribute('aria-label','Play film')}
});

let bag=0;
const toast=document.querySelector('.toast');
let toastTimer;
function showToast(message){clearTimeout(toastTimer);toast.textContent=message;toast.classList.add('visible');toastTimer=setTimeout(()=>toast.classList.remove('visible'),2200)}
document.addEventListener('click',e=>{const add=e.target.closest('[data-add]');if(add){bag++;document.querySelector('#bag-count').textContent=`(${bag})`;document.querySelector('.bag-button').setAttribute('aria-label',`Shopping bag, ${bag} item${bag===1?'':'s'}`);showToast(`${add.dataset.add} added to your bag`);return}const product=e.target.closest('[data-product]');if(product){const index=Number(product.dataset.product);setFinder(index);document.querySelector('#finder').scrollIntoView({behavior:reduce?'auto':'smooth'});setTimeout(()=>options.children[index].focus({preventScroll:true}),reduce?0:700)}});
document.querySelector('.add-kit').addEventListener('click',()=>showToast('The Four Strangers discovery kit is ready to explore'));
document.querySelector('.bag-button').addEventListener('click',()=>showToast(bag?`${bag} selection${bag===1?'':'s'} saved in your bag`:'Your bag is waiting for a fragrance'));
document.querySelector('.newsletter').addEventListener('submit',e=>{e.preventDefault();showToast('Thank you. You are on the VASA list.');e.currentTarget.reset()});

const menu=document.querySelector('#mobile-menu');
function toggleMenu(open){
 const trigger=document.querySelector('.menu-button');
 if(open)menuOpener=document.activeElement;
 menu.setAttribute('aria-hidden',String(!open));trigger.setAttribute('aria-expanded',String(open));document.body.classList.toggle('menu-open',open);
 [document.querySelector('main'),document.querySelector('footer'),document.querySelector('.header')].forEach(el=>{if(el)el.inert=open});
 if(open){lenis?.stop();requestAnimationFrame(()=>document.querySelector('.menu-close').focus())}
 else{lenis?.start();menuOpener?.focus({preventScroll:true})}
}
document.querySelector('.menu-button').addEventListener('click',()=>toggleMenu(true));
document.querySelector('.menu-close').addEventListener('click',()=>toggleMenu(false));
menu.addEventListener('click',e=>{if(e.target.closest('a'))toggleMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&menu.getAttribute('aria-hidden')==='false')toggleMenu(false)});

if(reduce){document.querySelector('.loader').remove()}
else{
 const loader=gsap.timeline({onComplete:()=>document.querySelector('.loader')?.remove()});
 loader.to('.loader-line i',{xPercent:100,duration:.82,ease:'power2.inOut'}).to('.loader-mark,.loader small',{opacity:0,y:-8,duration:.35},'-=.08').to('.loader',{opacity:0,duration:.5,ease:'power2.inOut'},'-=.1');
 lenis=new Lenis({duration:1.05,smoothWheel:true,wheelMultiplier:.9});
 lenis.on('scroll',ScrollTrigger.update);gsap.ticker.add(t=>lenis.raf(t*1000));gsap.ticker.lagSmoothing(0);
 const intro=gsap.timeline({delay:.78});
 intro.from('.header',{y:-30,opacity:0,duration:.8,ease:'power3.out'}).from('.hero .eyebrow',{y:18,opacity:0,duration:.6},'-=.45').from('.hero h1 .mask-line',{y:35,opacity:0,duration:1.05,stagger:.1,ease:'power3.out'},'-=.35').from('.hero .cta,.hero-meta',{y:18,opacity:0,duration:.7,stagger:.08},'-=.55');
 gsap.to('.hero-progress i',{scaleX:0,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:true}});
 gsap.to('.hero-film-shell',{scale:.985,opacity:.68,ease:'none',scrollTrigger:{trigger:'.hero',start:'top top',end:'bottom top',scrub:.5}});
 const revealItems=gsap.utils.toArray('.section-index,.section-heading,.manifesto-grid>*,.ritual-head>*,.discovery-copy>*,.finder-copy>*,.proof-copy>*,.gift-copy>*');
 ScrollTrigger.batch(revealItems,{start:'top 88%',once:true,onEnter:batch=>gsap.fromTo(batch,{y:28,opacity:0},{y:0,opacity:1,duration:.8,stagger:.07,ease:'power3.out',clearProps:'all'})});
 gsap.utils.toArray('.manifesto h2 span,.manifesto h2 em,.gifting>h2').forEach(el=>gsap.from(el,{y:40,opacity:0,duration:1,ease:'power3.out',scrollTrigger:{trigger:el,start:'top 84%',once:true}}));
 gsap.utils.toArray('.image-reveal img').forEach(img=>gsap.fromTo(img,{scale:1.035,opacity:.5},{scale:1,opacity:1,duration:1.2,ease:'power2.out',scrollTrigger:{trigger:img,start:'top 82%',once:true}}));
 if(matchMedia('(min-width: 981px)').matches){
  gsap.from('.product-card',{y:45,opacity:0,duration:.9,stagger:.09,ease:'power3.out',scrollTrigger:{trigger:'.product-rail',start:'top 78%',once:true}});
  gsap.from('.ritual-card',{y:52,opacity:0,duration:1,stagger:.12,ease:'power3.out',scrollTrigger:{trigger:'.ritual-grid',start:'top 80%',once:true}});
 }
}

let lastY=0;
addEventListener('scroll',()=>{const y=scrollY;const header=document.querySelector('.header');header.classList.toggle('scrolled',y>40);header.classList.toggle('hidden',y>lastY&&y>180&&!document.body.classList.contains('menu-open'));lastY=y},{passive:true});

if(finePointer&&!reduce){
 document.addEventListener('pointerdown',e=>{const spark=document.createElement('i');spark.style.cssText=`position:fixed;z-index:190;pointer-events:none;left:${e.clientX}px;top:${e.clientY}px;width:9px;height:9px;border:1px solid #dca0a8;border-radius:50%;transform:translate(-50%,-50%)`;document.body.append(spark);gsap.to(spark,{width:54,height:54,opacity:0,duration:.6,ease:'power2.out',onComplete:()=>spark.remove()})});
}

document.fonts.ready.then(()=>ScrollTrigger.refresh());
