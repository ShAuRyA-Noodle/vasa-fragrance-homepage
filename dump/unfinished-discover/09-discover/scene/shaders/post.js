// Final composite pass — film grain, vignette, chromatic aberration, warm lift.
export const FINAL_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

// Bright-pass: extracts highlights into a small target. Sampling that small
// target back at full res during composite gives a free bilinear blur —
// a cheap stand-in for a real multi-pass bloom blur chain.
export const BRIGHT_FRAGMENT = /* glsl */ `
  uniform sampler2D tDiffuse;
  uniform float threshold;
  varying vec2 vUv;
  void main(){
    vec3 col = texture2D(tDiffuse, vUv).rgb;
    float lum = dot(col, vec3(0.2126, 0.7152, 0.0722));
    float amt = smoothstep(threshold, threshold + 0.35, lum);
    gl_FragColor = vec4(col * amt, 1.0);
  }
`;

export const FINAL_FRAGMENT = /* glsl */ `
  uniform sampler2D tDiffuse;
  uniform sampler2D tGlow;
  uniform float glowAmt;
  uniform float time;
  uniform float grainAmt;
  uniform float vignetteAmt;
  uniform float caAmt;
  uniform vec3 warmLift;
  varying vec2 vUv;

  float rand(vec2 co){
    return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main(){
    vec2 uv = vUv;
    vec3 col;
    if (caAmt > 0.0001){
      vec2 dir = uv - 0.5;
      float d = length(dir);
      vec2 off = dir * d * caAmt;
      col.r = texture2D(tDiffuse, uv - off).r;
      col.g = texture2D(tDiffuse, uv).g;
      col.b = texture2D(tDiffuse, uv + off).b;
    } else {
      col = texture2D(tDiffuse, uv).rgb;
    }

    col += texture2D(tGlow, uv).rgb * glowAmt;
    col += warmLift * 0.02;

    float g = (rand(uv + fract(time * 60.0)) - 0.5) * grainAmt;
    col += g;

    float vig = smoothstep(0.98, 0.28, length(uv - 0.5));
    col *= mix(1.0 - vignetteAmt, 1.0, vig);

    gl_FragColor = vec4(col, 1.0);
  }
`;
