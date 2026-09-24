// Silent Storm: a restrained, distant weather system.
// All rain and cloud motion happens in shaders; update only advances uniforms.

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const mix = (a, b, t) => a + (b - a) * t;

const VERTEX = /* glsl */`
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

function color(THREE, hex) {
  return new THREE.Color(hex);
}

function makeRain(THREE, cfg) {
  // Instanced ribbons, rather than LineSegments. Lines can be incorrectly joined by
  // particular WebGL drivers after a modulo wrap, creating a crosshatch across the view.
  const drops = Math.min(cfg.rainCount || 130, 180);
  const anchors = new Float32Array(drops * 3);
  const speed = new Float32Array(drops);
  const length = new Float32Array(drops);

  for (let i = 0; i < drops; i += 1) {
    const x = (Math.random() - .5) * 20;
    const y = Math.random() * 14 - 7;
    const z = -8 + Math.random() * 4.8;
    const dropLength = .09 + Math.random() * .13;
    anchors.set([x, y, z], i * 3);
    speed[i] = 5.8 + Math.random() * 4.4;
    length[i] = dropLength;
  }

  const geometry = new THREE.PlaneGeometry(1, 1);
  geometry.setAttribute('aAnchor', new THREE.InstancedBufferAttribute(anchors, 3));
  geometry.setAttribute('aSpeed', new THREE.InstancedBufferAttribute(speed, 1));
  geometry.setAttribute('aLength', new THREE.InstancedBufferAttribute(length, 1));
  geometry.instanceCount = drops;
  const uniforms = {
    uTime: {value: 0},
    uOpacity: {value: 1},
    uTint: {value: color(THREE, cfg.accent || '#bcd9e4')},
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: true,
    vertexShader: /* glsl */`
      uniform float uTime;
      attribute vec3 aAnchor;
      attribute float aSpeed;
      attribute float aLength;
      varying float vAlpha;
      void main() {
        vec3 p = aAnchor;
        float fall = uTime * aSpeed;
        p.y = mod(p.y - fall + 7.0, 14.0) - 7.0;
        p.x = mod(p.x - fall * .045 + 10.0, 20.0) - 10.0;
        // Local quad coordinates yield a hairline ribbon, never a connected line primitive.
        vec2 axis = normalize(vec2(-.16, -1.0));
        vec2 normal = vec2(-axis.y, axis.x);
        p.xy += axis * position.y * aLength + normal * position.x * .005;
        vAlpha = smoothstep(-8.0, -3.0, p.z) * (.085 + .035 * sin(aSpeed));
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uTint;
      uniform float uOpacity;
      varying float vAlpha;
      void main() { gl_FragColor = vec4(uTint, vAlpha * uOpacity); }
    `,
  });
  const rain = new THREE.Mesh(geometry, material);
  rain.frustumCulled = false;
  return {rain, uniforms};
}

function makeClouds(THREE) {
  const uniforms = {
    uTime: {value: 0},
    uOpacity: {value: .46},
    uTint: {value: color(THREE, '#7896a6')},
  };
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    depthTest: false,
    vertexShader: VERTEX,
    fragmentShader: /* glsl */`
      uniform float uTime;
      uniform float uOpacity;
      uniform vec3 uTint;
      varying vec2 vUv;
      float noise(vec2 p) {
        return sin(p.x) * sin(p.y) * .5 + .5;
      }
      void main() {
        vec2 uv = vUv;
        uv.x += uTime * .006;
        float layers = noise(uv * 3.0) * .55 + noise(uv * 7.0 + 2.1) * .25;
        float bank = smoothstep(.08, .68, layers) * smoothstep(.98, .32, vUv.y);
        float fade = smoothstep(0.0, .18, vUv.x) * smoothstep(1.0, .78, vUv.x);
        gl_FragColor = vec4(uTint, bank * fade * uOpacity);
      }
    `,
  });
  const cloud = new THREE.Mesh(new THREE.PlaneGeometry(19, 6), material);
  cloud.position.set(0, 2.35, -5.8);
  return {cloud, uniforms};
}

function makeLightning(THREE) {
  const uniforms = {
    uFlash: {value: 0},
    uTint: {value: color(THREE, '#eaf6ff')},
  };
  // Lightning remains a distant sheet flash. A literal line competes with the bottle silhouette.
  const bolt = new THREE.Group();
  bolt.visible = false;
  return {bolt, uniforms};
}

/**
 * @param {{THREE: typeof import('three'), scene: import('three').Scene, camera: import('three').Camera, renderer: import('three').WebGLRenderer, cfg: object, bottle: import('three').Object3D, reduced: boolean}} args
 */
export function createAtmosphere({THREE, scene, camera, renderer, cfg = {}, bottle, reduced = false}) {
  const group = new THREE.Group();
  group.name = 'silent-storm-atmosphere';
  scene.add(group);

  const stagePalette = ['#1b2a33', '#31485a', '#101d26'];
  const rain = reduced ? null : makeRain(THREE, cfg);
  const clouds = makeClouds(THREE);
  const lightning = makeLightning(THREE);
  group.add(clouds.cloud, lightning.bolt);
  if (rain) group.add(rain.rain);

  const stormLight = new THREE.PointLight('#d9f0ff', 0, 13, 2);
  stormLight.position.set(.5, 2.4, 2.5);
  group.add(stormLight);

  let stage = 0;
  let time = 0;
  let entranceAmount = 0;
  let distantFlash = 0;
  let nextFlash = 13;
  let disposed = false;
  const backdropUniforms = cfg.backdropUniforms || cfg.uniforms || null;

  const applyPalette = (progress = 1) => {
    const target = color(THREE, stagePalette[stage]);
    const sky = clouds.uniforms.uTint.value;
    sky.lerp(target.clone().lerp(color(THREE, '#a7c6d5'), .38), clamp(progress));
    if (backdropUniforms?.uTop?.value) backdropUniforms.uTop.value.lerp(target, clamp(progress));
  };

  const flash = amount => {
    const intensity = clamp(amount, 0, 1);
    lightning.uniforms.uFlash.value = intensity * .9;
    stormLight.intensity = intensity * 17;
    if (backdropUniforms?.uFlash) backdropUniforms.uFlash.value = intensity;
    if (bottle?.userData?.stormFlash) bottle.userData.stormFlash(intensity);
  };

  return {
    update(dt, t, signals = {}) {
      if (disposed) return;
      const step = Math.min(dt || 0, .05);
      time = Number.isFinite(t) ? t : time + step;
      clouds.uniforms.uTime.value = time;
      clouds.uniforms.uOpacity.value = reduced ? .34 : .44 + Math.sin(time * .11) * .04;
      if (rain) rain.uniforms.uTime.value = time;

      // One planned entrance strike, followed by very infrequent sheet lightning.
      if (entranceAmount > 0) entranceAmount = Math.max(0, entranceAmount - step * 2.75);
      nextFlash -= step;
      if (!reduced && entranceAmount <= 0 && nextFlash <= 0) {
        distantFlash = .32;
        nextFlash = 12 + Math.random() * 15;
      }
      distantFlash = Math.max(0, distantFlash - step * 3.8);
      flash(Math.max(entranceAmount, distantFlash));
      applyPalette(signals.stageProgress ?? .045);
      // Retain the supplied values for engine telemetry without driving CPU particles.
      void camera; void renderer; void signals;
    },

    entrance(progress = 1) {
      if (reduced) return;
      // Engine may scrub this value. The sharp double pulse feels like one natural strike.
      const p = clamp(progress);
      entranceAmount = Math.max(entranceAmount, p > .02 && p < .66 ? 1 : p > .7 && p < .86 ? .48 : 0);
      lightning.bolt.visible = false;
    },

    stage(index = 0, progress = 1) {
      stage = clamp(Math.round(index), 0, 2);
      applyPalette(progress);
      if (rain) rain.uniforms.uOpacity.value = mix(.72, 1, stage / 2);
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
