import * as THREE from 'three';
import { gsap } from 'gsap';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { createBackground } from './background.js';
import { createBottles, createPlinth } from './bottles.js';
import { createDust } from './particles.js';
import { createSpriteField } from './sprites.js';
import { createPost } from './post.js';

const PRODUCT_IDS = ['silent-storm', 'sweetest-stranger', 'rebel-in-velvet', 'the-night-lingers'];

export const MOODS = {
  intro: { bg: '#0c0a09', fog: '#1a1410', light: '#c8a86a', smoke: 0.62, shaft: 0.95, warmth: 0.5 },
  hub: { bg: '#0c0a09', fog: '#1a1410', light: '#c8a86a', smoke: 0.4, shaft: 0.6, warmth: 0.55 },
  hushed: { bg: '#10171a', fog: '#1f2a2d', light: '#bcc9cb', smoke: 0.3, shaft: 0.8, warmth: 0.12 },
  poised: { bg: '#16110d', fog: '#241c17', light: '#c8a86a', smoke: 0.45, shaft: 0.62, warmth: 0.5 },
  untamed: { bg: '#1c0c0f', fog: '#2a1620', light: '#e0a15a', smoke: 0.78, shaft: 0.5, warmth: 0.92 },
  firstLight: { bg: '#12181a', fog: '#212a2b', light: '#cfd6c6', smoke: 0.34, shaft: 0.85, warmth: 0.28 },
  longAfternoon: { bg: '#1b140f', fog: '#291f16', light: '#e0b876', smoke: 0.4, shaft: 0.7, warmth: 0.6 },
  goldenHour: { bg: '#211309', fog: '#331e13', light: '#e8975a', smoke: 0.5, shaft: 0.68, warmth: 0.82 },
  afterMidnight: { bg: '#0a0810', fog: '#170f1c', light: '#9a86b8', smoke: 0.85, shaft: 0.28, warmth: 0.2 },
  'silent-storm': { bg: '#0e1517', fog: '#1c262a', light: '#8faab5', smoke: 0.32, shaft: 0.85, warmth: 0.18 },
  'sweetest-stranger': { bg: '#1c1310', fog: '#2c1c1a', light: '#c99593', smoke: 0.42, shaft: 0.65, warmth: 0.5 },
  'rebel-in-velvet': { bg: '#160e17', fog: '#241629', light: '#977094', smoke: 0.58, shaft: 0.5, warmth: 0.5 },
  'the-night-lingers': { bg: '#180f08', fog: '#2a1a0e', light: '#c88f56', smoke: 0.62, shaft: 0.55, warmth: 0.78 },
};

const CAMERA_STAGES = {
  intro: { pos: [0, 1.9, 12.5], look: [0, 0.9, 0], fov: 34 },
  hub: { pos: [0, 0.78, 6.6], look: [0, 0.48, 0], fov: 30 },
  q1: { pos: [0, 2.8, 7.2], look: [0, 3.6, -4], fov: 44 },
  q2: { pos: [0.25, 2.9, 7.0], look: [0, 3.5, -4], fov: 46 },
  q3: { pos: [-0.25, 2.9, 7.2], look: [0, 3.7, -4], fov: 46 },
  result: { pos: [0.78, 0.72, 4.4], look: [0.78, 0.5, 0], fov: 30 },
};
const INTRO_FAR = { pos: [0, 2.2, 13.5], look: [0, 1.0, 0], fov: 36 };
const INTRO_NEAR = CAMERA_STAGES.hub;

