// VASA product world: one WebGL scene per fragrance.
// Procedural glass bottle + themed atmosphere (storm / petals / velvet / embers)
// + floating ingredient cut-outs + a signature entrance per theme.
// Scroll: setProgress (hero) moves the bottle centre stage; setJourney (notes)
// flies the camera into the liquid while the grade shifts opening -> heart -> base.
// Film grade: CSS overlay on the stage (tint, vignette, grain, immersion) + a soft halo for glow.
// Direct rendering keeps glass transmission and the dark grade intact.
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';
import {gsap} from 'gsap';

const lerp = (a, b, t) => a + (b - a) * t;
const clamp01 = v => Math.min(1, Math.max(0, v));
const smooth = v => { v = clamp01(v); return v * v * (3 - 2 * v); };

function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

const softDot = () => canvasTexture(64, 64, (g, w) => {
  const r = g.createRadialGradient(w / 2, w / 2, 0, w / 2, w / 2, w / 2);
  r.addColorStop(0, 'rgba(255,255,255,1)'); r.addColorStop(.35, 'rgba(255,255,255,.55)'); r.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = r; g.fillRect(0, 0, w, w);
});

function woodTexture() {
  return canvasTexture(256, 512, (g, w, h) => {
    g.fillStyle = '#7a4f2e'; g.fillRect(0, 0, w, h);
    for (let i = 0; i < 90; i++) {
      const x = Math.random() * w, a = .04 + Math.random() * .12;
      g.strokeStyle = Math.random() > .5 ? `rgba(40,20,8,${a})` : `rgba(190,140,90,${a * .7})`;
      g.lineWidth = .6 + Math.random() * 2.2;
      g.beginPath(); g.moveTo(x, 0);
      for (let y = 0; y <= h; y += 16) g.lineTo(x + Math.sin(y * .02 + i) * 3, y);
      g.stroke();
    }
  });
}

function labelTexture(name) {
  return canvasTexture(512, 400, (g, w, h) => {
    g.fillStyle = '#efe6d6'; g.fillRect(0, 0, w, h);
    g.strokeStyle = 'rgba(80,55,35,.35)'; g.lineWidth = 3; g.strokeRect(16, 16, w - 32, h - 32);
    g.fillStyle = '#3a2a1e'; g.textAlign = 'center';
    g.font = '500 30px Manrope, Arial, sans-serif';
    g.fillText('V Ā S Ā', w / 2, 96);
    g.font = '400 50px Georgia, serif';
    const words = name.toUpperCase().split(' ');
    words.forEach((word, i) => g.fillText(word, w / 2, 200 + i * 62 - (words.length - 1) * 20));
    g.font = '500 22px Manrope, Arial, sans-serif';
    g.fillText('EAU DE PARFUM  ·  50 ML', w / 2, h - 52);
  });
}

function buildBottle(cfg, name) {
  const group = new THREE.Group();
  const glass = new THREE.Mesh(
    new RoundedBoxGeometry(1.6, 1.9, .92, 6, .16),
    new THREE.MeshPhysicalMaterial({color: '#ffffff', metalness: 0, roughness: .06, transmission: 1, thickness: .9, ior: 1.45, clearcoat: 1, clearcoatRoughness: .08, envMapIntensity: .9, attenuationColor: new THREE.Color(cfg.liquid), attenuationDistance: 2.4})
  );
  const liquid = new THREE.Mesh(
    new RoundedBoxGeometry(1.36, 1.5, .7, 4, .1),
    new THREE.MeshPhysicalMaterial({color: cfg.liquid, roughness: .12, transmission: .82, thickness: .5, ior: 1.33, emissive: cfg.liquid, emissiveIntensity: .12})
  );
  liquid.position.y = -.14;
  // transparent: kept out of the glass transmission pass, so no ghost label
  const label = new THREE.Mesh(new THREE.PlaneGeometry(.92, .72), new THREE.MeshStandardMaterial({map: labelTexture(name), roughness: .8, transparent: true}));
  label.position.set(0, -.12, .462);
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .16, 48), new THREE.MeshStandardMaterial({color: '#c9a36a', metalness: 1, roughness: .28}));
  collar.position.y = 1.03;
  const wood = new THREE.MeshStandardMaterial({map: woodTexture(), roughness: .62, metalness: 0});
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(.56, .5, .62, 64), wood);
  cap.position.y = 1.42;
  const dome = new THREE.Mesh(new THREE.SphereGeometry(.56, 64, 24, 0, Math.PI * 2, 0, Math.PI / 2), wood);
  dome.scale.y = .55; dome.position.y = 1.73;
  group.add(liquid, glass, label, collar, cap, dome);
  return group;
}

