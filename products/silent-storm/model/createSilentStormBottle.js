import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/**
 * VASA Silent Storm — reconstructed from the studio photograph
 * (model/reference-photo.png, 1122×1402). Body width 353 px = 1.91 u,
 * k = 0.00541 u/px, y = −1.85 + (1168 − px) · k.
 *
 *  body   1.91 w × 2.64 h × 1.35 d square block, soft 0.05 edges
 *  heel   thick clear glass, liquid starts at y −1.40
 *  neck   clear, r 0.45, y 0.79 → 1.01
 *  collar polished gold, r 0.45, y 1.01 → 1.20
 *  cap    walnut bowl y 1.20 → 2.17, widest r 0.84 near the top
 *  label  cream paper, 1.35 h, front 1.74 w from 0.17 inset, wraps 0.34 onto
 *         the right side, pale-blue watercolour edge, dark maroon ink
 */
const K = 0.00541;
const Y = (px) => -1.85 + (1168 - px) * K;
const BODY_W = 1.91;
const BODY_D = 1.35;
const BODY_TOP = Y(680);
const BODY_BOT = -1.85;
const BODY_H = BODY_TOP - BODY_BOT;
const LABEL_TOP = Y(760);
const LABEL_BOT = Y(1010);
const LABEL_H = LABEL_TOP - LABEL_BOT;
const LABEL_FRONT = BODY_W - 0.17;
const LABEL_SIDE = 0.34;
const INK = '#2a1216';

