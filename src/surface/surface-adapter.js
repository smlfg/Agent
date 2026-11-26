// Natural-language adaptation parser, model patch sanitizer, and adaptive
// agent wrapper connecting Ollama (or dev fallback) with the unified SurfaceState.
// Never evaluates arbitrary JS or raw CSS strings from model output.

import {
  DEFAULT_SURFACE_STATE,
  MAX_VISIBLE_CONTROLS,
  TONES,
  validateSurfacePatch,
} from './surface-state.js';
import { matchWorldFromUtterance } from './surface-worlds.js';

const RESET_RE = /\b(alles\s+rückgängig|alles\s+zurück(?:setzen)?|zurück\s+(?:auf|zum)\s+(?:anfang|start|ursprung)|komplett\s+zurück|wieder\s+(?:wie\s+am\s+anfang|normal|standard)|reset(?:\s+all|\s+everything)?|undo\s+(?:all|everything)|start\s+over)\b/i;
const UNDO_RE = /\b(rückgängig|undo|zurücknehmen|schritt\s+zurück)\b/i;

function mergePatch(target, addition) {
  for (const [dim, fields] of Object.entries(addition)) {
    if (!target[dim]) target[dim] = {};
    Object.assign(target[dim], fields);
  }
}

function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

function atMost(current, delta, ceiling) {
  return clamp(Math.min(current + delta, ceiling), -10, 10);
}

function atLeast(current, delta, floor) {
  return clamp(Math.max(current + delta, floor), -10, 10);
}

/**
 * Translate a natural-language user utterance (German or English) into a
 * structured, validated SurfaceState action ({ reset | undo | patch | none }).
 *
 * @param {string} utterance
 * @param {typeof DEFAULT_SURFACE_STATE} [currentState]
 */
