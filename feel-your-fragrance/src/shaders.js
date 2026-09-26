export const atmosphereVertex=`varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`;
export const atmosphereFragment=`
 precision highp float;varying vec2 vUv;uniform float time;uniform vec3 tint;uniform float dream;
 // One weight per fragrance backdrop (collection view); all zero elsewhere.
 uniform vec4 scenery;
 // Quiz backdrops: x forest (woods), y resin (amber), z dawn (luminous), w silk (opulent).
 uniform vec4 scenery2;
 // >1 on narrow (portrait) views so repeating shapes like pines keep a sane size.
 uniform float narrow;
 float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
 float fbm(vec2 p){float n=0.,a=.5;for(int i=0;i<4;i++){n+=a*noise(p);p=p*2.07+vec2(5.3,1.7);a*=.5;}return n;}
 // The plane's visible window: the water horizon sits near uv.y .27.
 float horizonGlow(vec2 uv,float w){return exp(-pow((uv.y-.28)/w,2.));}
 // Silent Storm: slate storm clouds rolling over a cold sea, rare lightning behind them.
 vec3 storm(vec2 uv){
  vec2 p=uv*vec2(3.2,2.)+vec2(time*.018,0.);
  float c=fbm(p+fbm(p*1.7-vec2(time*.01,0.))*1.3);
  float c2=fbm(p*2.3+vec2(-time*.03,.4));
  vec3 col=mix(vec3(.018,.04,.045),vec3(.10,.18,.19),smoothstep(.35,.8,c));
  col+=vec3(.16,.26,.25)*smoothstep(.55,.85,c2)*smoothstep(.3,.8,uv.y)*.55;
  float strike=pow(max(sin(time*.43)*sin(time*1.13+1.),0.),18.);
  float bolt=exp(-pow((uv.x-.72-sin(time*.21)*.1)*3.,2.))*smoothstep(.35,.9,uv.y);
  col+=vec3(.55,.85,.8)*strike*(c*.6+bolt*.35);
  col+=vec3(.25,.55,.5)*horizonGlow(uv,.08)*.35;
  float rain=smoothstep(.985,1.,noise(vec2(uv.x*140.+uv.y*28.,uv.y*6.+time*3.)));
  return col+vec3(.3,.45,.45)*rain*.06;
 }
 // Sweetest Stranger: blush dusk with drifting soft bokeh blossoms.
 vec3 blossom(vec2 uv){
  vec3 col=mix(vec3(.19,.09,.12),vec3(.04,.02,.05),smoothstep(.25,.95,uv.y));
  col+=vec3(.55,.26,.26)*horizonGlow(uv,.12)*.6;
  col+=vec3(.2,.08,.12)*fbm(uv*vec2(2.,1.5)+vec2(time*.012,0.))*.5;
  for(int i=0;i<3;i++){
   float fi=float(i);vec2 g=uv*vec2(7.,4.4)*(1.+fi*.45)+vec2(time*(.05+fi*.02),-time*(.03+fi*.015))+fi*7.1;
   vec2 cell=floor(g),f=fract(g)-.5;float h=hash(cell+fi);
   vec2 o=vec2(hash(cell+3.1),hash(cell+7.7))-.5;float r=.07+.11*h;
   float d=length(f-o*.5);float disc=smoothstep(r,r*.5,d)*step(.72,h);
   col+=mix(vec3(1.,.66,.7),vec3(1.,.82,.72),hash(cell+1.3))*disc*(.035+.03*(1.-fi*.3));
  }
  return col;
 }
 // Rebel in Velvet: heavy velvet drapes swaying slowly, violet sheen on the folds.
 vec3 velvet(vec2 uv){
  float sway=fbm(vec2(uv.x*2.,uv.y*1.2+time*.03))*1.8;
  float fold=sin(uv.x*38.+sway*3.+sin(uv.y*3.+time*.2)*.6);
  float shade=.5+.5*fold;float sheen=pow(max(fold,0.),6.);
  vec3 col=mix(vec3(.03,.01,.045),vec3(.12,.045,.16),shade*.8);
  col+=vec3(.62,.44,.95)*sheen*.11*smoothstep(.2,.7,uv.y);
  col*=.65+.55*exp(-pow((uv.x-.5)*2.2,2.));
  return col+vec3(.3,.12,.35)*horizonGlow(uv,.1)*.3;
 }
 // The Night Lingers: incense smoke curling upward with amber embers.
 vec3 ember(vec2 uv){
  vec2 p=vec2(uv.x*3.,uv.y*2.-time*.05);
  float w=fbm(p+vec2(fbm(p*1.4+time*.02),0.)*1.6);
  float smoke=smoothstep(.45,.85,w)*smoothstep(.2,.55,uv.y)*(1.-smoothstep(.75,1.,uv.y));
  vec3 col=mix(vec3(.04,.022,.012),vec3(.012,.008,.01),smoothstep(.3,1.,uv.y));
  col+=vec3(.36,.24,.16)*smoke*.45;
  col+=vec3(1.,.52,.18)*horizonGlow(uv,.09)*.42;
  vec2 g=uv*vec2(26.,14.)+vec2(0.,-time*.35);vec2 cell=floor(g),f=fract(g)-.5;float h=hash(cell);
  float spark=smoothstep(.09,0.,length(f-(vec2(hash(cell+2.),hash(cell+5.))-.5)*.6))*step(.9,h);
  col+=vec3(1.,.62,.25)*spark*(.4+.6*sin(time*3.+h*20.))*smoothstep(.95,.3,uv.y);
  return col;
 }
 // Woods: layered cedar silhouettes in drifting mist, soft light between trunks.
 vec3 forest(vec2 uv){
  // Sky: deep green night lifting to a pale mist band at the horizon.
  vec3 col=mix(vec3(.13,.2,.18),vec3(.02,.04,.04),smoothstep(.3,.95,uv.y));
  col+=vec3(.4,.5,.42)*horizonGlow(uv,.2)*.4;
  // Three ridges of pines, far (high, pale) to near (low, dark): atmospheric perspective.
  for(int i=0;i<3;i++){
   float fi=float(i);float x=(uv.x-.5)*(9.+fi*6.)*narrow+fi*11.3;float cell=floor(x),f=fract(x)-.5;
   float h=hash(vec2(cell,fi));
   float peak=(.10+.09*h)*(1.-fi*.18);
   float cone=peak*(1.-abs(f)*2.)-.012*abs(fract(uv.y*(55.+fi*20.))-.5);
   float ridge=.5-fi*.075+cone;
   float m=smoothstep(ridge+.014-fi*.004,ridge-.006,uv.y);
   vec3 layer=mix(vec3(.1,.16,.14),vec3(.012,.025,.022),fi/2.);
   col=mix(col,layer,m);
   // Mist pooling between ridges.
   col+=vec3(.3,.38,.33)*smoothstep(.09,0.,abs(uv.y-(.47-fi*.075)))*(1.-m*.6)*.12*(1.+fbm(vec2(uv.x*4.+time*.03*(fi+1.),fi)));
  }
  float shaft=pow(max(sin(uv.x*7.+sin(time*.08)*.5),0.),30.)*smoothstep(.45,.95,uv.y);
  return col+vec3(.55,.6,.45)*shaft*.06;
 }
 // Amber: warm honey light moving through resin, slow liquid caustics.
 vec3 resin(vec2 uv){
  vec2 p=uv*vec2(4.,2.6);float c=0.;
  for(int i=0;i<2;i++){float fi=float(i);vec2 q=p*(1.+fi*.8)+vec2(time*.03,-time*.02)*(1.+fi);
   c+=pow(1.-abs(fbm(q+fbm(q*.7+time*.015))*2.-1.),6.)*(.6-fi*.25);}
  vec3 col=mix(vec3(.14,.07,.02),vec3(.03,.015,.008),smoothstep(.2,1.,uv.y));
  col+=vec3(.95,.62,.22)*c*.22;
  return col+vec3(1.,.7,.3)*horizonGlow(uv,.14)*.35;
 }
 // Luminous: pale dawn haze with airy light shafts.
 vec3 dawn(vec2 uv){
  // Luminous: warm champagne haze with soft falling light.
  vec3 col=mix(vec3(.44,.36,.22),vec3(.16,.13,.085),smoothstep(.2,1.,uv.y));
  float ray=uv.x+uv.y*.2+sin(time*.05)*.01;
  float beams=exp(-pow((ray-.3)*18.,2.))+exp(-pow((ray-.52)*26.,2.))*.7+exp(-pow((ray-.76)*16.,2.))*.5;
  col+=vec3(.8,.66,.42)*beams*(.3+.2*fbm(uv*4.+time*.02))*smoothstep(.15,.9,uv.y);
  col+=vec3(.3,.25,.16)*fbm(uv*vec2(2.5,1.5)+vec2(time*.01,0.))*.35;
  return col+vec3(.7,.58,.38)*horizonGlow(uv,.2)*.3;
 }
 // Opulent: deep burgundy-amber silk folds with a warm sheen.
 vec3 silk(vec2 uv){
  // Opulent: deep amber-burgundy silk, slow folds with a gold sheen.
  float sway=fbm(vec2(uv.x*1.6,uv.y+time*.025))*2.2;
  float fold=sin(uv.x*14.+uv.y*4.+sway*3.);
  vec3 col=mix(vec3(.07,.02,.015),vec3(.26,.09,.04),.5+.5*fold);
  col+=vec3(1.,.66,.34)*pow(max(fold,0.),8.)*.16;
  return col+vec3(.6,.28,.1)*horizonGlow(uv,.14)*.3;
 }
 void main(){vec2 uv=vUv;float n=noise(uv*6.+vec2(time*.013,0.));float halo=exp(-length((uv-vec2(.5,.40))*vec2(2.5,2.2))*2.);float ray=uv.x+uv.y*.12+sin(time*.045)*.008;float beam=exp(-pow((ray-.32)*24.,2.))+exp(-pow((ray-.56)*30.,2.))*.65+exp(-pow((ray-.79)*19.,2.))*.45;beam*=.65+n*.35;float cloud=noise(uv*3.+time*.006);vec3 base=tint*(.48+halo*.9+cloud*.2);base+=vec3(.14,.14,.11)*beam*(.08+dream*.55)*smoothstep(.1,1.,uv.y);base+=vec3(.027,.029,.028)*halo*(1.-dream);base*=mix(1.,1.65,dream);
  float total=scenery.x+scenery.y+scenery.z+scenery.w+scenery2.x+scenery2.y+scenery2.z+scenery2.w;
  if(total>.001){vec3 s=vec3(0.);
   if(scenery2.x>.001)s+=forest(uv)*scenery2.x;
   if(scenery2.y>.001)s+=resin(uv)*scenery2.y;
   if(scenery2.z>.001)s+=dawn(uv)*scenery2.z;
   if(scenery2.w>.001)s+=silk(uv)*scenery2.w;
   if(scenery.x>.001)s+=storm(uv)*scenery.x;
   if(scenery.y>.001)s+=blossom(uv)*scenery.y;
   if(scenery.z>.001)s+=velvet(uv)*scenery.z;
   if(scenery.w>.001)s+=ember(uv)*scenery.w;
   base=mix(base,s/max(total,1.),min(total,1.));}
  gl_FragColor=vec4(base,1.);}
`;
export const FinishShader={
 uniforms:{
  tDiffuse:{value:null},time:{value:0},grain:{value:.014},vignette:{value:.38},exposure:{value:.78},
  cursor:{value:null},velocity:{value:0},travel:{value:0},aspect:{value:1},
  ripples:{value:[]},rippleRadius:{value:.2},rippleStrength:{value:.2}
 },
 vertexShader:`varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}`,
 fragmentShader:`
 uniform sampler2D tDiffuse;
 uniform float time,grain,vignette,velocity,travel,aspect,rippleRadius,rippleStrength,exposure;
 uniform vec2 cursor;
 uniform vec4 ripples[12];
 varying vec2 vUv;
 float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
 float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1.,0.)),f.x),mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),f.x),f.y);}
 // Tone mapping and sRGB output live here (formerly a separate OutputPass),
 // saving one full-screen pass. ACES matches three's ACESFilmicToneMapping.
 vec3 rrtOdt(vec3 v){vec3 a=v*(v+.0245786)-.000090537;vec3 b=v*(.983729*v+.4329510)+.238081;return a/b;}
 vec3 aces(vec3 c){
  const mat3 inM=mat3(vec3(.59719,.07600,.02840),vec3(.35458,.90834,.13383),vec3(.04823,.01566,.83777));
  const mat3 outM=mat3(vec3(1.60475,-.10208,-.00327),vec3(-.53108,1.10813,-.07276),vec3(-.07367,-.00605,1.07602));
  c*=exposure/.6;c=inM*c;c=rrtOdt(c);c=outM*c;return clamp(c,0.,1.);
 }
 vec3 toSRGB(vec3 c){return mix(pow(c,vec3(1./2.4))*1.055-.055,c*12.92,vec3(lessThanEqual(c,vec3(.0031308))));}
 void main(){
  vec2 uv=vUv;
  // Cursor ripples live in the water shader only, so bottles and sky stay crisp.
  float transition=sin(clamp(travel,0.,1.)*3.14159)*.008;
  vec2 field=vec2(noise(uv*5.+time*.045),noise(uv*5.+vec2(7.1,-3.4)-time*.037))-.5;
  uv+=field*transition;
  vec3 col=toSRGB(aces(texture2D(tDiffuse,clamp(uv,.001,.999)).rgb));
  float edge=smoothstep(.16,.78,length((vUv-.5)*vec2(1.,.86)));
  col*=1.-edge*vignette;
  float g=hash(vUv*vec2(1700.,1100.)+mod(time,100.));
  col+=(g-.5)*grain;
  gl_FragColor=vec4(col,1.);
 }`
};
