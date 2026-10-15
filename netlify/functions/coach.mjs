// SayIt · coach con IA (Netlify Function)
// Necesita la variable de entorno OPENAI_API_KEY en Netlify.
// Modos: chat, write, evaluate, pron (audio).

const TEXT_MODEL = Netlify.env.get('COACH_MODEL') || 'gpt-5.4-mini';
const AUDIO_MODEL = Netlify.env.get('AUDIO_MODEL') || 'gpt-audio-mini';
const MAX_TEXT = 2000;
const MAX_AUDIO_B64 = 1_400_000; // ~20 s de WAV 16 kHz mono

const learner = name => `The learner is ${String(name || 'an adult learner').slice(0, 40)}, an adult from Argentina whose first language is Spanish (rioplatense). Write every explanation for her in simple Spanish from Argentina, using "vos". Be warm, specific and encouraging, never patronising.`;

const correction = {
  type: 'object', additionalProperties: false,
  required: ['wrong', 'right', 'why_es'],
  properties: { wrong: { type: 'string' }, right: { type: 'string' }, why_es: { type: 'string' } }
};

const SCHEMAS = {
  chat: {
    type: 'object', additionalProperties: false,
    required: ['reply', 'feedback_es', 'corrections'],
    properties: {
      reply: { type: 'string', description: 'Next line of the role-play, in English, 1-3 sentences, ending with a question or prompt that keeps the conversation going.' },
      feedback_es: { type: 'string', description: 'One short tip in Spanish about the learner\'s last message, or empty string if nothing useful to say.' },
      corrections: { type: 'array', description: 'At most 2 items.', items: correction }
    }
  },
  write: {
    type: 'object', additionalProperties: false,
    required: ['corrected', 'natural', 'explanation_es', 'corrections', 'cefr', 'score'],
    properties: {
      corrected: { type: 'string', description: 'The learner text with only the necessary corrections.' },
      natural: { type: 'string', description: 'A more natural version a native speaker would write, same meaning.' },
      explanation_es: { type: 'string', description: 'Two or three sentences in Spanish: what was good and the main thing to improve.' },
      corrections: { type: 'array', description: 'At most 4 items.', items: correction },
      cefr: { type: 'string', enum: ['A1', 'A2', 'B1', 'B2', 'C1'] },
      score: { type: 'integer', description: '0 to 100' }
    }
  },
  evaluate: {
    type: 'object', additionalProperties: false,
    required: ['cefr', 'score', 'strengths_es', 'focus_es'],
    properties: {
      cefr: { type: 'string', enum: ['A1', 'A2', 'B1', 'B2', 'C1'] },
      score: { type: 'integer', description: '0 to 100. How well the answer fits its CEFR band: 0 bottom, 100 top.' },
      strengths_es: { type: 'string' },
      focus_es: { type: 'string' }
    }
  }
};

function prompts(body) {
  const level = String(body.level || 'B1').slice(0, 3);
  switch (body.mode) {
    case 'chat': {
      const s = body.scenario || {};
      return {
        instructions: `${learner(body.name)}\nYou are running a spoken English role-play. Scenario: ${String(s.title || 'Free conversation').slice(0, 120)}. Your role: ${String(s.role || 'a friendly conversation partner').slice(0, 600)}\nThe learner's level is about ${level}: adapt your vocabulary and sentence length to it (slightly above her level). Stay in character. Keep replies short, because they will be read aloud. Do not correct inside the reply; put corrections in "corrections" only when the error matters (grammar, wrong word, Spanish calque). Ignore missing punctuation and capitals: her text comes from speech recognition. Weekly language focus: ${String(body.focus || '').slice(0, 200)}.`,
        input: JSON.stringify({ conversation_so_far: history(body.history), learner_said: text(body.text) }),
        schema: 'chat'
      };
    }
    case 'write':
      return {
        instructions: `${learner(body.name)}\nYou are an English writing coach. Correct the learner's text, keep her voice and meaning, explain the most useful points in Spanish and estimate the CEFR level of the text. Her level is about ${level}. Task: ${String(body.task || 'free writing').slice(0, 300)}`,
        input: text(body.text),
        schema: 'write'
      };
    case 'evaluate':
      return {
        instructions: `${learner(body.name)}\nYou are a certified CEFR examiner. Rate this ${body.kind === 'speaking' ? 'spoken answer (transcribed automatically by speech recognition, so ignore punctuation and capitalisation and judge range, accuracy, coherence and length' : 'written answer (judge range, accuracy, coherence and task achievement'}). Task given: ${String(body.task || '').slice(0, 300)}. ${body.seconds ? `She spoke for about ${Math.round(body.seconds)} seconds.` : ''} Be fair and calibrated: very short answers cannot show a high level.`,
        input: text(body.text),
        schema: 'evaluate'
      };
    default:
      return null;
  }
}

