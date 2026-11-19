// Articulated 180-Bone CSS Skeleton, WCAG-AA Contrast Guardian & High-Temperature Explorer.
// Zero DOM dependencies so both browser runtime and Node unit tests validate and compile
// fine-grained anatomical surface variations safely without arbitrary CSS/JS injection.

export const BONE_FAMILIES = Object.freeze([
  'light',
  'texture',
  'stage',
  'eyes',
  'typography',
  'controls',
  'motion',
]);

const HEX_RE = /^#([0-9a-f]{6})$/i;
const RGBA_RE = /^rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([0-9.]+))?\s*\)$/i;

const ANSWER_FONT_STACKS = Object.freeze({
  serif: '"Newsreader", Georgia, "Times New Roman", serif',
  editorial: '"Newsreader", "Iowan Old Style", "Palatino Linotype", Georgia, serif',
  sans: '"Bricolage Grotesque", "Avenir Next", "Segoe UI", system-ui, sans-serif',
  mono: '"IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace',
});

const PROMPT_FONT_STACKS = Object.freeze({
  sans: '"Bricolage Grotesque", "Avenir Next", "Segoe UI", system-ui, sans-serif',
  serif: '"Newsreader", Georgia, "Times New Roman", serif',
  mono: '"IBM Plex Mono", ui-monospace, "SFMono-Regular", Menlo, monospace',
});

const num = (min, max, def, unit = '') => ({ type: 'number', min, max, default: def, unit });
const col = (def) => ({ type: 'color', default: def });
const en = (values, def) => ({ type: 'enum', values: Object.freeze(values), default: def });

