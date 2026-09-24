// Shared renderer and bottle choreography. Individual worlds only own atmosphere.
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {gsap} from 'gsap';
import {createBottle} from './engine/bottle.js';
import {clamp01, dampAmount, lerp, smoothstep} from './engine/math.js';

const themes = {
  storm: () => import('./worlds/silent-storm.js'),
  petals: () => import('./worlds/sweetest-stranger.js'),
  velvet: () => import('./worlds/rebel-in-velvet.js'),
  embers: () => import('./worlds/the-night-lingers.js')
};
const plateSlugs = {storm: 'silent-storm', petals: 'sweetest-stranger', velvet: 'rebel-in-velvet', embers: 'the-night-lingers'};

function makeBackdrop(cfg) {
  const uniforms = {top: {value: new THREE.Color(cfg.bg[0])}, bottom: {value: new THREE.Color(cfg.bg[1])}, glow: {value: new THREE.Color(cfg.rim)}};
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(40, 24), new THREE.ShaderMaterial({
    uniforms, depthWrite: false,
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: 'uniform vec3 top,bottom,glow;varying vec2 vUv;void main(){vec3 c=mix(bottom,top,smoothstep(.04,.96,vUv.y));float h=smoothstep(.62,0.,distance(vUv,vec2(.63,.54)));gl_FragColor=vec4(c+glow*h*.21,1.);}'
  }));
  mesh.position.z = -8;
  return {mesh, uniforms};
}

const emptyAtmosphere = () => ({update() {}, entrance() {}, stage() {}, dispose() {}});

/**
 * `createAtmosphere({THREE, scene, camera, renderer, cfg, bottle, reduced})` must return
 * `{update(dt,t,signals), entrance(progress), stage(index,progress), dispose()}`.
 * Signals are damped `{scroll, beat, beatProgress, pointerX, pointerY, visible}`.
 */
