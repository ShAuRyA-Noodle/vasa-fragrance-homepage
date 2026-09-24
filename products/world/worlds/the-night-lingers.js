// The Night Lingers: an amber room breathing around a small bed of coals.
// Ember positions are seeded once; the vertex shader owns every rising motion.

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const soft = value => { const p = clamp(value); return p * p * (3 - 2 * p); };

function makeEmbers(THREE, cfg) {
  const count = Math.min(cfg.emberCount || 520, 680);
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count * 4);
  for (let i = 0; i < count; i += 1) {
    const n = i * 3, s = i * 4;
    const radius = Math.pow(Math.random(), .56) * 4.15;
    const angle = Math.random() * Math.PI * 2;
    positions[n] = Math.cos(angle) * radius;
    positions[n + 1] = -3.35 + Math.random() * 1.15;
    positions[n + 2] = -1.4 - Math.random() * 5.4;
    seeds[s] = Math.random(); seeds[s + 1] = Math.random(); seeds[s + 2] = Math.random(); seeds[s + 3] = Math.random();
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 4));
  const uniforms = {
    uTime: {value: 0}, uEntrance: {value: 0}, uOpacity: {value: .74}, uStage: {value: 0},
    uAmber: {value: new THREE.Color(cfg.accent || '#f1c486')},
    uCoal: {value: new THREE.Color('#c34e17')}, uSugar: {value: new THREE.Color('#f0a363')},
  };
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, depthTest: false, blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */`
      uniform float uTime; uniform float uEntrance; attribute vec4 aSeed;
      varying float vHeat; varying float vFade;
      void main(){
        vec3 p=position; float id=aSeed.w*6.28318;
        float lift=mod(uTime*(.34+aSeed.x*.68)+aSeed.y*7.0,8.8);
        p.y+=lift;
        p.x+=sin(lift*(.65+aSeed.z*.38)+id)*(.18+aSeed.x*.45);
        p.z+=cos(lift*.48+id)*.24;
        float burst=smoothstep(.02,.22,uEntrance)*(1.0-smoothstep(.56,1.0,uEntrance));
        p.xy+=normalize(vec2(position.x+.001,position.y+3.15))*burst*(.45+aSeed.z*2.4);
        vec4 mv=modelViewMatrix*vec4(p,1.0);
        gl_PointSize=(1.4+aSeed.x*3.8+burst*3.8)*(17.0/-mv.z);
        gl_Position=projectionMatrix*mv;
        vHeat=.38+aSeed.z*.62;
        vFade=smoothstep(8.5,5.3,lift)*smoothstep(-3.4,-2.55,p.y);
      }`,
    fragmentShader: /* glsl */`
      uniform vec3 uAmber; uniform vec3 uCoal; uniform vec3 uSugar; uniform float uOpacity; uniform float uStage;
      varying float vHeat; varying float vFade;
      void main(){
        vec2 p=gl_PointCoord-.5; float spark=1.0-smoothstep(.05,.5,length(p));
        vec3 c=mix(uCoal,uAmber,vHeat); c=mix(c,uSugar,smoothstep(1.15,2.2,uStage));
        gl_FragColor=vec4(c,spark*vFade*uOpacity*(.42+vHeat*.58));
      }`,
  });
  const embers = new THREE.Points(geometry, material); embers.frustumCulled = false;
  return {embers, uniforms};
}

function makeSmokeVeil(THREE, cfg, reduced) {
  const uniforms = {
    uTime: {value: 0}, uEntrance: {value: reduced ? 1 : 0}, uStage: {value: 0}, uOpacity: {value: reduced ? .42 : .6},
    uSmoke: {value: new THREE.Color('#d6a878')}, uOud: {value: new THREE.Color('#70401d')}, uIncense: {value: new THREE.Color(cfg.accent || '#f1c486')},
  };
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide,
    vertexShader: /* glsl */`
      uniform float uTime; varying vec2 vUv;
      void main(){vUv=uv;vec3 p=position;p.x+=sin(p.y*.62+uTime*.19)*.16;p.y+=sin(p.x*.48+uTime*.13)*.09;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.0);}`,
    fragmentShader: /* glsl */`
      uniform float uTime; uniform float uEntrance; uniform float uStage; uniform float uOpacity;
      uniform vec3 uSmoke; uniform vec3 uOud; uniform vec3 uIncense; varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);}
      float fbm(vec2 p){float n=0.;n+=noise(p)*.52;p=p*2.03+3.1;n+=noise(p)*.27;p=p*2.07+1.7;n+=noise(p)*.14;p=p*2.01+6.4;n+=noise(p)*.07;return n;}
      void main(){
        vec2 uv=vUv; float t=uTime*.035;
        float curl=fbm(vec2(uv.x*2.0+t,uv.y*2.5-t*.7)+vec2(sin(uv.y*5.0),0.));
        float ribbon=fbm(vec2(uv.x*4.3-curl*1.8+t*2.1,uv.y*1.25-t));
        float cloud=smoothstep(.42,.77,curl*.67+ribbon*.43);
        float edges=smoothstep(.01,.22,uv.x)*smoothstep(.99,.76,uv.x)*smoothstep(.02,.2,uv.y)*smoothstep(.98,.74,uv.y);
        float dissolve=smoothstep(.04,.9,uEntrance+curl*.38-uv.y*.14);
        vec3 shade=mix(uOud,uSmoke,smoothstep(.35,.74,ribbon)); shade=mix(shade,uIncense,smoothstep(1.15,2.15,uStage));
        gl_FragColor=vec4(shade,cloud*edges*(1.-dissolve)*uOpacity);
      }`,
  });
  const veil = new THREE.Mesh(new THREE.PlaneGeometry(15.8, 10.5, 1, 1), material);
  veil.position.set(-.25, .15, -4.7); veil.frustumCulled = false;
  return {veil, uniforms};
}

