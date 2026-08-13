/**
 * ==========================================
 * REGRAS DE VALIDAÇÃO E STATUS DE PARÂMETROS
 * ==========================================
 * Funções que avaliam as leituras de sensores em relação aos limites
 * definidos na configuração global (env.js), retornando a gravidade.
 */

// Importa os limites mínimos e máximos ideais para pH e Cloro
import { PH_MIN, PH_MAX, CL_MIN, CL_MAX } from '../config/env.js';

/**
 * Avalia o nível de pH da água e classifica sua gravidade.
 * * @param {number} v - Valor do pH lido.
 * @returns {'ok'|'warn'|'danger'} - Estado do parâmetro.
 */
export function phStatus(v) {
  // Estado Crítico: pH muito abaixo de 6.7 ou muito acima de 8.3
  if (v < PH_MIN - 0.5 || v > PH_MAX + 0.5) return 'danger';
  
  // Estado de Alerta: pH fora da faixa ideal, mas ainda tolerável
  if (v < PH_MIN       || v > PH_MAX)       return 'warn';
  
  // Estado Ideal (entre 7.2 e 7.8)
  return 'ok';
}

/**
 * Avalia o nível de Cloro Livre (ppm) na água e classifica sua gravidade.
 * * @param {number} v - Valor do cloro em ppm.
 * @returns {'ok'|'warn'|'danger'} - Estado do parâmetro.
 */
export function clStatus(v) {
  // Estado Crítico: Cloro muito baixo (< 0.3) ou muito alto (> 3.5)
  if (v < CL_MIN - 0.2 || v > CL_MAX + 0.5) return 'danger';
  
  // Estado de Alerta: Cloro fora da faixa ideal
  if (v < CL_MIN        || v > CL_MAX)       return 'warn';
  
  // Estado Ideal (entre 0.5 e 3.0 ppm)
  return 'ok';
}