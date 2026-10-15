// SayIt v2 · aplicación principal
import { $, $$, esc, shuffle, pick, clamp, icons, toast } from './ui.js';
import { DIAG, WEEKS, SOUNDS, FREE_SCENARIOS, LEVELS, LEVEL_NAMES } from './content.js';
import * as store from './store.js';
import * as A from './activities.js';
import { ttsSettings, englishVoices, speak, stopSpeaking, srSupported, ttsSupported, words } from './audio.js';
import { aiAvailable, coach } from './api.js';

const VERSION = '2.0.0';
const app = $('#app');
const nav = $('nav.tabs');
let current = 'today';

/* ------------------------------------------------------------------ */
/* Navegación                                                          */
/* ------------------------------------------------------------------ */
const TABS = [
  ['today', 'Hoy', icons.today],
  ['practice', 'Practicar', icons.play],
  ['progress', 'Progreso', icons.chart],
  ['settings', 'Ajustes', icons.gear]
];
function drawNav() {
  nav.innerHTML = `<div>${TABS.map(([id, label, ic]) => `<button data-tab="${id}" ${id === current ? 'aria-current="page"' : ''}>${ic}<span>${label}</span></button>`).join('')}</div>`;
  $$('[data-tab]', nav).forEach(b => b.onclick = () => go(b.dataset.tab));
}
function showNav(on) { nav.classList.toggle('hidden', !on); app.classList.toggle('no-nav', !on); }

function go(view, params) {
  stopSpeaking();
  const p = store.active();
  if (!p) return welcome();
  if (!p.diag.length && view !== 'diagnostic') return diagnosticIntro();
  current = ['today', 'practice', 'progress', 'settings'].includes(view) ? view : current;
  showNav(true); drawNav();
  scrollTo(0, 0);
  ({ today, practice, progress, settings }[view] || today)(params);
}

function applySettings() {
  const p = store.active();
  if (!p) return;
  ttsSettings.rate = p.settings.rate;
  ttsSettings.voiceURI = p.settings.voiceURI;
  const t = p.settings.theme;
  if (t === 'auto') document.documentElement.removeAttribute('data-theme');
  else document.documentElement.setAttribute('data-theme', t);
}

const weekData = (p = store.active()) => WEEKS[clamp(p.week, 1, 12) - 1];
const firstName = p => esc((p?.name || '').split(' ')[0]);

/* ------------------------------------------------------------------ */
/* Bienvenida y perfiles                                               */
/* ------------------------------------------------------------------ */
function welcome() {
  showNav(false);
  const list = store.profiles();
  app.innerHTML = `<div class="stack-lg">
    <div class="brand">${icons.logo}SayIt</div>
    <div class="stack" style="margin-top:20px">
      <h1>Tu inglés, en voz alta.</h1>
      <p class="muted">Un entrenador personal para medir tu nivel, mejorar la pronunciación y practicar un poco cada día.</p>
    </div>
    ${list.length ? `<div class="stack"><h3>¿Quién practica?</h3>${list.map(p => `<button class="list-btn" data-pid="${p.id}"><span class="glyph">${esc(p.name[0] || '?').toUpperCase()}</span><span class="grow"><b>${esc(p.name)}</b><br><span class="small muted">${p.diag.length ? 'Nivel ' + store.levelLabel(store.currentTheta(p)).code + ' · semana ' + p.week : 'Diagnóstico pendiente'}</span></span><span class="chev">›</span></button>`).join('')}</div>` : ''}
    <form class="panel stack" data-new>
      <label class="field"><span>${list.length ? 'Agregar otra persona' : '¿Cómo te llamás?'}</span><input type="text" name="name" maxlength="30" autocomplete="given-name" placeholder="Tu nombre" required></label>
      <button class="btn">${list.length ? 'Crear perfil' : 'Empezar'}</button>
    </form>
    <p class="small muted center">Tus datos quedan guardados solo en este teléfono.</p></div>`;
  $$('[data-pid]', app).forEach(b => b.onclick = () => { store.setActive(b.dataset.pid); applySettings(); go('today'); });
  $('[data-new]', app).onsubmit = e => {
    e.preventDefault();
    const name = e.target.name.value.trim();
    if (!name) return;
    store.createProfile(name); applySettings();
    diagnosticIntro();
  };
}

/* ------------------------------------------------------------------ */
/* Diagnóstico de nivel                                                */
/* ------------------------------------------------------------------ */
function diagnosticIntro() {
  showNav(false);
  const p = store.active();
  const again = p.diag.length > 0;
  app.innerHTML = `<div class="stack-lg">
    <div class="topbar">${again ? `<button class="iconbtn" data-back aria-label="Volver">${icons.back}</button>` : ''}<div class="brand">${icons.logo}SayIt</div></div>
    <div class="stack"><h1>${again ? 'Volvamos a medir tu nivel' : `Hola, ${firstName(p)}. Empecemos por saber dónde estás.`}</h1>
    <p class="muted">Son unos 12 minutos. Las preguntas se adaptan a tus respuestas: si algo te resulta difícil, es normal; elegí lo que te parezca y seguí.</p></div>
    <div class="panel stack">
      <div class="row"><span class="glyph ipa" style="width:28px">1</span><span>Gramática y vocabulario</span></div>
      <div class="row"><span class="glyph ipa" style="width:28px">2</span><span>Lectura y comprensión auditiva</span></div>
      <div class="row"><span class="glyph ipa" style="width:28px">3</span><span>Pronunciación: leer una frase en voz alta</span></div>
      <div class="row"><span class="glyph ipa" style="width:28px">4</span><span>Hablar 30 segundos y escribir unas líneas</span></div>
    </div>
    <div class="note warm">Buscá un lugar tranquilo y con volumen. Vas a necesitar el micrófono.</div>
    <button class="btn" data-start>Empezar el diagnóstico</button></div>`;
  $('[data-start]', app).onclick = runDiagnostic;
  const b = $('[data-back]', app); if (b) b.onclick = () => go('settings');
}

function irt(theta, d, correct, k) {
  const p = 1 / (1 + Math.exp(-1.7 * (theta - d)));
  return clamp(theta + k * ((correct ? 1 : 0) - p), 0, 4.4);
}
function nextItem(bank, used, theta) {
  const pool = bank.map((x, i) => ({ x, i })).filter(o => !used.has(o.i));
  pool.sort((a, b) => Math.abs(a.x.d - theta) - Math.abs(b.x.d - theta) || Math.random() - 0.5);
  const best = pool.filter(o => Math.abs(o.x.d - theta) === Math.abs(pool[0].x.d - theta));
  return pick(best);
}

