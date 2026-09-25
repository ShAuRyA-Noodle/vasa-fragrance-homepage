export const atmosphereVertex=`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const atmosphereFragment=`
 precision highp float;varying vec2 vUv;uniform float time;uniform vec3 tint;uniform float dream;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 void main(){vec2 uv=vUv;float n=noise(uv*6.+vec2(time*.013,0.));float halo=exp(-length((uv-vec2(.5,.40))*vec2(2.5,2.2))*2.);float ray=uv.x+uv.y*.12+sin(time*.045)*.008;float beam=exp(-pow((ray-.32)*24.,2.))+exp(-pow((ray-.56)*30.,2.))*.65+exp(-pow((ray-.79)*19.,2.))*.45;beam*=.65+n*.35;float cloud=noise(uv*3.+time*.006);vec3 base=tint*(.48+halo*.9+cloud*.2);base+=vec3(.14,.14,.11)*beam*(.08+dream*.55)*smoothstep(.1,1.,uv.y);base+=vec3(.027,.029,.028)*halo*(1.-dream);base*=mix(1.,1.65,dream);gl_FragColor=vec4(base,1.);}
`;
export const FinishShader={
 uniforms:{
  tDiffuse:{value:null},time:{value:0},grain:{value:.014},vignette:{value:.38},
  cursor:{value:null},velocity:{value:0},travel:{value:0},aspect:{value:1},
  ripples:{value:[]},rippleRadius:{value:.2},rippleStrength:{value:.2}
 },
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`
 uniform sampler2D tDiffuse;
 uniform float time,grain,vignette,velocity,travel,aspect,rippleRadius,rippleStrength;
 uniform vec2 cursor;
 uniform vec4 ripples[12];
 varying vec2 vUv;
 float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
 void main(){
  vec2 uv=vUv;
  vec2 warp=vec2(0.);
  // Screen-space waves distort the complete rendered scene, including bottles,
  // reflections and atmospheric particles. The HTML controls remain sharp.
  for(int i=0;i<12;i++){
   float age=time-ripples[i].z;
   if(age>0.&&age<1.6){
    vec2 delta=(vUv-ripples[i].xy)*vec2(aspect,1.);
    float distanceToPointer=length(delta);
    float front=age*.11;
    float envelope=exp(-pow((distanceToPointer-front)/(rippleRadius*.52),2.))*exp(-age*2.3);
    float rings=cos((distanceToPointer-front)/rippleRadius*25.13274);
    float wave=rings*envelope*ripples[i].w;
    vec2 direction=delta/max(distanceToPointer,.0001);
    warp+=(direction+vec2(-direction.y,direction.x)*.15)*wave*rippleStrength*.014;
   }
  }
  uv+=warp/vec2(aspect,1.);
  vec2 delta=(uv-cursor)*vec2(aspect,1.);
  float cursorWake=exp(-dot(delta,delta)*1050.)*velocity;
  uv+=delta*cursorWake*.0024;
  float transition=sin(clamp(travel,0.,1.)*3.14159)*.008;
  vec2 field=vec2(noise(uv*5.+time*.045),noise(uv*5.+vec2(7.1,-3.4)-time*.037))-.5;
  uv+=field*transition;
  vec3 col=texture2D(tDiffuse,clamp(uv,.001,.999)).rgb;
  float edge=smoothstep(.16,.78,length((vUv-.5)*vec2(1.,.86)));
  col*=1.-edge*vignette;
  float g=hash(vUv*vec2(1700.,1100.)+mod(time,100.));
  col+=(g-.5)*grain;
  gl_FragColor=vec4(col,1.);
 }`
};