export async function createScene(canvas, { onProgress, reducedMotion, isMobile } = {}) {
  const progress = (p) => {
    if (typeof onProgress === 'function') onProgress(Math.min(1, Math.max(0, p)));
  };
  progress(0.02);

  const renderer = new THREE.WebGLRenderer({
    canvas,
    antialias: true,
    alpha: false,
    powerPreference: 'high-performance',
  });
  renderer.localClippingEnabled = true;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 0.92;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  const dprCap = isMobile ? 1.0 : 1.5;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 60);
  camera.position.set(...CAMERA_STAGES.intro.pos);
  camera.lookAt(...CAMERA_STAGES.intro.look);

  const width = () => canvas.clientWidth || window.innerWidth;
  const height = () => canvas.clientHeight || window.innerHeight;

  // --- lights ---------------------------------------------------------
  // Punctual point lights placed near the transmissive glass produced ugly
  // blown "sun through a lens" hotspots (three.js's transmission approximation
  // focuses close point lights into a hard flare). Directional + hemisphere
  // lights read the same warm high-window mood without that artifact.
  const keyLight = new THREE.DirectionalLight(0xc8a86a, 1.1);
  keyLight.position.set(0.4, 4.2, 2.2);
  scene.add(keyLight);
  const fillLight = new THREE.DirectionalLight(0x9f7a4a, 0.4);
  fillLight.position.set(-3, 1.6, 3);
  scene.add(fillLight);
  const rimLight = new THREE.DirectionalLight(0xecd9a8, 0.45);
  rimLight.position.set(0, 2.2, -3);
  scene.add(rimLight);
  scene.add(new THREE.AmbientLight(0x30271f, 0.4));
  scene.add(new THREE.HemisphereLight(0x2a2420, 0x0a0806, 0.3));

  // --- environment ------------------------------------------------------
  const pmrem = new THREE.PMREMGenerator(renderer);
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04);
  const envMap = envRT.texture;
  scene.environment = envMap;
  progress(0.15);

  // --- background -------------------------------------------------------
  const background = createBackground(renderer);
  background.setMood(MOODS.intro);
  scene.add(background.mesh);
  progress(0.25);

  // --- bottles + plinth --------------------------------------------------
  const { group: bottleGroup, bottles, woodTex, capTex } = await createBottles(envMap);
  bottleGroup.position.y = 0;
  scene.add(bottleGroup);
  progress(0.55);

  const { group: plinthGroup } = createPlinth(woodTex);
  scene.add(plinthGroup);

  // --- dust + sprites -----------------------------------------------------
  const dustCount = isMobile ? 350 : 700;
  const dust = createDust(dustCount);
  scene.add(dust.points);
  progress(0.72);

  const sprites = createSpriteField({ reducedMotion });
  sprites.group.position.set(0, 3.45, -1.2);
  sprites.group.scale.setScalar(1.7);
  scene.add(sprites.group);

  // --- postprocessing -----------------------------------------------------
  const post = createPost(renderer, scene, camera, width(), height());
  progress(0.85);

  function resize() {
    const w = width();
    const h = height();
    camera.aspect = w / Math.max(h, 1);
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
    post.setSize(w, h);
    background.setSize(w, h);
  }
  resize();
  window.addEventListener('resize', resize);

  // --- state ---------------------------------------------------------------
  let currentStage = 'intro';
  let quality = 'high';
  let destroyed = false;
  let paused = false;
  let introProgress = 0;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0, active: false };
  let raycastEnabled = false;
  let hoveredId = null;
  let focusedId = null;
  const hoverCbs = [];
  const clickCbs = [];
  const raycaster = new THREE.Raycaster();
  const ndc = new THREE.Vector2();

  function onPointerMove(e) {
    const w = width();
    const h = height();
    mouse.tx = (e.clientX / w) * 2 - 1;
    mouse.ty = -(e.clientY / h) * 2 + 1;
    mouse.active = true;
    background.setMouseUv(e.clientX / w, 1 - e.clientY / h, true);
    if (raycastEnabled) doRaycast(e.clientX, e.clientY);
  }
  function onPointerLeave() {
    mouse.active = false;
    background.setMouseUv(-1, -1, false);
  }
  function onPointerDown(e) {
    if (raycastEnabled) {
      const hit = doRaycast(e.clientX, e.clientY, true);
      if (hit) clickCbs.forEach((cb) => cb(hit));
    }
  }
  window.addEventListener('pointermove', onPointerMove, { passive: true });
  window.addEventListener('pointerleave', onPointerLeave, { passive: true });
  window.addEventListener('pointerdown', onPointerDown, { passive: true });

  function doRaycast(clientX, clientY, isClick = false) {
    const w = width();
    const h = height();
    ndc.set((clientX / w) * 2 - 1, -(clientY / h) * 2 + 1);
    raycaster.setFromCamera(ndc, camera);
    const meshes = [];
    bottles.forEach((b) => b.group.traverse((o) => o.isMesh && meshes.push(o)));
    const hits = raycaster.intersectObjects(meshes, false);
    const id = hits.length ? hits[0].object.userData.productId : null;
    if (!isClick) {
      if (id !== hoveredId) {
        hoverProduct(id);
        hoverCbs.forEach((cb) => cb(id, { x: clientX, y: clientY }));
      }
    }
    return id;
  }

  function onVisibility() {
    paused = document.hidden;
  }
  document.addEventListener('visibilitychange', onVisibility);

  // --- camera rig ---------------------------------------------------------
  // camBase/lookBase are tweened by gsap for stage transitions & intro scrub;
  // parallax is a small independent offset applied on top each frame so the
  // two never fight over camera.position.
  const camBase = { x: CAMERA_STAGES.intro.pos[0], y: CAMERA_STAGES.intro.pos[1], z: CAMERA_STAGES.intro.pos[2], fov: CAMERA_STAGES.intro.fov };
  const lookBase = { x: CAMERA_STAGES.intro.look[0], y: CAMERA_STAGES.intro.look[1], z: CAMERA_STAGES.intro.look[2] };
  const parallax = { x: 0, y: 0 };

  function tweenCamera(target, dur = 1.4) {
    gsap.to(camBase, { x: target.pos[0], y: target.pos[1], z: target.pos[2], fov: target.fov, duration: dur, ease: 'power3.inOut' });
    gsap.to(lookBase, { x: target.look[0], y: target.look[1], z: target.look[2], duration: dur, ease: 'power3.inOut' });
  }

  function applyCamera() {
    // Portrait screens: dolly back so the four-bottle row still fits, and
    // centre any sideways framing offset (result split layout is desktop-only).
    const portrait = camera.aspect < 0.9;
    const k = portrait ? Math.min(2.2, 1 + (1.6 / camera.aspect - 1) * 0.5) : 1;
    const xo = portrait ? 0 : 1;
    camera.position.set(camBase.x * xo + parallax.x, camBase.y + parallax.y, camBase.z * k);
    camera.lookAt(lookBase.x * xo, lookBase.y, lookBase.z);
    if (camera.fov !== camBase.fov) {
      camera.fov = camBase.fov;
      camera.updateProjectionMatrix();
    }
  }

  // --- mood tween --------------------------------------------------------
  let currentMood = { ...MOODS.intro };
  const moodTweenTarget = { ...MOODS.intro };
  function setMood(mood, dur = 1.2) {
    const target = typeof mood === 'string' ? MOODS[mood] : mood;
    if (!target) return;
    const from = { ...moodTweenTarget };
    const proxy = { t: 0 };
    gsap.killTweensOf(proxy);
    gsap.to(proxy, {
      t: 1,
      duration: reducedMotion ? Math.min(dur, 0.4) : dur,
      ease: 'power2.inOut',
      onUpdate: () => {
        const fromColor = {
          bg: new THREE.Color(from.bg),
          fog: new THREE.Color(from.fog),
          light: new THREE.Color(from.light),
        };
        const toColor = {
          bg: new THREE.Color(target.bg),
          fog: new THREE.Color(target.fog),
          light: new THREE.Color(target.light),
        };
        const bg = fromColor.bg.clone().lerp(toColor.bg, proxy.t);
        const fog = fromColor.fog.clone().lerp(toColor.fog, proxy.t);
        const light = fromColor.light.clone().lerp(toColor.light, proxy.t);
        background.setMood({
          bg: `#${bg.getHexString()}`,
          fog: `#${fog.getHexString()}`,
          light: `#${light.getHexString()}`,
          smoke: THREE.MathUtils.lerp(from.smoke, target.smoke, proxy.t),
          shaft: THREE.MathUtils.lerp(from.shaft, target.shaft, proxy.t),
          warmth: THREE.MathUtils.lerp(from.warmth, target.warmth, proxy.t),
        });
      },
    });
    Object.assign(moodTweenTarget, target);
    currentMood = target;
  }

  function blendMood(a, b, t) {
    const ma = MOODS[a];
    const mb = MOODS[b];
    if (!ma || !mb) return;
    const bg = new THREE.Color(ma.bg).lerp(new THREE.Color(mb.bg), t);
    const fog = new THREE.Color(ma.fog).lerp(new THREE.Color(mb.fog), t);
    const light = new THREE.Color(ma.light).lerp(new THREE.Color(mb.light), t);
    background.setMood({
      bg: `#${bg.getHexString()}`,
      fog: `#${fog.getHexString()}`,
      light: `#${light.getHexString()}`,
      smoke: THREE.MathUtils.lerp(ma.smoke, mb.smoke, t),
      shaft: THREE.MathUtils.lerp(ma.shaft, mb.shaft, t),
      warmth: THREE.MathUtils.lerp(ma.warmth, mb.warmth, t),
    });
  }

  // --- stage control -------------------------------------------------------
  function setStage(stage, opts = {}) {
    currentStage = stage;
    raycastEnabled = stage === 'hub' || stage === 'result';
    // Quiz steps happen in the abstract room: bottles + plinth sink out of frame.
    const inQuiz = stage === 'q1' || stage === 'q2' || stage === 'q3';
    gsap.to([bottleGroup.position, plinthGroup.position], { y: inQuiz ? -2.4 : 0, duration: 1.6, ease: 'power3.inOut', overwrite: true });
    const target = CAMERA_STAGES[stage] || CAMERA_STAGES.hub;
    tweenCamera(target, reducedMotion ? 0.5 : 1.4);

    if (stage === 'intro') {
      setMood('intro', 0.8);
    } else if (stage === 'hub') {
      setMood('hub', 1.2);
      focusProduct(null);
    } else if (stage === 'result' && opts.productId) {
      setMood(opts.productId, 1.3);
      focusProduct(opts.productId);
    }
  }

  function setIntroProgress(t) {
    introProgress = THREE.MathUtils.clamp(t, 0, 1);
    if (currentStage !== 'intro') return;
    const a = INTRO_FAR;
    const b = INTRO_NEAR;
    gsap.killTweensOf(camBase);
    gsap.killTweensOf(lookBase);
    camBase.x = THREE.MathUtils.lerp(a.pos[0], b.pos[0], introProgress);
    camBase.y = THREE.MathUtils.lerp(a.pos[1], b.pos[1], introProgress);
    camBase.z = THREE.MathUtils.lerp(a.pos[2], b.pos[2], introProgress);
    camBase.fov = THREE.MathUtils.lerp(a.fov, b.fov, introProgress);
    lookBase.x = THREE.MathUtils.lerp(a.look[0], b.look[0], introProgress);
    lookBase.y = THREE.MathUtils.lerp(a.look[1], b.look[1], introProgress);
    lookBase.z = THREE.MathUtils.lerp(a.look[2], b.look[2], introProgress);
  }

  function focusProduct(id) {
    focusedId = id;
    bottles.forEach((b) => {
      const isFocus = id ? b.id === id : false;
      const targetScale = id ? (isFocus ? 1.0 : 0.8) : 1;
      const targetX = id ? (isFocus ? 0 : b.basePos.x * 1.8) : b.basePos.x;
      const targetOpacity = id ? (isFocus ? 1 : 0) : 1;
      gsap.to(b.group.position, { x: targetX, z: id ? (isFocus ? 0.3 : -1.6) : 0, duration: 1.3, ease: 'power3.inOut' });
      gsap.to(b.group.scale, { x: targetScale, y: targetScale, z: targetScale, duration: 1.3, ease: 'power3.inOut' });
      b.group.traverse((o) => {
        if (o.isMesh && o.material) {
          const m = o.material;
          const baseOp = m.userData.baseOpacity ?? 1;
          if (!m.transparent) { m.transparent = true; m.needsUpdate = true; }
          o.visible = true;
          gsap.to(m, {
            opacity: baseOp * targetOpacity, duration: 1.0, overwrite: true,
            onComplete: () => {
              if (targetOpacity === 0) o.visible = false;
              if (baseOp >= 1 && targetOpacity >= 1) { m.transparent = false; m.needsUpdate = true; }
            },
          });
        }
      });
      if (isFocus && !reducedMotion) {
        gsap.killTweensOf(b.group.rotation);
        gsap.fromTo(b.group.rotation, { y: -0.45 }, { y: 0.45, duration: 7, repeat: -1, yoyo: true, ease: 'sine.inOut' });
      } else {
        gsap.killTweensOf(b.group.rotation);
        gsap.to(b.group.rotation, { y: 0, duration: 1, ease: 'power3.out' });
      }
    });
  }

  function hoverProduct(id) {
    hoveredId = id;
    bottles.forEach((b) => {
      const lift = id && b.id === id ? 0.06 : 0;
      gsap.to(b.group.position, { y: lift, duration: 0.4, ease: 'power2.out' });
    });
    gsap.to(rimLight, { intensity: id ? 0.65 : 0.32, duration: 0.4, ease: 'power2.out' });
  }

  // --- particle burst (screen-space) --------------------------------------
  function burst(x, y, colorHex = '#c8a86a') {
    const w = width();
    const h = height();
    const nx = (x / w) * 2 - 1;
    const ny = -(y / h) * 2 + 1;
    const vec = new THREE.Vector3(nx, ny, 0.5).unproject(camera);
    const dir = vec.sub(camera.position).normalize();
    const dist = 2.2;
    const origin = camera.position.clone().addScaledVector(dir, dist);

    const n = 18;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(n * 3);
    const vel = [];
    for (let i = 0; i < n; i++) {
      pos[i * 3] = origin.x;
      pos[i * 3 + 1] = origin.y;
      pos[i * 3 + 2] = origin.z;
      vel.push(new THREE.Vector3((Math.random() - 0.5) * 2, Math.random() * 1.5, (Math.random() - 0.5) * 2));
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.PointsMaterial({ color: new THREE.Color(colorHex), size: 0.05, transparent: true, opacity: 1, depthWrite: false });
    const points = new THREE.Points(geo, mat);
    scene.add(points);
    const proxy = { t: 0 };
    gsap.to(proxy, {
      t: 1,
      duration: 0.7,
      ease: 'power2.out',
      onUpdate: () => {
        const arr = geo.attributes.position.array;
        for (let i = 0; i < n; i++) {
          arr[i * 3] = origin.x + vel[i].x * proxy.t;
          arr[i * 3 + 1] = origin.y + vel[i].y * proxy.t - proxy.t * proxy.t * 1.2;
          arr[i * 3 + 2] = origin.z + vel[i].z * proxy.t;
        }
        geo.attributes.position.needsUpdate = true;
        mat.opacity = 1 - proxy.t;
      },
      onComplete: () => {
        scene.remove(points);
        geo.dispose();
        mat.dispose();
      },
    });
  }

  // --- quality ---------------------------------------------------------
  function setQuality(q) {
    quality = q;
    post.setQuality(q);
    dust.setCount(q === 'high' ? dust.maxCount : Math.floor(dust.maxCount * 0.4));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, q === 'high' ? dprCap : 1));
  }
  setQuality(isMobile ? 'low' : 'high');

  // --- perf monitor -------------------------------------------------------
  let frameAccum = 0;
  let frameSamples = 0;
  let badTime = 0;

  // Precompile every material's shader program and upload textures now,
  // while the loader overlay is still covering the canvas, so the first
  // stage transitions don't stall on shader compilation / texture upload.
  try {
    renderer.compile(scene, camera);
    if (envMap) renderer.initTexture(envMap);
    if (woodTex) renderer.initTexture(woodTex);
    if (capTex) renderer.initTexture(capTex);
  } catch (e) {
    /* best-effort warm-up — never block scene creation on it */
  }

  // --- main loop -----------------------------------------------------------
  // Driven by gsap.ticker rather than our own requestAnimationFrame loop, so
  // there is exactly one rAF driving both the camera/mood tweens and the
  // render — no duplicate rAF registrations, no drift between the two.
  let elapsed = 0;
  function loop(time, deltaTime) {
    if (destroyed) return;
    if (paused) return;
    const dt = Math.min(deltaTime / 1000, 0.1);
    elapsed += dt;
    const t0 = performance.now();

    mouse.x = THREE.MathUtils.lerp(mouse.x, mouse.tx, 0.06);
    mouse.y = THREE.MathUtils.lerp(mouse.y, mouse.ty, 0.06);
    if (!reducedMotion) {
      parallax.x = THREE.MathUtils.lerp(parallax.x, mouse.x * 0.18, 0.08);
      parallax.y = THREE.MathUtils.lerp(parallax.y, mouse.y * 0.1, 0.08);
    } else {
      parallax.x = THREE.MathUtils.lerp(parallax.x, 0, 0.1);
      parallax.y = THREE.MathUtils.lerp(parallax.y, 0, 0.1);
    }
    applyCamera();

    background.fitToCamera(camera, 30);
    background.update(dt, elapsed, renderer);
    dust.update(dt, elapsed);
    dust.setMouseWorld(
      new THREE.Vector3(mouse.x * 3, mouse.y * 2 + 1, 0),
      mouse.active
    );
    sprites.update(dt, elapsed, mouse.active ? { x: mouse.x, y: mouse.y } : null);
    post.update(dt, elapsed);
    post.render();

    const frameMs = performance.now() - t0;
    frameAccum += frameMs;
    frameSamples++;
    if (frameSamples >= 30) {
      const avg = frameAccum / frameSamples;
      if (avg > 22) {
        badTime += 1;
        if (badTime >= 2 && quality === 'high') setQuality('low');
      } else {
        badTime = 0;
      }
      frameAccum = 0;
      frameSamples = 0;
    }
  }
  gsap.ticker.add(loop);

  progress(1);

  // --- public API ------------------------------------------------------
  const api = {
    setStage,
    setIntroProgress,
    setMood,
    moods: MOODS,
    blendMood,
    showSprites: (names, dir = 1) => sprites.showSprites(names, dir),
    clearSprites: () => sprites.clearSprites(),
    burst,
    focusProduct,
    hoverProduct,
    onProductHover: (cb) => hoverCbs.push(cb),
    onProductClick: (cb) => clickCbs.push(cb),
    setQuality,
    destroy,
  };

  function destroy() {
    destroyed = true;
    gsap.ticker.remove(loop);
    window.removeEventListener('resize', resize);
    window.removeEventListener('pointermove', onPointerMove);
    window.removeEventListener('pointerleave', onPointerLeave);
    window.removeEventListener('pointerdown', onPointerDown);
    document.removeEventListener('visibilitychange', onVisibility);
    gsap.killTweensOf(camBase);
    gsap.killTweensOf(lookBase);
    background.dispose();
    dust.dispose();
    sprites.dispose();
    post.dispose();
    pmrem.dispose();
    envRT.dispose();
    scene.traverse((o) => {
      if (o.isMesh) {
        o.geometry?.dispose();
        if (Array.isArray(o.material)) o.material.forEach((m) => m.dispose());
        else o.material?.dispose();
      }
    });
    renderer.dispose();
  }

  return api;
}