async function runDiagnostic() {
  showNav(false);
  const plan = [['grammar', 4], ['vocab', 4], ['reading', 2], ['listening', 4]];
  const totalSteps = plan.reduce((a, [, n]) => a + n, 0) + 3;
  let step = 0, quit = false;
  const t0 = Date.now();
  app.innerHTML = `<div class="runner-head"><button class="iconbtn" data-quit aria-label="Salir del diagnóstico">${icons.close}</button><div class="progress"><i data-bar style="width:0"></i></div></div><div data-stage></div>`;
  const stage = $('[data-stage]', app);
  const bar = () => { $('[data-bar]', app).style.width = (step / totalSteps * 100) + '%'; };
  $('[data-quit]', app).onclick = () => { if (confirm('¿Salir? Se pierde lo que respondiste en este diagnóstico.')) { quit = true; stopSpeaking(); go('today'); } };
  const names = { grammar: 'Gramática', vocab: 'Vocabulario', reading: 'Lectura', listening: 'Comprensión auditiva' };
  const theta = {};

  for (const [skill, n] of plan) {
    let th = 1.5; const used = new Set(); const ks = [1.2, 0.9, 0.7, 0.55];
    for (let i = 0; i < n; i++) {
      if (quit) return;
      const { x, i: idx } = nextItem(DIAG[skill], used, th);
      used.add(idx); bar();
      const r = await A.choiceQ(stage, {
        meta: `${names[skill]} · ${i + 1} de ${n}`, q: x.q, a: x.a, ok: x.ok,
        passage: x.text, audio: x.audio, maxPlays: x.audio ? 2 : 0, silent: true, record: false
      });
      th = irt(th, x.d, r.ok, ks[i] ?? 0.5);
      step++;
    }
    theta[skill] = th;
  }
  if (quit) return;

  // Pronunciación: leer en voz alta
  bar();
  const pr = await A.shadow(stage, { sentence: DIAG.readAloud, meta: 'Pronunciación · leé la frase en voz alta', allowSkip: true });
  step++;
  if (quit) return;

  // Hablar
  bar();
  const sp = await A.freeSpeak(stage, { meta: 'Expresión oral', prompt: DIAG.speakPrompt });
  step++;
  if (quit) return;

  // Escribir
  bar();
  const wr = await A.writing(stage, { meta: 'Expresión escrita', prompt: DIAG.writePrompt, evaluateOnly: true, minWords: 10 });
  step++; bar();
  if (quit) return;

  stage.innerHTML = `<div class="stack-lg center" style="padding-top:60px"><h2>Calculando tu nivel…</h2><p class="muted">El coach está revisando lo que hablaste y escribiste.</p></div>`;
  const base = (theta.grammar + theta.vocab) / 2;
  const ai = await aiAvailable();
  const fromCefr = r => clamp(LEVELS.indexOf(r.cefr) - 0.5 + (Number(r.score) || 50) / 100, 0, 4.4);
  const notes = {};

  // Escritura
  if (ai && wr.text.trim()) {
    try { const r = await coach('evaluate', { kind: 'writing', text: wr.text, task: DIAG.writePrompt }); theta.writing = fromCefr(r); notes.writing = r; } catch (e) {}
  }
  if (theta.writing === undefined) {
    const n = words(wr.text).length;
    const conn = /\b(because|but|so|although|then|after|before|while|however)\b/i.test(wr.text);
    const past = /\b(went|was|were|had|did|saw|made|\w+ed)\b/i.test(wr.text);
    const fut = /\b(will|going to|'ll)\b/i.test(wr.text);
    theta.writing = clamp(base - 0.6 + (n >= 40 ? 0.5 : n >= 20 ? 0.3 : 0) + (conn ? 0.2 : 0) + (past && fut ? 0.3 : 0), 0, 4.4);
  }
  // Oral
  if (!sp.skipped && sp.text) {
    if (ai) {
      try { const r = await coach('evaluate', { kind: 'speaking', text: sp.text, task: DIAG.speakPrompt, seconds: sp.seconds }); theta.speaking = fromCefr(r); notes.speaking = r; } catch (e) {}
    }
    if (theta.speaking === undefined) {
      const n = words(sp.text).length;
      theta.speaking = clamp((base + theta.listening) / 2 + (n >= 60 ? 0.3 : n >= 30 ? 0 : n >= 15 ? -0.4 : -0.9), 0, 4.4);
    }
  }

  const W = { grammar: 0.2, vocab: 0.2, reading: 0.15, listening: 0.2, writing: 0.1, speaking: 0.15 };
  let sum = 0, wsum = 0;
  for (const k in W) if (theta[k] !== undefined) { sum += theta[k] * W[k]; wsum += W[k]; }
  const overall = sum / wsum;
  const p = store.active();
  p.diag.push({ date: new Date().toISOString(), theta: overall, skills: theta, pron: pr.score || 0, notes, minutes: Math.round((Date.now() - t0) / 60000) });
  store.logActivity(Math.max(5, Math.round((Date.now() - t0) / 60000)), 100);
  diagnosticResult();
}

const SKILL_NAMES = { grammar: 'Gramática', vocab: 'Vocabulario', reading: 'Lectura', listening: 'Comprensión auditiva', speaking: 'Expresión oral', writing: 'Expresión escrita' };

function diagnosticResult() {
  showNav(false);
  const p = store.active();
  const d = store.latestDiag(p), prev = p.diag[p.diag.length - 2];
  const L = store.levelLabel(d.theta);
  const sk = Object.entries(d.skills).sort((a, b) => b[1] - a[1]);
  const strengths = sk.slice(0, 2).map(([k]) => SKILL_NAMES[k].toLowerCase());
  const focus = sk.slice(-2).reverse().map(([k]) => SKILL_NAMES[k].toLowerCase());
  const delta = prev ? d.theta - prev.theta : 0;
  app.innerHTML = `<div class="stack-lg">
    <div class="qmeta">Tu nivel estimado</div>
    <div class="row" style="align-items:flex-end;gap:16px">
      <div class="level-big">${L.code}</div>
      <div class="stack" style="padding-bottom:8px"><h3>${LEVEL_NAMES[L.code]}</h3><p class="muted">Dentro del ${L.code}: ${L.part}</p></div>
    </div>
    ${prev ? `<div class="note ${delta > 0.05 ? 'good' : 'warm'}">${delta > 0.05 ? `Subiste desde ${store.levelLabel(prev.theta).code} ${store.levelLabel(prev.theta).part}. ¡Se nota la práctica!` : `Muy parecido a la vez anterior (${store.levelLabel(prev.theta).code} ${store.levelLabel(prev.theta).part}). Los avances a veces tardan en aparecer en un test: seguí con el plan.`}</div>` : ''}
    <div class="panel stack">
      ${sk.map(([k, v]) => `<div class="skill"><span>${SKILL_NAMES[k]}</span><b>${store.levelLabel(v).code}</b><div class="progress"><i style="width:${Math.round(v / 4.5 * 100)}%"></i></div></div>`).join('')}
      <div class="skill"><span>Pronunciación (frase leída)</span><b>${d.pron}%</b><div class="progress gold"><i style="width:${d.pron}%"></i></div></div>
    </div>
    <div class="stack">
      <p><b>Tus puntos fuertes:</b> ${strengths.join(' y ')}.</p>
      <p><b>Dónde más vas a crecer:</b> ${focus.join(' y ')}.</p>
      ${d.notes?.speaking?.focus_es ? `<p class="small muted">${esc(d.notes.speaking.focus_es)}</p>` : ''}
      ${d.notes?.writing?.focus_es && d.notes.writing.focus_es !== d.notes?.speaking?.focus_es ? `<p class="small muted">${esc(d.notes.writing.focus_es)}</p>` : ''}
    </div>
    <p class="small muted">Es una estimación según el Marco Común Europeo (MCER). Te conviene repetir el diagnóstico cada 4 semanas para ver cómo avanzás.</p>
    <button class="btn" data-go>${p.diag.length > 1 ? 'Volver a mi plan' : 'Ver mi plan de 12 semanas'}</button></div>`;
  $('[data-go]', app).onclick = () => go('today');
}

/* ------------------------------------------------------------------ */
/* Hoy                                                                 */
/* ------------------------------------------------------------------ */
function today() {
  const p = store.active();
  const w = weekData(p);
  const done = store.sessionsDone(p);
  const check = p.checks[p.week];
  const L = store.levelLabel(store.currentTheta(p));
  const st = store.streak(p);
  const due = store.srsDue(p).length;
  const s = SOUNDS[w.sound];
  const sessionToday = p.lastSession === store.todayKey() && done > 0;
  const since = store.weeksSinceDiag(p);
  const seasonDone = p.week === 12 && check;
  const hour = new Date().getHours();
  const hello = hour < 13 ? 'Buen día' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';

  app.innerHTML = `<div class="stack-lg">
    <div class="topbar"><div class="brand grow">${icons.logo}SayIt</div>
      <span class="pill streak" title="Días seguidos practicando">🔥 ${st} día${st === 1 ? '' : 's'}</span>
      <span class="pill">${L.code}</span></div>
    <p class="muted">${hello}, ${firstName(p)}.</p>
    <section class="stack">
      <div class="hero-week">${p.week}<small>de 12</small></div>
      <h2>${esc(w.title)}</h2>
      <div class="ribbon" aria-label="Semana ${p.week} de 12">${WEEKS.map(x => `<i class="${x.n < p.week ? 'done' : x.n === p.week ? 'now' : ''}"></i>`).join('')}</div>
    </section>
    <section class="panel stack">
      <div class="row between"><h3>Esta semana</h3><span class="small muted">${done} de 5 sesiones</span></div>
      <div class="days">${[0, 1, 2, 3, 4].map(i => `<i class="${i < done ? 'done' : ''}">${i < done ? '✓' : i + 1}</i>`).join('')}<i class="check ${check ? 'done' : ''}" title="Chequeo semanal">${check ? check.score + '%' : '★'}</i></div>
      <p class="small muted">Gramática: ${esc(w.grammar.name)}. Sonido: ${esc(s.name)} <span class="ipa">${esc(s.ipa)}</span>.</p>
      ${seasonDone ? `<div class="note good">¡Terminaste las 12 semanas! Hacé un nuevo diagnóstico para ver cuánto avanzaste y empezá otra vuelta.</div>
        <button class="btn" data-rediag>Medir mi nivel otra vez</button><button class="btn ghost" data-restart>Empezar una nueva vuelta</button>`
      : check ? `<div class="note good">Chequeo de la semana: ${check.score}%. ${check.score >= 70 ? '¡Semana superada!' : 'Podés repetir la semana o avanzar igual.'}</div>
        <button class="btn" data-advance>Empezar la semana ${p.week + 1}</button>
        <button class="btn ghost" data-session>Hacer otra sesión de esta semana</button>`
      : done >= 4 ? `<button class="btn" data-check>Hacer el chequeo semanal</button>
        <button class="btn ghost" data-session>${done >= 5 ? 'Otra sesión de repaso' : 'Sesión ' + (done + 1) + ' de 5'}</button>`
      : `<button class="btn" data-session>${sessionToday ? 'Hacer otra sesión' : 'Empezar la sesión de hoy'} · ${p.settings.minutes} min</button>`}
    </section>
    ${since !== null && since >= 4 && !seasonDone ? `<button class="list-btn" data-rediag><span class="glyph">↻</span><span class="grow"><b>Pasaron ${since} semanas desde tu último diagnóstico</b><br><span class="small muted">Medí tu nivel otra vez para ver el progreso.</span></span><span class="chev">›</span></button>` : ''}
    <section class="tiles">
      <button class="tile" data-words><span class="glyph">${due}</span><span><b>Palabras para repasar</b><br><span>${due ? 'Te esperan hoy' : 'Al día. ¡Bien!'}</span></span></button>
      <button class="tile" data-sound><span class="glyph ipa">${esc(s.ipa.split(' ')[0])}</span><span><b>Sonido de la semana</b><br><span>${esc(s.name)}</span></span></button>
      <button class="tile wide" data-talk><span class="glyph" style="font-size:22px">Hi!</span><span class="grow"><b>${esc(w.scenario.title)}</b><br><span>Conversación con el coach, por voz</span></span></button>
    </section></div>`;

  const bind = (sel, fn) => $$(sel, app).forEach(b => b.onclick = fn);
  bind('[data-session]', () => runSession());
  bind('[data-check]', () => runCheck());
  bind('[data-advance]', () => { store.advanceWeek(); toast(`Semana ${store.active().week}: ${weekData().title}`); go('today'); });
  bind('[data-rediag]', diagnosticIntro);
  bind('[data-restart]', () => { const q = store.active(); q.week = 1; q.sessions = {}; q.checks = {}; store.save(); go('today'); });
  bind('[data-words]', () => practiceWords());
  bind('[data-sound]', () => soundPractice(w.sound));
  bind('[data-talk]', () => talk(w.scenario, w.grammar.name));
}

/* ------------------------------------------------------------------ */
/* Sesión diaria                                                       */
/* ------------------------------------------------------------------ */
const vocabCard = (wk, i) => { const v = WEEKS[wk - 1].vocab[i]; return { key: `w${wk}v${i}`, en: v[0], es: v[1], ex: v[2] }; };

function sessionPlan(p, ai) {
  const w = weekData(p);
  const k = store.sessionsDone(p); // índice de la sesión en la semana
  const m = p.settings.minutes;
  const size = m <= 10 ? 0 : m <= 15 ? 1 : m <= 20 ? 2 : 3;
  const steps = [];

  // 1. Palabras: nuevas de la semana + repasos pendientes
  const newIdx = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].filter(i => !p.srs[`w${w.n}v${i}`]).slice(0, [2, 3, 3, 4][size]);
  const dueKeys = store.srsDue(p).filter(key => !newIdx.some(i => key === `w${w.n}v${i}`)).slice(0, [5, 8, 10, 12][size]);
  const cards = [
    ...newIdx.map(i => ({ ...vocabCard(w.n, i), isNew: true })),
    ...dueKeys.map(key => { const [, wk, i] = key.match(/^w(\d+)v(\d+)$/) || []; return wk ? vocabCard(+wk, +i) : null; }).filter(Boolean)
  ];
  if (cards.length) steps.push({ name: 'Palabras', run: el => A.flashcards(el, { cards, title: 'Palabras' }) });

  // 2. Gramática
  const gx = [2, 3, 4, 4][size];
  steps.push({ name: 'Gramática', run: el => A.tipCard(el, { meta: 'Gramática de la semana', title: w.grammar.name, body: w.grammar.tip }) });
  for (let j = 0; j < gx; j++) {
    const ex = w.grammar.ex[(k * 3 + j) % w.grammar.ex.length];
    steps.push({ name: 'Gramática', scored: true, run: el => ex.order ? A.orderQ(el, { sentence: ex.order, meta: 'Gramática · armá la frase' }) : A.choiceQ(el, { meta: 'Gramática', ...ex, explain: '' }) });
  }

  // 3. Escucha
  const lx = [1, 2, 3, 4][size];
  for (let j = 0; j < lx; j++) {
    const it = w.listen[(k + j) % w.listen.length];
    steps.push({ name: 'Escucha', scored: true, run: el => it.dictation ? A.dictation(el, { sentence: it.dictation, meta: 'Escucha · dictado' }) : A.choiceQ(el, { meta: 'Escucha', ...it }) });
  }

  // 4. Sonido de la semana
  if (k === 0) steps.push({ name: 'Sonido', run: el => A.tipCard(el, { meta: 'Sonido de la semana', title: `${SOUNDS[w.sound].name} ${SOUNDS[w.sound].ipa}`, body: SOUNDS[w.sound].tip }) });
  steps.push({ name: 'Sonido', scored: true, run: el => A.pairsGame(el, { soundId: w.sound, rounds: [5, 6, 8, 8][size] }) });
  const sh = SOUNDS[w.sound].shadow;
  for (let j = 0; j < (size >= 3 ? 2 : 1); j++) steps.push({ name: 'Pronunciación', run: el => A.shadow(el, { sentence: sh[(k + j) % sh.length], soundId: w.sound }) });

  // 5. Juego extra en sesiones largas
  if (size >= 2) steps.push({ name: 'Juego', run: el => A.memoryGame(el, { pairs: w.vocab.map(v => [v[0], v[1]]), meta: 'Juego de memoria' }) });

  // 6. Hablar
  if (ai) steps.push({ name: 'Conversación', run: el => A.roleplay(el, { scenario: w.scenario, turns: [2, 3, 4, 5][size], focus: w.grammar.name, meta: 'Conversación con el coach' }) });
  else {
    const ex = shuffle(w.vocab).slice(0, 2);
    ex.forEach(v => steps.push({ name: 'Hablar', run: el => A.shadow(el, { sentence: v[2], meta: 'Decilo en voz alta' }) }));
  }

  // 7. Escritura en sesiones largas (sesiones 3 y 5)
  if (size >= 3 && (k === 2 || k === 4)) steps.push({ name: 'Escritura', run: el => A.writing(el, { meta: 'Desafío de escritura', prompt: w.challenge, useAI: ai }) });
  return steps;
}