export function parseAdaptationIntent(utterance, currentState = DEFAULT_SURFACE_STATE) {
  const text = String(utterance ?? '').trim();
  const s = currentState || DEFAULT_SURFACE_STATE;

  if (!text) {
    return { action: 'none', patch: {}, focusControls: [], summary: '' };
  }

  if (RESET_RE.test(text)) {
    return {
      action: 'reset',
      patch: {},
      focusControls: [],
      summary: 'Oberfläche vollständig auf Ausgangszustand zurückgesetzt',
    };
  }

  if (UNDO_RE.test(text)) {
    return {
      action: 'undo',
      patch: {},
      focusControls: [],
      summary: 'Letzte Anpassung rückgängig gemacht',
    };
  }

  const patch = {};
  const focusControls = [];
  const summaries = [];
  const addControl = (id) => {
    if (!focusControls.includes(id)) focusControls.push(id);
  };

  // ── Calm / quieter (keep warmth instead of forcing cold shock) ────────────
  if (/\b(ruhiger|beruhig\w*|sanfter|entspannter|weniger\s+bewegung|langsamer|leiser|still(?:er)?|calm(?:er)?|quiet(?:er)?|soothing|slower)\b/i.test(text)) {
    const settleBg = s.atmosphere.background === 'vivid' ? 'paper' : s.atmosphere.background;
    mergePatch(patch, {
      motion: {
        energy: atMost(s.motion.energy, -0.44, 0.06),
        speed: atMost(s.motion.speed, -0.34, 0.16),
        ambientMovement: atMost(s.motion.ambientMovement, -0.54, 0.06),
        damping: 0.035,
        responsiveness: atMost(s.motion.responsiveness, -0.26, 0.34),
      },
      atmosphere: {
        background: settleBg,
        visualIntensity: atMost(s.atmosphere.visualIntensity, -0.31, 0.14),
      },
      communication: {
        responsePace: atMost(s.communication.responsePace, -0.36, 0.14),
        textDensity: atMost(s.communication.textDensity, -0.21, 0.24),
        tone: 'calm',
      },
    });
    addControl('motion.energy');
    addControl('motion.ambientMovement');
    addControl('communication.responsePace');
    summaries.push('ruhigere Bewegung und tieferes Atmen');
  }

  // ── Livelier / energetic ──────────────────────────────────────────────────
  if (/\b(lebendiger|belebter|dynamischer|aktiver|energiegeladener|wach(?:er)?|verspielter|livelier|more\s+alive|energetic|playful)\b/i.test(text)) {
    mergePatch(patch, {
      motion: {
        energy: atLeast(s.motion.energy, 0.44, 0.94),
        speed: atLeast(s.motion.speed, 0.4, 0.9),
        ambientMovement: atLeast(s.motion.ambientMovement, 0.35, 0.92),
        damping: clamp(Math.max(s.motion.damping + 0.08, 0.24), 0.03, 0.35),
        responsiveness: atLeast(s.motion.responsiveness, 0.28, 0.88),
      },
      embodiment: {
        asymmetry: clamp(Math.max(s.embodiment.asymmetry + 0.12, 0.24), 0, 0.35),
        eyeShape: 'wide',
      },
      communication: {
        responsePace: atLeast(s.communication.responsePace, 0.32, 0.82),
        typographyScale: atLeast(s.communication.typographyScale, 0.12, 1.14),
        tone: 'playful',
      },
    });
    addControl('motion.energy');
    addControl('motion.ambientMovement');
    summaries.push('lebendigere Bewegung und wacher Ausdruck');
  }

  // ── Colorful / vibrant ────────────────────────────────────────────────────
  if (/\b(farbenfroh(?:er)?|bunter|farbiger|leuchtender|kräftigere\s+farben|mehr\s+farbe|colorful|colourful|vibrant)\b/i.test(text)) {
    mergePatch(patch, {
      atmosphere: {
        background: 'vivid',
        primaryColor: '#D94E28',
        secondaryColor: '#0F766E',
        visualIntensity: atLeast(s.atmosphere.visualIntensity, 0.5, 0.96),
        contrast: atLeast(s.atmosphere.contrast, 0.22, 0.72),
      },
    });
    addControl('atmosphere.visualIntensity');
    addControl('atmosphere.contrast');
    summaries.push('kräftigere, lebendige Farbgebung');
  }

  // ── Warm / cool atmosphere ────────────────────────────────────────────────
  if (/\b(wärmer|gemütlicher|warme\s+farben|warmer)\b/i.test(text)) {
    mergePatch(patch, {
      atmosphere: {
        background: 'warm',
        primaryColor: '#C96B36',
        secondaryColor: '#8F431A',
        visualIntensity: atLeast(s.atmosphere.visualIntensity, 0.2, 0.65),
      },
      communication: { tone: 'warm' },
    });
    addControl('atmosphere.visualIntensity');
    summaries.push('wärmere Töne');
  } else if (/\b(kühler|kälter|sachlicher|cooler)\b/i.test(text)) {
    mergePatch(patch, {
      atmosphere: {
        background: 'cool',
        primaryColor: '#3B6E8C',
        secondaryColor: '#254A61',
      },
      communication: { tone: 'direct' },
    });
    addControl('atmosphere.contrast');
    summaries.push('kühlere Atmosphäre');
  }

  // ── Contrast ──────────────────────────────────────────────────────────────
  if (/\b(kontrastreicher|mehr\s+kontrast|höherer\s+kontrast|higher\s+contrast|more\s+contrast)\b/i.test(text)) {
    mergePatch(patch, {
      atmosphere: { contrast: atLeast(s.atmosphere.contrast, 0.35, 0.88) },
    });
    addControl('atmosphere.contrast');
    summaries.push('höherer Kontrast');
  }

  // ── Eyes spacing: wider vs closer ─────────────────────────────────────────
  if (/\b(augen\s+weiter\s+auseinander|weiter\s+auseinander|abstand\s+(?:größer|vergrößern|weiter)|mehr\s+abstand|further\s+apart|wider\s+apart|more\s+space\s+between\s+eyes)\b/i.test(text)) {
    mergePatch(patch, {
      embodiment: {
        eyeSpacing: atLeast(s.embodiment.eyeSpacing, 0.95, 2.15),
        asymmetry: clamp(Math.max(s.embodiment.asymmetry, 0.12), 0, 0.35),
      },
    });
    addControl('embodiment.eyeSpacing');
    addControl('embodiment.eyeScale');
    addControl('embodiment.asymmetry');
    summaries.push('größerer Augenabstand');
  } else if (/\b(augen\s+näher\s+zusammen|näher\s+zusammen|enger\s+zusammen|weniger\s+abstand|closer\s+together)\b/i.test(text)) {
    mergePatch(patch, {
      embodiment: {
        eyeSpacing: atMost(s.embodiment.eyeSpacing, -0.5, 0.56),
      },
    });
    addControl('embodiment.eyeSpacing');
    addControl('embodiment.eyeScale');
    summaries.push('kleinerer Augenabstand');
  }

  // ── Closer / further away (presence) ──────────────────────────────────────
  if (/\b(komm\s+näher|näher\s+kommen|größer(?:e\s+augen)?|come\s+closer|move\s+closer)\b/i.test(text)) {
    mergePatch(patch, {
      embodiment: {
        eyeScale: atLeast(s.embodiment.eyeScale, 0.36, 1.38),
        eyePositionY: atLeast(s.embodiment.eyePositionY, 0.72, 0.76),
      },
      atmosphere: {
        visualIntensity: atLeast(s.atmosphere.visualIntensity, 0.15, 0.6),
      },
      communication: {
        typographyScale: atLeast(s.communication.typographyScale, 0.22, 1.24),
      },
    });
    addControl('embodiment.eyeScale');
    addControl('embodiment.eyePositionY');
    addControl('communication.typographyScale');
    summaries.push('nähere Präsenz');
  }

  // ── Directional eye position & gaze ───────────────────────────────────────
  if (/\b(nach\s+links|augen\s+links|schau\s+nach\s+links|look\s+left|move\s+left)\b/i.test(text)) {
    mergePatch(patch, {
      embodiment: {
        eyePositionX: -0.75,
        gazeDirection: { x: -0.75, y: s.embodiment.gazeDirection.y },
      },
    });
    addControl('embodiment.eyePositionX');
    summaries.push('Blick nach links');
  } else if (/\b(nach\s+rechts|augen\s+rechts|schau\s+nach\s+rechts|look\s+right|move\s+right)\b/i.test(text)) {
    mergePatch(patch, {
      embodiment: {
        eyePositionX: 0.75,
        gazeDirection: { x: 0.75, y: s.embodiment.gazeDirection.y },
      },
    });
    addControl('embodiment.eyePositionX');
    summaries.push('Blick nach rechts');
  }

  if (/\b(nach\s+oben|augen\s+hoch|weiter\s+oben|look\s+up|move\s+up)\b/i.test(text)) {
    mergePatch(patch, {
      embodiment: {
        eyePositionY: -0.75,
        gazeDirection: { x: s.embodiment.gazeDirection.x, y: -0.65 },
      },
    });
    addControl('embodiment.eyePositionY');
    summaries.push('Blick nach oben');
  } else if (/\b(nach\s+unten|augen\s+runter|weiter\s+unten|look\s+down|move\s+down)\b/i.test(text)) {
    mergePatch(patch, {
      embodiment: {
        eyePositionY: 0.75,
        gazeDirection: { x: s.embodiment.gazeDirection.x, y: 0.65 },
      },
    });
    addControl('embodiment.eyePositionY');
    summaries.push('Blick nach unten');
  }

  // ── Asymmetry / eye shape ─────────────────────────────────────────────────
  if (/\b(asymmetrischer|schiefer|mehr\s+asymmetrie|more\s+asymmetric)\b/i.test(text)) {
    mergePatch(patch, {
      embodiment: { asymmetry: atLeast(s.embodiment.asymmetry, 0.14, 0.25) },
    });
    addControl('embodiment.asymmetry');
    summaries.push('stärkere Asymmetrie');
  } else if (/\b(symmetrischer|gerader|weniger\s+asymmetrie|more\s+symmetric)\b/i.test(text)) {
    mergePatch(patch, {
      embodiment: { asymmetry: 0.02 },
    });
    addControl('embodiment.asymmetry');
    summaries.push('symmetrischere Ausrichtung');
  }

  if (/\b(weicher|sanftere\s+form|soft(?:er)?\s+eyes)\b/i.test(text)) {
    mergePatch(patch, { embodiment: { eyeShape: 'soft' } });
  } else if (/\b(schärfer|kantiger|fokussierter(?:e\s+augen)?|sharp(?:er)?\s+eyes)\b/i.test(text)) {
    mergePatch(patch, { embodiment: { eyeShape: 'sharp' } });
  }

  // ── Response length: brief (airy space!) vs detailed ──────────────────────
  if (/\b(kürzer|knapper|kompakter|kurze\s+antwort\w*|weniger\s+text|shorter|brief(?:er)?|concise)\b/i.test(text)) {
    mergePatch(patch, {
      communication: {
        responseLength: 'brief',
        textDensity: atMost(s.communication.textDensity, -0.27, 0.18),
        responsePace: atLeast(s.communication.responsePace, 0.12, 0.62),
        typographyScale: clamp(Math.min(s.communication.typographyScale, 0.92), 0.8, 1.36),
      },
    });
    addControl('communication.responseLength');
    addControl('communication.typographyScale');
    summaries.push('kürzere, kompaktere Antworten');
  } else if (/\b(ausführlicher|länger|detaillierter|mehr\s+text|longer|detailed|elaborate)\b/i.test(text)) {
    mergePatch(patch, {
      communication: {
        responseLength: 'detailed',
        textDensity: atMost(s.communication.textDensity, -0.18, 0.3),
        responsePace: atMost(s.communication.responsePace, -0.14, 0.36),
        typographyScale: atLeast(s.communication.typographyScale, 0.06, 1.06),
      },
    });
    addControl('communication.responseLength');
    addControl('communication.typographyScale');
    summaries.push('ausführlichere Antworten');
  }

  // ── Reserved / restrained tone & spatial withdrawal ───────────────────────
  if (/\b(zurückhaltender|distanzierter|dezenter|leiser|bescheidener|mehr\s+abstand|reserved|restrained|subtle)\b/i.test(text)) {
    mergePatch(patch, {
      communication: {
        tone: 'reserved',
      },
      embodiment: {
        eyeScale: atMost(s.embodiment.eyeScale, -0.32, 0.68),
        eyePositionY: atMost(s.embodiment.eyePositionY, -0.76, -0.76),
        eyeShape: 'soft',
        asymmetry: clamp(Math.min(s.embodiment.asymmetry, 0.03), 0, 0.35),
      },
      motion: {
        energy: atMost(s.motion.energy, -0.42, 0.14),
        speed: atMost(s.motion.speed, -0.3, 0.3),
        ambientMovement: atMost(s.motion.ambientMovement, -0.45, 0.14),
        responsiveness: atMost(s.motion.responsiveness, -0.28, 0.32),
      },
      atmosphere: {
        background: 'minimal',
        primaryColor: '#57534E',
        secondaryColor: '#3F3B37',
        visualIntensity: atMost(s.atmosphere.visualIntensity, -0.5, 0.04),
      },
    });
    addControl('communication.responseLength');
    addControl('communication.typographyScale');
    addControl('embodiment.eyeScale');
    summaries.push('zurückhaltender Ausdruck und dezente Präsenz');
  }

  // ── Focused / concentrated ────────────────────────────────────────────────
  if (/\b(konzentrier\w*|fokussier\w*|bleib\s+fokussiert|voller\s+fokus|mehr\s+fokus|focus(?:ed)?|concentrat\w*)\b/i.test(text)) {
    mergePatch(patch, {
      embodiment: {
        eyeSpacing: atMost(s.embodiment.eyeSpacing, -0.18, 0.82),
        eyePositionY: clamp(Math.max(s.embodiment.eyePositionY, 0.14), -1, 1),
        asymmetry: atMost(s.embodiment.asymmetry, -0.05, 0.03),
        eyeShape: 'sharp',
      },
      motion: {
        energy: atMost(s.motion.energy, -0.24, 0.24),
        ambientMovement: atMost(s.motion.ambientMovement, -0.44, 0.14),
        responsiveness: atLeast(s.motion.responsiveness, 0.34, 0.94),
        damping: 0.08,
      },
      atmosphere: {
        contrast: atLeast(s.atmosphere.contrast, 0.32, 0.84),
        visualIntensity: atMost(s.atmosphere.visualIntensity, -0.26, 0.18),
      },
      communication: {
        textDensity: atLeast(s.communication.textDensity, 0.2, 0.66),
        tone: 'direct',
      },
    });
    addControl('atmosphere.contrast');
    addControl('motion.ambientMovement');
    addControl('embodiment.eyeSpacing');
    summaries.push('fokussierte Präsenz und ruhiger Hintergrund');
  }

  // ── Typography scale ──────────────────────────────────────────────────────
  if (/\b(größere\s+schrift|schrift\s+größer|larger\s+text|bigger\s+font)\b/i.test(text)) {
    mergePatch(patch, {
      communication: { typographyScale: atLeast(s.communication.typographyScale, 0.08, 1.1) },
    });
    addControl('communication.typographyScale');
    summaries.push('größere Typografie');
  } else if (/\b(kleinere\s+schrift|schrift\s+kleiner|smaller\s+text|smaller\s+font)\b/i.test(text)) {
    mergePatch(patch, {
      communication: { typographyScale: atMost(s.communication.typographyScale, -0.08, 0.9) },
    });
    addControl('communication.typographyScale');
    summaries.push('kompaktere Typografie');
  }

  if (!Object.keys(patch).length) {
    return { action: 'none', patch: {}, focusControls: [], summary: '' };
  }

  const validated = validateSurfacePatch(patch, s);
  return {
    action: 'patch',
    patch: validated.patch,
    focusControls: focusControls.slice(0, MAX_VISIBLE_CONTROLS),
    summary: summaries.join(', '),
  };
}

