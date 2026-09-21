import {gsap,ScrollTrigger,SplitText,reduced,smoothScroll} from './motion.js';
import {catalog,productById,photo} from './catalog.js';
import {createBag} from './cart.js';
import {initExperience} from './experience.js';
import {initBitsEffects,animatePanelContent} from './bits-effects.js';
import {initFragranceTheatre} from './fragrance-theatre.js';
import {initFestivalCarousel} from './festival-carousel.js';
const lenis=smoothScroll();
let storage;try{storage=window.localStorage}catch{storage={getItem:()=>null,setItem:()=>{}}}
const themeKey='vasa-theme',themeMedia=matchMedia('(prefers-color-scheme: dark)'),themeToggle=document.querySelector('.theme-toggle'),themeIcon=themeToggle?.querySelector('.theme-toggle-icon'),themeMeta=document.querySelector('meta[name="theme-color"]');
const readTheme=()=>{try{const value=storage.getItem(themeKey);return value==='light'||value==='dark'?value:null}catch{return null}};
const saveTheme=theme=>{try{storage.setItem(themeKey,theme)}catch{}};
function applyTheme(theme,persist=false){
 document.documentElement.dataset.theme=theme;
 document.documentElement.style.colorScheme=theme;
 if(themeMeta)themeMeta.content=theme==='dark'?'#11100f':'#efe9e1';
 if(themeToggle){const dark=theme==='dark',label=dark?'Switch to light theme':'Switch to dark theme';themeToggle.setAttribute('aria-pressed',String(dark));themeToggle.setAttribute('aria-label',label);themeToggle.title=label;if(themeIcon)themeIcon.textContent=dark?'☀':'☾'}
 if(persist)saveTheme(theme);
 document.dispatchEvent(new Event('themechange'));
}
applyTheme(document.documentElement.dataset.theme||readTheme()||(themeMedia.matches?'dark':'light'));
themeToggle?.addEventListener('click',()=>applyTheme(document.documentElement.dataset.theme==='dark'?'light':'dark',true));
themeMedia.addEventListener?.('change',event=>{if(!readTheme())applyTheme(event.matches?'dark':'light')});
const bag=createBag(storage);
const icon='<svg><use href="#i-arrow"/></svg>';
const panel=document.querySelector('#panel'),content=document.querySelector('#panel-content'),title=document.querySelector('#panel-title');
let opener,activePanel='',toastTimer,schedule;
const escapeText=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const imageMarkup=(p,cls='',loading='lazy')=>`<img class="${cls}" src="${photo(p)}" alt="${p.name}, full 50 ml bottle concept" loading="${loading}" width="1122" height="1402">`;
document.querySelector('#year').textContent=new Date().getFullYear();
document.querySelector('.footer-subscribe')?.addEventListener('submit',event=>{event.preventDefault();const field=event.currentTarget.querySelector('input');if(!field?.value.trim()){field?.focus();return;}toast('Thank you. VASA notes will arrive here.');event.currentTarget.reset()});
document.querySelector('#product-grid').innerHTML=catalog.map(p=>`<article class="product-card" style="--scent:${p.color}"><button class="product-image" data-product="${p.id}" aria-label="Discover ${p.name}"><img class="product-world" src="/media/campaign/${p.world}.webp" alt="" loading="lazy" width="1200" height="960"><img class="product-reveal" src="${p.hoverImage}" alt="${p.name} presented in its fragrance world" loading="lazy" width="1600" height="1840"></button><div class="product-info"><h3><button data-product="${p.id}" style="padding:0;text-align:left">${p.name}</button></h3><p>${p.family}</p><div class="product-meta"><span>50 ml</span><span>Price announced at launch</span></div><button class="add-button" data-add="${p.id}" aria-label="Add ${p.name} to bag"><span>ADD TO BAG</span><span>+</span></button></div></article>`).join('');
const giftIdeas=[
 {title:'For celebrations',label:'01 / FESTIVE GIFTING',line:'A fragrant keepsake for the moments everyone remembers.',image:'/media/campaign/festival/diwali-signature.webp'},
 {title:'For someone close',label:'02 / PERSONAL GESTURES',line:'Chosen for them. Remembered as part of their story.',image:'/media/campaign/festival/indian-gifting.webp'},
 {title:'For the host',label:'03 / CONSIDERED THANK-YOUS',line:'A quiet expression of gratitude, wrapped with intention.',image:'/media/campaign/festival/weekend-ritual.webp'},
 {title:'For discovery',label:'04 / THE VASA SET',line:'Four expressions, ready to be worn and understood.',image:'/media/campaign/gifting-presentation-v2.webp'}
];
const giftingGallery=document.querySelector('#gifting-gallery');
if(giftingGallery)giftingGallery.innerHTML=giftIdeas.map((gift,i)=>`<a class="mood-gallery-panel gift-gallery-panel${i===0?' is-active':''}" href="#collection" aria-label="Explore ${gift.title.toLowerCase()}"><img src="${gift.image}" alt="" loading="lazy" width="1600" height="1000"><span class="mood-gallery-shade"></span><span class="mood-gallery-copy"><small>${gift.label}</small><strong>${gift.title}</strong><em>${gift.line}</em><span class="gift-gallery-link">EXPLORE GIFTS <b aria-hidden="true">↗</b></span></span></a>`).join('');
const storySlides=document.querySelector('#story-slides'),storyTabs=document.querySelector('.story-tabs');
if(storySlides&&storyTabs){
 storySlides.innerHTML=catalog.map((p,i)=>`<article class="story-slide" ${i?'hidden inert':''} aria-label="${i+1} of 4: ${p.name}" style="--scent:${p.color}"><div class="story-photo"><span class="story-number">0${i+1} / THE COLLECTION</span>${imageMarkup(p,'','eager')}</div><div class="story-copy"><p class="kicker">${p.family}</p><h3>${p.name}</h3><p class="story-line">${p.line}</p><p>${p.description}</p><button class="text-link" data-product="${p.id}">DISCOVER THE FRAGRANCE <span>↗</span></button></div></article>`).join('');
 storyTabs.innerHTML=catalog.map((p,i)=>`<button class="story-tab" aria-label="Show ${p.name}" aria-pressed="${i===0}" data-slide="${i}"></button>`).join('');
}
function showPanel(name,heading,html){
 if(!panel.open){opener=document.activeElement;panel.showModal();document.body.classList.add('modal-open');lenis?.stop();if(typeof schedule==='function')schedule();if(!reduced.matches)gsap.fromTo(panel,{xPercent:100},{xPercent:0,duration:.55,ease:'power3.out'});}
 activePanel=name;title.textContent=heading;content.innerHTML=html;panel.scrollTop=0;requestAnimationFrame(()=>{const focus=name==='search'?content.querySelector('input'):document.querySelector('#close-panel');focus?.focus({preventScroll:true})});
}
function closePanel(){panel.close();}
panel.addEventListener('close',()=>{document.body.classList.remove('modal-open');lenis?.start();activePanel='';opener?.focus({preventScroll:true});if(typeof schedule==='function')schedule()});
panel.addEventListener('click',e=>{if(e.target===panel){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right)closePanel()}});
document.querySelector('#close-panel').onclick=closePanel;
function productPanel(id){const p=productById(id);if(!p)return;showPanel('product',p.name,`<div class="detail-image">${imageMarkup(p)}</div><p class="detail-family">${p.family} · 50 ML</p><p class="detail-description">${p.description}</p><dl class="note-list">${p.notes.map(([n,d])=>`<div><dt>${n}</dt><dd>${d}</dd></div>`).join('')}</dl><button class="add-button" data-add="${p.id}">ADD TO BAG <span>+</span></button><p class="panel-note">Price and concentration details will be published at launch. Your bag saves your selection; ordering is not open yet.</p>`)}
function renderBag(){const items=bag.items;content.innerHTML=items.length?`${items.map(i=>{const p=productById(i.id);return `<article class="bag-item">${imageMarkup(p)}<div><h3>${p.name}</h3><small>50 ml · Price announced at launch</small><div class="quantity"><button data-quantity="${p.id}" data-value="${i.quantity-1}" aria-label="Decrease ${p.name} quantity">−</button><span aria-label="Quantity">${i.quantity}</span><button data-quantity="${p.id}" data-value="${i.quantity+1}" ${i.quantity===9?'disabled':''} aria-label="Increase ${p.name} quantity">+</button><button class="remove" data-remove="${p.id}">Remove</button></div></div></article>`}).join('')}<p class="bag-status">Your selection is saved on this device. Ordering will open once prices and availability are confirmed. No payment is taken.</p><button class="button dark panel-action" data-continue>CONTINUE EXPLORING ${icon}</button>`:'<p class="panel-note">Your bag is waiting for a fragrance that feels like you.</p><button class="button dark" data-continue>EXPLORE THE COLLECTION '+icon+'</button>';}
function bagPanel(){showPanel('bag','Your bag','');renderBag()}
function syncBag(){const count=bag.items.reduce((a,i)=>a+i.quantity,0),badge=document.querySelector('#bag-count');badge.textContent=count;badge.hidden=!count;document.querySelector('.bag-button').setAttribute('aria-label',`Shopping bag, ${count} item${count===1?'':'s'}`);if(activePanel==='bag')renderBag()}
bag.subscribe(syncBag);syncBag();
function toast(message){const el=document.querySelector('#toast');clearTimeout(toastTimer);el.textContent=message;el.classList.add('visible');toastTimer=setTimeout(()=>el.classList.remove('visible'),2600)}
function searchResults(query=''){const q=query.toLocaleLowerCase().trim();const results=catalog.filter(p=>[p.name,p.family,p.description,...p.notes.flat()].join(' ').toLocaleLowerCase().includes(q));document.querySelector('#search-results').innerHTML=results.length?results.map(p=>`<button class="search-result" data-product="${p.id}">${imageMarkup(p)}<span><strong>${p.name}</strong><small>${p.family}</small></span></button>`).join(''):`<p class="panel-note">No fragrances found for “${escapeText(query)}”. Try a name or note, such as rose or cedar.</p>`;document.querySelector('#search-count').textContent=`${results.length} fragrance${results.length===1?'':'s'} found`;requestAnimationFrame(()=>animatePanelContent('search'));}
const simplePanels={
 contact:['Contact VASA','Our contact details will be available here at launch. In the meantime, explore the collection and save your favourites in your bag.'],
 profile:['Your profile','Personal accounts will open with the store. For now, your bag is saved on this device without an account.'],
 exclusive:['Online exclusives','Our online exclusives are being prepared. Explore the four fragrances in the collection while we get ready.'],
 social:['The world of VASA','Our official social channels will be linked here at launch.'],
 privacy:['Your privacy','This homepage saves your fragrance selection in local storage on your device. It does not create an account or collect payment information. You can remove saved items from your bag.']
};
function open(name){if(name==='bag')return bagPanel();if(name==='search'){showPanel('search','Find your fragrance','<label class="search-label" for="fragrance-search">Search by name or fragrance note</label><input class="panel-search" id="fragrance-search" type="search" placeholder="Try rose, cedar, or a fragrance name" autocomplete="off"><p class="sr-only" id="search-count" aria-live="polite"></p><div class="search-results" id="search-results"></div>');searchResults();content.querySelector('input').addEventListener('input',e=>searchResults(e.target.value));return;}
 if(name==='menu'){showPanel('menu','Explore VASA','<div class="menu-links"><a href="#collection" data-dismiss>Collection</a><a href="#gifting" data-dismiss>Gifting</a><a href="#our-story" data-dismiss>Our Story</a><button data-panel="contact">Contact</button><button data-panel="profile">Your profile</button></div>');requestAnimationFrame(()=>animatePanelContent('menu'));return;}
 if(name==='story'){showPanel('story','Our Story','<img class="panel-logo" src="/media/campaign/logo-dark.svg" alt="VASA Fragrance"><p class="panel-note"><strong>Fragrance that resides in you.</strong></p><p class="panel-note">VASA takes its name from “Vāsa”: dwelling, presence and fragrance. We believe scent does more than stay on the skin. It resides in memory.</p><p class="panel-note">Our family’s roots in the perfume business are the foundation for a collection shaped by knowledge, care and personal expression.</p><p class="panel-note">Four compositions. Four distinct characters. Each unfolds through its opening, heart and base, becoming part of the way you remember a moment.</p><button class="button dark" data-continue>MEET THE COLLECTION '+icon+'</button>');return;}
 const entry=simplePanels[name];if(entry)showPanel(name,entry[0],`<p class="panel-note">${entry[1]}</p><button class="button dark" data-continue>EXPLORE THE COLLECTION ${icon}</button>`);
}
document.addEventListener('click',e=>{const el=e.target.closest('button,a');if(!el)return;if(el.dataset.panel)open(el.dataset.panel);else if(el.dataset.product)productPanel(el.dataset.product);else if(el.dataset.add){bag.add(el.dataset.add);toast(`${productById(el.dataset.add).name} added to your bag`);if(panel.open)bagPanel();}else if(el.dataset.quantity){const id=el.dataset.quantity,increment=el.textContent.trim()==='+';bag.set(id,Number(el.dataset.value));const controls=[...content.querySelectorAll(`[data-quantity="${id}"]`)];const target=controls.find(b=>(b.textContent.trim()==='+')===increment&&!b.disabled)||controls.find(b=>!b.disabled)||content.querySelector('[data-quantity], [data-continue]');target?.focus();}else if(el.dataset.remove){bag.remove(el.dataset.remove);content.querySelector('[data-remove], [data-continue]')?.focus();}else if(el.hasAttribute('data-continue')){closePanel();requestAnimationFrame(()=>document.querySelector('#collection').scrollIntoView({behavior:reduced.matches?'instant':'smooth'}));}else if(el.hasAttribute('data-dismiss')){closePanel();}});
// One contained editorial carousel. Every transition completes before the next requested slide.
const slides=[...document.querySelectorAll('.story-slide')],tabs=[...document.querySelectorAll('.story-tab')],stage=document.querySelector('.story-stage'),storyStack=document.querySelector('#story-slides');
const stageColor=hex=>{const value=parseInt(hex.slice(1),16),mix=.2,base=17;const channel=shift=>Math.round(((value>>shift)&255)*mix+base*(1-mix));return `rgb(${channel(16)}, ${channel(8)}, ${channel(0)})`};
if(stage&&storyStack&&slides.length&&tabs.length){
stage.style.backgroundColor=stageColor(catalog[0].color);
function lockStoryHeight(){
 let max=0;
 slides.forEach(slide=>{
  const wasHidden=slide.hidden;
  slide.hidden=false;
  slide.style.position='absolute';slide.style.visibility='hidden';slide.style.pointerEvents='none';slide.style.width='100%';
  max=Math.max(max,slide.scrollHeight);
  slide.style.position='';slide.style.visibility='';slide.style.pointerEvents='';slide.style.width='';
  slide.hidden=wasHidden;
 });
 storyStack.style.minHeight=max?`${max}px`:'';
}
lockStoryHeight();
document.fonts.ready.then(lockStoryHeight);
let storyResizeTimer;
addEventListener('resize',()=>{clearTimeout(storyResizeTimer);storyResizeTimer=setTimeout(lockStoryHeight,150)},{passive:true});
let current=0,busy=false,requested=null,destination=null,playing=false,timer=null,progressTween=null,inView=false;
schedule=()=>{clearTimeout(timer);progressTween?.kill();tabs.forEach(tab=>tab.style.setProperty('--fill','0'));if(playing&&inView&&!document.hidden&&!panel.open){progressTween=gsap.to(tabs[current],{'--fill':1,duration:6,ease:'none'});timer=setTimeout(()=>go(current+1),6000)}};
function go(index){index=(index+slides.length)%slides.length;if(busy){requested=index;return;}if(index===current){schedule();return;}busy=true;destination=index;clearTimeout(timer);progressTween?.kill();const from=slides[current],to=slides[index],direction=index>current?1:-1;to.hidden=false;to.inert=true;gsap.set([from,to],{position:'absolute',inset:0,width:'100%'});gsap.set(from,{zIndex:1});gsap.set(to,{zIndex:2});
 const finish=()=>{if(from.contains(document.activeElement))stage.focus({preventScroll:true});from.hidden=true;from.inert=true;to.inert=false;gsap.set([from,to],{clearProps:'position,inset,width,zIndex,clipPath,opacity,filter,transform'});gsap.set([from.querySelector('.story-copy'),to.querySelector('.story-copy')],{clearProps:'opacity,transform'});current=index;destination=null;busy=false;tabs.forEach((b,n)=>b.setAttribute('aria-pressed',String(n===index)));document.querySelector('#story-counter').textContent=`0${index+1} / 04`;document.querySelector('#story-status').textContent=catalog[index].name;if(requested!==null){const next=requested;requested=null;go(next)}else schedule();};
 if(reduced.matches){finish();return;}
 const timeline=gsap.timeline({onComplete:finish,defaults:{overwrite:'auto'}});
 timeline
  .set(to,{opacity:0,scale:1.012,filter:'brightness(.82)'})
  .to(from,{opacity:0,scale:.992,filter:'brightness(.68)',duration:.55,ease:'power2.inOut'},0)
  .to(from.querySelector('.story-copy'),{xPercent:-direction*2,opacity:0,duration:.4,ease:'power2.inOut'},0)
  .to(from.querySelector('.story-photo img'),{xPercent:-direction*2.5,scale:1.035,duration:.58,ease:'power2.inOut'},0)
  .to(stage,{backgroundColor:stageColor(catalog[index].color),duration:.6,ease:'sine.inOut'},0)
  .to(to,{opacity:1,scale:1,filter:'brightness(1)',duration:.58,ease:'power2.inOut'},.06)
  .fromTo(to.querySelector('.story-photo img'),{xPercent:direction*3,scale:1.055},{xPercent:0,scale:1,duration:.62,ease:'power3.out',clearProps:'all'},.06)
  .fromTo(to.querySelectorAll('.story-copy>*'),{x:direction*22,y:12,opacity:0},{x:0,y:0,opacity:1,duration:.4,stagger:.035,ease:'power3.out',clearProps:'all'},.16);
}
tabs.forEach((b,i)=>b.onclick=()=>go(i));document.querySelector('#story-next').onclick=()=>go((requested??destination??current)+1);document.querySelector('#story-prev').onclick=()=>go((requested??destination??current)-1);
stage.addEventListener('keydown',e=>{if(e.key==='ArrowRight'||e.key==='ArrowLeft'){e.preventDefault();go((requested??destination??current)+(e.key==='ArrowRight'?1:-1))}});
let touchX;stage.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')touchX=e.clientX});stage.addEventListener('pointerup',e=>{if(touchX!==undefined&&Math.abs(e.clientX-touchX)>45)go(current+(e.clientX<touchX?1:-1));touchX=undefined});stage.addEventListener('pointercancel',()=>{touchX=undefined});
function setPlaying(value){playing=value;const b=document.querySelector('#story-pause');b.textContent=value?'Ⅱ':'▷';b.setAttribute('aria-label',value?'Pause fragrance slideshow':'Play fragrance slideshow');schedule()}
document.querySelector('#story-pause').onclick=()=>setPlaying(!playing);
new IntersectionObserver(entries=>{inView=entries[0].isIntersecting;schedule()},{threshold:.3}).observe(stage);document.addEventListener('visibilitychange',schedule);if(!reduced.matches)setPlaying(true);
}
const siteHeader=document.querySelector('.site-header');
if(siteHeader){
 const hero=document.querySelector('.hero');
 const promo=document.querySelector('.promo-marquee');
 const updateHeaderState=()=>{
  const pastHero=hero?hero.getBoundingClientRect().bottom<=siteHeader.offsetHeight:false;
  const isScrolled=scrollY>20;
  siteHeader.classList.toggle('past-hero',pastHero);
  siteHeader.classList.toggle('scrolled',isScrolled);
  promo?.classList.toggle('is-hidden',isScrolled);
 };
 ScrollTrigger.create({trigger:hero||document.body,start:'top top',end:'max',onUpdate:updateHeaderState});
 addEventListener('scroll',updateHeaderState,{passive:true});
 addEventListener('resize',updateHeaderState,{passive:true});
 document.addEventListener('themechange',updateHeaderState);
 requestAnimationFrame(updateHeaderState);
}
initBitsEffects();
initFragranceTheatre();
initFestivalCarousel();
document.fonts.ready.then(()=>{const heroTitle=document.querySelector('#hero-title');if(!reduced.matches&&heroTitle){const split=SplitText.create(heroTitle,{type:'lines',linesClass:'hero-title-line',aria:'auto'});gsap.fromTo(heroTitle,{clipPath:'inset(0 100% 0 0)'},{clipPath:'inset(0 0% 0 0)',duration:1.35,ease:'power4.inOut',delay:.04,clearProps:'clipPath'});gsap.from(split.lines,{yPercent:108,opacity:0,duration:1.15,stagger:.13,ease:'power4.out',delay:.12});gsap.from('.hero-copy>.kicker,.hero-copy>.button',{opacity:0,y:12,duration:.8,stagger:.12,delay:.3});}initExperience();ScrollTrigger.refresh()});
const film=document.querySelector('#brand-film');
if(film){
 const hero=document.querySelector('.hero');
 const showFilm=()=>hero?.classList.add('has-film');
 const showPoster=()=>hero?.classList.remove('has-film');
 film.muted=true;
 film.defaultMuted=true;
 film.addEventListener('playing',showFilm);
 film.addEventListener('loadeddata',showFilm,{once:true});
 film.addEventListener('error',showPoster);
 const playback=film.play();
 playback?.catch(showPoster);
}
