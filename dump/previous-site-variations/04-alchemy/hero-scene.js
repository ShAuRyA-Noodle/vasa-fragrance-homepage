import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap, reduced } from '../shared/motion.js';

/** Original geometry and scene. No Alche source, models or textures are used. */
export async function createGlassHero(canvas) {
  const stage = canvas.parentElement;
  const host = stage.closest('.hero-sticky');
  const motionButton = document.querySelector('#motion-toggle');
  let renderer;
  const state = { progress: 0, paused: reduced.matches, pointerX: 0, pointerY: 0 };
  let alive = true, visible = true, elapsed = 0, lastTime = 0, lastRenderedProgress=-1;
  function fallback() {
    alive = false;
    stage.classList.remove('is-ready');
    stage.dataset.renderer = 'fallback';
    document.body.classList.add('hero-static');
    document.dispatchEvent(new CustomEvent('vasa:hero-fallback'));
  }
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
  } catch { fallback(); return { state, dispose() {} }; }
  await document.fonts.ready;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, .1, 60);
  camera.position.set(0, 0, 8.6);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.setClearColor('#ece5d5');

  // A photographed studio-like environment built from lights and geometry, without a remote HDRI.
  const room = new RoomEnvironment();
  room.traverse(object=>{if(object.isMesh&&object.material.isMeshStandardMaterial)object.material.color.set('#302b24');});
  const pmrem = new THREE.PMREMGenerator(renderer);
  const environment = pmrem.fromScene(room, .025);
  scene.environment = environment.texture;
  room.dispose();
  pmrem.dispose();
  scene.add(new THREE.HemisphereLight('#fff9e9', '#6c5a42', 2));
  const key = new THREE.DirectionalLight('#fff8e8', 4);
  key.position.set(-4, 5, 6); scene.add(key);
  const rim = new THREE.DirectionalLight('#e7c68e', 2.8);
  rim.position.set(4, 1, -1); scene.add(rim);

  const letterCanvas = document.createElement('canvas');
  const texture = new THREE.CanvasTexture(letterCanvas);
  texture.colorSpace = THREE.NoColorSpace;
  const backdropMaterial = new THREE.ShaderMaterial({
    toneMapped:false,
    uniforms: {
      uLetters: {value: texture}, uProgress: {value: 0},
      uTop: {value: new THREE.Color('#f2ebdd')}, uBottom: {value: new THREE.Color('#d9bd88')},
      uEnd: {value: new THREE.Color('#bac0a8')}, uInk: {value: new THREE.Color('#51402a')}
    },
    vertexShader: 'varying vec2 vUv; void main(){ vUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0); }',
    fragmentShader: `
      uniform sampler2D uLetters; uniform float uProgress;
      uniform vec3 uTop,uBottom,uEnd,uInk; varying vec2 vUv;
      void main(){
        vec2 uv=vUv;
        float glow=exp(-length((uv-vec2(.48,.58))*vec2(1.,.9))*3.);
        vec3 base=mix(uBottom,uTop,smoothstep(0.,.9,uv.y));
        base+=glow*.042;
        base-=pow(sin(uv.x*9.+sin(uv.y*5.)*.55)*.5+.5,8.)*.025;
        base=mix(base,uEnd,smoothstep(.12,.85,uProgress)*.68);
        vec2 textUv=uv; textUv.x+=uProgress*.10;
        float letter=texture2D(uLetters,textUv).a;
        letter*=1.-smoothstep(.08,.57,uProgress);
        vec3 color=mix(base,uInk,letter*.93);
        float grain=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
        color+=(grain-.5)*.003;
        gl_FragColor=vec4(color,1.);
        #include <tonemapping_fragment>
        #include <colorspace_fragment>
      }`
  });
  const backdrop = new THREE.Mesh(new THREE.PlaneGeometry(1,1), backdropMaterial);
  backdrop.position.z = -3;
  scene.add(backdrop);

  // One solid, beveled V, modelled in cross section rather than using a flat sprite.
  const shape = new THREE.Shape();
  shape.moveTo(-1.7, 1.6);
  shape.lineTo(-.92, 1.6);
  shape.lineTo(.02, -.73);
  shape.lineTo(.98, 1.6);
  shape.lineTo(1.7, 1.6);
  shape.lineTo(.38, -1.62);
  shape.lineTo(-.34, -1.62);
  shape.closePath();
  const geometry = new THREE.ExtrudeGeometry(shape, {depth:.61, steps:1, bevelEnabled:true, bevelThickness:.15, bevelSize:.10, bevelSegments:10, curveSegments:24});
  geometry.center();
  // Low-frequency variations give the cast glass a gently flowing optical surface.
  const bumpCanvas=document.createElement('canvas');bumpCanvas.width=256;bumpCanvas.height=256;
  const bumpContext=bumpCanvas.getContext('2d');const bumpData=bumpContext.createImageData(256,256);
  for(let y=0;y<256;y++)for(let x=0;x<256;x++){
    const v=(.5+.16*Math.sin(x*.043+Math.sin(y*.033)*2)+.14*Math.sin(y*.048+x*.014)+.035*Math.sin(x*.11-y*.09))*255;
    const n=(y*256+x)*4;bumpData.data[n]=bumpData.data[n+1]=bumpData.data[n+2]=v;bumpData.data[n+3]=255;
  }
  bumpContext.putImageData(bumpData,0,0);
  const bumpTexture=new THREE.CanvasTexture(bumpCanvas);bumpTexture.wrapS=bumpTexture.wrapT=THREE.RepeatWrapping;bumpTexture.repeat.set(.7,.7);
  const material = new THREE.MeshPhysicalMaterial({
    color:'#ffffff', metalness:0, roughness:.025, bumpMap:bumpTexture,bumpScale:.15,
    transmission:1, thickness:1.25, ior:1.5,
    attenuationColor:'#dcc38d', attenuationDistance:6.5,
    clearcoat:1, clearcoatRoughness:.07, envMapIntensity:2.4,
    dispersion:.045
  });
  material.onBeforeCompile=shader=>{
    shader.uniforms.uGlassTime={value:0};
    shader.fragmentShader='uniform float uGlassTime;\n'+shader.fragmentShader;
    shader.fragmentShader=shader.fragmentShader.replace('#include <normal_fragment_maps>',`#include <normal_fragment_maps>
      float glassWave=sin(vViewPosition.x*3.1+sin(vViewPosition.y*2.4)+uGlassTime*.10);
      normal=normalize(normal+vec3(glassWave*.145,cos(vViewPosition.y*3.3+vViewPosition.x*1.2+uGlassTime*.08)*.10,0.));`);
    material.userData.shader=shader;
  };
  const sculpture = new THREE.Mesh(geometry, material);
  const group = new THREE.Group(); group.add(sculpture); scene.add(group);
  let scale=1, narrow=false;
  function lettering(w,h) {
    letterCanvas.width=Math.min(2048,Math.round(w*1.4));
    letterCanvas.height=Math.round(letterCanvas.width*h/w);
    const ctx=letterCanvas.getContext('2d');
    const cw=letterCanvas.width,ch=letterCanvas.height;
    ctx.clearRect(0,0,cw,ch);
    ctx.fillStyle='#fff'; ctx.textAlign='center'; ctx.textBaseline='middle';
    let size=cw*.30;
    ctx.font=`500 ${size}px "Cormorant Garamond"`;
    size*=cw*.90/ctx.measureText('VASA').width;
    ctx.font=`500 ${size}px "Cormorant Garamond"`;
    ctx.fillText('VASA',cw*.5,ch*(narrow?.44:.49));
    texture.needsUpdate=true;
  }
  function resize() {
    const w=host.clientWidth,h=host.clientHeight;
    narrow=w<701;
    camera.aspect=w/h; camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio,narrow?1.25:1.65));
    renderer.setSize(w,h,false);
    renderer.transmissionResolutionScale=narrow?.5:.75;
    material.dispersion=narrow?0:.045;
    const viewH=2*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*camera.position.z;
    const viewW=viewH*camera.aspect;
    scale=Math.min(viewW*(narrow?.78:.40)/3.6,viewH*.54/3.45);
    const bgH=2*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*11.6;
    backdrop.scale.set(bgH*camera.aspect*1.01,bgH*1.01,1);
    lettering(w,h);
    render(0,true);
  }
  function render(time,force=false) {
    if(!alive||(!force&&(!visible||document.hidden)))return;
    const delta=lastTime?Math.min(time-lastTime,.04):0;lastTime=time;
    if(!state.paused&&!reduced.matches)elapsed+=Math.max(0,delta);
    const p=reduced.matches?0:state.progress;
    if(!force&&state.paused&&p===lastRenderedProgress)return;
    lastRenderedProgress=p;
    const driftX=state.paused?0:Math.sin(elapsed*.32)*.055;
    const driftY=state.paused?0:Math.sin(elapsed*.24)*.09;
    const pointerAmount=(state.paused||reduced.matches)?0:1;
    sculpture.rotation.set(.11+p*.24+driftX+state.pointerY*.11*pointerAmount,-.24+p*1.24+driftY+state.pointerX*.23*pointerAmount,-.13+p*.35);
    const endScale=narrow?.60:.74;
    group.scale.setScalar(scale*(1-p*(1-endScale)));
    const viewH=2*Math.tan(THREE.MathUtils.degToRad(camera.fov)/2)*camera.position.z;
    const viewW=viewH*camera.aspect;
    group.position.set(p*viewW*(narrow?.17:.27),narrow?viewH*.085+p*viewH*.11:.10+p*.04,p*-.3);
    backdropMaterial.uniforms.uProgress.value=p;
    if(material.userData.shader)material.userData.shader.uniforms.uGlassTime.value=elapsed;
    renderer.render(scene,camera);
    // Small inspectable state used by QA, independent of animation internals.
    canvas.dataset.pose=`${sculpture.rotation.x.toFixed(3)},${sculpture.rotation.y.toFixed(3)},${sculpture.rotation.z.toFixed(3)}`;
    canvas.dataset.progress=p.toFixed(3);
  }
  const pointer=e=>{
    if(reduced.matches||e.pointerType==='touch')return;
    const r=host.getBoundingClientRect();
    gsap.to(state,{pointerX:((e.clientX-r.left)/r.width-.5)*2,pointerY:((e.clientY-r.top)/r.height-.5)*2,duration:1.3,ease:'power3.out',overwrite:'auto'});
  };
  const leave=()=>gsap.to(state,{pointerX:0,pointerY:0,duration:1.8,overwrite:'auto'});
  host.addEventListener('pointermove',pointer);host.addEventListener('pointerleave',leave);
  motionButton.addEventListener('click',()=>{
    state.paused=!state.paused;
    motionButton.setAttribute('aria-pressed',String(state.paused));
    motionButton.setAttribute('aria-label',state.paused?'Resume ambient motion':'Pause ambient motion');
    motionButton.innerHTML=state.paused?'Resume motion <span aria-hidden="true">▷</span>':'Pause motion <span aria-hidden="true">Ⅱ</span>';
    render(0,true);
  });
  motionButton.setAttribute('aria-label','Pause ambient motion');
  const observer=new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible){lastTime=0;render(0,true)}},{rootMargin:'80px'});
  observer.observe(host);
  const resizeObserver=new ResizeObserver(resize);resizeObserver.observe(host);
  canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();fallback();gsap.ticker.remove(render)});
  const onVisibility=()=>{lastTime=0;if(!document.hidden)render(0,true)};
  document.addEventListener('visibilitychange',onVisibility);
  resize();
  if(!reduced.matches)gsap.ticker.add(render);
  stage.classList.add('is-ready');stage.dataset.renderer='webgl';
  function dispose(){alive=false;gsap.ticker.remove(render);observer.disconnect();resizeObserver.disconnect();host.removeEventListener('pointermove',pointer);host.removeEventListener('pointerleave',leave);document.removeEventListener('visibilitychange',onVisibility);geometry.dispose();material.dispose();backdrop.geometry.dispose();backdropMaterial.dispose();texture.dispose();bumpTexture.dispose();environment.dispose();renderer.dispose();}
  addEventListener('pagehide',dispose,{once:true});
  return {state,dispose};
}
