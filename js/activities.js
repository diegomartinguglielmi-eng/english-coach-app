// SayIt · actividades reutilizables (sesiones, juegos, diagnóstico y chequeos)
import { $, $$, esc, shuffle, pick, icons, toast, wait } from './ui.js';
import { speak, stopSpeaking, listen, srSupported, recSupported, startRecording, blobToWavBase64, matchWords, words, ttsSupported } from './audio.js';
import { coach, aiAvailable } from './api.js';
import { SOUNDS } from './content.js';
import * as store from './store.js';

const speakerBtn = (label = 'Escuchar', attr = 'data-say') => `<button class="speaker" ${attr}>${icons.speaker}${label}</button>`;
const slowBtn = () => `<button class="speaker" data-slow aria-label="Escuchar más lento">${icons.slow}Lento</button>`;

function nextButton(label = 'Seguir') { return `<button class="btn" data-next disabled>${label}</button>`; }
function waitNext(el, value) {
  return new Promise(res => {
    const b = $('[data-next]', el);
    b.onclick = () => { stopSpeaking(); res(typeof value === 'function' ? value() : value); };
  });
}

/* ---------- Tarjeta de explicación ---------- */
export function tipCard(el, { meta = '', title, body, extra = '' }) {
  el.innerHTML = `<div class="stack-lg">
    <div class="stack">${meta ? `<div class="qmeta">${esc(meta)}</div>` : ''}<h2>${esc(title)}</h2><p>${esc(body)}</p>${extra}</div>
    <button class="btn" data-next>Entendido</button></div>`;
  return new Promise(res => { $('[data-next]', el).onclick = () => res({}); });
}

// Completa los huecos: si la opción trae "a / b" y hay dos huecos, va una parte en cada uno
function fill(q, opt) {
  const gaps = (q.match(/_{2,}/g) || []).length;
  const parts = gaps > 1 ? opt.split(' / ') : [opt];
  let k = 0;
  return q.replace(/_{2,}/g, () => parts[Math.min(k++, parts.length - 1)]);
}

/* ---------- Opción múltiple (gramática, vocabulario, lectura, escucha) ---------- */
export function choiceQ(el, { meta = '', q, a, ok, passage, audio, maxPlays = 0, silent = false, explain = '', record }) {
  const order = shuffle(a.map((t, i) => i));
  let plays = 0;
  el.innerHTML = `<div class="stack-lg">
    <div class="stack">
      ${meta ? `<div class="qmeta">${esc(meta)}</div>` : ''}
      ${passage ? `<p class="passage" lang="en">${esc(passage)}</p>` : ''}
      ${audio ? `<div class="row">${speakerBtn('Escuchar')}${maxPlays ? `<span class="small muted" data-plays>Podés escucharlo ${maxPlays} veces</span>` : slowBtn()}</div>` : ''}
      <div class="qtext" lang="en">${esc(q)}</div>
    </div>
    <div class="choices">${order.map(i => `<button class="choice" data-i="${i}" lang="en">${esc(a[i])}</button>`).join('')}</div>
    <div data-fb></div>
    ${nextButton()}</div>`;
  if (audio) {
    $('[data-say]', el).onclick = () => {
      if (maxPlays && plays >= maxPlays) return;
      plays++; speak(audio, { rate: 0.95 });
      if (maxPlays) {
        const left = maxPlays - plays;
        $('[data-plays]', el).textContent = left ? `Te queda ${left} reproducción` : 'Ya no quedan reproducciones';
        if (!left) $('[data-say]', el).disabled = true;
      }
    };
    const s = $('[data-slow]', el); if (s) s.onclick = () => speak(audio, { slow: true });
    setTimeout(() => { if (!plays) $('[data-say]', el)?.click(); }, 350);
  }
  let chosen = null;
  $$('.choice', el).forEach(b => b.onclick = () => {
    if (!silent && chosen !== null) return;
    chosen = +b.dataset.i;
    $$('.choice', el).forEach(c => c.classList.remove('picked'));
    if (silent) { b.classList.add('picked'); }
    else {
      $$('.choice', el).forEach(c => { c.disabled = true; if (+c.dataset.i === ok) c.classList.add('right'); });
      if (chosen !== ok) {
        b.classList.add('wrong');
        if (record !== false) store.addMistake({ wrong: fill(q, a[chosen]), right: fill(q, a[ok]), why: explain });
      }
      $('[data-fb]', el).innerHTML = chosen === ok
        ? `<div class="note good">${pick(['¡Muy bien!', 'Exacto.', '¡Eso es!', 'Perfecto.'])}</div>`
        : `<div class="note bad">La respuesta correcta es <b lang="en">${esc(a[ok])}</b>.${explain ? ' ' + esc(explain) : ''}</div>`;
    }
    $('[data-next]', el).disabled = false;
  });
  return waitNext(el, () => ({ ok: chosen === ok }));
}