async function runSteps(steps, { title, onQuit }) {
  showNav(false);
  scrollTo(0, 0);
  app.innerHTML = `<div class="runner-head"><button class="iconbtn" data-quit aria-label="Salir">${icons.close}</button><div class="progress"><i data-bar style="width:0"></i></div><span class="small muted" data-name></span></div><div data-stage></div>`;
  const stage = $('[data-stage]', app);
  let quit = false;
  $('[data-quit]', app).onclick = () => {
    if (confirm('¿Salir de la sesión? Lo que ya practicaste queda guardado.')) { quit = true; stopSpeaking(); onQuit ? onQuit() : go('today'); }
  };
  const results = [];
  for (let i = 0; i < steps.length; i++) {
    if (quit) return null;
    $('[data-bar]', app).style.width = (i / steps.length * 100) + '%';
    $('[data-name]', app).textContent = steps[i].name;
    scrollTo(0, 0);
    const r = await steps[i].run(stage);
    if (quit) return null;
    results.push({ ...r, name: steps[i].name, scored: steps[i].scored });
    store.logActivity(0, r && r.ok === true ? 10 : 2);
  }
  return results;
}

async function runSession() {
  const p = store.active();
  const ai = await aiAvailable();
  const t0 = Date.now();
  const steps = sessionPlan(p, ai);
  const res = await runSteps(steps, { title: 'Sesión' });
  if (!res) return;
  const minutes = clamp(Math.round((Date.now() - t0) / 60000), 1, 60);
  store.completeSession(minutes);
  const scored = res.filter(r => r.scored);
  const okSteps = scored.filter(r => r.ok === true || (r.total && r.ok / r.total >= 0.7)).length;
  const done = store.sessionsDone();
  showNav(false);
  app.innerHTML = `<div class="stack-lg" style="padding-top:30px">
    <div class="celebrate">¡Listo!</div>
    <h2>Sesión ${done} de 5 completada</h2>
    <div class="stats3">
      <div class="stat"><b>${minutes}</b><span>minutos</span></div>
      <div class="stat"><b>${scored.length ? Math.round(okSteps / scored.length * 100) : 100}%</b><span>aciertos</span></div>
      <div class="stat"><b>${store.streak()}</b><span>días seguidos</span></div>
    </div>
    <p class="muted">${done >= 4 && !p.checks[p.week] ? 'Ya podés hacer el chequeo semanal para medir lo que aprendiste esta semana.' : pick(['Lo importante es la constancia: un poco todos los días rinde más que mucho de golpe.', 'Cada sesión suma. Mañana seguimos.', 'Hablar en voz alta, aunque cueste, es lo que más te hace avanzar.'])}</p>
    <button class="btn" data-home>Volver a Hoy</button></div>`;
  $('[data-home]', app).onclick = () => go('today');
}