export function createWorld(host, cfg, name, {watch = [host]} = {}) {
  if (!host || !cfg) return null;
  let renderer;
  try { renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: 'high-performance'}); } catch { return null; }
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5));
  if ('transmissionResolutionScale' in renderer) renderer.transmissionResolutionScale = .5;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.06;
  renderer.domElement.setAttribute('aria-hidden', 'true');
  host.append(renderer.domElement);
  // The DOM poster is only a first-paint fallback. Hide it at the successful WebGL
  // handoff rather than relying on a CSS transition that can reveal its full photo.
  const fallbackPoster = host.querySelector('.pd-poster');
  if (fallbackPoster) { fallbackPoster.style.opacity = '0'; fallbackPoster.style.visibility = 'hidden'; }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(34, 1, .05, 60); camera.position.set(0, .25, 8);
  const pmrem = new THREE.PMREMGenerator(renderer); scene.environment = pmrem.fromScene(new RoomEnvironment(), .04).texture;
  const backdrop = makeBackdrop(cfg); scene.add(backdrop.mesh);
  scene.add(new THREE.HemisphereLight('#fff8ec', '#071016', .65));
  const key = new THREE.DirectionalLight('#fff9ef', 2.8); key.position.set(3.5, 5, 5); scene.add(key);
  const edge = new THREE.PointLight('#dff7ff', 13, 8); edge.position.set(-2.3, 1.1, 2.8); scene.add(edge);
  const rim = new THREE.PointLight(cfg.rim, 18, 14); rim.position.set(-2.8, 1.4, -1.5); scene.add(rim);
  const base = new THREE.PointLight(cfg.liquid, 4, 8); base.position.set(0, -2, 1.5); scene.add(base);
  const rig = new THREE.Group(); scene.add(rig);
  const bottle = createBottle(THREE, cfg, name); rig.add(bottle);
  // The transparent studio plate holds the photographic product fidelity at arrival,
  // then crossfades away while the procedural flacon makes its reveal turn.
  const plateMaterial = new THREE.MeshBasicMaterial({transparent: true, opacity: 0, depthWrite: false});
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(2.62, 3.28), plateMaterial);
  plate.position.set(0, .33, .62); plate.renderOrder = 4; rig.add(plate);
  const plateSlug = plateSlugs[cfg.theme];
  if (plateSlug) new THREE.TextureLoader().load(`/plates/${plateSlug}.png`, texture => {
    texture.colorSpace = THREE.SRGBColorSpace; plateMaterial.map = texture; plateMaterial.needsUpdate = true; plateMaterial.opacity = 1;
  });

  const state = {scrollTarget: 0, scroll: 0, revealFinished: false, beatTarget: 0, beat: 0, beatProgressTarget: 0, beatProgress: 0, journeyTarget: 0, journey: 0, px: 0, py: 0, t: 0, visible: true, destroyed: false, mobile: false};
  const palette = [new THREE.Color(cfg.accent), new THREE.Color(cfg.rim), new THREE.Color(cfg.liquid)];
  const top = new THREE.Color(cfg.bg[0]), bottom = new THREE.Color(cfg.bg[1]), originalRim = new THREE.Color(cfg.rim), current = new THREE.Color();
  let atmosphere = emptyAtmosphere();
  const theme = themes[cfg.theme];
  if (theme) theme().then(({createAtmosphere}) => {
    if (state.destroyed || !createAtmosphere) return;
    atmosphere.dispose?.();
    atmosphere = createAtmosphere({THREE, scene, camera, renderer, cfg, bottle, reduced}) || emptyAtmosphere();
    if (!reduced) {
      atmosphere.entrance?.(.25);
      gsap.to({progress: .25}, {progress: 1, duration: 1.8, ease: 'power2.out', onUpdate() { atmosphere.entrance?.(this.targets()[0].progress); }});
    }
  }).catch(() => {});

  const resize = () => {
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    state.mobile = width < 760; renderer.setSize(width, height, false); camera.aspect = width / height; camera.updateProjectionMatrix();
    backdrop.mesh.scale.setScalar(Math.max(1, camera.aspect / 1.6));
  };
  const resizeObserver = new ResizeObserver(resize); resizeObserver.observe(host); resize();
  const pointer = event => { state.px = event.clientX / innerWidth * 2 - 1; state.py = event.clientY / innerHeight * 2 - 1; };
  addEventListener('pointermove', pointer, {passive: true});
  const visibleTargets = new Set();
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => entry.isIntersecting ? visibleTargets.add(entry.target) : visibleTargets.delete(entry.target));
    state.visible = visibleTargets.size > 0; renderer.domElement.style.visibility = state.visible ? 'visible' : 'hidden';
  }, {threshold: 0});
  watch.filter(Boolean).forEach(element => observer.observe(element));

  const render = (time, deltaMs) => {
    if (state.destroyed || !state.visible || document.hidden) return;
    const dt = Math.min(.05, (deltaMs || 16) / 1000), ease = dampAmount(dt, 9); state.t += dt;
    state.scroll = lerp(state.scroll, state.scrollTarget, ease); state.beat = lerp(state.beat, state.beatTarget, ease); state.beatProgress = lerp(state.beatProgress, state.beatProgressTarget, ease); state.journey = lerp(state.journey, state.journeyTarget, ease);
    // Arrival (0) and 150vh reveal (1) retain the bottle. It only leaves as composition (2) begins.
    const reveal = smoothstep(state.scroll);
    // Composition owns a clean stage. Hide the complete bottle rig on its very
    // first scroll update, before the Opening ingredient and copy enter.
    const exit = state.revealFinished || state.journeyTarget > .001 ? 1 : 0;
    const startX = state.mobile ? 0 : 1.55;
    rig.position.set(lerp(startX, state.mobile ? 0 : .78, reveal), lerp(state.mobile ? .42 : -.22, -.08, reveal) + exit * 3.2, -exit * 2.4);
    rig.scale.setScalar((state.mobile ? .7 : .84) * (1 - exit * .48)); rig.visible = exit < .985;
    bottle.rotation.y = -.32 + state.px * .22 + Math.sin(state.t * .35) * .1 + reveal * 2.1; bottle.rotation.x = -state.py * .06; bottle.position.y = Math.sin(state.t * .8) * .035;
    // The studio plate carries the complete arrival and reveal. The procedural
    // object stays available to worlds but never exposes an imperfect shell in
    // the composition handoff.
    const plateActive = Boolean(plateMaterial.map) && !state.revealFinished && state.journeyTarget <= .001;
    plateMaterial.opacity = plateActive ? 1 : 0;
    plate.visible = plateActive;
    bottle.visible = !plateActive;
    camera.position.x = lerp(camera.position.x, state.px * .2, ease * .65); camera.position.y = lerp(camera.position.y, .22 - state.py * .1 - exit * .32, ease * .65); camera.position.z = lerp(camera.position.z, 8 - reveal * .8 + exit * .6, ease * .6); camera.lookAt(rig.position.x * .3, -.12 + exit * .5, 0);
    const stage = Math.min(2, Math.floor(state.beat)); current.copy(palette[stage]); const mix = smoothstep(state.beatProgress);
    backdrop.uniforms.top.value.copy(top).lerp(current, mix * .36); backdrop.uniforms.bottom.value.copy(bottom).lerp(current, mix * .14); backdrop.uniforms.glow.value.copy(originalRim).lerp(current, mix); rim.color.copy(backdrop.uniforms.glow.value);
    const signals = {scroll: state.scroll, beat: state.beat, beatProgress: state.beatProgress, stageProgress: state.beatProgress, pointerX: state.px, pointerY: state.py, visible: state.visible};
    if (!reduced) atmosphere.update?.(dt, state.t, signals); atmosphere.stage?.(stage, state.beatProgress);
    renderer.render(scene, camera);
  };
  renderer.compile(scene, camera);
  if (reduced) render(0, 16); else gsap.ticker.add(render);
  const still = () => { if (reduced) render(0, 16); };
  const controls = {
    canvas: renderer.domElement,
    setScroll(value) { state.scrollTarget = clamp01(value); still(); },
    setBeat(index, progress = 0) { state.beatTarget = Math.max(0, Math.min(2, index)); state.beatProgressTarget = clamp01(progress); still(); },
    setPointer(x, y) { state.px = x; state.py = y; }, resize,
    pause() { state.visible = false; }, resume() { state.visible = true; },
    setProgress(value) { controls.setScroll(value); state.revealFinished = value >= .995; },
    setJourney(value) { const progress = clamp01(value); state.journeyTarget = progress; const journey = progress * 3; controls.setBeat(Math.min(2, Math.floor(journey)), journey % 1); },
    destroy() { state.destroyed = true; gsap.ticker.remove(render); resizeObserver.disconnect(); observer.disconnect(); removeEventListener('pointermove', pointer); atmosphere.dispose?.(); plateMaterial.map?.dispose(); plateMaterial.dispose(); pmrem.dispose(); renderer.dispose(); renderer.domElement.remove(); },
    dispose() { controls.destroy(); }
  };
  return controls;
}