/* ---------- Ordenar palabras ---------- */
export function orderQ(el, { meta = 'Armá la frase', sentence, es = '' }) {
  const toks = sentence.replace(/[.?!]$/, '').split(/\s+/);
  let bank = shuffle(toks.map((t, i) => ({ t, i })));
  if (bank.map(x => x.t).join(' ') === toks.join(' ')) bank = bank.reverse();
  let placed = [];
  el.innerHTML = `<div class="stack-lg">
    <div class="stack"><div class="qmeta">${esc(meta)}</div>
    <div class="qtext">Tocá las palabras en orden</div>${es ? `<p class="muted">${esc(es)}</p>` : ''}</div>
    <div class="slots" data-slots aria-label="Tu frase"></div>
    <div class="bank" data-bank></div>
    <div data-fb></div>
    <div class="btn-row"><button class="btn ghost" data-clear>Borrar</button><button class="btn" data-check disabled>Comprobar</button></div>
    ${nextButton()}</div>`;
  $('[data-next]', el).classList.add('hidden');
  const draw = () => {
    $('[data-slots]', el).innerHTML = placed.map((x, k) => `<button class="chip" data-k="${k}" lang="en">${esc(x.t)}</button>`).join('');
    $('[data-bank]', el).innerHTML = bank.map((x, k) => `<button class="chip" data-b="${k}" lang="en">${esc(x.t)}</button>`).join('');
    $$('[data-b]', el).forEach(b => b.onclick = () => { placed.push(bank.splice(+b.dataset.b, 1)[0]); draw(); });
    $$('[data-k]', el).forEach(b => b.onclick = () => { bank.push(placed.splice(+b.dataset.k, 1)[0]); draw(); });
    $('[data-check]', el).disabled = bank.length > 0;
  };
  draw();
  let result = false;
  $('[data-clear]', el).onclick = () => { bank = bank.concat(placed); placed = []; draw(); };
  $('[data-check]', el).onclick = () => {
    const mine = placed.map(x => x.t).join(' ');
    result = mine.toLowerCase() === toks.join(' ').toLowerCase();
    $('[data-fb]', el).innerHTML = result
      ? `<div class="note good">¡Muy bien! <span lang="en">${esc(sentence)}</span></div>`
      : `<div class="note bad">La frase es: <b lang="en">${esc(sentence)}</b></div>`;
    if (!result) store.addMistake({ wrong: mine, right: sentence, why: 'Orden de las palabras.' });
    speak(sentence);
    $('.btn-row', el).classList.add('hidden');
    $$('.chip', el).forEach(c => c.disabled = true);
    const n = $('[data-next]', el); n.classList.remove('hidden'); n.disabled = false;
  };
  return waitNext(el, () => ({ ok: result }));
}

/* ---------- Dictado ---------- */
export function dictation(el, { meta = 'Dictado', sentence }) {
  el.innerHTML = `<div class="stack-lg">
    <div class="stack"><div class="qmeta">${esc(meta)}</div><div class="qtext">Escuchá y escribí la frase</div>
    <div class="row">${speakerBtn()}${slowBtn()}</div></div>
    <input type="text" data-in autocomplete="off" autocapitalize="sentences" spellcheck="false" lang="en" placeholder="Escribí lo que escuchás…">
    <div data-fb></div>
    <button class="btn" data-check>Comprobar</button>
    ${nextButton()}</div>`;
  $('[data-next]', el).classList.add('hidden');
  $('[data-say]', el).onclick = () => speak(sentence);
  $('[data-slow]', el).onclick = () => speak(sentence, { slow: true });
  setTimeout(() => speak(sentence), 350);
  let score = 0;
  $('[data-check]', el).onclick = () => {
    const v = $('[data-in]', el).value;
    if (!v.trim()) { $('[data-in]', el).focus(); return; }
    const m = matchWords(sentence, v);
    score = m.score;
    const shown = sentence.split(/\s+/).map((w, i) => `<span class="${m.ok[i] ? 'w-ok' : 'w-miss'}">${esc(w)}</span>`).join(' ');
    $('[data-fb]', el).innerHTML = `<div class="note ${score >= 85 ? 'good' : score >= 50 ? 'warm' : 'bad'}"><p class="heard" lang="en">${shown}</p><p class="small">${score >= 85 ? '¡Excelente oído!' : 'Las palabras subrayadas son las que faltaron o cambiaron.'}</p></div>`;
    $('[data-check]', el).classList.add('hidden');
    const n = $('[data-next]', el); n.classList.remove('hidden'); n.disabled = false;
  };
  return waitNext(el, () => ({ ok: score >= 85, score }));
}

