/**
 * ==========================================
 * COMPONENTE: NAVBAR (BARRA SUPERIOR E LATERAL)
 * ==========================================
 * Gerencia todas as interações da barra superior (topbar) e do menu lateral (sidebar).
 *
 * @param {Object} handlers - Objeto contendo as funções de escuta/respostas a eventos.
 * @param {Function} handlers.onNavigate   - Executada ao clicar em uma aba; recebe o nome da página (ex: 'dashboard').
 * @param {Function} handlers.onPoolChange - Executada ao trocar de piscina no menu; recebe o índice numérico.
 * @param {Function} handlers.onLogout     - Executada ao clicar no botão de sair/logout.
 */

// Exporta a função principal para ser usada no main.js
export function initNavbar({ onNavigate, onPoolChange, onLogout }) {
  /**
   * 1. NAVEGAÇÃO DO MENU LATERAL (SIDEBAR)
   */
  // Busca todos os botões do menu que possuam o atributo 'data-page'
  document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
    // Adiciona o evento de clique a cada um desses botões
    btn.addEventListener('click', () => {
      // Lê o valor do atributo 'data-page' do HTML (ex: "dashboard", "graficos")
      const page = btn.dataset.page;
      // 1º Passo: Altera o visual do botão no menu (deixa ele "ativo")
      setActiveNavItem(page);
      // 2º Passo: Executa a função passada pelo main.js para trocar a tela mostrada
      onNavigate(page);
    });
  });

  /**
   * 2. TROCA DE PISCINA (DROPDOWN)
   */
  // Escuta quando o usuário muda a opção selecionada no <select>
  document.getElementById('pool-select').addEventListener('change', e => {
    // Pega o valor (value) da tag <option> selecionada.
    // O parseInt(..., 10) garante que o valor seja convertido de texto para número inteiro.
    onPoolChange(parseInt(e.target.value, 10));
  });

  /**
   * 3. SAIR DO SISTEMA (LOGOUT)
   */
  // Conecta o botão de sair à função recebida via parâmetro (onLogout)
  document.getElementById('btn-logout').addEventListener('click', onLogout);

  /**
   * 4. PAINEL DE NOTIFICAÇÕES (SINO)
   */
  // Alterna a exibição do painel ao clicar no ícone do sino
  document.getElementById('notif-btn').addEventListener('click', toggleNotifPanel);

  // Truque de interface: "Clicar fora para fechar"
  // Escuta todos os cliques que acontecem na janela inteira (document)
  document.addEventListener('click', e => {
    // O método .closest() verifica se o elemento clicado é ou está dentro do ID especificado.
    if (!e.target.closest('#notif-btn') && !e.target.closest('#notif-panel')) {
      // Esconde o painel removendo a classe 'show'
      document.getElementById('notif-panel').classList.remove('show');
    }
  });
}

/**
 * ==========================================
 * ATUALIZAÇÃO VISUAL DO MENU LATERAL
 * ==========================================
 * Altera o estilo dos botões da sidebar, destacando a página atual 
 * e tirando o destaque das outras
 */
export function setActiveNavItem(page) {
  document.querySelectorAll('.nav-item[data-page]').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.page === page);
  });
}

/**
 * ==========================================
 * EXIBIÇÃO DO PAINEL DE NOTIFICAÇÕES
 * ==========================================
 * Alterna a visibilidade do painel suspenso de notificações.
 */
function toggleNotifPanel() {
  document.getElementById('notif-panel').classList.toggle('show');
}