/* ------------------------------------------------------------------ */
/* Chequeo semanal                                                     */
/* ------------------------------------------------------------------ */
async function runCheck() {
  const p = store.active();
  const w = weekData(p);
  const vocabQs = shuffle(w.vocab.map((v, i) => i)).slice(0, 4).map(i => {
    const others = shuffle(w.vocab.filter((x, j) => j !== i)).slice(0, 2).map(x => x[1]);
    return { part: 'vocab', q: `¿Qué significa "${w.vocab[i][0]}"?`, a: [w.vocab[i][1], ...others], ok: 0 };
  });
  const gramQs = shuffle(w.grammar.ex.filter(x => !x.order)).slice(0, 3).map(x => ({ part: 'grammar', ...x }));
  const listenQs = w.listen.map(x => ({ part: 'listen', ...x }));
  const steps = [
    { name: 'Chequeo', run: el => A.tipCard(el, { meta: `Chequeo de la semana ${w.n}`, title: 'Veamos qué aprendiste', body: 'Son unas 12 preguntas sobre las palabras, la gramática, la escucha y el sonido de esta semana. No hay pistas: respondé lo que sepas.' }) },
    ...vocabQs.map(q => ({ name: 'Vocabulario', part: 'vocab', run: el => A.choiceQ(el, { meta: 'Vocabulario', ...q, silent: true, record: false }) })),
    ...gramQs.map(q => ({ name: 'Gramática', part: 'grammar', run: el => A.choiceQ(el, { meta: 'Gramática', ...q, silent: true, record: false }) })),
    ...listenQs.slice(0, 3).map(q => ({ name: 'Escucha', part: 'listen', run: el => q.dictation ? A.dictation(el, { sentence: q.dictation }) : A.choiceQ(el, { meta: 'Escucha', ...q, silent: true, record: false, maxPlays: 2 }) })),
    { name: 'Sonido', part: 'sound', run: el => A.pairsGame(el, { soundId: w.sound, rounds: 4 }) },
    { name: 'Pronunciación', part: 'pron', run: el => A.shadow(el, { sentence: pick(SOUNDS[w.sound].shadow), soundId: w.sound, meta: 'Decí la frase' }) }
  ];
  const res = await runSteps(steps, { title: 'Chequeo' });
  if (!res) return;
  const parts = {};
  res.forEach((r, i) => {
    const part = steps[i].part; if (!part) return;
    const v = r.total ? r.ok / r.total : r.score !== undefined && r.ok === undefined ? r.score / 100 : r.score !== undefined ? r.score / 100 : r.ok ? 1 : 0;
    (parts[part] = parts[part] || []).push(v);
  });
  const avg = a => a.reduce((x, y) => x + y, 0) / a.length;
  const partPct = Object.fromEntries(Object.entries(parts).map(([k, v]) => [k, Math.round(avg(v) * 100)]));
  const score = Math.round(avg(Object.values(partPct)));
  store.completeCheck(score, partPct);
  const labels = { vocab: 'Vocabulario', grammar: 'Gramática', listen: 'Escucha', sound: 'Oído (pares)', pron: 'Pronunciación' };
  showNav(false);
  app.innerHTML = `<div class="stack-lg" style="padding-top:20px">
    <div class="qmeta">Chequeo de la semana ${w.n}</div>
    <div class="level-big" style="color:${score >= 70 ? 'var(--leaf)' : 'var(--marigold)'}">${score}%</div>
    <h2>${score >= 85 ? '¡Excelente semana!' : score >= 70 ? '¡Semana superada!' : 'Vas bien, pero conviene repasar'}</h2>
    <div class="panel stack">${Object.entries(partPct).map(([k, v]) => `<div class="skill"><span>${labels[k]}</span><b>${v}%</b><div class="progress ${v >= 70 ? 'leaf' : 'gold'}"><i style="width:${v}%"></i></div></div>`).join('')}</div>
    ${p.week < 12 ? `<button class="btn" data-adv>Pasar a la semana ${p.week + 1}</button>
    <button class="btn ghost" data-stay>Quedarme repasando esta semana</button>` : `<div class="note good">¡Completaste el programa de 12 semanas!</div><button class="btn" data-stay>Volver a Hoy</button>`}</div>`;
  const a = $('[data-adv]', app);
  if (a) a.onclick = () => { store.advanceWeek(); go('today'); };
  $('[data-stay]', app).onclick = () => go('today');
}

