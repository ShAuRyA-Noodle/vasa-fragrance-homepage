import * as THREE from 'three';
import {
  BG_VERTEX,
  BG_FRAGMENT,
  TRAIL_VERTEX,
  TRAIL_FRAGMENT,
} from './shaders/background.js';

const TRAIL_SIZE = 128; // quarter-viewport-ish, cheap ping-pong feedback

const PASSTHROUGH_VERT = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
const PASSTHROUGH_FRAG = /* glsl */ `
  uniform sampler2D map;
  varying vec2 vUv;
  void main(){
    gl_FragColor = texture2D(map, vUv);
  }
`;

// The smoke/god-ray shader is expensive (fbm domain-warp) so it is rendered
// once per frame into a small offscreen target (half viewport res) and the
// visible backdrop just samples it — the GPU's bilinear upscale doubles as a
// soft, free blur on top of being far cheaper to shade.
export function createBackground(renderer) {
  const uniforms = {
    bgColor: { value: new THREE.Color('#0c0a09') },
    fogColor: { value: new THREE.Color('#1a1410') },
    lightColor: { value: new THREE.Color('#c8a86a') },
    smokeAmt: { value: 0.4 },
    shaftAmt: { value: 0.6 },
    warmth: { value: 0.5 },
    time: { value: 0 },
    resolution: { value: new THREE.Vector2(1, 1) },
    trail: { value: null },
    grainSeed: { value: 0 },
  };

  const smokeMaterial = new THREE.ShaderMaterial({
    vertexShader: BG_VERTEX,
    fragmentShader: BG_FRAGMENT,
    uniforms,
    depthTest: false,
    depthWrite: false,
  });

  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const smokeScene = new THREE.Scene();
  const smokeMesh = new THREE.Mesh(quadGeo, smokeMaterial);
  smokeScene.add(smokeMesh);

  let smokeRT = new THREE.WebGLRenderTarget(1, 1, {
    type: THREE.HalfFloatType,
    depthBuffer: false,
    stencilBuffer: false,
  });

  const passMaterial = new THREE.ShaderMaterial({
    vertexShader: PASSTHROUGH_VERT,
    fragmentShader: PASSTHROUGH_FRAG,
    uniforms: { map: { value: smokeRT.texture } },
    depthTest: false,
    depthWrite: false,
  });

  // Giant billboard plane kept flush with the camera frustum — acts as a
  // literal backdrop, cheaply sampling the pre-shaded smoke target.
  const geometry = new THREE.PlaneGeometry(1, 1);
  const mesh = new THREE.Mesh(geometry, passMaterial);
  mesh.renderOrder = -1000;
  mesh.frustumCulled = false;
  mesh.matrixAutoUpdate = false;
  const cameraDirection = new THREE.Vector3();

  // Ping-pong render targets for the cursor smoke-parting trail.
  const trailOpts = {
    type: THREE.HalfFloatType,
    format: THREE.RGBAFormat,
    depthBuffer: false,
    stencilBuffer: false,
  };
  let trailA = new THREE.WebGLRenderTarget(TRAIL_SIZE, TRAIL_SIZE, trailOpts);
  let trailB = new THREE.WebGLRenderTarget(TRAIL_SIZE, TRAIL_SIZE, trailOpts);
  const trailScene = new THREE.Scene();
  const trailCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const trailUniforms = {
    prevTrail: { value: trailA.texture },
    mouseUv: { value: new THREE.Vector2(-1, -1) },
    decay: { value: 0.94 },
    radius: { value: 0.16 },
    strength: { value: 0.5 },
  };
  const trailMaterial = new THREE.ShaderMaterial({
    vertexShader: TRAIL_VERTEX,
    fragmentShader: TRAIL_FRAGMENT,
    uniforms: trailUniforms,
    depthTest: false,
    depthWrite: false,
  });
  const trailMesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), trailMaterial);
  trailScene.add(trailMesh);

  uniforms.trail.value = trailA.texture;

  let mouseActive = false;
  let quality = 'high';
  let viewWidth = 1;
  let viewHeight = 1;
  let trailFramesRemaining = 0;

  function setMouseUv(u, v, active) {
    trailUniforms.mouseUv.value.set(u, v);
    mouseActive = active;
    if (active) trailFramesRemaining = 100;
  }

  function fitToCamera(camera, distance) {
    const vFov = (camera.fov * Math.PI) / 180;
    const height = 2 * Math.tan(vFov / 2) * distance;
    const width = height * camera.aspect;
    mesh.scale.set(width * 1.02, height * 1.02, 1);
    camera.getWorldDirection(cameraDirection);
    mesh.position.copy(camera.position).addScaledVector(cameraDirection, distance);
    mesh.quaternion.copy(camera.quaternion);
    mesh.updateMatrix();
  }

  function setSize(w, h) {
    viewWidth = w;
    viewHeight = h;
    uniforms.resolution.value.set(w, h);
    resizeSmokeTarget();
  }

  function resizeSmokeTarget() {
    const scale = quality === 'high' ? 0.5 : 0.35;
    const rw = Math.max(2, Math.round(viewWidth * scale));
    const rh = Math.max(2, Math.round(viewHeight * scale));
    smokeRT.setSize(rw, rh);
  }

  function setQuality(q) {
    quality = q;
    resizeSmokeTarget();
  }

  function update(dt, elapsed, rendererRef) {
    uniforms.time.value = elapsed;
    uniforms.grainSeed.value = Math.random() * 100;

    const prevTarget = rendererRef.getRenderTarget();
    // Once the existing trail has fully faded, retaining its last all-black
    // target is visually identical and avoids an otherwise permanent pass.
    if (mouseActive || trailFramesRemaining > 0) {
      trailUniforms.strength.value = mouseActive ? 0.55 : 0.0;
      trailMaterial.uniforms.prevTrail.value = trailA.texture;
      rendererRef.setRenderTarget(trailB);
      rendererRef.render(trailScene, trailCamera);
      [trailA, trailB] = [trailB, trailA];
      uniforms.trail.value = trailA.texture;
      if (!mouseActive) trailFramesRemaining--;
    }

    rendererRef.setRenderTarget(smokeRT);
    rendererRef.render(smokeScene, quadCam);
    passMaterial.uniforms.map.value = smokeRT.texture;

    rendererRef.setRenderTarget(prevTarget);
  }

  function setMood(m) {
    if (m.bg) uniforms.bgColor.value.set(m.bg);
    if (m.fog) uniforms.fogColor.value.set(m.fog);
    if (m.light) uniforms.lightColor.value.set(m.light);
    if (typeof m.smoke === 'number') uniforms.smokeAmt.value = m.smoke;
    if (typeof m.shaft === 'number') uniforms.shaftAmt.value = m.shaft;
    if (typeof m.warmth === 'number') uniforms.warmth.value = m.warmth;
  }

  function dispose() {
    geometry.dispose();
    quadGeo.dispose();
    smokeMaterial.dispose();
    passMaterial.dispose();
    trailMaterial.dispose();
    trailA.dispose();
    trailB.dispose();
    smokeRT.dispose();
  }

  return {
    mesh,
    uniforms,
    setMouseUv,
    fitToCamera,
    setSize,
    setQuality,
    update,
    setMood,
    dispose,
  };
}
