import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// `color` drives scene moods (brand swatch); `liquid` is the real juice tint
// seen in product photography — bright, pastel, clean.
export const PRODUCTS = [
  { id: 'silent-storm', name: 'Silent Storm', color: 0x8faab5, liquid: 0x86d6bf },
  { id: 'sweetest-stranger', name: 'Sweetest Stranger', color: 0xc99593, liquid: 0xf3a193 },
  { id: 'rebel-in-velvet', name: 'Rebel in Velvet', color: 0x77556e, liquid: 0xbca6d8 },
  { id: 'the-night-lingers', name: 'The Night Lingers', color: 0x9f7044, liquid: 0xf2a046 },
];

// Real VASA 50ml flacon proportions (scene units): near-cubic glass body,
// short neck, thin gold collar, bowl-shaped walnut cap.
const BODY = { w: 0.62, h: 0.6, d: 0.44, r: 0.04 };
const BASE_H = 0.09; // thick glass heel
const COLLAR_Y = BODY.h + 0.035;
const MIRROR_CLIP = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0.235);
export const BOTTLE_HEIGHT = COLLAR_Y + 0.33;

const PALETTES = {
  walnut: { base: ['#7a4424', '#8f5530', '#6a3a1e'], grain: [150, 92, 52], dark: [70, 36, 18] },
  oak: { base: ['#2c1d13', '#1f1710', '#150f0b'], grain: [72, 52, 30], dark: [14, 10, 7] },
};

