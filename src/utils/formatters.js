// Importa as funções de validação que avaliam se os níveis de pH e Cloro estão dentro da faixa ideal
import { phStatus, clStatus } from './validators.js';

/**
 * ==========================================
 * TRADUÇÃO DE ETIQUETAS DE STATUS
 * ==========================================
 * Converte códigos de status internos em rótulos para exibição ao usuário.
 * * @param {string} s - Código do status (ex: 'ok', 'warn', 'danger').
 * @returns {string} - Texto formatado em português (ex: 'Normal', 'Atenção', 'Crítico').
 */
export function statusLabel(s) {
  // Busca a correspondência no mapa. Se não encontrar (null/undefined), retorna o próprio valor passado 's'.
  return { ok: 'Normal', warn: 'Atenção', danger: 'Crítico' }[s] ?? s;
}
/**
 * ==========================================
 * GERADOR DE RÓTULOS DE TEMPO (24 HORAS)
 * ==========================================
 * Gera um array com 48 marcações de hora no formato 'HH:mm' para o eixo X dos gráficos.
 * As marcações representam intervalos de 30 em 30 minutos nas últimas 24 horas,
 * terminando no horário atual.
 */
export function genLabels24h() {
  const now = new Date(); // Horário de referência (agora)
  
  // Cria um array fixo de 48 posições (24 horas * 2 leituras por hora)
  return Array.from({ length: 48 }, (_, i) => {
    // Calcula a data/hora para o ponto 'i' voltando no tempo a partir do momento atual
    // (47 - i) garante a ordem cronológica correta: do passado mais distante para o presente
    const t = new Date(now - (47 - i) * 30 * 60 * 1000);
    
    // Extrai horas e minutos adicionando o zero à esquerda quando necessário (ex: "09:05")
    const hours = t.getHours().toString().padStart(2, '0');
    const minutes = t.getMinutes().toString().padStart(2, '0');
    
    return `${hours}:${minutes}`;
  });
}

/**
 * ==========================================
 * GERADOR DE RÓTULOS DE DATAS (7 DIAS)
 * ==========================================
 * Gera um array com as datas dos últimos 7 dias no formato 'DD/MM' para o eixo X dos gráficos.
 * As datas são geradas em ordem cronológica, do dia mais antigo até o dia atual.
 */
export function genLabels7d() {
  const now = new Date(); // Data atual de referência
  
  // Cria um array de 7 elementos (representando os últimos 7 dias)
  return Array.from({ length: 7 }, (_, i) => {
    // Subtrai os dias necessários a partir de hoje (multiplicando 24h * 60m * 60s * 1000ms)
    // (6 - i) garante a ordem: de 6 dias atrás até hoje
    const t = new Date(now - (6 - i) * 24 * 60 * 60 * 1000);
    
    // Formata a data para o padrão do Brasil exibindo dia e mês com 2 dígitos (ex: "12/08")
    return t.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  });
}

/**
 * ==========================================
 * GERADOR DE RÓTULOS DE DATAS (30 DIAS)
 * ==========================================
 * Gera um array com as datas dos últimos 30 dias no formato 'DD/MM' para o eixo X dos gráficos.
 * Utilizado para relatórios mensais e análises de tendência de longo prazo.
 * * @returns {Array<string>} - Lista de 30 datas formatadas (ex: ['14/07', ..., '12/08']).
 */
export function genLabels30d() {
  const now = new Date(); // Data atual de referência
  
  // Cria um array de 30 elementos (representando o ciclo de 30 dias)
  return Array.from({ length: 30 }, (_, i) => {
    // Subtrai os dias necessários em milissegundos
    // (29 - i) garante a sequência cronológica do dia 1 ao 30 do período
    const t = new Date(now - (29 - i) * 24 * 60 * 60 * 1000);
    
    // Formata a data para o padrão 'DD/MM'
    return t.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  });
}

