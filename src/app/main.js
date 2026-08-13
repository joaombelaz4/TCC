/**
 * ==========================================
 * IMPORTAÇÕES DE MÓDULOS (DEPENDÊNCIAS)
 * ==========================================
 * Trazemos funções de outros arquivos para manter o código organizado 
 * e modular. O main.js atua como o controlador principal do app.
 */

// Importa a função que inicializa os comportamentos da barra de navegação (cliques, menu, etc)
import { initNavbar }             from '../components/navbar/index.js';

// Importa o serviço que simula/busca as leituras contínuas dos sensores da piscina
import { tickSensorReadings }     from '../services/selecoes.service.js';

// Importa as funções responsáveis por atualizar a tela inicial (Dashboard) e o gráfico pequeno
import { updateDashboard, renderMiniChart } from '../pages/home/index.js';

// Importa as funções pesadas da página de "Seleções" (telas detalhadas das piscinas).
// Controlam os gráficos maiores, tabela de histórico, lista de alertas e a limpeza da memória (destroyCharts)
import {
  renderMainChart, renderClChart,
  renderHistoryTable, renderAlerts,
  initSelecoes, destroyCharts,
} from '../pages/selecoes/index.js';
import { getAlerts, getPools } from '../services/selecoes.service.js';

/**
 * ==========================================
 * ESTADO GLOBAL DA APLICAÇÃO
 * ==========================================
 * Variáveis que guardam informações importantes sobre o momento atual do app.
 */

// Armazena o índice da piscina selecionada no momento pelo usuário.
let currentPool = 0;

// Flag de controle de carregamento.
// Começa como 'false' e só vira 'true' quando a interface e os dados iniciais terminam de carregar
let appReady    = false;

/**
 * ==========================================
 * CONTROLE DE ACESSO E ANIMAÇÕES DE TELA
 * ==========================================
 * 
 * Função executada quando o usuário clica em "Entrar".
 */
function doLogin() {
  const screen = document.getElementById('login-screen');
  
  // 1. Aplica o efeito de "fade out" (desaparecer) na tela de login
  screen.style.transition = 'opacity .4s';
  screen.style.opacity    = '0';

  // 2. Aguarda 400ms (tempo da animação acima) para trocar as telas
  setTimeout(() => {
    screen.style.display = 'none'; // Tira a tela de login do fluxo do HTML
    
    // Prepara a tela do app para aparecer (fade in)
    const app = document.getElementById('app');
    app.classList.add('visible');
    app.style.opacity    = '0';
    app.style.transition = 'opacity .4s';
    
    // Pequeno atraso (50ms) apenas para o navegador processar a classe antes de animar
    setTimeout(() => (app.style.opacity = '1'), 50);

    // 3. Inicialização dos dados
    if (!appReady) { 
      // Se for o primeiro acesso, inicia os dados do sistema e marca como pronto
      bootApp().then(() => { appReady = true; }); 
    } else { 
      // Se o usuário apenas deslogou e logou de novo, só atualiza a tela sem recarregar tudo
      updateDashboard(currentPool); 
      renderMiniChart(currentPool); 
    }
  }, 400);
}

/**
 * Função executada quando o usuário clica em "Sair".
 * Esconde o painel do aplicativo e traz a tela de login de volta.
 */
function doLogout() {
  // Esconde o app principal
  document.getElementById('app').classList.remove('visible');
  
  // Traz a tela de login de volta com efeito de "fade in"
  const ls = document.getElementById('login-screen');
  ls.style.display    = 'flex';
  ls.style.opacity    = '0';
  ls.style.transition = 'opacity .4s';
  
  setTimeout(() => (ls.style.opacity = '1'), 50);
}

/**
 * ==========================================
 * MAPEAMENTO DE AÇÕES DAS PÁGINAS (ROTEAMENTO)
 * ==========================================
 * Este objeto funciona como o "cérebro" da navegação do app. Ele liga o nome 
 * de uma aba (chave) à função que deve ser executada para desenhar a tela (valor).
 */
