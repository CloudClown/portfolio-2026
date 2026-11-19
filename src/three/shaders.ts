/**
 * Custom GLSL Shaders for "RETRO COMPUTING SOUL"
 *
 * 1. Vector World Grid Floor — anti-aliased fwidth grid fading into fog,
 *    in the style of old vector flight-sims.
 * 2. Phosphor CRT Screen — the monitor glass: animated terminal lines,
 *    blinking cursor, boot readout, react-free (uniform-driven).
 * 3. CRT Post Effect — the intentional retro layer applied on TOP of a
 *    full-resolution render: slight barrel distortion, fine scanline mask,
 *    soft phosphor lift, subtle flicker + ghosting, chromatic fringing near
 *    the edges, vignette, and the "pass through the glass" flash.
 * 4. Hazard stripes (kept for desk props).
 *
 * LEGIBILITY RULE: this effect is a seasoning layer, never a filter that
 * destroys text. Scanline depth, flicker and aberration are all subtle.
 */

export const noise = /* glsl */ `
float hash11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}

float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

float noise2(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  float a = hash12(i);
  float b = hash12(i + vec2(1.0, 0.0));
  float c = hash12(i + vec2(0.0, 1.0));
  float d = hash12(i + vec2(1.0, 1.0));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
`

/* -------------------------------------------------------------------------- */
/*  01: VECTOR WORLD GRID FLOOR                                               */
/* -------------------------------------------------------------------------- */

export const vectorGridVertex = /* glsl */ `
varying vec3 vWorldPos;

void main() {
  vec4 world = modelMatrix * vec4(position, 1.0);
  vWorldPos = world.xyz;
  gl_Position = projectionMatrix * viewMatrix * world;
}
`

export const vectorGridFragment = /* glsl */ `
uniform vec3 uColorBase;
uniform vec3 uColorGrid;
uniform vec3 uColorCaution;
uniform vec3 uCamPos;
uniform float uFogDensity;

varying vec3 vWorldPos;

void main() {
  vec2 p = vWorldPos.xz;

  // Fine 0.5m grid
  vec2 fGrid = abs(fract(p * 1.0 - 0.5) - 0.5) / fwidth(p * 1.0);
  float fine = 1.0 - min(min(fGrid.x, fGrid.y), 1.0);

  // Major 2m grid
  vec2 mGrid = abs(fract(p * 0.25 - 0.5) - 0.5) / fwidth(p * 0.25);
  float major = 1.0 - min(min(mGrid.x, mGrid.y), 1.0);

  vec3 col = uColorBase;
  col = mix(col, uColorGrid, fine * 0.16);
  col = mix(col, uColorGrid, major * 0.38);

  // Caution-yellow spine along the flight axis (x = 0), dashed
  float spine = 1.0 - min(abs(vWorldPos.x) / fwidth(vWorldPos.x), 1.0);
  float dash = step(0.5, fract(vWorldPos.z * 0.12));
  col = mix(col, uColorCaution, spine * dash * 0.5);

  // Fog: exponential fade toward the camera distance, hides the horizon seam
  float dist = length(vWorldPos - uCamPos);
  float fog = 1.0 - exp(-uFogDensity * uFogDensity * dist * dist);
  col = mix(col, uColorBase, clamp(fog, 0.0, 1.0));

  gl_FragColor = vec4(col, 1.0);
}
`

/* -------------------------------------------------------------------------- */
/*  02: PHOSPHOR CRT SCREEN (the monitor glass)                               */
/* -------------------------------------------------------------------------- */

