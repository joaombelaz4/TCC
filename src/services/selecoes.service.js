import { get, post } from './http.js';

let poolsCache = null;

export async function getPools(forceReload = false) {
  if (forceReload || !poolsCache) {
    poolsCache = await get('/api/pools');
  }
  return poolsCache;
}

export async function getPool(idx) {
  const pools = await getPools();
  return pools[idx];
}

export async function getPoolHistory(idx, limit = 1000) {
  const pools = await getPools();
  const pool = pools[idx];
  if (!pool) return [];
  return get(`/api/pools/${pool.id}/history?limit=${limit}`);
}

export async function getAlerts() {
  return get('/api/alerts');
}

export async function getSettings() {
  return get('/api/settings');
}

export async function saveSettings(settings) {
  return post('/api/settings', settings);
}

export function clearPoolsCache() {
  poolsCache = null;
}