function makeIncenseTrails(THREE) {
  const group = new THREE.Group();
  const uniforms = {uTime: {value: 0}, uOpacity: {value: .32}, uTint: {value: new THREE.Color('#e9bd8b')}, uStage: {value: 0}};
  const material = new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide,
    vertexShader: /* glsl */`uniform float uTime;varying vec2 vUv;void main(){vUv=uv;vec3 p=position;float wave=sin(p.y*1.65+uTime*.38+p.x)*.24+sin(p.y*.64-uTime*.23)*.18;p.x+=wave;p.y+=mod(uTime*.12,1.8);gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: /* glsl */`uniform vec3 uTint;uniform float uOpacity;uniform float uStage;varying vec2 vUv;void main(){float edge=smoothstep(0.,.3,vUv.x)*smoothstep(1.,.7,vUv.x);float fade=smoothstep(0.,.22,vUv.y)*smoothstep(1.,.48,vUv.y);gl_FragColor=vec4(uTint,edge*fade*uOpacity*(.65+uStage*.12));}`,
  });
  [-1.8, -.45, 1.15, 2.5].forEach((x, i) => { const trail = new THREE.Mesh(new THREE.PlaneGeometry(.65 + i * .12, 5.7), material); trail.position.set(x, -.55 + i * .14, -3.9 - i * .28); trail.rotation.z = (i - 1.5) * .08; group.add(trail); });
  return {group, uniforms};
}

/** @param {{THREE: typeof import('three'), scene: import('three').Scene, camera: import('three').Camera, renderer: import('three').WebGLRenderer, cfg: object, bottle: import('three').Object3D, reduced: boolean}} args */
export function createAtmosphere({THREE, scene, camera, renderer, cfg = {}, bottle, reduced = false}) {
  const group = new THREE.Group(); group.name = 'the-night-lingers-atmosphere'; scene.add(group);
  const smoke = makeSmokeVeil(THREE, cfg, reduced);
  const trails = makeIncenseTrails(THREE);
  const embers = reduced ? null : makeEmbers(THREE, cfg);
  group.add(smoke.veil, trails.group); if (embers) group.add(embers.embers);
  const hearth = new THREE.PointLight('#ed8e3e', 4.4, 10, 2); hearth.position.set(.3, -2.35, 1.8); group.add(hearth);
  const amber = new THREE.PointLight('#f1c486', 2.2, 11, 2); amber.position.set(-2.45, 1.55, .4); group.add(amber);
  const palettes = [
    {smoke: '#b47a45', incense: '#e9bd8b', ember: '#d15b1e'}, // oud
    {smoke: '#d38a50', incense: '#f2bd77', ember: '#f0a363'}, // brown sugar
    {smoke: '#9c775d', incense: '#ebd1a9', ember: '#cd7331'}, // incense
  ];
  let stageIndex = 0, stageProgress = 0, entranceValue = reduced ? 1 : 0, disposed = false;
  const setPalette = () => {
    const p = palettes[stageIndex]; const amount = .12 + soft(stageProgress) * .28;
    smoke.uniforms.uSmoke.value.lerp(new THREE.Color(p.smoke), amount);
    smoke.uniforms.uIncense.value.lerp(new THREE.Color(p.incense), amount);
    smoke.uniforms.uStage.value = stageIndex + stageProgress;
    trails.uniforms.uTint.value.lerp(new THREE.Color(p.incense), amount);
    trails.uniforms.uStage.value = stageIndex + stageProgress;
    amber.color.copy(smoke.uniforms.uIncense.value);
    if (embers) { embers.uniforms.uAmber.value.lerp(new THREE.Color(p.incense), amount); embers.uniforms.uCoal.value.lerp(new THREE.Color(p.ember), amount); embers.uniforms.uStage.value = stageIndex + stageProgress; }
  };
  return {
    update(dt, t, signals = {}) {
      if (disposed) return;
      const time = Number.isFinite(t) ? t : 0;
      smoke.uniforms.uTime.value = time; smoke.uniforms.uEntrance.value = entranceValue;
      trails.uniforms.uTime.value = time; trails.group.position.x = (signals.pointerX || 0) * .11; trails.group.position.y = -(signals.pointerY || 0) * .07;
      if (embers) { embers.uniforms.uTime.value = time; embers.uniforms.uEntrance.value = entranceValue; embers.uniforms.uOpacity.value = .67 + clamp(signals.scroll || 0) * .13; }
      hearth.intensity = 4.1 + Math.sin(time * .8) * .28 + (1 - entranceValue) * 2.5;
      amber.intensity = 1.9 + Math.sin(time * .33) * .16;
      setPalette();
      void dt; void camera; void renderer; void bottle;
    },
    entrance(progress = 1) { entranceValue = reduced ? 1 : clamp(progress); },
    stage(index = 0, progress = 1) { stageIndex = clamp(Math.round(index), 0, 2); stageProgress = clamp(progress); setPalette(); },
    dispose() {
      disposed = true;
      group.traverse(object => { object.geometry?.dispose?.(); const materials = Array.isArray(object.material) ? object.material : [object.material]; materials.filter(Boolean).forEach(material => material.dispose?.()); });
      scene.remove(group);
    },
  };
}

export default createAtmosphere;