/* ---------- Tarjetas de vocabulario con repetición espaciada ---------- */
export function flashcards(el, { cards, title = 'Palabras' }) {
  return new Promise(res => {
    let q = [...cards], again = 0, seen = 0;
    const total = cards.length;
    const show = () => {
      if (!q.length) return res({ count: total, again });
      const c = q[0];
      el.innerHTML = `<div class="stack-lg">
        <div class="row between"><div class="qmeta">${esc(title)}${c.isNew ? ' · nueva' : ' · repaso'}</div><div class="qmeta">${Math.min(seen + 1, total)} de ${total}</div></div>
        <div class="flash" data-card>
          <div class="front" lang="en">${esc(c.en)}</div>
          <div class="ex" lang="en">${esc(c.ex || '')}</div>
          <div class="back hidden" data-back>${esc(c.es)}</div>
        </div>
        <div class="row" style="justify-content:center">${speakerBtn('Escuchar')}</div>
        <button class="btn" data-flip>Ver significado</button>
        <div class="grade hidden" data-grade>
          <button class="again" data-g="0">No me acordaba</button>
          <button class="good" data-g="1">Me costó</button>
          <button class="easy" data-g="2">Fácil</button>
        </div></div>`;
      $('[data-say]', el).onclick = () => speak(c.ex ? `${c.en}. ${c.ex}` : c.en);
      speak(c.en);
      $('[data-flip]', el).onclick = () => {
        $('[data-back]', el).classList.remove('hidden');
        $('[data-flip]', el).classList.add('hidden');
        $('[data-grade]', el).classList.remove('hidden');
      };
      $$('[data-g]', el).forEach(b => b.onclick = () => {
        const g = +b.dataset.g;
        store.srsGrade(c.key, g);
        q.shift();
        if (g === 0) { again++; q.splice(Math.min(2, q.length), 0, c); } else seen++;
        show();
      });
    };
    show();
  });
}

/* ---------- Juego de pares mínimos ---------- */
export function pairsGame(el, { soundId, rounds = 8, meta }) {
  const s = SOUNDS[soundId];
  if (s.type === 'classify') return classifyGame(el, { soundId, rounds, meta });
  if (s.type === 'stress') return stressGame(el, { soundId, rounds, meta });
  return new Promise(res => {
    let r = 0, okCount = 0;
    const list = shuffle(s.pairs);
    const round = () => {
      if (r >= rounds) return res({ ok: okCount, total: rounds });
      const pair = list[r % list.length];
      const answer = Math.random() < 0.5 ? 0 : 1;
      const said = pair[answer];
      el.innerHTML = `<div class="stack-lg">
        <div class="row between"><div class="qmeta">${esc(meta || s.name)} <span class="ipa">${esc(s.ipa)}</span></div><div class="qmeta">${r + 1} de ${rounds}</div></div>
        <div class="progress gold"><i style="width:${r / rounds * 100}%"></i></div>
        <div class="qtext">${s.pairsNote ? esc(s.pairsNote) : '¿Qué palabra escuchaste?'}</div>
        <div class="row">${speakerBtn('Otra vez')}${slowBtn()}</div>
        <div class="choices" style="grid-template-columns:1fr 1fr">${pair.map((w, i) => `<button class="choice center" data-i="${i}" lang="en" style="font-family:var(--display);font-size:24px;font-weight:650">${esc(w)}</button>`).join('')}</div>
        <div data-fb></div>
        ${nextButton()}</div>`;
      const play = slow => speak(s.pairsNote ? pair[0] : said, { slow });
      $('[data-say]', el).onclick = () => play(false);
      $('[data-slow]', el).onclick = () => play(true);
      setTimeout(() => play(false), 300);
      const correct = s.pairsNote ? 0 : answer;
      $$('.choice', el).forEach(b => b.onclick = () => {
        const i = +b.dataset.i, good = i === correct;
        if (good) okCount++;
        store.soundResult(soundId, good);
        $$('.choice', el).forEach(c => { c.disabled = true; if (+c.dataset.i === correct) c.classList.add('right'); });
        if (!good) b.classList.add('wrong');
        $('[data-fb]', el).innerHTML = `<div class="note ${good ? 'good' : 'bad'}">${good ? '¡Bien escuchado!' : 'Era <b lang="en">' + esc(pair[correct]) + '</b>.'} Escuchá las dos:
          <div class="row" style="margin-top:8px">${pair.map((w, k) => `<button class="speaker" data-w="${k}" lang="en">${icons.speaker}${esc(w)}</button>`).join('')}</div></div>`;
        $$('[data-w]', el).forEach(x => x.onclick = () => speak(pair[+x.dataset.w], { slow: true }));
        $('[data-next]', el).disabled = false;
      });
      $('[data-next]', el).onclick = () => { r++; round(); };
    };
    round();
  });
}