/**
 * Strip complete, unclosed, and stray <surface> markup from model text while
 * preserving deliberate paragraph newlines.
 */
export function stripSurfaceTags(rawText) {
  return String(rawText ?? '')
    .replace(/<surface\b[^>]*>[\s\S]*?<\/surface>/gi, '')
    .replace(/<surface\b[^>]*>[\s\S]*$/gi, '')
    .replace(/<\/?surface\b[^>]*>/gi, '')
    .replace(/[ \t]{2,}/g, ' ')
    .replace(/[ \t]*\n[ \t]*/g, '\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

/**
 * Safely parse and strip optional <surface>{...}</surface> JSON blocks emitted
 * by an LLM. Never leaks raw markup or throws on malformed JSON.
 */
export function extractModelSurfacePatch(rawText) {
  const source = String(rawText ?? '');
  const cleaned = stripSurfaceTags(source);
  let modelPatch = null;

  for (const match of source.matchAll(/<surface\b[^>]*>([\s\S]*?)<\/surface>/gi)) {
    try {
      const parsed = JSON.parse(match[1]);
      if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) continue;
      if (!modelPatch) modelPatch = {};
      for (const [dim, fields] of Object.entries(parsed)) {
        if (fields && typeof fields === 'object' && !Array.isArray(fields)) {
          if (!modelPatch[dim] || typeof modelPatch[dim] !== 'object' || Array.isArray(modelPatch[dim])) {
            modelPatch[dim] = {};
          }
          Object.assign(modelPatch[dim], fields);
        } else {
          modelPatch[dim] = fields;
        }
      }
    } catch {
      // Ignore malformed JSON blocks; valid blocks still apply.
    }
  }

  return { text: cleaned, modelPatch };
}

/**
 * Truncate prose to at most `limit` sentences without splitting on dots inside
 * URLs, domain names, or alphanumeric pairs such as `a.d`.
 */
export function limitSentences(text, limit = 3) {
  const clean = String(text ?? '').trim();
  if (!clean || limit <= 0) return '';

  const ends = [];
  const re = /[.!?]+["')\]»”’]*(?=\s|$)/g;
  for (const match of clean.matchAll(re)) {
    const idx = match.index;
    const end = idx + match[0].length;
    const before = idx > 0 ? clean[idx - 1] : '';
    const after = end < clean.length ? clean[end] : '';
    if (before && after && /[\p{L}\p{N}]/u.test(before) && /[\p{L}\p{N}]/u.test(after)) {
      continue;
    }
    ends.push(end);
    if (ends.length >= limit) break;
  }

  if (ends.length < limit) return clean;
  return clean.slice(0, ends[limit - 1]).trim();
}

/**
 * Enforce concise output when responseLength is 'brief' so small local models
 * stay visibly succinct even if they overshoot token hints.
 */
export function enforceResponseLength(text, responseLength = 'balanced') {
  const clean = String(text ?? '').trim();
  if (!clean || responseLength !== 'brief') return clean;

  const first = limitSentences(clean, 1);
  const words = first.split(/\s+/).filter(Boolean);
  if (words.length <= 15) return first;

  const clauseCut = first.match(/^(.{18,90}?)(?:,|;|—|:)\s+/);
  if (clauseCut) {
    return `${clauseCut[1].trim().replace(/[.!?]+$/, '')}.`;
  }
  return `${words.slice(0, 14).join(' ').replace(/[,;:\-–—.!?]+$/, '')}.`;
}

/**
 * Build dynamic prompt steering instructions for Ollama from the unified SurfaceState.
 */
export function buildAdaptationPromptBlock(surfaceState = DEFAULT_SURFACE_STATE, lastSummary = '') {
  const s = surfaceState || DEFAULT_SURFACE_STATE;
  const lengthRule = s.communication.responseLength === 'brief'
    ? 'Reply in ONE very short sentence (max 12 words).'
    : s.communication.responseLength === 'detailed'
      ? 'Reply in 2 to 3 thoughtful, detailed sentences.'
      : 'Reply in 1 to 2 concise sentences.';

  const toneValue = TONES.includes(s.communication.tone) ? s.communication.tone : 'warm';
  const lines = [
    'Adaptive Surface Steering (follow strictly, never name internal parameters or JSON keys):',
    '- Reply in the same language as the visitor (German if they write German, English if English).',
    `- Length: ${lengthRule}`,
    `- Tone: ${toneValue}.`,
  ];

  if (lastSummary) {
    lines.push(`- Surface change just applied: ${lastSummary}. Acknowledge briefly and naturally in plain words without outputting any tags.`);
  } else {
    lines.push(
      '- Only if the visitor indirectly asks to adjust your look, motion, spacing, or tone, you may append <surface>{"dimension":{"param":value}}</surface> using valid keys (embodiment, motion, atmosphere, communication). Never mention the tag.',
    );
  }

  return lines.join('\n');
}

function emptyReplyFallback(prompt) {
  const isGerman = /[äöüß]|(\b(?:bitte|mach|sei|werde|antworte|augen|ruhiger|kürzer|alles|rückgängig|weiter|lebendiger)\b)/i.test(String(prompt ?? ''));
  return isGerman ? 'Verstanden, ist angepasst.' : 'Got it, adjusted.';
}

/**
 * Wrap any conversation agent so visitor utterances automatically update the
 * unified SurfaceState and reflect updated communication rules in replies.
 */
export function createAdaptiveAgent({
  innerAgent,
  surfaceStore,
  projector = null,
  onAdapted = null,
} = {}) {
  if (!innerAgent || typeof innerAgent.respond !== 'function') {
    throw new TypeError('createAdaptiveAgent requires innerAgent with respond()');
  }
  if (!surfaceStore) {
    throw new TypeError('createAdaptiveAgent requires surfaceStore');
  }

  let surpriseCounter = 0;

  return {
    async respond(prompt, opts = {}) {
      const worldMatch = matchWorldFromUtterance(prompt);
      const intent = parseAdaptationIntent(prompt, surfaceStore.getState());
      let adaptation = { action: 'none', changed: false, summary: '' };

      if (intent.action === 'reset') {
        const res = surfaceStore.reset({ source: 'conversation' });
        projector?.clearBones?.();
        adaptation = { action: 'reset', changed: res.changed, summary: intent.summary };
      } else if (worldMatch && projector) {
        if (worldMatch.kind === 'world') {
          const applied = projector.applyWorld(worldMatch.world.id, { source: 'world' });
          adaptation = { action: 'world', changed: Boolean(applied), summary: applied?.name || '' };
        } else if (worldMatch.kind === 'surprise') {
          surpriseCounter += 1;
          const seed = (Date.now() % 10000) + surpriseCounter * 17;
          const res = projector.surprise({ temperature: 0.95, seed, source: 'world' });
          adaptation = { action: 'surprise', changed: true, summary: res.worldId };
        }
      } else if (intent.action === 'undo') {
        const res = surfaceStore.undo({ source: 'conversation' });
        adaptation = { action: 'undo', changed: res.changed, summary: intent.summary };
      } else if (intent.action === 'patch') {
        if (intent.patch?.atmosphere?.background) {
          projector?.clearBones?.();
        }
        const res = surfaceStore.applyPatch(intent.patch, {
          source: 'conversation',
          summary: intent.summary,
          focusControls: intent.focusControls,
        });
        adaptation = {
          action: 'patch',
          changed: res.changed,
          changedPaths: res.changedPaths,
          summary: intent.summary,
        };
      }

      if (typeof onAdapted === 'function' && adaptation.changed) {
        try { onAdapted(adaptation, surfaceStore.getState()); } catch { /* non-fatal */ }
      }

      const result = await innerAgent.respond(prompt, opts);
      const { text: stripped, modelPatch } = extractModelSurfacePatch(result?.text ?? '');

      if (modelPatch && intent.action === 'none') {
        const modelRes = surfaceStore.applyPatch(modelPatch, {
          source: 'model',
          summary: 'Vom Gespräch abgeleitete Anpassung',
        });
        if (modelRes.changed) {
          adaptation = {
            action: 'model-patch',
            changed: true,
            changedPaths: modelRes.changedPaths,
            summary: 'Oberfläche im Gespräch angepasst',
          };
          if (typeof onAdapted === 'function') {
            try { onAdapted(adaptation, surfaceStore.getState()); } catch { /* non-fatal */ }
          }
        }
      }

      const activeLength = surfaceStore.getState().communication.responseLength;
      const safeVisible = stripped || (result?.text && /<\/?surface\b/i.test(result.text) ? emptyReplyFallback(prompt) : (result?.text || ''));
      const finalText = enforceResponseLength(safeVisible, activeLength);

      return {
        ...result,
        text: finalText,
        adaptation,
      };
    },
  };
}