const PAGE_HANDLERS = {
  // Tela inicial: Atualiza os cards de status geral e renderiza o gráfico pequeno.
  dashboard: () => { 
    updateDashboard(currentPool); 
    renderMiniChart(currentPool); 
  },
  
  // Tela de gráficos: Desenha os gráficos detalhados de pH e Cloro.
  graficos:  () => { 
    setTimeout(() => { 
      renderMainChart(currentPool); 
      renderClChart(currentPool); 
    }, 100); 
  },
  
  // Tela de histórico: Monta e exibe a tabela com as leituras passadas.
  historico: () => renderHistoryTable(currentPool),
  
  // Tela de alertas: Renderiza a lista de avisos e notificações da piscina.
  alertas:   () => renderAlerts(),
  
  // Tela de configurações: Função vazia reservada para implementações futuras.
  config:    () => {},
};

/**
 * ==========================================
 * MOTOR DE NAVEGAÇÃO ENTRE ABAS
 * ==========================================
 * Controla a exibição das telas do aplicativo (dashboard, gráficos, etc.)
 * e aciona as funções de renderização específicas de cada uma.
 */
function showPage(name) {
  // 1. Esconde todas as páginas removendo a classe 'active' de todos os elementos com a classe '.page'
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));
  
  // 2. Busca no HTML a página específica que o usuário quer acessar (ex: id="page-dashboard")
  const target = document.getElementById(`page-${name}`);
  
  // 3. Se o HTML da página existir, adiciona a classe 'active' para torná-la visível
  if (target) target.classList.add('active');
  
  // 4. Executa a função correspondente no PAGE_HANDLERS para carregar os dados da tela.
  PAGE_HANDLERS[name]?.();
}

/**
 * ==========================================
 * ATUALIZAÇÃO DO PAINEL DE NOTIFICAÇÕES
 * ==========================================
 * Busca os alertas do sistema de forma assíncrona e atualiza o contador do sino
 * e a lista suspensa com os avisos mais recentes.
 */
async function updateAlertsPanel() {
  try { 
    // 1. Busca a lista atualizada de alertas/notificações no serviço de dados
    const alerts = await getAlerts();
    // Captura os elementos visuais da interface (sino, contador e container da lista)
    const badge = document.getElementById('alert-nav-badge');
    const notifCount = document.getElementById('notif-count');
    const panel = document.getElementById('notif-items');

    // 2. Atualiza a "bolinha" de notificação no menu superior
    if (badge) {
      badge.textContent = alerts.length;
      // Mostra a bolinha se houver alertas (> 0); esconde se não houver nenhum
      badge.style.display = alerts.length ? 'inline-flex' : 'none';
    }

    // 3. Atualiza o número do contador dentro do cabeçalho do painel
    if (notifCount) {
      notifCount.textContent = alerts.length;
    }

    // Trava de segurança: se o elemento da lista não existir no HTML atual, encerra a função
    if (!panel) return;

    // 4. Caso não haja alertas ativos, exibe a mensagem de estado vazio
    if (!alerts.length) {
      panel.innerHTML = `<div class="empty-state"><p>Sem notificações no momento.</p></div>`;
      return;
    }

    // 5. Renderiza apenas as 3 notificações mais recentes no menu suspenso
    panel.innerHTML = alerts.slice(0, 3).map(alert => `
      <div class="tooltip-notif">
        <div class="tn-dot ${alert.type}"></div>
        <div>
          <div class="tn-text">${alert.pool}: ${alert.title}</div>
          <div class="tn-time">${alert.time}</div>
        </div>
      </div>`).join('');
  } catch (error) {
    // Captura eventuais falhas na busca de dados sem travar a navegação do usuário
    console.error('Falha ao atualizar o painel de notificações', error);
  }
}

/**
 * ==========================================
 * PREENCHIMENTO DO MENU DROPDOWN DE PISCINAS
 * ==========================================
 * Busca a lista de piscinas ativas e constrói dinamicamente 
 * as opções (<option>) dentro do elemento <select id="pool-select">.
 */
async function populatePoolSelect() {
  try {
    // 1. Busca a lista atualizada de piscinas cadastradas de forma assíncrona
    const pools = await getPools(true);
    // Captura o elemento <select> no HTML
    const select = document.getElementById('pool-select');
    // Trava de segurança: se o select não for encontrado no DOM, encerra a função
    if (!select) return;

    // 2. Transforma o array de piscinas em elementos HTML <option> e injeta no <select>
    select.innerHTML = pools.map((pool, idx) => `
      <option value="${idx}">${pool.name} (${pool.size})</option>
    `).join('');
    // 3. Mantém a seleção da piscina atual sincronizada
    if (pools.length > 0) {
      // Garante que o índice da piscina ativa não seja maior do que a quantidade de piscinas disponíveis
      currentPool = Math.min(currentPool, pools.length - 1);
      // Define a opção visivelmente selecionada no dropdown
      select.value = currentPool;
    }
  } catch (error) {
    // Registra falhas de comunicação/busca sem interromper o funcionamento do app
    console.error('Falha ao carregar as piscinas', error);
  }
}

