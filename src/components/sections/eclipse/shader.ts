/**
 * Eclipse shader — one full-screen quad, one responsibility: render the sun,
 * its corona and the moon the visitor drags across it.
 * Units: everything is measured in sun radii around `uCenter`.
 */
export const vertexShader = /* glsl */ `
  void main() {
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

export const fragmentShader = /* glsl */ `
  precision highp float;

  uniform vec2 uRes;      // drawing-buffer size in px
  uniform vec2 uCenter;   // sun centre in px
  uniform float uRadius;  // sun radius in px
  uniform float uTime;
  uniform vec2 uMoon;     // moon centre, in sun radii
  uniform float uCover;   // 0..1 obscuration of the photosphere
  uniform float uTotal;   // 0..1 eased totality

  float hash(vec2 p) {
    p = fract(p * vec2(123.34, 456.21));
    p += dot(p, p + 45.32);
    return fract(p.x * p.y);
  }
  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    for (int i = 0; i < 5; i++) {
      v += a * noise(p);
      p = p * 2.03 + 17.1;
      a *= 0.5;
    }
    return v;
  }

  void main() {
    vec2 p = (gl_FragCoord.xy - uCenter) / uRadius;
    float r = length(p);
    float ang = atan(p.y, p.x);
    vec2 dir = vec2(cos(ang), sin(ang));
    float t = uTime;
    float px = 1.5 / uRadius;

    // photosphere with limb darkening and a breath of granulation
    float disc = 1.0 - smoothstep(1.0 - px, 1.0 + px, r);
    float mu = sqrt(max(1.0 - r * r, 0.0));
    float limb = 0.42 + 0.58 * pow(mu, 0.55);
    float gran = 0.94 + 0.06 * noise(p * 38.0 + t * 0.3);
    vec3 sun = vec3(1.0, 0.975, 0.94) * limb * gran * disc;

    // corona: slow streamers + fine filaments, brighter along the equator
    float h = max(r - 1.0, 0.0);
    float streamers = fbm(dir * 2.2 + vec2(h * 0.9 - t * 0.02, t * 0.015));
    float filaments = pow(noise(dir * 36.0 + vec2(0.0, t * 0.05)), 4.0);
    float corona = exp(-h * 2.6) * (0.25 + 1.25 * streamers * streamers) + exp(-h * 10.0) * 0.9 + filaments * exp(-h * 1.8) * 0.9;
    corona *= smoothstep(0.985, 1.03, r) * (0.75 + 0.35 * abs(cos(ang)));

    // chromosphere: a hairline ring only seen at totality
    float chromo = exp(-abs(r - 1.012) * 220.0) * uTotal;

    // the moon
    float moon = 1.0 - smoothstep(1.04 - px, 1.04 + px, length(p - uMoon));

    // glare from whatever photosphere is still uncovered
    float vis = 1.0 - uCover;
    float glare = vis * (exp(-h * 1.1) * 0.85 + exp(-r * 0.35) * 0.18);

    vec3 col = sun;
    col += vec3(0.96, 0.95, 0.93) * glare;
    col += vec3(0.86, 0.9, 1.0) * corona * (0.06 + 1.55 * uTotal);
    col += vec3(1.0, 0.93, 0.9) * chromo * 0.8;

    // diamond ring and Baily's beads in the last instants before totality
    float near = smoothstep(0.9, 0.992, uCover) * (1.0 - uTotal);
    vec2 limbPt = length(uMoon) > 0.0001 ? -normalize(uMoon) : vec2(1.0, 0.0);
    float dl = length(p - limbPt);
    float beads = smoothstep(0.55, 0.85, noise(vec2(ang * 24.0, 3.1)));
    float rimBand = exp(-abs(r - 1.0) * 90.0) * smoothstep(0.35, 0.0, dl) * beads;
    col += vec3(1.0) * near * (exp(-dl * 22.0) * 3.0 + exp(-dl * 4.0) * 0.7 + rimBand * 1.6);

    // the moon sits in front of everything
    col *= 1.0 - moon;
    col += vec3(0.010, 0.010, 0.011) * moon;

    // tone map, vignette, film grain
    col = 1.0 - exp(-col * 1.35);
    vec2 q = gl_FragCoord.xy / uRes;
    float vig = smoothstep(1.25, 0.25, length((q - 0.5) * vec2(uRes.x / uRes.y, 1.0)));
    col *= mix(0.55, 1.0, vig);
    col += (hash(gl_FragCoord.xy + fract(t) * 91.7) - 0.5) * 0.035;

    gl_FragColor = vec4(col, 1.0);
  }
`;

/** Area of the sun (radius R) covered by the moon (radius r) at centre distance d, as a fraction. */
export function obscuration(d: number, R = 1, r = 1.04) {
  if (d >= R + r) return 0;
  if (d <= r - R) return 1;
  const a = r * r * Math.acos((d * d + r * r - R * R) / (2 * d * r));
  const b = R * R * Math.acos((d * d + R * R - r * r) / (2 * d * R));
  const c = 0.5 * Math.sqrt((-d + r + R) * (d + r - R) * (d - r + R) * (d + r + R));
  return Math.min(1, Math.max(0, (a + b - c) / (Math.PI * R * R)));
}

export const MOON_R = 1.04;
