import { PH_MIN, PH_MAX, CL_MIN, CL_MAX } from '../config/env.js';

/**
 * Returns 'ok' | 'warn' | 'danger' for a pH reading.
 * @param {number} v
 * @returns {'ok'|'warn'|'danger'}
 */
export function phStatus(v) {
  if (v < PH_MIN - 0.5 || v > PH_MAX + 0.5) return 'danger';
  if (v < PH_MIN       || v > PH_MAX)       return 'warn';
  return 'ok';
}

/**
 * Returns 'ok' | 'warn' | 'danger' for a chlorine reading.
 * @param {number} v
 * @returns {'ok'|'warn'|'danger'}
 */
export function clStatus(v) {
  if (v < CL_MIN - 0.2 || v > CL_MAX + 0.5) return 'danger';
  if (v < CL_MIN        || v > CL_MAX)       return 'warn';
  return 'ok';
}
