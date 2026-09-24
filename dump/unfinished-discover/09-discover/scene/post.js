import * as THREE from 'three';
import { FINAL_VERTEX, FINAL_FRAGMENT, BRIGHT_FRAGMENT } from './shaders/post.js';

// No EffectComposer / UnrealBloomPass — those cost several full-screen blur
// passes per frame. Instead: one scene render to an RT, one quarter-res
// bright-pass extraction (its own bilinear upscale IS the glow blur), and one
// final fullscreen composite (grain + vignette + CA + glow) straight to the
// screen. Three draw calls total, no ping-pong blur chain.
export function createPost(renderer, scene, camera, width, height) {
  const quadCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quadGeo = new THREE.PlaneGeometry(2, 2);
  const quadScene = new THREE.Scene();
  const quadMesh = new THREE.Mesh(quadGeo, null);
  quadScene.add(quadMesh);

  let sceneRT = new THREE.WebGLRenderTarget(width, height, { type: THREE.HalfFloatType });
  let glowRT = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType });

  const brightUniforms = { tDiffuse: { value: null }, threshold: { value: 0.96 } };
  const brightMaterial = new THREE.ShaderMaterial({
    vertexShader: FINAL_VERTEX,
    fragmentShader: BRIGHT_FRAGMENT,
    uniforms: brightUniforms,
    depthTest: false,
    depthWrite: false,
  });

  const finalUniforms = {
    tDiffuse: { value: null },
    tGlow: { value: null },
    glowAmt: { value: 0.32 },
    time: { value: 0 },
    grainAmt: { value: 0.035 },
    vignetteAmt: { value: 0.45 },
    caAmt: { value: 0.0022 },
    warmLift: { value: new THREE.Color('#c8a86a') },
  };
  const finalMaterial = new THREE.ShaderMaterial({
    vertexShader: FINAL_VERTEX,
    fragmentShader: FINAL_FRAGMENT,
    uniforms: finalUniforms,
    depthTest: false,
    depthWrite: false,
  });

  let quality = 'high';
  let viewWidth = width;
  let viewHeight = height;

  function setQuality(q) {
    quality = q;
    finalUniforms.caAmt.value = q === 'high' ? 0.0022 : 0.0;
    finalUniforms.grainAmt.value = q === 'high' ? 0.035 : 0.02;
    finalUniforms.glowAmt.value = q === 'high' ? 0.32 : 0;
    resizeTargets();
  }

  function setSize(w, h) {
    viewWidth = w;
    viewHeight = h;
    resizeTargets();
  }

  function resizeTargets() {
    const sceneScale = quality === 'high' ? 1 : 0.7;
    const sceneWidth = Math.max(2, Math.round(viewWidth * sceneScale));
    const sceneHeight = Math.max(2, Math.round(viewHeight * sceneScale));
    sceneRT.setSize(sceneWidth, sceneHeight);
    const gw = Math.max(2, Math.round(sceneWidth * 0.25));
    const gh = Math.max(2, Math.round(sceneHeight * 0.25));
    glowRT.setSize(gw, gh);
  }
  setSize(width, height);

  function update(dt, elapsed) {
    finalUniforms.time.value = elapsed;
  }

  function render() {
    const prevTarget = renderer.getRenderTarget();

    // 1. scene -> RT
    renderer.setRenderTarget(sceneRT);
    renderer.render(scene, camera);

    // 2. bright-pass -> small glow RT (quality gate: skip on low)
    if (quality === 'high') {
      brightUniforms.tDiffuse.value = sceneRT.texture;
      quadMesh.material = brightMaterial;
      renderer.setRenderTarget(glowRT);
      renderer.render(quadScene, quadCam);
      finalUniforms.tGlow.value = glowRT.texture;
    } else {
      finalUniforms.tGlow.value = sceneRT.texture; // reused harmlessly, glowAmt is 0-weighted low-quality path below
    }

    // 3. final composite -> screen
    finalUniforms.tDiffuse.value = sceneRT.texture;
    quadMesh.material = finalMaterial;
    renderer.setRenderTarget(prevTarget);
    renderer.render(quadScene, quadCam);
  }

  function dispose() {
    quadGeo.dispose();
    brightMaterial.dispose();
    finalMaterial.dispose();
    sceneRT.dispose();
    glowRT.dispose();
  }

  return { setQuality, setSize, update, render, dispose, getQuality: () => quality };
}
