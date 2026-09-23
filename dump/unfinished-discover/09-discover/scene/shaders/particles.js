export const DUST_VERTEX = /* glsl */ `
  uniform float time;
  uniform vec3 mouseWorld;
  uniform float mouseActive;
  attribute float aSize;
  attribute float aPhase;
  attribute float aSpeed;
  attribute float aGold;
  varying float vGold;
  varying float vFade;

  void main(){
    vGold = aGold;
    vec3 pos = position;
    pos.x += sin(time * aSpeed + aPhase) * 0.35;
    pos.y += mod(time * aSpeed * 0.06 + aPhase, 2.6) - 1.3;
    pos.z += cos(time * aSpeed * 0.7 + aPhase) * 0.25;

    vec3 toMouse = pos - mouseWorld;
    float d = length(toMouse);
    float force = mouseActive * smoothstep(1.6, 0.0, d) * 0.6;
    pos += normalize(toMouse + 0.0001) * force;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    float depthFade = smoothstep(6.0, 1.2, -mvPosition.z);
    vFade = depthFade;
    gl_PointSize = aSize * (140.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;
  }
`;

export const DUST_FRAGMENT = /* glsl */ `
  uniform vec3 goldColor;
  uniform vec3 mistColor;
  varying float vGold;
  varying float vFade;

  void main(){
    vec2 c = gl_PointCoord - 0.5;
    float d = length(c);
    float alpha = smoothstep(0.5, 0.0, d);
    vec3 col = mix(mistColor, goldColor, vGold);
    gl_FragColor = vec4(col, alpha * 0.55 * vFade);
  }
`;
