/**
 * ==========================================
 * IMPORTAÇÕES DE MÓDULOS (DEPENDÊNCIAS)
 * ==========================================
 * Trazemos funções de outros arquivos para manter o código organizado 
 * e modular. O main.js atua como o controlador principal do app.
 */

import { initNavbar }             from '../components/navbar/index.js';
// Importa a função que inicializa os comportamentos da barra de navegação (cliques, menu, etc)

import { tickSensorReadings }     from '../services/selecoes.service.js';
// Importa o serviço que simula/busca as leituras contínuas dos sensores da piscina

import {
  renderMainChart, renderClChart,
  renderHistoryTable, renderAlerts,
  initSelecoes, destroyCharts,
} from '../pages/selecoes/index.js';
// Importa as funções responsáveis por atualizar a tela inicial (Dashboard) e o gráfico pequenoimport { updateDashboard, renderMiniChart } from '../pages/home/index.js';

/**
 * ==========================================
 * ESTADO GLOBAL DA APLICAÇÃO
 * ==========================================
 * Variáveis que guardam informações importantes sobre o momento atual do app.
 * Usamos 'let' porque esses valores são alterados durante o uso do sistema.
 */

let currentPool = 0;
// Armazena o índice da piscina selecionada no momento pelo usuário.
// Inicia em 0, que corresponde à primeira opção do select ("Piscina Principal").
let appReady = false;
// Flag de controle de carregamento.
// Começa como 'false' e só vira 'true' quando a interface e os dados iniciais terminam de carregar, evitando que gráficos ou funções rodem antes da hora.

/**
 * ==========================================
 * CONTROLE DE ACESSO E ANIMAÇÕES DE TELA
 * ==========================================
 */
/**
 * Função executada quando o usuário clica em "Entrar".
 * Faz a transição suave entre a tela de login e a interface principal do aplicativo.
 */

function doLogin() {
  const screen = document.getElementById('login-screen');
  screen.style.transition = 'opacity .4s';
  screen.style.opacity    = '0';
  // 1. Aplica o efeito de "fade out" (desaparecer) na tela de login

  setTimeout(() => {
    screen.style.display = 'none';
    // 2. Aguarda 400ms (tempo da animação acima) para trocar as telas
    const app = document.getElementById('app');
    app.classList.add('visible');
    app.style.opacity    = '0';
    app.style.transition = 'opacity .4s';
    // Prepara a tela do app para aparecer (fade in)
    setTimeout(() => (app.style.opacity = '1'), 50);
    // Pequeno atraso (50ms) apenas para o navegador processar a classe antes de animar

    if (!appReady) { bootApp().then(() => { appReady = true; }); } // Se for o primeiro acesso, inicia os dados do sistema e marca como pronto
    else           { updateDashboard(currentPool); renderMiniChart (currentPool); } // Se o usuário apenas deslogou e logou de novo, só atualiza a tela sem recarregar tudo
  }, 400);
  // 3. Inicialização dos dados
}

function doLogout()
/**
 * Função executada quando o usuário clica em "Sair".
 * Esconde o painel do aplicativo e traz a tela de login de volta.
 */
{
  document.getElementById('app').classList.remove('visible');
  // Esconde o app principal
  const ls = document.getElementById('login-screen');
  ls.style.display    = 'flex';
  ls.style.opacity    = '0';
  ls.style.transition = 'opacity .4s';
  setTimeout(() => (ls.style.opacity = '1'), 50);
  // Traz a tela de login de volta com efeito de "fade in"
}

// A PARTIR DAQUI, PRECISO CORRIGIR OS COMENTÁRIOS E AS LINHAS DE COD (kiiro)

/**
 * ==========================================
 * MAPEAMENTO DE AÇÕES DAS PÁGINAS (ROTEAMENTO)
 * ==========================================
 * Este objeto funciona como o "cérebro" da navegação do app. Ele liga o nome 
 * de uma aba (chave) à função que deve ser executada para desenhar a tela (valor).
 */

const PAGE_HANDLERS = {
  // Tela inicial: Atualiza os cards de status geral e renderiza o gráfico pequeno.
  dashboard: () => { updateDashboard(currentPool); renderMiniChart(currentPool); },
  // Tela de gráficos: Desenha os gráficos detalhados de pH e Cloro.
  graficos:  () => { setTimeout(() => { renderMainChart(currentPool); renderClChart(currentPool); }, 100); },
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
 * TROCA DE PISCINA (MUDANÇA DE CONTEXTO)
 * ==========================================
 * Executada quando o usuário escolhe uma piscina diferente no menu superior.
 * Atualiza o estado global e recarrega os dados da tela que estiver aberta.
 */
function switchPool(idx) {
  // 1. Atualiza a variável global com a nova piscina selecionada
  currentPool = idx;
  // 2. Destrói os gráficos antigos do Chart.js para liberar memória
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
  // O 'await' garante que a estrutura HTML exista no DOM antes dos scripts tentarem manipulá-la
  const res  = await fetch('src/pages/selecoes/index.html');
  const html = await res.text();
  document.getElementById('selecoes-pages').innerHTML = html;

  // 2. Conecta a lógica da Navbar passandode funções de callback (ações ao clicar nos botões)
  initNavbar({
    onNavigate:   showPage,   // Função chamada ao clicar nas abas
    onPoolChange: switchPool, // Função chamada ao trocar a piscina no select
    onLogout:     doLogout,   // Função chamada ao clicar em 'Sair'
  });

  initSelecoes(currentPool);
  updateDashboard(currentPool);
  renderMiniChart(currentPool);
  renderHistoryTable(currentPool);
  renderAlerts();

  // Sensor simulation: small drift every 30 s
  setInterval(() => {
    tickSensorReadings();
    if (document.getElementById('page-dashboard')?.classList.contains('active')) {
      updateDashboard(currentPool);
    }
  }, 30_000);
}

// ── Login form wiring ─────────────────────────────────────
function toggleForm(which) {
  document.getElementById('form-login').style.display    = which === 'login'    ? '' : 'none';
  document.getElementById('form-register').style.display = which === 'register' ? '' : 'none';
}

// Expose only what the HTML inline handlers need
window.doLogin    = doLogin;
window.toggleForm = toggleForm;
