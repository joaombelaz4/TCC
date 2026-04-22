/**
 * Thin fetch wrapper.
 * Swap the base URL for a real API when moving from mock to production.
 */
const BASE_URL = '';

/**
 * @param {string} endpoint
 * @returns {Promise<any>}
 */
export async function get(endpoint) {
  const res = await fetch(`${BASE_URL}${endpoint}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}

/**
 * @param {string} endpoint
 * @param {object} body
 * @returns {Promise<any>}
 */
export async function post(endpoint, body) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  return res.json();
}
