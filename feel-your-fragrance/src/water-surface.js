import * as THREE from 'three';

// Kept separate from the GLSL so the visual direction and the scene-facing
// uniform contract are easy to inspect without reading a shader string.
export const WATER_PALETTE=Object.freeze({
 deep:'#1a2736',
 reflection:'#4a5663',
 horizon:'#2e3c4c',
 champagne:'#bfae84'
});

export function createRippleSlots(){
 return Array.from({length:8},()=>new THREE.Vector4(0,0,-100,0));
}

export function createWaterUniforms(){
 return {
  presence:{value:1},
  color:{value:new THREE.Color(WATER_PALETTE.deep)},
  deepColor:{value:new THREE.Color(WATER_PALETTE.deep)},
  reflectionTint:{value:new THREE.Color(WATER_PALETTE.reflection)},
  horizonTint:{value:new THREE.Color(WATER_PALETTE.horizon)},
  champagne:{value:new THREE.Color(WATER_PALETTE.champagne)},
  tDiffuse:{value:null},
  textureMatrix:{value:null},
  time:{value:0},
  distortionScale:{value:.34},
  ripples:{value:createRippleSlots()}
 };
}