/* ------------------------------------------------------------------ */
/* Practicar                                                           */
/* ------------------------------------------------------------------ */
function practice() {
  const p = store.active();
  const w = weekData(p);
  const due = store.srsDue(p).length;
  const item = (key, glyph, title, sub) => `<button class="list-btn" data-p="${key}"><span class="glyph">${glyph}</span><span class="grow"><b>${title}</b><br><span class="small muted">${sub}</span></span><span class="chev">›</span></button>`;
  app.innerHTML = `<div class="stack-lg">
    <div class="topbar"><h1 class="grow">Practicar</h1></div>
    <section class="stack"><h3>Pronunciación</h3>
      ${item('sounds', '/ɪ/', 'Los 12 sonidos difíciles', 'Pares de palabras y frases para repetir')}
      ${item('shadow', '≋', 'Repetí conmigo', 'Escuchá, decilo y compará tu grabación')}
    </section>
    <section class="stack"><h3>Juegos</h3>
      ${item('memory', '▦', 'Memoria', 'Uní expresiones con su significado')}
      ${item('order', '⇄', 'Armá la frase', 'Ordená las palabras')}
      ${item('dictation', '✎', 'Dictado', 'Escuchá y escribí')}
      ${item('words', due || '✓', 'Repasar palabras', due ? `${due} pendientes para hoy` : 'Todo al día: podés repasar igual')}
    </section>
    <section class="stack"><h3>Conversación y escritura</h3>
      ${item('talk', 'Hi', w.scenario.title, 'Tema de esta semana')}
      ${item('talks', '…', 'Otras conversaciones', 'Elegí una situación')}
      ${item('write', 'Aa', 'Desafío de escritura', 'El coach corrige y te sugiere una versión más natural')}
    </section></div>`;
  const actions = {
    sounds: soundsList,
    shadow: () => shadowFree(),
    memory: () => gameMemory(),
    order: () => gameOrder(),
    dictation: () => gameDictation(),
    words: () => practiceWords(true),
    talk: () => talk(w.scenario, w.grammar.name),
    talks: talksList,
    write: () => writeChallenge()
  };
  $$('[data-p]', app).forEach(b => b.onclick = () => actions[b.dataset.p]());
}