export function createSilentStormBottle({
  emblemUrl = new URL('./emblem.png', import.meta.url).href,
} = {}) {
  const group = new THREE.Group();
  group.name = 'VASA Silent Storm';
  const disposables = [];
  const keep = (o) => { disposables.push(o); return o; };
  const add = (name, geometry, material, parent = group) => {
    keep(geometry); keep(material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    parent.add(mesh);
    return mesh;
  };

  // Crystal-clear glass. Transmission refracts whatever the scene renders
  // behind it (the storm backdrop plane lives in the scene for this reason).
  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0,
    transmission: 1, thickness: 2.2, ior: 1.52,
    attenuationColor: new THREE.Color(0xeef8f3), attenuationDistance: 6,
    specularIntensity: 1, envMapIntensity: 1.6,
  });
  // Liquid must be opaque: three.js only draws opaque objects into the
  // transmission buffer, so a transmissive liquid vanishes inside the glass.
  // Liquid must be opaque: three.js only draws opaque objects into the
  // transmission buffer, so a transmissive liquid vanishes inside the glass.
  // Vertex colours shade it deeper at the base and edges for volume.
  const liquid = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, metalness: 0, roughness: 0.04,
    clearcoat: 1, clearcoatRoughness: 0.03, envMapIntensity: 1.1,
  });
  const gold = new THREE.MeshStandardMaterial({ color: 0xe6bd62, metalness: 1, roughness: 0.22, envMapIntensity: 3.2 });

  const body = add('glass body', new RoundedBoxGeometry(BODY_W, BODY_H, BODY_D, 6, 0.05), glass);
  body.position.y = (BODY_TOP + BODY_BOT) / 2;

  const liqBot = Y(1085), liqTop = Y(700), wall = 0.09;
  const liq = add('liquid', new RoundedBoxGeometry(BODY_W - 2 * wall, liqTop - liqBot, BODY_D - 2 * wall, 4, 0.04), liquid);
  liq.position.y = (liqTop + liqBot) / 2;
  {
    // Smooth vertical depth gradient (per-face UVs run bottom→top).
    const g = document.createElement('canvas');
    g.width = 4; g.height = 256;
    const gc = g.getContext('2d');
    const lin = gc.createLinearGradient(0, 256, 0, 0);
    lin.addColorStop(0, '#3d7f64'); lin.addColorStop(.35, '#72b597'); lin.addColorStop(.85, '#a5d8bf'); lin.addColorStop(1, '#bfe6d2');
    gc.fillStyle = lin; gc.fillRect(0, 0, 4, 256);
    const gt = keep(new THREE.CanvasTexture(g));
    gt.colorSpace = THREE.SRGBColorSpace;
    liquid.map = gt;
  }

  const neck = add('glass neck', new THREE.CylinderGeometry(0.4, 0.43, Y(640) - BODY_TOP, 64), glass);
  neck.position.y = (Y(640) + BODY_TOP) / 2;
  const collarH = Y(605) - Y(640);
  const collar = add('gold collar', new THREE.CylinderGeometry(0.45, 0.45, collarH, 128), gold);
  collar.position.y = (Y(605) + Y(640)) / 2;

  // Walnut bowl, radii measured every 20 px from the photograph.
  const capProfile = [
    [0, Y(605)], [0.58, Y(605)], [0.595, Y(600)], [0.655, Y(580)], [0.703, Y(560)],
    [0.747, Y(540)], [0.779, Y(520)], [0.806, Y(500)], [0.825, Y(480)], [0.838, Y(460)],
    [0.841, Y(445)], [0.83, Y(433)], [0.79, Y(427)], [0.6, Y(424)], [0, Y(424)],
  ].map(([r, y]) => new THREE.Vector2(r, y));
  const wood = keep(woodTexture());
  add('walnut cap', new THREE.LatheGeometry(capProfile, 160), new THREE.MeshPhysicalMaterial({
    map: wood, roughness: 0.58, metalness: 0,
    clearcoat: 0.12, clearcoatRoughness: 0.6, envMapIntensity: 0.55,
  }));

  // Label: front panel + wrap onto the right side, one canvas shared via UV offsets.
  const labelW = LABEL_FRONT + LABEL_SIDE;
  const labelY = (LABEL_TOP + LABEL_BOT) / 2;
  const paper = { roughness: 0.7, metalness: 0, envMapIntensity: 0.25, emissive: 0xffffff, emissiveIntensity: 0.26, polygonOffset: true, polygonOffsetFactor: -2 };
  const frontMat = new THREE.MeshStandardMaterial(paper);
  const sideMat = new THREE.MeshStandardMaterial(paper);
  const front = add('label front', new THREE.PlaneGeometry(LABEL_FRONT, LABEL_H), frontMat);
  front.position.set(BODY_W / 2 - LABEL_FRONT / 2, labelY, BODY_D / 2 + 0.003);
  const side = add('label side', new THREE.PlaneGeometry(LABEL_SIDE, LABEL_H), sideMat);
  side.rotation.y = Math.PI / 2;
  side.position.set(BODY_W / 2 + 0.003, labelY, BODY_D / 2 - LABEL_SIDE / 2);
  front.visible = side.visible = false;

  let disposed = false;
  const ready = new Promise((resolve) => {
    const finish = (emblem) => {
      if (disposed) { resolve(false); return; }
      labelCanvas(emblem, LABEL_FRONT / labelW, labelW / LABEL_H).then((canvas) => {
        if (disposed) { resolve(false); return; }
        const split = LABEL_FRONT / labelW;
        const mk = (offset, repeat) => {
          const t = keep(new THREE.CanvasTexture(canvas));
          t.colorSpace = THREE.SRGBColorSpace;
          t.anisotropy = 16;
          t.offset.x = offset;
          t.repeat.x = repeat;
          return t;
        };
        frontMat.map = frontMat.emissiveMap = mk(0, split);
        sideMat.map = sideMat.emissiveMap = mk(split, 1 - split);
        frontMat.needsUpdate = sideMat.needsUpdate = true;
        front.visible = side.visible = true;
        resolve(true);
      });
    };
    const img = new Image();
    img.onload = () => finish(img);
    img.onerror = () => finish(null);
    img.src = emblemUrl;
  });

  return {
    group,
    ready,
    dispose() {
      if (disposed) return;
      disposed = true;
      disposables.forEach((d) => d.dispose?.());
      group.clear();
    },
  };
}

