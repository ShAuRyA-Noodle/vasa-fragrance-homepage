import {reduced} from './motion.js';

export function initFestivalCarousel(){
 const root=document.querySelector('[data-festival-carousel]');
 if(!root||root.dataset.festivalCarouselReady==='true')return null;
 root.dataset.festivalCarouselReady='true';

 const viewport=root.querySelector('.festival-carousel__viewport');
 const slides=[...root.querySelectorAll('.festival-carousel__slide')];
 const dots=[...root.querySelectorAll('[data-festival-dot]')];
 const previous=root.querySelector('[data-festival-prev]');
 const next=root.querySelector('[data-festival-next]');
 const pause=root.querySelector('[data-festival-pause]');
 const count=root.querySelector('.festival-carousel__count');
 const status=root.querySelector('[data-festival-status]');
 if(!viewport||slides.length<2)return null;

 let active=0;
 let timer;
 let inView=false;
 let hovering=false;
 let focused=false;
 let userPaused=reduced.matches;
 const delay=6800;
 const total=slides.length;

 const canPlay=()=>!reduced.matches&&!userPaused&&inView&&!hovering&&!focused&&!document.hidden;
 const schedule=()=>{
  clearTimeout(timer);
  if(canPlay())timer=setTimeout(()=>show(active+1),delay);
 };
 const setPauseControl=()=>{
  const playing=!userPaused;
  if(!pause)return;
  pause.textContent=playing?'Ⅱ':'▷';
  pause.setAttribute('aria-pressed',String(playing));
  pause.setAttribute('aria-label',playing?'Pause festival slideshow':'Play festival slideshow');
 };
 const show=nextIndex=>{
  const target=(nextIndex+total)%total;
  if(target===active){schedule();return;}
  slides[active].classList.remove('is-active');
  slides[active].setAttribute('aria-hidden','true');
  slides[active].setAttribute('inert','');
  dots[active]?.classList.remove('is-active');
  dots[active]?.setAttribute('aria-selected','false');
  if(dots[active])dots[active].tabIndex=-1;
  active=target;
  slides[active].classList.add('is-active');
  slides[active].setAttribute('aria-hidden','false');
  slides[active].removeAttribute('inert');
  dots[active]?.classList.add('is-active');
  dots[active]?.setAttribute('aria-selected','true');
  if(dots[active])dots[active].tabIndex=0;
  if(count)count.textContent=`${String(active+1).padStart(2,'0')} / ${String(total).padStart(2,'0')}`;
  status.textContent=slides[active].getAttribute('aria-label')||`Slide ${active+1} of ${total}`;
  schedule();
 };

 dots.forEach((dot,index)=>dot.addEventListener('click',()=>show(index)));
 previous?.addEventListener('click',()=>show(active-1));
 next?.addEventListener('click',()=>show(active+1));
 pause?.addEventListener('click',()=>{userPaused=!userPaused;setPauseControl();schedule()});
 viewport.addEventListener('keydown',event=>{
  if(event.key==='ArrowRight'){event.preventDefault();show(active+1)}
  else if(event.key==='ArrowLeft'){event.preventDefault();show(active-1)}
  else if(event.key==='Home'){event.preventDefault();show(0)}
  else if(event.key==='End'){event.preventDefault();show(total-1)}
 });
 root.addEventListener('pointerenter',()=>{hovering=true;schedule()});
 root.addEventListener('pointerleave',()=>{hovering=false;schedule()});
 root.addEventListener('focusin',()=>{focused=true;schedule()});
 root.addEventListener('focusout',event=>{if(!root.contains(event.relatedTarget)){focused=false;schedule()}});
 document.addEventListener('visibilitychange',schedule);
 new IntersectionObserver(entries=>{inView=entries[0]?.isIntersecting||false;schedule()},{threshold:.28}).observe(root);
 reduced.addEventListener?.('change',event=>{if(event.matches)userPaused=true;setPauseControl();schedule()});
 setPauseControl();
 return {show,pause:()=>{userPaused=true;setPauseControl();schedule()}};
}
