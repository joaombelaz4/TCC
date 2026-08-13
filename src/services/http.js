/**
 * ==========================================
 * CLIENTE HTTP / ENVOLTÓRIO DE REQUISIÇÕES
 * ==========================================
 * Centraliza as chamadas de rede (API) da aplicação.
 * Altere a 'BASE_URL' ao migrar do ambiente de testes (mock) 
 * para o servidor de produção real.
 */

// Endereço base da API backend
const BASE_URL = '';

/**
 * Realiza uma requisição HTTP do tipo GET (busca de dados).
 * * @param {string} endpoint - O caminho da rota na API (ex: '/api/pools').
 * @returns {Promise<any>} - Retorna os dados convertidos em formato JSON.
 * @throws {Error} - Lança um erro se a resposta HTTP não for bem-sucedida (!res.ok).
 */
export async function get(endpoint) {
  // Faz a chamada de rede juntando a URL base com a rota desejada
  const res = await fetch(`${BASE_URL}${endpoint}`);
  
  // Se o servidor retornar status de erro interrompe e dispara exceção
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

  // Converte a resposta bruta em objeto JavaScript
  return res.json();
}

/**
 * Realiza uma requisição HTTP do tipo POST (envio/criação de dados).
 * * @param {string} endpoint - O caminho da rota na API (ex: '/api/login').
 * @param {object} body       - Objeto com os dados a serem enviados no corpo da requisição.
 * @returns {Promise<any>}    - Retorna a resposta do servidor convertida em JSON.
 * @throws {Error}            - Lança um erro se a resposta HTTP falhar.
 */
export async function post(endpoint, body) {
  // Faz a chamada enviando as configurações do método POST
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },  // Informa o tipo de conteúdo enviado
    body: JSON.stringify(body),                       // Converte o objeto JS para string JSON
  });

  // Valida se a requisição foi bem-sucedida
  if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);
  
  // Retorna os dados da resposta em formato de objeto
  return res.json();
}