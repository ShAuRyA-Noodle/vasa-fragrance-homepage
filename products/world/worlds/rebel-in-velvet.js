// Rebel in Velvet: a close, tactile field of aubergine velvet.
// The cloth and its floating fibres animate entirely in their shaders. The
// render loop only advances uniforms, keeping the atmosphere inexpensive.

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const ease = value => value * value * (3 - 2 * value);

function makeCloth(THREE, reduced) {
  const uniforms = {
    uTime: {value: 0},
    uSweep: {value: 0},
    uStage: {value: 0},
    uTop: {value: new THREE.Color('#32152d')},
    uBottom: {value: new THREE.Color('#120711')},
    uSheen: {value: new THREE.Color('#e0b9d2')},
  };
  const geometry = new THREE.PlaneGeometry(20, 12, reduced ? 28 : 78, reduced ? 20 : 46);
  const material = new THREE.ShaderMaterial({
    uniforms,
    depthWrite: false,
    vertexShader: /* glsl */`
      uniform float uTime;
      uniform float uSweep;
      varying vec2 vUv;
      varying float vFold;
      void main() {
        vUv = uv;
        vec3 p = position;
        float stillFold = sin(p.x * 1.22 + p.y * .24) * .30;
        float crossFold = sin(p.x * 2.15 - p.y * .62 + 1.8) * .12;
        float drift = sin(p.x * .57 + p.y * .35 + uTime * .34) * .075;
        float travel = smoothstep(-.15, .95, uSweep) * (1.0 - smoothstep(.72, 1.0, uSweep));
        float wave = sin(p.y * 1.08 - uSweep * 8.0 + p.x * .34) * travel * .42;
        p.z += stillFold + crossFold + drift + wave;
        p.x += travel * (.35 + .26 * sin(p.y * .8));
        vFold = stillFold + crossFold + wave;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uTop;
      uniform vec3 uBottom;
      uniform vec3 uSheen;
      uniform float uStage;
      varying vec2 vUv;
      varying float vFold;
      void main() {
        float ridge = pow(clamp(.5 + vFold * 1.22, 0.0, 1.0), 3.0);
        float grain = sin((vUv.x * 130.0 + vUv.y * 18.0) + vFold * 17.0) * .018;
        float edge = smoothstep(.0, .11, vUv.y) * smoothstep(1.0, .79, vUv.y);
        vec3 base = mix(uBottom, uTop, vUv.y * .68 + .18 + grain);
        vec3 velvet = base + uSheen * ridge * (.23 + uStage * .12);
        gl_FragColor = vec4(velvet, edge * .96);
      }
    `,
    transparent: true,
    side: THREE.DoubleSide,
  });
  const cloth = new THREE.Mesh(geometry, material);
  cloth.position.set(-.15, .0, -5.9);
  cloth.rotation.set(-.06, .0, -.045);
  cloth.frustumCulled = false;
  return {cloth, uniforms};
}

function makeFibres(THREE, count = 560) {
  const positions = new Float32Array(count * 3);
  const seeds = new Float32Array(count);
  const sizes = new Float32Array(count);
  for (let index = 0; index < count; index += 1) {
    const offset = index * 3;
    positions[offset] = (Math.random() - .5) * 13;
    positions[offset + 1] = (Math.random() - .5) * 8;
    positions[offset + 2] = -3.8 - Math.random() * 3.6;
    seeds[index] = Math.random();
    sizes[index] = 1.2 + Math.random() * 2.8;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seeds, 1));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  const uniforms = {
    uTime: {value: 0},
    uOpacity: {value: .42},
    uTint: {value: new THREE.Color('#f0c7e3')},
    uPointer: {value: new THREE.Vector2()},
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */`
      uniform float uTime;
      uniform vec2 uPointer;
      attribute float aSeed;
      attribute float aSize;
      varying float vAlpha;
      void main() {
        vec3 p = position;
        float phase = aSeed * 6.28318;
        p.x += sin(uTime * (.22 + aSeed * .25) + phase) * (.12 + aSeed * .14) + uPointer.x * .12;
        p.y += cos(uTime * (.31 + aSeed * .16) + phase) * (.16 + aSeed * .1) - uPointer.y * .08;
        p.z += sin(uTime * .17 + phase) * .12;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = aSize * (19.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
        vAlpha = .18 + aSeed * .62;
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uTint;
      uniform float uOpacity;
      varying float vAlpha;
      void main() {
        vec2 p = gl_PointCoord - .5;
        float soft = 1.0 - smoothstep(.06, .5, length(p));
        gl_FragColor = vec4(uTint, soft * vAlpha * uOpacity);
      }
    `,
  });
  const fibres = new THREE.Points(geometry, material);
  fibres.frustumCulled = false;
  return {fibres, uniforms};
}