/**
 * ==========================================
 * TROCA DE PISCINA (MUDANÇA DE CONTEXTO)
 * ==========================================
 * Executada quando o usuário escolhe uma piscina diferente no menu superior.
 */
function switchPool(idx) {
  // 1. Atualiza a variável global com a nova piscina selecionada
  currentPool = idx;
  
  // 2. Destrói os gráficos antigos do Chart.js para liberar memória 
  // e evitar que o novo gráfico seja desenhado por cima do antigo (evita bugs visuais)
  destroyCharts();

  // 3. Verifica qual aba/página está visível na tela neste momento
  const active = document.querySelector('.page.active');
  
  if (active) {
    // 4. Pega o ID da página ativa e remove o prefixo 'page-' para descobrir o nome real (ex: 'dashboard')
    const name = active.id.replace('page-', '');
    
    // 5. Aciona o PAGE_HANDLERS para renderizar a página atual novamente, 
    // mas agora buscando os dados da nova piscina (currentPool atualizado)
    PAGE_HANDLERS[name]?.();
  }
}

/**
 * ==========================================
 * INICIALIZAÇÃO GERAL DO APLICATIVO (BOOT)
 * ==========================================
 * Função assíncrona responsável pela montagem inicial do app:
 * 1. Injeta o HTML secundário
 * 2. Conecta os eventos da navbar
 * 3. Renderiza a interface inicial
 * 4. Inicia a simulação contínua dos sensores
 */
async function bootApp() {
  // 1. Busca dinamicamente o HTML da página de seleções e injeta na div container
  const res  = await fetch('src/pages/selecoes/index.html');
  const html = await res.text();
  document.getElementById('selecoes-pages').innerHTML = html;

  // 2. Conecta a lógica da Navbar passandode funções de callback (ações ao clicar nos botões)
  initNavbar({
    onNavigate:   showPage,     // Função chamada ao clicar nas abas
    onPoolChange: switchPool,   // Função chamada ao trocar a piscina no select
    onLogout:     doLogout,     // Função chamada ao clicar em 'Sair'
  });

  // 3. Renderiza todos os componentes visuais iniciais com base na piscina ativa (currentPool)
  initSelecoes(currentPool);
  updateDashboard(currentPool);
  renderMiniChart(currentPool);
  renderHistoryTable(currentPool);
  renderAlerts();

  // 4. Timer de Simulação dos Sensores:
  // Dispara a cada 30 segundos (30.000 ms) para simular o recebimento de novas leituras do hardware
  setInterval(() => {
    // Atualiza os dados simulados na memória
    tickSensorReadings();
    
    // Se a página atual visível for o Dashboard, atualiza os valores na tela em tempo real
    if (document.getElementById('page-dashboard')?.classList.contains('active')) {
      updateDashboard(currentPool);
    }
  }, 30_000);
}

/**
 * ==========================================
 * CONTROLE DE FORMULÁRIOS E EXPOSIÇÃO GLOBAL
 * ==========================================
 * Alterna a visibilidade entre as abas/formulários de Login e Cadastro.
 */
function toggleForm(which) {
  // Se 'which' for igual a 'login', limpa o display para mostrar o formulário; se não, esconde com 'none'
  document.getElementById('form-login').style.display = which === 'login' ? '' : 'none';
  // Se 'which' for igual a 'register', exibe o formulário de cadastro; caso contrário, oculta
  document.getElementById('form-register').style.display = which === 'register' ? '' : 'none';
}

/**
 * =========================================
 * EXPORTAÇÃO PARA O ESCOPO GLOBAL (WINDOW)
 * =========================================
 * Por estarmos utilizando módulos do ES6 (type="module"), as funções deste arquivo
 * ficam isoladas por padrão. Atribuí-las ao 'window' permite que o HTML consiga 
 * executá-las diretamente em eventos de clique (ex: onclick="doLogin()").
 */
window.doLogin = doLogin;
window.toggleForm = toggleForm;