export const BONE_SCHEMA = Object.freeze({
  // ── 1. LIGHT & ATMOSPHERE (36 bones) ──────────────────────────────────────
  bgAngle: Object.assign(num(120, 240, 180, 'deg'), { family: 'light' }),
  bgStart: Object.assign(col('#F6F1E9'), { family: 'light' }),
  bgMid: Object.assign(col('#F1EADF'), { family: 'light' }),
  bgMidStop: Object.assign(num(20, 80, 48, '%'), { family: 'light' }),
  bgEnd: Object.assign(col('#EDE4D3'), { family: 'light' }),
  bgHighlightAlpha: Object.assign(num(0, 0.45, 0.28), { family: 'light' }),
  bgHighlightY: Object.assign(num(-25, 20, -12, '%'), { family: 'light' }),

  orbAColor: Object.assign(col('rgba(193, 122, 77, 0.18)'), { family: 'light' }),
  orbAX: Object.assign(num(0, 100, 22, '%'), { family: 'light' }),
  orbAY: Object.assign(num(0, 100, 18, '%'), { family: 'light' }),
  orbARx: Object.assign(num(14, 90, 62, '%'), { family: 'light' }),
  orbARy: Object.assign(num(5, 90, 48, '%'), { family: 'light' }),
  orbAFade: Object.assign(num(45, 88, 72, '%'), { family: 'light' }),

  orbBColor: Object.assign(col('rgba(138, 75, 34, 0.14)'), { family: 'light' }),
  orbBX: Object.assign(num(0, 100, 80, '%'), { family: 'light' }),
  orbBY: Object.assign(num(0, 100, 82, '%'), { family: 'light' }),
  orbBRx: Object.assign(num(14, 90, 58, '%'), { family: 'light' }),
  orbBRy: Object.assign(num(5, 90, 46, '%'), { family: 'light' }),
  orbBFade: Object.assign(num(45, 88, 74, '%'), { family: 'light' }),

  orbCColor: Object.assign(col('rgba(212, 160, 106, 0.08)'), { family: 'light' }),
  orbCX: Object.assign(num(0, 100, 76, '%'), { family: 'light' }),
  orbCY: Object.assign(num(0, 100, 14, '%'), { family: 'light' }),
  orbCRx: Object.assign(num(14, 90, 48, '%'), { family: 'light' }),
  orbCRy: Object.assign(num(5, 90, 42, '%'), { family: 'light' }),
  orbCFade: Object.assign(num(45, 88, 72, '%'), { family: 'light' }),

  orbDColor: Object.assign(col('rgba(193, 122, 77, 0.04)'), { family: 'light' }),
  orbDX: Object.assign(num(0, 100, 20, '%'), { family: 'light' }),
  orbDY: Object.assign(num(0, 100, 78, '%'), { family: 'light' }),
  orbDRx: Object.assign(num(14, 90, 46, '%'), { family: 'light' }),
  orbDRy: Object.assign(num(5, 90, 38, '%'), { family: 'light' }),
  orbDFade: Object.assign(num(45, 88, 74, '%'), { family: 'light' }),

  auraOpacity: Object.assign(num(0, 1, 0.24), { family: 'light' }),
  auraBreathMs: Object.assign(num(6000, 28000, 14000, 'ms'), { family: 'light' }),
  auraBreathScale: Object.assign(num(1, 1.1, 1.04), { family: 'light' }),
  vignetteAlpha: Object.assign(num(0, 0.65, 0.04), { family: 'light' }),
  vignetteColor: Object.assign(col('#2B211A'), { family: 'light' }),

  // ── 2. TEXTURE & SEDIMENT (14 bones) ──────────────────────────────────────
  grainOpacity: Object.assign(num(0, 0.09, 0.015), { family: 'texture' }),
  grainScale: Object.assign(num(0.5, 2.2, 1.0), { family: 'texture' }),
  sedimentOpacity: Object.assign(num(0, 0.36, 0), { family: 'texture' }),
  sedimentAngle: Object.assign(num(-180, 180, 170, 'deg'), { family: 'texture' }),
  sedimentColor1: Object.assign(col('#D9C7B0'), { family: 'texture' }),
  sedimentColor2: Object.assign(col('#C8A682'), { family: 'texture' }),
  sedimentBandPos: Object.assign(num(10, 90, 46, '%'), { family: 'texture' }),
  sedimentBandWidth: Object.assign(num(4, 48, 20, '%'), { family: 'texture' }),
  horizonLineAlpha: Object.assign(num(0, 0.85, 0), { family: 'texture' }),
  horizonLineY: Object.assign(num(14, 86, 38, '%'), { family: 'texture' }),
  horizonLineColor: Object.assign(col('#7A6B5D'), { family: 'texture' }),
  canvasSat: Object.assign(num(0.65, 1.35, 1), { family: 'texture' }),
  canvasContrast: Object.assign(num(0.9, 1.15, 1), { family: 'texture' }),
  transitionMs: Object.assign(num(350, 2800, 1100, 'ms'), { family: 'texture' }),

  // ── 3. STAGE & COMPOSITION (16 bones) ─────────────────────────────────────
  stageTopMin: Object.assign(num(12, 36, 22, 'vh'), { family: 'stage' }),
  stageRowGap: Object.assign(num(6, 56, 16, 'px'), { family: 'stage' }),
  stagePadX: Object.assign(num(12, 64, 16, 'px'), { family: 'stage' }),
  stagePadTop: Object.assign(num(16, 52, 24, 'px'), { family: 'stage' }),
  presenceOffsetX: Object.assign(num(-120, 120, 0, 'px'), { family: 'stage' }),
  presenceOffsetY: Object.assign(num(-32, 48, 0, 'px'), { family: 'stage' }),
  focusOffsetX: Object.assign(num(-140, 140, 0, 'px'), { family: 'stage' }),
  focusOffsetY: Object.assign(num(-28, 56, 0, 'px'), { family: 'stage' }),
  focusAlign: Object.assign(en(['left', 'center', 'right'], 'left'), { family: 'stage' }),
  focusMeasure: Object.assign(num(24, 48, 38, 'rem'), { family: 'stage' }),
  focusPadTop: Object.assign(num(0, 48, 0, 'px'), { family: 'stage' }),
  focusAccentBarW: Object.assign(num(0, 5, 0, 'px'), { family: 'stage' }),
  focusAccentBarGap: Object.assign(num(0, 28, 0, 'px'), { family: 'stage' }),
  focusAccentBarColor: Object.assign(col('#C17A4D'), { family: 'stage' }),
  composerMaxW: Object.assign(num(26, 46, 38, 'rem'), { family: 'stage' }),
  speakingChromeOpacity: Object.assign(num(0.12, 0.65, 0.24), { family: 'stage' }),

  // ── 4. EYES & OCULAR ANATOMY (48 bones) ───────────────────────────────────
  eyeAspect: Object.assign(num(0.82, 1.52, 1), { family: 'eyes' }),
  eyeRadiusTl: Object.assign(num(10, 76, 50, '%'), { family: 'eyes' }),
  eyeRadiusTr: Object.assign(num(10, 76, 50, '%'), { family: 'eyes' }),
  eyeRadiusBr: Object.assign(num(10, 76, 45, '%'), { family: 'eyes' }),
  eyeRadiusBl: Object.assign(num(10, 76, 45, '%'), { family: 'eyes' }),
  eyeScale: Object.assign(num(0.64, 1.48, 1), { family: 'eyes' }),
  eyeSpacing: Object.assign(num(0.42, 2.35, 1), { family: 'eyes' }),
  eyePositionX: Object.assign(num(-1, 1, 0), { family: 'eyes' }),
  eyePositionY: Object.assign(num(-1, 1, 0), { family: 'eyes' }),
  eyeTiltBias: Object.assign(num(-4.5, 4.5, 0, 'deg'), { family: 'eyes' }),
  eyeOpacity: Object.assign(num(0.68, 1, 1), { family: 'eyes' }),
  eyeLeftScaleBias: Object.assign(num(0.94, 1.06, 1), { family: 'eyes' }),
  eyeRightScaleBias: Object.assign(num(0.94, 1.06, 1), { family: 'eyes' }),
  eyeVertAsymPx: Object.assign(num(-8, 8, 0, 'px'), { family: 'eyes' }),

  eyeHaloColor: Object.assign(col('rgba(74, 63, 53, 0.14)'), { family: 'eyes' }),
  eyeHaloBlur: Object.assign(num(4, 64, 28, 'px'), { family: 'eyes' }),
  eyeHaloSpread: Object.assign(num(-8, 14, 0, 'px'), { family: 'eyes' }),
  eyeShadowX: Object.assign(num(-12, 12, 0, 'px'), { family: 'eyes' }),
  eyeShadowY: Object.assign(num(2, 32, 14, 'px'), { family: 'eyes' }),
  eyeShadowBlur: Object.assign(num(8, 56, 28, 'px'), { family: 'eyes' }),
  eyeShadowColor: Object.assign(col('rgba(58, 39, 27, 0.34)'), { family: 'eyes' }),
  eyeRimGlowColor: Object.assign(col('rgba(193, 122, 77, 0)'), { family: 'eyes' }),
  eyeRimGlowBlur: Object.assign(num(0, 40, 0, 'px'), { family: 'eyes' }),

  skinHi: Object.assign(col('#F1E5D4'), { family: 'eyes' }),
  skinMid: Object.assign(col('#E6D4BB'), { family: 'eyes' }),
  skinShade: Object.assign(col('#D6BE9F'), { family: 'eyes' }),
  skinDeep: Object.assign(col('#C6AC8B'), { family: 'eyes' }),
  lashColor: Object.assign(col('rgba(58, 39, 27, 0.4)'), { family: 'eyes' }),
  lashOpacity: Object.assign(num(0.15, 0.75, 0.5), { family: 'eyes' }),

  scleraHi: Object.assign(col('#FFFDF9'), { family: 'eyes' }),
  scleraMid: Object.assign(col('#F7EEE1'), { family: 'eyes' }),
  scleraEdge: Object.assign(col('#DECBB3'), { family: 'eyes' }),
  scleraWarmTint: Object.assign(col('rgba(208, 132, 88, 0.2)'), { family: 'eyes' }),
  veinOpacity: Object.assign(num(0, 0.38, 0.2), { family: 'eyes' }),
  wetlineOpacity: Object.assign(num(0.2, 0.95, 0.6), { family: 'eyes' }),

  irisHue: Object.assign(num(-180, 180, 0, 'deg'), { family: 'eyes' }),
  irisSat: Object.assign(num(0.25, 1.85, 1), { family: 'eyes' }),
  irisBright: Object.assign(num(0.75, 1.35, 1), { family: 'eyes' }),
  irisSize: Object.assign(num(42, 64, 54, 'px'), { family: 'eyes' }),
  irisFibersOpacity: Object.assign(num(0.3, 1, 0.85), { family: 'eyes' }),
  irisSheenOpacity: Object.assign(num(0.3, 1, 0.72), { family: 'eyes' }),
  irisLimbusAlpha: Object.assign(num(0.4, 1, 0.92), { family: 'eyes' }),
  pupilSizeBias: Object.assign(num(0.72, 1.3, 1), { family: 'eyes' }),

  catchlightMainOpacity: Object.assign(num(0.3, 1, 0.9), { family: 'eyes' }),
  catchlightMainX: Object.assign(num(24, 48, 37, '%'), { family: 'eyes' }),
  catchlightMainY: Object.assign(num(18, 38, 27, '%'), { family: 'eyes' }),
  catchlightMainSize: Object.assign(num(8, 18, 12, '%'), { family: 'eyes' }),
  catchlightWinOpacity: Object.assign(num(0, 0.78, 0.46), { family: 'eyes' }),
  lidTopBias: Object.assign(num(-10, 26, 0, '%'), { family: 'eyes' }),
  lidBottomBias: Object.assign(num(-22, 6, 0, '%'), { family: 'eyes' }),
  asymmetry: Object.assign(num(0, 0.35, 0.08), { family: 'eyes' }),

  // ── 5. TYPOGRAPHY & VOICE (28 bones) ──────────────────────────────────────
  textColor: Object.assign(col('#3D3229'), { family: 'typography' }),
  mutedColor: Object.assign(col('#6B5B4C'), { family: 'typography' }),
  promptColor: Object.assign(col('#7A5A40'), { family: 'typography' }),
  accentColor: Object.assign(col('#C17A4D'), { family: 'typography' }),
  focusRingColor: Object.assign(col('#8A4B22'), { family: 'typography' }),
  lineColor: Object.assign(col('#4A3F35'), { family: 'typography' }),

  answerFont: Object.assign(en(['serif', 'editorial', 'sans', 'mono'], 'serif'), { family: 'typography' }),
  answerScale: Object.assign(num(0.8, 1.42, 1), { family: 'typography' }),
  answerWeight: Object.assign(num(300, 650, 400), { family: 'typography' }),
  answerLeading: Object.assign(num(1.22, 1.95, 1.56), { family: 'typography' }),
  answerTracking: Object.assign(num(-0.028, 0.045, 0, 'em'), { family: 'typography' }),
  answerStyle: Object.assign(en(['normal', 'italic'], 'normal'), { family: 'typography' }),
  answerTilt: Object.assign(num(-1.4, 1.4, 0, 'deg'), { family: 'typography' }),
  answerShadowAlpha: Object.assign(num(0, 0.18, 0), { family: 'typography' }),
  answerWordSpacing: Object.assign(num(-0.04, 0.12, 0, 'em'), { family: 'typography' }),

  promptFont: Object.assign(en(['sans', 'serif', 'mono'], 'sans'), { family: 'typography' }),
  promptSize: Object.assign(num(0.7, 1.05, 0.9, 'rem'), { family: 'typography' }),
  promptWeight: Object.assign(num(350, 600, 450), { family: 'typography' }),
  promptTracking: Object.assign(num(-0.01, 0.18, 0, 'em'), { family: 'typography' }),
  promptTransform: Object.assign(en(['none', 'uppercase', 'lowercase'], 'none'), { family: 'typography' }),
  promptStyle: Object.assign(en(['normal', 'italic'], 'normal'), { family: 'typography' }),
  promptOpacity: Object.assign(num(0.55, 1, 0.92), { family: 'typography' }),
  pairGap: Object.assign(num(0.4, 1.8, 0.85, 'rem'), { family: 'typography' }),

  caretColor: Object.assign(col('#C17A4D'), { family: 'typography' }),
  caretWidth: Object.assign(num(1.5, 8, 2.5, 'px'), { family: 'typography' }),
  caretRadius: Object.assign(num(0, 3, 1, 'px'), { family: 'typography' }),
  caretBlinkMs: Object.assign(num(700, 1600, 1060, 'ms'), { family: 'typography' }),
  typeCharMs: Object.assign(num(18, 68, 42), { family: 'typography' }),

  // ── 6. CONTROLS & SURFACE CHROME (24 bones) ───────────────────────────────
  composerRuleColor: Object.assign(col('rgba(74, 63, 53, 0.28)'), { family: 'controls' }),
  composerRuleThickness: Object.assign(num(1, 2.5, 1, 'px'), { family: 'controls' }),
  composerRuleFade: Object.assign(num(4, 24, 10, '%'), { family: 'controls' }),
  composerFocusThickness: Object.assign(num(1.5, 3, 2, 'px'), { family: 'controls' }),
  composerPadY: Object.assign(num(0.75, 1.6, 1.15, 'rem'), { family: 'controls' }),
  composerVeilAlpha: Object.assign(num(0.45, 0.96, 0.84), { family: 'controls' }),
  composerInputScale: Object.assign(num(0.92, 1.18, 1), { family: 'controls' }),
  sendSize: Object.assign(num(2.4, 3.1, 2.75, 'rem'), { family: 'controls' }),
  sendBgHover: Object.assign(col('rgba(193, 122, 77, 0.16)'), { family: 'controls' }),
  sendIconStroke: Object.assign(num(1.2, 2.1, 1.6), { family: 'controls' }),

  dialRestOpacity: Object.assign(num(0.36, 0.85, 0.56), { family: 'controls' }),
  dialGap: Object.assign(num(0.65, 1.8, 1.05, 'rem'), { family: 'controls' }),
  dialWidth: Object.assign(num(4.2, 7.2, 5.4, 'rem'), { family: 'controls' }),
  dialPoleSize: Object.assign(num(0.68, 0.86, 0.78, 'rem'), { family: 'controls' }),
  dialPoleTracking: Object.assign(num(0, 0.08, 0.01, 'em'), { family: 'controls' }),
  dialRailOpacity: Object.assign(num(0.25, 0.85, 0.55), { family: 'controls' }),
  dialTickOpacity: Object.assign(num(0.22, 0.75, 0.42), { family: 'controls' }),
  dialNeedleWidth: Object.assign(num(1, 2.2, 1.45, 'px'), { family: 'controls' }),
  dialPivotRadius: Object.assign(num(1.2, 2.5, 1.75), { family: 'controls' }),
  dialArcOpacity: Object.assign(num(0.35, 0.95, 0.78), { family: 'controls' }),

  footerSize: Object.assign(num(0.68, 0.82, 0.75, 'rem'), { family: 'controls' }),
  footerTracking: Object.assign(num(0.01, 0.1, 0.03, 'em'), { family: 'controls' }),
  footerOpacity: Object.assign(num(0.55, 1, 0.85), { family: 'controls' }),
  toggleRadius: Object.assign(num(4, 999, 999, 'px'), { family: 'controls' }),

  // ── 7. MOTION & KINETIC SIGNATURE (14 bones) ──────────────────────────────
  energy: Object.assign(num(0, 1, 0.5), { family: 'motion' }),
  speed: Object.assign(num(0, 1, 0.5), { family: 'motion' }),
  damping: Object.assign(num(0.03, 0.35, 0.12), { family: 'motion' }),
  ambientMovement: Object.assign(num(0, 1, 0.6), { family: 'motion' }),
  responsiveness: Object.assign(num(0, 1, 0.6), { family: 'motion' }),
  centerX: Object.assign(num(-0.8, 0.8, 0), { family: 'motion' }),
  centerY: Object.assign(num(-0.8, 0.8, 0), { family: 'motion' }),
  asymmetryBias: Object.assign(num(-1, 1, 0), { family: 'motion' }),
  blinkCloseMs: Object.assign(num(65, 150, 95, 'ms'), { family: 'motion' }),
  blinkOpenMs: Object.assign(num(160, 540, 260, 'ms'), { family: 'motion' }),
  driftFreqScale: Object.assign(num(0.45, 1.8, 1), { family: 'motion' }),
  breathScale: Object.assign(num(0.2, 1.6, 1), { family: 'motion' }),
  saccadeAmp: Object.assign(num(0.3, 1.6, 1), { family: 'motion' }),
  focusPull: Object.assign(num(0.2, 0.95, 0.6), { family: 'motion' }),
});

