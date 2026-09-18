import {gsap,ScrollTrigger,reduced} from './motion.js';

const finePointer=matchMedia('(hover:hover) and (pointer:fine)');

function initWordLoop(){
 const root=document.querySelector('.word-loop');
 const words=root?[...root.children]:[];
 if(words.length<2)return;
 gsap.set(words,{yPercent:120,opacity:0});
 gsap.set(words[0],{yPercent:0,opacity:1});
 if(reduced.matches)return;
 const tl=gsap.timeline({repeat:-1,repeatDelay:.45});
 words.forEach((word,index)=>{
  const next=words[(index+1)%words.length];
  tl.to(word,{yPercent:-120,opacity:0,duration:.55,ease:'power3.inOut'},index*2.1)
    .fromTo(next,{yPercent:120,opacity:0},{yPercent:0,opacity:1,duration:.55,ease:'power3.inOut'},index*2.1+.12);
 });
}

function initCurvedLoop(){
 const path=document.querySelector('.gift-curve textPath');
 if(!path)return;
 const phrase=path.textContent.trim()+' ';
 path.textContent=phrase.repeat(4);
 if(reduced.matches)return;
 gsap.fromTo(path,{attr:{startOffset:'0%'}},{attr:{startOffset:'-25%'},duration:26,ease:'none',repeat:-1});
}

function initPointerLighting(){
 if(!finePointer.matches)return;
 document.querySelectorAll('.product-image,.mood-gallery-panel').forEach(element=>{
  element.addEventListener('pointermove',event=>{
   const box=element.getBoundingClientRect();
   element.style.setProperty('--mouse-x',`${event.clientX-box.left}px`);
   element.style.setProperty('--mouse-y',`${event.clientY-box.top}px`);
  });
 });
}

function initGallery(){
 const track=document.querySelector('.mood-gallery-track');
 if(!track)return;
 const panels=[...track.querySelectorAll('.mood-gallery-panel')];
 const activate=panel=>panels.forEach(item=>item.classList.toggle('is-active',item===panel));
 panels.forEach(panel=>{
  panel.addEventListener('pointerenter',()=>activate(panel));
  panel.addEventListener('focus',()=>activate(panel));
 });
 if(!reduced.matches){
  gsap.from(panels,{y:46,opacity:0,duration:1,stagger:.08,ease:'power3.out',clearProps:'transform,opacity',scrollTrigger:{trigger:track,start:'top 82%',once:true}});
 }
}

function initClickSpark(){
 const canvas=document.createElement('canvas');
 canvas.id='click-spark-canvas';
 canvas.setAttribute('aria-hidden','true');
 document.body.append(canvas);
 const context=canvas.getContext('2d');
 let width=0,height=0,dpr=1,frame=0;
 const sparks=[];
 const resize=()=>{
  width=innerWidth;height=innerHeight;dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);
  canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;
  context.setTransform(dpr,0,0,dpr,0,0);
 };
 const draw=now=>{
  context.clearRect(0,0,width,height);
  for(let index=sparks.length-1;index>=0;index--){
   const spark=sparks[index],progress=Math.min(1,(now-spark.start)/520);
   if(progress>=1){sparks.splice(index,1);continue;}
   const eased=1-Math.pow(1-progress,3);
   context.lineWidth=1.2;
   spark.angles.forEach((angle,ray)=>{
    const color=spark.colors[ray%spark.colors.length];
    context.strokeStyle=`rgba(${color},${1-progress})`;
    const inner=4+eased*10,outer=10+eased*26;
    context.beginPath();
    context.moveTo(spark.x+Math.cos(angle)*inner,spark.y+Math.sin(angle)*inner);
    context.lineTo(spark.x+Math.cos(angle)*outer,spark.y+Math.sin(angle)*outer);
    context.stroke();
   });
  }
  if(sparks.length)frame=requestAnimationFrame(draw);else frame=0;
 };
 resize();addEventListener('resize',resize,{passive:true});
 if(reduced.matches)return;
 addEventListener('pointerdown',event=>{
  if(!event.target.closest('button,a'))return;
  const dark=Boolean(event.target.closest('.hero,.story-stage,footer,.gift-art,.button.dark'));
  sparks.push({x:event.clientX,y:event.clientY,start:performance.now(),colors:dark?['244,226,190','184,145,78']:['147,111,55','202,164,94'],angles:Array.from({length:8},(_,index)=>index*Math.PI/4)});
  if(!frame)frame=requestAnimationFrame(draw);
 },{passive:true});
}