// Whole wrap-around label on one canvas; type is centred on the front panel.
async function labelCanvas(emblem, frontShare, aspect) {
  try {
    await Promise.all([
      document.fonts.load('italic 400 100px "Cormorant Garamond"'),
      document.fonts.load('500 100px "Cormorant Garamond"'),
      document.fonts.load('italic 500 100px "Cormorant Garamond"'),
    ]);
  } catch { /* serif fallback */ }
  const H = 1400, W = Math.round(H * aspect);
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const ctx = c.getContext('2d');

  ctx.fillStyle = '#e9dcc0';
  ctx.fillRect(0, 0, W, H);
  // cotton paper tooth + soft mottling
  const img = ctx.getImageData(0, 0, W, H);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = (Math.random() - 0.5) * 9;
    img.data[i] += n; img.data[i + 1] += n; img.data[i + 2] += n * 0.9;
  }
  ctx.putImageData(img, 0, 0);

  // pale-blue watercolour edge: layered, jittered strokes
  const edge = 46;
  for (let pass = 0; pass < 5; pass++) {
    ctx.strokeStyle = `rgba(${140 + pass * 6},${184 + pass * 4},${218},${0.22})`;
    ctx.lineWidth = edge - pass * 7;
    ctx.beginPath();
    const j = () => (Math.random() - 0.5) * 6;
    ctx.moveTo(edge / 2 + j(), edge / 2 + j());
    ctx.lineTo(W - edge / 2 + j(), edge / 2 + j());
    ctx.lineTo(W - edge / 2 + j(), H - edge / 2 + j());
    ctx.lineTo(edge / 2 + j(), H - edge / 2 + j());
    ctx.closePath();
    ctx.stroke();
  }

  const cx = W * frontShare / 2 + 20;
  ctx.fillStyle = INK;
  ctx.textAlign = 'center';
  ctx.lineWidth = 4; ctx.strokeStyle = INK;
  ctx.font = 'italic 500 170px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('vāsā', cx, 300); ctx.strokeText('vāsā', cx, 300);

  if (emblem) {
    // recolour the lifted emblem to the label ink, keep its alpha
    const ew = 260, eh = ew * (emblem.height / emblem.width);
    const e = document.createElement('canvas');
    e.width = ew; e.height = eh;
    const ec = e.getContext('2d');
    ec.drawImage(emblem, 0, 0, ew, eh);
    ec.globalCompositeOperation = 'source-in';
    ec.fillStyle = INK;
    ec.fillRect(0, 0, ew, eh);
    ctx.drawImage(e, cx - ew / 2, 400);
  }

  ctx.font = '500 168px "Cormorant Garamond", Georgia, serif';
  if ('letterSpacing' in ctx) ctx.letterSpacing = '14px';
  ctx.strokeStyle = INK;
  ctx.lineWidth = 6;
  ctx.lineJoin = 'round';
  for (const [t, y] of [['SILENT', 900], ['STORM', 1060]]) { ctx.fillText(t, cx, y); ctx.strokeText(t, cx, y); }
  if ('letterSpacing' in ctx) ctx.letterSpacing = '0px';
  ctx.font = 'italic 500 84px "Cormorant Garamond", Georgia, serif';
  ctx.fillText('50 ml | 1.7 fl oz', cx, 1175);
  return c;
}

// Warm reddish walnut/oak: soft figure, fine grain, pore flecks (low contrast).
function woodTexture(size = 1024) {
  const c = document.createElement('canvas');
  c.width = c.height = size;
  const ctx = c.getContext('2d');
  ctx.fillStyle = '#6e3a1f';
  ctx.fillRect(0, 0, size, size);
  for (let i = 0; i < 14; i++) {
    const x = Math.random() * size;
    const g = ctx.createLinearGradient(x - 60, 0, x + 60, 0);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(.5, Math.random() < .5 ? 'rgba(60,24,8,.18)' : 'rgba(190,110,60,.14)');
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(x - 60, 0, 120, size);
  }
  for (let i = 0; i < size * 0.7; i++) {
    const x = Math.random() * size;
    ctx.strokeStyle = Math.random() < .5 ? `rgba(70,30,10,${.05 + Math.random() * .1})` : `rgba(200,125,75,${.04 + Math.random() * .08})`;
    ctx.lineWidth = .5 + Math.random() * 1.1;
    ctx.beginPath();
    let px = x;
    ctx.moveTo(px, 0);
    for (let y = 0; y <= size; y += size / 30) { px += (Math.random() - .5) * 3; ctx.lineTo(px, y); }
    ctx.stroke();
  }
  for (let i = 0; i < 5000; i++) {
    ctx.fillStyle = `rgba(55,22,8,${.08 + Math.random() * .15})`;
    ctx.fillRect(Math.random() * size, Math.random() * size, 1 + Math.random() * 1.5, 2 + Math.random() * 6);
  }
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3, 1);
  tex.anisotropy = 16;
  return tex;
}
