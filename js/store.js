// SayIt · datos guardados en este dispositivo
import { LEVELS } from './content.js';

const KEY = 'sayit.v2';
const DAY = 86400000;

export const todayKey = (d = new Date()) => {
  const z = new Date(d.getTime() - d.getTimezoneOffset() * 60000);
  return z.toISOString().slice(0, 10);
};
const daysBetween = (a, b) => Math.round((new Date(b) - new Date(a)) / DAY);

function blankProfile(name) {
  return {
    id: 'p' + Date.now().toString(36),
    name,
    created: new Date().toISOString(),
    settings: { minutes: 15, rate: 0.92, voiceURI: '', theme: 'auto' },
    diag: [],             // [{date, theta, skills, pron, notes}]
    week: 1,
    sessions: {},         // {semana: [fechas]}
    checks: {},           // {semana: {score, date, parts}}
    srs: {},              // {palabra: {due, interval, ease, reps, lapses}}
    sounds: {},           // {sonido: {tries, ok}}
    mistakes: [],         // [{wrong, right, why, date}]
    xp: 0,
    activity: {},         // {fecha: minutos}
    lastSession: null
  };
}

let state = load();

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && Array.isArray(s.profiles)) return s;
  } catch (e) { /* datos dañados: se empieza de nuevo */ }
  // Migración desde la versión anterior: solo nombres de perfiles
  const fresh = { profiles: [], active: null };
  try {
    const old = JSON.parse(localStorage.getItem('englishCoachProfiles') || '[]');
    for (const o of old) if (o && o.name) fresh.profiles.push({ ...blankProfile(o.name), id: o.id || blankProfile(o.name).id });
  } catch (e) {}
  return fresh;
}

export function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); return true; }
  catch (e) { return false; }
}

export const profiles = () => state.profiles;
export const active = () => state.profiles.find(p => p.id === state.active) || null;
export function setActive(id) { state.active = id; save(); }
export function createProfile(name) {
  const p = blankProfile(name);
  state.profiles.push(p); state.active = p.id; save();
  return p;
}
export function deleteProfile(id) {
  state.profiles = state.profiles.filter(p => p.id !== id);
  if (state.active === id) state.active = state.profiles[0]?.id || null;
  save();
}
export function exportData() { return JSON.stringify({ app: 'SayIt', version: 2, exported: new Date().toISOString(), ...state }, null, 1); }
export function importData(json) {
  const s = JSON.parse(json);
  if (!s || !Array.isArray(s.profiles)) throw new Error('El archivo no es una copia de SayIt.');
  state = { profiles: s.profiles, active: s.active || s.profiles[0]?.id || null };
  save();
}

/* ---------- Actividad, racha y XP ---------- */
export function logActivity(minutes = 1, xp = 0) {
  const p = active(); if (!p) return;
  const k = todayKey();
  p.activity[k] = Math.round(((p.activity[k] || 0) + minutes) * 10) / 10;
  p.xp += xp;
  save();
}
export function streak(p = active()) {
  if (!p) return 0;
  let n = 0, d = new Date();
  if (!p.activity[todayKey(d)]) d = new Date(d.getTime() - DAY); // la racha sigue viva hasta el final de hoy
  while (p.activity[todayKey(d)]) { n++; d = new Date(d.getTime() - DAY); }
  return n;
}
export function minutesThisWeek(p = active()) {
  if (!p) return 0;
  let m = 0;
  for (let i = 0; i < 7; i++) m += p.activity[todayKey(new Date(Date.now() - i * DAY))] || 0;
  return Math.round(m);
}

/* ---------- Nivel ---------- */
// theta: 0 = A1 … 4 = C1 (escala continua)
export function levelLabel(theta) {
  const t = Math.max(0, Math.min(4.49, theta));
  const band = Math.floor(t + 0.5);
  const within = t + 0.5 - band;
  return { code: LEVELS[band], band, part: within < 0.34 ? 'inicial' : within < 0.67 ? 'medio' : 'alto', pct: Math.round(within * 100) };
}
export const latestDiag = (p = active()) => p?.diag?.[p.diag.length - 1] || null;
export const currentTheta = (p = active()) => latestDiag(p)?.theta ?? 1.5;

/* ---------- Repetición espaciada (estilo SM-2 simplificado) ---------- */
export function srsGrade(key, grade) { // grade: 0 otra vez, 1 bien, 2 fácil
  const p = active(); if (!p) return;
  const c = p.srs[key] || { interval: 0, ease: 2.4, reps: 0, lapses: 0 };
  if (grade === 0) { c.reps = 0; c.lapses++; c.interval = 0; c.ease = Math.max(1.3, c.ease - 0.2); }
  else {
    c.reps++;
    c.interval = c.reps === 1 ? (grade === 2 ? 3 : 1) : c.reps === 2 ? (grade === 2 ? 6 : 3) : Math.round(c.interval * c.ease * (grade === 2 ? 1.3 : 1));
    if (grade === 2) c.ease = Math.min(3, c.ease + 0.1);
  }
  c.due = todayKey(new Date(Date.now() + c.interval * DAY));
  p.srs[key] = c; save();
}
export const srsDue = (p = active()) => Object.entries(p?.srs || {}).filter(([, c]) => c.due <= todayKey()).map(([k]) => k);
export const srsKnown = (p = active()) => Object.values(p?.srs || {}).filter(c => c.reps >= 2).length;

/* ---------- Sonidos y errores ---------- */
export function soundResult(id, ok) {
  const p = active(); if (!p) return;
  const s = p.sounds[id] || { tries: 0, ok: 0 };
  s.tries++; if (ok) s.ok++;
  p.sounds[id] = s; save();
}
export function addMistake(m) {
  const p = active(); if (!p || !m?.right) return;
  const wrong = String(m.wrong || '').trim(), right = String(m.right).trim();
  if (wrong.toLowerCase() === right.toLowerCase()) return;
  p.mistakes = p.mistakes.filter(x => x.wrong.toLowerCase() !== wrong.toLowerCase());
  p.mistakes.unshift({ wrong, right, why: m.why || '', date: todayKey() });
  p.mistakes = p.mistakes.slice(0, 60);
  save();
}

/* ---------- Semana del programa ---------- */
export const sessionsDone = (p = active(), w = p?.week) => (p?.sessions?.[w] || []).length;
export function completeSession(minutes) {
  const p = active(); if (!p) return;
  (p.sessions[p.week] = p.sessions[p.week] || []).push(todayKey());
  p.lastSession = todayKey();
  logActivity(minutes, 50);
}
export function completeCheck(score, parts) {
  const p = active(); if (!p) return;
  p.checks[p.week] = { score, parts, date: todayKey() };
  logActivity(4, 80);
}
export function advanceWeek() {
  const p = active(); if (!p) return;
  p.week = Math.min(12, p.week + 1);
  save();
}
export const weeksSinceDiag = (p = active()) => {
  const d = latestDiag(p);
  return d ? Math.floor(daysBetween(d.date.slice(0, 10), todayKey()) / 7) : null;
};