function initParticleText(){
 const canvas=document.querySelector('#footer-particle-canvas');
 const root=canvas?.closest('.footer-particle');
 if(!canvas||!root)return;
 const context=canvas.getContext('2d');
 let width=0,height=0,dpr=1,particles=[],started=0,visible=false,frame=0;
 const pointer={active:false,x:0,y:0};
 const build=()=>{
  const box=root.getBoundingClientRect();width=Math.max(1,Math.round(box.width));height=Math.max(1,Math.round(box.height));dpr=Math.min(devicePixelRatio||1,2);
  canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;context.setTransform(dpr,0,0,dpr,0,0);
  const sample=document.createElement('canvas'),sampleContext=sample.getContext('2d',{willReadFrequently:true});
  sample.width=width;sample.height=height;
  const size=Math.min(height*.72,width*.205);
  sampleContext.font=`500 ${size}px Manrope, Arial, sans-serif`;sampleContext.textAlign='center';sampleContext.textBaseline='middle';sampleContext.fillStyle='#fff';sampleContext.fillText('VASA',width/2,height/2);
  const pixels=sampleContext.getImageData(0,0,width,height).data,targets=[],step=width<600?7:5;
  for(let y=0;y<height;y+=step)for(let x=0;x<width;x+=step)if(pixels[(y*width+x)*4+3]>80)targets.push({x,y});
  const stride=Math.max(1,Math.ceil(targets.length/1700));
  particles=targets.filter((_,index)=>index%stride===0).map((target,index)=>{
   const seed=((index*9301+49297)%233280)/233280,angle=seed*Math.PI*2,distance=reduced.matches?0:80+seed*160;
   return {tx:target.x,ty:target.y,x:target.x+Math.cos(angle)*distance,y:target.y+Math.sin(angle)*distance,seed};
  });
  started=performance.now();
 };
 const render=now=>{
  if(!visible){frame=0;return;}
  context.clearRect(0,0,width,height);
  const progress=reduced.matches?1:Math.min(1,(now-started)/1700),ease=1-Math.pow(1-progress,3);
  particles.forEach(particle=>{
   let targetX=particle.tx,targetY=particle.ty;
   if(progress>=1&&!reduced.matches){targetX+=Math.sin(now*.00045+particle.seed*12)*.65;targetY+=Math.cos(now*.00038+particle.seed*9)*.5;}
   if(pointer.active&&!reduced.matches){const dx=targetX-pointer.x,dy=targetY-pointer.y,distance=Math.hypot(dx,dy);if(distance>0&&distance<115){const force=(1-distance/115)*34;targetX+=dx/distance*force;targetY+=dy/distance*force;}}
   if(progress<1){particle.x+=(particle.tx-particle.x)*(.025+.11*ease);particle.y+=(particle.ty-particle.y)*(.025+.11*ease);}else{particle.x+=(targetX-particle.x)*.14;particle.y+=(targetY-particle.y)*.14;}
   const gold=.25+.75*(particle.tx/Math.max(1,width));
   context.fillStyle=`rgba(${Math.round(225-45*gold)},${Math.round(218-76*gold)},${Math.round(202-110*gold)},.9)`;
   context.fillRect(particle.x,particle.y,1.35,1.35);
  });
  frame=requestAnimationFrame(render);
 };
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible&&!frame)frame=requestAnimationFrame(render);},{threshold:.08});
 root.addEventListener('pointermove',event=>{const box=root.getBoundingClientRect();pointer.active=true;pointer.x=event.clientX-box.left;pointer.y=event.clientY-box.top});
 root.addEventListener('pointerleave',()=>{pointer.active=false});
 new ResizeObserver(()=>{build();if(visible&&!frame)frame=requestAnimationFrame(render)}).observe(root);
 observer.observe(root);build();
}

function initTopography(){
 const canvas=document.querySelector('#footer-topography');
 const footer=canvas?.closest('footer');
 if(!canvas||!footer)return;
 const context=canvas.getContext('2d');
 let width=0,height=0,dpr=1,visible=false,frame=0,last=0;
 const resize=()=>{const box=footer.getBoundingClientRect();width=Math.max(1,Math.round(box.width));height=Math.max(1,Math.round(box.height));dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(width*dpr);canvas.height=Math.round(height*dpr);canvas.style.width=`${width}px`;canvas.style.height=`${height}px`;context.setTransform(dpr,0,0,dpr,0,0)};
 const draw=time=>{
  if(!visible){frame=0;return;}if(time-last<45){frame=requestAnimationFrame(draw);return;}last=time;context.clearRect(0,0,width,height);
  context.lineWidth=.7;
  for(let band=0;band<18;band++){
   context.beginPath();
   for(let x=-20;x<=width+20;x+=14){const y=height*(.08+band/20)+Math.sin(x*.008+band*.62+time*.00008)*18+Math.sin(x*.019-band*.37)*7;x===-20?context.moveTo(x,y):context.lineTo(x,y)}
   context.strokeStyle=`rgba(180,143,78,${.035+band*.0015})`;context.stroke();
  }
  if(!reduced.matches)frame=requestAnimationFrame(draw);else frame=0;
 };
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible&&!frame)frame=requestAnimationFrame(draw)},{threshold:.02});
 new ResizeObserver(resize).observe(footer);observer.observe(footer);resize();
}

function initSectionSpy(){
 const links=[...document.querySelectorAll('.nav-left a[href^="#"],.nav-right a[href^="#"]')];
 const entries=links.map(link=>({link,section:document.querySelector(link.getAttribute('href'))})).filter(entry=>entry.section);
 if(!entries.length)return;
 const activate=target=>entries.forEach(entry=>entry.link.classList.toggle('is-active',entry.section===target));
 const observer=new IntersectionObserver(items=>{const visible=items.filter(item=>item.isIntersecting).sort((a,b)=>b.intersectionRatio-a.intersectionRatio)[0];if(visible)activate(visible.target)},{rootMargin:'-30% 0px -55%',threshold:[0,.1,.35,.7]});
 entries.forEach(entry=>observer.observe(entry.section));
 links.forEach(link=>link.addEventListener('click',()=>{const section=document.querySelector(link.getAttribute('href'));if(section)activate(section)}));
}

export function animatePanelContent(kind){
 if(reduced.matches)return;
 const selector=kind==='menu'?'.menu-links>*':'.search-result';
 const items=[...document.querySelectorAll(selector)];
 if(!items.length)return;
 gsap.fromTo(items,{y:kind==='menu'?38:18,opacity:0,rotate:kind==='menu'?1.5:0},{y:0,opacity:1,rotate:0,duration:.7,stagger:.07,ease:'power4.out',clearProps:'transform,opacity'});
}

export function initBitsEffects(){
 initWordLoop();
 initCurvedLoop();
 initPointerLighting();
 initGallery();
 initClickSpark();
 initParticleText();
 initTopography();
 initSectionSpy();
 requestAnimationFrame(()=>ScrollTrigger.refresh());
}