function buildBackdrop(cfg) {
  const uniforms = {uTop: {value: new THREE.Color(cfg.bg[0])}, uBottom: {value: new THREE.Color(cfg.bg[1])}, uGlow: {value: new THREE.Color(cfg.rim)}, uFlash: {value: 0}, uTime: {value: 0}};
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(40, 24), new THREE.ShaderMaterial({
    uniforms, depthWrite: false,
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `uniform vec3 uTop,uBottom,uGlow;uniform float uFlash,uTime;varying vec2 vUv;
      void main(){vec3 c=mix(uBottom,uTop,smoothstep(.05,.95,vUv.y));
      float g=smoothstep(.55,0.,distance(vUv,vec2(.62,.52)));c+=uGlow*g*.22;
      c+=vec3(.75,.85,1.)*uFlash*.55*(.6+.4*vUv.y);gl_FragColor=vec4(c,1.);}`
  }));
  mesh.position.z = -8;
  return {mesh, uniforms};
}

// ---------- atmospheres (each with a signature entrance) ----------
function storm(scene, cfg) {
  // GPU rain: every streak animates in the vertex shader (no per-frame CPU work).
  // Fine, slanted, depth-faded streaks read as weather, not an effect.
  const n = 650, pos = new Float32Array(n * 6), seed = new Float32Array(n * 2), end = new Float32Array(n * 2);
  for (let i = 0; i < n; i++) {
    const x = (Math.random() - .5) * 20, y = Math.random() * 12 - 6, z = -7 + Math.random() * 8, l = .12 + Math.random() * .22;
    pos.set([x, y, z, x - .035, y - l, z], i * 6);
    const sp = 7 + Math.random() * 5; seed.set([sp, sp], i * 2); end.set([0, 1], i * 2);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('aSpeed', new THREE.BufferAttribute(seed, 1));
  geo.setAttribute('aTail', new THREE.BufferAttribute(end, 1));
  const uniforms = {uTime: {value: 0}, uColor: {value: new THREE.Color(cfg.accent)}, uBoost: {value: 1}};
  const rain = new THREE.LineSegments(geo, new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false,
    vertexShader: `uniform float uTime,uBoost;attribute float aSpeed;attribute float aTail;varying float vA;
      void main(){vec3 p=position;float fall=uTime*aSpeed*uBoost;p.y=mod(p.y-fall+6.,12.)-6.;p.x-=fall*.035;p.x=mod(p.x+10.,20.)-10.;
      vA=mix(.9,.0,aTail)*smoothstep(-7.,1.,p.z)*.55;gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,
    fragmentShader: 'uniform vec3 uColor;varying float vA;void main(){gl_FragColor=vec4(uColor,vA*.5);}'
  }));
  rain.frustumCulled = false;
  scene.add(rain);
  const fog = fogSprites(scene, '#9fb4c0', 6, .12, .06);
  // Lightning: one strike on entrance, then rare distant sheet lightning
  const bolt = new THREE.Group(), boltMat = new THREE.LineBasicMaterial({color: '#eef8ff', transparent: true, opacity: 0, depthWrite: false});
  const strand = [];
  let x = -.6, y = 6.5; while (y > -.4) { strand.push([x, y]); x += (Math.random() - .5) * 1.1; y -= .3 + Math.random() * .45; }
  [0, .03, -.03].forEach(o => bolt.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(strand.map(([a, b]) => new THREE.Vector3(a + o, b, -3.2))), boltMat)));
  scene.add(bolt);
  const st = {flash: 0, next: 9, time: 0};
  return {
    intro(api) {
      bolt.position.x = api.origin.x - .4;
      st.flash = 1.1; st.next = 10;
      gsap.timeline().set(boltMat, {opacity: .9}).to(boltMat, {opacity: .2, duration: .07, repeat: 3, yoyo: true}).to(boltMat, {opacity: 0, duration: .6});
      gsap.fromTo(uniforms.uBoost, {value: 1.8}, {value: 1, duration: 2.4, ease: 'power2.out'});
    },
    update(dt, t, api) {
      st.time += dt * uniforms.uBoost.value; uniforms.uTime.value = st.time;
      fog.update(dt);
      st.next -= dt;
      if (st.next <= 0) { st.flash = .45; st.next = 9 + Math.random() * 9; }
      st.flash = Math.max(0, st.flash - dt * 1.6);
      api.flash(st.flash);
    }
  };
}

function fogSprites(scene, color, count, opacity, drift) {
  const tex = softDot(), items = [];
  for (let i = 0; i < count; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({map: tex, color, transparent: true, opacity, depthWrite: false}));
    s.position.set((Math.random() - .5) * 16, -2.5 + Math.random() * 5, -5 + Math.random() * 3);
    s.scale.setScalar(6 + Math.random() * 6); s.userData.v = (Math.random() - .5) * drift + drift * .5;
    scene.add(s); items.push(s);
  }
  return {items, update(dt) { items.forEach(s => { s.position.x += s.userData.v * dt; if (s.position.x > 10) s.position.x = -10; }); }};
}

function petals(scene, cfg) {
  const n = 190, geo = new THREE.CircleGeometry(.05, 12); geo.scale(1.7, 1, 1);
  const mat = new THREE.MeshStandardMaterial({color: '#ffffff', roughness: .7, side: THREE.DoubleSide, transparent: true, opacity: .92});
  const mesh = new THREE.InstancedMesh(geo, mat, n), dummy = new THREE.Object3D();
  const data = Array.from({length: n}, () => ({x: (Math.random() - .5) * 16, y: Math.random() * 12 - 5, z: -5 + Math.random() * 8, s: .5 + Math.random() * 1.1, v: .35 + Math.random() * .5, r: Math.random() * 6, w: Math.random() * 6, vx: 0, vy: 0, vz: 0}));
  const tint = new THREE.Color();
  data.forEach((d, i) => mesh.setColorAt(i, tint.set(cfg.accent).lerp(new THREE.Color('#ffffff'), Math.random() * .5)));
  scene.add(mesh);
  const glow = fogSprites(scene, cfg.rim, 5, .12, .05);
  const burst = {k: 0};
  return {
    intro(api) {
      // Petal burst: every petal erupts from the bottle, then drifts down
      data.forEach(d => {
        const a = Math.random() * Math.PI * 2, e = (Math.random() - .3) * 1.4, sp = 3 + Math.random() * 6;
        d.x = api.origin.x; d.y = api.origin.y + .3; d.z = .2;
        d.vx = Math.cos(a) * Math.cos(e) * sp; d.vy = Math.sin(e) * sp + 2; d.vz = Math.sin(a) * Math.cos(e) * sp * .6;
      });
      burst.k = 1; gsap.to(burst, {k: 0, duration: 2.8, ease: 'power3.out'});
    },
    update(dt, t) {
      const k = burst.k;
      data.forEach((d, i) => {
        d.x += d.vx * k * dt; d.y += d.vy * k * dt; d.z += d.vz * k * dt;
        d.y -= d.v * dt * (1 - k * .8); d.x += Math.sin(t * .6 + d.w) * dt * .35;
        if (d.y < -6) { d.y = 7; d.x = (Math.random() - .5) * 16; d.z = -5 + Math.random() * 8; }
        dummy.position.set(d.x, d.y, d.z); dummy.rotation.set(t * .9 + d.r, t * .6 + d.w, t * .4); dummy.scale.setScalar(d.s);
        dummy.updateMatrix(); mesh.setMatrixAt(i, dummy.matrix);
      });
      mesh.instanceMatrix.needsUpdate = true; glow.update(dt);
    }
  };
}

function velvet(scene, cfg) {
  const uniforms = {uTime: {value: 0}, uAmp: {value: 1}, uA: {value: new THREE.Color(cfg.bg[0]).multiplyScalar(1.6)}, uB: {value: new THREE.Color(cfg.rim)}, uSheen: {value: new THREE.Color(cfg.accent)}};
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(18, 10, 160, 90), new THREE.ShaderMaterial({
    uniforms, side: THREE.DoubleSide,
    vertexShader: `uniform float uTime,uAmp;varying float vH;varying vec3 vN;varying vec3 vV;
      float w(vec2 p){return (sin(p.x*.7+uTime*.5)*.55+sin(p.y*1.1-uTime*.35+p.x*.3)*.35+sin((p.x+p.y)*1.7+uTime*.8)*.12)*uAmp;}
      void main(){vec3 p=position;float e=.05;float z=w(p.xy);
      vec3 n=normalize(vec3(-(w(p.xy+vec2(e,0.))-z)/e,-(w(p.xy+vec2(0.,e))-z)/e,1.));
      p.z+=z;vH=z;vec4 mv=modelViewMatrix*vec4(p,1.);vN=normalize(normalMatrix*n);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}`,
    fragmentShader: `uniform vec3 uA,uB,uSheen;varying float vH;varying vec3 vN;varying vec3 vV;
      void main(){float f=pow(1.-abs(dot(vN,vV)),2.2);vec3 c=mix(uA,uB,smoothstep(-.8,.9,vH)*.55);
      c+=uSheen*f*.85;c*=.8+.5*smoothstep(-1.,1.,vH);gl_FragColor=vec4(c,1.);}`
  }));
  cloth.position.set(0, -.4, -4.2); cloth.rotation.x = -.35;
  scene.add(cloth);
  const dust = risingPoints(scene, cfg.accent, 220, .06, .12, 1);
  return {
    intro() {
      // Velvet sweep: the cloth starts over the lens and pulls away to reveal the bottle
      gsap.fromTo(cloth.position, {z: 6.2, y: 1.2, x: -2}, {z: -4.2, y: -.4, x: 0, duration: 2.6, ease: 'expo.inOut'});
      gsap.fromTo(cloth.rotation, {x: .2, z: .5}, {x: -.35, z: 0, duration: 2.6, ease: 'expo.inOut'});
      gsap.fromTo(uniforms.uAmp, {value: 2.4}, {value: 1, duration: 3, ease: 'power2.out'});
    },
    update(dt, t) { uniforms.uTime.value = t; dust.update(dt, t); }
  };
}

function risingPoints(scene, color, n, size, speed, opacity) {
  const pos = new Float32Array(n * 3), v = new Float32Array(n);
  for (let i = 0; i < n; i++) { pos.set([(Math.random() - .5) * 14, Math.random() * 10 - 5, -4 + Math.random() * 7], i * 3); v[i] = speed * (.4 + Math.random()); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mat = new THREE.PointsMaterial({color, size, map: softDot(), transparent: true, opacity, depthWrite: false, blending: THREE.AdditiveBlending, sizeAttenuation: true});
  const pts = new THREE.Points(geo, mat); scene.add(pts);
  return {mat, pos, update(dt, t, k = 1) { for (let i = 0; i < n; i++) { const j = i * 3; pos[j + 1] += v[i] * dt * k; pos[j] += Math.sin(t * .8 + i) * dt * .12; if (pos[j + 1] > 5.5) pos[j + 1] = -5; } geo.attributes.position.needsUpdate = true; }};
}

function embers(scene, cfg) {
  const sparks = risingPoints(scene, cfg.accent, 520, .11, .55, 1);
  const smoke = fogSprites(scene, '#8a6a52', 10, .16, .04);
  smoke.items.forEach(s => { s.userData.rise = .12 + Math.random() * .18; });
  // Veil of smoke in front of the lens for the entrance
  const veilTex = softDot(), veil = [];
  for (let i = 0; i < 16; i++) {
    const s = new THREE.Sprite(new THREE.SpriteMaterial({map: veilTex, color: '#3a2618', transparent: true, opacity: 0, depthWrite: false}));
    s.position.set((Math.random() - .5) * 6, (Math.random() - .5) * 4, 4.5 + Math.random() * 2); s.scale.setScalar(4 + Math.random() * 3);
    scene.add(s); veil.push(s);
  }
  const st = {k: 1};
  return {
    intro() {
      // Smoke dissolve: a dense veil thins and rises while sparks surge upward
      veil.forEach((s, i) => {
        s.material.opacity = .95;
        gsap.to(s.material, {opacity: 0, duration: 2.2 + Math.random(), delay: .1 + i * .04, ease: 'power2.inOut'});
        gsap.to(s.position, {y: s.position.y + 2.5 + Math.random() * 2, x: s.position.x * 1.8, duration: 3, ease: 'power2.out'});
        gsap.to(s.scale, {x: s.scale.x * 1.8, y: s.scale.y * 1.8, duration: 3, ease: 'power2.out'});
      });
      st.k = 7; gsap.to(st, {k: 1, duration: 2.8, ease: 'power3.out'});
    },
    update(dt, t, api) {
      sparks.update(dt, t, st.k); sparks.mat.opacity = .75 + Math.sin(t * 7) * .12;
      smoke.items.forEach(s => { s.position.y += s.userData.rise * dt; s.material.rotation += dt * .05; if (s.position.y > 5) s.position.y = -4; });
      api.warm(.85 + Math.sin(t * 2.3) * .08 + Math.sin(t * 5.1) * .05);
    }
  };
}

const themes = {storm, petals, velvet, embers};

// ---------- entry ----------
export function createWorld(host, cfg, name, {watch = [host]} = {}) {
  let renderer;
  try { renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: 'high-performance'}); }
  catch { return null; }
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  if ('transmissionResolutionScale' in renderer) renderer.transmissionResolutionScale = .5; // glass refraction at half res
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  const camera = new THREE.PerspectiveCamera(34, 1, .05, 60);
  camera.position.set(0, .25, 8);

  const backdrop = buildBackdrop(cfg); scene.add(backdrop.mesh);
  scene.add(new THREE.AmbientLight('#ffffff', .25));
  const key = new THREE.DirectionalLight('#fff3e2', 1.6); key.position.set(3, 4, 5); scene.add(key);
  const rim = new THREE.PointLight(cfg.rim, 22, 14); rim.position.set(-2.8, 1.5, -1.5); scene.add(rim);
  const under = new THREE.PointLight(cfg.liquid, 6, 8); under.position.set(0, -2.2, 1.5); scene.add(under);

  const rig = new THREE.Group(); scene.add(rig);
  const bottle = buildBottle(cfg, name); rig.add(bottle);

  // Ingredient cut-outs: fixed stations in FRONT of the bottle and clear of its silhouette,
  // so nothing ever passes behind the product. They bob gently and parallax with the pointer.
  const stations = [{x: -1.4, y: .95, z: .95, s: .72}, {x: 1.5, y: .45, z: 1.05, s: .82}, {x: 1.3, y: -1.0, z: .85, s: .7}, {x: -1.3, y: -.85, z: 1.15, s: .66}];
  const loader = new THREE.TextureLoader(), floaters = [];
  cfg.ingredients.slice(0, 4).forEach((src, i) => {
    const mat = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, depthWrite: false, side: THREE.DoubleSide});
    const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), mat);
    m.renderOrder = 2;
    m.userData = {...stations[i], p: Math.random() * 6, o: 0};
    loader.load(src, tex => { tex.colorSpace = THREE.SRGBColorSpace; mat.map = tex; mat.needsUpdate = true; const s = m.userData.s; m.scale.set(s * tex.image.width / tex.image.height, s, 1); gsap.to(m.userData, {o: 1, duration: 1.6, delay: 1 + i * .15, ease: 'power2.out'}); });
    rig.add(m); floaters.push(m);
  });

  const atmosphere = themes[cfg.theme](scene, cfg);
  const api = {
    origin: new THREE.Vector3(),
    flash: v => { backdrop.uniforms.uFlash.value = v; key.intensity = 1.6 + v * 5; },
    warm: v => { rim.intensity = 22 * v; under.intensity = 6 * v; }
  };

  // Grade lives in CSS (.pd-grade); the halo gives the bottle its glow
  const grade = cfg.grade || {tint: '#ffffff', vignette: .5, grain: .03, bloom: .5};
  host.style.setProperty('--grade-tint', grade.tint);
  host.style.setProperty('--grade-vignette', grade.vignette);
  host.style.setProperty('--grade-grain', grade.grain * 4);
  host.style.setProperty('--grade-liquid', cfg.liquid);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({map: softDot(), color: cfg.liquid, transparent: true, opacity: .22 + grade.bloom * .25, depthWrite: false, blending: THREE.AdditiveBlending}));
  halo.scale.set(4.6, 5.2, 1); halo.position.set(0, .1, -1.2); rig.add(halo);

  // Notes palette: opening (accent) -> heart (rim) -> base (liquid)
  const stageCols = [new THREE.Color(cfg.accent), new THREE.Color(cfg.rim), new THREE.Color(cfg.liquid)];
  const bgTop = new THREE.Color(cfg.bg[0]), bgBottom = new THREE.Color(cfg.bg[1]), tmp = new THREE.Color(), baseRim = new THREE.Color(cfg.rim);
  const look = new THREE.Vector3();

  const state = {px: 0, py: 0, rx: 0, ry: 0, progress: 0, journey: 0, sp: 0, sj: 0, intro: 0, visible: true, t: 0, mobile: false};
  const layout = () => {
    const w = host.clientWidth, h = host.clientHeight;
    state.mobile = w < 760;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
    backdrop.mesh.scale.setScalar(Math.max(1, camera.aspect / 1.6));
  };
  const ro = new ResizeObserver(layout); ro.observe(host); layout();

  const onMove = e => { state.px = e.clientX / innerWidth * 2 - 1; state.py = e.clientY / innerHeight * 2 - 1; };
  addEventListener('pointermove', onMove, {passive: true});
  const seen = new Set();
  const io = new IntersectionObserver(entries => {
    entries.forEach(en => en.isIntersecting ? seen.add(en.target) : seen.delete(en.target));
    state.visible = seen.size > 0;
    renderer.domElement.style.visibility = state.visible ? 'visible' : 'hidden';
  }, {threshold: 0});
  watch.forEach(el => io.observe(el));

  // Scroll values are damped every frame, so the scene glides at display rate
  // instead of stepping with scroll events.
  const place = (k = 1) => {
    state.sp = lerp(state.sp, state.progress, k); state.sj = lerp(state.sj, state.journey, k);
    const h = smooth(state.sp), n = state.sj, lift = smooth(n / .18);
    const baseX = state.mobile ? 0 : 1.6, baseY = state.mobile ? .45 : -.25;
    // Hero: bottle eases to centre. Notes: it rises and recedes, leaving the stage to the notes.
    rig.position.set(lerp(baseX, state.mobile ? 0 : .9, h), lerp(baseY, -.1, h) + lift * 3.4, -lift * 2.2);
    rig.scale.setScalar(state.mobile ? .7 : .84);
    api.origin.copy(rig.position);
    return {h, n, lift};
  };

  const frame = (time, deltaMs) => {
    if (!state.visible || document.hidden) return;
    const dt = Math.min(deltaMs / 1000, .05); state.t += dt;
    const damp = 1 - Math.exp(-dt * 9);
    const t = state.t, {h, n, lift} = place(damp);
    state.rx = lerp(state.rx, state.py * .12, damp * .6); state.ry = lerp(state.ry, state.px * .4, damp * .6);

    bottle.rotation.y = -.35 + state.ry + Math.sin(t * .35) * .1 + (1 - state.intro) * -1.4 + h * .9 + lift * .6;
    bottle.rotation.x = state.rx * .5;
    bottle.position.y = Math.sin(t * .8) * .05 + (1 - state.intro) * -.6;

    const fade = (1 - smooth((h - .55) / .45)) * (1 - smooth(n / .1));
    floaters.forEach(m => {
      const d = m.userData;
      m.position.set(d.x + state.px * .08 * d.z, d.y + Math.sin(t * .7 + d.p) * .07, d.z);
      m.rotation.set(0, -state.ry * .35, Math.sin(t * .4 + d.p) * .06);
      m.material.opacity = d.o * fade * (1 - h * .35);
    });

    // Camera: soft parallax only; no dolly toward the viewer
    camera.position.x = lerp(camera.position.x, state.px * .22, damp * .5);
    camera.position.y = lerp(camera.position.y, .25 - state.py * .12 - lift * .4, damp * .5);
    camera.position.z = 8 + h * .5 + (1 - state.intro) * 1.4;
    camera.lookAt(rig.position.x * .35, -.1 + lift * .6, 0);

    // Colour shifts per note
    const seg = Math.min(1.999, n * 2), i0 = Math.floor(seg), f = smooth(seg - i0);
    tmp.copy(stageCols[i0]).lerp(stageCols[i0 + 1], f);
    const mixAmt = smooth(n / .15) * .4;
    backdrop.uniforms.uTop.value.copy(bgTop).lerp(tmp, mixAmt);
    backdrop.uniforms.uBottom.value.copy(bgBottom).lerp(tmp, mixAmt * .35);
    backdrop.uniforms.uGlow.value.copy(baseRim).lerp(tmp, smooth(n / .15));
    rim.color.copy(baseRim).lerp(tmp, smooth(n / .15));
    halo.material.opacity = (.22 + grade.bloom * .25) * (1 - lift);
    backdrop.uniforms.uTime.value = t;

    if (!reduce) atmosphere.update(dt, t, api);
    renderer.render(scene, camera);
  };

  renderer.compile(scene, camera);
  place();
  if (reduce) { state.intro = 1; renderer.render(scene, camera); }
  else {
    gsap.to(state, {intro: 1, duration: 2.4, ease: 'expo.out', delay: .15});
    atmosphere.intro?.(api);
    gsap.ticker.add(frame);
  }

  const still = () => { if (reduce) { place(1); renderer.render(scene, camera); } };
  return {
    canvas: renderer.domElement,
    setProgress: v => { state.progress = v; still(); },
    setJourney: v => { state.journey = v; still(); },
    destroy() { gsap.ticker.remove(frame); ro.disconnect(); io.disconnect(); removeEventListener('pointermove', onMove); renderer.dispose(); }
  };
}