const unlockedWeeks = () => WEEKS.slice(0, store.active().week);

async function single(run, back = () => go('practice')) {
  const r = await runSteps([{ name: '', run }], { onQuit: back });
  if (r) back();
  return r;
}

function subpage(title, html, back = () => go('practice')) {
  showNav(true);
  app.innerHTML = `<div class="stack-lg"><div class="topbar"><button class="iconbtn" data-back aria-label="Volver">${icons.back}</button><h2 class="grow">${esc(title)}</h2></div>${html}</div>`;
  $('[data-back]', app).onclick = back;
}

function soundsList() {
  const p = store.active();
  subpage('Los 12 sonidos', `<p class="muted">Son los sonidos que más cuestan a quien habla español. El porcentaje muestra tus aciertos.</p>
    <div class="stack">${Object.entries(SOUNDS).map(([id, s]) => {
      const r = p.sounds[id]; const pct = r?.tries ? Math.round(r.ok / r.tries * 100) : null;
      return `<button class="list-btn" data-s="${id}"><span class="glyph ipa" style="font-size:14px">${esc(s.ipa.split(' ')[0])}</span><span class="grow"><b>${esc(s.name)}</b><br><span class="small muted">${pct === null ? 'Sin practicar' : pct + '% de aciertos en ' + r.tries + ' intentos'}</span></span><span class="chev">›</span></button>`;
    }).join('')}</div>`);
  $$('[data-s]', app).forEach(b => b.onclick = () => soundPractice(b.dataset.s, soundsList));
}

async function soundPractice(id, back = () => go('today')) {
  const s = SOUNDS[id];
  const steps = [
    { name: 'Sonido', run: el => A.tipCard(el, { meta: 'Cómo se hace', title: `${s.name} ${s.ipa}`, body: s.tip }) },
    { name: 'Oído', run: el => A.pairsGame(el, { soundId: id, rounds: 8 }) },
    ...shuffle(s.shadow).slice(0, 2).map(t => ({ name: 'Pronunciación', run: el => A.shadow(el, { sentence: t, soundId: id }) }))
  ];
  const r = await runSteps(steps, { onQuit: back });
  if (r) { store.logActivity(3, 20); toast('Práctica guardada'); back(); }
}

function shadowFree() {
  const all = unlockedWeeks().flatMap(w => [...SOUNDS[w.sound].shadow.map(t => [t, w.sound]), ...w.vocab.map(v => [v[2], null])]);
  const set = shuffle(all).slice(0, 5);
  runSteps(set.map(([t, sid]) => ({ name: 'Repetí conmigo', run: el => A.shadow(el, { sentence: t, soundId: sid || undefined }) })), { onQuit: () => go('practice') })
    .then(r => { if (r) { store.logActivity(3, 20); go('practice'); } });
}

function gameMemory() {
  const pool = unlockedWeeks().flatMap(w => w.vocab.map(v => [v[0], v[1]]));
  const recent = weekData().vocab.map(v => [v[0], v[1]]);
  const pairs = shuffle([...shuffle(recent).slice(0, 3), ...shuffle(pool).slice(0, 6)]).filter((x, i, a) => a.findIndex(y => y[0] === x[0]) === i);
  single(el => A.memoryGame(el, { pairs })).then(r => r && store.logActivity(2, 20));
}

function gameOrder() {
  const pool = unlockedWeeks().flatMap(w => [...w.grammar.ex.filter(x => x.order).map(x => x.order), ...w.vocab.map(v => v[2]).filter(t => t.split(' ').length >= 4 && t.split(' ').length <= 9)]);
  const set = shuffle(pool).slice(0, 5);
  runSteps(set.map(t => ({ name: 'Armá la frase', scored: true, run: el => A.orderQ(el, { sentence: t }) })), { onQuit: () => go('practice') })
    .then(r => { if (r) { store.logActivity(3, 15); toast(`${r.filter(x => x.ok).length} de ${r.length} frases bien armadas`); go('practice'); } });
}

function gameDictation() {
  const pool = unlockedWeeks().flatMap(w => [...w.listen.filter(x => x.dictation).map(x => x.dictation), ...w.vocab.map(v => v[2])]);
  const set = shuffle(pool).slice(0, 5);
  runSteps(set.map(t => ({ name: 'Dictado', run: el => A.dictation(el, { sentence: t }) })), { onQuit: () => go('practice') })
    .then(r => { if (r) { store.logActivity(3, 15); go('practice'); } });
}

async function practiceWords(fromPractice = false) {
  const p = store.active();
  const back = () => go(fromPractice ? 'practice' : 'today');
  let keys = store.srsDue(p);
  if (!keys.length) keys = shuffle(Object.keys(p.srs)).slice(0, 10);
  if (!keys.length) {
    const w = weekData(p);
    keys = w.vocab.slice(0, 5).map((v, i) => `w${w.n}v${i}`);
  }
  const cards = keys.slice(0, 15).map(k => { const m = k.match(/^w(\d+)v(\d+)$/); return m ? { ...vocabCard(+m[1], +m[2]), isNew: !p.srs[k] } : null; }).filter(Boolean);
  const r = await runSteps([{ name: 'Palabras', run: el => A.flashcards(el, { cards }) }], { onQuit: back });
  if (r) { store.logActivity(2, 15); toast('Repaso guardado'); back(); }
}