export function makeWoodTexture(size = 512, palette = 'oak', vertical = false) {
  const p = PALETTES[palette];
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d');
  const grad = ctx.createLinearGradient(0, 0, size, size);
  grad.addColorStop(0, p.base[0]);
  grad.addColorStop(0.5, p.base[1]);
  grad.addColorStop(1, p.base[2]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, size, size);

  if (vertical) {
    ctx.translate(size / 2, size / 2);
    ctx.rotate(Math.PI / 2);
    ctx.translate(-size / 2, -size / 2);
  }
  // Fine grain lines + a few darker growth rings for figure.
  for (let i = 0; i < size / 1.6; i++) {
    const y = Math.random() * size;
    const ring = Math.random() < 0.12;
    const [r, g, b] = ring ? p.dark : p.grain;
    const k = 0.75 + Math.random() * 0.5;
    ctx.strokeStyle = `rgba(${r * k | 0},${g * k | 0},${b * k | 0},${ring ? 0.35 : 0.08 + Math.random() * 0.16})`;
    ctx.lineWidth = ring ? 1.2 + Math.random() * 2.2 : 0.4 + Math.random() * 1.1;
    ctx.beginPath();
    let cy = y;
    ctx.moveTo(-10, cy);
    for (let x = 0; x <= size + 10; x += size / 24) {
      cy += (Math.random() - 0.5) * (size * 0.012);
      ctx.lineTo(x, cy);
    }
    ctx.stroke();
  }
  ctx.setTransform(1, 0, 0, 1, 0, 0);

  const sheen = ctx.createLinearGradient(0, 0, size, 0);
  sheen.addColorStop(0, 'rgba(255,225,175,0)');
  sheen.addColorStop(0.5, 'rgba(255,225,175,0.06)');
  sheen.addColorStop(1, 'rgba(255,225,175,0)');
  ctx.fillStyle = sheen;
  ctx.fillRect(0, 0, size, size);

  const tex = new THREE.CanvasTexture(c);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

async function loadFonts() {
  try {
    await Promise.all([
      document.fonts.load('italic 400 40px "Cormorant Garamond"'),
      document.fonts.load('500 24px "Cormorant Garamond"'),
      document.fonts.load('600 20px Manrope'),
    ]);
  } catch (e) {
    /* best-effort — fall back to default serif metrics */
  }
}

// Cream paper label: small italic wordmark, emblem, name in spaced caps, volume.
async function makeLabelTexture(name) {
  await loadFonts();
  const w = 512;
  const h = 432;
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const ctx = c.getContext('2d');

  const paper = ctx.createLinearGradient(0, 0, w, h);
  paper.addColorStop(0, '#f6f0e4');
  paper.addColorStop(1, '#ebe2d0');
  ctx.fillStyle = paper;
  ctx.fillRect(0, 0, w, h);
  // paper tooth
  const img = ctx.getImageData(0, 0, w, h);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 10;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n;
  }
  ctx.putImageData(img, 0, 0);

  ctx.fillStyle = '#6b5a45';
  ctx.textAlign = 'center';
  ctx.font = 'italic 400 44px "Cormorant Garamond", serif';
  ctx.fillText('vāsa', w / 2, 70);

  // emblem: thin double ring with a swirl
  ctx.strokeStyle = '#8a7556';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.arc(w / 2, 150, 34, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.arc(w / 2, 150, 28, 0, Math.PI * 2); ctx.stroke();
  ctx.lineWidth = 2.4;
  ctx.beginPath();
  for (let t = 0; t < Math.PI * 3.2; t += 0.1) {
    const r = 4 + t * 2.2;
    const x = w / 2 + Math.cos(t) * r * 0.9;
    const y = 150 + Math.sin(t) * r * 0.9;
    t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.stroke();

  ctx.fillStyle = '#3d3024';
  ctx.font = '500 40px "Cormorant Garamond", serif';
  const words = name.toUpperCase().split(' ');
  const lines = words.length > 2 ? [words.slice(0, 1).join(' '), words.slice(1).join(' ')] : words;
  const spaced = (s) => s.split('').join(String.fromCharCode(8202));
  lines.forEach((l, i) => ctx.fillText(spaced(l), w / 2, 250 + i * 46));

  ctx.fillStyle = '#7d6b55';
  ctx.font = '600 15px Manrope, sans-serif';
  ctx.fillText('5 0  M L  ·  E A U  D E  P A R F U M', w / 2, h - 40);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

function capGeometry() {
  // Lathe profile (radius, y) from collar up: tight neck → rounded bowl → flat top.
  const pts = [];
  pts.push(new THREE.Vector2(0.0, 0));
  pts.push(new THREE.Vector2(0.105, 0));
  for (let i = 0; i <= 16; i++) {
    const t = i / 16;
    const r = 0.105 + (0.235 - 0.105) * Math.sin(t * Math.PI * 0.5) ** 0.8;
    pts.push(new THREE.Vector2(r, 0.02 + t * 0.2));
  }
  pts.push(new THREE.Vector2(0.24, 0.27));
  pts.push(new THREE.Vector2(0.232, 0.285));
  pts.push(new THREE.Vector2(0.0, 0.285));
  return new THREE.LatheGeometry(pts, 48);
}

// Set a material's resting opacity; focus/dim tweens scale relative to it.
function base(mat, opacity) {
  mat.transparent = opacity < 1 || mat.transparent;
  mat.opacity = opacity;
  mat.userData.baseOpacity = opacity;
  return mat;
}

export async function createBottles(envMap) {
  const group = new THREE.Group();
  const woodTex = makeWoodTexture(512, 'oak');
  const capTex = makeWoodTexture(512, 'walnut', true);
  const bottles = [];
  const spacing = 0.98;

  // Shared geometry across all four bottles.
  const bodyGeo = new RoundedBoxGeometry(BODY.w, BODY.h, BODY.d, 4, BODY.r);
  const heelGeo = new RoundedBoxGeometry(BODY.w - 0.02, BASE_H, BODY.d - 0.02, 3, 0.03);
  const liquidGeo = new RoundedBoxGeometry(BODY.w - 0.08, BODY.h - BASE_H - 0.07, BODY.d - 0.08, 3, 0.025);
  {
    const pos = liquidGeo.attributes.position;
    const col = new Float32Array(pos.count * 3);
    const hh = (BODY.h - BASE_H - 0.07) / 2;
    const hw = (BODY.w - 0.08) / 2;
    for (let i = 0; i < pos.count; i++) {
      const y = (pos.getY(i) + hh) / (2 * hh);
      const side = Math.abs(pos.getX(i)) / hw;
      const k = 0.55 + 0.5 * y - 0.18 * side * side;
      col[i * 3] = col[i * 3 + 1] = col[i * 3 + 2] = k;
    }
    liquidGeo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  }
  const neckGeo = new THREE.CylinderGeometry(0.09, 0.1, 0.05, 24);
  const collarGeo = new THREE.CylinderGeometry(0.108, 0.108, 0.05, 32);
  const capGeo = capGeometry();
  const labelGeo = new THREE.PlaneGeometry(0.34, 0.287);

  // Thick clear glass without transmission (no extra scene pass): low-opacity
  // clearcoated shell that picks up strong env reflections at grazing angles.
  const glassMat = base(new THREE.MeshPhysicalMaterial({
    color: 0xf4f8f6, metalness: 0, roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.03,
    envMap, envMapIntensity: 1.4, depthWrite: false,
  }), 0.13);
  const heelMat = base(new THREE.MeshPhysicalMaterial({
    color: 0x9fb8ad, roughness: 0.06, clearcoat: 1, envMap, envMapIntensity: 1.1, depthWrite: false,
  }), 0.3);
  const collarMat = new THREE.MeshStandardMaterial({ color: 0xd4b06a, metalness: 1, roughness: 0.22, envMap, envMapIntensity: 1.6 });
  const capMat = new THREE.MeshPhysicalMaterial({
    map: capTex, roughness: 0.42, metalness: 0, clearcoat: 0.35, clearcoatRoughness: 0.4, envMap, envMapIntensity: 0.7,
  });
  collarMat.userData.baseOpacity = 1;
  capMat.userData.baseOpacity = 1;

  for (let i = 0; i < PRODUCTS.length; i++) {
    const p = PRODUCTS[i];
    const bottleGroup = new THREE.Group();

    const own = (m) => { const c = m.clone(); c.userData.baseOpacity = m.userData.baseOpacity; return c; };
    const gMat = own(glassMat);
    const heel = new THREE.Mesh(heelGeo, own(heelMat));
    heel.position.y = BASE_H / 2;

    const liquidColor = new THREE.Color(p.liquid);
    const liquidMat = base(new THREE.MeshStandardMaterial({
      color: liquidColor, emissive: liquidColor.clone().multiplyScalar(0.1), vertexColors: true,
      roughness: 0.06, metalness: 0, envMap, envMapIntensity: 0.55, depthWrite: false,
    }), 0.82);
    const liquid = new THREE.Mesh(liquidGeo, liquidMat);
    liquid.position.y = BASE_H + (BODY.h - BASE_H - 0.07) / 2 + 0.01;

    const glass = new THREE.Mesh(bodyGeo, gMat);
    glass.position.y = BODY.h / 2;

    const neck = new THREE.Mesh(neckGeo, gMat);
    neck.position.y = BODY.h + 0.015;

    const collar = new THREE.Mesh(collarGeo, own(collarMat));
    collar.position.y = COLLAR_Y;

    const cap = new THREE.Mesh(capGeo, own(capMat));
    cap.position.y = COLLAR_Y + 0.02;

    const labelMat = new THREE.MeshStandardMaterial({
      color: 0xc4bcae, roughness: 0.85, metalness: 0, polygonOffset: true, polygonOffsetFactor: -2,
    });
    labelMat.userData.baseOpacity = 1;
    const label = new THREE.Mesh(labelGeo, labelMat);
    label.position.set(0, BODY.h * 0.52, BODY.d / 2 + 0.002);
    makeLabelTexture(p.name).then((tex) => {
      labelMat.map = tex;
      labelMat.needsUpdate = true;
    });

    liquid.renderOrder = 0;
    heel.renderOrder = 1;
    glass.renderOrder = 2;
    neck.renderOrder = 2;
    label.renderOrder = 3;

    const parts = [heel, liquid, glass, neck, collar, cap, label];
    bottleGroup.add(...parts);
    bottleGroup.position.x = (i - (PRODUCTS.length - 1) / 2) * spacing;
    bottleGroup.userData.productId = p.id;
    parts.forEach((m) => { m.userData.productId = p.id; });

    const mirror = new THREE.Group();
    parts.filter((m) => m !== label).forEach((m) => {
      const mat = m.material.clone();
      mat.userData.baseOpacity = m.material.userData.baseOpacity;
      mat.clippingPlanes = [MIRROR_CLIP]; // keep reflection inside the slab's depth
      const r = new THREE.Mesh(m.geometry, mat);
      r.position.copy(m.position);
      r.renderOrder = m.renderOrder - 10;
      r.raycast = () => {};
      mirror.add(r);
    });
    mirror.scale.y = -1;
    bottleGroup.add(mirror);

    group.add(bottleGroup);
    bottles.push({
      id: p.id,
      name: p.name,
      color: p.color,
      group: bottleGroup,
      glass,
      liquid,
      basePos: bottleGroup.position.clone(),
      baseScale: 1,
    });
  }

  return { group, bottles, woodTex, capTex };
}

export function createPlinth(woodTex) {
  const group = new THREE.Group();

  const slabGeo = new RoundedBoxGeometry(5.2, 0.24, 1.5, 3, 0.02);
  // Semi-transparent glossy top: mirrored bottles (renderOrder < 0) show through as a wet reflection.
  const slabMat = new THREE.MeshPhysicalMaterial({
    map: woodTex, color: 0x4f3d30, roughness: 0.34, metalness: 0, clearcoat: 0.45, clearcoatRoughness: 0.2, envMapIntensity: 0.25,
    transparent: true, opacity: 0.8,
  });
  const slab = new THREE.Mesh(slabGeo, slabMat);
  slab.position.y = -0.12;
  slab.renderOrder = -1;
  group.add(slab);

  // Cheap wet floor: dark glossy plane (no Reflector RT).
  const floorGeo = new THREE.PlaneGeometry(20, 12, 1, 1);
  const floorMat = new THREE.MeshStandardMaterial({
    color: 0x050403, roughness: 0.3, metalness: 0.1, transparent: true, opacity: 0.55,
  });
  const floor = new THREE.Mesh(floorGeo, floorMat);
  floor.rotation.x = -Math.PI / 2;
  floor.position.y = -0.241;
  group.add(floor);

  return { group };
}
