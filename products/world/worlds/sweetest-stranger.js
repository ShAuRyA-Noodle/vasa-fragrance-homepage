// Sweetest Stranger: a rose-gold room caught in a soft, scented updraft.
// The petal field is instanced and every movement is evaluated in the vertex shader.

const clamp = (value, min = 0, max = 1) => Math.max(min, Math.min(max, value));

const hex = (THREE, value) => new THREE.Color(value);

function makePetals(THREE, cfg) {
  const count = Math.min(cfg.petalCount || 380, 480);
  const geometry = new THREE.PlaneGeometry(.22, .3, 1, 1);
  const seeds = new Float32Array(count * 4);
  const scales = new Float32Array(count);
  const mesh = new THREE.InstancedMesh(geometry, new THREE.ShaderMaterial({
    uniforms: {
      uTime: {value: 0}, uEntrance: {value: 0}, uOpacity: {value: .8},
      uBlush: {value: hex(THREE, '#f7c9c1')}, uCream: {value: hex(THREE, '#ffe8dc')},
      uSugar: {value: hex(THREE, '#c58c79')}, uStage: {value: 0},
    },
    transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide,
    vertexShader: /* glsl */`
      uniform float uTime;
      uniform float uEntrance;
      attribute vec4 aSeed;
      attribute float aScale;
      varying vec2 vUv;
      varying float vTint;
      varying float vFade;
      void main() {
        vUv = uv;
        float id = aSeed.w;
        float drift = uTime * (.16 + aSeed.z * .16) + id * 6.2831;
        vec3 p = vec3(aSeed.xy * vec2(8.5, 5.7), -2.8 - aSeed.z * 4.4);
        p.y += sin(drift * 1.7) * .5 + mod(uTime * (.21 + aSeed.z * .18) + id * 3.0, 9.5) - 4.75;
        p.x += sin(drift * .73) * .65;
        float launch = smoothstep(.015, .28, uEntrance) * (1.0 - smoothstep(.42, 1.0, uEntrance));
        vec2 radial = normalize(aSeed.xy + vec2(.001)) * (1.8 + aSeed.z * 4.1);
        p.xy += radial * launch;
        float angle = drift * (1.2 + aSeed.z) + aSeed.x * 4.0;
        mat2 rot = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
        vec3 local = vec3(rot * position.xy * aScale, 0.0);
        vTint = fract(id * 11.71);
        vFade = smoothstep(-5.0, -3.7, p.y) * smoothstep(5.1, 3.5, p.y);
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p + local, 1.0);
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uBlush; uniform vec3 uCream; uniform vec3 uSugar;
      uniform float uStage; uniform float uOpacity;
      varying vec2 vUv; varying float vTint; varying float vFade;
      void main() {
        vec2 q = vUv - .5;
        float petal = 1.0 - smoothstep(.33, .52, length(vec2(q.x * .82, q.y * 1.25)));
        petal *= smoothstep(-.48, -.12, q.y) + smoothstep(.48, .03, q.y) * .22;
        vec3 flower = mix(uBlush, uCream, smoothstep(.28, .78, vTint));
        vec3 tint = mix(flower, uSugar, smoothstep(1.4, 2.25, uStage));
        gl_FragColor = vec4(tint, petal * vFade * uOpacity * (.5 + vTint * .45));
      }
    `,
  }), count);

  const dummy = new THREE.Object3D();
  for (let index = 0; index < count; index += 1) {
    const offset = index * 4;
    // A biased field concentrates the lift around the bottle, then opens into the room.
    const radius = Math.pow(Math.random(), .62);
    const angle = Math.random() * Math.PI * 2;
    seeds.set([Math.cos(angle) * radius, Math.sin(angle) * radius, Math.random(), Math.random()], offset);
    scales[index] = .55 + Math.random() * 1.35;
    dummy.position.set(0, 0, 0); dummy.rotation.set(0, 0, 0); dummy.scale.setScalar(1); dummy.updateMatrix();
    mesh.setMatrixAt(index, dummy.matrix);
  }
  geometry.setAttribute('aSeed', new THREE.InstancedBufferAttribute(seeds, 4));
  geometry.setAttribute('aScale', new THREE.InstancedBufferAttribute(scales, 1));
  mesh.instanceMatrix.needsUpdate = true;
  mesh.frustumCulled = false;
  return {mesh, uniforms: mesh.material.uniforms};
}