/**
 * ==========================================
 * GERADOR DE SÉRIE TEMPORAL DE pH (MOCK)
 * ==========================================
 * Cria um histórico de valores de pH simulando a flutuação natural da água.
 * * @param {number} baseVal        - O valor inicial/médio do pH (ex: 7.4).
 * @param {number} count            - Quantidade de pontos de dados a serem gerados (ex: 48).
 * @param {number} [deviation=0.2]  - A intensidade da variação entre cada ponto.
 * @returns {Array<number>}         - Array com a sequência de valores de pH formatados.
 */
export function genPhSeries(baseVal, count, deviation = 0.2) {
  let v = baseVal;
  
  return Array.from({ length: count }, () => {
    // 1. Aplica uma pequena variação positiva ou negativa ao valor anterior
    v += (Math.random() - 0.5) * deviation;
    
    // 2. Garante que o valor não fuja da margem de segurança de +/- 0.8 da média
    v = Math.max(baseVal - 0.8, Math.min(baseVal + 0.8, v));
    
    // 3. Arredonda para 2 casas decimais e o '+' converte o resultado para número
    return +v.toFixed(2);
  });
}

/**
 * ==========================================
 * GERADOR DE SÉRIE TEMPORAL DE CLORO (MOCK)
 * ==========================================
 * Cria um histórico simulado de níveis de cloro livre em ppm (partes por milhão).
 * * @param {number} baseVal - O valor médio/inicial do cloro (ex: 1.20).
 * @param {number} count   - Quantidade de pontos de dados a serem gerados.
 * @returns {Array<number>} - Array com a sequência de leituras de cloro formatadas.
 */
export function genClSeries(baseVal, count) {
  let v = baseVal;
  
  return Array.from({ length: count }, () => {
    // 1. Oscila o valor do cloro suavemente com passo máximo de 0.15
    v += (Math.random() - 0.5) * 0.15;
    
    // 2. Mantém o valor simulado dentro do limite físico seguro (entre 0.1 e 4.5 ppm)
    v = Math.max(0.1, Math.min(4.5, v));
    
    // 3. Arredonda para 2 casas decimais e converte para número
    return +v.toFixed(2);
  });
}

/**
 * ==========================================
 * GERADOR DE HISTÓRICO COMPLETO (MOCK DE LOGS)
 * ==========================================
 * Gera uma lista de leituras completas (pH, Cloro, Temperatura e Status) 
 * organizadas cronologicamente para preencher tabelas de histórico do sistema.
 * * @param {number} baseCl   - Valor base do cloro para simulação.
 * @param {number} [count=20] - Quantidade de registros no histórico (padrão: 20).
 * @returns {Array<Object>}  - Lista de objetos com data, hora, parâmetros e status.
 */
export function genHistory(baseCl, count = 20) {
  const now = new Date();
  
  return Array.from({ length: count }, (_, i) => {
    // 1. Calcula o momento exato do registro (voltando no tempo em intervalos de 30 minutos)
    const t = new Date(now - (count - 1 - i) * 30 * 60 * 1000);
    
    // 2. Simula os dados dos sensores
    const ph   = +(Math.random() * 0.4 + 7.3).toFixed(2);            // pH entre 7.30 e 7.70
    const cl   = +(baseCl + (Math.random() - 0.5) * 0.3).toFixed(2); // Cloro oscilando em +/- 0.15
    const temp = +(27 + Math.random() * 3).toFixed(1);               // Temp entre 27.0°C e 30.0°C
    
    // 3. Avalia o estado individual de cada parâmetro usando as funções de validação
    const ps = phStatus(ph);
    const cs = clStatus(cl);
    
    // 4. Define a gravidade geral do registro baseado na pior condição detectada
    const status = ps === 'danger' || cs === 'danger' ? 'danger'
                 : ps === 'warn'   || cs === 'warn'   ? 'warn'
                 : 'ok';
                 
    // 5. Retorna o objeto formatado pronto para ser exibido em tabelas
    return {
      date: t.toLocaleDateString('pt-BR'),
      time: t.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      ph,
      cl,
      temp,
      status,
    };
  });
}