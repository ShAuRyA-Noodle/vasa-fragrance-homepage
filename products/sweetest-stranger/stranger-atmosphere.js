import * as THREE from 'three';
import { createSweetestStrangerBottle } from './model/createSweetestStrangerBottle.js';

const clamp = (n) => Math.max(0, Math.min(1, Number(n) || 0));
const ease = (n) => n * n * (3 - 2 * n);
const bell = (p, at, width) => ease(1 - clamp(Math.abs(p - at) / width));
const poses = [
  { at: 0, camX: 0, camY: 0, camZ: 9.2, x: 0, y: -.08, scale: .93, yaw: -.035, roll: 0 },
  { at: .2, camX: -.5, camY: .1, camZ: 8.6, x: .19, y: .05, scale: 1, yaw: .12, roll: -.025 },
  { at: .4, camX: .46, camY: .48, camZ: 7.15, x: -.16, y: .08, scale: 1.04, yaw: -.14, roll: .016 },
  { at: .6, camX: -.42, camY: -.06, camZ: 8.4, x: .2, y: .07, scale: .99, yaw: .13, roll: -.02 },
  { at: .8, camX: .27, camY: .12, camZ: 8.7, x: -.1, y: .04, scale: .99, yaw: -.07, roll: .012 },
  { at: 1, camX: 0, camY: 0, camZ: 9.2, x: 0, y: -.08, scale: .93, yaw: 0, roll: 0 },
];

function pose(progress, key) {
  let index = poses.length - 2;
  for (let i = 0; i < poses.length - 1; i += 1) {
    if (progress <= poses[i + 1].at) { index = i; break; }
  }
  const a = poses[index];
  const b = poses[index + 1];
  const t = ease(clamp((progress - a.at) / (b.at - a.at)));
  return THREE.MathUtils.lerp(a[key], b[key], t);
}

