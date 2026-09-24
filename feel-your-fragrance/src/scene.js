import * as THREE from 'three';
import gsap from 'gsap';
import {makeWater} from './water.js';
import {EffectComposer} from 'three/addons/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/addons/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/addons/postprocessing/ShaderPass.js';
import {OutputPass} from 'three/addons/postprocessing/OutputPass.js';
import {createIngredient,createPetals,preloadIngredients,disposeIngredientTextures} from './models.js';
import {loadProductPlates,createProductPlate} from './product-plates.js';
import {products,families} from './catalog.js';
import {atmosphereVertex,atmosphereFragment,FinishShader} from './shaders.js';

export class ExperienceScene {
 constructor(host,{reduced=false,onReady,onFail}){
  this.host=host;this.reduced=reduced;this.paused=reduced;this.onFail=onFail;this.state={screen:'home',view:'gallery',selected:0,family:0,intensity:50};this.pointer=new THREE.Vector2();this.smoothed=new THREE.Vector2();this.look={x:0,y:1.7,z:0};this.pose={x:0,y:1.65,z:11.1};this.time=0;this.clock=new THREE.Timer();this.assets=[];this.disposed=false;this.lastRenderAt=0;this.lastAnimationTime=0;this.activeUntil=0;this.needsRender=true;
  // The scene is always composited through EffectComposer, so canvas MSAA never
  // reaches the product edges. Keeping it off avoids an unused multisample
  // framebuffer while the post-processing pass remains the final output.
  try{this.renderer=new THREE.WebGLRenderer({antialias:false,alpha:true,powerPreference:'high-performance'});}catch(e){onFail(e);return;}
  this.pixelRatio=this.getPixelRatio(host.clientWidth);this.renderer.setPixelRatio(this.pixelRatio);this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=.78;
  // None of the scene meshes cast or receive a shadow. Disabling the empty
  // shadow-map traversal removes a render pass without changing the image.
  this.renderer.shadowMap.enabled=false;host.append(this.renderer.domElement);
  this.renderer.domElement.addEventListener('webglcontextlost',e=>{e.preventDefault();this.onFail(new Error('WebGL context lost'));});
  this.world=new THREE.Scene();this.world.background=new THREE.Color('#070B14');this.world.fog=new THREE.FogExp2('#0D1628',.017);
  this.camera=new THREE.PerspectiveCamera(34,1,.1,100);this.camera.position.set(0,3.7,13.6);
  const studio=new THREE.Scene();studio.background=new THREE.Color('#0D1628');
  const panel=(x,y,z,w,h,power,color)=>{const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({color:new THREE.Color(color).multiplyScalar(power),side:THREE.DoubleSide}));m.position.set(x,y,z);m.lookAt(0,2,0);studio.add(m);};
  panel(-4,3,3,1.1,7,2.6,'#CBB98D');panel(4,3,2,.55,6,1.15,'#293850');panel(0,6,-3,6,2,.75,'#293850');panel(0,2,-6,4,5,.2,'#CBB98D');
  const pmrem=new THREE.PMREMGenerator(this.renderer);this.environment=pmrem.fromScene(studio,.035);pmrem.dispose();studio.traverse(o=>{o.geometry?.dispose();o.material?.dispose();});
  this.world.environment=this.environment.texture;
  this.carousel=new THREE.Group();this.rig=new THREE.Group();this.rig.add(this.carousel);this.world.add(this.rig);this.dragTarget=0;this.dragCurrent=0;this.tempQuaternion=new THREE.Quaternion();
  this.raycaster=new THREE.Raycaster();this.waterPlane=new THREE.Plane(new THREE.Vector3(0,1,0),0);this.waterHit=new THREE.Vector3();this.rippleIndex=0;this.lastRipple=0;
  this.makeLights();this.makeAtmosphere();this.makeFloor();this.makeDust();
  this.composer=new EffectComposer(this.renderer);this.composer.addPass(new RenderPass(this.world,this.camera));this.composer.addPass(new OutputPass());this.finish=new ShaderPass(FinishShader);this.composer.addPass(this.finish);this.finish.uniforms.cursor.value=new THREE.Vector2(.5,.5);
  this.resize=()=>{const w=host.clientWidth,h=host.clientHeight;this.mobile=w<761;const pixelRatio=this.getPixelRatio(w);if(pixelRatio!==this.pixelRatio){this.pixelRatio=pixelRatio;this.renderer.setPixelRatio(pixelRatio);this.composer.setPixelRatio(pixelRatio);}this.renderer.setSize(w,h);this.composer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.wake(.3);if(this.finish)this.finish.uniforms.aspect.value=w/h;if(this.bottles)this.setState(this.state,true);};
  this.observer=new ResizeObserver(this.resize);this.observer.observe(host);this.resize();
  this.move=e=>{const nx=(e.clientX/innerWidth-.5)*2,ny=(e.clientY/innerHeight-.5)*2;this.cursorVelocity=Math.min(1,Math.hypot(nx-this.pointer.x,ny-this.pointer.y)*15);this.pointer.set(nx,ny);this.wake(.18);if(!this.paused&&this.time-this.lastRipple>.08){this.raycaster.setFromCamera(new THREE.Vector2(nx,-ny),this.camera);if(this.raycaster.ray.intersectPlane(this.waterPlane,this.waterHit)&&Math.abs(this.waterHit.x)<30&&Math.abs(this.waterHit.z)<35){this.floor.material.uniforms.ripples.value[this.rippleIndex%8].set(this.waterHit.x,this.waterHit.z,this.time,.5+this.cursorVelocity);this.rippleIndex++;this.lastRipple=this.time;}}};window.addEventListener('pointermove',this.move,{passive:true});
  this.visibility=()=>{this.clock.update();};document.addEventListener('visibilitychange',this.visibility);
  this.init().then(thumbnails=>{if(this.disposed)return;this.setState(this.state,true);onReady(thumbnails);this.renderer.setAnimationLoop(()=>this.frame());}).catch(onFail);
 }
 getPixelRatio(width){return Math.min(devicePixelRatio,width<761?1.1:1.25);}
 wake(seconds=.25){this.activeUntil=Math.max(this.activeUntil,performance.now()+seconds*1000);this.needsRender=true;}
 async init(){
  await document.fonts.ready;await Promise.all([document.fonts.load('38px Bodoni'),document.fonts.load('74px Cormorant')]);
  const [plates]=await Promise.all([loadProductPlates(),preloadIngredients([...products,...families].flatMap(p=>[p.ingredient,p.secondary]))]);this.plateTextures=plates;this.bottles=products.map((p,i)=>{const g=createProductPlate(p,plates[i]);this.carousel.add(g);return g;});
  this.propGroups=products.map((p,i)=>{const g=new THREE.Group();const a=createIngredient(p.ingredient,2.45);a.position.set(-1.65,.72,-.18);a.rotation.z=.15;this.styleIngredient(a,.82,.12);g.add(a);const b=createIngredient(p.secondary,1.38);b.position.set(1.32,.22,.35);b.rotation.z=-.3;this.styleIngredient(b,.58,.56);g.add(b);g.scale.setScalar(.001);this.carousel.add(g);return g;});
  this.shadows.forEach(s=>this.carousel.add(s));
  this.noteGroups=families.map((f,i)=>{const group=new THREE.Group();[[ -5.0,.25,.8,4.3,-.46,.88,.06],[4.9,5.9,-2.5,4.15,.42,.38,.92],[-3.7,6.75,-5,2.2,-.8,.26,1],[5.2,-.15,-4,1.7,.2,.62,.55]].forEach(([x,y,z,s,r,o,focus],j)=>{const m=createIngredient(j<2?f.ingredient:f.secondary,s);m.position.set(x,y,z);m.rotation.z=r;this.styleIngredient(m,o,focus);m.userData.drift=(j+1)*(i+2)*.14;group.add(m);});group.scale.setScalar(.001);this.world.add(group);return group;});
  this.petals=createPetals();this.petals.visible=false;this.world.add(this.petals);
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
  this.atmosphere=new THREE.Mesh(new THREE.PlaneGeometry(42,26),new THREE.ShaderMaterial({vertexShader:atmosphereVertex,fragmentShader:atmosphereFragment,uniforms:{time:{value:0},tint:{value:new THREE.Color('#0D1628')},dream:{value:0}},depthWrite:false}));this.atmosphere.position.set(0,6,-20);this.world.add(this.atmosphere);
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
  this.dust=new THREE.Points(g,new THREE.ShaderMaterial({transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,uniforms:{time:{value:0}},vertexShader:`attribute float aSize;uniform float time;varying float alpha;void main(){vec3 p=position;p.x+=sin(time*.07+p.z)*.2;p.y+=sin(time*.08+p.x)*.35;vec4 mv=modelViewMatrix*vec4(p,1.);gl_Position=projectionMatrix*mv;gl_PointSize=min(10.,aSize*24./-mv.z);alpha=.2+.3*sin(p.x*3.+time*.15);}`,fragmentShader:`varying float alpha;void main(){float d=length(gl_PointCoord-.5)*2.;if(d>1.)discard;gl_FragColor=vec4(vec3(.91,.84,.66),(1.-smoothstep(.0,1.,d))*alpha);}`}));this.world.add(this.dust);
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
  this.noteGroups.forEach((g,i)=>{const active=state.screen==='notes'&&state.family===i;if(active)g.visible=true;const scale=active?(mobile?.66:1):.001;timeline.to(g.scale,{x:scale,y:scale,z:scale},0);timeline.to(g.rotation,{z:i===state.family?0:.15},0);});
  this.petals.visible=state.screen==='notes'&&(state.family===1||state.family===3);
  const setInactiveGroups=()=>{if(this.timeline!==timeline)return;this.noteGroups.forEach((g,i)=>{g.visible=state.screen==='notes'&&state.family===i;});};
  if(immediate){timeline.progress(1);setInactiveGroups();}else timeline.eventCallback('onComplete',setInactiveGroups);
 }
 setIntensity(value){if(this.state.screen!=='intensity')return;const a=new THREE.Color('#78765a'),b=new THREE.Color('#35392c');a.lerp(b,value/100);this.wake(.6);gsap.to(this.atmosphere.material.uniforms.tint.value,{r:a.r,g:a.g,b:a.b,duration:.5});}
 setPaused(value){this.paused=value;this.wake(.12);}
 setDrag(value){this.dragTarget=value*.35;this.wake(.2);}
 enter(){if(!this.reduced){const z=this.pose.z;this.pose.z+=1.7;this.wake(2.8);gsap.to(this.pose,{z,duration:2.6,ease:'power3.out'});}}
 frame(){
  if(this.disposed)return;this.clock.update();const dt=Math.min(this.clock.getDelta(),.05);if(document.hidden)return;if(!this.paused)this.time+=dt;
  const now=performance.now();if(this.paused&&!this.needsRender)return;if(!this.needsRender&&now-this.lastRenderAt<(now<this.activeUntil?0:1000/30))return;const renderDt=Math.min(Math.max(this.time-this.lastAnimationTime,dt),.05);this.lastAnimationTime=this.time;this.lastRenderAt=now;this.needsRender=false;
  const t=this.time;const damp=1-Math.exp(-renderDt*2.8);this.smoothed.lerp(this.paused?new THREE.Vector2():this.pointer,damp);
  this.camera.position.set(this.pose.x+this.smoothed.x*.24,this.pose.y-this.smoothed.y*.10,this.pose.z);this.camera.lookAt(this.look.x+this.smoothed.x*.025,this.look.y,this.look.z);this.dragCurrent+=(this.dragTarget-this.dragCurrent)*(1-Math.exp(-renderDt*8));this.rig.rotation.y=this.dragCurrent;
  this.world.updateMatrixWorld();this.bottles?.forEach(b=>{const p=b.userData.plate;b.getWorldQuaternion(this.tempQuaternion);p.quaternion.copy(this.tempQuaternion.invert()).multiply(this.camera.quaternion);p.material.uniforms.light.value.copy(this.smoothed);p.material.uniforms.time.value=t;});
  this.atmosphere.material.uniforms.time.value=t;this.floor.material.uniforms.time.value=t;this.dust.material.uniforms.time.value=t;this.finish.uniforms.time.value=this.paused?0:t;this.finish.uniforms.cursor.value.set((this.smoothed.x+1)/2,1-(this.smoothed.y+1)/2);this.cursorVelocity=(this.cursorVelocity||0)*Math.exp(-renderDt*4);this.finish.uniforms.velocity.value=this.paused?0:this.cursorVelocity;
  this.noteGroups?.forEach((g,j)=>{if(!g.visible)return;g.children.forEach((m,i)=>{const drift=m.userData.drift||i;m.rotation.y=Math.sin(t*.16+drift)*.07;m.rotation.x=Math.cos(t*.13+drift)*.045;m.position.x+=Math.sin(t*.09+drift)*renderDt*.035;m.position.y+=Math.cos(t*.11+drift)*renderDt*.022;});g.position.y=Math.sin(t*.2+j)*.1;});
  this.petals?.children.forEach((p,i)=>{if(!this.paused){p.rotation.z+=renderDt*.07;p.position.y+=Math.sin(t*.2+p.userData.phase)*renderDt*.055;}});
  this.composer.render();
 }
 dispose(){this.disposed=true;this.renderer?.setAnimationLoop(null);this.timeline?.kill();this.observer?.disconnect();window.removeEventListener('pointermove',this.move);document.removeEventListener('visibilitychange',this.visibility);this.composer?.dispose();this.world?.traverse(o=>{if(o.isMesh){o.geometry.dispose();const mats=Array.isArray(o.material)?o.material:[o.material];mats.forEach(m=>m.dispose());}});this.environment?.dispose();this.plateTextures?.forEach(t=>t.dispose());disposeIngredientTextures();this.renderer?.dispose();}
}
