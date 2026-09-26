import * as THREE from 'three';
import {products} from './catalog.js';
const loader=new THREE.TextureLoader();
export async function loadProductPlates(){
 const textures=await Promise.all(products.map(async p=>{const t=await loader.loadAsync(`/plates/${p.id}.png`);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=16;return t;}));
 return textures;
}
// Photographic products stay front-facing in the 3D stage. The mild analytic
// relighting adds moving highlights; it is not a claim of recovered normal maps.
export function createProductPlate(product,texture){
 const root=new THREE.Group();root.name=product.id;
 const material=new THREE.ShaderMaterial({transparent:true,alphaTest:.06,depthWrite:true,side:THREE.DoubleSide,
  uniforms:{image:{value:texture},light:{value:new THREE.Vector2()},time:{value:0},brightness:{value:.68}},
  vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
  fragmentShader:`precision highp float;uniform sampler2D image;uniform vec2 light;uniform float time;uniform float brightness;varying vec2 vUv;
  void main(){vec4 tex=texture2D(image,vUv,-.5);if(tex.a<.06)discard;
  vec2 uv=vUv;vec3 normal=normalize(vec3((uv.x-.5)*2.2,(uv.y-.48)*.2,1.));vec3 L=normalize(vec3(light.x*.5-.5,light.y*.3+.5,1.));
  float facing=max(dot(normal,L),0.);float lum=dot(tex.rgb,vec3(.2126,.7152,.0722));float edge=smoothstep(.18,.30,abs(uv.x-.5));float gloss=pow(facing,28.)*edge*.10;
  // The source is a photographic plate. This is deliberately restrained
  // relighting, rather than an attempt to infer a normal map from the image.
  vec3 col=tex.rgb*(brightness+facing*.11)+vec3(.82,.75,.59)*gloss*smoothstep(.22,.75,lum);
  gl_FragColor=vec4(col,tex.a);
  #include <tonemapping_fragment>
  #include <colorspace_fragment>
  }`});
 const geometry=new THREE.PlaneGeometry(2.8,3.5);
 // This center matches the transparent plate padding, placing the pictured
 // bottle foot on the water instead of suspending it above the floor.
 const mesh=new THREE.Mesh(geometry,material);mesh.position.y=1.58;root.add(mesh);
 root.userData.plate=mesh;return root;
}
