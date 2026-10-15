// SayIt · voz: lectura en voz alta, reconocimiento de voz y grabación

/* ---------- Texto a voz ---------- */
let voices = [];
function loadVoices() {
  if (!('speechSynthesis' in window)) return;
  voices = speechSynthesis.getVoices().filter(v => /^en[-_]/i.test(v.lang));
}
if ('speechSynthesis' in window) {
  loadVoices();
  speechSynthesis.onvoiceschanged = loadVoices;
}
export const ttsSupported = () => 'speechSynthesis' in window;
export const englishVoices = () => { loadVoices(); return voices; };

export const ttsSettings = { voiceURI: '', rate: 0.92 };

function pickVoice() {
  loadVoices();
  if (ttsSettings.voiceURI) {
    const v = voices.find(x => x.voiceURI === ttsSettings.voiceURI);
    if (v) return v;
  }
  return voices.find(v => /en[-_]US/i.test(v.lang) && /google/i.test(v.name))
    || voices.find(v => /en[-_]US/i.test(v.lang))
    || voices[0] || null;
}

export function speak(text, { slow = false, rate } = {}) {
  return new Promise(resolve => {
    if (!ttsSupported()) return resolve(false);
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    const v = pickVoice();
    if (v) u.voice = v;
    u.lang = v ? v.lang : 'en-US';
    u.rate = rate || (slow ? Math.max(0.55, ttsSettings.rate - 0.3) : ttsSettings.rate);
    let done = false;
    const end = ok => { if (!done) { done = true; resolve(ok); } };
    u.onend = () => end(true);
    u.onerror = () => end(false);
    // Algunos Android no disparan onend: corte de seguridad
    setTimeout(() => end(true), 1200 + text.length * 120 / u.rate);
    speechSynthesis.speak(u);
  });
}
export const stopSpeaking = () => { if (ttsSupported()) speechSynthesis.cancel(); };

/* ---------- Reconocimiento de voz ---------- */
const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
export const srSupported = () => Boolean(SR);

// Devuelve un controlador { promise, stop() }. onPartial recibe el texto parcial.
export function listen({ continuous = false, maxMs = 15000, onPartial } = {}) {
  if (!SR) {
    return { promise: Promise.reject(new Error('Este navegador no reconoce voz. Usá Chrome en Android.')), stop() {} };
  }
  const r = new SR();
  r.lang = 'en-US';
  r.interimResults = true;
  r.continuous = continuous;
  r.maxAlternatives = 1;
  const started = Date.now();
  let finalText = '', interim = '', conf = [], stopped = false, timer;
  const promise = new Promise((resolve, reject) => {
    r.onresult = e => {
      // Reconstruye todo desde cero en cada evento: evita duplicados de Chrome Android
      let fin = '', inter = ''; conf = [];
      for (let i = 0; i < e.results.length; i++) {
        const res = e.results[i];
        if (res.isFinal) { fin += res[0].transcript + ' '; if (res[0].confidence) conf.push(res[0].confidence); }
        else inter += res[0].transcript;
      }
      finalText = fin.trim(); interim = inter.trim();
      if (onPartial) onPartial((finalText + ' ' + interim).trim());
    };
    r.onerror = e => {
      if (e.error === 'no-speech' || e.error === 'aborted') return;
      clearTimeout(timer);
      const msg = e.error === 'not-allowed' || e.error === 'service-not-allowed'
        ? 'No hay permiso para usar el micrófono. Habilitalo en la configuración del sitio.'
        : e.error === 'network' ? 'El reconocimiento de voz necesita conexión a internet.'
        : 'No se pudo escuchar (' + e.error + ').';
      reject(new Error(msg));
    };
    r.onend = () => {
      clearTimeout(timer);
      const text = (finalText || interim).trim();
      resolve({
        text,
        confidence: conf.length ? conf.reduce((a, b) => a + b, 0) / conf.length : 0,
        seconds: (Date.now() - started) / 1000
      });
    };
  });
  try { r.start(); } catch (e) { /* ya iniciado */ }
  timer = setTimeout(() => { try { r.stop(); } catch (e) {} }, maxMs);
  return { promise, stop() { if (!stopped) { stopped = true; try { r.stop(); } catch (e) {} } } };
}

/* ---------- Grabación con forma de onda ---------- */
export const recSupported = () => Boolean(navigator.mediaDevices?.getUserMedia && window.MediaRecorder);