/** Scroll-directed 3D set with the real VASA front label always legible. */
export function createStrangerAtmosphere(host, { stage } = {}) {
  const inert = { setProgress() {}, destroy() {} };
  if (!(host instanceof HTMLElement)) return inert;
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  } catch { return inert; }
  const canvas = renderer.domElement;
  canvas.setAttribute('aria-hidden', 'true');
  canvas.style.cssText = 'display:block;width:100%;height:100%;pointer-events:none';
  host.style.opacity = '0';
  host.style.transition = 'opacity 700ms cubic-bezier(.22,1,.36,1)';
  host.appendChild(canvas);

  const mobile = matchMedia('(max-width: 700px)');
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile.matches ? 1.1 : 1.5));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.45;
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(36, 1, .1, 60);
  camera.position.set(0, 0, 9.2);
  scene.add(new THREE.HemisphereLight(0xffe8dc, 0x4f2935, 2.2));
  const key = new THREE.DirectionalLight(0xffe6c6, 3.7);
  key.position.set(-4, 5, 7);
  scene.add(key);
  const rim = new THREE.DirectionalLight(0xf8b4aa, 3.1);
  rim.position.set(3.7, 2.1, -4.4);
  scene.add(rim);
  const glint = new THREE.PointLight(0xffd0a1, 5.2, 8, 2);
  glint.position.set(-3, -1.2, 1.4);
  scene.add(glint);

  const bottle = createSweetestStrangerBottle();
  scene.add(bottle.group);

  // A travelling highlight crosses the real geometry and its cap. A separate
  // front plate retains the accurate branded type as the shoulders reveal depth.
  const sweep = new THREE.SpotLight(0xffeee4, 0, 9, Math.PI / 8, .75, 1.6);
  sweep.position.set(-3, 4, 3);
  sweep.target.position.set(0, .2, 0);
  scene.add(sweep, sweep.target);

  // Behind the vessel, slow fog changes the atmosphere without placing a dark
  // pane over either the bottle or its text.
  const fog = new THREE.Mesh(new THREE.PlaneGeometry(15, 10), new THREE.ShaderMaterial({
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    uniforms: { time: { value: 0 }, progress: { value: 0 }, strength: { value: 0 } },
    vertexShader: `varying vec2 uv;void main(){uv=position.xy;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: `varying vec2 uv;uniform float time;uniform float progress;uniform float strength;
      float h(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float n(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h(i),h(i+vec2(1.,0.)),f.x),mix(h(i+vec2(0.,1.)),h(i+vec2(1.,1.)),f.x),f.y);}
      void main(){vec2 p=uv*.43+vec2(time*.035+progress*.3,-time*.012);float mist=n(p*3.)*.62+n(p*6.)*.38;
        float a=smoothstep(.48,.75,mist)*strength*.18;gl_FragColor=vec4(mix(vec3(.87,.51,.55),vec3(1.,.76,.54),progress*.5),a);}`,
  }));
  fog.position.z = -4.3;
  scene.add(fog);

  // Feathered volumetric-looking beams, separate depth from the fog and
  // landscape. Their illumination rises and falls at the camera's close pass.
  const beamGeometry = new THREE.PlaneGeometry(1, 1);
  const beams = [];
  for (let i = 0; i < 5; i += 1) {
    const material = new THREE.ShaderMaterial({
      transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      uniforms: { alpha: { value: 0 }, warm: { value: i === 4 ? 1 : 0 } },
      vertexShader: `varying vec2 uv;void main(){uv=position.xy+.5;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
      fragmentShader: `varying vec2 uv;uniform float alpha;uniform float warm;void main(){
        float feather=pow(max(0.,1.-abs(uv.x-.5)*2.),2.6);
        vec3 tint=mix(vec3(.97,.72,.75),vec3(1.,.77,.51),warm);
        gl_FragColor=vec4(tint,feather*mix(.25,1.,uv.y)*alpha*.2);}`,
    });
    const mesh = new THREE.Mesh(beamGeometry, material);
    mesh.position.set(-5.3 + i * 2.55, .1 + (i % 2) * .4, -2.8);
    mesh.rotation.z = -.36 + i * .13;
    mesh.scale.set(1.4 + (i % 2) * .35, 7.2, 1);
    scene.add(mesh);
    beams.push({ mesh, material });
  }

  // Curved perfume ribbons are tube geometry, not a 2D overlay. They sweep across
  // and behind the product at changing z positions as scroll progresses.
  const air = new THREE.Group();
  air.position.z = -1.3;
  scene.add(air);
  const trails = [];
  for (let i = 0; i < 8; i += 1) {
    const y = -1.9 + i * .52;
    const curve = new THREE.CatmullRomCurve3([
      new THREE.Vector3(-6, y - .3, -1.4 - i * .08),
      new THREE.Vector3(-2, y + .2, -.5),
      new THREE.Vector3(1.2, y + .45, .13),
      new THREE.Vector3(6, y - .3, -.9),
    ]);
    const geometry = new THREE.TubeGeometry(curve, 80, i % 3 ? .005 : .01, 4);
    const material = new THREE.MeshBasicMaterial({
      color: i % 4 === 0 ? 0xf8cba1 : 0xf5bfbd,
      transparent: true, opacity: 0, depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    air.add(new THREE.Mesh(geometry, material));
    trails.push({ geometry, material });
  }

  // Three photographically grounded ingredients occupy different distances.
  // They approach from the periphery, then recede; never cover the printed face.
  const loader = new THREE.TextureLoader();
  const ingredientSpecs = [
    { url: '/media/campaign/scent-elements/pear-blossom-branch.webp', at: .49, x: -2.9, y: -.8, z: .7, size: 1.85 },
    { url: '/media/campaign/scent-elements/gardenia-bloom.webp', at: .69, x: 2.9, y: .45, z: -.2, size: 2.2 },
    { url: '/media/campaign/scent-elements/brown-sugar-crystals.webp', at: .86, x: -2.7, y: -1.1, z: .55, size: 2 },
  ];
  const ingredients = ingredientSpecs.map((spec) => {
    const material = new THREE.SpriteMaterial({ transparent: true, opacity: 0, depthWrite: false });
    const sprite = new THREE.Sprite(material);
    sprite.visible = false;
    scene.add(sprite);
    let texture;
    loader.load(spec.url, (loaded) => {
      texture = loaded;
      loaded.colorSpace = THREE.SRGBColorSpace;
      material.map = loaded;
      material.needsUpdate = true;
      sprite.visible = true;
    }, undefined, () => {});
    return { spec, material, sprite, get texture() { return texture; } };
  });

  // Depth-spaced flecks give the dolly a measurable parallax cue.
  let seed = 493187;
  const random = () => { seed = (1664525 * seed + 1013904223) >>> 0; return seed / 4294967296; };
  const count = mobile.matches ? 80 : 160;
  const base = new Float32Array(count * 3);
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i += 1) {
    base[i * 3] = (random() - .5) * 12;
    base[i * 3 + 1] = (random() - .5) * 7;
    base[i * 3 + 2] = -3.2 + (i % 4) * 1.3;
  }
  positions.set(base);
  const fleckGeometry = new THREE.BufferGeometry();
  fleckGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const fleckMaterial = new THREE.PointsMaterial({
    color: 0xffe4d8, size: .035, sizeAttenuation: true,
    transparent: true, opacity: 0, depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  scene.add(new THREE.Points(fleckGeometry, fleckMaterial));

  let target = 0, current = 0, visible = true, ready = false, disposed = false;
  let frame = 0, lastRender = 0, pointerX = 0, pointerY = 0;
  const clock = new THREE.Clock();

  function render() {
    if (disposed || !ready || document.hidden) return;
    current += (target - current) * (reducedMotion.matches ? 1 : .16);
    if (Math.abs(target - current) < .0001) current = target;
    const p = current, seconds = clock.getElapsedTime(), small = mobile.matches;
    camera.position.set(
      (small ? .22 : 1) * pose(p, 'camX') + (small ? 0 : pointerX * .045),
      (small ? .35 : 1) * pose(p, 'camY') + (small ? 0 : pointerY * .035),
      pose(p, 'camZ') + (small ? 1.1 : 0),
    );
    camera.lookAt(0, p > .31 && p < .48 ? .12 * bell(p, .4, .12) : 0, 0);
    const viewHeight = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * camera.position.z;
    const viewWidth = viewHeight * camera.aspect;
    const anchorX = small ? 0 : viewWidth * .14;
    const anchorY = small ? viewHeight * .13 : -viewHeight * .02;
    const scale = (small ? .61 : 1) * pose(p, 'scale');
    bottle.group.scale.setScalar(scale);
    bottle.group.position.set(
      anchorX + pose(p, 'x') * (small ? .24 : 1),
      anchorY + pose(p, 'y') * scale + (reducedMotion.matches ? 0 : Math.sin(seconds * .7) * .012),
      0,
    );
    bottle.group.rotation.set(
      reducedMotion.matches ? 0 : -pointerY * .006,
      pose(p, 'yaw') + (reducedMotion.matches ? 0 : pointerX * .008),
      pose(p, 'roll'),
    );
    const energy = Math.max(bell(p, .34, .3), bell(p, .72, .32) * .8);
    fog.material.uniforms.time.value = reducedMotion.matches ? 0 : seconds;
    fog.material.uniforms.progress.value = p;
    fog.material.uniforms.strength.value = energy * (small ? .58 : 1);
    beams.forEach(({ mesh, material }, i) => {
      mesh.position.x = -5.3 + i * 2.55 + p * 1.6;
      material.uniforms.alpha.value = energy * (small ? .4 : .7 + i * .08);
    });
    sweep.position.x = -3.2 + p * 6.4;
    sweep.position.y = 3.4 - p * 1.8;
    sweep.target.position.x = anchorX;
    sweep.target.updateMatrixWorld();
    sweep.intensity = 8 * Math.max(bell(p, .4, .16), bell(p, .7, .15) * .7);
    rim.intensity = 3.1 + energy * 1.7;
    glint.intensity = 4 + bell(p, .82, .2) * 2.5;
    air.position.x = -1.8 + p * 3.6;
    air.rotation.y = (p - .5) * .18;
    trails.forEach(({ material }, i) => {
      material.opacity = (small ? .1 : .19) * Math.max(
        bell(p, .25 + i * .012, .2), bell(p, .66 + i * .011, .19),
      );
    });
    ingredients.forEach(({ spec, material, sprite }) => {
      const amount = bell(p, spec.at, .18) * (small ? .28 : .78);
      const travel = (p - spec.at) / .18;
      material.opacity = amount;
      sprite.position.set(
        anchorX + spec.x + travel * (small ? .18 : .85),
        anchorY + spec.y + travel * .27,
        spec.z,
      );
      const size = spec.size * (small ? .5 : 1) * (.86 + amount * .22);
      sprite.scale.set(size, size, 1);
      material.rotation = travel * .055;
    });
    fleckMaterial.opacity = energy * (small ? .25 : .45);
    const attr = fleckGeometry.getAttribute('position');
    for (let i = 0; i < count; i += 1) {
      const j = i * 3;
      attr.array[j] = base[j] + p * (i % 2 ? 1.3 : -1.5) +
        (reducedMotion.matches ? 0 : Math.sin(seconds * .3 + i) * .035);
      attr.array[j + 1] = base[j + 1] + p * ((i % 4) - 1.5) * .35;
    }
    attr.needsUpdate = true;
    renderer.render(scene, camera);
  }

  function resize() {
    if (disposed) return;
    const width = Math.max(1, host.clientWidth), height = Math.max(1, host.clientHeight);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setPixelRatio(Math.min(devicePixelRatio || 1, mobile.matches ? 1.1 : 1.5));
    renderer.setSize(width, height, false);
    render();
  }
  function tick(now) {
    frame = 0;
    if (disposed || document.hidden || !visible || !ready) return;
    if (now - lastRender >= (mobile.matches ? 33 : 22)) { lastRender = now; render(); }
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (disposed || document.hidden || !visible || !ready || frame) return;
    frame = requestAnimationFrame(tick);
  }
  function pointerMove(event) {
    if (reducedMotion.matches) return;
    pointerX = (event.clientX / innerWidth - .5) * 2;
    pointerY = (event.clientY / innerHeight - .5) * 2;
  }
  const observer = new IntersectionObserver(([entry]) => {
    visible = entry.isIntersecting;
    if (visible) schedule();
    else if (frame) { cancelAnimationFrame(frame); frame = 0; }
  }, { rootMargin: '150px' });
  observer.observe(host);
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host);
  addEventListener('pointermove', pointerMove, { passive: true });
  const visibilityChange = () => { if (!document.hidden) schedule(); };
  document.addEventListener('visibilitychange', visibilityChange);
  bottle.ready.then((loaded) => {
    if (!loaded || disposed) return;
    ready = true;
    resize();
    requestAnimationFrame(() => {
      if (disposed) return;
      host.style.opacity = '1';
      stage?.classList.add('is-3d-ready');
      schedule();
    });
  });
  return {
    setProgress(value) {
      target = clamp(value);
      if (reducedMotion.matches) { current = target; render(); }
      else schedule();
    },
    destroy() {
      if (disposed) return;
      disposed = true;
      if (frame) cancelAnimationFrame(frame);
      observer.disconnect(); resizeObserver.disconnect();
      removeEventListener('pointermove', pointerMove);
      document.removeEventListener('visibilitychange', visibilityChange);
      bottle.dispose(); fog.geometry.dispose(); fog.material.dispose();
      beamGeometry.dispose(); beams.forEach(({ material }) => material.dispose());
      trails.forEach(({ geometry, material }) => { geometry.dispose(); material.dispose(); });
      ingredients.forEach(({ texture, material }) => { texture?.dispose(); material.dispose(); });
      fleckGeometry.dispose(); fleckMaterial.dispose();
      renderer.dispose(); canvas.remove();
    },
  };
}
