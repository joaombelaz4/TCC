/**
 * ==========================================
 * MAPA DE ROTAS E METADADOS DAS PÁGINAS
 * ==========================================
 * Este objeto funciona como o mapa principal do aplicativo.
 * Ele associa o identificador de uma página (chave) às suas configurações (valor).
 * * Propriedade 'module':
 * Indica a qual parte do sistema (ou pasta) essa tela pertence.
 * - 'home'     = renderizado pelo módulo src/pages/home
 * - 'selecoes' = renderizado pelo módulo src/pages/selecoes (abas internas)
 */
export const routes = {
  dashboard: { module: 'home',     label: 'Dashboard'     },
  graficos:  { module: 'selecoes', label: 'Gráficos'      },
  historico: { module: 'selecoes', label: 'Histórico'     },
  alertas:   { module: 'selecoes', label: 'Alertas'       },
  config:    { module: 'selecoes', label: 'Configurações' },
};

/**
 * ==========================================
 * DESCOBERTA DE MÓDULO (HELPER)
 * ==========================================
 * Função utilitária que recebe o nome de uma página e retorna a qual 
 * módulo ela pertence, baseando-se no mapa de rotas acima.
 */
export function getModule(page) {
  // 1. rotas[page]?.module: Tenta buscar o módulo com segurança (Optional Chaining).
  // 2. ?? null: Se a busca retornar undefined (página não existe), força o retorno de 'null'.
  return routes[page]?.module ?? null;
}