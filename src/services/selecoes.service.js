import { pools, allAlerts } from '../config/env.js';
import { genHistory } from '../utils/formatters.js';

/** Pre-generate history for every pool once on load */
const poolHistories = pools.map(p => genHistory(p.cl));

/** Returns a shallow copy of all pools */
export function getPools() {
  return pools;
}

/**
 * Returns one pool by index.
 * @param {number} idx
 */
export function getPool(idx) {
  return pools[idx];
}

/** Returns the static alert log */
export function getAlerts() {
  return allAlerts;
}

/**
 * Returns the pre-generated history for one pool.
 * @param {number} idx
 */
export function getPoolHistory(idx) {
  return poolHistories[idx];
}

/**
 * Simulates sensor drift — call on a setInterval in main.js.
 * In production this would be replaced by a real API poll.
 */
export function tickSensorReadings() {
  pools.forEach(p => {
    p.pH = Math.max(6.5, Math.min(9.5, +(p.pH + (Math.random() - 0.5) * 0.03).toFixed(2)));
    p.cl = Math.max(0.1, Math.min(4.5, +(p.cl + (Math.random() - 0.5) * 0.02).toFixed(2)));
  });
}
