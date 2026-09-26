// Footer canvas effects, shared by every page that renders the canonical footer
// (campaign pages via bits-effects.js, store pages via store-shell.js).
const reduced=matchMedia('(prefers-reduced-motion:reduce)');

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
  const pixels=sampleContext.getImageData(0,0,width,height).data,targets=[],step=width<600?5:4;
  for(let y=0;y<height;y+=step)for(let x=0;x<width;x+=step)if(pixels[(y*width+x)*4+3]>80)targets.push({x,y});
  const stride=Math.max(1,Math.ceil(targets.length/2600));
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
   const gold=.25+.75*(particle.tx/Math.max(1,width)),lightTheme=document.documentElement.dataset.theme==='light';
   context.fillStyle=lightTheme
    ?`rgba(${Math.round(72-14*gold)},${Math.round(42-8*gold)},${Math.round(39-6*gold)},.98)`
    :`rgba(${Math.round(248-42*gold)},${Math.round(241-58*gold)},${Math.round(232-88*gold)},1)`;
   const particleSize=width<600?1.65:1.9;
   context.fillRect(particle.x,particle.y,particleSize,particleSize);
  });
  frame=requestAnimationFrame(render);
 };
 const observer=new IntersectionObserver(([entry])=>{visible=entry.isIntersecting;if(visible&&!frame)frame=requestAnimationFrame(render);},{threshold:.08});
 root.addEventListener('pointermove',event=>{const box=root.getBoundingClientRect();pointer.active=true;pointer.x=event.clientX-box.left;pointer.y=event.clientY-box.top});
 root.addEventListener('pointerleave',()=>{pointer.active=false});
 new ResizeObserver(()=>{build();if(visible&&!frame)frame=requestAnimationFrame(render)}).observe(root);
 document.addEventListener('themechange',()=>{started=performance.now();if(visible&&!frame)frame=requestAnimationFrame(render)});
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

export function initFooterEffects(){
 initParticleText();
 initTopography();
}