/**
 * A deliberately calm atmosphere for Rebel in Velvet.
 * @param {{THREE: typeof import('three'), scene: import('three').Scene, camera: import('three').Camera, renderer: import('three').WebGLRenderer, cfg: object, bottle: import('three').Object3D, reduced: boolean}} args
 */
export function createAtmosphere({THREE, scene, camera, renderer, cfg = {}, bottle, reduced = false}) {
  const group = new THREE.Group();
  group.name = 'rebel-in-velvet-atmosphere';
  scene.add(group);

  const cloth = makeCloth(THREE, reduced);
  const fibres = reduced ? null : makeFibres(THREE, Math.min(cfg.fibreCount || 560, 720));
  group.add(cloth.cloth);
  if (fibres) group.add(fibres.fibres);

  const glow = new THREE.PointLight('#d9b3cf', 3.4, 9, 2);
  glow.position.set(-2.5, 1.8, .8);
  group.add(glow);

  // Almond warms the nap, tuberose turns it floral, tonka settles it into ink.
  const palettes = [
    {top: '#48233d', bottom: '#160a16', sheen: '#e2c0ac', fibre: '#f1d5c7'},
    {top: '#3d1837', bottom: '#120611', sheen: '#ebbadc', fibre: '#f0c8e3'},
    {top: '#271027', bottom: '#0b050a', sheen: '#c696ab', fibre: '#dbc2cf'},
  ];
  const current = {top: new THREE.Color('#32152d'), bottom: new THREE.Color('#120711'), sheen: new THREE.Color('#e0b9d2'), fibre: new THREE.Color('#f0c7e3')};
  let stageIndex = 0;
  let stageAmount = 1;
  let sweep = 0;
  let time = 0;
  let disposed = false;

  const setPalette = (index, progress) => {
    const target = palettes[clamp(Math.round(index), 0, palettes.length - 1)];
    const amount = ease(clamp(progress));
    current.top.lerp(new THREE.Color(target.top), amount);
    current.bottom.lerp(new THREE.Color(target.bottom), amount);
    current.sheen.lerp(new THREE.Color(target.sheen), amount);
    current.fibre.lerp(new THREE.Color(target.fibre), amount);
    cloth.uniforms.uTop.value.copy(current.top);
    cloth.uniforms.uBottom.value.copy(current.bottom);
    cloth.uniforms.uSheen.value.copy(current.sheen);
    cloth.uniforms.uStage.value = index / 2;
    if (fibres) fibres.uniforms.uTint.value.copy(current.fibre);
    glow.color.copy(current.sheen);
  };

  return {
    update(dt, t, signals = {}) {
      if (disposed) return;
      const step = Math.min(.05, Math.max(0, dt || 0));
      time = Number.isFinite(t) ? t : time + step;
      // The entrance is a single sweep. Afterwards only the cloth's quiet drift remains.
      sweep += (1 - sweep) * Math.min(1, step * 2.35);
      cloth.uniforms.uTime.value = time;
      cloth.uniforms.uSweep.value = sweep;
      setPalette(stageIndex, stageAmount);
      if (fibres) {
        fibres.uniforms.uTime.value = time;
        fibres.uniforms.uPointer.value.set(signals.pointerX || 0, signals.pointerY || 0);
        fibres.uniforms.uOpacity.value = .34 + Math.min(1, Math.max(0, signals.scroll || 0)) * .15;
      }
      glow.intensity = 2.6 + Math.sin(time * .45) * .25;
      void camera; void renderer; void bottle;
    },

    entrance(progress = 1) {
      if (reduced) return;
      // Starts with cloth covering the lens, then lets it sweep laterally away.
      sweep = Math.max(sweep, clamp(progress));
      group.position.x = (1 - clamp(progress)) * -2.1;
    },

    stage(index = 0, progress = 1) {
      stageIndex = clamp(Math.round(index), 0, 2);
      stageAmount = clamp(progress);
      setPalette(stageIndex, stageAmount);
    },

    dispose() {
      disposed = true;
      group.traverse(object => {
        object.geometry?.dispose?.();
        const materials = Array.isArray(object.material) ? object.material : [object.material];
        materials.filter(Boolean).forEach(material => material.dispose?.());
      });
      scene.remove(group);
    },
  };
}

export default createAtmosphere;
