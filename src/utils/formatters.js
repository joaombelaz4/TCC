import { phStatus, clStatus } from './validators.js';

/** Human-readable label for a status string */
export function statusLabel(s) {
  return { ok: 'Normal', warn: 'Atenção', danger: 'Crítico' }[s] ?? s;
}

/** Last-24-hour time labels (30-min buckets) */
export function genLabels24h() {
  const now = new Date();
  return Array.from({ length: 48 }, (_, i) => {
    const t = new Date(now - (47 - i) * 30 * 60 * 1000);
    return t.getHours().toString().padStart(2, '0') + ':' + t.getMinutes().toString().padStart(2, '0');
  });
}

/** Last-7-day labels (one per day) */
export function genLabels7d() {
  const now = new Date();
  return Array.from({ length: 7 }, (_, i) => {
    const t = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
    return t.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  });
}

/** Last-30-day labels (one per day) */
export function genLabels30d() {
  const now = new Date();
  return Array.from({ length: 30 }, (_, i) => {
    const t = new Date(now - (29 - i) * 24 * 60 * 60 * 1000);
    return t.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  });
}

/**
 * Generates a randomised pH time series around a base value.
 * @param {number} baseVal
 * @param {number} count
 * @param {number} [deviation=0.2]
 */
export function genPhSeries(baseVal, count, deviation = 0.2) {
  let v = baseVal;
  return Array.from({ length: count }, () => {
    v += (Math.random() - 0.5) * deviation;
    v = Math.max(baseVal - 0.8, Math.min(baseVal + 0.8, v));
    return +v.toFixed(2);
  });
}

/**
 * Generates a randomised chlorine time series around a base value.
 * @param {number} baseVal
 * @param {number} count
 */
export function genClSeries(baseVal, count) {
  let v = baseVal;
  return Array.from({ length: count }, () => {
    v += (Math.random() - 0.5) * 0.15;
    v = Math.max(0.1, Math.min(4.5, v));
    return +v.toFixed(2);
  });
}

/**
 * Generates a history log for a pool.
 * @param {number} baseCl  - base chlorine value
 * @param {number} [count=20]
 */
export function genHistory(baseCl, count = 20) {
  const now = new Date();
  return Array.from({ length: count }, (_, i) => {
    const t    = new Date(now - (count - 1 - i) * 30 * 60 * 1000);
    const ph   = +(Math.random() * 0.4 + 7.3).toFixed(2);
    const cl   = +(baseCl + (Math.random() - 0.5) * 0.3).toFixed(2);
    const temp = +(27 + Math.random() * 3).toFixed(1);
    const ps   = phStatus(ph);
    const cs   = clStatus(cl);
    const status = ps === 'danger' || cs === 'danger' ? 'danger'
                 : ps === 'warn'   || cs === 'warn'   ? 'warn'
                 : 'ok';
    return {
      date:   t.toLocaleDateString('pt-BR'),
      time:   t.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      ph, cl, temp, status,
    };
  });
}