function makeDust(THREE, cfg) {
  const count = Math.min(cfg.dustCount || 260, 360);
  const geometry = new THREE.BufferGeometry();
  const positions = new Float32Array(count * 3);
  const seed = new Float32Array(count * 3);
  for (let index = 0; index < count; index += 1) {
    const i = index * 3;
    positions[i] = (Math.random() - .5) * 10;
    positions[i + 1] = (Math.random() - .5) * 7;
    positions[i + 2] = -1 - Math.random() * 6;
    seed[i] = Math.random(); seed[i + 1] = Math.random(); seed[i + 2] = Math.random();
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3));
  const uniforms = {uTime: {value: 0}, uOpacity: {value: .48}, uTint: {value: hex(THREE, cfg.accent || '#f5c6bd')}};
  const dust = new THREE.Points(geometry, new THREE.ShaderMaterial({
    uniforms, transparent: true, depthWrite: false, depthTest: false,
    vertexShader: /* glsl */`
      uniform float uTime; attribute vec3 aSeed; varying float vAlpha;
      void main() {
        vec3 p = position;
        p.y += mod(uTime * (.12 + aSeed.x * .18) + aSeed.y * 8.0, 8.0) - 4.0;
        p.x += sin(uTime * .3 + aSeed.z * 20.0) * .24;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = (1.2 + aSeed.x * 2.4) * (20.0 / -mv.z);
        gl_Position = projectionMatrix * mv;
        vAlpha = smoothstep(-4.2, -2.8, p.y) * smoothstep(4.0, 2.7, p.y);
      }
    `,
    fragmentShader: /* glsl */`
      uniform vec3 uTint; uniform float uOpacity; varying float vAlpha;
      void main() { float d = length(gl_PointCoord - .5); gl_FragColor = vec4(uTint, smoothstep(.5, .04, d) * vAlpha * uOpacity); }
    `,
  }));
  dust.frustumCulled = false;
  return {dust, uniforms};
}

function makeShafts(THREE) {
  const group = new THREE.Group();
  const material = new THREE.ShaderMaterial({
    uniforms: {uTime: {value: 0}, uOpacity: {value: .18}, uTint: {value: hex(THREE, '#ffd9c9')}},
    transparent: true, depthWrite: false, depthTest: false, side: THREE.DoubleSide,
    vertexShader: /* glsl */`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
    fragmentShader: /* glsl */`
      uniform float uTime; uniform float uOpacity; uniform vec3 uTint; varying vec2 vUv;
      void main(){float edge=smoothstep(.0,.38,vUv.x)*smoothstep(1.,.62,vUv.x);float fall=(1.-vUv.y)*(.75+.25*sin(uTime*.18));gl_FragColor=vec4(uTint,edge*fall*uOpacity);}
    `,
  });
  [-2.7, .2, 2.55].forEach((x, index) => {
    const shaft = new THREE.Mesh(new THREE.PlaneGeometry(2.25 - index * .18, 8.5), material);
    shaft.position.set(x, 1.05, -6.6 + index * .15); shaft.rotation.z = index === 0 ? -.18 : index === 1 ? .1 : .22;
    group.add(shaft);
  });
  return {group, uniforms: material.uniforms};
}

/** @param {{THREE: typeof import('three'), scene: import('three').Scene, camera: import('three').Camera, renderer: import('three').WebGLRenderer, cfg: object, bottle: import('three').Object3D, reduced: boolean}} args */
export function createAtmosphere({THREE, scene, camera, renderer, cfg = {}, bottle, reduced = false}) {
  const group = new THREE.Group(); group.name = 'sweetest-stranger-atmosphere'; scene.add(group);
  const shafts = makeShafts(THREE); group.add(shafts.group);
  const petals = reduced ? null : makePetals(THREE, cfg);
  const dust = reduced ? null : makeDust(THREE, cfg);
  if (petals) group.add(petals.mesh);
  if (dust) group.add(dust.dust);

  const bloom = new THREE.PointLight('#ffd9ca', 5.5, 11, 2); bloom.position.set(-1.55, 1.5, 2.6); group.add(bloom);
  const sugarLight = new THREE.PointLight('#ba715c', 1.8, 8, 2); sugarLight.position.set(2.2, -1.4, 1.4); group.add(sugarLight);
  const stages = ['#f5c6bd', '#fff0dd', '#b77761'];
  let stage = 0, stageProgress = 0, entranceValue = 0, disposed = false;

  const setStage = () => {
    const tone = hex(THREE, stages[stage]);
    bloom.color.lerp(tone, .18 + stageProgress * .42);
    sugarLight.intensity = 1.7 + stage * .72 + stageProgress * .35;
    if (petals) petals.uniforms.uStage.value = stage + stageProgress;
    shafts.uniforms.uTint.value.lerp(tone, .14 + stageProgress * .34);
  };

  return {
    update(dt, t, signals = {}) {
      if (disposed) return;
      const time = Number.isFinite(t) ? t : 0;
      shafts.uniforms.uTime.value = time;
      shafts.group.rotation.y = signals.pointerX * .025;
      shafts.group.position.y = signals.pointerY * -.06;
      if (petals) {
        petals.uniforms.uTime.value = time;
        petals.uniforms.uEntrance.value = entranceValue;
        petals.uniforms.uOpacity.value = .72 + Math.min(1, signals.scroll || 0) * .12;
      }
      if (dust) dust.uniforms.uTime.value = time;
      bloom.intensity = 5.2 + Math.sin(time * .55) * .28 + entranceValue * 4.4;
      // No particle mutation here: uniform updates leave all individual motion on the GPU.
      void dt; void camera; void renderer; void bottle;
    },
    entrance(progress = 1) {
      entranceValue = reduced ? 0 : clamp(progress);
      if (petals) petals.mesh.visible = entranceValue < .98 || entranceValue > .01;
    },
    stage(index = 0, progress = 1) {
      stage = clamp(Math.round(index), 0, 2); stageProgress = clamp(progress); setStage();
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
