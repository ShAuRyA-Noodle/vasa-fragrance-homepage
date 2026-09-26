import * as THREE from 'three';

// Kept separate from the GLSL so the visual direction and the scene-facing
// uniform contract are easy to inspect without reading a shader string.
export const WATER_PALETTE=Object.freeze({
 deep:'#182635',
 reflection:'#647282',
 horizon:'#314359',
 champagne:'#d8c4a0'
});

// A 256px tile of random values, sampled with hardware bilinear filtering, stands
// in for per-pixel hash noise: one texture read instead of four hashes.
let noiseTexture;
export function getNoiseTexture(){
 if(noiseTexture)return noiseTexture;
 const size=256,data=new Uint8Array(size*size*4);let seed=20931;
 for(let i=0;i<size*size;i++){seed=(seed*1664525+1013904223)>>>0;const v=seed>>>24;data[i*4]=v;data[i*4+1]=v;data[i*4+2]=v;data[i*4+3]=255;}
 noiseTexture=new THREE.DataTexture(data,size,size);noiseTexture.wrapS=noiseTexture.wrapT=THREE.RepeatWrapping;
 noiseTexture.magFilter=noiseTexture.minFilter=THREE.LinearFilter;noiseTexture.generateMipmaps=false;noiseTexture.needsUpdate=true;
 return noiseTexture;
}

export function createRippleSlots(){
 return Array.from({length:8},()=>new THREE.Vector4(0,0,-100,0));
}

export function createWaterUniforms(){
 return {
  presence:{value:1},
  horizonFog:{value:0},
  color:{value:new THREE.Color(WATER_PALETTE.deep)},
  deepColor:{value:new THREE.Color(WATER_PALETTE.deep)},
  reflectionTint:{value:new THREE.Color(WATER_PALETTE.reflection)},
  horizonTint:{value:new THREE.Color(WATER_PALETTE.horizon)},
  champagne:{value:new THREE.Color(WATER_PALETTE.champagne)},
  tDiffuse:{value:null},
  noiseTex:{value:getNoiseTexture()},
  textureMatrix:{value:null},
  time:{value:0},
  distortionScale:{value:.34},
  ripples:{value:createRippleSlots()}
 };
}