export async function startRecording(canvas, { maxMs = 15000 } = {}) {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } });
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  const src = ctx.createMediaStreamSource(stream);
  const analyser = ctx.createAnalyser();
  analyser.fftSize = 1024;
  src.connect(analyser);
  const rec = new MediaRecorder(stream);
  const chunks = [];
  rec.ondataavailable = e => e.data.size && chunks.push(e.data);
  rec.start();

  const g = canvas?.getContext('2d');
  const buf = new Uint8Array(analyser.fftSize);
  const peaks = [];
  let raf;
  const color = getComputedStyle(document.documentElement).getPropertyValue('--coral').trim() || '#c73b33';
  function draw() {
    if (!g) return;
    const w = canvas.width = canvas.clientWidth * devicePixelRatio;
    const h = canvas.height = canvas.clientHeight * devicePixelRatio;
    analyser.getByteTimeDomainData(buf);
    let peak = 0;
    for (const v of buf) peak = Math.max(peak, Math.abs(v - 128) / 128);
    peaks.push(peak);
    const bars = Math.floor(w / (6 * devicePixelRatio));
    const view = peaks.slice(-bars);
    g.clearRect(0, 0, w, h);
    g.fillStyle = color;
    view.forEach((p, i) => {
      const bh = Math.max(3 * devicePixelRatio, p * h * 1.6);
      g.fillRect(i * 6 * devicePixelRatio, (h - bh) / 2, 3.5 * devicePixelRatio, Math.min(h, bh));
    });
    raf = requestAnimationFrame(draw);
  }
  draw();

  let resolveStop;
  const done = new Promise(res => (resolveStop = res));
  rec.onstop = async () => {
    cancelAnimationFrame(raf);
    stream.getTracks().forEach(t => t.stop());
    ctx.close();
    resolveStop(new Blob(chunks, { type: rec.mimeType || 'audio/webm' }));
  };
  const timer = setTimeout(() => rec.state !== 'inactive' && rec.stop(), maxMs);
  return {
    stop() { clearTimeout(timer); if (rec.state !== 'inactive') rec.stop(); return done; },
    done
  };
}

// Convierte la grabación a WAV 16 kHz mono en base64 (para el análisis con IA)
export async function blobToWavBase64(blob) {
  const AC = window.AudioContext || window.webkitAudioContext;
  const ctx = new AC();
  const decoded = await ctx.decodeAudioData(await blob.arrayBuffer());
  ctx.close();
  const rate = 16000;
  const off = new OfflineAudioContext(1, Math.ceil(decoded.duration * rate), rate);
  const s = off.createBufferSource();
  s.buffer = decoded; s.connect(off.destination); s.start();
  const out = await off.startRendering();
  const pcm = out.getChannelData(0);
  const view = new DataView(new ArrayBuffer(44 + pcm.length * 2));
  const w = (o, str) => [...str].forEach((c, i) => view.setUint8(o + i, c.charCodeAt(0)));
  w(0, 'RIFF'); view.setUint32(4, 36 + pcm.length * 2, true); w(8, 'WAVE'); w(12, 'fmt ');
  view.setUint32(16, 16, true); view.setUint16(20, 1, true); view.setUint16(22, 1, true);
  view.setUint32(24, rate, true); view.setUint32(28, rate * 2, true); view.setUint16(32, 2, true); view.setUint16(34, 16, true);
  w(36, 'data'); view.setUint32(40, pcm.length * 2, true);
  for (let i = 0; i < pcm.length; i++) view.setInt16(44 + i * 2, Math.max(-1, Math.min(1, pcm[i])) * 0x7fff, true);
  const bytes = new Uint8Array(view.buffer);
  let bin = '';
  for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode.apply(null, bytes.subarray(i, i + 0x8000));
  return { base64: btoa(bin), seconds: decoded.duration };
}

/* ---------- Comparar lo dicho con la frase objetivo ---------- */
export const words = s => (s.toLowerCase().replace(/[’']/g, "'").match(/[a-z0-9']+/g) || []);

// Alineación por subsecuencia común más larga: marca qué palabras de la frase se reconocieron
export function matchWords(target, heard) {
  const t = words(target), h = words(heard);
  const norm = w => w.replace(/'/g, '');
  const dp = Array.from({ length: t.length + 1 }, () => new Array(h.length + 1).fill(0));
  for (let i = t.length - 1; i >= 0; i--)
    for (let j = h.length - 1; j >= 0; j--)
      dp[i][j] = norm(t[i]) === norm(h[j]) ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
  const ok = new Array(t.length).fill(false);
  let i = 0, j = 0;
  while (i < t.length && j < h.length) {
    if (norm(t[i]) === norm(h[j])) { ok[i] = true; i++; j++; }
    else if (dp[i + 1][j] >= dp[i][j + 1]) i++;
    else j++;
  }
  const score = t.length ? Math.round(ok.filter(Boolean).length / t.length * 100) : 0;
  return { tokens: t, ok, score };
}