function classifyGame(el, { soundId, rounds = 8, meta }) {
  const s = SOUNDS[soundId];
  const opts = [['t', '/t/', 'worked'], ['d', '/d/', 'played'], ['id', '/ɪd/', 'wanted']];
  return new Promise(res => {
    let r = 0, okCount = 0;
    const list = shuffle(s.words);
    const round = () => {
      if (r >= rounds) return res({ ok: okCount, total: rounds });
      const [w, cat] = list[r % list.length];
      el.innerHTML = `<div class="stack-lg">
        <div class="row between"><div class="qmeta">${esc(meta || s.name)}</div><div class="qmeta">${r + 1} de ${rounds}</div></div>
        <div class="progress gold"><i style="width:${r / rounds * 100}%"></i></div>
        <div class="qtext">¿Cómo suena la -ed?</div>
        <div class="target center" lang="en">${esc(w)}</div>
        <div class="row" style="justify-content:center">${speakerBtn()}</div>
        <div class="choices" style="grid-template-columns:repeat(3,1fr)">${opts.map(([k, ipa, ex]) => `<button class="choice center" data-k="${k}"><b class="ipa" style="font-size:22px">${ipa}</b><br><span class="small muted" lang="en">como ${ex}</span></button>`).join('')}</div>
        <div data-fb></div>${nextButton()}</div>`;
      $('[data-say]', el).onclick = () => speak(w, { slow: true });
      setTimeout(() => speak(w), 300);
      $$('.choice', el).forEach(b => b.onclick = () => {
        const good = b.dataset.k === cat;
        if (good) okCount++;
        store.soundResult(soundId, good);
        $$('.choice', el).forEach(c => { c.disabled = true; if (c.dataset.k === cat) c.classList.add('right'); });
        if (!good) b.classList.add('wrong');
        const why = cat === 't' ? 'Termina en un sonido sordo, entonces la -ed suena /t/.' : cat === 'd' ? 'Termina en un sonido con voz, entonces la -ed suena /d/.' : 'Termina en t o d, entonces se agrega la sílaba /ɪd/.';
        $('[data-fb]', el).innerHTML = `<div class="note ${good ? 'good' : 'bad'}">${good ? '¡Exacto! ' : ''}${why}</div>`;
        $('[data-next]', el).disabled = false;
      });
      $('[data-next]', el).onclick = () => { r++; round(); };
    };
    round();
  });
}

function stressGame(el, { soundId, rounds = 8, meta }) {
  const s = SOUNDS[soundId];
  return new Promise(res => {
    let r = 0, okCount = 0;
    const list = shuffle(s.words);
    const round = () => {
      if (r >= rounds) return res({ ok: okCount, total: rounds });
      const [w, syl, st] = list[r % list.length];
      el.innerHTML = `<div class="stack-lg">
        <div class="row between"><div class="qmeta">${esc(meta || s.name)}</div><div class="qmeta">${r + 1} de ${rounds}</div></div>
        <div class="progress gold"><i style="width:${r / rounds * 100}%"></i></div>
        <div class="qtext">¿Qué sílaba suena más fuerte?</div>
        <div class="row" style="justify-content:center">${speakerBtn()}${slowBtn()}</div>
        <div class="choices" style="grid-template-columns:repeat(${syl.length},1fr)">${syl.map((x, i) => `<button class="choice center" data-i="${i}" lang="en" style="font-family:var(--display);font-size:22px;padding:14px 4px">${esc(x)}</button>`).join('')}</div>
        <div data-fb></div>${nextButton()}</div>`;
      $('[data-say]', el).onclick = () => speak(w);
      $('[data-slow]', el).onclick = () => speak(w, { slow: true });
      setTimeout(() => speak(w), 300);
      $$('.choice', el).forEach(b => b.onclick = () => {
        const good = +b.dataset.i === st;
        if (good) okCount++;
        store.soundResult(soundId, good);
        $$('.choice', el).forEach(c => { c.disabled = true; if (+c.dataset.i === st) c.classList.add('right'); });
        if (!good) b.classList.add('wrong');
        const shown = syl.map((x, i) => i === st ? `<b style="text-transform:uppercase">${esc(x)}</b>` : esc(x)).join('·');
        $('[data-fb]', el).innerHTML = `<div class="note ${good ? 'good' : 'bad'}"><span lang="en" style="font-size:20px">${shown}</span></div>`;
        $('[data-next]', el).disabled = false;
      });
      $('[data-next]', el).onclick = () => { r++; round(); };
    };
    round();
  });
}

