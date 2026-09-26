import * as THREE from 'three';

// Photographic quiz backdrops (one per fragrance family), shown as a camera-facing
// layer with depth-map parallax. Order matches `families` in catalog.js.
const FAMILIES = ['woods', 'flowers', 'amber', 'oud'];
const IMAGE_ASPECT = 1920 / 1008;
const loader = new THREE.TextureLoader();

async function load(url, colorSpace) {
  const texture = await loader.loadAsync(url);
  texture.colorSpace = colorSpace;
  texture.wrapS = texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.minFilter = THREE.LinearMipmapLinearFilter;
  return texture;
}

export async function createQuizBackdrop(camera) {
  const [images, depths] = await Promise.all([
    Promise.all(FAMILIES.map(f => load(`/fyf/quiz/${f}.webp`, THREE.SRGBColorSpace))),
    Promise.all(FAMILIES.map(f => load(`/fyf/quiz/${f}-depth.webp`, THREE.NoColorSpace))),
  ]);
  images.forEach(t => { t.anisotropy = 8; });
  const material = new THREE.ShaderMaterial({
    transparent: true, depthTest: false, depthWrite: false, toneMapped: false,
    uniforms: {
      image0: {value: images[0]}, image1: {value: images[1]}, image2: {value: images[2]}, image3: {value: images[3]},
      depth0: {value: depths[0]}, depth1: {value: depths[1]}, depth2: {value: depths[2]}, depth3: {value: depths[3]},
      weights: {value: new THREE.Vector4()},
      opacity: {value: 0},
      // 0 = sharp scene (step 02), 1 = soft defocused colour field (step 01).
      blur: {value: 0},
      pointer: {value: new THREE.Vector2()},
      time: {value: 0},
      aspect: {value: 1},
    },
    vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
    fragmentShader: `
      precision highp float;
      uniform sampler2D image0,image1,image2,image3,depth0,depth1,depth2,depth3;
      uniform vec4 weights;uniform float opacity,blur,time,aspect;uniform vec2 pointer;
      varying vec2 vUv;
      float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
      float noise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+1.),f.x),f.y);}
      // Cover-fit the plate to the screen, with headroom for parallax. An inactive
      // plate sits slightly zoomed in, so the incoming one settles as it fades up.
      vec2 cover(vec2 uv,float w){
        vec2 s=aspect>${IMAGE_ASPECT.toFixed(4)}?vec2(1.,${IMAGE_ASPECT.toFixed(4)}/aspect):vec2(aspect/${IMAGE_ASPECT.toFixed(4)},1.);
        float zoom=1.07+(1.-w)*.05+sin(time*.05)*.008;
        return (uv-.5)*s/zoom+.5;
      }
      vec3 plate(sampler2D image,sampler2D depth,float w){
        vec2 uv=cover(vUv,w);
        // Two-step parallax: nearer layers (depth -> 1) travel further with the pointer.
        vec2 shift=pointer*vec2(.018,.012);
        float d=texture2D(depth,uv).r;
        d=texture2D(depth,uv+shift*(d-.3)).r;
        uv+=shift*(d-.3);
        // Far layers (mist, smoke, haze) drift slowly; near objects stay crisp.
        float far=1.-smoothstep(.15,.55,d);
        vec2 flow=vec2(noise(uv*vec2(4.,3.)+vec2(time*.05,0.)),noise(uv*vec2(4.,3.)+vec2(3.7,-time*.04)))-.5;
        uv+=flow*.006*far*(1.-blur);
        if(blur<.01)return texture2D(image,clamp(uv,.001,.999)).rgb;
        // Smooth lens defocus: a 8-tap golden-angle disc over a pre-blurred mip level
        // (a plain mip bias alone turns blocky).
        vec3 acc=vec3(0.);float r=blur*.045;
        for(int i=0;i<8;i++){float fi=float(i)+.5;float a=fi*2.39996;vec2 o=vec2(cos(a),sin(a))*sqrt(fi/8.)*r*vec2(1.,aspect);
          acc+=texture2D(image,clamp(uv+o,.001,.999),blur*3.2).rgb;}
        return acc/8.;
      }
      void main(){
        vec3 col=vec3(0.);float total=0.;
        if(weights.x>.001){col+=plate(image0,depth0,weights.x)*weights.x;total+=weights.x;}
        if(weights.y>.001){col+=plate(image1,depth1,weights.y)*weights.y;total+=weights.y;}
        if(weights.z>.001){col+=plate(image2,depth2,weights.z)*weights.z;total+=weights.z;}
        if(weights.w>.001){col+=plate(image3,depth3,weights.w)*weights.w;total+=weights.w;}
        col/=max(total,.001);
        // The defocused field is dimmed slightly so the slider UI reads cleanly on it.
        col*=1.-blur*.18;
        gl_FragColor=vec4(col,opacity);
        #include <colorspace_fragment>
      }`,
  });
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), material);
  mesh.renderOrder = -10;
  mesh.frustumCulled = false;
  const distance = 30;
  mesh.position.z = -distance;
  camera.add(mesh);
  const resize = aspect => {
    const height = 2 * Math.tan(THREE.MathUtils.degToRad(camera.fov / 2)) * distance;
    mesh.scale.set(height * aspect * 1.02, height * 1.02, 1);
    material.uniforms.aspect.value = aspect;
  };
  const dispose = () => {
    [...images, ...depths].forEach(t => t.dispose());
    mesh.geometry.dispose();
    material.dispose();
  };
  return {mesh, material, uniforms: material.uniforms, resize, dispose};
}
