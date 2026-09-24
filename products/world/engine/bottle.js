import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

function textureCanvas(THREE, width, height, paint) {
  const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
  paint(canvas.getContext('2d'), width, height);
  const texture = new THREE.CanvasTexture(canvas); texture.colorSpace = THREE.SRGBColorSpace; texture.anisotropy = 2;
  return texture;
}
function woodTexture(THREE) {
  return textureCanvas(THREE, 256, 384, (ctx, width, height) => {
    const grain = ctx.createLinearGradient(0, 0, width, 0);
    grain.addColorStop(0, '#271006'); grain.addColorStop(.18, '#6d3215'); grain.addColorStop(.52, '#b06731'); grain.addColorStop(.77, '#52210c'); grain.addColorStop(1, '#1c0903');
    ctx.fillStyle = grain; ctx.fillRect(0, 0, width, height);
    for (let index = 0; index < 126; index += 1) {
      const x = Math.random() * width;
      ctx.strokeStyle = index % 3 ? 'rgba(35,10,2,.38)' : 'rgba(235,162,91,.16)'; ctx.lineWidth = .3 + Math.random() * 1.2;
      ctx.beginPath(); ctx.moveTo(x, 0);
      for (let y = 0; y < height; y += 8) ctx.lineTo(x + Math.sin(y * (.025 + Math.random() * .015) + index) * (2 + Math.random() * 3), y);
      ctx.stroke();
    }
  });
}
function labelTexture(THREE, name) {
  return textureCanvas(THREE, 768, 850, (ctx, width, height) => {
    ctx.fillStyle = '#ece8dc'; ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = '#7994a6'; ctx.lineWidth = 20; ctx.strokeRect(18, 18, width - 36, height - 36);
    ctx.fillStyle = '#261d19'; ctx.textAlign = 'center'; ctx.font = 'italic 500 62px Georgia, serif'; ctx.fillText('vāsā', width / 2, 132);
    ctx.font = '500 34px Georgia, serif'; ctx.fillText('✧', width / 2, 254);
    ctx.font = '500 59px Georgia, serif'; const lines = name.toUpperCase().split(' '); lines.forEach((line, index) => ctx.fillText(line, width / 2, 400 + index * 78 - (lines.length - 1) * 36));
    ctx.font = 'italic 28px Georgia, serif'; ctx.fillText('50 ml / 1.7 fl oz', width / 2, height - 78);
  });
}
export function createBottle(THREE, cfg, name) {
  const bottle = new THREE.Group();
  const liquid = new THREE.Mesh(new RoundedBoxGeometry(1.36, 1.52, .7, 8, .12), new THREE.MeshPhysicalMaterial({color: cfg.liquid, emissive: cfg.liquid, emissiveIntensity: .055, roughness: .08, transmission: .78, thickness: .42, ior: 1.33})); liquid.position.y = -.14;
  const glass = new THREE.Mesh(new RoundedBoxGeometry(1.64, 1.98, .94, 10, .15), new THREE.MeshPhysicalMaterial({color: '#dbeceb', roughness: .025, transmission: 1, thickness: .72, ior: 1.47, clearcoat: 1, clearcoatRoughness: .025, attenuationColor: new THREE.Color(cfg.liquid).multiplyScalar(.65), attenuationDistance: 3.4, envMapIntensity: 1.35}));
  glass.renderOrder = 1;
  const label = new THREE.Mesh(new THREE.PlaneGeometry(1.18, 1.12), new THREE.MeshStandardMaterial({map: labelTexture(THREE, name), roughness: .9, depthTest: false})); label.position.set(0, -.08, .5); label.renderOrder = 5;
  const collar = new THREE.Mesh(new THREE.CylinderGeometry(.34, .34, .17, 56), new THREE.MeshStandardMaterial({color: '#a98242', metalness: 1, roughness: .2})); collar.position.y = 1.075;
  const wood = new THREE.MeshStandardMaterial({map: woodTexture(THREE), color: '#7c3e18', roughness: .38, metalness: .02});
  const profile = [[.37, 0], [.5, .035], [.59, .15], [.6, .42], [.55, .67], [.45, .79], [.31, .84]].map(([radius, y]) => new THREE.Vector2(radius, y));
  const cap = new THREE.Mesh(new THREE.LatheGeometry(profile, 64), wood); cap.position.y = 1.155;
  // Narrow studio reflection strips make the thick bevel read as glass, not a milky front pane.
  const stripMaterial = new THREE.MeshBasicMaterial({color: '#ffffff', transparent: true, opacity: .16, depthWrite: false, blending: THREE.AdditiveBlending});
  [-.65, .65].forEach((x, index) => { const strip = new THREE.Mesh(new THREE.PlaneGeometry(.045, 1.5), stripMaterial.clone()); strip.position.set(x, .03, .48); strip.rotation.z = index ? -.025 : .025; bottle.add(strip); });
  bottle.add(liquid, glass, label, collar, cap); return bottle;
}