/* ---------- Repetí conmigo: pronunciación ---------- */
function markedSentence(sentence, m) {
  // Recorre la frase original y pinta cada palabra según si se reconoció
  let k = 0;
  return sentence.split(/\s+/).map(chunk => {
    const n = words(chunk).length;
    const ok = n ? m.ok.slice(k, k + n).every(Boolean) : true;
    k += n;
    return `<span class="${ok ? 'w-ok' : 'w-miss'}">${esc(chunk)}</span>`;
  }).join(' ');
}

export function shadow(el, { sentence, soundId, meta = 'Repetí conmigo', allowSkip = true }) {
  const s = soundId ? SOUNDS[soundId] : null;
  let best = 0, attempts = 0, blobUrl = null, wav = null;
  el.innerHTML = `<div class="stack-lg">
    <div class="stack"><div class="qmeta">${esc(meta)}${s ? ` · <span class="ipa">${esc(s.ipa)}</span>` : ''}</div>
      <div class="target" lang="en">${esc(sentence)}</div>
      <div class="row">${speakerBtn('Escuchar')}${slowBtn()}</div></div>
    <div class="panel voice">
      <button class="mic" data-mic aria-label="Decir la frase">${icons.mic}</button>
      <p class="small muted center" data-status>${srSupported() ? 'Escuchala, tocá el micrófono y decila en voz alta.' : 'Este navegador no reconoce voz. Podés grabarte y comparar abajo.'}</p>
      <p class="heard center" data-heard lang="en"></p>
    </div>
    ${recSupported() ? `<details class="panel tight" data-recbox><summary>Grabarme y comparar con el modelo</summary>
      <div class="stack" style="margin-top:12px">
        <canvas class="wave" data-wave></canvas>
        <div class="btn-row"><button class="btn ghost small" data-rec>${icons.mic} Grabar</button><button class="btn ghost small" data-play disabled>Escucharme</button></div>
        <button class="btn quiet hidden" data-ai>Pedir análisis a la IA</button>
        <div data-aifb></div>
      </div></details>` : ''}
    <div data-fb></div>
    ${nextButton()}</div>`;
  $('[data-say]', el).onclick = () => speak(sentence);
  $('[data-slow]', el).onclick = () => speak(sentence, { slow: true });
  setTimeout(() => speak(sentence), 300);
  if (allowSkip) $('[data-next]', el).disabled = false;

  const mic = $('[data-mic]', el);
  let ctrl = null;
  mic.onclick = async () => {
    if (!srSupported()) return toast('Probá con Chrome en Android para usar el micrófono.');
    if (ctrl) { ctrl.stop(); return; }
    stopSpeaking();
    mic.classList.add('live'); mic.innerHTML = icons.stop;
    $('[data-status]', el).textContent = 'Te escucho…';
    ctrl = listen({ maxMs: 12000, onPartial: t => { $('[data-heard]', el).textContent = t; } });
    try {
      const r = await ctrl.promise;
      attempts++;
      if (!r.text) { $('[data-status]', el).textContent = 'No te escuché. Tocá el micrófono y probá de nuevo.'; return; }
      const m = matchWords(sentence, r.text);
      best = Math.max(best, m.score);
      $('[data-heard]', el).innerHTML = markedSentence(sentence, m);
      $('[data-status]', el).textContent = `Te entendí el ${m.score}% de las palabras.`;
      $('[data-fb]', el).innerHTML = m.score >= 90
        ? `<div class="note good">¡Muy clara! Si querés, grabate abajo para escuchar tu entonación.</div>`
        : `<div class="note warm">Las palabras en rojo no se entendieron. Escuchá el modelo en "Lento" y repetí.${s ? `<br><span class="small">${esc(s.tip)}</span>` : ''}</div>`;
      if (soundId) store.soundResult(soundId, m.score >= 80);
      $('[data-next]', el).disabled = false;
    } catch (e) {
      $('[data-status]', el).textContent = e.message;
    } finally {
      ctrl = null; mic.classList.remove('live'); mic.innerHTML = icons.mic;
    }
  };

  if (recSupported()) {
    const recBtn = $('[data-rec]', el), playBtn = $('[data-play]', el), aiBtn = $('[data-ai]', el);
    let rec = null;
    recBtn.onclick = async () => {
      if (rec) { recBtn.disabled = true; const blob = await rec.stop(); rec = null; recBtn.disabled = false; recBtn.innerHTML = `${icons.mic} Grabar de nuevo`; return gotBlob(blob); }
      try {
        stopSpeaking();
        rec = await startRecording($('[data-wave]', el), { maxMs: 15000 });
        recBtn.innerHTML = `${icons.stop} Terminar`;
        rec.done.then(b => { if (rec) { rec = null; recBtn.innerHTML = `${icons.mic} Grabar de nuevo`; gotBlob(b); } });
      } catch (e) { toast('No se pudo usar el micrófono. Revisá los permisos del sitio.'); }
    };
    const gotBlob = blob => {
      if (blobUrl) URL.revokeObjectURL(blobUrl);
      blobUrl = URL.createObjectURL(blob); wav = blob;
      playBtn.disabled = false;
      aiAvailable().then(ok => aiBtn.classList.toggle('hidden', !ok));
    };
    playBtn.onclick = async () => {
      await speak(sentence);
      await wait(250);
      new Audio(blobUrl).play();
    };
    aiBtn.onclick = async () => {
      aiBtn.disabled = true; aiBtn.textContent = 'Analizando tu pronunciación…';
      try {
        const { base64 } = await blobToWavBase64(wav);
        const r = await coach('pron', { audio: base64, target: sentence, focus: s ? `${s.name} ${s.ipa}` : '' });
        best = Math.max(best, Number(r.score) || 0);
        const ws = (r.words || []).map(w => `<li><b lang="en" class="${w.ok ? 'w-ok' : 'w-miss'}">${esc(w.word)}</b>${w.tip_es ? ': ' + esc(w.tip_es) : ''}</li>`).join('');
        $('[data-aifb]', el).innerHTML = `<div class="note"><b>Puntaje: ${esc(r.score)}</b><p>${esc(r.summary_es || '')}</p>${ws ? `<ul style="margin:8px 0 0;padding-left:20px">${ws}</ul>` : ''}</div>`;
        $('[data-next]', el).disabled = false;
      } catch (e) {
        $('[data-aifb]', el).innerHTML = `<div class="note bad">${esc(e.message)}</div>`;
      } finally { aiBtn.disabled = false; aiBtn.textContent = 'Pedir análisis a la IA'; }
    };
  }
  return waitNext(el, () => { if (ctrl) ctrl.stop(); return { score: best, attempts }; });
}

