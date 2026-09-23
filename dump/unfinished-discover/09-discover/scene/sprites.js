import * as THREE from 'three';

const SLOTS = [[-2.35, 0.95], [2.3, -0.75], [2.05, 1.15], [-2.05, -0.95], [0.15, -1.35]];
let slotShift = 0;
import { gsap } from 'gsap';

const BASE = '/media/campaign/scent-elements/';
const textureCache = new Map();
const loader = new THREE.TextureLoader();

function loadTexture(name) {
  if (textureCache.has(name)) return textureCache.get(name);
  const promise = new Promise((resolve) => {
    loader.load(
      `${BASE}${name}.webp`,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        resolve(tex);
      },
      undefined,
      () => resolve(null) // fail silently — asset not generated yet
    );
  });
  textureCache.set(name, promise);
  return promise;
}

export function createSpriteField({ reducedMotion } = {}) {
  const group = new THREE.Group();
  let active = [];
  let token = 0;

  function makeSprite(tex) {
    const mat = new THREE.MeshBasicMaterial({
      map: tex,
      transparent: true,
      depthWrite: false,
      opacity: 0,
    });
    const aspect = tex.image ? tex.image.width / tex.image.height : 1;
    const h = 0.9 + Math.random() * 0.5;
    const geo = new THREE.PlaneGeometry(h * aspect, h);
    const mesh = new THREE.Mesh(geo, mat);
    return mesh;
  }

  async function showSprites(names = [], dir = 1) {
    const myToken = ++token;
    const outgoing = active;
    active = [];

    // blow outgoing sprites away sideways with velocity, then dispose
    outgoing.forEach((s) => {
      const dur = reducedMotion ? 0.25 : 0.9 + Math.random() * 0.4;
      gsap.to(s.mesh.position, {
        x: s.mesh.position.x + dir * (4 + Math.random() * 3),
        y: s.mesh.position.y + (Math.random() - 0.5) * 2,
        duration: dur,
        ease: 'power2.in',
      });
      gsap.to(s.mesh.material, {
        opacity: 0,
        duration: dur * 0.8,
        onComplete: () => {
          group.remove(s.mesh);
          s.mesh.geometry.dispose();
          s.mesh.material.dispose();
        },
      });
    });

    const layers = [-1.4, -2.4, -3.4];
    slotShift += 2;
    for (let i = 0; i < names.length; i++) {
      const name = names[i];
      const tex = await loadTexture(name);
      if (myToken !== token) return; // superseded by a newer call
      if (!tex) continue; // missing asset — skip silently per spec

      const mesh = makeSprite(tex);
      const depth = layers[i % layers.length];
      const startX = -dir * (5 + Math.random() * 2);
      // Compose around the centred title: diagonal corner slots, slight jitter.
      const slot = SLOTS[(i + slotShift) % SLOTS.length];
      const spread = 1 + (-depth - 1.4) * 0.22; // deeper layers need wider offsets to reach the frame edge
      const targetX = slot[0] * spread + (Math.random() - 0.5) * 0.35;
      const targetY = slot[1] * spread + (Math.random() - 0.5) * 0.25;
      mesh.position.set(startX, targetY, depth);
      mesh.rotation.z = (Math.random() - 0.5) * 0.3;
      group.add(mesh);

      const rec = {
        mesh,
        name,
        phase: Math.random() * Math.PI * 2,
        speed: 0.2 + Math.random() * 0.3,
        target: new THREE.Vector3(targetX, targetY, depth),
      };
      active.push(rec);

      const dur = reducedMotion ? 0.3 : 1.0 + Math.random() * 0.5;
      gsap.to(mesh.position, { x: targetX, duration: dur, ease: 'power3.out', delay: i * 0.06 });
      gsap.to(mesh.material, { opacity: 0.85, duration: dur, delay: i * 0.06 });
    }
  }

  function clearSprites() {
    showSprites([], 1);
  }

  function update(dt, elapsed, mouseNdc) {
    active.forEach((rec) => {
      if (!reducedMotion) {
        rec.mesh.position.y = rec.target.y + Math.sin(elapsed * rec.speed + rec.phase) * 0.12;
        rec.mesh.rotation.z += Math.sin(elapsed * 0.2 + rec.phase) * 0.0003;

        if (mouseNdc) {
          const dx = rec.mesh.position.x - mouseNdc.x * 3;
          const dy = rec.mesh.position.y - mouseNdc.y * 2;
          const d = Math.sqrt(dx * dx + dy * dy);
          if (d < 1.2) {
            const push = (1.2 - d) * 0.02;
            rec.mesh.position.x += (dx / (d || 1)) * push;
            rec.mesh.position.y += (dy / (d || 1)) * push;
          }
        }
      }
    });
  }

  function dispose() {
    active.forEach((rec) => {
      rec.mesh.geometry.dispose();
      rec.mesh.material.dispose();
    });
    active = [];
  }

  return { group, showSprites, clearSprites, update, dispose };
}
