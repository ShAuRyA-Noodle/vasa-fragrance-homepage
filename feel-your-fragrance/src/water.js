import * as THREE from 'three';
import {Reflector} from 'three/addons/objects/Reflector.js';
import {createWaterUniforms} from './water-surface.js';

export function makeWater(){
 const shader={
 uniforms:createWaterUniforms(),
 vertexShader:`uniform mat4 textureMatrix;varying vec4 vMirror;varying vec3 vWorld;void main(){vMirror=textureMatrix*vec4(position,1.);vWorld=(modelMatrix*vec4(position,1.)).xyz;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`
 precision highp float;
 uniform sampler2D tDiffuse;uniform float time;uniform float presence;uniform float distortionScale;uniform vec3 deepColor;uniform vec3 reflectionTint;uniform vec3 horizonTint;uniform vec3 champagne;uniform vec4 ripples[8];varying vec4 vMirror;varying vec3 vWorld;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);}
 float fbm(vec2 p){float n=0.,a=.5;for(int i=0;i<4;i++){n+=a*noise(p);p=p*2.03+vec2(17.13,9.21);a*=.5;}return n;}
 float swell(vec2 p){
  vec2 warp=vec2(fbm(p*.18+vec2(time*.018,-time*.011)),fbm(p*.18+vec2(8.4,-3.7)))-.5;
  p+=warp*2.4;
  float h=sin(dot(p,normalize(vec2(.84,.54)))*.55+time*.22+warp.x*2.1)*.026;
  h+=sin(dot(p,normalize(vec2(-.41,.91)))*.91-time*.17+warp.y*2.4)*.014;
  h+=sin(dot(p,normalize(vec2(.16,-.99)))*1.58+time*.12+warp.x*3.2)*.006;
  return h+(fbm(p*.57+time*.025)-.5)*.016;
 }
 float pointerWake(vec2 p){
  float h=0.;
  for(int i=0;i<8;i++){
   float age=time-ripples[i].z;
   if(age>0.&&age<3.4){
    float d=length(p-ripples[i].xy),front=age*1.52;
    float ring=exp(-pow((d-front)*2.25,2.))*exp(-age*1.18);
    float inner=exp(-d*d*2.6)*exp(-age*2.7);
    h+=(sin((d-front)*13.5-age*2.1)*ring*.026+inner*.008)*ripples[i].w;
   }
  }
  return h;
 }
 float height(vec2 p){return swell(p)+pointerWake(p);}
 void main(){
  vec2 p=vWorld.xz;float h=height(p);float hx=height(p+vec2(.085,0.))-h;float hy=height(p+vec2(0.,.085))-h;
  vec3 normal=normalize(vec3(-hx*5.4,1.,-hy*5.4));vec3 eye=normalize(cameraPosition-vWorld);float facing=max(dot(normal,eye),0.);float fresnel=.025+.975*pow(1.-facing,5.);
  float distanceToEye=length(cameraPosition-vWorld);vec2 uv=vMirror.xy/vMirror.w;vec2 distortion=normal.xz*(.0012+1./max(distanceToEye,1.))*distortionScale;uv=clamp(uv+distortion,.002,.998);
  vec3 reflected=texture2D(tDiffuse,uv).rgb;vec3 ref=mix(reflected,reflectionTint,.2);
  vec3 col=mix(deepColor,ref,.42+fresnel*.49);
  vec3 key=normalize(vec3(-.42,.79,-.45));float glint=pow(max(dot(reflect(-key,normal),eye),0.),82.);col+=champagne*glint*.16;
  float textureBreak=fbm(p*.36+vec2(time*.012,-time*.009));col+=reflectionTint*(textureBreak-.5)*.035;
  // Long, broken highlights give the plane a reflective liquid surface rather
  // than an evenly lit floor. They drift slowly and never cover bottle labels.
  float ribbon=exp(-pow((p.y-3.2-sin(p.x*.23+time*.12)*.34)*.9,2.));
  float glimmer=pow(max(sin(p.y*.89+p.x*.26-time*.2+textureBreak*1.8),0.),25.);
  float breakup=.35+.65*fbm(p*1.2+vec2(time*.025,-time*.018));
  col+=champagne*(ribbon*.048+glimmer*breakup*.095)*(1.-smoothstep(12.,38.,length(p)));
  float sheen=exp(-pow((p.x+1.4+sin(p.y*.15+time*.08)*.7)*.14,2.))*exp(-pow((p.y-3.)*.12,2.));
  col+=reflectionTint*sheen*.068;
  float haze=smoothstep(7.,48.,length(p));col=mix(col,horizonTint,haze*.42);
  gl_FragColor=vec4(col,presence);
 }`};
 // The water's procedural breakup softens this reflection substantially. A
 // 512px single-sample target retains that look while avoiding a second
 // high-resolution multisampled scene render every frame.
 const water=new Reflector(new THREE.PlaneGeometry(160,160),{textureWidth:512,textureHeight:512,clipBias:.004,shader,multisample:0});water.material.transparent=true;water.rotation.x=-Math.PI/2;water.position.y=-.015;return water;
}