/* ---------- Hablar libremente (diagnóstico) ---------- */
export function freeSpeak(el, { meta = '', prompt, maxSec = 45, minWords = 8 }) {
  el.innerHTML = `<div class="stack-lg">
    <div class="stack"><div class="qmeta">${esc(meta)}</div><div class="qtext">${esc(prompt)}</div>
    <p class="small muted">Tocá el micrófono, hablá tranquila y tocá de nuevo para terminar. No importa equivocarse.</p></div>
    <div class="panel voice">
      <button class="mic" data-mic aria-label="Empezar a hablar">${icons.mic}</button>
      <p class="small muted center" data-status></p>
      <p class="heard" data-heard lang="en"></p>
    </div>
    <div class="btn-row"><button class="btn ghost" data-skip>Ahora no puedo hablar</button></div>
    ${nextButton()}</div>`;
  let result = { text: '', seconds: 0, skipped: false };
  let ctrl = null;
  const mic = $('[data-mic]', el);
  mic.onclick = async () => {
    if (!srSupported()) { toast('Este navegador no reconoce voz.'); return; }
    if (ctrl) { ctrl.stop(); return; }
    mic.classList.add('live'); mic.innerHTML = icons.stop;
    const t0 = Date.now();
    const tick = setInterval(() => { $('[data-status]', el).textContent = `Grabando… ${Math.round((Date.now() - t0) / 1000)} s`; }, 500);
    ctrl = listen({ continuous: true, maxMs: maxSec * 1000, onPartial: t => { $('[data-heard]', el).textContent = t; } });
    try {
      const r = await ctrl.promise;
      result = { text: r.text, seconds: r.seconds, skipped: false };
      const n = words(r.text).length;
      $('[data-heard]', el).textContent = r.text;
      $('[data-status]', el).textContent = n >= minWords ? `Listo: ${n} palabras en ${Math.round(r.seconds)} segundos.` : 'Fue muy corto. Si podés, tocá el micrófono y contá un poco más.';
      $('[data-next]', el).disabled = n === 0;
    } catch (e) { $('[data-status]', el).textContent = e.message; }
    finally { clearInterval(tick); ctrl = null; mic.classList.remove('live'); mic.innerHTML = icons.mic; }
  };
  return new Promise(res => {
    $('[data-skip]', el).onclick = () => { if (ctrl) ctrl.stop(); res({ text: '', seconds: 0, skipped: true }); };
    $('[data-next]', el).onclick = () => res(result);
  });
}

