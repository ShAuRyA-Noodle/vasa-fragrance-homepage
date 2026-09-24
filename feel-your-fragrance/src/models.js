import * as THREE from 'three';
const loader=new THREE.TextureLoader();
const textures=new Map();
export async function preloadIngredients(names){
 await Promise.all([...new Set(names)].map(async name=>{
  if(textures.has(name))return;
  const texture=await loader.loadAsync(`/ingredients/${name}.png`);
  texture.colorSpace=THREE.SRGBColorSpace; textures.set(name,texture);
 }));
}
function ingredientTexture(name){return textures.get(name);}
export function disposeIngredientTextures(){textures.forEach(texture=>texture.dispose());textures.clear();}
function seeded(seed){return ()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};}
const rand=seeded(7341);
export function createIngredient(name,scale=1){
 const t=ingredientTexture(name);
 const material=new THREE.ShaderMaterial({transparent:true,depthWrite:false,side:THREE.DoubleSide,
  uniforms:{image:{value:t},opacity:{value:1},focus:{value:0},tint:{value:new THREE.Color('#bcb8aa')}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`precision highp float;uniform sampler2D image;uniform float opacity,focus;uniform vec3 tint;varying vec2 vUv;
   void main(){vec2 d=vec2(.004)*focus;vec4 a=texture2D(image,vUv);vec4 b=texture2D(image,vUv+d);vec4 c=texture2D(image,vUv-d);vec4 tex=mix(a,(a+b+c)/3.,focus);if(tex.a<.018)discard;gl_FragColor=vec4(tex.rgb*tint,tex.a*opacity);}`
 });
 const mesh=new THREE.Mesh(new THREE.PlaneGeometry(1,1),material);mesh.scale.setScalar(scale);mesh.userData.ingredientMaterial=material;return mesh;
}
export function createPetals(){
 const g=new THREE.Group();const geo=new THREE.SphereGeometry(.16,14,10,0,Math.PI*1.6,0,Math.PI*.65);const mat=new THREE.MeshStandardMaterial({color:'#9d6972',roughness:.7,side:THREE.DoubleSide});
 for(let i=0;i<18;i++){const petal=new THREE.Mesh(geo,mat);petal.scale.set(1,.45,1.5);petal.position.set((rand()-.5)*13,rand()*8-1,rand()*6-4);petal.rotation.set(rand()*4,rand()*5,rand()*3);petal.userData.phase=rand()*6;g.add(petal);}return g;
}
