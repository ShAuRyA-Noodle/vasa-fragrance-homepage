import * as THREE from 'three';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

/**
 * Image-to-3D reconstruction of the supplied VASA Silent Storm packshot.
 *
 * +Z is the labelled front. The branded face is projected from the original
 * plate; the body, shoulder, liquid, collar, and cap have real depth. We have
 * no side/back reference, so the intended presentation is frontal with only
 * a small yaw. This avoids replacing the real label with generated lettering.
 */
export function createSilentStormBottle({
  textureLoader = new THREE.TextureLoader(),
  plateUrl = '/plates/silent-storm.png',
} = {}) {
  const group = new THREE.Group();
  group.name = 'VASA Silent Storm — photo-projected 3D bottle';
  const geometryResources = [];
  const materialResources = [];
  let plateTexture;

  const addMesh = (name, geometry, material, parent = group) => {
    geometryResources.push(geometry);
    materialResources.push(material);
    const mesh = new THREE.Mesh(geometry, material);
    mesh.name = name;
    mesh.castShadow = true;
    mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  const glass = new THREE.MeshPhysicalMaterial({
    color: 0xe7f6f3,
    metalness: 0,
    roughness: 0.055,
    transmission: 0.91,
    thickness: 0.36,
    ior: 1.47,
    transparent: true,
    opacity: 0.77,
    clearcoat: 1,
    clearcoatRoughness: 0.045,
    envMapIntensity: 1.45,
    depthWrite: false,
  });
  const liquid = new THREE.MeshPhysicalMaterial({
    color: 0xbdd6c9,
    metalness: 0,
    roughness: 0.14,
    transmission: 0.74,
    thickness: 0.25,
    ior: 1.33,
    transparent: true,
    opacity: 0.66,
    depthWrite: false,
  });
  const gold = new THREE.MeshStandardMaterial({
    color: 0xcba85c,
    metalness: 0.91,
    roughness: 0.19,
    envMapIntensity: 1.7,
  });

  // A visibly deep square vessel with softened corners and a thick foot.
  // Its front-most surface is kept behind the accurately printed projection.
  const vessel = addMesh('clear square glass vessel',
    new RoundedBoxGeometry(1.91, 2.38, 0.72, 5, 0.14), glass);
  vessel.position.set(0, -0.66, -0.065);

  const innerLiquid = addMesh('pale green liquid volume',
    new RoundedBoxGeometry(1.65, 1.78, 0.55, 4, 0.12), liquid);
  innerLiquid.position.set(0, -0.71, -0.07);

  const glassFoot = addMesh('heavy clear glass foot',
    new RoundedBoxGeometry(1.91, 0.30, 0.72, 4, 0.08),
    new THREE.MeshPhysicalMaterial({
      color: 0xf7fffc, roughness: 0.035, transmission: 0.94,
      thickness: 0.53, ior: 1.48, transparent: true,
      opacity: 0.74, clearcoat: 1, depthWrite: false,
    }));
  glassFoot.position.set(0, -1.70, -0.065);

  const shoulder = addMesh('rounded raised shoulder',
    new RoundedBoxGeometry(1.76, 0.22, 0.63, 4, 0.105), glass);
  shoulder.position.set(0, 0.43, -0.07);

  const neck = addMesh('clear neck', new THREE.CylinderGeometry(0.37, 0.39, 0.23, 64), glass);
  neck.position.set(0, 0.49, -0.065);

  const collar = addMesh('gold cap collar', new THREE.CylinderGeometry(0.39, 0.39, 0.18, 64), gold);
  collar.position.set(0, 0.62, -0.065);

  // The bowl silhouette is lathed from the front-view contour. The rear depth
  // and grain are inferred from the only supplied reference.
  const capProfile = [
    [0.0, 0.71], [0.34, 0.71], [0.42, 0.76], [0.50, 0.88],
    [0.58, 1.05], [0.67, 1.32], [0.715, 1.55],
    [0.725, 1.73], [0.69, 1.81], [0.53, 1.84], [0.0, 1.84],
  ].map(([radius, y]) => new THREE.Vector2(radius, y));
  const capMaterial = new THREE.MeshStandardMaterial({
    color: 0x714628,
    metalness: 0,
    roughness: 0.64,
    bumpScale: 0.023,
  });
  const cap = addMesh('brown wooden bowl cap', new THREE.LatheGeometry(capProfile, 96), capMaterial);
  cap.position.z = -0.065;

  // The cap is not a sphere: its subtle top disc and underside preserve the
  // distinctive bowl proportions when the rig breathes a few degrees.
  const topDisc = addMesh('wooden cap top', new THREE.CylinderGeometry(0.53, 0.53, 0.025, 64), capMaterial);
  topDisc.position.set(0, 1.827, -0.065);

  const plateGeometry = new THREE.PlaneGeometry(3.2, 4.0);
  const projectedFront = new THREE.MeshBasicMaterial({
    transparent: true,
    opacity: 1,
    alphaTest: 0.035,
    depthTest: false,
    depthWrite: false,
    side: THREE.FrontSide,
    toneMapped: false,
  });
  const face = addMesh('reference-projected branded front', plateGeometry, projectedFront);
  face.position.set(0, 0, 0.535);
  face.castShadow = false;
  face.receiveShadow = false;
  face.renderOrder = 10;
  face.visible = false;

  let disposed = false;
  const ready = new Promise((resolve) => {
    textureLoader.load(plateUrl, (texture) => {
      if (disposed) {
        texture.dispose();
        resolve(false);
        return;
      }
      texture.colorSpace = THREE.SRGBColorSpace;
      texture.anisotropy = 8;
      texture.minFilter = THREE.LinearMipmapLinearFilter;
      texture.magFilter = THREE.LinearFilter;
      texture.generateMipmaps = true;
      plateTexture = texture;
      projectedFront.map = texture;
      projectedFront.needsUpdate = true;
      face.visible = true;
      resolve(true);
    }, undefined, () => resolve(false));
  });

  return {
    group,
    ready,
    dispose() {
      if (disposed) return;
      disposed = true;
      geometryResources.forEach((geometry) => geometry.dispose());
      [...new Set(materialResources)].forEach((material) => material.dispose());
      plateTexture?.dispose();
      group.clear();
    },
  };
}
