import * as THREE from 'three';
import { DUST_VERTEX, DUST_FRAGMENT } from './shaders/particles.js';

export function createDust(count = 700) {
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const sizes = new Float32Array(count);
  const phases = new Float32Array(count);
  const speeds = new Float32Array(count);
  const golds = new Float32Array(count);

  for (let i = 0; i < count; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 8;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 4 + 0.8;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 6 - 1;
    sizes[i] = 4 + Math.random() * 10;
    phases[i] = Math.random() * Math.PI * 2;
    speeds[i] = 0.15 + Math.random() * 0.5;
    golds[i] = Math.random() > 0.88 ? 1 : 0;
  }

  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new THREE.BufferAttribute(phases, 1));
  geometry.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
  geometry.setAttribute('aGold', new THREE.BufferAttribute(golds, 1));

  const uniforms = {
    time: { value: 0 },
    mouseWorld: { value: new THREE.Vector3(999, 999, 999) },
    mouseActive: { value: 0 },
    goldColor: { value: new THREE.Color('#ecd9a8') },
    mistColor: { value: new THREE.Color('#8a8f8c') },
  };

  const material = new THREE.ShaderMaterial({
    vertexShader: DUST_VERTEX,
    fragmentShader: DUST_FRAGMENT,
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });

  const points = new THREE.Points(geometry, material);
  points.frustumCulled = false;

  function update(dt, elapsed) {
    uniforms.time.value = elapsed;
  }

  function setMouseWorld(v, active) {
    uniforms.mouseWorld.value.copy(v);
    uniforms.mouseActive.value = active ? 1 : 0;
  }

  function setCount(activeCount) {
    geometry.setDrawRange(0, activeCount);
  }

  function dispose() {
    geometry.dispose();
    material.dispose();
  }

  return { points, update, setMouseWorld, setCount, dispose, maxCount: count };
}