function talksList() {
  const list = [...FREE_SCENARIOS, ...unlockedWeeks().map(w => w.scenario)];
  subpage('Conversaciones', `<div class="note">${srSupported() ? 'Hablás con el micrófono y el coach te contesta en voz alta. Si se te traba algo, escribilo.' : 'En este navegador no hay reconocimiento de voz: vas a poder escribir.'}</div>
    <div class="stack">${list.map((s, i) => `<button class="list-btn" data-t="${i}"><span class="glyph">${i < FREE_SCENARIOS.length ? '…' : 'Hi'}</span><span class="grow"><b>${esc(s.title)}</b></span><span class="chev">›</span></button>`).join('')}</div>`);
  $$('[data-t]', app).forEach(b => b.onclick = () => talk(list[+b.dataset.t], '', talksList));
}

async function talk(scenario, focus = '', back = () => go('practice')) {
  if (!(await aiAvailable())) {
    subpage('Conversación', `<div class="note bad">El coach con IA no está disponible ${navigator.onLine ? 'todavía: falta configurar la clave de OpenAI en Netlify' : 'sin conexión a internet'}. Mientras tanto, practicá con "Repetí conmigo".</div><button class="btn" data-sh>Ir a Repetí conmigo</button>`, back);
    $('[data-sh]', app).onclick = shadowFree;
    return;
  }
  const r = await single(el => A.roleplay(el, { scenario, turns: 5, focus }), back);
  if (r?.[0]?.turns) toast(`¡Buena charla! ${r[0].turns} respuestas en inglés.`);
}

async function writeChallenge() {
  const ai = await aiAvailable();
  const w = weekData();
  single(el => A.writing(el, { meta: `Desafío de la semana ${w.n}`, prompt: w.challenge, useAI: ai }));
}

/* ------------------------------------------------------------------ */
/* Progreso                                                            */
/* ------------------------------------------------------------------ */
function barChart(values, labels, { max = 100, h = 150, color = 'var(--cobalt)', now } = {}) {
  const W = 340, pad = 22, bw = (W - pad) / values.length;
  return `<svg class="chart" viewBox="0 0 ${W} ${h + 24}" role="img" aria-label="Gráfico de barras">
    ${[0, 50, 100].map(v => `<line x1="${pad}" x2="${W}" y1="${h - v / max * h + 4}" y2="${h - v / max * h + 4}" stroke="var(--line)"/><text x="0" y="${h - v / max * h + 8}">${v}</text>`).join('')}
    ${values.map((v, i) => {
      const x = pad + i * bw + 3, bh = v === null ? 0 : Math.max(3, v / max * h);
      return `${v === null ? `<rect x="${x}" y="${h}" width="${bw - 6}" height="4" rx="2" fill="${i + 1 === now ? 'var(--cobalt)' : 'var(--line)'}"/>` : `<rect x="${x}" y="${h - bh + 4}" width="${bw - 6}" height="${bh}" rx="4" fill="${v >= 70 ? 'var(--leaf)' : 'var(--marigold)'}"/>`}
        <text x="${x + (bw - 6) / 2}" y="${h + 20}" text-anchor="middle">${labels[i]}</text>`;
    }).join('')}</svg>`;
}

function lineChart(points) {
  const W = 340, H = 150, pad = 30;
  const xs = points.map((_, i) => pad + (points.length === 1 ? (W - pad) / 2 : i * (W - pad - 10) / (points.length - 1)));
  const y = t => H - t / 4.5 * (H - 10);
  const path = points.map((pt, i) => `${i ? 'L' : 'M'}${xs[i]},${y(pt.theta)}`).join(' ');
  return `<svg class="chart" viewBox="0 0 ${W} ${H + 24}" role="img" aria-label="Evolución del nivel">
    ${LEVELS.map((L, i) => `<line x1="${pad}" x2="${W}" y1="${y(i)}" y2="${y(i)}" stroke="var(--line)"/><text x="0" y="${y(i) + 4}">${L}</text>`).join('')}
    <path d="${path}" fill="none" stroke="var(--cobalt)" stroke-width="3" stroke-linejoin="round"/>
    ${points.map((pt, i) => `<circle cx="${xs[i]}" cy="${y(pt.theta)}" r="5" fill="var(--cobalt)"/><text x="${xs[i]}" y="${H + 20}" text-anchor="middle">${new Date(pt.date).toLocaleDateString('es-AR', { day: 'numeric', month: 'short' })}</text>`).join('')}
  </svg>`;
}

function progress() {
  const p = store.active();
  const d = store.latestDiag(p);
  const L = store.levelLabel(d.theta);
  const weekScores = WEEKS.map(w => p.checks[w.n]?.score ?? null);
  const sounds = Object.entries(p.sounds).filter(([, r]) => r.tries >= 3).map(([id, r]) => [id, Math.round(r.ok / r.tries * 100)]).sort((a, b) => a[1] - b[1]);
  app.innerHTML = `<div class="stack-lg">
    <div class="topbar"><h1 class="grow">Progreso</h1></div>
    <div class="stats3">
      <div class="stat"><b>${store.streak(p)}</b><span>días seguidos</span></div>
      <div class="stat"><b>${store.minutesThisWeek(p)}</b><span>min esta semana</span></div>
      <div class="stat"><b>${store.srsKnown(p)}</b><span>palabras aprendidas</span></div>
    </div>
    <section class="panel stack">
      <div class="row between"><h3>Nivel</h3><span class="pill">${L.code} ${L.part}</span></div>
      ${p.diag.length > 1 ? lineChart(p.diag) : `<p class="muted small">Cuando repitas el diagnóstico vas a ver acá la evolución de tu nivel.</p>`}
      <button class="btn ghost small" data-rediag style="width:100%">Medir mi nivel otra vez</button>
    </section>
    <section class="panel stack">
      <h3>Chequeos semanales</h3>
      ${barChart(weekScores, WEEKS.map(w => w.n), { now: p.week })}
      <p class="small muted">Verde: semana superada (70% o más).</p>
    </section>
    <section class="panel stack">
      <h3>Sonidos</h3>
      ${sounds.length ? sounds.map(([id, v]) => `<div class="skill"><span>${esc(SOUNDS[id].name)} <span class="ipa small">${esc(SOUNDS[id].ipa)}</span></span><b>${v}%</b><div class="progress ${v >= 75 ? 'leaf' : 'gold'}"><i style="width:${v}%"></i></div></div>`).join('') : '<p class="muted small">Todavía no hay suficientes intentos. Practicá los sonidos para ver tus aciertos.</p>'}
    </section>
    <section class="panel stack">
      <h3>Tu cuaderno de errores</h3>
      ${p.mistakes.length ? p.mistakes.slice(0, 12).map((m, i) => `<div class="fixline"><s lang="en">${esc(m.wrong)}</s><br><b lang="en">${esc(m.right)}</b> <button class="speaker" style="min-height:30px;padding:2px 8px" data-m="${i}" aria-label="Escuchar">${icons.speaker}</button>${m.why ? `<br><span class="muted small">${esc(m.why)}</span>` : ''}</div>`).join('<hr>') : '<p class="muted small">Acá se van a guardar las correcciones del coach y las respuestas que tengas que repasar.</p>'}
    </section>
    <p class="small muted center">${p.xp} puntos de experiencia acumulados</p></div>`;
  $$('[data-m]', app).forEach(b => b.onclick = () => speak(p.mistakes[+b.dataset.m].right));
  $('[data-rediag]', app).onclick = diagnosticIntro;
}

