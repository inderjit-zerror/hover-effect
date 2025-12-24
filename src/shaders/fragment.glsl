// precision mediump float;

// uniform sampler2D uTexture;
// varying vec2 vUv;

// void main() {
//     vec4 color = texture2D(uTexture, vUv);
//     gl_FragColor = color;
// }

uniform sampler2D uTexture;
uniform vec2 uMouse;
uniform float uStrength;
uniform float uTime;
uniform vec2 uRippleOrigin;
uniform float uRippleStart;
uniform float uBrightness;
uniform vec2 uResolution;

varying vec2 vUv;

void main() {
vec2 aspect = vec2(uResolution.x / uResolution.y, 1.0);
vec2 dir = (vUv - uMouse) * aspect;
float dist = length(dir);

// --- Distortion starts as the original UV (no distortion by default) ---
vec2 distorted = vUv;

// --- Bulge distortion (only if active) ---
if (uStrength > 0.001) {
float bulge = smoothstep(0.4, 0.0, dist) * uStrength;
distorted -= normalize(dir) * bulge * 0.02 / aspect;
}

// --- Ripple distortion (only if ripple is alive) ---
float rippleAge = uTime - uRippleStart;
if (rippleAge > 0.0 && rippleAge < 1.0) {
float rippleRadius = rippleAge * 0.4;
float d = length((vUv - uRippleOrigin) * aspect);
float wave = sin(35.0 * (d - rippleRadius)) * 0.02;
float fade = 1.0 - smoothstep(0.0, 1.0, rippleAge);
float mask = smoothstep(rippleRadius + 0.1, rippleRadius, d);
distorted += normalize(dir) * wave * mask * fade / aspect;
}

// --- Final color (single sample, no RGB split) ---
vec4 baseColor = texture2D(uTexture, distorted);

if (baseColor.a < 0.01) discard;

vec4 finalColor = baseColor;
finalColor.rgb *= uBrightness;

gl_FragColor = finalColor;
}