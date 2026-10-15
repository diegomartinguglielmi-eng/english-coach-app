// SayIt · conexión con el coach de IA
import { active, currentTheta, levelLabel } from './store.js';

const URL_COACH = '/api/coach';
let available = null;

export async function aiAvailable() {
  if (available !== null) return available;
  if (!navigator.onLine) return false;
  try {
    const r = await fetch(URL_COACH, { method: 'GET', cache: 'no-store' });
    const d = await r.json();
    available = Boolean(r.ok && d.ai);
  } catch (e) { available = false; }
  return available;
}

export async function coach(mode, payload) {
  if (!navigator.onLine) throw new Error('Sin conexión a internet: el coach con IA no está disponible.');
  const p = active();
  const body = { mode, name: p?.name, level: levelLabel(currentTheta(p)).code, ...payload };
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 45000);
  try {
    const r = await fetch(URL_COACH, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body), signal: ctrl.signal
    });
    let d = {};
    try { d = await r.json(); } catch (e) {}
    if (r.status === 429) throw new Error('Muchos pedidos seguidos. Esperá un minuto y probá de nuevo.');
    if (!r.ok) throw new Error(d.error || 'El coach no respondió.');
    return d;
  } catch (e) {
    if (e.name === 'AbortError') throw new Error('El coach tardó demasiado. Probá de nuevo.');
    throw e;
  } finally { clearTimeout(t); }
}