/* ------------------------------------------------------------------ */
/* Ajustes                                                             */
/* ------------------------------------------------------------------ */
async function settings() {
  const p = store.active();
  const voices = englishVoices();
  const ai = await aiAvailable();
  app.innerHTML = `<div class="stack-lg">
    <div class="topbar"><h1 class="grow">Ajustes</h1></div>
    <section class="panel stack">
      <label class="field"><span>Nombre</span><input type="text" data-name value="${esc(p.name)}" maxlength="30"></label>
      <label class="field"><span>Minutos por sesión</span>
        <select data-min>${[10, 15, 20, 30].map(m => `<option value="${m}" ${p.settings.minutes === m ? 'selected' : ''}>${m} minutos</option>`).join('')}</select></label>
      <label class="field"><span>Semana del programa</span>
        <select data-week>${WEEKS.map(w => `<option value="${w.n}" ${p.week === w.n ? 'selected' : ''}>Semana ${w.n}: ${esc(w.title)}</option>`).join('')}</select></label>
    </section>
    <section class="panel stack">
      <h3>Voz en inglés</h3>
      ${ttsSupported() ? `<label class="field"><span>Voz</span><select data-voice><option value="">Automática</option>${voices.map(v => `<option value="${esc(v.voiceURI)}" ${p.settings.voiceURI === v.voiceURI ? 'selected' : ''}>${esc(v.name)} (${esc(v.lang)})</option>`).join('')}</select></label>
      <label class="field"><span>Velocidad: <b data-ratev>${p.settings.rate.toFixed(2)}</b></span><input type="range" min="0.6" max="1.2" step="0.02" value="${p.settings.rate}" data-rate style="width:100%"></label>
      <button class="speaker" data-test>${icons.speaker}Probar la voz</button>` : '<p class="muted">Este navegador no puede leer en voz alta.</p>'}
    </section>
    <section class="panel stack">
      <h3>Apariencia</h3>
      <select data-theme>${[['auto', 'Según el teléfono'], ['light', 'Clara'], ['dark', 'Oscura']].map(([v, l]) => `<option value="${v}" ${p.settings.theme === v ? 'selected' : ''}>${l}</option>`).join('')}</select>
    </section>
    <section class="panel stack">
      <h3>Diagnóstico y estado</h3>
      <button class="btn ghost" data-rediag>Medir mi nivel otra vez</button>
      <p class="small muted">Coach con IA: ${ai ? 'conectado' : navigator.onLine ? 'no configurado' : 'sin conexión'}. Micrófono: ${srSupported() ? 'reconocimiento de voz disponible' : 'reconocimiento de voz no disponible en este navegador'}.</p>
    </section>
    <section class="panel stack">
      <h3>Perfiles y copia de seguridad</h3>
      <p class="small muted">Tus datos se guardan solo en este teléfono. Guardá una copia de vez en cuando, o para pasar tu progreso a otro dispositivo.</p>
      <div class="btn-row"><button class="btn ghost small" data-export>Guardar copia</button><button class="btn ghost small" data-import>Restaurar copia</button></div>
      <input type="file" accept="application/json,.json" data-file class="hidden">
      <button class="btn ghost" data-switch>Cambiar de perfil o agregar otro</button>
      <button class="btn quiet" data-del style="color:var(--coral)">Borrar el perfil de ${esc(p.name)}</button>
    </section>
    <p class="small muted center">SayIt ${VERSION}</p></div>`;

  const set = (fn) => { fn(p.settings); store.save(); applySettings(); };
  $('[data-name]', app).onchange = e => { const v = e.target.value.trim(); if (v) { p.name = v; store.save(); toast('Nombre actualizado'); } };
  $('[data-min]', app).onchange = e => set(s => s.minutes = +e.target.value);
  $('[data-week]', app).onchange = e => { p.week = +e.target.value; store.save(); toast(`Semana ${p.week}`); };
  $('[data-theme]', app).onchange = e => set(s => s.theme = e.target.value);
  const vs = $('[data-voice]', app);
  if (vs) {
    vs.onchange = e => set(s => s.voiceURI = e.target.value);
    $('[data-rate]', app).oninput = e => { $('[data-ratev]', app).textContent = (+e.target.value).toFixed(2); set(s => s.rate = +e.target.value); };
    $('[data-test]', app).onclick = () => speak('Hi! This is how I sound. Is this speed comfortable for you?');
  }
  $('[data-rediag]', app).onclick = diagnosticIntro;
  $('[data-export]', app).onclick = () => {
    const blob = new Blob([store.exportData()], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = `sayit-copia-${store.todayKey()}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 2000);
  };
  $('[data-import]', app).onclick = () => $('[data-file]', app).click();
  $('[data-file]', app).onchange = async e => {
    const f = e.target.files[0]; if (!f) return;
    if (!confirm('Restaurar la copia reemplaza los datos actuales de este teléfono. ¿Seguir?')) return;
    try { store.importData(await f.text()); applySettings(); toast('Copia restaurada'); go('today'); }
    catch (err) { toast(err.message || 'No se pudo leer el archivo.'); }
  };
  $('[data-switch]', app).onclick = welcome;
  $('[data-del]', app).onclick = () => {
    if (prompt(`Para borrar todo el progreso de ${p.name}, escribí BORRAR`) === 'BORRAR') { store.deleteProfile(p.id); applySettings(); store.active() ? go('today') : welcome(); }
  };
}

/* ------------------------------------------------------------------ */
/* Inicio                                                              */
/* ------------------------------------------------------------------ */
function boot() {
  applySettings();
  const p = store.active();
  if (!p) welcome();
  else if (!p.diag.length) diagnosticIntro();
  else go('today');
  aiAvailable();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js').catch(() => {});
}
window.addEventListener('error', e => console.error('SayIt:', e.message));
boot();