export const BONE_COUNT = Object.keys(BONE_SCHEMA).length;

export const DEFAULT_BONES = Object.freeze(
  Object.fromEntries(Object.entries(BONE_SCHEMA).map(([k, spec]) => [k, spec.default])),
);

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function round(v, digits = 4) {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
}

function hasUnsafeCss(value) {
  return /[;<>{}]|javascript:|url\s*\(|expression\s*\(/i.test(String(value));
}

function parseColorRgb(raw) {
  const s = String(raw ?? '').trim();
  const hex = HEX_RE.exec(s);
  if (hex) {
    const n = parseInt(hex[1], 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
  }
  const rgba = RGBA_RE.exec(s);
  if (rgba) {
    return [clamp(+rgba[1], 0, 255), clamp(+rgba[2], 0, 255), clamp(+rgba[3], 0, 255)];
  }
  return null;
}

function relLuminance([r, g, b]) {
  const lin = (c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * Compute W3C WCAG contrast ratio (>= 4.5 required for AA body text).
 */
export function contrastRatio(colorA, colorB) {
  const rgbA = parseColorRgb(colorA);
  const rgbB = parseColorRgb(colorB);
  if (!rgbA || !rgbB) return 1;
  const lA = relLuminance(rgbA);
  const lB = relLuminance(rgbB);
  return (Math.max(lA, lB) + 0.05) / (Math.min(lA, lB) + 0.05);
}

function mixToward(rgbA, rgbB, t) {
  const k = clamp(t, 0, 1);
  return [
    Math.round(rgbA[0] + (rgbB[0] - rgbA[0]) * k),
    Math.round(rgbA[1] + (rgbB[1] - rgbA[1]) * k),
    Math.round(rgbA[2] + (rgbB[2] - rgbA[2]) * k),
  ];
}

function rgbToHex([r, g, b]) {
  return `#${[r, g, b].map((c) => clamp(Math.round(c), 0, 255).toString(16).padStart(2, '0')).join('').toUpperCase()}`;
}

function toAlphaColor(color, alpha) {
  const a = Number(clamp(alpha, 0, 1).toFixed(3));
  if (RGBA_RE.test(String(color ?? '').trim())) return String(color).trim();
  const rgb = parseColorRgb(color);
  if (!rgb) return color;
  return `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, ${a})`;
}

/**
 * Guarantee readable WCAG AA contrast on both light and dark worlds automatically.
 */
export function ensureWcagContrast(rawBones) {
  const bones = { ...DEFAULT_BONES, ...rawBones };
  const stops = [bones.bgStart, bones.bgMid, bones.bgEnd].map(parseColorRgb).filter(Boolean);
  if (!stops.length) return bones;

  const avgLum = stops.reduce((sum, rgb) => sum + relLuminance(rgb), 0) / stops.length;
  const isDark = avgLum < 0.24;
  const targetInk = isDark ? [246, 242, 234] : [18, 20, 23];

  const enforce = (key, minRatio) => {
    let rgb = parseColorRgb(bones[key]) ?? targetInk;
    const minAcross = () => Math.min(...stops.map((bg) => contrastRatio(rgbToHex(rgb), rgbToHex(bg))));
    let step = 0;
    while (minAcross() < minRatio && step < 12) {
      step += 1;
      rgb = mixToward(rgb, targetInk, 0.22);
    }
    bones[key] = rgbToHex(rgb);
  };

  enforce('textColor', 5.2);
  enforce('promptColor', 4.6);
  enforce('mutedColor', 4.55);
  enforce('accentColor', 3.4);
  enforce('focusRingColor', 3.2);

  return bones;
}

function normalizeColorValue(raw) {
  if (typeof raw !== 'string' || hasUnsafeCss(raw)) return null;
  const s = raw.trim();
  const hex = HEX_RE.exec(s);
  if (hex) return `#${hex[1].toUpperCase()}`;
  const rgba = RGBA_RE.exec(s);
  if (rgba) {
    const r = clamp(+rgba[1], 0, 255);
    const g = clamp(+rgba[2], 0, 255);
    const b = clamp(+rgba[3], 0, 255);
    const a = rgba[4] !== undefined ? clamp(Number(rgba[4]), 0, 1) : 1;
    return `rgba(${r}, ${g}, ${b}, ${Number(a.toFixed(3))})`;
  }
  return null;
}

/**
 * Strictly validate and clamp any partial flat or grouped bone patch.
 * Rejects unknown bone keys and any unsafe CSS/JS strings.
 */
export function validateBonePatch(rawPatch, currentBones = DEFAULT_BONES) {
  const next = { ...DEFAULT_BONES, ...(currentBones || {}) };
  const cleanPatch = {};
  const changedBones = [];
  const rejected = [];

  if (!rawPatch || typeof rawPatch !== 'object' || Array.isArray(rawPatch)) {
    return { patch: cleanPatch, nextBones: Object.freeze(next), changedBones, rejected: ['<root>'] };
  }

  const flat = {};
  for (const [k, v] of Object.entries(rawPatch)) {
    if (BONE_FAMILIES.includes(k) && v && typeof v === 'object' && !Array.isArray(v)) {
      for (const [innerK, innerV] of Object.entries(v)) flat[innerK] = innerV;
    } else {
      flat[k] = v;
    }
  }

  for (const [bone, incoming] of Object.entries(flat)) {
    if (!Object.hasOwn(BONE_SCHEMA, bone)) {
      rejected.push(bone);
      continue;
    }
    const spec = BONE_SCHEMA[bone];
    let resolved = null;

    if (spec.type === 'number') {
      const n = Number(incoming);
      if (Number.isFinite(n)) resolved = round(clamp(n, spec.min, spec.max));
    } else if (spec.type === 'color') {
      resolved = normalizeColorValue(incoming);
    } else if (spec.type === 'enum') {
      if (typeof incoming === 'string' && !hasUnsafeCss(incoming)) {
        const val = incoming.trim().toLowerCase();
        if (spec.values.includes(val)) resolved = val;
      }
    }

    if (resolved === null || resolved === undefined) {
      rejected.push(bone);
      continue;
    }

    cleanPatch[bone] = resolved;
    if (next[bone] !== resolved) {
      next[bone] = resolved;
      changedBones.push(bone);
    }
  }

  return {
    patch: cleanPatch,
    nextBones: Object.freeze(next),
    changedBones,
    rejected,
  };
}

function camelToKebab(name) {
  return name.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`);
}

/**
 * Compile validated bones to `--bone-*` CSS custom properties plus core synced palette/presence tokens.
 */
export function compileBonesToCssVars(rawBones = DEFAULT_BONES) {
  const b = ensureWcagContrast(rawBones);
  const vars = {};

  for (const [key, spec] of Object.entries(BONE_SCHEMA)) {
    const val = b[key];
    const cssName = `--bone-${camelToKebab(key)}`;
    if (key === 'orbAColor' || key === 'orbBColor' || key === 'orbCColor' || key === 'orbDColor') {
      const alphaScale = key === 'orbAColor' ? 0.85 : key === 'orbBColor' ? 0.78 : key === 'orbCColor' ? 0.68 : 0.56;
      vars[cssName] = RGBA_RE.test(String(val)) ? val : toAlphaColor(val, clamp(b.auraOpacity * alphaScale, 0.14, 0.52));
    } else if (spec.unit) {
      vars[cssName] = `${val}${spec.unit}`;
    } else {
      vars[cssName] = String(val);
    }
  }

  // Computed font stacks & multi-value compounds cleanly built in JS (safe strings only).
  vars['--bone-answer-font-stack'] = ANSWER_FONT_STACKS[b.answerFont] ?? ANSWER_FONT_STACKS.serif;
  vars['--bone-prompt-font-stack'] = PROMPT_FONT_STACKS[b.promptFont] ?? PROMPT_FONT_STACKS.sans;
  vars['--bone-eye-aspect-w'] = String(Number(clamp(b.eyeAspect, 0.86, 1.24).toFixed(3)));
  vars['--bone-eye-aspect-h'] = String(Number((1 / b.eyeAspect).toFixed(3)));

  // Sync legacy/base tokens so vendor, composer, footer, and presence share one voice.
  const endRgb = parseColorRgb(b.bgEnd) ?? [237, 228, 211];
  const accentRgb = parseColorRgb(b.accentColor) ?? [193, 122, 77];
  const startRgb = parseColorRgb(b.bgStart) ?? [246, 241, 233];
  const lineRgb = parseColorRgb(b.lineColor) ?? [74, 63, 53];
  const avgLum = relLuminance(startRgb);
  const isDark = avgLum < 0.24;

  vars['--bg-start'] = b.bgStart;
  vars['--bg-end'] = b.bgEnd;
  vars['--dark-bg'] = b.skinMid;
  vars['--neutral-50'] = b.scleraHi;
  vars['--neutral-100'] = b.scleraMid;
  vars['--neutral-200'] = b.scleraEdge;
  vars['--text'] = b.textColor;
  vars['--muted'] = b.mutedColor;
  vars['--prompt'] = b.promptColor;
  vars['--placeholder'] = b.mutedColor;
  vars['--accent'] = b.accentColor;
  vars['--focus-ring'] = b.focusRingColor;
  vars['--line'] = toAlphaColor(rgbToHex(lineRgb), isDark ? 0.34 : 0.28);
  vars['--surface-rule'] = toAlphaColor(rgbToHex(lineRgb), isDark ? 0.36 : 0.3);
  vars['--surface-chip'] = `rgba(${startRgb[0]}, ${startRgb[1]}, ${startRgb[2]}, ${isDark ? 0.72 : 0.68})`;
  vars['--surface-veil-38'] = `rgba(${endRgb[0]}, ${endRgb[1]}, ${endRgb[2]}, 0.82)`;
  vars['--surface-veil-96'] = `rgba(${endRgb[0]}, ${endRgb[1]}, ${endRgb[2]}, 0.96)`;
  vars['--surface-send-hover'] = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.18)`;
  vars['--surface-focus-shadow'] = `rgba(${accentRgb[0]}, ${accentRgb[1]}, ${accentRgb[2]}, 0.45)`;
  vars['--iris-hue'] = `${b.irisHue}deg`;
  vars['--iris-sat'] = String(b.irisSat);
  vars['--iris-bright'] = String(b.irisBright);
  vars['--iris-limbus-alpha'] = String(b.irisLimbusAlpha);
  vars['--surface-transition-ms'] = `${b.transitionMs}ms`;
  vars['--type-char-ms'] = String(b.typeCharMs);
  vars['--type-cadence-ms'] = String(b.typeCharMs);

  return vars;
}

function createSeededRng(seed = 1) {
  let s = (Number(seed) || 1) >>> 0;
  return () => {
    s = (s + 0x6D2B79F5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const CREATIVE_CHORDS = Object.freeze([
  // High-temperature harmonic painterly chords (light & dark), each curated for real artful color harmony
  {
    dark: false,
    bg: ['#FFF3DC', '#F9DFBA', '#F0C790'],
    orbs: ['rgba(232, 74, 39, 0.36)', 'rgba(18, 122, 134, 0.30)', 'rgba(240, 178, 34, 0.28)', 'rgba(154, 46, 88, 0.18)'],
    skin: ['#FAF0DE', '#F0DAB7', '#DFBF8E', '#C49A62'],
    sclera: ['#FFFDF9', '#F8EFE2', '#E2CFB8'],
    text: '#1B1932', muted: '#463C4B', prompt: '#8A2414', accent: '#A82E19', focus: '#0F626E', line: '#4E3932',
    irisHue: 145, irisSat: 1.42, irisBright: 1.08, horizon: '#C84222', sediment: ['#E45A36', '#167682'],
  },
  {
    dark: true,
    bg: ['#120B1C', '#1D112C', '#24182E'],
    orbs: ['rgba(235, 92, 68, 0.32)', 'rgba(54, 152, 224, 0.26)', 'rgba(245, 186, 66, 0.24)', 'rgba(130, 58, 190, 0.24)'],
    skin: ['#1B1329', '#160F22', '#100B19', '#09060F'],
    sclera: ['#DDD5CB', '#A99F99', '#4E4858'],
    text: '#F7EFE4', muted: '#C8BDCE', prompt: '#F5B873', accent: '#FF8D6E', focus: '#72D5F5', line: '#B4A2BD',
    irisHue: 18, irisSat: 1.55, irisBright: 1.24, horizon: '#F4AE4A', sediment: ['#8E2E42', '#2B4E9E'],
  },
  {
    dark: false,
    bg: ['#EDF2EB', '#E0EAE0', '#CEDED0'],
    orbs: ['rgba(74, 158, 122, 0.34)', 'rgba(218, 136, 56, 0.24)', 'rgba(42, 92, 128, 0.22)', 'rgba(246, 248, 240, 0.45)'],
    skin: ['#ECF2EA', '#DCE6D8', '#C4D3BF', '#A4B89E'],
    sclera: ['#FCFDFB', '#EFF4ED', '#D4DFD1'],
    text: '#16241B', muted: '#324A3B', prompt: '#244C38', accent: '#1E5942', focus: '#1B4965', line: '#32483A',
    irisHue: 78, irisSat: 0.94, irisBright: 0.96, horizon: '#366852', sediment: ['#A8C4B0', '#E4C29A'],
  },
  {
    dark: true,
    bg: ['#0A1614', '#0E201C', '#162820'],
    orbs: ['rgba(214, 174, 62, 0.26)', 'rgba(34, 176, 132, 0.28)', 'rgba(196, 86, 54, 0.20)', 'rgba(72, 224, 184, 0.16)'],
    skin: ['#12241F', '#0C1B17', '#081310', '#040B09'],
    sclera: ['#CFE0D9', '#94B3A9', '#3F5D55'],
    text: '#EFF7F2', muted: '#AEC7BE', prompt: '#E6CA78', accent: '#6CE3BA', focus: '#F2C15A', line: '#9AB8AE',
    irisHue: 98, irisSat: 1.25, irisBright: 1.2, horizon: '#D9B14E', sediment: ['#163B32', '#523B1A'],
  },
  {
    dark: false,
    bg: ['#F5EEF2', '#EBE0E8', '#DECEDB'],
    orbs: ['rgba(186, 62, 114, 0.30)', 'rgba(52, 84, 168, 0.26)', 'rgba(224, 146, 72, 0.24)', 'rgba(132, 86, 168, 0.18)'],
    skin: ['#F6ECF2', '#EAD9E4', '#D7BDCB', '#BC9BAE'],
    sclera: ['#FFFCFE', '#F7EDF3', '#E0CCD9'],
    text: '#221526', muted: '#4A3650', prompt: '#7B1E4C', accent: '#8E2258', focus: '#254294', line: '#4C364A',
    irisHue: -28, irisSat: 1.38, irisBright: 1.04, horizon: '#8E2258', sediment: ['#C96C94', '#6E82C6'],
  },
]);

/**
 * High-temperature creative explorer across the 180-bone space.
 * Combines curated painterly color chords with randomized spatial, ocular,
 * textural, and typographic mutations — always WCAG AA verified.
 */
export function mutateBonesCreative({ seed = Date.now(), temperature = 0.9, baseBones = DEFAULT_BONES } = {}) {
  const temp = clamp(Number(temperature) || 0.9, 0.2, 1.3);
  const rng = createSeededRng(seed);
  const pick = (arr) => arr[Math.floor(rng() * arr.length)];
  const span = (lo, hi, base) => round(base + (lo + rng() * (hi - lo) - base) * Math.min(1, temp));

  const chord = pick(CREATIVE_CHORDS);
  const offsetSign = rng() < 0.5 ? -1 : 1;
  const asymmetricStage = rng() < 0.65;
  const eyeAspect = rng() < 0.35 ? round(1.24 + rng() * 0.22, 2) : round(0.88 + rng() * 0.24, 2);
  const sharpCorners = eyeAspect > 1.2;

  const patch = {
    bgAngle: Math.round(span(138, 218, 170)),
    bgStart: chord.bg[0],
    bgMid: chord.bg[1],
    bgMidStop: Math.round(span(38, 62, 50)),
    bgEnd: chord.bg[2],
    bgHighlightAlpha: chord.dark ? 0.06 : round(0.18 + rng() * 0.18, 2),

    orbAColor: chord.orbs[0],
    orbAX: Math.round(10 + rng() * 30),
    orbAY: Math.round(12 + rng() * 72),
    orbARx: Math.round(48 + rng() * 26),
    orbARy: Math.round(36 + rng() * 24),

    orbBColor: chord.orbs[1],
    orbBX: Math.round(62 + rng() * 30),
    orbBY: Math.round(16 + rng() * 72),
    orbBRx: Math.round(46 + rng() * 26),
    orbBRy: Math.round(36 + rng() * 22),

    orbCColor: chord.orbs[2],
    orbCX: Math.round(24 + rng() * 64),
    orbCY: Math.round(10 + rng() * 78),
    orbCRx: Math.round(32 + rng() * 28),
    orbCRy: Math.round(14 + rng() * 32),

    orbDColor: chord.orbs[3],
    orbDX: Math.round(14 + rng() * 72),
    orbDY: Math.round(20 + rng() * 68),
    orbDRx: Math.round(32 + rng() * 24),
    orbDRy: Math.round(24 + rng() * 22),

    auraOpacity: round(0.54 + rng() * 0.42, 2),
    auraBreathMs: Math.round(9500 + rng() * 11000),
    vignetteAlpha: chord.dark ? round(0.32 + rng() * 0.24, 2) : round(0.06 + rng() * 0.16, 2),

    grainOpacity: round(0.02 + rng() * 0.052, 3),
    grainScale: round(0.8 + rng() * 0.7, 2),
    sedimentOpacity: rng() < 0.7 ? round(0.1 + rng() * 0.2, 2) : 0,
    sedimentAngle: Math.round(145 + rng() * 45),
    sedimentColor1: chord.sediment[0],
    sedimentColor2: chord.sediment[1],
    sedimentBandPos: Math.round(32 + rng() * 42),
    sedimentBandWidth: Math.round(12 + rng() * 24),
    horizonLineAlpha: rng() < 0.65 ? round(0.16 + rng() * 0.48, 2) : 0,
    horizonLineY: Math.round(28 + rng() * 5),
    horizonLineColor: chord.horizon,

    stageTopMin: Math.round(16 + rng() * 11),
    focusOffsetX: asymmetricStage ? Math.round(offsetSign * (36 + rng() * 68)) : 0,
    focusOffsetY: Math.round(-6 + rng() * 28),
    focusAlign: asymmetricStage ? (offsetSign < 0 ? 'left' : 'right') : 'center',
    focusMeasure: Math.round(28 + rng() * 12),
    focusAccentBarW: asymmetricStage && offsetSign < 0 && rng() < 0.8 ? Math.round(2 + rng() * 2) : 0,
    focusAccentBarGap: asymmetricStage && offsetSign < 0 ? Math.round(12 + rng() * 10) : 0,
    focusAccentBarColor: chord.accent,

    eyeAspect,
    eyeRadiusTl: sharpCorners ? 68 : Math.round(46 + rng() * 12),
    eyeRadiusTr: sharpCorners ? 24 : Math.round(44 + rng() * 12),
    eyeRadiusBr: sharpCorners ? 68 : Math.round(42 + rng() * 10),
    eyeRadiusBl: sharpCorners ? 24 : Math.round(42 + rng() * 10),
    eyeScale: round(0.88 + rng() * 0.44, 2),
    eyeSpacing: round(0.95 + rng() * 0.95, 2),
    eyePositionX: asymmetricStage ? round(-offsetSign * (0.14 + rng() * 0.28), 2) : 0,
    eyePositionY: round(-0.22 + rng() * 0.36, 2),
    eyeHaloColor: chord.orbs[0],
    eyeHaloBlur: Math.round(14 + rng() * 30),
    eyeShadowX: asymmetricStage ? Math.round(-offsetSign * rng() * 6) : 0,
    eyeShadowY: Math.round(10 + rng() * 12),
    eyeShadowBlur: Math.round(18 + rng() * 22),
    eyeShadowColor: chord.dark ? 'rgba(2, 4, 10, 0.72)' : 'rgba(48, 34, 24, 0.28)',
    eyeRimGlowColor: chord.dark ? chord.orbs[2] : chord.orbs[1],
    eyeRimGlowBlur: Math.round(4 + rng() * 16),

    skinHi: chord.skin[0],
    skinMid: chord.skin[1],
    skinShade: chord.skin[2],
    skinDeep: chord.skin[3],
    scleraHi: chord.sclera[0],
    scleraMid: chord.sclera[1],
    scleraEdge: chord.sclera[2],
    veinOpacity: chord.dark ? 0.07 : round(0.1 + rng() * 0.16, 2),

    irisHue: chord.irisHue,
    irisSat: chord.irisSat,
    irisBright: chord.irisBright,
    irisSize: Math.round(50 + rng() * 10),
    pupilSizeBias: chord.dark ? round(1.06 + rng() * 0.14, 2) : round(0.88 + rng() * 0.2, 2),
    lidTopBias: Math.round(-4 + rng() * 10),
    lidBottomBias: Math.round(-10 + rng() * 10),
    asymmetry: round(0.06 + rng() * 0.18, 2),

    textColor: chord.text,
    mutedColor: chord.muted,
    promptColor: chord.prompt,
    accentColor: chord.accent,
    focusRingColor: chord.focus,
    lineColor: chord.line,

    answerFont: pick(['serif', 'editorial', 'sans']),
    answerScale: round(0.96 + rng() * 0.32, 2),
    answerWeight: Math.round(340 + rng() * 180),
    answerLeading: round(1.36 + rng() * 0.44, 2),
    answerTracking: round(-0.016 + rng() * 0.032, 3),
    answerTilt: asymmetricStage && rng() < 0.5 ? round(offsetSign * 0.45, 2) : 0,

    promptFont: pick(['mono', 'sans', 'serif']),
    promptSize: round(0.74 + rng() * 0.16, 2),
    promptTracking: round(rng() < 0.5 ? 0.09 + rng() * 0.06 : 0.01 + rng() * 0.03, 3),
    promptTransform: pick(['uppercase', 'lowercase', 'none']),
    promptStyle: pick(['normal', 'italic']),
    typeCharMs: Math.round(22 + rng() * 24),

    energy: round(0.28 + rng() * 0.66, 2),
    speed: round(0.32 + rng() * 0.58, 2),
    damping: round(0.06 + rng() * 0.22, 3),
    ambientMovement: round(0.35 + rng() * 0.58, 2),
  };

  const validated = validateBonePatch(patch, baseBones);
  return {
    seed,
    bones: Object.freeze(ensureWcagContrast(validated.nextBones)),
    changedBones: validated.changedBones,
  };
}
