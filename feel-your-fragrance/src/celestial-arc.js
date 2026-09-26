import * as THREE from 'three';

const DEPTH = 26;
const arc = x => .075 + .83 * Math.pow(Math.sin(Math.PI * x), .88);

export function createCelestialArc(camera) {
  let seed = 94621;
  const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296);
  const gaussian = () => Math.sqrt(-2 * Math.log(Math.max(random(), .00001))) * Math.cos(2 * Math.PI * random());
  const positions = [], sizes = [], phases = [], colors = [], alphas = [], progress = [], flows = [], offsets = [];
  const add = (x, y, size, alpha, color, flow = 0) => {
    positions.push((x - .5) * 2, (y - .5) * 2, -DEPTH);
    sizes.push(size); phases.push(random() * 6.283185); colors.push(...color); alphas.push(alpha); progress.push(x); flows.push(flow); offsets.push(y - arc(x));
  };
  const gold = [.96, .82, .60], blue = [.68, .82, 1], rose = [1, .76, .83];
  const bands = [
    {offset: 0, spread: .029, count: 510, alpha: .64},
    {offset: -.07, spread: .046, count: 370, alpha: .43},
    {offset: .075, spread: .044, count: 320, alpha: .38},
    {offset: -.145, spread: .08, count: 180, alpha: .19},
  ];
  for (const [bandIndex, band] of bands.entries()) {
    for (let i = 0; i < band.count; i++) {
      const x = .015 + random() * .97;
      const y = arc(x) + band.offset + gaussian() * band.spread;
      if (y < -.03 || y > 1.03) continue;
      const shoulder = Math.min(1, Math.abs(x - .5) * 3.2);
      const quietCenter = .25 + .75 * shoulder;
      const color = x < .35 ? gold : x < .67 ? blue : rose;
      const size = random() < .045 ? 7 + random() * 7 : 1.4 + Math.pow(random(), 3) * 4.4;
      add(x, y, size, band.alpha * quietCenter * (.65 + random() * .5), color);
    }
  }
  for (let i = 0; i < 190; i++) {
    const x = random(), y = random();
    const distance = Math.abs(y - arc(x));
    if (distance < .14) continue;
    add(x, y, .9 + random() * 2, .1 + random() * .19, x < .5 ? gold : blue);
  }
  for (let i = 0; i < 110; i++) {
    const x = random();
    add(x, arc(x) + gaussian() * .055, 2.1 + random() * 3.4, .28 + random() * .32,
      x < .35 ? gold : x < .67 ? blue : rose, 1);
  }
  // Tiny linked groups suggest constellations without drawing large polygons.
  const links = [];
  for (const side of [0, 1]) {
    for (let cluster = 0; cluster < 7; cluster++) {
      const baseX = side ? .72 + cluster * .034 : .05 + cluster * .034;
      const baseY = arc(baseX);
      const a = [baseX, baseY], b = [baseX + .013, baseY + .018], c = [baseX + .027, baseY + .003];
      for (const [start, end] of [[a, b], [b, c]])
        links.push((start[0] - .5) * 2, (start[1] - .5) * 2, -DEPTH + .01,
          (end[0] - .5) * 2, (end[1] - .5) * 2, -DEPTH + .01);
      add(a[0], a[1], 7.5, .85, side ? rose : gold);
      add(b[0], b[1], 6.5, .75, blue);
      add(c[0], c[1], 6.5, .7, side ? gold : blue);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('aSize', new THREE.Float32BufferAttribute(sizes, 1));
  geometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));
  geometry.setAttribute('aColor', new THREE.Float32BufferAttribute(colors, 3));
  geometry.setAttribute('aAlpha', new THREE.Float32BufferAttribute(alphas, 1));
  geometry.setAttribute('aProgress', new THREE.Float32BufferAttribute(progress, 1));
  geometry.setAttribute('aFlow', new THREE.Float32BufferAttribute(flows, 1));
  geometry.setAttribute('aOffset', new THREE.Float32BufferAttribute(offsets, 1));
  // Per-fragrance sky: tintMix 0 keeps the rainbow arc, 1 washes it in `tint`.
  const tint = {value: new THREE.Color('#ffffff')}, tintMix = {value: 0}, fade = {value: 1};
  const material = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {time: {value: 0}, pixelScale: {value: 1}, tint, tintMix, fade},
    vertexShader: `
      attribute float aSize, aPhase, aAlpha, aProgress, aFlow, aOffset;
      attribute vec3 aColor;
      uniform float time, pixelScale, tintMix, fade;
      uniform vec3 tint;
      varying vec3 vColor;
      varying float vAlpha, vHero;
      void main(){
        vec3 p=position;
        if(aFlow>.5){
          float x=fract(aProgress+time*(.013+.01*fract(aPhase)));
          float y=.075+.83*pow(max(sin(3.14159265*x),0.),.88)+aOffset;
          p.xy=vec2((x-.5)*2.,(y-.5)*2.);
        }
        p.xy+=vec2(sin(time*.37+aPhase),cos(time*.31+aPhase))*.0018;
        gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);
        float twinkle=.72+.28*sin(time*(.8+fract(aPhase)*.7)+aPhase);
        float sweep=pow(max(sin(time*1.13-aProgress*16.),0.),19.);
        vAlpha=aAlpha*(twinkle+sweep*.7)*fade;
        vColor=mix(aColor,tint*(.85+.3*fract(aPhase)),tintMix);
        vHero=step(6.,aSize);
        gl_PointSize=aSize*(1.+sweep*.65)*pixelScale;
      }`,
    fragmentShader: `
      varying vec3 vColor;
      varying float vAlpha, vHero;
      void main(){
        vec2 p=gl_PointCoord-.5;
        float d=length(p);
        float halo=exp(-d*d*16.);
        float core=exp(-d*d*95.);
        float cross=(exp(-abs(p.x)*38.)*exp(-abs(p.y)*6.)+exp(-abs(p.y)*38.)*exp(-abs(p.x)*6.))*vHero;
        float light=halo*.29+core*.9+cross*.23;
        gl_FragColor=vec4(vColor*light,vAlpha);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
      }`,
  });
  const group = new THREE.Group();
  const hazeMaterial = new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    uniforms: {time: {value: 0}, tint, tintMix, fade},
    vertexShader: 'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `
      precision highp float;
      varying vec2 vUv;
      uniform float time, tintMix, fade;
      uniform vec3 tint;
      void main(){
        vec2 uv=vUv;
        float arch=.075+.83*pow(max(sin(3.14159265*uv.x),0.),.88);
        float d=uv.y-arch;
        float veil=exp(-pow(d/.078,2.))*.5;
        veil+=exp(-pow((d+.07)/.105,2.))*.24;
        veil+=exp(-pow((d-.075)/.095,2.))*.20;
        float shoulder=.22+.78*smoothstep(.16,.44,abs(uv.x-.5));
        float glint=.78+.22*sin(time*.28-uv.x*15.+sin(uv.x*22.)*.5);
        vec3 gold=vec3(.82,.62,.39),blue=vec3(.49,.64,.89),rose=vec3(.82,.53,.63);
        vec3 color=mix(gold,blue,smoothstep(.17,.53,uv.x));
        color=mix(color,rose,smoothstep(.58,.90,uv.x));
        color=mix(color,tint,tintMix);
        float edge=smoothstep(.015,.14,uv.x)*(1.-smoothstep(.86,.985,uv.x));
        float glow=veil*shoulder*glint*edge;
        gl_FragColor=vec4(color*glow*fade,.19);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
      }`,
  });
  const haze = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), hazeMaterial);
  haze.position.z = -DEPTH - .08;
  group.add(haze);
  group.add(new THREE.Points(geometry, material));

  const lineGeometry = new THREE.BufferGeometry();
  lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(links, 3));
  group.add(new THREE.LineSegments(lineGeometry,
    new THREE.LineBasicMaterial({color: '#b8a9a2', transparent: true, opacity: .14, depthWrite: false})));
  camera.add(group);
  const resize = (aspect, pixelRatio) => {
    const extent = Math.tan(THREE.MathUtils.degToRad(camera.fov * .5)) * DEPTH;
    group.scale.set(extent * aspect, extent, 1);
    material.uniforms.pixelScale.value = Math.min(pixelRatio, 1.25);
  };
  return {group, material, hazeMaterial, resize, tint: tint.value, tintMix, fade};
}
