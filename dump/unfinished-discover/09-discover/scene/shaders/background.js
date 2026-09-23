import { NOISE_GLSL } from './noise.js';

export const BG_VERTEX = /* glsl */ `
  varying vec2 vUv;
  void main(){
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

export const BG_FRAGMENT = /* glsl */ `
  uniform vec3 bgColor;
  uniform vec3 fogColor;
  uniform vec3 lightColor;
  uniform float smokeAmt;
  uniform float shaftAmt;
  uniform float warmth;
  uniform float time;
  uniform vec2 resolution;
  uniform sampler2D trail;
  uniform float grainSeed;
  varying vec2 vUv;

  ${NOISE_GLSL}

  void main(){
    vec2 uv = vUv;
    vec2 p = (uv - 0.5) * vec2(resolution.x / max(resolution.y, 1.0), 1.0) + 0.5;

    vec2 q = vec2(fbm(p * 2.2 + time * 0.018), fbm(p * 2.2 + vec2(5.2, 1.3) - time * 0.014));
    vec2 r = vec2(
      fbm(p * 2.2 + 1.4 * q + vec2(1.7, 9.2) + time * 0.011),
      fbm(p * 2.2 + 1.4 * q + vec2(8.3, 2.8) - time * 0.009)
    );
    float smoke = fbm(p * 1.6 + r * 1.2);

    vec2 src = vec2(0.5, 1.22);
    vec2 toSrc = uv - src;
    float ang = atan(toSrc.x, toSrc.y);
    float rayNoise = fbm(vec2(ang * 3.2, time * 0.05));
    float rays = sin(ang * 26.0 + rayNoise * 5.0) * 0.5 + 0.5;
    rays *= sin(ang * 6.0 - time * 0.04) * 0.5 + 0.5;
    float distFall = smoothstep(0.85, 0.08, length(toSrc * vec2(1.0, 0.55)));
    float heightFall = smoothstep(-0.35, 0.95, uv.y);
    rays *= distFall * heightFall;

    float trailMask = texture2D(trail, uv).r;
    float smokeF = clamp(smoke * smokeAmt, 0.0, 1.0);
    smokeF *= (1.0 - trailMask * 0.55);
    rays *= (1.0 - trailMask * 0.3);

    vec3 col = mix(bgColor, fogColor, smokeF);
    col = mix(col, lightColor, rays * shaftAmt * 0.32);
    col += lightColor * warmth * 0.025 * (1.0 - uv.y);
    col += lightColor * rays * shaftAmt * 0.05;

    float vig = smoothstep(1.1, 0.2, length(uv - 0.5));
    col *= mix(0.6, 1.0, vig);

    float grain = (hash21(uv * resolution.xy + grainSeed) - 0.5) * 0.02;
    col += grain;

    gl_FragColor = vec4(col, 1.0);
  }
`;

export const TRAIL_VERTEX = BG_VERTEX;

export const TRAIL_FRAGMENT = /* glsl */ `
  uniform sampler2D prevTrail;
  uniform vec2 mouseUv;
  uniform float decay;
  uniform float radius;
  uniform float strength;
  varying vec2 vUv;

  void main(){
    vec3 prev = texture2D(prevTrail, vUv).rgb * decay;
    float d = distance(vUv, mouseUv);
    float add = smoothstep(radius, 0.0, d) * strength;
    vec3 col = clamp(prev + vec3(add), 0.0, 1.0);
    gl_FragColor = vec4(col, 1.0);
  }
`;