/* ---------- Escribir ---------- */
export function writing(el, { meta = 'Escribí', prompt, task, useAI = true, minWords = 8, evaluateOnly = false }) {
  el.innerHTML = `<div class="stack-lg">
    <div class="stack"><div class="qmeta">${esc(meta)}</div><div class="qtext">${esc(prompt)}</div></div>
    <textarea data-in lang="en" spellcheck="false" placeholder="Write in English…"></textarea>
    <p class="small muted" data-count>0 palabras</p>
    <div data-fb></div>
    ${evaluateOnly ? '' : '<button class="btn ghost" data-check disabled>Revisar con el coach</button>'}
    ${nextButton()}</div>`;
  const ta = $('[data-in]', el);
  let review = null;
  ta.oninput = () => {
    const n = words(ta.value).length;
    $('[data-count]', el).textContent = `${n} palabra${n === 1 ? '' : 's'}`;
    $('[data-next]', el).disabled = n < (evaluateOnly ? minWords : 1);
    const c = $('[data-check]', el); if (c) c.disabled = n < 3;
  };
  const check = $('[data-check]', el);
  if (check) {
    if (!useAI) check.classList.add('hidden');
    check.onclick = async () => {
      check.disabled = true; check.textContent = 'El coach está leyendo…';
      try {
        review = await coach('write', { text: ta.value, task: task || prompt });
        (review.corrections || []).forEach(c => store.addMistake({ wrong: c.wrong, right: c.right, why: c.why_es }));
        $('[data-fb]', el).innerHTML = `<div class="stack">
          ${review.corrected && review.corrected.trim() !== ta.value.trim() ? `<div class="note"><b>Corregido</b><p lang="en">${esc(review.corrected)}</p></div>` : '<div class="note good"><b>¡Sin errores importantes!</b></div>'}
          ${(review.corrections || []).map(c => `<p class="fixline"><s lang="en">${esc(c.wrong)}</s> → <b lang="en">${esc(c.right)}</b><br><span class="muted">${esc(c.why_es)}</span></p>`).join('')}
          <div class="note warm"><b>Más natural</b><p lang="en">${esc(review.natural)}</p><div class="row" style="margin-top:8px"><button class="speaker" data-nat>${icons.speaker}Escuchar</button></div></div>
          <p>${esc(review.explanation_es)}</p></div>`;
        $('[data-nat]', el).onclick = () => speak(review.natural);
        check.classList.add('hidden');
        store.logActivity(0, 30);
      } catch (e) {
        $('[data-fb]', el).innerHTML = `<div class="note bad">${esc(e.message)}</div>`;
        check.disabled = false; check.textContent = 'Revisar con el coach';
      }
    };
  }
  return waitNext(el, () => ({ text: ta.value, review }));
}

/* ---------- Juego de memoria (inglés-español) ---------- */
export function memoryGame(el, { pairs, meta = 'Memoria' }) {
  return new Promise(res => {
    const set = shuffle(pairs).slice(0, 6);
    const tiles = shuffle(set.flatMap((p, i) => [{ i, t: p[0], en: true }, { i, t: p[1], en: false }]));
    let sel = null, found = 0, misses = 0;
    const t0 = Date.now();
    el.innerHTML = `<div class="stack-lg">
      <div class="row between"><div class="qmeta">${esc(meta)}</div><div class="qmeta" data-time>0 s</div></div>
      <div class="qtext">Uní cada expresión con su significado</div>
      <div class="memgrid">${tiles.map((x, k) => `<button class="mem ${x.en ? 'en' : ''}" data-k="${k}" ${x.en ? 'lang="en"' : ''}>${esc(x.t)}</button>`).join('')}</div>
      <div data-fb></div>${nextButton()}</div>`;
    const timer = setInterval(() => { const t = $('[data-time]', el); if (t) t.textContent = Math.round((Date.now() - t0) / 1000) + ' s'; }, 1000);
    $$('.mem', el).forEach(b => b.onclick = () => {
      const x = tiles[+b.dataset.k];
      if (x.en) speak(x.t);
      if (!sel) { sel = b; b.classList.add('sel'); return; }
      if (sel === b) { b.classList.remove('sel'); sel = null; return; }
      const y = tiles[+sel.dataset.k];
      if (x.i === y.i && x.en !== y.en) {
        found++; [b, sel].forEach(z => { z.classList.add('done'); z.disabled = true; }); sel = null;
        if (found === set.length) {
          clearInterval(timer);
          const secs = Math.round((Date.now() - t0) / 1000);
          $('[data-fb]', el).innerHTML = `<div class="note good">¡Completo en ${secs} segundos${misses ? ` con ${misses} error${misses > 1 ? 'es' : ''}` : ', sin errores'}!</div>`;
          $('[data-next]', el).disabled = false;
          $('[data-next]', el).onclick = () => res({ seconds: secs, misses, ok: set.length, total: set.length });
        }
      } else {
        misses++;
        const a = sel; sel = null;
        [a, b].forEach(z => z.classList.add('miss'));
        setTimeout(() => [a, b].forEach(z => z.classList.remove('miss', 'sel')), 650);
      }
    });
  });
}

