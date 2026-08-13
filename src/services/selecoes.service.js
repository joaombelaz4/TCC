/**
 * ==========================================
 * SERVIÇOS DE PISCINAS E CONFIGURAÇÕES
 * ==========================================
 * Gerencia as requisições de API relacionadas às piscinas, 
 * histórico de medições, alertas do sistema e preferências do usuário.
 */
import { get, post } from './http.js';

// Armazena a lista de piscinas em memória para evitar chamadas de rede desnecessárias
let poolsCache = null;

/**
 * Busca a lista de piscinas cadastradas.
 * Utiliza cache na memória a menos que forceReload seja verdadeiro.
 */
export async function getPools(forceReload = false) {
  // Busca no servidor se for solicitado recarregamento OU se o cache estiver vazio
  if (forceReload || !poolsCache) {
    poolsCache = await get('/api/pools');
  }
  return poolsCache;
}

// Busca os dados de uma única piscina a partir do seu índice no array.
export async function getPool(idx) {
  const pools = await getPools();
  return pools[idx];
}

// Busca o histórico de leituras (telemetria) de uma piscina específica.
export async function getPoolHistory(idx, limit = 1000) {
  const pools = await getPools();
  const pool = pools[idx];
  // Retorna um array vazio caso o índice da piscina seja inválido
  if (!pool) return [];
  // Realiza a chamada GET enviando o ID único da piscina e o limite na query string
  return get(`/api/pools/${pool.id}/history?limit=${limit}`);
}

// Busca a lista global de alertas ativos do sistema.
export async function getAlerts() {
  return get('/api/alerts');
}

// Busca as configurações gerais salvas no sistema.
export async function getSettings() {
  return get('/api/settings');
}

// Salva/Atualiza as configurações do sistema no servidor.
export async function saveSettings(settings) {
  return post('/api/settings', settings);
}

/**
 * Limpa o cache local de piscinas.
 * Deve ser chamada após um cadastro/edição de piscina ou ao fazer Logout.
 */
export function clearPoolsCache() {
  poolsCache = null;
}