const text = t => String(t || '').slice(0, MAX_TEXT);
const history = h => (Array.isArray(h) ? h.slice(-10) : []).map(m => ({ role: m.role === 'coach' ? 'coach' : 'learner', text: String(m.text || '').slice(0, 600) }));

function pickText(data) {
  if (typeof data.output_text === 'string' && data.output_text) return data.output_text;
  const parts = [];
  for (const item of data.output || []) {
    if (item.type !== 'message') continue;
    for (const c of item.content || []) if (c.type === 'output_text' && c.text) parts.push(c.text);
  }
  return parts.join('');
}

async function callText(key, p) {
  const r = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    body: JSON.stringify({
      model: TEXT_MODEL,
      instructions: p.instructions,
      input: p.input,
      text: { format: { type: 'json_schema', name: p.schema, strict: true, schema: SCHEMAS[p.schema] } }
    })
  });
  const data = await r.json();
  if (!r.ok) throw Object.assign(new Error(data?.error?.message || 'La IA no respondió.'), { status: r.status });
  return JSON.parse(pickText(data));
}

async function callAudio(key, body) {
  const audio = String(body.audio || '');
  if (!audio || audio.length > MAX_AUDIO_B64) throw Object.assign(new Error('La grabación es demasiado larga o está vacía.'), { status: 400 });
  const target = text(body.target).slice(0, 300);
  const instructions = `${learner(body.name)}\nYou are a pronunciation coach specialised in Spanish speakers. Listen to the recording. She was trying to say: "${target}". Focus: ${String(body.focus || 'general clarity').slice(0, 200)}. Judge intelligibility, the specific sounds and word stress. Answer ONLY with JSON, no markdown, with this shape: {"score": integer 0-100, "summary_es": "one or two sentences in Spanish", "words": [{"word": "...", "ok": true|false, "tip_es": "short tip in Spanish, empty if ok"}]}. Include in "words" only the 1-4 words that matter most. If the audio is silent or unrelated, return score 0 and explain it.`;
  const r = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + key },
    body: JSON.stringify({
      model: AUDIO_MODEL,
      modalities: ['text'],
      messages: [
        { role: 'system', content: instructions },
        { role: 'user', content: [{ type: 'text', text: 'Here is my recording.' }, { type: 'input_audio', input_audio: { data: audio, format: 'wav' } }] }
      ]
    })
  });
  const data = await r.json();
  if (!r.ok) throw Object.assign(new Error(data?.error?.message || 'No se pudo analizar el audio.'), { status: r.status });
  const raw = data?.choices?.[0]?.message?.content || '';
  const m = String(raw).match(/\{[\s\S]*\}/);
  if (!m) throw Object.assign(new Error('La IA no devolvió un resultado válido.'), { status: 502 });
  return JSON.parse(m[0]);
}

export default async (req) => {
  if (req.method === 'GET') {
    return Response.json({ ok: true, ai: Boolean(Netlify.env.get('OPENAI_API_KEY')) });
  }
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });

  // Solo acepta pedidos desde la propia app
  const origin = req.headers.get('origin');
  if (origin && new URL(origin).host !== new URL(req.url).host) {
    return Response.json({ error: 'Origen no permitido.' }, { status: 403 });
  }

  const key = Netlify.env.get('OPENAI_API_KEY');
  if (!key) return Response.json({ error: 'El coach con IA todavía no está configurado (falta OPENAI_API_KEY en Netlify).' }, { status: 503 });

  let body;
  try { body = await req.json(); } catch { return Response.json({ error: 'Pedido inválido.' }, { status: 400 }); }

  try {
    if (body.mode === 'pron') return Response.json(await callAudio(key, body));
    const p = prompts(body);
    if (!p) return Response.json({ error: 'Modo desconocido.' }, { status: 400 });
    if (!text(body.text).trim()) return Response.json({ error: 'No hay texto para revisar.' }, { status: 400 });
    return Response.json(await callText(key, p));
  } catch (e) {
    const status = e.status && e.status >= 400 && e.status < 600 ? e.status : 500;
    return Response.json({ error: e.message || 'No se pudo procesar el pedido.' }, { status });
  }
};

export const config = {
  path: '/api/coach',
  rateLimit: { windowLimit: 40, windowSize: 60, aggregateBy: ['ip', 'domain'] }
};