/* ---------- Conversación con el coach (rol) ---------- */
export function roleplay(el, { scenario, turns = 4, focus = '', meta = 'Conversación' }) {
  return new Promise(async res => {
    const history = [];
    let learnerTurns = 0, voiceOn = srSupported(), ctrl = null, busy = false;
    el.innerHTML = `<div class="stack-lg">
      <div class="stack"><div class="qmeta">${esc(meta)}</div><h2>${esc(scenario.title)}</h2>
      <p class="small muted" data-hint>${voiceOn ? 'Respondé hablando con el micrófono. Si preferís, escribí.' : 'Escribí tus respuestas en inglés.'}</p></div>
      <div class="chat" data-chat></div>
      <div class="panel voice" data-voice>
        <button class="mic" data-mic aria-label="Responder hablando">${icons.mic}</button>
        <p class="heard center small" data-heard lang="en"></p>
      </div>
      <div class="row"><input type="text" data-in lang="en" placeholder="O escribí tu respuesta…" autocomplete="off"><button class="btn small" data-send>Enviar</button></div>
      <p class="small muted center" data-left></p>
      ${nextButton('Terminar conversación')}</div>`;
    if (!voiceOn) $('[data-voice]', el).classList.add('hidden');
    $('[data-next]', el).disabled = false;
    const chat = $('[data-chat]', el);
    const add = (who, html) => { chat.insertAdjacentHTML('beforeend', html); el.scrollIntoView({ block: 'end', behavior: 'smooth' }); };
    const coachSays = async text => {
      add('coach', `<div class="bubble coach" lang="en">${esc(text)} <button class="speaker" style="min-height:32px;padding:2px 8px;margin-top:4px" data-re="${history.length}" aria-label="Escuchar de nuevo">${icons.speaker}</button></div>`);
      history.push({ role: 'coach', text });
      const btn = $(`[data-re="${history.length - 1}"]`, chat);
      if (btn) btn.onclick = () => speak(text);
      await speak(text);
    };
    const updateLeft = () => {
      const left = Math.max(0, turns - learnerTurns);
      $('[data-left]', el).textContent = left ? (left > 1 ? `Te quedan ${left} respuestas en esta práctica.` : 'Te queda 1 respuesta en esta práctica.') : '¡Listo! Podés terminar o seguir charlando.';
    };
    const send = async text => {
      text = text.trim();
      if (!text || busy) return;
      busy = true;
      add('me', `<div class="bubble me" lang="en">${esc(text)}</div>`);
      $('[data-in]', el).value = ''; $('[data-heard]', el).textContent = '';
      const thinking = document.createElement('p'); thinking.className = 'small muted'; thinking.textContent = 'Escribiendo…'; chat.appendChild(thinking);
      try {
        const r = await coach('chat', { scenario, history, text, focus });
        history.push({ role: 'learner', text });
        learnerTurns++;
        thinking.remove();
        if (r.feedback_es || (r.corrections || []).length) {
          const fx = (r.corrections || []).map(c => { store.addMistake({ wrong: c.wrong, right: c.right, why: c.why_es }); return `<span class="fixline"><s lang="en">${esc(c.wrong)}</s> → <b lang="en">${esc(c.right)}</b></span>`; }).join('<br>');
          add('tip', `<div class="tipline">${fx}${fx && r.feedback_es ? '<br>' : ''}${esc(r.feedback_es || '')}</div>`);
        }
        store.logActivity(0.7, 10);
        updateLeft();
        await coachSays(r.reply);
      } catch (e) {
        thinking.remove();
        add('tip', `<div class="note bad">${esc(e.message)}</div>`);
      } finally { busy = false; }
    };
    $('[data-send]', el).onclick = () => send($('[data-in]', el).value);
    $('[data-in]', el).onkeydown = e => { if (e.key === 'Enter') send(e.target.value); };
    const mic = $('[data-mic]', el);
    mic.onclick = async () => {
      if (busy) return;
      if (ctrl) { ctrl.stop(); return; }
      stopSpeaking();
      mic.classList.add('live'); mic.innerHTML = icons.stop;
      ctrl = listen({ continuous: true, maxMs: 30000, onPartial: t => { $('[data-heard]', el).textContent = t; } });
      try {
        const r = await ctrl.promise;
        if (r.text) await send(r.text); else $('[data-heard]', el).textContent = 'No te escuché. Probá de nuevo.';
      } catch (e) { toast(e.message); }
      finally { ctrl = null; mic.classList.remove('live'); mic.innerHTML = icons.mic; }
    };
    $('[data-next]', el).onclick = () => { if (ctrl) ctrl.stop(); stopSpeaking(); res({ turns: learnerTurns, history }); };
    updateLeft();
    await coachSays(scenario.opener);
  });
}

export { ttsSupported };
