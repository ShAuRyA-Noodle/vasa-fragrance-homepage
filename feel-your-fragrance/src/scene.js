import * as THREE from 'three';
import gsap from 'gsap';
import {makeWater} from './water.js';
import {createIngredient,preloadIngredients,disposeIngredientTextures} from './models.js';
import {createQuizBackdrop} from './quiz-backdrop.js';
import {loadProductPlates,createProductPlate} from './product-plates.js';
import {products,families} from './catalog.js';
import {atmosphereVertex,atmosphereFragment,FinishShader} from './shaders.js';
import {RippleEmitter} from './ripple-field.js';
import {createCelestialArc} from './celestial-arc.js';

export class ExperienceScene {
 constructor(host,{reduced=false,onReady,onFail}){
  this.host=host;this.reduced=reduced;this.paused=reduced;this.onFail=onFail;this.state={screen:'home',view:'gallery',selected:0,family:0,intensity:50};this.pointer=new THREE.Vector2();this.smoothed=new THREE.Vector2();this.look={x:0,y:1.7,z:0};this.pose={x:0,y:1.65,z:11.1};this.time=0;this.clock=new THREE.Timer();this.assets=[];this.disposed=false;this.lastRenderAt=0;this.lastAnimationTime=0;this.activeUntil=0;this.needsRender=true;
  // No canvas MSAA: the soft backdrop and water don't need it, and the bottle
  // plates carry their own anti-aliased alpha edges.
  try{this.renderer=new THREE.WebGLRenderer({antialias:false,alpha:true,powerPreference:'high-performance'});}catch(e){onFail(e);return;}
  this.pixelRatio=this.getPixelRatio(host.clientWidth);this.renderer.setPixelRatio(this.pixelRatio);this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.78;
  // None of the scene meshes cast or receive a shadow. Disabling the empty
  // shadow-map traversal removes a render pass without changing the image.
  this.renderer.shadowMap.enabled=false;host.append(this.renderer.domElement);
  this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.onFail(new Error('WebGL context lost'));});
  this.world=new THREE.Scene();this.world.background=new THREE.Color('#070B14');this.world.fog=new THREE.FogExp2('#0D1628',.017);
  this.camera=new THREE.PerspectiveCamera(34,1,.1,100);this.camera.position.set(0,3.7,13.6);
  this.world.add(this.camera);
  const studio=new THREE.Scene();studio.background=new THREE.Color('#0D1628');
  const panel=(x,y,z,w,h,power,color)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(power),side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,2,0);studio.add(m);};
  panel(-4,3,3,1.1,7,2.6,'#CBB98D');panel(4,3,2,.55,6,1.15,'#293850');panel(0,6,-3,6,2,.75,'#293850');panel(0,2,-6,4,5,.2,'#CBB98D');
  const pmrem=new THREE.PMREMGenerator(this.renderer);this.environment=pmrem.fromScene(studio,.035);pmrem.dispose();studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  this.world.environment=this.environment.texture;
  this.carousel=new THREE.Group();this.rig=new THREE.Group();this.rig.add(this.carousel);this.world.add(this.rig);this.dragTarget=0;this.dragCurrent=0;this.tempQuaternion=new THREE.Quaternion();
  this.raycaster=new THREE.Raycaster();this.waterPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);this.waterHit=new THREE.Vector3();this.rippleIndex=0;this.lastRipple=0;
  this.screenRippleIndex=0;this.rippleEmitter=new RippleEmitter({spacing:15,clickStrength:2});
  this.makeLights();this.makeAtmosphere();this.makeConstellation();this.makeFloor();this.makeDust();
  // Rendered straight to the canvas: materials tone-map themselves and the grain and
  // vignette are a CSS overlay, so there is no full-screen post pass to pay for.
  this.finish={uniforms:THREE.UniformsUtils.clone(FinishShader.uniforms)};this.finish.uniforms.cursor.value=new THREE.Vector2(.5,.5);this.finish.uniforms.ripples.value=Array.from({length:12},()=>new THREE.Vector4(0,0,-10,0));
  this.resize=()=>{const w=host.clientWidth,h=host.clientHeight;this.mobile=w<761;const pixelRatio=this.getPixelRatio(w);if(pixelRatio!==this.pixelRatio){this.pixelRatio=pixelRatio;this.renderer.setPixelRatio(pixelRatio);}this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.celestialArc?.resize(w/h,pixelRatio);this.backdrop?.resize(w/h);if(this.atmosphere)this.atmosphere.material.uniforms.narrow.value=Math.max(1,1.6/(w/h));this.needsSky=true;this.wake(.3);if(this.finish){this.finish.uniforms.aspect.value=w/h;this.finish.uniforms.rippleRadius.value=150/h;}if(this.bottles)this.setState(this.state,true);};
  this.observer=new ResizeObserver(this.resize);this.observer.observe(host);this.resize();
  this.move=e=>{const nx=(e.clientX/innerWidth-.5)*2,ny=(e.clientY/innerHeight-.5)*2;this.cursorVelocity=Math.min(1,Math.hypot(nx-this.pointer.x,ny-this.pointer.y)*15);this.pointer.set(nx,ny);this.wake(.18);if(!this.paused&&this.time-this.lastRipple>.08){this.raycaster.setFromCamera(new THREE.Vector2(nx,-ny),this.camera);if(this.raycaster.ray.intersectPlane(this.waterPlane,this.waterHit)&&Math.abs(this.waterHit.x)<30&&Math.abs(this.waterHit.z)<35){this.floor.material.uniforms.ripples.value[this.rippleIndex%8].set(this.waterHit.x,this.waterHit.z,this.time,.5+this.cursorVelocity);this.rippleIndex++;this.lastRipple=this.time;this.wake(3.4);}}};window.addEventListener('pointermove',this.move,{passive:true});
  this.press=e=>{if(this.paused||this.reduced)return;const nx=(e.clientX/innerWidth-.5)*2,ny=(e.clientY/innerHeight-.5)*2;this.raycaster.setFromCamera(new THREE.Vector2(nx,-ny),this.camera);if(this.raycaster.ray.intersectPlane(this.waterPlane,this.waterHit)&&Math.abs(this.waterHit.x)<30&&Math.abs(this.waterHit.z)<35){this.floor.material.uniforms.ripples.value[this.rippleIndex%8].set(this.waterHit.x,this.waterHit.z,this.time,2.2);this.rippleIndex++;this.wake(3.4);}};window.addEventListener('pointerdown',this.press,{passive:true});
  this.leave=()=>this.rippleEmitter.reset();document.addEventListener('pointerleave',this.leave);
  this.visibility=()=>{this.clock.update();};document.addEventListener('visibilitychange',this.visibility);
  this.init().then(thumbnails=>{if(this.disposed)return;this.setState(this.state,true);onReady(thumbnails);this.renderer.setAnimationLoop(()=>this.frame());}).catch(onFail);
 }
  // Native sharpness up to 1.5x; adaptive quality may trade some of it away, never below 1x.
 getPixelRatio(){const native=Math.min(devicePixelRatio,1.5);return Math.max(Math.min(devicePixelRatio,1),native*(this.quality??1));}
 wake(seconds=.25){this.activeUntil=Math.max(this.activeUntil,performance.now()+seconds*1000);this.needsRender=true;}
 async init(){
  await document.fonts.ready;await Promise.all([document.fonts.load('38px Bodoni'),document.fonts.load('74px Cormorant')]);
  const [plates,backdrop]=await Promise.all([loadProductPlates(),createQuizBackdrop(this.camera),preloadIngredients(products.flatMap(p=>[p.ingredient,p.secondary]))]);this.plateTextures=plates;this.backdrop=backdrop;backdrop.resize(this.camera.aspect);this.bottles=products.map((p,i)=>{const g=createProductPlate(p,plates[i]);this.carousel.add(g);return g;});
  this.propGroups=products.map((p,i)=>{const g=new THREE.Group();const a=createIngredient(p.ingredient,2.45);a.position.set(-1.65,.72,-.18);a.rotation.z=.15;this.styleIngredient(a,.82,.12);g.add(a);const b=createIngredient(p.secondary,1.38);b.position.set(1.32,.22,.35);b.rotation.z=-.3;this.styleIngredient(b,.58,.56);g.add(b);g.scale.setScalar(.001);this.carousel.add(g);return g;});
  this.shadows.forEach(s=>this.carousel.add(s));
 return products.map(p=>`/plates/${p.id}.png`);
 }
 styleIngredient(mesh,opacity,focus){const material=mesh.userData.ingredientMaterial;if(material){material.uniforms.opacity.value=opacity;material.uniforms.focus.value=focus;}}
 makeLights(){
  this.world.add(new THREE.AmbientLight('#293850',.14));
  const key=new THREE.DirectionalLight('#CBB98D',1.05);key.position.set(-3,7,5);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-9;key.shadow.camera.right=9;key.shadow.camera.top=9;key.shadow.camera.bottom=-9;key.shadow.bias=-.001;this.world.add(key);
  const rim=new THREE.DirectionalLight('#61758e',1.35);rim.position.set(5,4,-4);this.world.add(rim);
  const side=new THREE.DirectionalLight('#806b4e',.36);side.position.set(-7,2,-2);this.world.add(side);
  const panel=new THREE.RectAreaLight('#CBB98D',2.1,3.5,7);panel.position.set(3,4,5);panel.lookAt(0,1,0);this.world.add(panel);
 }
 makeAtmosphere(){
  // The backdrop is soft, so it is drawn into a small texture (about 30 times a
  // second) instead of being shaded per screen pixel, and again for the reflection.
  const uniforms={time:{value:0},tint:{value:new THREE.Color('#0D1628')},dream:{value:0},scenery:{value:new THREE.Vector4()},scenery2:{value:new THREE.Vector4()},narrow:{value:1}};
  this.skyTarget=new THREE.WebGLRenderTarget(768,480,{type:THREE.HalfFloatType,depthBuffer:false});
  this.skyScene=new THREE.Scene();this.skyCamera=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
  this.skyScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2),new THREE.ShaderMaterial({vertexShader:'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}',fragmentShader:atmosphereFragment,uniforms,depthTest:false,depthWrite:false})));
  this.atmosphere=new THREE.Mesh(new THREE.PlaneGeometry(42,26),new THREE.ShaderMaterial({vertexShader:atmosphereVertex,fragmentShader:`uniform sampler2D sky;varying vec2 vUv;void main(){gl_FragColor=vec4(texture2D(sky,vUv).rgb,1.);
#include <tonemapping_fragment>
#include <colorspace_fragment>
}`,uniforms:{...uniforms,sky:{value:this.skyTarget.texture}},depthWrite:false}));this.atmosphere.position.set(0,6,-20);this.world.add(this.atmosphere);
  this.lastSkyAt=-1;
 }
 renderSky(){const r=this.renderer,prev=r.getRenderTarget();r.setRenderTarget(this.skyTarget);r.render(this.skyScene,this.skyCamera);r.setRenderTarget(prev);}
 makeConstellation(){
  this.celestialArc=createCelestialArc(this.camera);
 }
 makeFloor(){
  this.floor=makeWater();this.world.add(this.floor);
  this.floorSkin=new THREE.Group();this.world.add(this.floorSkin);
  const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),gr=ctx.createRadialGradient(64,64,1,64,64,64);gr.addColorStop(0,'rgba(0,0,0,.65)');gr.addColorStop(1,'rgba(0,0,0,0)');ctx.fillStyle=gr;ctx.fillRect(0,0,128,128);const t=new THREE.CanvasTexture(c);
  this.shadows=products.map(()=>{const s=new THREE.Mesh(new THREE.PlaneGeometry(2.4,1.8),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false}));s.rotation.x=-Math.PI/2;s.position.y=.002;this.world.add(s);return s;});
 }
 makeDust(){
  const pos=[],size=[];for(let i=0;i<105;i++){pos.push((Math.random()-.5)*25,Math.random()*12-2,Math.random()*15-6);size.push(Math.random()*2+.4);}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('aSize',new THREE.Float32BufferAttribute(size,1));
  this.dust=new THREE.Points(g,new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:{value:0}},vertexShader:`attribute float aSize;uniform float time;varying float alpha;void main(){vec3 p=position;p.x+=sin(time*.07+p.z)*.2;p.y+=sin(time*.08+p.x)*.35;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min(10.,aSize*24./-mv.z);alpha=.2+.3*sin(p.x*3.+time*.15);}`,fragmentShader:`varying float alpha;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(vec3(.91,.84,.66),(1.-smoothstep(.0,1.,d))*alpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
}`}));this.world.add(this.dust);
 }
 setState(state,immediate=false){
  this.state={...state};if(!this.bottles)return;
  if(this.timeline)this.timeline.kill();gsap.killTweensOf(this.pose);if(immediate||this.reduced)this.finish.uniforms.travel.value=0;const d=(immediate||this.reduced) ? .01 : 1.7;this.wake(d+.2);const timeline=gsap.timeline({defaults:{duration:d,ease:'power3.inOut'}});this.timeline=timeline;
  const isQuiz=['intensity','notes'].includes(state.screen),isGallery=state.screen==='collection',isList=isGallery&&state.view==='list';
  const mobile=this.mobile;
  let camera={x:0,y:1.65,z:mobile?16.9:11.1},look={x:0,y:2.2,z:0};
  if(isGallery){camera={x:0,y:1.42,z:mobile?18.1:15.4};look={x:0,y:1.88,z:4.7};}
  if(isList){camera={x:.3,y:.38,z:9.5};look={x:0,y:-.7,z:-5};}
  if(isQuiz){camera={x:0,y:2.9,z:mobile?11.5:10.6};look={x:0,y:2.9,z:0};}
  timeline.to(this.pose,camera,0).to(this.look,look,0);
  if(!immediate&&!this.reduced){timeline.to(this.finish.uniforms.travel,{value:1,duration:d*.45,ease:'sine.inOut'},0).to(this.finish.uniforms.travel,{value:0,duration:d*.55,ease:'sine.inOut'},d*.45);}
  let angle=-state.selected*Math.PI/2-(mobile?0:.22);if(isGallery){const current=this.carousel.rotation.y;angle+=Math.round((current-angle)/(Math.PI*2))*Math.PI*2;}else angle=0;
  timeline.to(this.carousel.rotation,{y:angle},0).to(this.carousel.position,{x:isGallery&&!mobile?-.45:0},0);
  const tint=state.screen==='intensity'?'#343947':state.screen==='notes'?families[state.family].color:'#0D1628';const color=new THREE.Color(tint);
  const sky=new THREE.Color(isGallery?products[state.selected].sky:'#ffffff');timeline.to(this.celestialArc.tint,{r:sky.r,g:sky.g,b:sky.b,duration:Math.min(d,1.1)},0).to(this.celestialArc.tintMix,{value:isGallery?.82:0,duration:Math.min(d,1.1)},0);
  const hz=new THREE.Color(isGallery?products[state.selected].horizon:'#314359');timeline.to(this.floor.material.uniforms.horizonTint.value,{r:hz.r,g:hz.g,b:hz.b,duration:Math.min(d,1.2)},0).to(this.floor.material.uniforms.horizonFog,{value:isGallery?1:0,duration:Math.min(d,1.2)},0);
  if(this.backdrop){const b=this.backdropState(state),u=this.backdrop.uniforms;timeline.to(u.weights.value,{x:b.w[0],y:b.w[1],z:b.w[2],w:b.w[3],duration:Math.min(d,1.3),ease:'sine.inOut'},0).to(u.blur,{value:b.blur,duration:Math.min(d,1.6),ease:'power2.inOut'},0).to(u.opacity,{value:b.opacity,duration:Math.min(d,1.1),ease:'sine.inOut'},0).to(this.celestialArc.fade,{value:b.opacity>.5?0:1,duration:Math.min(d,1.1)},0);}
  const [w,w2]=this.sceneWeights(state);const sd=Math.min(d,1.2);timeline.to(this.atmosphere.material.uniforms.scenery.value,{x:w[0],y:w[1],z:w[2],w:w[3],duration:sd,ease:'sine.inOut'},0).to(this.atmosphere.material.uniforms.scenery2.value,{x:w2[0],y:w2[1],z:w2[2],w:w2[3],duration:sd,ease:'sine.inOut'},0);
  timeline.to(this.atmosphere.material.uniforms.tint.value,{r:color.r,g:color.g,b:color.b},0).to(this.atmosphere.material.uniforms.dream,{value:isQuiz?1:0},0);
  timeline.to(this.floor.material.uniforms.presence,{value:isQuiz?0:1},0).to(this.floor.position,{y:-.012},0).to(this.floorSkin.position,{y:isQuiz?-6.99:-.009},0);
  this.bottles.forEach((b,i)=>{
    let x=0,y=0,z=0,s=1,r=0;
    if(state.screen==='home'){
      // A calm, low pyramid keeps four fragrances readable as a family. The
      // hero has only a slight lead, so it never invades the wordmark zone.
      const poses=[[-.52,0,.42,-.015,1.0],[-1.62,.08,-.72,-.12,.88],[1.58,.07,-.66,.12,.9],[.42,.38,-1.48,.02,.76]];[x,y,z,r,s]=poses[i];
    }else if(isGallery){
      const theta=i*Math.PI/2;x=Math.sin(theta)*5.2;z=Math.cos(theta)*5.2;r=theta;y=isList?7:0;s=i===state.selected?1.04:.66;
    }else{ x=(i-1.5)*3;y=-7;z=-4;s=.7;}
    timeline.to(b.position,{x,y,z},0).to(b.rotation,{y:r},0).to(b.scale,{x:s,y:s,z:s},0);
    const props=this.propGroups[i];const ps=isGallery&&!isList?(i===state.selected?1:.52):.001;
    timeline.to(props.position,{x,y,z},0).to(props.rotation,{y:r},0).to(props.scale,{x:ps,y:ps,z:ps},0);
    timeline.to(this.shadows[i].position,{x,y:isQuiz||isList?-7:.002,z},0).to(this.shadows[i].scale,{x:s*1.18,y:s*.88,z:s},0);
  });
  if(immediate)timeline.progress(1);
 }
 // Procedural sky scenes: one per product in the collection.
 sceneWeights(state){const w=[0,0,0,0];if(state.screen==='collection')w[state.selected]=1;return [w,[0,0,0,0]];}
 // Photo backdrop for the quiz. Step 01 is a defocused blend of the amber
 // (luminous) and oud (opulent) plates; step 02 pulls focus onto the family's plate.
 backdropState(state){
  const w=[0,0,0,0];let blur=0,opacity=1;
  if(state.screen==='intensity'){const v=state.intensity/100;w[2]=1-v;w[3]=v;blur=1;}
  else if(state.screen==='notes')w[state.family]=1;
  else opacity=0;
  return {w,blur,opacity};
 }
 setIntensity(value){if(this.state.screen!=='intensity')return;this.state.intensity=value;if(this.backdrop)gsap.to(this.backdrop.uniforms.weights.value,{z:1-value/100,w:value/100,duration:.5,overwrite:'auto'});const a=new THREE.Color('#78765a'),b=new THREE.Color('#35392c');a.lerp(b,value/100);this.wake(.6);gsap.to(this.atmosphere.material.uniforms.tint.value,{r:a.r,g:a.g,b:a.b,duration:.5,overwrite:'auto'});}
 setPaused(value){this.paused=value;if(value){this.rippleEmitter.reset();this.finish.uniforms.ripples.value.forEach(ripple=>ripple.set(0,0,-10,0));}this.wake(.12);}
 setDrag(value){this.dragTarget=value*.35;this.wake(.2);}
 enter(){this.settleUntil=performance.now()+3000;if(!this.reduced){const z=this.pose.z;this.pose.z+=1.7;this.wake(2.8);gsap.to(this.pose,{z,duration:2.6,ease:'power3.out'});}}
 frame(){
  if(this.disposed)return;this.clock.update();const dt=Math.min(this.clock.getDelta(),.05);if(document.hidden)return;if(!this.paused)this.time+=dt;
  const now=performance.now();if(this.paused&&!this.needsRender)return;if(!this.needsRender&&now-this.lastRenderAt<(now<this.activeUntil?0:1000/30))return;const renderDt=Math.min(Math.max(this.time-this.lastAnimationTime,dt),.05);this.lastAnimationTime=this.time;this.lastRenderAt=now;this.needsRender=false;
  const t=this.time;const damp=1-Math.exp(-renderDt*2.8);this.smoothed.lerp(this.paused?new THREE.Vector2():this.pointer,damp);
  this.camera.position.set(this.pose.x+this.smoothed.x*.24,this.pose.y-this.smoothed.y*.10,this.pose.z);this.camera.lookAt(this.look.x+this.smoothed.x*.025,this.look.y,this.look.z);this.dragCurrent+=(this.dragTarget-this.dragCurrent)*(1-Math.exp(-renderDt*8));this.rig.rotation.y=this.dragCurrent;
  this.world.updateMatrixWorld();this.bottles?.forEach(b=>{const p=b.userData.plate;b.getWorldQuaternion(this.tempQuaternion);p.quaternion.copy(this.tempQuaternion.invert()).multiply(this.camera.quaternion);p.material.uniforms.light.value.copy(this.smoothed);p.material.uniforms.time.value=t;});
  this.atmosphere.material.uniforms.time.value=t;this.floor.material.uniforms.time.value=t;this.dust.material.uniforms.time.value=t;this.celestialArc.material.uniforms.time.value=t;this.celestialArc.hazeMaterial.uniforms.time.value=t;this.celestialArc.group.position.x=-this.smoothed.x*.008;this.celestialArc.group.position.y=this.smoothed.y*.004;this.finish.uniforms.time.value=this.paused?0:t;this.finish.uniforms.cursor.value.set((this.smoothed.x+1)/2,1-(this.smoothed.y+1)/2);this.cursorVelocity=(this.cursorVelocity||0)*Math.exp(-renderDt*4);this.finish.uniforms.velocity.value=this.paused?0:this.cursorVelocity;
  const covered=this.backdrop&&this.backdrop.uniforms.opacity.value>.995;
  if(this.backdrop){const u=this.backdrop.uniforms;this.backdrop.mesh.visible=u.opacity.value>.001;u.time.value=t;u.pointer.value.set(this.smoothed.x+Math.sin(t*.13)*.35,-this.smoothed.y+Math.cos(t*.11)*.25);}
  this.atmosphere.visible=!covered;this.celestialArc.group.visible=this.celestialArc.fade.value>.01;this.floor.visible=this.floor.material.uniforms.presence.value>.001;
  const nowS=now/1000;if(!covered&&(nowS-this.lastSkyAt>=1/30||this.needsSky)){this.renderSky();this.lastSkyAt=nowS;this.needsSky=false;}
  this.renderer.render(this.world,this.camera);
  if(now<this.activeUntil)this.adaptQuality(dt);
 }
 adaptQuality(dt){
  if(dt>.1||performance.now()<(this.settleUntil||0))return;
  this.frameSum=(this.frameSum||0)+dt;this.frameCount=(this.frameCount||0)+1;if(this.frameCount<45)return;
  const avg=this.frameSum/this.frameCount;this.frameSum=0;this.frameCount=0;this.quality=this.quality??1;
  const next=avg>.021?Math.max(.7,this.quality-.15):avg<.0135?Math.min(1,this.quality+.15):this.quality;
  if(next!==this.quality){this.quality=next;const w=this.host.clientWidth,h=this.host.clientHeight;this.pixelRatio=this.getPixelRatio(w);this.renderer.setPixelRatio(this.pixelRatio);this.renderer.setSize(w,h);this.celestialArc.resize(w/h,this.pixelRatio);}
 }
 dispose(){this.disposed=true;this.renderer?.setAnimationLoop(null);this.timeline?.kill();this.observer?.disconnect();window.removeEventListener('pointermove',this.move);window.removeEventListener('pointerdown',this.press);document.removeEventListener('pointerleave',this.leave);document.removeEventListener('visibilitychange',this.visibility);this.world?.traverse(o=>{if(o.isMesh||o.isPoints||o.isLineSegments){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});this.environment?.dispose();this.plateTextures?.forEach(t=>t.dispose());disposeIngredientTextures();this.backdrop?.dispose();this.renderer?.dispose();}
}