export const crtScreenVertex = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const crtScreenFragment = /* glsl */ `
uniform float uTime;
uniform float uBoot;      // 0..1 boot sequence progress
uniform float uEnd;       // 1.0 => BUILD SUCCESSFUL readout
uniform float uFlash;     // pass-through flash
uniform vec3 uBg;
uniform vec3 uFg;
uniform vec3 uCaution;

varying vec2 vUv;

${noise}

// A chunky "text block" line: simulates a row of monospace characters
float textLine(vec2 uv, float seed, float indent, float width) {
  if (uv.y < 0.0 || uv.y > 1.0) return 0.0;
  if (uv.x < indent || uv.x > indent + width) return 0.0;
  // Character cells
  float cells = 42.0;
  float cell = floor(uv.x * cells + seed * 7.0);
  float on = step(0.32, hash11(cell + seed * 31.7));
  // Glyph block inside the cell
  vec2 g = fract(vec2(uv.x * cells, uv.y * 2.0));
  float glyph = step(0.2, g.x) * step(g.x, 0.8) * step(0.25, g.y);
  return on * glyph;
}

void main() {
  vec2 uv = vUv;
  vec3 col = uBg;

  // Soft phosphor centre glow
  float glow = exp(-dot(uv - 0.5, uv - 0.5) * 3.0);
  col += uCaution * glow * 0.05;

  // ---- Boot rows (BIOS style), revealed by uBoot ----
  float rows = 14.0;
  float rowIdx = floor((1.0 - uv.y) * rows);
  float rowReveal = clamp(uBoot * rows * 1.35 - rowIdx, 0.0, 1.0);

  float seed = hash11(rowIdx * 17.31);
  float indent = 0.08 + step(0.5, hash11(rowIdx * 3.1)) * 0.05;
  float width = 0.18 + seed * 0.55;
  // Caution keyword on some rows
  vec3 lineCol = (seed > 0.62) ? uCaution : uFg;

  float line = textLine(vec2(uv.x, fract(uv.y * rows)), rowIdx, indent, width);
  line *= rowReveal;

  // ---- Terminal cursor blink ----
  float blink = step(0.5, fract(uTime * 1.6));
  float cursorRow = abs(uv.y - 0.16) < 0.028 && uv.x > 0.08 && uv.x < 0.105 ? 1.0 : 0.0;
  col = mix(col, uCaution, cursorRow * blink);

  // ---- Big readout: 99% stall / 100% end ----
  // Chunky seven-segment-ish block digits centred lower third
  if (uEnd > 0.5) {
    vec2 buv = vec2((uv.x - 0.5) / 0.34 + 0.5, (uv.y - 0.42) / 0.16 + 0.5);
    if (buv.x > 0.0 && buv.x < 1.0 && buv.y > 0.0 && buv.y < 1.0) {
      float cells = 9.0;
      float cell = floor(buv.x * cells);
      float on = step(0.25, hash11(cell + 91.3));
      vec2 g = fract(vec2(buv.x * cells, buv.y * 2.0));
      float glyph = step(0.18, g.x) * step(g.x, 0.82) * step(0.2, g.y);
      col = mix(col, uCaution, glyph * on * 0.9);
    }
  } else {
    // Stall marker: one solid caution block (the 99 counter) pulsing
    float pulse = 0.75 + 0.25 * sin(uTime * 2.4);
    vec2 buv = vec2((uv.x - 0.5) / 0.22 + 0.5, (uv.y - 0.4) / 0.13 + 0.5);
    if (buv.x > 0.0 && buv.x < 1.0 && buv.y > 0.0 && buv.y < 1.0) {
      vec2 g = abs(fract(buv * vec2(7.0, 2.0)) - 0.5);
      float block = step(max(g.x, g.y), 0.34);
      col = mix(col, uCaution * pulse, block * 0.55);
    }
  }

  col = mix(col, lineCol, line * 0.85);

  // Fine scanlines ON THE GLASS (screen-space, legible)
  col *= 0.93 + 0.07 * sin(uv.y * 420.0);

  // Tube edge falloff
  vec2 c = uv - 0.5;
  float vig = smoothstep(0.78, 0.25, length(c));
  col *= mix(0.55, 1.0, vig);

  // Pass-through flash (camera crossing the glass)
  col += vec3(1.0, 0.92, 0.55) * uFlash * 1.6;

  gl_FragColor = vec4(col, 1.0);
}
`

/* -------------------------------------------------------------------------- */
/*  03: CRT POST EFFECT (postprocessing Effect convention)                    */
/* -------------------------------------------------------------------------- */

export const crtPostFragment = /* glsl */ `
uniform float uTime;
uniform float uDive;         // glass pass-through flash, 0..1
uniform float uCurvature;    // barrel distortion amount
uniform float uAberration;   // chromatic fringing strength
uniform float uScanDepth;    // scanline contrast
uniform float uFlicker;      // flicker amplitude

void mainImage(const in vec4 inputColor, const in vec2 uv, out vec4 outputColor) {
  vec2 c = uv - 0.5;
  float r2 = dot(c, c);

  // Slight barrel distortion on the glass
  vec2 duv = uv + c * r2 * uCurvature;

  // Chromatic fringing, stronger near the edges
  float edge = smoothstep(0.12, 0.48, length(c));
  vec2 dir = (length(c) > 1e-5) ? c / length(c) : vec2(0.0);
  float ab = uAberration * (0.4 + edge * 1.6);
  float rC = texture2D(inputBuffer, duv + dir * ab).r;
  float gC = texture2D(inputBuffer, duv).g;
  float bC = texture2D(inputBuffer, duv - dir * ab).b;
  vec3 col = vec3(rC, gC, bC);

  // Phosphor persistence / ghosting: faint vertical trail
  vec3 ghost = texture2D(inputBuffer, duv - vec2(0.0, 0.0035)).rgb;
  col = mix(col, ghost, 0.16);

  // Fine scanline mask (on the distorted uv so it bends with the glass)
  float scan = sin(duv.y * 750.0) * 0.5 + 0.5;
  col *= 1.0 - uScanDepth * scan;

  // Very subtle 2-phase flicker
  float flick = 1.0 - uFlicker * (0.6 + 0.4 * sin(uTime * 73.0)) * (0.5 + 0.5 * sin(uTime * 5.3));
  col *= flick;

  // Slight phosphor lift: blacks stay black, mids warm up a touch
  col = pow(col, vec3(0.97));
  col.r *= 1.015;
  col.g *= 1.01;

  // Vignette on the tube corners
  float vig = smoothstep(1.05, 0.35, length(c) * 1.42);
  col *= mix(0.62, 1.0, vig);

  // Diving through the glass: amber-white flash + scanline streak
  float streak = smoothstep(0.4, 0.0, abs(fract(uv.y * 24.0 + uTime * 3.0) - 0.5));
  col += (vec3(1.0, 0.9, 0.5) * uDive) + vec3(1.0) * uDive * streak * 0.35;

  outputColor = vec4(col, inputColor.a);
}
`

/* -------------------------------------------------------------------------- */
/*  04: HAZARD STRIPES (desk props)                                           */
/* -------------------------------------------------------------------------- */

export const hazardStripeVertex = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`

export const hazardStripeFragment = /* glsl */ `
uniform vec3 uYellow;
uniform vec3 uBlack;
uniform float uScale;

varying vec2 vUv;

void main() {
  float stripe = fract((vUv.x + vUv.y) * uScale);
  vec3 col = stripe > 0.5 ? uYellow : uBlack;
  gl_FragColor = vec4(col, 1.0);
}
`
